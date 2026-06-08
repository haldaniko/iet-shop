import json
from types import SimpleNamespace
from unittest.mock import patch

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.test import Client, TestCase, TransactionTestCase, override_settings
from django.urls import reverse
from django.utils.dateparse import parse_datetime

from .models import ChatSession, Consultation, Course, EventRequest, Message


User = get_user_model()


IN_MEMORY_CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels.layers.InMemoryChannelLayer',
	}
}


@override_settings(CHANNEL_LAYERS=IN_MEMORY_CHANNEL_LAYERS, CHAT_BOT_ENABLED=False)
class ChatApiTests(TestCase):
	def setUp(self):
		self.client = Client(enforce_csrf_checks=True)

	def init_chat(self):
		response = self.client.post(reverse('chat-init'))
		self.assertEqual(response.status_code, 200)
		self.assertIn('sessionid', self.client.cookies)
		self.assertIn('csrftoken', response.cookies)
		return response

	def auth_headers(self):
		return {'HTTP_X_CSRFTOKEN': self.client.cookies['csrftoken'].value}

	def test_get_messages_bootstraps_anonymous_chat_session(self):
		response = self.client.get(reverse('chat-messages'))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), [])
		self.assertEqual(ChatSession.objects.count(), 1)
		self.assertIn('sessionid', self.client.cookies)
		self.assertIn('csrftoken', response.cookies)

	def test_init_returns_existing_history_for_current_session(self):
		self.init_chat()
		create_response = self.client.post(
			reverse('chat-messages'),
			data=json.dumps({'text': 'Hello from REST'}),
			content_type='application/json',
			**self.auth_headers(),
		)
		self.assertEqual(create_response.status_code, 201)

		init_response = self.client.post(reverse('chat-init'))
		payload = init_response.json()

		self.assertEqual(init_response.status_code, 200)
		self.assertEqual(len(payload['messages']), 1)
		self.assertEqual(payload['messages'][0]['text'], 'Hello from REST')

	def test_post_message_requires_csrf_header(self):
		self.init_chat()

		response = self.client.post(
			reverse('chat-messages'),
			data=json.dumps({'text': 'Blocked'}),
			content_type='application/json',
		)

		self.assertEqual(response.status_code, 403)

	def test_post_message_persists_history_for_same_browser_session(self):
		self.init_chat()

		create_response = self.client.post(
			reverse('chat-messages'),
			data=json.dumps({'text': '  Persistent hello  '}),
			content_type='application/json',
			**self.auth_headers(),
		)
		self.assertEqual(create_response.status_code, 201)
		created_message = create_response.json()

		reload_client = Client(enforce_csrf_checks=True)
		reload_client.cookies = self.client.cookies
		history_response = reload_client.get(reverse('chat-messages'))
		history = history_response.json()

		self.assertEqual(history_response.status_code, 200)
		self.assertEqual(len(history), 1)
		self.assertEqual(history[0]['id'], created_message['id'])
		self.assertEqual(history[0]['text'], 'Persistent hello')

	@override_settings(CHAT_RATE_LIMIT_COUNT=2, CHAT_RATE_LIMIT_WINDOW_SECONDS=60)
	def test_post_message_is_rate_limited(self):
		self.init_chat()

		for text in ('First', 'Second'):
			response = self.client.post(
				reverse('chat-messages'),
				data=json.dumps({'text': text}),
				content_type='application/json',
				**self.auth_headers(),
			)
			self.assertEqual(response.status_code, 201)

		limited_response = self.client.post(
			reverse('chat-messages'),
			data=json.dumps({'text': 'Third'}),
			content_type='application/json',
			**self.auth_headers(),
		)

		self.assertEqual(limited_response.status_code, 429)

	@override_settings(CHAT_BOT_ENABLED=True)
	@patch('api.chat_services.generate_chatbot_reply', return_value='Auto bot response')
	def test_post_message_creates_bot_reply_when_enabled(self, _mock_bot_reply):
		self.init_chat()

		create_response = self.client.post(
			reverse('chat-messages'),
			data=json.dumps({'text': 'Can you help me with schedule?'}),
			content_type='application/json',
			**self.auth_headers(),
		)

		self.assertEqual(create_response.status_code, 201)
		history = self.client.get(reverse('chat-messages')).json()
		self.assertEqual(len(history), 2)
		self.assertEqual(history[0]['sender_type'], 'user')
		self.assertEqual(history[1]['sender_type'], 'bot')
		self.assertEqual(history[1]['text'], 'Auto bot response')


