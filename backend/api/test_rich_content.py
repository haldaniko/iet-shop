import io
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from .models import Post


class RichContentAdminTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="content-admin",
            email="content@example.com",
            password="StrongPass123!",
        )
        self.client.force_login(self.user)

    def test_post_rich_content_round_trip(self):
        document = {
            "type": "doc",
            "content": [
                {"type": "paragraph", "content": [{"type": "text", "text": "With image"}]},
                {"type": "image", "attrs": {"src": "https://example.com/image.png"}},
            ],
        }
        response = self.client.post(
            "/api/admin/posts/",
            data={
                "slug": "rich-content-post",
                "author": "IET",
                "content_en": document,
                "content_bg": document,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Post.objects.get(slug="rich-content-post").content_en, document)
        self.assertEqual(response.json()["content_en"], document)

    def test_content_image_upload_validates_and_stores_image(self):
        image_bytes = io.BytesIO()
        Image.new("RGB", (3, 5), "blue").save(image_bytes, "PNG")

        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            response = self.client.post(
                "/api/admin/content/upload-image/",
                {"image": SimpleUploadedFile("portrait.png", image_bytes.getvalue(), content_type="image/png")},
            )
            invalid = self.client.post(
                "/api/admin/content/upload-image/",
                {"image": SimpleUploadedFile("fake.png", b"not an image", content_type="image/png")},
            )

        self.assertEqual(response.status_code, 201)
        self.assertIn("/api/media/content/images/", response.json()["url"])
        self.assertEqual(invalid.status_code, 400)
