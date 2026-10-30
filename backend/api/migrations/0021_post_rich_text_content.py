from django.db import migrations, models


def text_to_rich_document(value):
    if isinstance(value, dict) and value.get("type") == "doc":
        return value

    text = value if isinstance(value, str) else ""
    paragraphs = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    content = []
    for paragraph in paragraphs:
        node = {"type": "paragraph"}
        if paragraph:
            node["content"] = [{"type": "text", "text": paragraph}]
        content.append(node)

    return {"type": "doc", "content": content or [{"type": "paragraph"}]}


def rich_document_to_text(value):
    if not isinstance(value, dict):
        return ""

    lines = []

    def collect(node):
        if not isinstance(node, dict):
            return
        if node.get("type") == "text":
            lines.append(str(node.get("text", "")))
            return
        children = node.get("content")
        if isinstance(children, list):
            start = len(lines)
            for child in children:
                collect(child)
            if node.get("type") in {"paragraph", "heading", "listItem", "blockquote"} and len(lines) > start:
                lines.append("\n")

    collect(value)
    return "".join(lines).strip()


def forwards(apps, schema_editor):
    Post = apps.get_model("api", "Post")
    for post in Post.objects.all().iterator():
        post.content_en_rich = text_to_rich_document(post.content_en)
        post.content_bg_rich = text_to_rich_document(post.content_bg)
        post.save(update_fields=["content_en_rich", "content_bg_rich"])


def backwards(apps, schema_editor):
    Post = apps.get_model("api", "Post")
    for post in Post.objects.all().iterator():
        post.content_en = rich_document_to_text(post.content_en_rich)
        post.content_bg = rich_document_to_text(post.content_bg_rich)
        post.save(update_fields=["content_en", "content_bg"])


class Migration(migrations.Migration):
    dependencies = [("api", "0020_post_bot_payload_post_category_slugs_and_more")]

    operations = [
        migrations.AddField(
            model_name="post",
            name="content_en_rich",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="post",
            name="content_bg_rich",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(model_name="post", name="content_en"),
        migrations.RemoveField(model_name="post", name="content_bg"),
        migrations.RenameField(model_name="post", old_name="content_en_rich", new_name="content_en"),
        migrations.RenameField(model_name="post", old_name="content_bg_rich", new_name="content_bg"),
    ]