@override_settings(CHANNEL_LAYERS=IN_MEMORY_CHANNEL_LAYERS, CHAT_BOT_ENABLED=False)
class ChatWebSocketTests(TransactionTestCase):
	def setUp(self):
		self.client = Client(enforce_csrf_checks=True)

	def init_chat(self):
		response = self.client.post(reverse('chat-init'))
		self.assertEqual(response.status_code, 200)
		return self.client.cookies['sessionid'].value

	def socket_headers(self):
		session_id = self.client.cookies['sessionid'].value
		csrf_token = self.client.cookies['csrftoken'].value
		return [
			(b'host', b'testserver'),
			(b'cookie', f'sessionid={session_id}; csrftoken={csrf_token}'.encode()),
		]

	def create_operator_message(self, session_key, text):
		chat_session = ChatSession.objects.get(session_key=session_key)
		Message.objects.create(
			chat_session=chat_session,
			text=text,
			sender_type=Message.SenderType.OPERATOR,
		)

	def test_websocket_reports_missing_session(self):
		async_to_sync(self._test_websocket_reports_missing_session)()

	async def _test_websocket_reports_missing_session(self):
		from channels.testing import WebsocketCommunicator
		from core.asgi import application

		communicator = WebsocketCommunicator(
			application,
			'/ws/chat/',
			headers=[(b'host', b'testserver')],
		)
		connected, _ = await communicator.connect()

		self.assertTrue(connected)
		payload = await communicator.receive_json_from()
		self.assertEqual(payload['type'], 'chat.error')
		self.assertEqual(payload['code'], 'session_missing')

	def test_websocket_delivers_user_and_operator_messages(self):
		session_key = self.init_chat()
		async_to_sync(self._test_websocket_delivers_user_and_operator_messages)(session_key)

	async def _test_websocket_delivers_user_and_operator_messages(self, session_key):
		from channels.testing import WebsocketCommunicator
		from core.asgi import application

		communicator = WebsocketCommunicator(
			application,
			'/ws/chat/',
			headers=self.socket_headers(),
		)
		connected, _ = await communicator.connect()

		self.assertTrue(connected)
		ready_payload = await communicator.receive_json_from()
		self.assertEqual(ready_payload['type'], 'chat.ready')

		await communicator.send_json_to({'type': 'message', 'text': 'Hello from websocket'})
		first_message = await communicator.receive_json_from()

		self.assertEqual(first_message['type'], 'chat.message')
		self.assertEqual(first_message['message']['sender_type'], 'user')
		self.assertEqual(first_message['message']['text'], 'Hello from websocket')

		await database_sync_to_async(self.create_operator_message)(session_key, 'Operator reply')
		second_message = await communicator.receive_json_from()

		self.assertEqual(second_message['type'], 'chat.message')
		self.assertEqual(second_message['message']['sender_type'], 'operator')
		self.assertEqual(second_message['message']['text'], 'Operator reply')

		await communicator.disconnect()


