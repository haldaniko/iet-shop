from django.contrib import admin
from django.core.exceptions import ValidationError
from django import forms
from django.forms.models import BaseInlineFormSet

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
    Event,
    EventRequest,
    Message,
    Order,
    Project,
    Post,
    Tag,
)


class FixedCardCountInlineFormSet(BaseInlineFormSet):
    exact_count = None

    def clean(self):
        super().clean()
        if self.exact_count is None:
            return

        active_forms = [
            form
            for form in self.forms
            if form.cleaned_data and not form.cleaned_data.get("DELETE", False)
        ]
        if len(active_forms) != self.exact_count:
            raise ValidationError(f"You must provide exactly {self.exact_count} items.")


class AudienceTagCardInlineFormSet(FixedCardCountInlineFormSet):
    exact_count = 4


class OutcomeInlineFormSet(FixedCardCountInlineFormSet):
    exact_count = 6


class CourseAudienceTagCardInline(admin.StackedInline):
    model = CourseAudienceTagCard
    formset = AudienceTagCardInlineFormSet
    extra = 4
    min_num = 4
    max_num = 4
    validate_min = True
    validate_max = True
    fields = ("order", "title_en", "title_bg", "text_en", "text_bg")


class CourseInstrumentInline(admin.StackedInline):
    model = CourseInstrument
    extra = 1
    fields = ("order", "name_en", "name_bg", "icon")


class CourseOutcomeInline(admin.StackedInline):
    model = CourseOutcome
    formset = OutcomeInlineFormSet
    extra = 6
    min_num = 6
    max_num = 6
    validate_min = True
    validate_max = True
    fields = ("order", "text_en", "text_bg")


class CourseModuleInline(admin.StackedInline):
    class CourseModuleInlineForm(forms.ModelForm):
        descriptions_en = forms.CharField(
            required=False,
            widget=forms.Textarea(attrs={"rows": 4}),
            help_text="One line = one description tag for English.",
            label="Descriptions EN",
        )
        descriptions_bg = forms.CharField(
            required=False,
            widget=forms.Textarea(attrs={"rows": 4}),
            help_text="One line = one description tag for Bulgarian.",
            label="Descriptions BG",
        )

        class Meta:
            model = CourseModule
            fields = ("order", "title_en", "title_bg")

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            if self.instance and self.instance.pk:
                rows = list(self.instance.description_rows.all().order_by("order"))
                self.fields["descriptions_en"].initial = "\n".join(
                    row.text_en or "" for row in rows if (row.text_en or "").strip()
                )
                self.fields["descriptions_bg"].initial = "\n".join(
                    row.text_bg or "" for row in rows if (row.text_bg or "").strip()
                )

    class CourseModuleInlineFormSet(BaseInlineFormSet):
        @staticmethod
        def _split_lines(raw_text):
            return [line.strip() for line in (raw_text or "").splitlines() if line.strip()]

        def _save_description_rows(self, module, form):
            en_lines = self._split_lines(form.cleaned_data.get("descriptions_en"))
            bg_lines = self._split_lines(form.cleaned_data.get("descriptions_bg"))
            total = max(len(en_lines), len(bg_lines))

            module.description_rows.all().delete()
            for idx in range(total):
                CourseModuleDescription.objects.create(
                    module=module,
                    order=idx + 1,
                    text_en=en_lines[idx] if idx < len(en_lines) else None,
                    text_bg=bg_lines[idx] if idx < len(bg_lines) else None,
                )

        def save_new(self, form, commit=True):
            module = super().save_new(form, commit=commit)
            if commit and module.pk:
                self._save_description_rows(module, form)
            return module

        def save_existing(self, form, instance, commit=True):
            module = super().save_existing(form, instance, commit=commit)
            if commit and module.pk:
                self._save_description_rows(module, form)
            return module

    model = CourseModule
    form = CourseModuleInlineForm
    formset = CourseModuleInlineFormSet
    extra = 1
    fields = ("order", "title_en", "title_bg", "descriptions_en", "descriptions_bg")


