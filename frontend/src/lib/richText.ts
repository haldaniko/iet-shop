type RichTextNode = {
  type?: string;
  text?: string;
  content?: RichTextNode[];
};

export const richTextToPlainText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const node = value as RichTextNode;
  if (node.type === "text") return node.text || "";
  if (!Array.isArray(node.content)) return "";

  const separator = ["doc", "bulletList", "orderedList", "listItem", "blockquote"].includes(node.type || "") ? "\n" : "";
  return node.content.map(richTextToPlainText).filter(Boolean).join(separator).trim();
};

export const localizedRichText = (value: unknown, lang: "en" | "bg"): unknown => {
  if (!value || typeof value !== "object") return value;
  if ((value as RichTextNode).type === "doc") return value;

  const localized = value as { en?: unknown; bg?: unknown };
  return (lang === "bg" ? localized.bg : localized.en) ?? localized.en ?? localized.bg ?? null;
};