class AdminAuthApiTests(TestCase):
	def setUp(self):
		self.client = Client(enforce_csrf_checks=True)
		self.superuser = User.objects.create_superuser(
			username='root-admin',
			email='root@example.com',
			password='StrongPass123!',
		)
		self.staff_user = User.objects.create_user(
			username='staff-only',
			email='staff@example.com',
			password='StrongPass123!',
			is_staff=True,
		)

	def csrf_headers(self):
		response = self.client.get(reverse('admin-auth-csrf'))
		self.assertEqual(response.status_code, 200)
		return {'HTTP_X_CSRFTOKEN': self.client.cookies['csrftoken'].value}

	def test_superuser_can_login_and_fetch_profile(self):
		login_response = self.client.post(
			reverse('admin-auth-login'),
			data=json.dumps({'username': 'root-admin', 'password': 'StrongPass123!'}),
			content_type='application/json',
			**self.csrf_headers(),
		)

		self.assertEqual(login_response.status_code, 200)
		self.assertTrue(login_response.json()['user']['is_superuser'])

		me_response = self.client.get(reverse('admin-auth-me'))
		self.assertEqual(me_response.status_code, 200)
		self.assertEqual(me_response.json()['user']['username'], 'root-admin')

	def test_non_superuser_is_blocked_from_admin_login(self):
		login_response = self.client.post(
			reverse('admin-auth-login'),
			data=json.dumps({'username': 'staff-only', 'password': 'StrongPass123!'}),
			content_type='application/json',
			**self.csrf_headers(),
		)

		self.assertEqual(login_response.status_code, 403)
		self.assertIn('Only superusers', login_response.json()['detail'])

	def test_superuser_can_manage_admin_tags(self):
		self.client.force_login(self.superuser)

		create_response = self.client.post(
			'/api/admin/tags/',
			data=json.dumps({'name_en': 'Admin Tag', 'name_bg': 'Админ Таг'}),
			content_type='application/json',
			**self.csrf_headers(),
		)
		self.assertEqual(create_response.status_code, 201)
		tag_id = create_response.json()['id']

		list_response = self.client.get('/api/admin/tags/')
		self.assertEqual(list_response.status_code, 200)
		self.assertTrue(any(item['id'] == tag_id for item in list_response.json()))

		delete_response = self.client.delete(
			f'/api/admin/tags/{tag_id}/',
			**self.csrf_headers(),
		)
		self.assertEqual(delete_response.status_code, 204)

	def test_staff_user_cannot_access_admin_api(self):
		self.client.force_login(self.staff_user)
		response = self.client.get('/api/admin/tags/')
		self.assertEqual(response.status_code, 403)

	def test_admin_chat_sessions_show_only_after_first_user_message(self):
		self.client.force_login(self.superuser)

		empty_session = ChatSession.objects.create(session_key='empty-session')
		operator_only_session = ChatSession.objects.create(session_key='operator-only-session')
		Message.objects.create(
			chat_session=operator_only_session,
			text='Operator ping',
			sender_type=Message.SenderType.OPERATOR,
		)

		with_user_session = ChatSession.objects.create(session_key='with-user-session')
		Message.objects.create(
			chat_session=with_user_session,
			text='Hello admin',
			sender_type=Message.SenderType.USER,
		)

		response = self.client.get('/api/admin/chat-sessions/')
		self.assertEqual(response.status_code, 200)
		returned_ids = {item['id'] for item in response.json()}

		self.assertIn(str(with_user_session.id), returned_ids)
		self.assertNotIn(str(empty_session.id), returned_ids)
		self.assertNotIn(str(operator_only_session.id), returned_ids)

		Message.objects.create(
			chat_session=empty_session,
			text='My first message',
			sender_type=Message.SenderType.USER,
		)

		response_after_first_user_message = self.client.get('/api/admin/chat-sessions/')
		self.assertEqual(response_after_first_user_message.status_code, 200)
		returned_ids_after_first_user_message = {
			item['id'] for item in response_after_first_user_message.json()
		}

		self.assertIn(str(empty_session.id), returned_ids_after_first_user_message)


class LeadFormApiTests(TestCase):
	def setUp(self):
		self.client = Client(enforce_csrf_checks=True)

	def test_consultation_create_sets_created_at_automatically(self):
		response = self.client.post(
			reverse('consultation-list'),
			data=json.dumps(
				{
					'name': 'Lead Tester',
					'email': 'lead@example.com',
					'phone': '+359888123456',
				}
			),
			content_type='application/json',
		)

		self.assertEqual(response.status_code, 201)
		payload = response.json()
		self.assertIn('created_at', payload)
		self.assertIsNotNone(parse_datetime(payload['created_at']))

		consultation = Consultation.objects.get(pk=payload['id'])
		self.assertIsNotNone(consultation.created_at)

	def test_event_request_create_sets_created_at_automatically(self):
		response = self.client.post(
			reverse('event-request-list'),
			data=json.dumps(
				{
					'name': 'Event Lead',
					'email': 'event-lead@example.com',
					'phone': '+359888654321',
				}
			),
			content_type='application/json',
		)

		self.assertEqual(response.status_code, 201)
		payload = response.json()
		self.assertIn('created_at', payload)
		self.assertIsNotNone(parse_datetime(payload['created_at']))

		event_request = EventRequest.objects.get(pk=payload['id'])
		self.assertIsNotNone(event_request.created_at)


