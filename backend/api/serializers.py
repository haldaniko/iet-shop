from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .chat_services import create_message
from .models import (
    AfterSalesServiceCase,
    ChatSession,
    Consultation,
    Course,
    CourseAudienceTagCard,
    CourseInstrument,
    CourseModule,
    CourseModuleDescription,
    CourseOutcome,
    EventRequest,
    Event,
    Message,
    Order,
    Project,
    Post,
    Tag,
)


User = get_user_model()


class BilingualSerializerMixin:
    def _file_url(self, file_field):
        if not file_field:
            return None

        # Avoid returning broken media links when DB path exists but file is missing.
        file_name = getattr(file_field, "name", "")
        storage = getattr(file_field, "storage", None)
        if not file_name or (storage is not None and not storage.exists(file_name)):
            return None

        # Return relative media paths so frontend can resolve host consistently
        # in both local and Docker environments.
        return file_field.url

    @staticmethod
    def _bilingual(en_value, bg_value):
        return {
            "en": en_value,
            "bg": bg_value,
        }


class CreateCheckoutSessionSerializer(serializers.Serializer):
    product_slug = serializers.SlugField(max_length=255)
    customer_email = serializers.EmailField(required=False)


class TagSerializer(BilingualSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ["id", "name", "name_en", "name_bg"]

    def get_name(self, obj):
        return self._bilingual(obj.name_en, obj.name_bg)


class CourseSerializer(BilingualSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    about_title = serializers.SerializerMethodField()
    about_description_top = serializers.SerializerMethodField()
    about_description_bottom = serializers.SerializerMethodField()
    about_image = serializers.SerializerMethodField()
    audience_image = serializers.SerializerMethodField()
    audience_tags = serializers.SerializerMethodField()
    instruments = serializers.SerializerMethodField()
    outcomes = serializers.SerializerMethodField()
    modules = serializers.SerializerMethodField()

    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags"
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "slug",
            "title",
            "start",
            "image",
            "description",
            "duration",
            "type",
            "price",
            "monthly_installment_price",
            "visits_per_week",
            "is_active",
            "stripe_product_id",
            "tags",
            "tag_ids",
            "audience",
            "about_title",
            "about_description_top",
            "about_description_bottom",
            "about_image",
            "audience_image",
            "audience_tags",
            "instruments",
            "outcomes",
            "modules",
            "title_en",
            "title_bg",
            "description_en",
            "description_bg",
            "duration_en",
            "duration_bg",
            "about_title_en",
            "about_title_bg",
            "about_description_top_en",
            "about_description_top_bg",
            "about_description_bottom_en",
            "about_description_bottom_bg",
        ]

    def get_title(self, obj):
        return self._bilingual(obj.title_en, obj.title_bg)

    def get_image(self, obj):
        return self._file_url(obj.image)

    def get_description(self, obj):
        return self._bilingual(obj.description_en, obj.description_bg)

    def get_duration(self, obj):
        return self._bilingual(obj.duration_en, obj.duration_bg)

    def get_about_title(self, obj):
        return self._bilingual(obj.about_title_en, obj.about_title_bg)

    def get_about_description_top(self, obj):
        return self._bilingual(obj.about_description_top_en, obj.about_description_top_bg)

    def get_about_description_bottom(self, obj):
        return self._bilingual(obj.about_description_bottom_en, obj.about_description_bottom_bg)

    def get_about_image(self, obj):
        return self._file_url(obj.about_image)

    def get_audience_image(self, obj):
        return self._file_url(obj.audience_image)

    def get_audience_tags(self, obj):
        return [
            {
                "title": self._bilingual(card.title_en, card.title_bg),
                "text": self._bilingual(card.text_en, card.text_bg),
            }
            for card in obj.audience_tag_cards.all()
        ]

    def get_instruments(self, obj):
        return [
            {
                "name": self._bilingual(item.name_en, item.name_bg),
                "icon": self._file_url(item.icon),
            }
            for item in obj.instrument_cards.all()
        ]

    def get_outcomes(self, obj):
        return [
            self._bilingual(item.text_en, item.text_bg)
            for item in obj.outcome_cards.all()
        ]

    def get_modules(self, obj):
        return [
            {
                "title": self._bilingual(module.title_en, module.title_bg),
                "description": [
                    self._bilingual(row.text_en, row.text_bg)
                    for row in module.description_rows.all()
                ],
            }
            for module in obj.module_cards.all()
        ]


class EventSerializer(BilingualSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    image_1 = serializers.SerializerMethodField()
    image_2 = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags"
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "image",
            "image_1",
            "image_2",
            "date",
            "type",
            "tags",
            "tag_ids",
            "title_en",
            "title_bg",
            "description_en",
            "description_bg",
        ]

    def get_title(self, obj):
        return self._bilingual(obj.title_en, obj.title_bg)

    def get_description(self, obj):
        return self._bilingual(obj.description_en, obj.description_bg)

    def get_image(self, obj):
        return self._file_url(obj.image)

    def get_image_1(self, obj):
        return self._file_url(obj.image)

    def get_image_2(self, obj):
        return self._file_url(obj.image_2)


class PostSerializer(BilingualSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    picture = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags"
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "slug",
            "title",
            "author",
            "content",
            "picture",
            "created_at",
            "tags",
            "tag_ids",
            "title_en",
            "title_bg",
            "content_en",
            "content_bg",
        ]

    def get_title(self, obj):
        return self._bilingual(obj.title_en, obj.title_bg)

    def get_content(self, obj):
        return self._bilingual(obj.content_en, obj.content_bg)

    def get_picture(self, obj):
        return self._file_url(obj.picture)


class ProjectSerializer(BilingualSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title",
            "excerpt",
            "content",
            "cover_image",
            "is_active",
            "created_at",
            "title_en",
            "title_bg",
            "excerpt_en",
            "excerpt_bg",
            "content_en",
            "content_bg",
        ]

    def get_title(self, obj):
        return self._bilingual(obj.title_en, obj.title_bg)

    def get_excerpt(self, obj):
        return self._bilingual(obj.excerpt_en, obj.excerpt_bg)

    def get_content(self, obj):
        return self._bilingual(obj.content_en, obj.content_bg)

    def get_cover_image(self, obj):
        return self._file_url(obj.cover_image)


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = "__all__"


class EventRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRequest
        fields = "__all__"


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'text', 'sender_type', 'created_at']
        read_only_fields = fields


class ChatMessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField(trim_whitespace=True)

    def validate_text(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError('Message text cannot be empty.')
        if len(cleaned) > settings.CHAT_MESSAGE_MAX_LENGTH:
            raise serializers.ValidationError(
                f'Message text cannot exceed {settings.CHAT_MESSAGE_MAX_LENGTH} characters.'
            )
        return cleaned


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'messages']
        read_only_fields = fields


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'is_active',
            'last_login',
        ]
        read_only_fields = fields


class AdminTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name_en', 'name_bg']


class AdminCourseSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source='tags'
    )
    stripe_product_id = serializers.CharField(required=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'slug',
            'title_en',
            'title_bg',
            'start',
            'image',
            'description_en',
            'description_bg',
            'duration_en',
            'duration_bg',
            'type',
            'audience',
            'price',
            'monthly_installment_price',
            'visits_per_week',
            'is_active',
            'stripe_product_id',
            'about_title_en',
            'about_title_bg',
            'about_description_top_en',
            'about_description_top_bg',
            'about_description_bottom_en',
            'about_description_bottom_bg',
            'about_image',
            'audience_image',
            'tags',
            'tag_ids',
        ]


class AdminEventSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source='tags'
    )

    class Meta:
        model = Event
        fields = [
            'id',
            'title_en',
            'title_bg',
            'image',
            'image_2',
            'description_en',
            'description_bg',
            'date',
            'type',
            'tags',
            'tag_ids',
        ]


class AdminPostSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source='tags'
    )

    class Meta:
        model = Post
        fields = [
            'id',
            'slug',
            'title_en',
            'title_bg',
            'author',
            'content_en',
            'content_bg',
            'picture',
            'created_at',
            'tags',
            'tag_ids',
        ]
        read_only_fields = []


class AdminProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title_en",
            "title_bg",
            "excerpt_en",
            "excerpt_bg",
            "content_en",
            "content_bg",
            "cover_image",
            "is_active",
            "created_at",
        ]
        read_only_fields = []


class AdminConsultationSerializer(serializers.ModelSerializer):
    interested = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = ['id', 'name', 'email', 'phone', 'interested', 'created_at']

    def get_interested(self, obj):
        if not obj.interested:
            return None
        title_en = (obj.interested.title_en or '').strip()
        title_bg = (obj.interested.title_bg or '').strip()
        if title_en:
            return title_en
        if title_bg:
            return title_bg
        if obj.interested.slug:
            return obj.interested.slug
        return 'Untitled course'


class AdminEventRequestSerializer(serializers.ModelSerializer):
    interested = serializers.SerializerMethodField()

    class Meta:
        model = EventRequest
        fields = ['id', 'name', 'email', 'phone', 'interested', 'created_at']

    def get_interested(self, obj):
        if not obj.interested:
            return None
        title_en = (obj.interested.title_en or '').strip()
        title_bg = (obj.interested.title_bg or '').strip()
        if title_en:
            return title_en
        if title_bg:
            return title_bg
        return 'Untitled event'


class AdminOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class AdminAfterSalesServiceCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AfterSalesServiceCase
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AdminCourseAudienceTagCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAudienceTagCard
        fields = '__all__'


class AdminCourseInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseInstrument
        fields = '__all__'


class AdminCourseOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseOutcome
        fields = '__all__'


class AdminCourseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = '__all__'


class AdminCourseModuleDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModuleDescription
        fields = '__all__'


class AdminChatSessionSerializer(serializers.ModelSerializer):
    messages_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id',
            'session_key',
            'is_active',
            'created_at',
            'updated_at',
            'messages_count',
            'last_message',
        ]
        read_only_fields = [
            'id',
            'session_key',
            'created_at',
            'updated_at',
            'messages_count',
            'last_message',
        ]

    def get_messages_count(self, obj):
        prefetched_count = getattr(obj, 'messages_count', None)
        if prefetched_count is not None:
            return prefetched_count
        return obj.messages.count()

    def get_last_message(self, obj):
        last_message = getattr(obj, 'last_message_obj', None)
        if last_message is None:
            last_message = obj.messages.order_by('-created_at', '-id').first()
        if not last_message:
            return None
        return ChatMessageSerializer(last_message, context=self.context).data


class AdminMessageSerializer(serializers.ModelSerializer):
    sender_type = serializers.ChoiceField(
        choices=Message.SenderType.choices,
        default=Message.SenderType.OPERATOR,
    )

    class Meta:
        model = Message
        fields = ['id', 'chat_session', 'text', 'sender_type', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        sender_type = validated_data.get('sender_type', Message.SenderType.OPERATOR)
        return create_message(
            chat_session=validated_data['chat_session'],
            text=validated_data['text'],
            sender_type=sender_type,
        )
