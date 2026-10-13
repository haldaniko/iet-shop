import io
import json
import os
import tempfile
import uuid

from django.test import TestCase, override_settings
from django.test.client import encode_multipart
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from .models import Post


@override_settings(BOT_INTEGRATION_TOKEN="test-secret", SITE_URL="https://obucheniya.com")
class BotApiTests(TestCase):
    def setUp(self):
        self.external_id = uuid.uuid4()
        self.headers = {"HTTP_AUTHORIZATION": "Bearer test-secret"}
        self.payload = {
            "external_id": str(self.external_id), "title": "Example", "content": "Body",
            "summary": "Short", "category_slugs": ["news"],
            "author_slug": None, "tag_names": ["Telegram"],
        }
        self.base = "/api/bot/v1/"

    def create(self, payload=None):
        return self.client.post(self.base + "articles/", data=json.dumps(payload or self.payload),
                                content_type="application/json", **self.headers)

    def upload(self, detail, data):
        body = encode_multipart("boundary", {"image": SimpleUploadedFile("photo.png", data)})
        return self.client.put(detail + "image/", data=body,
                               content_type="multipart/form-data; boundary=boundary", **self.headers)

    def test_auth_and_options(self):
        self.assertEqual(self.client.get(self.base + "options/").status_code, 403)
        with override_settings(BOT_INTEGRATION_TOKEN=""):
            self.assertEqual(self.client.get(self.base + "options/", **self.headers).status_code, 403)
        response = self.client.get(self.base + "options/", **self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["version"], 1)
        self.assertTrue(response.json()["categories"])

    def test_draft_retry_conflict_recovery_and_publish(self):
        first = self.create()
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json()["status"], "draft")
        self.assertEqual(self.create().json(), first.json())
        self.assertEqual(Post.objects.filter(external_id=self.external_id).count(), 1)
        changed = dict(self.payload, title="Changed")
        self.assertEqual(self.create(changed).status_code, 409)
        detail = self.base + f"articles/{self.external_id}/"
        self.assertEqual(self.client.get(detail, **self.headers).json(), first.json())
        self.assertFalse(any(p["slug"] == f"bot-{self.external_id}" for p in self.client.get("/api/posts/").json()))
        published = self.client.post(detail + "publish/", **self.headers)
        self.assertEqual(published.json()["status"], "published")
        self.assertEqual(published.json()["url"], f"https://obucheniya.com/bg/blog/bot-{self.external_id}")
        published_at = Post.objects.get(external_id=self.external_id).published_at
        self.assertEqual(self.client.post(detail + "publish/", **self.headers).json(), published.json())
        self.assertEqual(Post.objects.get(external_id=self.external_id).published_at, published_at)
        self.assertTrue(any(p["slug"] == f"bot-{self.external_id}" for p in self.client.get("/api/posts/").json()))
        self.assertEqual(self.client.put(detail + "image/", **self.headers).status_code, 409)

    def test_image_validation_and_idempotence(self):
        self.create()
        detail = self.base + f"articles/{self.external_id}/"
        with tempfile.TemporaryDirectory() as media:
            with override_settings(MEDIA_ROOT=media):
                invalid = self.upload(detail, b"not an image")
                self.assertEqual(invalid.status_code, 400)
                image = io.BytesIO()
                Image.new("RGB", (2, 2), "red").save(image, "PNG")
                image.seek(0)
                first = self.upload(detail, image.getvalue())
                self.assertEqual(first.status_code, 200)
                self.assertTrue(first.json()["image_url"].startswith("https://obucheniya.com/api/media/posts/"))
                picture_path = Post.objects.get(external_id=self.external_id).picture.url
                self.assertTrue(os.path.exists(Post.objects.get(external_id=self.external_id).picture.path))
                self.assertTrue(picture_path.startswith("/api/media/posts/"))
                repeated = self.upload(detail, b"other")
                self.assertEqual(repeated.json(), first.json())