@override_settings(CHANNEL_LAYERS=IN_MEMORY_CHANNEL_LAYERS)
class AdminWebSocketTests(TransactionTestCase):
	def setUp(self):
		self.superuser = User.objects.create_superuser(
			username='ws-admin',
			email='ws-admin@example.com',
			password='StrongPass123!',
		)

	def test_admin_websocket_requires_superuser_auth(self):
		async_to_sync(self._test_admin_websocket_requires_superuser_auth)()

	async def _test_admin_websocket_requires_superuser_auth(self):
		from channels.testing import WebsocketCommunicator
		from core.asgi import application

		communicator = WebsocketCommunicator(
			application,
			'/ws/admin/chat/',
			headers=[(b'host', b'testserver')],
		)
		connected, _ = await communicator.connect()
		self.assertFalse(connected)

	def test_admin_websocket_receives_new_message_events(self):
		client = Client(enforce_csrf_checks=True)
		client.force_login(self.superuser)
		session_id = client.cookies['sessionid'].value

		async_to_sync(self._test_admin_websocket_receives_new_message_events)(session_id)

	async def _test_admin_websocket_receives_new_message_events(self, session_id):
		from channels.testing import WebsocketCommunicator
		from core.asgi import application

		headers = [
			(b'host', b'testserver'),
			(b'cookie', f'sessionid={session_id}'.encode()),
		]

		communicator = WebsocketCommunicator(
			application,
			'/ws/admin/chat/',
			headers=headers,
		)
		connected, _ = await communicator.connect()
		self.assertTrue(connected)

		ready_payload = await communicator.receive_json_from()
		self.assertEqual(ready_payload['type'], 'admin.chat.ready')

		chat_session = await database_sync_to_async(ChatSession.objects.create)(
			session_key='operator-watch-session',
		)
		await database_sync_to_async(Message.objects.create)(
			chat_session=chat_session,
			text='Client pinged support',
			sender_type=Message.SenderType.USER,
		)

		message_payload = await communicator.receive_json_from()
		self.assertEqual(message_payload['type'], 'admin.chat.message')
		self.assertEqual(message_payload['chat_session_id'], str(chat_session.id))
		self.assertEqual(message_payload['message']['text'], 'Client pinged support')

		await communicator.disconnect()


class MediaSerializationTests(TestCase):
	def test_course_image_is_null_when_file_is_missing(self):
		Course.objects.create(
			slug='missing-media-course',
			start='2026-01-01',
			type='online',
			price=1000,
			image='courses/does-not-exist.jpg',
		)

		response = self.client.get('/api/courses/')
		self.assertEqual(response.status_code, 200)

		payload = response.json()
		course_item = next((item for item in payload if item['slug'] == 'missing-media-course'), None)

		self.assertIsNotNone(course_item)
		self.assertIsNone(course_item['image'])


@override_settings(
	STRIPE_SECRET_KEY='sk_test_123',
)
class StripeCheckoutSessionTests(TestCase):
	def setUp(self):
		self.course = Course.objects.create(
			slug='fullstack-essentials',
			title_en='Fullstack Essentials',
			start='2026-05-15',
			type='hybrid',
			price=69000,
			is_active=True,
		)

	@patch('api.views.create_checkout_session')
	def test_create_checkout_session_returns_session_id(self, mocked_create_checkout_session):
		mocked_create_checkout_session.return_value = SimpleNamespace(id='cs_test_123')

		response = self.client.post(
			reverse('create-checkout-session'),
			data=json.dumps(
				{
					'product_slug': self.course.slug,
					'customer_email': 'student@example.com',
				}
			),
			content_type='application/json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {'sessionId': 'cs_test_123'})
		mocked_create_checkout_session.assert_called_once_with(
			self.course,
			response.wsgi_request,
			customer_email='student@example.com',
		)
