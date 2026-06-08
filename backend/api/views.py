import logging
import uuid

import stripe
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpResponse
from django.db.models import Exists, OuterRef
from django.core.files.storage import default_storage
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import Throttled, ValidationError
from rest_framework.views import APIView

from .authentication import SessionCSRFAuthentication
from .chat_services import (
    ChatRateLimitExceeded,
    create_user_message_with_optional_bot_reply,
    get_or_create_chat_session,
)
from .models import (
    ChatSession,
    Consultation,
    Course,
    CourseAudienceTagCard,
    CourseInstrument,
    CourseModule,
    CourseModuleDescription,
    CourseOutcome,
    Event,
    EventRequest,
    Message,
    Order,
    Project,
    Post,
    Tag,
)
from .serializers import (
    AdminChatSessionSerializer,
    AdminConsultationSerializer,
    AdminCourseAudienceTagCardSerializer,
    AdminCourseInstrumentSerializer,
    AdminCourseModuleDescriptionSerializer,
    AdminCourseModuleSerializer,
    AdminCourseOutcomeSerializer,
    AdminCourseSerializer,
    AdminEventRequestSerializer,
    AdminEventSerializer,
    AdminMessageSerializer,
    AdminOrderSerializer,
    AdminProjectSerializer,
    AdminPostSerializer,
    AdminTagSerializer,
    AdminUserSerializer,
    ChatMessageCreateSerializer,
    ChatMessageSerializer,
    ChatSessionSerializer,
    ConsultationSerializer,
    CourseSerializer,
    CreateCheckoutSessionSerializer,
    EventSerializer,
    EventRequestSerializer,
    PostSerializer,
    ProjectSerializer,
    TagSerializer,
)
from .stripe_services import create_checkout_session, resolve_course_by_slug


logger = logging.getLogger(__name__)


def _send_checkout_confirmation_email(session_obj: dict, amount_total_eur: int) -> None:
    customer_details = session_obj.get("customer_details") or {}
    recipient_email = str(customer_details.get("email") or session_obj.get("customer_email") or "").strip()
    if not recipient_email:
        return

    metadata = session_obj.get("metadata") or {}
    course_label = str(metadata.get("course_slug") or metadata.get("course_id") or "course").strip()
    currency = str(session_obj.get("currency") or "eur").upper()
    checkout_session_id = str(session_obj.get("id") or "").strip()

    subject = "Payment confirmation"
    message = (
        f"Your payment was successful.\n\n"
        f"Course: {course_label}\n"
        f"Amount: {amount_total_eur} {currency}\n"
        f"Checkout session: {checkout_session_id}\n\n"
        f"Thank you for your purchase."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False,
    )


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class TestView(APIView):
    def get(self, request):
        return Response({"status": "ok"})


