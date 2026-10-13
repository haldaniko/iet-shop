"""Private, retry-safe publishing API for the editorial Telegram bot."""

import hmac
import io
import json
import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.http.multipartparser import MultiPartParser, MultiPartParserError
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from PIL import Image, UnidentifiedImageError

from .models import Post, Tag


CATEGORIES = ({"slug": "news", "name": "Новини"}, {"slug": "guides", "name": "Статии и ръководства"})
MAX_IMAGE = 10 * 1024 * 1024


def error(message, code=400):
    return JsonResponse({"detail": message}, status=code)


def authenticated(request):
    secret = settings.BOT_INTEGRATION_TOKEN
    header = request.headers.get("Authorization", "")
    candidate = header[7:] if header.startswith("Bearer ") else ""
    return bool(secret and candidate and hmac.compare_digest(candidate, secret))


def public_url(request, path):
    base = settings.SITE_URL.rstrip("/") or request.build_absolute_uri("/").rstrip("/")
    return base + path


def article_response(request, post):
    image_url = public_url(request, post.picture.url) if post.picture else None
    return JsonResponse({
        "article_id": str(post.pk), "status": post.status,
        "url": public_url(request, f"/bg/blog/{post.slug}"),
        "image_url": image_url,
    })


def valid_payload(data):
    if not isinstance(data, dict):
        return None
    try:
        external_id = str(uuid.UUID(data.get("external_id", "")))
    except (ValueError, TypeError, AttributeError):
        return None
    title, content = data.get("title"), data.get("content")
    summary = data.get("summary") or ""
    categories = data.get("category_slugs")
    author = data.get("author_slug")
    tags = data.get("tag_names") or []
    if not isinstance(title, str) or not title.strip() or len(title) > 300:
        return None
    if not isinstance(content, str) or not content.strip():
        return None
    if not isinstance(summary, str) or len(summary) > 1000:
        return None
    allowed = {category["slug"] for category in CATEGORIES}
    if not isinstance(categories, list) or not categories or any(not isinstance(c, str) or c not in allowed for c in categories):
        return None
    if author is not None:  # This site has no author directory.
        return None
    if not isinstance(tags, list) or len(tags) > 10 or any(not isinstance(t, str) or not t.strip() or len(t) > 80 for t in tags):
        return None
    return external_id, {
        "title": title.strip(), "content": content.strip(), "summary": summary.strip(),
        "category_slugs": sorted(set(categories)), "author_slug": None,
        "tag_names": sorted(set(t.strip() for t in tags)),
    }


@csrf_exempt
def options(request):
    if not authenticated(request):
        return error("Forbidden", 403)
    if request.method != "GET":
        return error("Method not allowed", 405)
    return JsonResponse({"version": 1, "site": "iet-shop", "categories": CATEGORIES, "authors": []})


@csrf_exempt
def articles(request):
    if not authenticated(request):
        return error("Forbidden", 403)
    if request.method != "POST":
        return error("Method not allowed", 405)
    if request.content_type != "application/json":
        return error("Expected application/json")
    try:
        parsed = valid_payload(json.loads(request.body))
    except (ValueError, UnicodeDecodeError):
        parsed = None
    if parsed is None:
        return error("Invalid article payload")
    external_id, payload = parsed
    try:
        with transaction.atomic():
            post = Post.objects.create(
                external_id=external_id, bot_payload=payload, slug=f"bot-{external_id}",
                title_bg=payload["title"], title_en=payload["title"],
                content_bg=payload["content"], content_en=payload["content"],
                summary=payload["summary"], category_slugs=payload["category_slugs"],
                author="IET", status="draft",
            )
            for name in payload["tag_names"]:
                tag, _ = Tag.objects.get_or_create(name_bg=name, defaults={"name_en": name})
                post.tags.add(tag)
            for category in CATEGORIES:
                if category["slug"] in payload["category_slugs"]:
                    tag, _ = Tag.objects.get_or_create(name_bg=category["name"], defaults={"name_en": category["name"]})
                    post.tags.add(tag)
            return article_response(request, post)
    except IntegrityError:
        post = Post.objects.filter(external_id=external_id).first()
        if post is None or post.bot_payload != payload:
            return error("Article conflict", 409)
        return article_response(request, post)


@csrf_exempt
def article_detail(request, external_id):
    if not authenticated(request):
        return error("Forbidden", 403)
    if request.method != "GET":
        return error("Method not allowed", 405)
    post = Post.objects.filter(external_id=external_id).first()
    return article_response(request, post) if post else error("Article not found", 404)


@csrf_exempt
def article_image(request, external_id):
    if not authenticated(request):
        return error("Forbidden", 403)
    if request.method != "PUT":
        return error("Method not allowed", 405)
    with transaction.atomic():
        post = Post.objects.select_for_update().filter(external_id=external_id).first()
        if post is None:
            return error("Article not found", 404)
        if post.status != "draft":
            return error("Article already published", 409)
        if post.picture:
            return article_response(request, post)
        try:
            _, files = MultiPartParser(request.META, request, request.upload_handlers).parse()
            uploaded = files.get("image")
        except MultiPartParserError:
            return error("Invalid multipart upload")
        if uploaded is None or uploaded.size > MAX_IMAGE:
            return error("Image is required and must be at most 10 MiB")
        try:
            data = uploaded.read(MAX_IMAGE + 1)
            if len(data) > MAX_IMAGE:
                return error("Image exceeds 10 MiB")
            source = Image.open(io.BytesIO(data))
            if source.format not in {"JPEG", "PNG", "WEBP"}:
                return error("Unsupported image type")
            source.verify()
            source = Image.open(io.BytesIO(data))
            output = io.BytesIO()
            source.convert("RGB").save(output, format="JPEG", quality=90)
        except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
            return error("Invalid image")
        post.picture.save(f"{external_id}.jpg", ContentFile(output.getvalue()), save=True)
        return article_response(request, post)


@csrf_exempt
def article_publish(request, external_id):
    if not authenticated(request):
        return error("Forbidden", 403)
    if request.method != "POST":
        return error("Method not allowed", 405)
    with transaction.atomic():
        post = Post.objects.select_for_update().filter(external_id=external_id).first()
        if post is None:
            return error("Article not found", 404)
        if post.status == "published":
            return article_response(request, post)
        if post.status != "draft":
            return error("Invalid article state", 409)
        post.status = "published"
        post.published_at = timezone.now()
        post.created_at = post.published_at
        post.save(update_fields=["status", "published_at", "created_at"])
        return article_response(request, post)
