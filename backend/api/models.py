import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Tag(models.Model):
    name_en = models.CharField(max_length=100, null=True, blank=True)
    name_bg = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name_en or self.name_bg or f"Tag #{self.pk}"


class Course(models.Model):
    class CourseType(models.TextChoices):
        HYBRID = "hybrid", "Hybrid"
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"

    class AudienceType(models.TextChoices):
        ADULTS = "adults", "Adults"
        KIDS = "kids", "Kids"

    slug = models.SlugField(max_length=255, unique=True)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)
    start = models.DateField()
    image = models.ImageField(upload_to="courses/", null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    description_bg = models.TextField(null=True, blank=True)
    duration_en = models.CharField(max_length=100, null=True, blank=True)
    duration_bg = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=10, choices=CourseType.choices)
    audience = models.CharField(max_length=10, choices=AudienceType.choices, null=True, blank=True)
    price = models.PositiveIntegerField()
    monthly_installment_price = models.PositiveIntegerField(null=True, blank=True)
    visits_per_week = models.PositiveSmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    stripe_product_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_price_id = models.CharField(max_length=255, null=True, blank=True)
    tags = models.ManyToManyField(Tag, related_name="courses", blank=True)
    about_title_en = models.CharField(max_length=255, null=True, blank=True)
    about_title_bg = models.CharField(max_length=255, null=True, blank=True)
    about_description_top_en = models.TextField(null=True, blank=True)
    about_description_top_bg = models.TextField(null=True, blank=True)
    about_description_bottom_en = models.TextField(null=True, blank=True)
    about_description_bottom_bg = models.TextField(null=True, blank=True)
    about_image = models.ImageField(upload_to="courses/about/", null=True, blank=True)
    audience_image = models.ImageField(upload_to="courses/audience/", null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_en or self.title_bg or f"Course #{self.pk}"


class Order(models.Model):
    status = models.BooleanField(default=False)
    total_amount = models.PositiveIntegerField()
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_checkout_session_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Order #{self.pk}"


class AfterSalesServiceCase(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Нова"
        IN_PROGRESS = "in_progress", "В работа"
        WAITING_CUSTOMER = "waiting_customer", "Изчаква клиент"
        RESOLVED = "resolved", "Решена"
        CLOSED = "closed", "Затворена"

    class Priority(models.TextChoices):
        LOW = "low", "Нисък"
        NORMAL = "normal", "Нормален"
        HIGH = "high", "Висок"
        URGENT = "urgent", "Спешен"

    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="after_sales_cases",
    )
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(null=True, blank=True)
    customer_phone = models.CharField(max_length=30, null=True, blank=True)
    subject = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    resolution = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    assigned_to = models.CharField(max_length=255, null=True, blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at", "-id"]
        verbose_name = "следпродажбен казус"
        verbose_name_plural = "следпродажбено обслужване"

    def __str__(self):
        return self.subject or f"Следпродажбен казус #{self.pk}"


class Event(models.Model):
    class EventType(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        HYBRID = "hybrid", "Hybrid"

    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(upload_to="events/", null=True, blank=True)
    image_2 = models.ImageField(upload_to="events/", null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    description_bg = models.TextField(null=True, blank=True)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=EventType.choices)
    tags = models.ManyToManyField(Tag, related_name="events", blank=True)

    def __str__(self):
        return self.title_en or self.title_bg or f"Event #{self.pk}"


class Post(models.Model):
    slug = models.SlugField(max_length=255, unique=True)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)
    author = models.CharField(max_length=255)
    content_en = models.TextField(null=True, blank=True)
    content_bg = models.TextField(null=True, blank=True)
    picture = models.ImageField(upload_to="posts/", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    tags = models.ManyToManyField(Tag, related_name="posts", blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_en or self.title_bg or f"Post #{self.pk}"


class Project(models.Model):
    slug = models.SlugField(max_length=255, unique=True)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)
    excerpt_en = models.TextField(null=True, blank=True)
    excerpt_bg = models.TextField(null=True, blank=True)
    cover_image = models.ImageField(upload_to="projects/covers/", null=True, blank=True)
    content_en = models.JSONField(default=dict, blank=True)
    content_bg = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.title_en or self.title_bg or f"Project #{self.pk}"


class Consultation(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    interested = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="consultations",
    )

    def __str__(self):
        return self.name


class EventRequest(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    interested = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="event_requests",
    )

    def __str__(self):
        return self.name


class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_key = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']

    def __str__(self):
        return f'Chat {self.session_key}'


class Message(models.Model):
    class SenderType(models.TextChoices):
        USER = 'user', 'User'
        OPERATOR = 'operator', 'Operator'
        BOT = 'bot', 'Bot'

    chat_session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    text = models.TextField()
    sender_type = models.CharField(max_length=10, choices=SenderType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def clean(self):
        self.text = (self.text or '').strip()
        if not self.text:
            raise ValidationError({'text': 'Message text cannot be empty.'})
        if len(self.text) > settings.CHAT_MESSAGE_MAX_LENGTH:
            raise ValidationError(
                {'text': f'Message text cannot exceed {settings.CHAT_MESSAGE_MAX_LENGTH} characters.'}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.sender_type}: {self.text[:40]}'


class CourseAudienceTagCard(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="audience_tag_cards",
    )
    order = models.PositiveSmallIntegerField(default=1)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)
    text_en = models.TextField(null=True, blank=True)
    text_bg = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title_en or self.title_bg or f"Audience card #{self.pk}"


class CourseInstrument(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="instrument_cards",
    )
    order = models.PositiveSmallIntegerField(default=1)
    name_en = models.CharField(max_length=255, null=True, blank=True)
    name_bg = models.CharField(max_length=255, null=True, blank=True)
    icon = models.ImageField(upload_to="courses/instruments/", null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name_en or self.name_bg or f"Instrument #{self.pk}"


class CourseOutcome(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="outcome_cards",
    )
    order = models.PositiveSmallIntegerField(default=1)
    text_en = models.TextField(null=True, blank=True)
    text_bg = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.text_en or self.text_bg or f"Outcome #{self.pk}"


class CourseModule(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="module_cards",
    )
    order = models.PositiveSmallIntegerField(default=1)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    title_bg = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title_en or self.title_bg or f"Module #{self.pk}"


class CourseModuleDescription(models.Model):
    module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="description_rows",
    )
    order = models.PositiveSmallIntegerField(default=1)
    text_en = models.CharField(max_length=255, null=True, blank=True)
    text_bg = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.text_en or self.text_bg or f"Module tag #{self.pk}"