class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not settings.STRIPE_SECRET_KEY:
            return Response(
                {"detail": "Missing STRIPE_SECRET_KEY in backend environment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            course = resolve_course_by_slug(serializer.validated_data["product_slug"])
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found or inactive."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            checkout_session = create_checkout_session(
                course,
                request,
                customer_email=serializer.validated_data.get("customer_email"),
            )
        except stripe.error.StripeError as exc:
            logger.exception("Stripe checkout session creation failed for course slug=%s", course.slug)
            return Response(
                {"detail": str(getattr(exc, "user_message", "Stripe request failed."))},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"sessionId": checkout_session.id}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        if not settings.STRIPE_SECRET_KEY:
            logger.warning("Stripe webhook called without STRIPE_SECRET_KEY configured.")
            return HttpResponse(status=500)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            if webhook_secret:
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            else:
                event = stripe.Event.construct_from(request.data, stripe.api_key)
        except ValueError:
            logger.warning("Invalid Stripe webhook payload.")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logger.warning("Invalid Stripe webhook signature.")
            return HttpResponse(status=400)

        if event.get("type") == "checkout.session.completed":
            session_obj = event["data"]["object"]

            checkout_session_id = str(session_obj.get("id") or "").strip()
            payment_intent = session_obj.get("payment_intent")
            payment_intent_id = str(payment_intent or "").strip() or None
            amount_total_minor = int(session_obj.get("amount_total") or 0)
            amount_total = amount_total_minor // 100
            is_paid = str(session_obj.get("payment_status") or "").lower() == "paid"

            if checkout_session_id:
                defaults = {
                    "status": is_paid,
                    "total_amount": amount_total,
                    "stripe_payment_intent_id": payment_intent_id,
                    "paid_at": timezone.now() if is_paid else None,
                }
                Order.objects.update_or_create(
                    stripe_checkout_session_id=checkout_session_id,
                    defaults=defaults,
                )

            if is_paid:
                try:
                    _send_checkout_confirmation_email(session_obj, amount_total)
                except Exception:
                    logger.exception(
                        "Failed to send payment confirmation email for checkout session %s",
                        checkout_session_id,
                    )

            logger.info(
                "Stripe payment completed: session_id=%s payment_status=%s amount_total=%s currency=%s",
                session_obj.get("id"),
                session_obj.get("payment_status"),
                session_obj.get("amount_total"),
                session_obj.get("currency"),
            )

        return HttpResponse(status=200)


class ChatInitView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        chat_session = get_or_create_chat_session(request)
        get_token(request)
        serializer = ChatSessionSerializer(chat_session)
        return Response(serializer.data)


class ChatMessagesView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionCSRFAuthentication]

    def get(self, request):
        chat_session = get_or_create_chat_session(request)
        get_token(request)
        serializer = ChatMessageSerializer(chat_session.messages.all(), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chat_session = get_or_create_chat_session(request)

        try:
            message, _ = create_user_message_with_optional_bot_reply(
                chat_session=chat_session,
                text=serializer.validated_data['text'],
            )
        except ChatRateLimitExceeded as exc:
            raise Throttled(wait=exc.wait_seconds, detail=exc.detail) from exc
        except DjangoValidationError as exc:
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            raise ValidationError(detail) from exc

        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class AdminCSRFView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


@method_decorator(csrf_protect, name='dispatch')
class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'User account is inactive.'}, status=status.HTTP_403_FORBIDDEN)
        if not user.is_superuser:
            return Response(
                {'detail': 'Only superusers can access the admin panel.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        get_token(request)
        return Response({'user': AdminUserSerializer(user).data})


class AdminLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMeView(APIView):
    permission_classes = [IsSuperUser]

    def get(self, request):
        return Response({'user': AdminUserSerializer(request.user).data})


class AdminDashboardStatsView(APIView):
    permission_classes = [IsSuperUser]

    def get(self, request):
        return Response(
            {
                'tags': Tag.objects.count(),
                'courses': Course.objects.count(),
                'events': Event.objects.count(),
                'posts': Post.objects.count(),
                'projects': Project.objects.count(),
                'consultations': Consultation.objects.count(),
                'event_requests': EventRequest.objects.count(),
                'orders': Order.objects.count(),
                'chat_sessions': ChatSession.objects.count(),
                'messages': Message.objects.count(),
            }
        )


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().prefetch_related(
        "tags",
        "audience_tag_cards",
        "instrument_cards",
        "outcome_cards",
        "module_cards__description_rows",
    )
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().prefetch_related("tags")
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().prefetch_related("tags")
    serializer_class = PostSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.method in permissions.SAFE_METHODS:
            queryset = queryset.filter(is_active=True)
        return queryset


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_authenticators(self):
        # Public form submission should not depend on SessionAuth/CSRF.
        if self.request.method in ("POST", "OPTIONS"):
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == "OPTIONS":
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class EventRequestViewSet(viewsets.ModelViewSet):
    queryset = EventRequest.objects.all()
    serializer_class = EventRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_authenticators(self):
        # Public form submission should not depend on SessionAuth/CSRF.
        if self.request.method in ("POST", "OPTIONS"):
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == "OPTIONS":
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class AdminTagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('id')
    serializer_class = AdminTagSerializer
    permission_classes = [IsSuperUser]


class AdminCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().prefetch_related('tags').order_by('id')
    serializer_class = AdminCourseSerializer
    permission_classes = [IsSuperUser]


class AdminEventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().prefetch_related('tags').order_by('id')
    serializer_class = AdminEventSerializer
    permission_classes = [IsSuperUser]


class AdminPostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().prefetch_related('tags').order_by('id')
    serializer_class = AdminPostSerializer
    permission_classes = [IsSuperUser]


class AdminProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('id')
    serializer_class = AdminProjectSerializer
    permission_classes = [IsSuperUser]


class AdminProjectImageUploadView(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response(
                {'detail': 'Image file is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        extension = image.name.rsplit('.', 1)[-1].lower() if '.' in image.name else 'bin'
        file_name = f"projects/content/{uuid.uuid4().hex}.{extension}"
        saved_path = default_storage.save(file_name, image)
        file_url = default_storage.url(saved_path)

        return Response(
            {'url': request.build_absolute_uri(file_url)},
            status=status.HTTP_201_CREATED,
        )


class AdminConsultationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Consultation.objects.all().order_by('-created_at', '-id')
    serializer_class = AdminConsultationSerializer
    permission_classes = [IsSuperUser]


class AdminEventRequestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventRequest.objects.all().order_by('-created_at', '-id')
    serializer_class = AdminEventRequestSerializer
    permission_classes = [IsSuperUser]


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.all().order_by('-id')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsSuperUser]


class AdminCourseAudienceTagCardViewSet(viewsets.ModelViewSet):
    queryset = CourseAudienceTagCard.objects.all().select_related('course').order_by('course_id', 'order', 'id')
    serializer_class = AdminCourseAudienceTagCardSerializer
    permission_classes = [IsSuperUser]


class AdminCourseInstrumentViewSet(viewsets.ModelViewSet):
    queryset = CourseInstrument.objects.all().select_related('course').order_by('course_id', 'order', 'id')
    serializer_class = AdminCourseInstrumentSerializer
    permission_classes = [IsSuperUser]


class AdminCourseOutcomeViewSet(viewsets.ModelViewSet):
    queryset = CourseOutcome.objects.all().select_related('course').order_by('course_id', 'order', 'id')
    serializer_class = AdminCourseOutcomeSerializer
    permission_classes = [IsSuperUser]


class AdminCourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all().select_related('course').order_by('course_id', 'order', 'id')
    serializer_class = AdminCourseModuleSerializer
    permission_classes = [IsSuperUser]


class AdminCourseModuleDescriptionViewSet(viewsets.ModelViewSet):
    queryset = CourseModuleDescription.objects.all().select_related('module').order_by('module_id', 'order', 'id')
    serializer_class = AdminCourseModuleDescriptionSerializer
    permission_classes = [IsSuperUser]


class AdminChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all().order_by('-updated_at', '-created_at')
    serializer_class = AdminChatSessionSerializer
    permission_classes = [IsSuperUser]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = super().get_queryset()
        user_message_exists = Message.objects.filter(
            chat_session_id=OuterRef('pk'),
            sender_type=Message.SenderType.USER,
        )
        queryset = queryset.annotate(has_user_message=Exists(user_message_exists)).filter(has_user_message=True)
        is_active = self.request.query_params.get('is_active')
        if is_active is None:
            return queryset
        normalized = str(is_active).strip().lower()
        if normalized in {'true', '1', 'yes'}:
            return queryset.filter(is_active=True)
        if normalized in {'false', '0', 'no'}:
            return queryset.filter(is_active=False)
        return queryset


class AdminMessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.select_related('chat_session').all().order_by('created_at', 'id')
    serializer_class = AdminMessageSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        chat_session_id = self.request.query_params.get('chat_session')
        sender_type = self.request.query_params.get('sender_type')

        if chat_session_id:
            queryset = queryset.filter(chat_session_id=chat_session_id)
        if sender_type:
            queryset = queryset.filter(sender_type=sender_type)
        return queryset
