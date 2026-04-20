from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminChatSessionViewSet,
    AdminConsultationViewSet,
    AdminCourseAudienceTagCardViewSet,
    AdminCourseInstrumentViewSet,
    AdminCourseModuleDescriptionViewSet,
    AdminCourseModuleViewSet,
    AdminCourseOutcomeViewSet,
    AdminCourseViewSet,
    AdminCSRFView,
    AdminDashboardStatsView,
    AdminEventRequestViewSet,
    AdminEventViewSet,
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    AdminMessageViewSet,
    AdminOrderViewSet,
    AdminProjectImageUploadView,
    AdminProjectViewSet,
    AdminPostViewSet,
    AdminTagViewSet,
    ChatInitView,
    ChatMessagesView,
    ConsultationViewSet,
    CourseViewSet,
    CreateCheckoutSessionView,
    EventViewSet,
    EventRequestViewSet,
    PostViewSet,
    ProjectViewSet,
    StripeWebhookView,
    TagViewSet,
    TestView,
)


router = DefaultRouter()
router.register("tags", TagViewSet, basename="tag")
router.register("courses", CourseViewSet, basename="course")
router.register("events", EventViewSet, basename="event")
router.register("posts", PostViewSet, basename="post")
router.register("projects", ProjectViewSet, basename="project")
router.register("consultations", ConsultationViewSet, basename="consultation")
router.register("event-requests", EventRequestViewSet, basename="event-request")

admin_router = DefaultRouter()
admin_router.register('tags', AdminTagViewSet, basename='admin-tag')
admin_router.register('courses', AdminCourseViewSet, basename='admin-course')
admin_router.register('events', AdminEventViewSet, basename='admin-event')
admin_router.register('posts', AdminPostViewSet, basename='admin-post')
admin_router.register('projects', AdminProjectViewSet, basename='admin-project')
admin_router.register('consultations', AdminConsultationViewSet, basename='admin-consultation')
admin_router.register('event-requests', AdminEventRequestViewSet, basename='admin-event-request')
admin_router.register('orders', AdminOrderViewSet, basename='admin-order')
admin_router.register('course-audience-tag-cards', AdminCourseAudienceTagCardViewSet, basename='admin-course-audience-tag-card')
admin_router.register('course-instruments', AdminCourseInstrumentViewSet, basename='admin-course-instrument')
admin_router.register('course-outcomes', AdminCourseOutcomeViewSet, basename='admin-course-outcome')
admin_router.register('course-modules', AdminCourseModuleViewSet, basename='admin-course-module')
admin_router.register(
    'course-module-descriptions',
    AdminCourseModuleDescriptionViewSet,
    basename='admin-course-module-description',
)
admin_router.register('chat-sessions', AdminChatSessionViewSet, basename='admin-chat-session')
admin_router.register('messages', AdminMessageViewSet, basename='admin-message')


urlpatterns = [
    path('test/', TestView.as_view()),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('chat/init/', ChatInitView.as_view(), name='chat-init'),
    path('chat/messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('admin/auth/csrf/', AdminCSRFView.as_view(), name='admin-auth-csrf'),
    path('admin/auth/login/', AdminLoginView.as_view(), name='admin-auth-login'),
    path('admin/auth/logout/', AdminLogoutView.as_view(), name='admin-auth-logout'),
    path('admin/auth/me/', AdminMeView.as_view(), name='admin-auth-me'),
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/projects/upload-image/', AdminProjectImageUploadView.as_view(), name='admin-project-image-upload'),
    path('admin/', include(admin_router.urls)),
]

urlpatterns += router.urls