class CourseModuleDescriptionInline(admin.StackedInline):
    model = CourseModuleDescription
    extra = 1
    fields = ("order", "text_en", "text_bg")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name_en", "name_bg")
    search_fields = ("name_en", "name_bg")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title_en", "title_bg", "slug", "type", "price", "is_active", "start")
    list_filter = ("type", "is_active", "start", "audience")
    search_fields = ("title_en", "title_bg", "slug")
    filter_horizontal = ("tags",)
    inlines = [
        CourseAudienceTagCardInline,
        CourseInstrumentInline,
        CourseOutcomeInline,
        CourseModuleInline,
    ]
    fieldsets = (
        (
            "Main",
            {
                "fields": (
                    "slug",
                    "type",
                    "audience",
                    "start",
                    "price",
                    "monthly_installment_price",
                    "visits_per_week",
                    "is_active",
                    "tags",
                )
            },
        ),
        (
            "Title and Description",
            {
                "fields": (
                    "title_en",
                    "title_bg",
                    "description_en",
                    "description_bg",
                    "duration_en",
                    "duration_bg",
                    "image",
                )
            },
        ),
        (
            "About Section",
            {
                "fields": (
                    "about_title_en",
                    "about_title_bg",
                    "about_description_top_en",
                    "about_description_top_bg",
                    "about_description_bottom_en",
                    "about_description_bottom_bg",
                    "about_image",
                    "audience_image",
                )
            },
        ),
        (
            "Payments",
            {
                "fields": ("stripe_product_id",)
            },
        ),
    )


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ("course", "order", "title_en", "title_bg")
    list_filter = ("course",)
    search_fields = ("course__title_en", "course__title_bg", "title_en", "title_bg")
    inlines = [CourseModuleDescriptionInline]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "total_amount", "created_at", "paid_at")
    list_filter = ("status", "created_at")
    search_fields = ("id",)
    readonly_fields = (
        "status",
        "total_amount",
        "stripe_payment_intent_id",
        "stripe_checkout_session_id",
        "created_at",
        "paid_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff


@admin.register(AfterSalesServiceCase)
class AfterSalesServiceCaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "subject",
        "customer_name",
        "status",
        "priority",
        "assigned_to",
        "follow_up_at",
        "updated_at",
    )
    list_filter = ("status", "priority", "created_at", "updated_at")
    search_fields = ("subject", "customer_name", "customer_email", "customer_phone", "description")
    autocomplete_fields = ()
    readonly_fields = ("created_at", "updated_at")
    fields = (
        "order",
        "customer_name",
        "customer_email",
        "customer_phone",
        "subject",
        "description",
        "resolution",
        "status",
        "priority",
        "assigned_to",
        "follow_up_at",
        "created_at",
        "updated_at",
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title_en", "title_bg", "date", "type")
    list_filter = ("type", "date")
    search_fields = ("title_en", "title_bg")
    fields = ("title_en", "title_bg", "description_en", "description_bg", "image", "image_2", "date", "type", "tags")
    filter_horizontal = ("tags",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title_en", "title_bg", "slug", "author", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title_en", "title_bg", "author")
    filter_horizontal = ("tags",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title_en", "title_bg", "slug", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("title_en", "title_bg", "slug")
    readonly_fields = ("created_at",)
    fieldsets = (
        (
            "Main",
            {
                "fields": (
                    "slug",
                    "is_active",
                    "created_at",
                )
            },
        ),
        (
            "Content",
            {
                "fields": (
                    "title_en",
                    "title_bg",
                    "excerpt_en",
                    "excerpt_bg",
                    "cover_image",
                    "content_en",
                    "content_bg",
                )
            },
        ),
    )


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "interested", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "phone")
    readonly_fields = ("name", "email", "phone", "interested", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff


@admin.register(EventRequest)
class EventRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "interested", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "phone")
    readonly_fields = ("name", "email", "phone", "interested", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'session_key', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('session_key',)
    readonly_fields = ('id', 'session_key', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat_session', 'sender_type', 'created_at')
    list_filter = ('sender_type', 'created_at')
    search_fields = ('text', 'chat_session__session_key')
    autocomplete_fields = ('chat_session',)
    readonly_fields = ('created_at',)
    fields = ('chat_session', 'sender_type', 'text', 'created_at')
