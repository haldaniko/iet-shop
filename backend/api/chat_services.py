import re
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from .chat_ai import generate_chatbot_reply
from .models import ChatSession, Message


ADMIN_CHAT_GROUP_NAME = 'admin_chat_watchers'


class ChatRateLimitExceeded(Exception):
    def __init__(self, detail, wait_seconds):
        super().__init__(detail)
        self.detail = detail
        self.wait_seconds = wait_seconds


def get_chat_group_name(session_key):
    sanitized_key = re.sub(r'[^a-zA-Z0-9_.-]', '_', session_key)
    return f'chat_{sanitized_key}'[:100]


def get_admin_chat_group_name():
    return ADMIN_CHAT_GROUP_NAME


def ensure_session_key(request):
    if request.session.session_key:
        return request.session.session_key

    # Anonymous visitors receive a durable Django session on the first chat touch.
    request.session.create()
    return request.session.session_key


def get_or_create_chat_session(request):
    session_key = ensure_session_key(request)
    return get_or_create_chat_session_by_session_key(session_key)


def get_or_create_chat_session_by_session_key(session_key):
    chat_session, created = ChatSession.objects.get_or_create(
        session_key=session_key,
        defaults={'is_active': True},
    )
    if not created and not chat_session.is_active:
        chat_session.is_active = True
        chat_session.save(update_fields=['is_active', 'updated_at'])
    return chat_session


def validate_message_text(text):
    cleaned = (text or '').strip()
    if not cleaned:
        raise ValidationError({'text': 'Message text cannot be empty.'})
    if len(cleaned) > settings.CHAT_MESSAGE_MAX_LENGTH:
        raise ValidationError(
            {'text': f'Message text cannot exceed {settings.CHAT_MESSAGE_MAX_LENGTH} characters.'}
        )
    return cleaned


def enforce_user_rate_limit(chat_session):
    window_started_at = timezone.now() - timedelta(seconds=settings.CHAT_RATE_LIMIT_WINDOW_SECONDS)
    recent_messages = Message.objects.filter(
        chat_session=chat_session,
        sender_type=Message.SenderType.USER,
        created_at__gte=window_started_at,
    ).order_by('created_at')

    if recent_messages.count() < settings.CHAT_RATE_LIMIT_COUNT:
        return

    oldest_message = recent_messages.first()
    elapsed_seconds = int((timezone.now() - oldest_message.created_at).total_seconds()) if oldest_message else 0
    wait_seconds = max(1, settings.CHAT_RATE_LIMIT_WINDOW_SECONDS - elapsed_seconds)
    raise ChatRateLimitExceeded(
        detail='Too many messages. Please wait before sending another one.',
        wait_seconds=wait_seconds,
    )


def create_message(chat_session, text, sender_type):
    cleaned_text = validate_message_text(text)

    if sender_type == Message.SenderType.USER:
        enforce_user_rate_limit(chat_session)

    return Message.objects.create(
        chat_session=chat_session,
        text=cleaned_text,
        sender_type=sender_type,
    )


def create_user_message_with_optional_bot_reply(chat_session, text):
    user_message = create_message(
        chat_session=chat_session,
        text=text,
        sender_type=Message.SenderType.USER,
    )

    bot_message = None
    bot_reply = generate_chatbot_reply(user_message.text)
    if bot_reply:
        bot_message = create_message(
            chat_session=chat_session,
            text=bot_reply,
            sender_type=Message.SenderType.BOT,
        )

    return user_message, bot_message