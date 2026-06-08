import json
import logging
import re
from datetime import date
from urllib import error as urllib_error
from urllib import request as urllib_request

from django.conf import settings

from .models import Course, Event, Post, Project


logger = logging.getLogger(__name__)


FAQ_ITEMS_EN = [
    {
        "question": "Do I need prior knowledge to enroll?",
        "answer": "Most entry-level courses are designed for beginners. Any required prerequisites are listed in the course description.",
        "keywords": ["beginner", "prior", "knowledge", "experience", "start"],
    },
    {
        "question": "Are there age restrictions?",
        "answer": "Programs are available for kids, students, and adults. The audience type is shown in each course card.",
        "keywords": ["age", "kids", "children", "adult", "teen"],
    },
    {
        "question": "What is the training format?",
        "answer": "Training is available in online, offline, or hybrid formats, depending on the specific program.",
        "keywords": ["format", "online", "offline", "hybrid", "remote"],
    },
    {
        "question": "How often are classes held?",
        "answer": "Most programs run 2-3 times per week, usually in the evening or on weekends.",
        "keywords": ["schedule", "often", "week", "classes", "time"],
    },
    {
        "question": "Will I have practical tasks?",
        "answer": "Yes. The programs focus heavily on hands-on practice and project work.",
        "keywords": ["practice", "tasks", "project", "portfolio", "homework"],
    },
]


def _detect_lang(text: str) -> str:
    if re.search(r"[\u0400-\u04FF]", text or ""):
        return "bg"
    return "en"


def _serialize_course(course: Course) -> dict:
    return {
        "title": course.title_en or course.title_bg or "Untitled course",
        "slug": course.slug,
        "type": course.type,
        "audience": course.audience,
        "price": course.price,
        "monthly_installment_price": course.monthly_installment_price,
        "visits_per_week": course.visits_per_week,
        "start": course.start.isoformat() if isinstance(course.start, date) else None,
    }


def _serialize_event(event: Event) -> dict:
    return {
        "title": event.title_en or event.title_bg or "Untitled event",
        "type": event.type,
        "date": event.date.isoformat() if isinstance(event.date, date) else None,
    }


def _collect_db_context() -> dict:
    active_courses = list(Course.objects.filter(is_active=True).order_by("start", "id")[:8])
    upcoming_events = list(Event.objects.order_by("date", "id")[:6])
    latest_posts = list(Post.objects.order_by("-created_at", "-id")[:4])
    latest_projects = list(Project.objects.filter(is_active=True).order_by("-created_at", "-id")[:4])

    return {
        "active_courses_count": Course.objects.filter(is_active=True).count(),
        "events_count": Event.objects.count(),
        "posts_count": Post.objects.count(),
        "projects_count": Project.objects.filter(is_active=True).count(),
        "courses": [_serialize_course(course) for course in active_courses],
        "events": [_serialize_event(event) for event in upcoming_events],
        "posts": [post.title_en or post.title_bg or "Untitled post" for post in latest_posts],
        "projects": [project.title_en or project.title_bg or "Untitled project" for project in latest_projects],
    }


def _heuristic_faq_answer(user_text: str) -> str | None:
    lowered = (user_text or "").lower()
    for item in FAQ_ITEMS_EN:
        if any(keyword in lowered for keyword in item["keywords"]):
            return item["answer"]
    return None


def _build_system_prompt(lang: str) -> str:
    base = (
        "You are a helpful assistant for an IT education website. "
        "Answer only with information grounded in FAQ and database context provided by the server. "
        "If information is missing, say so clearly and suggest contacting support. "
        "Keep answers concise: 2-5 short sentences."
    )
    if lang == "bg":
        return base + " Reply in Bulgarian."
    return base + " Reply in English."


def _request_openrouter_reply(user_text: str, lang: str, knowledge_payload: dict) -> str | None:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return None

    payload = {
        "model": settings.CHAT_BOT_MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": _build_system_prompt(lang)},
            {
                "role": "user",
                "content": (
                    "User question:\n"
                    f"{user_text}\n\n"
                    "Website FAQ context:\n"
                    f"{json.dumps(FAQ_ITEMS_EN, ensure_ascii=False)}\n\n"
                    "Database context:\n"
                    f"{json.dumps(knowledge_payload, ensure_ascii=False)}"
                ),
            },
        ],
    }

    req = urllib_request.Request(
        url=settings.OPENROUTER_API_URL,
        method="POST",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.OPENROUTER_SITE_URL,
            "X-Title": settings.OPENROUTER_SITE_NAME,
        },
    )

    timeout_seconds = settings.CHAT_BOT_TIMEOUT_SECONDS

    try:
        with urllib_request.urlopen(req, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8")
    except urllib_error.HTTPError:
        logger.exception("OpenRouter request failed with HTTP error")
        return None
    except urllib_error.URLError:
        logger.exception("OpenRouter request failed with URL/network error")
        return None
    except TimeoutError:
        logger.exception("OpenRouter request timed out")
        return None

    try:
        data = json.loads(body)
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        logger.exception("OpenRouter response parsing failed")
        return None

    text = (content or "").strip()
    if not text:
        return None

    return text[: settings.CHAT_BOT_MAX_REPLY_LENGTH].strip()


def generate_chatbot_reply(user_text: str) -> str | None:
    if not settings.CHAT_BOT_ENABLED:
        return None

    lang = _detect_lang(user_text)
    db_context = _collect_db_context()

    ai_reply = _request_openrouter_reply(user_text=user_text, lang=lang, knowledge_payload=db_context)
    if ai_reply:
        return ai_reply

    heuristic_reply = _heuristic_faq_answer(user_text)
    if heuristic_reply:
        return heuristic_reply

    if lang == "bg":
        return "Blagodaria za vaprosa. V momenta nyamam dostatuchno danni za tozi temat, no moga da pomogna s kursove, format, grafik i ceni."
    return (
        "Thanks for your question. I do not have enough details for this specific topic right now, "
        "but I can help with courses, schedules, formats, and pricing."
    )