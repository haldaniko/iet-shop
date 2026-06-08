from django.core.exceptions import ValidationError as DjangoValidationError
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .chat_services import (
    ChatRateLimitExceeded,
    create_user_message_with_optional_bot_reply,
    get_admin_chat_group_name,
    get_chat_group_name,
    get_or_create_chat_session_by_session_key,
)


@database_sync_to_async
def get_chat_session_payload(session_key):
    chat_session = get_or_create_chat_session_by_session_key(session_key)
    return {'chat_session_id': str(chat_session.id)}


@database_sync_to_async
def save_user_message(session_key, text):
    chat_session = get_or_create_chat_session_by_session_key(session_key)
    create_user_message_with_optional_bot_reply(chat_session=chat_session, text=text)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        session = self.scope.get('session')
        self.session_key = session.session_key if session else None
        self.group_name = None

        if not self.session_key:
            await self.accept()
            await self.send_json(
                {
                    'type': 'chat.error',
                    'code': 'session_missing',
                    'detail': 'Chat session is not initialized. Call /api/chat/init/ first.',
                }
            )
            await self.close(code=4401)
            return

        self.group_name = get_chat_group_name(self.session_key)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        payload = await get_chat_session_payload(self.session_key)
        await self.accept()
        await self.send_json({'type': 'chat.ready', **payload})

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get('type') != 'message':
            await self.send_json(
                {
                    'type': 'chat.error',
                    'code': 'invalid_event',
                    'detail': 'Unsupported websocket event type.',
                }
            )
            return

        try:
            await save_user_message(self.session_key, content.get('text', ''))
        except ChatRateLimitExceeded as exc:
            await self.send_json(
                {
                    'type': 'chat.error',
                    'code': 'rate_limited',
                    'detail': exc.detail,
                    'wait_seconds': exc.wait_seconds,
                }
            )
        except DjangoValidationError as exc:
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            await self.send_json(
                {
                    'type': 'chat.error',
                    'code': 'validation_error',
                    'detail': detail,
                }
            )

    async def chat_message(self, event):
        await self.send_json({'type': 'chat.message', 'message': event['message']})


class AdminChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated or not user.is_superuser:
            await self.close(code=4403)
            return

        self.group_name = get_admin_chat_group_name()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({'type': 'admin.chat.ready'})

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name') and self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        event_type = content.get('type')
        if event_type == 'ping':
            await self.send_json({'type': 'pong'})
            return

        await self.send_json(
            {
                'type': 'chat.error',
                'code': 'invalid_event',
                'detail': 'Unsupported websocket event type.',
            }
        )

    async def admin_chat_message(self, event):
        await self.send_json(
            {
                'type': 'admin.chat.message',
                'chat_session_id': event['chat_session_id'],
                'message': event['message'],
            }
        )
