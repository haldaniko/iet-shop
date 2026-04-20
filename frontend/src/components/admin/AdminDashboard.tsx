"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";

import type { ChatMessage } from "@/lib/chat";
import {
  type AdminChatSession,
  type AdminChatSocketEvent,
  type AdminPayload,
  type AdminResourceKey,
  type AdminUser,
  adminLogout,
  adminMe,
  buildAdminChatWebSocketUrl,
  createAdminResource,
  deleteAdminResource,
  listAdminChatSessions,
  listAdminResource,
  listAdminSessionMessages,
  sendAdminOperatorMessage,
  updateAdminResource,
  uploadAdminProjectImage,
} from "@/lib/admin";

import type { Lang } from "@/lib/translations";
import { getAdminTranslation } from "./translations";
import { RichTextEditor } from "./RichTextEditor";

import styles from "./AdminDashboard.module.scss";

type FieldType = "text" | "textarea" | "number" | "boolean" | "date" | "datetime" | "select" | "ids" | "file" | "richtext";

type FormValues = Record<string, unknown>;

interface FieldOption {
  value: string;
  label: string;
}

interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  nullable?: boolean;
  readOnly?: boolean;
  options?: FieldOption[];
  placeholder?: string;
}

interface TagOption {
  id: number;
  name_en: string;
  name_bg: string;
}

interface ResourceDefinition {
  key: AdminResourceKey;
  title: string;
  description: string;
  columns: string[];
  fields: FieldDefinition[];
  readOnly?: boolean;
  allowDelete?: boolean;
}

type DashboardTab = "operator-chat" | AdminResourceKey;

type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "error";

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
  );

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
  const messageMap = new Map<number, ChatMessage>();

  for (const message of current) {
    messageMap.set(message.id, message);
  }

  for (const message of incoming) {
    messageMap.set(message.id, message);
  }

  return sortMessages(Array.from(messageMap.values()));
};

const DATE_ONLY_FIELD_NAMES = new Set(["start", "date"]);
const DATETIME_FIELD_NAMES = new Set(["created_at", "updated_at", "paid_at", "last_login"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;

const parseDateValue = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatDate = (value: string | null | undefined) => {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return value ? String(value) : "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
};

const formatDateTime = (value: string | null | undefined) => {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return value ? String(value) : "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const formatChatTime = (value: string | null | undefined) => {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const formatDateByContext = (value: string, fieldType?: FieldType, fieldName?: string) => {
  const normalizedFieldName = fieldName?.toLowerCase() || "";

  if (
    fieldType === "datetime" ||
    DATETIME_FIELD_NAMES.has(normalizedFieldName) ||
    ISO_DATETIME_PATTERN.test(value)
  ) {
    return formatDateTime(value);
  }

  if (fieldType === "date" || DATE_ONLY_FIELD_NAMES.has(normalizedFieldName) || ISO_DATE_PATTERN.test(value)) {
    return formatDate(value);
  }

  return value;
};

const parseIdList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

const normalizeIdArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "number") {
          return item;
        }
        if (typeof item === "string") {
          return Number(item.trim());
        }
        if (item && typeof item === "object" && "id" in item) {
          return Number((item as { id: unknown }).id);
        }
        return Number.NaN;
      })
      .filter((item) => Number.isFinite(item));
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? [value] : [];
  }

  if (typeof value === "string") {
    return parseIdList(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    const parsed = Number((value as { id: unknown }).id);
    return Number.isFinite(parsed) ? [parsed] : [];
  }

  return [];
};

const toTableValue = (value: unknown, fieldType?: FieldType, fieldName?: string): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Не";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return formatDateByContext(value, fieldType, fieldName);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || item === undefined) {
          return "";
        }
        if (typeof item === "object") {
          const t = item as Record<string, unknown>;
          if ("name_en" in t || "name_bg" in t) {
            return String(t.name_en || t.name_bg || t.id || "");
          }
          if ("id" in t) {
            return String(t.id);
          }
          return JSON.stringify(item);
        }
        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    if (value && "text" in value) {
      return String((value as { text: unknown }).text);
    }
    return JSON.stringify(value);
  }

  return String(value);
};

const toFormValue = (field: FieldDefinition, row: Record<string, unknown> | null): unknown => {
  if (!row) {
    if (field.type === "boolean") {
      return false;
    }
    if (field.type === "richtext") {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
    if (field.type === "file") {
      return null;
    }
    if (field.type === "ids" && field.name === "tags") {
      return [];
    }
    if (field.name === "sender_type") {
      return "operator";
    }
    return "";
  }

  const rawValue = row[field.name];

  if (field.type === "boolean") {
    return Boolean(rawValue);
  }

  if (field.type === "ids") {
    if (field.name === "tags") {
      return normalizeIdArray(rawValue);
    }

    if (Array.isArray(rawValue)) {
      return rawValue
        .map((item) => {
          if (typeof item === "number") {
            return String(item);
          }
          if (typeof item === "object" && item && "id" in item) {
            return String((item as { id: unknown }).id);
          }
          return String(item);
        })
        .join(", ");
    }
    return typeof rawValue === "string" ? rawValue : "";
  }

  if (field.type === "file") {
    return null;
  }

  if (field.type === "richtext") {
    if (rawValue && typeof rawValue === "object") {
      return rawValue;
    }
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  if (rawValue === null || rawValue === undefined) {
    return "";
  }

  return String(rawValue);
};

const buildInitialFormValues = (
  definition: ResourceDefinition,
  row: Record<string, unknown> | null,
): FormValues => {
  const values: FormValues = {};
  for (const field of definition.fields) {
    values[field.name] = toFormValue(field, row);
  }
  return values;
};

const buildPayloadFromForm = (definition: ResourceDefinition, formValues: FormValues) => {
  const payload: AdminPayload = {};
  const files: Record<string, File | null> = {};

  for (const field of definition.fields) {
    if (field.readOnly) {
      continue;
    }

    const rawValue = formValues[field.name];

    if (field.type === "file") {
      if (rawValue instanceof File) {
        files[field.name] = rawValue;
      }
      continue;
    }

    if (field.type === "boolean") {
      payload[field.name] = Boolean(rawValue);
      continue;
    }

    if (field.type === "number") {
      const text = typeof rawValue === "string" ? rawValue.trim() : String(rawValue ?? "").trim();
      if (!text) {
        if (field.nullable) {
          payload[field.name] = null;
        }
        continue;
      }
      const parsed = Number(text);
      if (!Number.isNaN(parsed)) {
        payload[field.name] = parsed;
      }
      continue;
    }

    if (field.type === "ids") {
      payload[field.name] = normalizeIdArray(rawValue);
      continue;
    }

    if (field.type === "richtext") {
      if (rawValue && typeof rawValue === "object") {
        payload[field.name] = rawValue;
      } else {
        payload[field.name] = { type: "doc", content: [{ type: "paragraph" }] };
      }
      continue;
    }

    const text = typeof rawValue === "string" ? rawValue : String(rawValue ?? "");
    const trimmed = text.trim();

    if (!trimmed) {
      if (field.nullable) {
        payload[field.name] = null;
      } else if (field.required) {
        payload[field.name] = "";
      }
      continue;
    }

    payload[field.name] = trimmed;
  }

  return { payload, files };
};

interface CourseAudienceCardForm {
  id?: number;
  order: number;
  title_en: string;
  title_bg: string;
  text_en: string;
  text_bg: string;
}

interface CourseInstrumentForm {
  id?: number;
  order: number;
  name_en: string;
  name_bg: string;
  iconFile: File | null;
  iconUrl: string | null;
}

interface CourseOutcomeForm {
  id?: number;
  order: number;
  text_en: string;
  text_bg: string;
}

interface CourseModuleForm {
  id?: number;
  order: number;
  title_en: string;
  title_bg: string;
  descriptions_en: string;
  descriptions_bg: string;
}

const toFiniteNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toText = (value: unknown) => (typeof value === "string" ? value : "");

const toNullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const getTagDisplayName = (tag: TagOption) => {
  const primary = tag.name_bg.trim();
  const fallback = tag.name_en.trim();

  return primary || fallback || `#${tag.id}`;
};

const sortTagOptions = (tags: TagOption[]) => {
  const locale = "bg";

  return [...tags].sort((left, right) =>
    getTagDisplayName(left).localeCompare(getTagDisplayName(right), locale, {
      sensitivity: "base",
    }),
  );
};

const toTagOptions = (rows: Array<Record<string, unknown>>): TagOption[] => {
  const mapped = rows
    .map((row) => {
      const id = toFiniteNumber(row.id);
      if (id === null) {
        return null;
      }

      return {
        id,
        name_en: toText(row.name_en).trim(),
        name_bg: toText(row.name_bg).trim(),
      } as TagOption;
    })
    .filter((item): item is TagOption => item !== null);

  return sortTagOptions(mapped);
};

const splitNonEmptyLines = (value: string) =>
  value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);

const createAudienceCard = (order: number): CourseAudienceCardForm => ({
  order,
  title_en: "",
  title_bg: "",
  text_en: "",
  text_bg: "",
});

const createOutcome = (order: number): CourseOutcomeForm => ({
  order,
  text_en: "",
  text_bg: "",
});

const createInstrument = (order: number): CourseInstrumentForm => ({
  order,
  name_en: "",
  name_bg: "",
  iconFile: null,
  iconUrl: null,
});

const createModule = (order: number): CourseModuleForm => ({
  order,
  title_en: "",
  title_bg: "",
  descriptions_en: "",
  descriptions_bg: "",
});

const buildDefaultAudienceCards = () =>
  Array.from({ length: 4 }, (_item, index) => createAudienceCard(index + 1));

const buildDefaultOutcomes = () =>
  Array.from({ length: 6 }, (_item, index) => createOutcome(index + 1));

const normalizeOrders = <T extends { order: number }>(items: T[]) =>
  items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));

const isCourseTab = (definition: ResourceDefinition | null) => definition?.key === "courses";

const REQUEST_RESOURCE_KEYS: AdminResourceKey[] = ["consultations", "event-requests", "orders"];
const REQUEST_RESOURCE_KEY_SET = new Set<AdminResourceKey>(REQUEST_RESOURCE_KEYS);

const isRequestTab = (definition: ResourceDefinition | null): definition is ResourceDefinition =>
  Boolean(definition && REQUEST_RESOURCE_KEY_SET.has(definition.key));

const COURSE_FIELD_GROUPS = {
  main: [
    "slug",
    "type",
    "audience",
    "start",
    "price",
    "monthly_installment_price",
    "visits_per_week",
    "is_active",
    "tags",
  ],
  title: [
    "title_en",
    "title_bg",
    "description_en",
    "description_bg",
    "duration_en",
    "duration_bg",
    "image",
  ],
  about: [
    "about_title_en",
    "about_title_bg",
    "about_description_top_en",
    "about_description_top_bg",
    "about_description_bottom_en",
    "about_description_bottom_bg",
    "about_image",
    "audience_image",
  ],
  payments: ["stripe_product_id", "stripe_price_id"],
} as const;

const buildResourceDefinitions = (lang: Lang): ResourceDefinition[] => {
  const t = (key: string, subKey?: string) => getAdminTranslation(lang, key, subKey);
  
  const courseTypeOpts: FieldOption[] = [
    { value: "hybrid", label: t("courseTypes", "hybrid") },
    { value: "online", label: t("courseTypes", "online") },
    { value: "offline", label: t("courseTypes", "offline") },
  ];

  const audienceOpts: FieldOption[] = [
    { value: "adults", label: t("audience", "adults") },
    { value: "kids", label: t("audience", "kids") },
  ];

  const eventTypeOpts: FieldOption[] = [
    { value: "online", label: t("eventTypes", "online") },
    { value: "offline", label: t("eventTypes", "offline") },
    { value: "hybrid", label: t("eventTypes", "hybrid") },
  ];

  return [
    {
      key: "tags",
      title: t("resources.tags.title"),
      description: t("resources.tags.description"),
      columns: ["id", "name_en", "name_bg"],
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "name_en", label: t("fieldLabels", "name_en"), type: "text" },
        { name: "name_bg", label: t("fieldLabels", "name_bg"), type: "text" },
      ],
    },
    {
      key: "courses",
      title: t("resources.courses.title"),
      description: t("resources.courses.description"),
      columns: ["id", "slug", "title_en", "type", "price", "is_active"],
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "slug", label: t("fieldLabels", "slug"), type: "text", required: true },
        { name: "title_en", label: t("fieldLabels", "title_en"), type: "text" },
        { name: "title_bg", label: t("fieldLabels", "title_bg"), type: "text" },
        { name: "start", label: t("fieldLabels", "start"), type: "date", required: true },
        { name: "type", label: t("fieldLabels", "course-type"), type: "select", options: courseTypeOpts, required: true },
        { name: "audience", label: t("fieldLabels", "audience"), type: "select", options: audienceOpts, nullable: true },
        { name: "price", label: t("fieldLabels", "price"), type: "number", required: true },
        { name: "monthly_installment_price", label: t("fieldLabels", "monthly_installment_price"), type: "number", nullable: true },
        { name: "visits_per_week", label: t("fieldLabels", "visits_per_week"), type: "number", nullable: true },
        { name: "is_active", label: t("fieldLabels", "is_active"), type: "boolean" },
        { name: "stripe_product_id", label: t("fieldLabels", "stripe_product_id"), type: "text", required: true },
        { name: "tags", label: t("fieldLabels", "tags"), type: "ids", placeholder: t("placeholders", "tag-ids") },
        { name: "description_en", label: t("fieldLabels", "description_en"), type: "textarea" },
        { name: "description_bg", label: t("fieldLabels", "description_bg"), type: "textarea" },
        { name: "duration_en", label: t("fieldLabels", "duration_en"), type: "text" },
        { name: "duration_bg", label: t("fieldLabels", "duration_bg"), type: "text" },
        { name: "about_title_en", label: t("fieldLabels", "about_title_en"), type: "text" },
        { name: "about_title_bg", label: t("fieldLabels", "about_title_bg"), type: "text" },
        { name: "about_description_top_en", label: t("fieldLabels", "about_description_top_en"), type: "textarea" },
        { name: "about_description_top_bg", label: t("fieldLabels", "about_description_top_bg"), type: "textarea" },
        { name: "about_description_bottom_en", label: t("fieldLabels", "about_description_bottom_en"), type: "textarea" },
        { name: "about_description_bottom_bg", label: t("fieldLabels", "about_description_bottom_bg"), type: "textarea" },
        { name: "image", label: t("fieldLabels", "image"), type: "file" },
        { name: "about_image", label: t("fieldLabels", "about_image"), type: "file" },
        { name: "audience_image", label: t("fieldLabels", "audience_image"), type: "file" },
      ],
    },
    {
      key: "events",
      title: t("resources.events.title"),
      description: t("resources.events.description"),
      columns: ["id", "title_en", "date", "type"],
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "title_en", label: t("fieldLabels", "title_en"), type: "text" },
        { name: "title_bg", label: t("fieldLabels", "title_bg"), type: "text" },
        { name: "description_en", label: t("fieldLabels", "description_en"), type: "textarea" },
        { name: "description_bg", label: t("fieldLabels", "description_bg"), type: "textarea" },
        { name: "date", label: t("fieldLabels", "date"), type: "date", required: true },
        { name: "type", label: t("fieldLabels", "type"), type: "select", options: eventTypeOpts, required: true },
        { name: "tags", label: t("fieldLabels", "tags"), type: "ids", placeholder: t("placeholders", "tag-ids") },
        { name: "image", label: t("fieldLabels", "image"), type: "file" },
        { name: "image_2", label: t("fieldLabels", "image_2"), type: "file" },
      ],
    },
    {
      key: "posts",
      title: t("resources.posts.title"),
      description: t("resources.posts.description"),
      columns: ["id", "slug", "title_en", "author", "created_at"],
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "slug", label: t("fieldLabels", "slug"), type: "text", required: true },
        { name: "title_en", label: t("fieldLabels", "title_en"), type: "text" },
        { name: "title_bg", label: t("fieldLabels", "title_bg"), type: "text" },
        { name: "author", label: t("fieldLabels", "author"), type: "text", required: true },
        { name: "content_en", label: t("fieldLabels", "content_en"), type: "textarea" },
        { name: "content_bg", label: t("fieldLabels", "content_bg"), type: "textarea" },
        { name: "tags", label: t("fieldLabels", "tags"), type: "ids", placeholder: t("placeholders", "tag-ids") },
        { name: "picture", label: t("fieldLabels", "picture"), type: "file" },
        { name: "created_at", label: t("fieldLabels", "created_at"), type: "datetime" },
      ],
    },
    {
      key: "projects",
      title: t("resources.projects.title"),
      description: t("resources.projects.description"),
      columns: ["id", "slug", "title_en", "is_active", "created_at"],
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "slug", label: t("fieldLabels", "slug"), type: "text", required: true },
        { name: "title_en", label: t("fieldLabels", "title_en"), type: "text" },
        { name: "title_bg", label: t("fieldLabels", "title_bg"), type: "text" },
        { name: "excerpt_en", label: t("fieldLabels", "excerpt_en"), type: "textarea" },
        { name: "excerpt_bg", label: t("fieldLabels", "excerpt_bg"), type: "textarea" },
        { name: "content_en", label: t("fieldLabels", "content_en"), type: "richtext" },
        { name: "content_bg", label: t("fieldLabels", "content_bg"), type: "richtext" },
        { name: "cover_image", label: t("fieldLabels", "cover_image"), type: "file" },
        { name: "is_active", label: t("fieldLabels", "is_active"), type: "boolean" },
        { name: "created_at", label: t("fieldLabels", "created_at"), type: "datetime" },
      ],
    },
    {
      key: "consultations",
      title: t("resources.consultations.title"),
      description: t("resources.consultations.description"),
      columns: ["id", "name", "email", "phone", "interested", "created_at"],
      readOnly: true,
      allowDelete: false,
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "name", label: t("fieldLabels", "name"), type: "text", readOnly: true },
        { name: "email", label: t("fieldLabels", "email"), type: "text", readOnly: true },
        { name: "phone", label: t("fieldLabels", "phone"), type: "text", readOnly: true },
        { name: "interested", label: t("fieldLabels", "interested"), type: "text", readOnly: true },
        { name: "created_at", label: t("fieldLabels", "created_at"), type: "datetime", readOnly: true },
      ],
    },
    {
      key: "event-requests",
      title: t("resources.event-requests.title"),
      description: t("resources.event-requests.description"),
      columns: ["id", "name", "email", "phone", "interested", "created_at"],
      readOnly: true,
      allowDelete: false,
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "name", label: t("fieldLabels", "name"), type: "text", readOnly: true },
        { name: "email", label: t("fieldLabels", "email"), type: "text", readOnly: true },
        { name: "phone", label: t("fieldLabels", "phone"), type: "text", readOnly: true },
        { name: "interested", label: t("fieldLabels", "interested"), type: "text", readOnly: true },
        { name: "created_at", label: t("fieldLabels", "created_at"), type: "datetime", readOnly: true },
      ],
    },
    {
      key: "orders",
      title: t("resources.orders.title"),
      description: t("resources.orders.description"),
      columns: ["id", "status", "total_amount", "created_at", "paid_at"],
      readOnly: true,
      allowDelete: false,
      fields: [
        { name: "id", label: t("fieldLabels", "id"), type: "number", readOnly: true },
        { name: "status", label: t("fieldLabels", "status"), type: "boolean", readOnly: true },
        { name: "total_amount", label: t("fieldLabels", "total_amount"), type: "number", readOnly: true },
        { name: "stripe_payment_intent_id", label: t("fieldLabels", "stripe_payment_intent_id"), type: "text", readOnly: true },
        { name: "stripe_checkout_session_id", label: t("fieldLabels", "stripe_checkout_session_id"), type: "text", readOnly: true },
        { name: "created_at", label: t("fieldLabels", "created_at"), type: "datetime", readOnly: true },
        { name: "paid_at", label: t("fieldLabels", "paid_at"), type: "datetime", readOnly: true },
      ],
    },
  ];
};

const NAV_GROUPS: Array<{ label: string; tabs: DashboardTab[] }> = [
  { label: "ui.main", tabs: ["operator-chat"] },
  { label: "ui.content", tabs: ["tags", "courses", "events", "posts", "projects"] },
  { label: "ui.requests", tabs: ["consultations", "event-requests", "orders"] },
];

const getTabLabel = (tab: DashboardTab, definitions: ResourceDefinition[], lang: Lang) => {
  const t = (key: string) => getAdminTranslation(lang, key);
  if (tab === "operator-chat") {
    return t("ui.operator-chat");
  }
  const definition = definitions.find((item) => item.key === tab);
  return definition?.title ?? tab;
};

interface AdminDashboardProps {
  lang: Lang;
}

export function AdminDashboard({ lang }: AdminDashboardProps) {
  const router = useRouter();

  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized">("checking");
  const [user, setUser] = useState<AdminUser | null>(null);

  const [activeTab, setActiveTab] = useState<DashboardTab>("courses");

  const [resourceRows, setResourceRows] = useState<Array<Record<string, unknown>>>([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [courseAudienceCards, setCourseAudienceCards] = useState<CourseAudienceCardForm[]>(
    buildDefaultAudienceCards,
  );
  const [courseInstruments, setCourseInstruments] = useState<CourseInstrumentForm[]>([
    createInstrument(1),
  ]);
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcomeForm[]>(buildDefaultOutcomes);
  const [courseModules, setCourseModules] = useState<CourseModuleForm[]>([createModule(1)]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [pendingTagId, setPendingTagId] = useState("");

  const [chatSessions, setChatSessions] = useState<AdminChatSession[]>([]);
  const [chatSessionsError, setChatSessionsError] = useState<string | null>(null);
  const [chatSessionsLoading, setChatSessionsLoading] = useState(false);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [chatMessagesBySession, setChatMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [chatUnreadBySession, setChatUnreadBySession] = useState<Record<string, number>>({});
  const [chatDraft, setChatDraft] = useState("");
  const [chatSendError, setChatSendError] = useState<string | null>(null);
  const [chatSendPending, setChatSendPending] = useState(false);
  const [chatConnectionStatus, setChatConnectionStatus] = useState<ConnectionState>("idle");
  const [chatConnectionError, setChatConnectionError] = useState<string | null>(null);

  const RESOURCE_DEFINITIONS = useMemo(() => buildResourceDefinitions(lang), [lang]);

  const RESOURCE_KEY_SET = useMemo(
    () => new Set<AdminResourceKey>(RESOURCE_DEFINITIONS.map((item) => item.key)),
    [RESOURCE_DEFINITIONS],
  );

  const isResourceTab = useCallback(
    (tab: DashboardTab): tab is AdminResourceKey => RESOURCE_KEY_SET.has(tab as AdminResourceKey),
    [RESOURCE_KEY_SET],
  );

  const currentDefinition = useMemo(() => {
    if (!isResourceTab(activeTab)) {
      return null;
    }
    return RESOURCE_DEFINITIONS.find((item) => item.key === activeTab) ?? null;
  }, [activeTab, isResourceTab, RESOURCE_DEFINITIONS]);

  const selectedChatSessionRef = useRef<string | null>(null);
  const chatMessagesRef = useRef<Record<string, ChatMessage[]>>({});
  const activeTabRef = useRef<DashboardTab>("courses");

  useEffect(() => {
    selectedChatSessionRef.current = selectedChatSessionId;
  }, [selectedChatSessionId]);

  useEffect(() => {
    chatMessagesRef.current = chatMessagesBySession;
  }, [chatMessagesBySession]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    setPendingTagId("");
  }, [activeTab, selectedRow]);

  const resetCourseComposition = useCallback(() => {
    setCourseAudienceCards(buildDefaultAudienceCards());
    setCourseInstruments([createInstrument(1)]);
    setCourseOutcomes(buildDefaultOutcomes());
    setCourseModules([createModule(1)]);
  }, []);

  const loadResource = useCallback(async (definition: ResourceDefinition) => {
    setResourceLoading(true);
    setResourceError(null);

    try {
      let rows = await listAdminResource<Record<string, unknown>>(definition.key);

      if (definition.key === "consultations") {
        const courses = await listAdminResource<Record<string, unknown>>("courses");
        const courseTitleById = new Map<number, string>();

        for (const course of courses) {
          const courseId = toFiniteNumber(course.id);
          if (courseId === null) {
            continue;
          }

          const titleEn = typeof course.title_en === "string" ? course.title_en.trim() : "";
          const titleBg = typeof course.title_bg === "string" ? course.title_bg.trim() : "";
          const slug = typeof course.slug === "string" ? course.slug.trim() : "";
          courseTitleById.set(courseId, titleEn || titleBg || slug || `Course #${courseId}`);
        }

        rows = rows.map((row) => {
          const interestedId = toFiniteNumber(row.interested);
          if (interestedId === null) {
            return row;
          }

          return {
            ...row,
            interested: courseTitleById.get(interestedId) || `Course #${interestedId}`,
          };
        });
      }

      if (definition.key === "event-requests") {
        const events = await listAdminResource<Record<string, unknown>>("events");
        const eventTitleById = new Map<number, string>();

        for (const eventItem of events) {
          const eventId = toFiniteNumber(eventItem.id);
          if (eventId === null) {
            continue;
          }

          const titleEn = typeof eventItem.title_en === "string" ? eventItem.title_en.trim() : "";
          const titleBg = typeof eventItem.title_bg === "string" ? eventItem.title_bg.trim() : "";
          eventTitleById.set(eventId, titleEn || titleBg || `Event #${eventId}`);
        }

        rows = rows.map((row) => {
          const interestedId = toFiniteNumber(row.interested);
          if (interestedId === null) {
            return row;
          }

          return {
            ...row,
            interested: eventTitleById.get(interestedId) || `Event #${interestedId}`,
          };
        });
      }

      setResourceRows(rows);
      setResourceError(null);
      setSelectedRow(null);
      setFormValues(buildInitialFormValues(definition, null));
      setFormError(null);
      if (isCourseTab(definition)) {
        resetCourseComposition();
      }
    } catch (error) {
      setResourceRows([]);
      setResourceError(error instanceof Error ? error.message : "Failed to load resource.");
    } finally {
      setResourceLoading(false);
    }
  }, [resetCourseComposition]);

  const loadChatSessions = useCallback(async () => {
    setChatSessionsLoading(true);
    setChatSessionsError(null);

    try {
      const sessions = await listAdminChatSessions();
      setChatSessions(sessions);
      setChatSessionsError(null);

      setSelectedChatSessionId((current: string | null) => {
        if (current && sessions.some((item) => item.id === current)) {
          return current;
        }
        return sessions.length > 0 ? sessions[0].id : null;
      });
    } catch (error) {
      setChatSessionsError(error instanceof Error ? error.message : "Failed to load chat sessions.");
    } finally {
      setChatSessionsLoading(false);
    }
  }, []);

  const loadTagOptions = useCallback(async () => {
    setTagsLoading(true);

    try {
      const rows = await listAdminResource<Record<string, unknown>>("tags");
      setAvailableTags(toTagOptions(rows));
    } catch {
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  const loadSelectedSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const messages = await listAdminSessionMessages(sessionId);
      setChatMessagesBySession((current: Record<string, ChatMessage[]>) => ({
        ...current,
        [sessionId]: sortMessages(messages),
      }));
      setChatUnreadBySession((current: Record<string, number>) => ({
        ...current,
        [sessionId]: 0,
      }));
    } catch (error) {
      setChatSendError(error instanceof Error ? error.message : "Failed to load session messages.");
    }
  }, []);

  const loadCourseComposition = useCallback(
    async (courseIdValue: unknown) => {
      const courseId = toFiniteNumber(courseIdValue);
      if (courseId === null) {
        resetCourseComposition();
        return;
      }

      try {
        const [audienceRows, instrumentRows, outcomeRows, moduleRows, descriptionRows] = await Promise.all([
          listAdminResource<Record<string, unknown>>("course-audience-tag-cards"),
          listAdminResource<Record<string, unknown>>("course-instruments"),
          listAdminResource<Record<string, unknown>>("course-outcomes"),
          listAdminResource<Record<string, unknown>>("course-modules"),
          listAdminResource<Record<string, unknown>>("course-module-descriptions"),
        ]);

        const audience = audienceRows
          .map((row) => {
            const id = toFiniteNumber(row.id);
            const rowCourseId = toFiniteNumber(row.course);
            const order = toFiniteNumber(row.order);
            if (id === null || rowCourseId !== courseId || order === null) {
              return null;
            }
            return {
              id,
              order,
              title_en: toText(row.title_en),
              title_bg: toText(row.title_bg),
              text_en: toText(row.text_en),
              text_bg: toText(row.text_bg),
            } as CourseAudienceCardForm;
          })
          .filter((item): item is CourseAudienceCardForm => item !== null)
          .sort((left, right) => left.order - right.order)
          .slice(0, 4);

        while (audience.length < 4) {
          audience.push(createAudienceCard(audience.length + 1));
        }

        const outcomes = outcomeRows
          .map((row) => {
            const id = toFiniteNumber(row.id);
            const rowCourseId = toFiniteNumber(row.course);
            const order = toFiniteNumber(row.order);
            if (id === null || rowCourseId !== courseId || order === null) {
              return null;
            }
            return {
              id,
              order,
              text_en: toText(row.text_en),
              text_bg: toText(row.text_bg),
            } as CourseOutcomeForm;
          })
          .filter((item): item is CourseOutcomeForm => item !== null)
          .sort((left, right) => left.order - right.order)
          .slice(0, 6);

        while (outcomes.length < 6) {
          outcomes.push(createOutcome(outcomes.length + 1));
        }

        const instruments = instrumentRows
          .map((row) => {
            const id = toFiniteNumber(row.id);
            const rowCourseId = toFiniteNumber(row.course);
            const order = toFiniteNumber(row.order);
            if (id === null || rowCourseId !== courseId || order === null) {
              return null;
            }
            return {
              id,
              order,
              name_en: toText(row.name_en),
              name_bg: toText(row.name_bg),
              iconFile: null,
              iconUrl: typeof row.icon === "string" ? row.icon : null,
            } as CourseInstrumentForm;
          })
          .filter((item): item is CourseInstrumentForm => item !== null)
          .sort((left, right) => left.order - right.order);

        const moduleDescriptionsByModule = new Map<number, Array<Record<string, unknown>>>();
        for (const row of descriptionRows) {
          const moduleId = toFiniteNumber(row.module);
          if (moduleId === null) {
            continue;
          }
          const current = moduleDescriptionsByModule.get(moduleId) || [];
          current.push(row);
          moduleDescriptionsByModule.set(moduleId, current);
        }

        const modules = moduleRows
          .map((row) => {
            const id = toFiniteNumber(row.id);
            const rowCourseId = toFiniteNumber(row.course);
            const order = toFiniteNumber(row.order);
            if (id === null || rowCourseId !== courseId || order === null) {
              return null;
            }

            const descriptionRowsForModule = (moduleDescriptionsByModule.get(id) || [])
              .map((descriptionRow) => {
                const rowOrder = toFiniteNumber(descriptionRow.order);
                return {
                  order: rowOrder ?? 0,
                  text_en: toText(descriptionRow.text_en),
                  text_bg: toText(descriptionRow.text_bg),
                };
              })
              .sort((left, right) => left.order - right.order);

            return {
              id,
              order,
              title_en: toText(row.title_en),
              title_bg: toText(row.title_bg),
              descriptions_en: descriptionRowsForModule
                .map((item) => item.text_en)
                .filter(Boolean)
                .join("\n"),
              descriptions_bg: descriptionRowsForModule
                .map((item) => item.text_bg)
                .filter(Boolean)
                .join("\n"),
            } as CourseModuleForm;
          })
          .filter((item): item is CourseModuleForm => item !== null)
          .sort((left, right) => left.order - right.order);

        setCourseAudienceCards(normalizeOrders(audience));
        setCourseOutcomes(normalizeOrders(outcomes));
        setCourseInstruments(instruments.length > 0 ? normalizeOrders(instruments) : [createInstrument(1)]);
        setCourseModules(modules.length > 0 ? normalizeOrders(modules) : [createModule(1)]);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Failed to load course inline blocks.");
        resetCourseComposition();
      }
    },
    [resetCourseComposition],
  );

  const updateCourseAudienceCard = useCallback(
    <K extends keyof CourseAudienceCardForm>(index: number, key: K, value: CourseAudienceCardForm[K]) => {
      setCourseAudienceCards((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  const updateCourseOutcome = useCallback(
    <K extends keyof CourseOutcomeForm>(index: number, key: K, value: CourseOutcomeForm[K]) => {
      setCourseOutcomes((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  const updateCourseInstrument = useCallback(
    <K extends keyof CourseInstrumentForm>(
      index: number,
      key: K,
      value: CourseInstrumentForm[K],
    ) => {
      setCourseInstruments((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  const updateCourseModule = useCallback(
    <K extends keyof CourseModuleForm>(index: number, key: K, value: CourseModuleForm[K]) => {
      setCourseModules((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  const addCourseInstrument = useCallback(() => {
    setCourseInstruments((current) => [...normalizeOrders(current), createInstrument(current.length + 1)]);
  }, []);

  const removeCourseInstrument = useCallback((index: number) => {
    setCourseInstruments((current) => {
      const next = current.filter((_item, currentIndex) => currentIndex !== index);
      if (next.length === 0) {
        return [createInstrument(1)];
      }
      return normalizeOrders(next);
    });
  }, []);

  const addCourseModule = useCallback(() => {
    setCourseModules((current) => [...normalizeOrders(current), createModule(current.length + 1)]);
  }, []);

  const removeCourseModule = useCallback((index: number) => {
    setCourseModules((current) => {
      const next = current.filter((_item, currentIndex) => currentIndex !== index);
      if (next.length === 0) {
        return [createModule(1)];
      }
      return normalizeOrders(next);
    });
  }, []);

  const syncCourseComposition = useCallback(async (courseId: number) => {
    const [audienceRows, instrumentRows, outcomeRows, moduleRows, descriptionRows] = await Promise.all([
      listAdminResource<Record<string, unknown>>("course-audience-tag-cards"),
      listAdminResource<Record<string, unknown>>("course-instruments"),
      listAdminResource<Record<string, unknown>>("course-outcomes"),
      listAdminResource<Record<string, unknown>>("course-modules"),
      listAdminResource<Record<string, unknown>>("course-module-descriptions"),
    ]);

    const existingAudienceRows = audienceRows
      .map((row) => ({
        id: toFiniteNumber(row.id),
        order: toFiniteNumber(row.order),
        course: toFiniteNumber(row.course),
      }))
      .filter(
        (row): row is { id: number; order: number; course: number } =>
          row.id !== null && row.order !== null && row.course === courseId,
      );

    const existingOutcomeRows = outcomeRows
      .map((row) => ({
        id: toFiniteNumber(row.id),
        order: toFiniteNumber(row.order),
        course: toFiniteNumber(row.course),
      }))
      .filter(
        (row): row is { id: number; order: number; course: number } =>
          row.id !== null && row.order !== null && row.course === courseId,
      );

    const existingInstrumentRows = instrumentRows
      .map((row) => ({
        id: toFiniteNumber(row.id),
        order: toFiniteNumber(row.order),
        course: toFiniteNumber(row.course),
      }))
      .filter(
        (row): row is { id: number; order: number; course: number } =>
          row.id !== null && row.order !== null && row.course === courseId,
      );

    const existingModuleRows = moduleRows
      .map((row) => ({
        id: toFiniteNumber(row.id),
        order: toFiniteNumber(row.order),
        course: toFiniteNumber(row.course),
      }))
      .filter(
        (row): row is { id: number; order: number; course: number } =>
          row.id !== null && row.order !== null && row.course === courseId,
      );

    const existingDescriptionRows = descriptionRows
      .map((row) => ({
        id: toFiniteNumber(row.id),
        moduleId: toFiniteNumber(row.module),
      }))
      .filter(
        (row): row is { id: number; moduleId: number } => row.id !== null && row.moduleId !== null,
      );

    const usedAudienceIds = new Set<number>();
    const normalizedAudienceCards = normalizeOrders(courseAudienceCards).slice(0, 4);
    for (const [index, audienceCard] of normalizedAudienceCards.entries()) {
      const order = index + 1;
      const fallback = existingAudienceRows.find(
        (row) => row.order === order && !usedAudienceIds.has(row.id),
      );
      const targetId = audienceCard.id ?? fallback?.id;
      const payload = {
        course: courseId,
        order,
        title_en: toNullableText(audienceCard.title_en),
        title_bg: toNullableText(audienceCard.title_bg),
        text_en: toNullableText(audienceCard.text_en),
        text_bg: toNullableText(audienceCard.text_bg),
      };

      if (targetId !== undefined) {
        await updateAdminResource("course-audience-tag-cards", targetId, payload);
        usedAudienceIds.add(targetId);
      } else {
        const created = await createAdminResource<Record<string, unknown>>(
          "course-audience-tag-cards",
          payload,
        );
        const createdId = toFiniteNumber(created.id);
        if (createdId !== null) {
          usedAudienceIds.add(createdId);
        }
      }
    }

    for (const existingRow of existingAudienceRows) {
      if (!usedAudienceIds.has(existingRow.id)) {
        await deleteAdminResource("course-audience-tag-cards", existingRow.id);
      }
    }

    const usedOutcomeIds = new Set<number>();
    const normalizedOutcomes = normalizeOrders(courseOutcomes).slice(0, 6);
    for (const [index, outcome] of normalizedOutcomes.entries()) {
      const order = index + 1;
      const fallback = existingOutcomeRows.find((row) => row.order === order && !usedOutcomeIds.has(row.id));
      const targetId = outcome.id ?? fallback?.id;
      const payload = {
        course: courseId,
        order,
        text_en: toNullableText(outcome.text_en),
        text_bg: toNullableText(outcome.text_bg),
      };

      if (targetId !== undefined) {
        await updateAdminResource("course-outcomes", targetId, payload);
        usedOutcomeIds.add(targetId);
      } else {
        const created = await createAdminResource<Record<string, unknown>>("course-outcomes", payload);
        const createdId = toFiniteNumber(created.id);
        if (createdId !== null) {
          usedOutcomeIds.add(createdId);
        }
      }
    }

    for (const existingRow of existingOutcomeRows) {
      if (!usedOutcomeIds.has(existingRow.id)) {
        await deleteAdminResource("course-outcomes", existingRow.id);
      }
    }

    const usedInstrumentIds = new Set<number>();
    const normalizedInstruments = normalizeOrders(courseInstruments).filter((instrument) => {
      if (instrument.id !== undefined) {
        return true;
      }
      return Boolean(
        instrument.name_en.trim() || instrument.name_bg.trim() || instrument.iconFile instanceof File,
      );
    });

    for (const [index, instrument] of normalizedInstruments.entries()) {
      const order = index + 1;
      const payload = {
        course: courseId,
        order,
        name_en: toNullableText(instrument.name_en),
        name_bg: toNullableText(instrument.name_bg),
      };
      const files = instrument.iconFile instanceof File ? { icon: instrument.iconFile } : undefined;

      if (instrument.id !== undefined) {
        await updateAdminResource("course-instruments", instrument.id, payload, files);
        usedInstrumentIds.add(instrument.id);
      } else {
        const created = await createAdminResource<Record<string, unknown>>("course-instruments", payload, files);
        const createdId = toFiniteNumber(created.id);
        if (createdId !== null) {
          usedInstrumentIds.add(createdId);
        }
      }
    }

    for (const existingRow of existingInstrumentRows) {
      if (!usedInstrumentIds.has(existingRow.id)) {
        await deleteAdminResource("course-instruments", existingRow.id);
      }
    }

    const usedModuleIds = new Set<number>();
    const normalizedModules = normalizeOrders(courseModules).filter((module) => {
      if (module.id !== undefined) {
        return true;
      }
      return Boolean(
        module.title_en.trim() ||
          module.title_bg.trim() ||
          module.descriptions_en.trim() ||
          module.descriptions_bg.trim(),
      );
    });

    for (const [index, module] of normalizedModules.entries()) {
      const order = index + 1;
      const payload = {
        course: courseId,
        order,
        title_en: toNullableText(module.title_en),
        title_bg: toNullableText(module.title_bg),
      };

      let moduleId: number;
      if (module.id !== undefined) {
        await updateAdminResource("course-modules", module.id, payload);
        moduleId = module.id;
      } else {
        const created = await createAdminResource<Record<string, unknown>>("course-modules", payload);
        const createdId = toFiniteNumber(created.id);
        if (createdId === null) {
          throw new Error("Unable to create course module.");
        }
        moduleId = createdId;
      }

      usedModuleIds.add(moduleId);

      const existingRows = existingDescriptionRows.filter((row) => row.moduleId === moduleId);
      for (const existingRow of existingRows) {
        await deleteAdminResource("course-module-descriptions", existingRow.id);
      }

      const linesEn = splitNonEmptyLines(module.descriptions_en);
      const linesBg = splitNonEmptyLines(module.descriptions_bg);
      const rowsCount = Math.max(linesEn.length, linesBg.length);

      for (let lineIndex = 0; lineIndex < rowsCount; lineIndex += 1) {
        await createAdminResource("course-module-descriptions", {
          module: moduleId,
          order: lineIndex + 1,
          text_en: linesEn[lineIndex] ?? null,
          text_bg: linesBg[lineIndex] ?? null,
        });
      }
    }

    for (const existingRow of existingModuleRows) {
      if (!usedModuleIds.has(existingRow.id)) {
        await deleteAdminResource("course-modules", existingRow.id);
      }
    }
  }, [courseAudienceCards, courseInstruments, courseModules, courseOutcomes]);

  useEffect(() => {
    let isDisposed = false;

    const bootstrap = async () => {
      try {
        const authPayload = await adminMe();
        if (isDisposed) {
          return;
        }

        setUser(authPayload.user);
        setAuthState("authorized");
        await loadChatSessions();
      } catch {
        if (isDisposed) {
          return;
        }
        setAuthState("unauthorized");
        router.replace(`/${lang}/admin/login`);
      }
    };

    void bootstrap();

    return () => {
      isDisposed = true;
    };
  }, [lang, loadChatSessions, router]);

  useEffect(() => {
    if (authState !== "authorized") {
      return;
    }

    void loadTagOptions();
  }, [authState, loadTagOptions]);

  useEffect(() => {
    if (currentDefinition?.key !== "tags") {
      return;
    }

    setAvailableTags(toTagOptions(resourceRows));
  }, [currentDefinition, resourceRows]);

  useEffect(() => {
    if (!currentDefinition || authState !== "authorized") {
      return;
    }

    void loadResource(currentDefinition);
  }, [authState, currentDefinition, loadResource]);

  useEffect(() => {
    if (!selectedChatSessionId || authState !== "authorized") {
      return;
    }

    void loadSelectedSessionMessages(selectedChatSessionId);
  }, [authState, loadSelectedSessionMessages, selectedChatSessionId]);

  useEffect(() => {
    if (authState !== "authorized") {
      return;
    }

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (disposed) {
        return;
      }

      setChatConnectionStatus(reconnectAttempts > 0 ? "reconnecting" : "connecting");

      socket = new WebSocket(buildAdminChatWebSocketUrl());

      socket.onopen = () => {
        reconnectAttempts = 0;
        setChatConnectionStatus("connected");
        setChatConnectionError(null);
      };

      socket.onmessage = (event) => {
        let payload: AdminChatSocketEvent;

        try {
          payload = JSON.parse(event.data) as AdminChatSocketEvent;
        } catch {
          setChatConnectionError("Failed to parse websocket event.");
          return;
        }

        if (payload.type === "admin.chat.message") {
          const sessionId = payload.chat_session_id;
          const incomingMessage = payload.message;
          const existingMessages = chatMessagesRef.current[sessionId] || [];
          const isDuplicate = existingMessages.some((item: ChatMessage) => item.id === incomingMessage.id);

          if (isDuplicate) {
            return;
          }

          setChatMessagesBySession((current: Record<string, ChatMessage[]>) => ({
            ...current,
            [sessionId]: mergeMessages(current[sessionId] || [], [incomingMessage]),
          }));

          setChatSessions((current: AdminChatSession[]) => {
            const matched = current.find((item: AdminChatSession) => item.id === sessionId);
            const updatedAt = incomingMessage.created_at;

            if (!matched) {
              const provisional: AdminChatSession = {
                id: sessionId,
                session_key: sessionId,
                is_active: true,
                created_at: updatedAt,
                updated_at: updatedAt,
                messages_count: 1,
                last_message: incomingMessage,
              };
              return [provisional, ...current];
            }

            const updated = current.map((item: AdminChatSession) =>
              item.id === sessionId
                ? {
                    ...item,
                    updated_at: updatedAt,
                    messages_count: item.messages_count + 1,
                    last_message: incomingMessage,
                  }
                : item,
            );

            return [...updated].sort(
              (left, right) =>
                new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
            );
          });

          const isChatTabVisible = activeTabRef.current === "operator-chat";
          const isCurrentSessionOpen = selectedChatSessionRef.current === sessionId;
          const isMessageVisible = isChatTabVisible && isCurrentSessionOpen;
          const shouldCountAsUnread = incomingMessage.sender_type !== "operator" && !isMessageVisible;

          if (shouldCountAsUnread) {
            setChatUnreadBySession((current: Record<string, number>) => ({
              ...current,
              [sessionId]: (current[sessionId] || 0) + 1,
            }));
          } else if (isMessageVisible) {
            setChatUnreadBySession((current: Record<string, number>) => ({
              ...current,
              [sessionId]: 0,
            }));
          }

          return;
        }

        if (payload.type === "chat.error") {
          const detail =
            typeof payload.detail === "string" ? payload.detail : JSON.stringify(payload.detail);
          setChatConnectionError(detail);
          return;
        }
      };

      socket.onerror = () => {
        setChatConnectionError("Admin websocket connection failed.");
      };

      socket.onclose = () => {
        if (disposed) {
          return;
        }

        if (reconnectAttempts >= 5) {
          setChatConnectionStatus("error");
          return;
        }

        reconnectAttempts += 1;
        setChatConnectionStatus("reconnecting");

        reconnectTimer = window.setTimeout(() => {
          connect();
        }, 2500);
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [authState]);

  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    setResourceError(null);
    setFormError(null);
    setChatSendError(null);
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      router.replace(`/${lang}/admin/login`);
    }
  };

  const handleRefreshCurrentResource = async () => {
    if (!currentDefinition) {
      return;
    }
    await loadResource(currentDefinition);
  };

  const handleSelectRow = (row: Record<string, unknown>) => {
    if (!currentDefinition) {
      return;
    }
    setSelectedRow(row);
    setFormValues(buildInitialFormValues(currentDefinition, row));
    setFormError(null);

    if (isCourseTab(currentDefinition)) {
      void loadCourseComposition(row.id);
    }
  };

  const handleResetForm = () => {
    if (!currentDefinition) {
      return;
    }
    setSelectedRow(null);
    setFormValues(buildInitialFormValues(currentDefinition, null));
    setFormError(null);

    if (isCourseTab(currentDefinition)) {
      resetCourseComposition();
    }
  };

  const handleFieldChange = (name: string, value: unknown) => {
    setFormValues((current: FormValues) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentDefinition || currentDefinition.readOnly) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const { payload, files } = buildPayloadFromForm(currentDefinition, formValues);
      const id = selectedRow?.id as string | number | undefined;

      if (isCourseTab(currentDefinition)) {
        let courseId: number;

        if (id !== undefined && id !== null) {
          await updateAdminResource(currentDefinition.key, id, payload, files);
          const parsedId = toFiniteNumber(id);
          if (parsedId === null) {
            throw new Error("Failed to resolve course ID for inline save.");
          }
          courseId = parsedId;
        } else {
          const created = await createAdminResource<Record<string, unknown>>(
            currentDefinition.key,
            payload,
            files,
          );
          const parsedId = toFiniteNumber(created.id);
          if (parsedId === null) {
            throw new Error("Course was created without a valid ID.");
          }
          courseId = parsedId;
        }

        await syncCourseComposition(courseId);
        await handleRefreshCurrentResource();
        setSelectedRow(null);
        setFormValues(buildInitialFormValues(currentDefinition, null));
        resetCourseComposition();
        return;
      }

      if (id !== undefined && id !== null) {
        await updateAdminResource(currentDefinition.key, id, payload, files);
      } else {
        await createAdminResource(currentDefinition.key, payload, files);
      }

      await handleRefreshCurrentResource();
      setSelectedRow(null);
      setFormValues(buildInitialFormValues(currentDefinition, null));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!currentDefinition || currentDefinition.allowDelete === false || currentDefinition.readOnly) {
      return;
    }

    const id = selectedRow?.id;
    if (id === undefined || id === null) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);

    try {
      await deleteAdminResource(currentDefinition.key, id as string | number);
      await handleRefreshCurrentResource();
      setSelectedRow(null);
      setFormValues(buildInitialFormValues(currentDefinition, null));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedChatSession = useMemo(
    () => chatSessions.find((item: AdminChatSession) => item.id === selectedChatSessionId) ?? null,
    [chatSessions, selectedChatSessionId],
  );

  const selectedChatMessages = selectedChatSessionId
    ? chatMessagesBySession[selectedChatSessionId] || []
    : [];

  const totalUnreadMessages = (Object.values(chatUnreadBySession) as number[]).reduce(
    (sum, value) => sum + value,
    0,
  );
  const hasUnreadMessages = totalUnreadMessages > 0;

  const sortedChatSessions = useMemo(
    () =>
      [...chatSessions].sort((left, right) => {
        const leftUnread = chatUnreadBySession[left.id] || 0;
        const rightUnread = chatUnreadBySession[right.id] || 0;

        const leftHasUnread = leftUnread > 0 ? 1 : 0;
        const rightHasUnread = rightUnread > 0 ? 1 : 0;

        if (leftHasUnread !== rightHasUnread) {
          return rightHasUnread - leftHasUnread;
        }

        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
      }),
    [chatSessions, chatUnreadBySession],
  );

  const handleSelectChatSession = (sessionId: string) => {
    setSelectedChatSessionId(sessionId);
    setChatUnreadBySession((current: Record<string, number>) => ({
      ...current,
      [sessionId]: 0,
    }));
    setChatSendError(null);
  };

  const handleSendOperatorMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChatSessionId) {
      return;
    }

    const text = chatDraft.trim();
    if (!text) {
      return;
    }

    setChatSendPending(true);
    setChatSendError(null);

    try {
      const created = await sendAdminOperatorMessage(selectedChatSessionId, text);
      setChatDraft("");

      setChatMessagesBySession((current: Record<string, ChatMessage[]>) => ({
        ...current,
        [selectedChatSessionId]: mergeMessages(current[selectedChatSessionId] || [], [created]),
      }));

      setChatSessions((current: AdminChatSession[]) =>
        [...current]
          .map((item: AdminChatSession) =>
            item.id === selectedChatSessionId
              ? {
                  ...item,
                  updated_at: created.created_at,
                  messages_count: item.messages_count + 1,
                  last_message: created,
                }
              : item,
          )
          .sort(
            (left, right) =>
              new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
          ),
      );

      setChatUnreadBySession((current: Record<string, number>) => ({
        ...current,
        [selectedChatSessionId]: 0,
      }));
    } catch (error) {
      setChatSendError(error instanceof Error ? error.message : "Failed to send operator message.");
    } finally {
      setChatSendPending(false);
    }
  };

  const handleToggleSessionActive = async () => {
    if (!selectedChatSession) {
      return;
    }

    try {
      const updated = await updateAdminResource<AdminChatSession>(
        "chat-sessions",
        selectedChatSession.id,
        { is_active: !selectedChatSession.is_active },
      );

      setChatSessions((current: AdminChatSession[]) =>
        current.map((item: AdminChatSession) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
    } catch (error) {
      setChatSendError(
        error instanceof Error ? error.message : "Failed to update chat session state.",
      );
    }
  };

  const visibleResourceFields = useMemo(() => {
    if (!currentDefinition) {
      return [];
    }

    if (currentDefinition.readOnly || selectedRow) {
      return currentDefinition.fields;
    }

    return currentDefinition.fields.filter((field) => !field.readOnly);
  }, [currentDefinition, selectedRow]);

  const isRequestTableOnlyTab = useMemo(() => isRequestTab(currentDefinition), [currentDefinition]);

  const visibleTableColumns = useMemo(() => {
    if (!currentDefinition) {
      return [] as string[];
    }

    if (isRequestTableOnlyTab) {
      return currentDefinition.fields.map((field) => field.name);
    }

    return currentDefinition.columns;
  }, [currentDefinition, isRequestTableOnlyTab]);

  const fieldTypeByName = useMemo(() => {
    if (!currentDefinition) {
      return new Map<string, FieldType>();
    }

    return new Map<string, FieldType>(
      currentDefinition.fields.map((field) => [field.name, field.type]),
    );
  }, [currentDefinition]);

  const fieldLabelByName = useMemo(() => {
    if (!currentDefinition) {
      return new Map<string, string>();
    }

    return new Map<string, string>(
      currentDefinition.fields.map((field) => [field.name, field.label]),
    );
  }, [currentDefinition]);

  const renderDefinitionField = (field: FieldDefinition) => {
    const value = formValues[field.name];
    const disabled = !currentDefinition || currentDefinition.readOnly || field.readOnly || isSaving;
    const isReadOnlyDateField = field.readOnly && (field.type === "date" || field.type === "datetime");
    const existingFileValue =
      selectedRow && typeof selectedRow[field.name] === "string" ? String(selectedRow[field.name]) : null;

    return (
      <label key={field.name} className={styles.formField}>
        <span>{field.label}</span>

        {field.type === "textarea" ? (
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(event) => handleFieldChange(field.name, event.target.value)}
            disabled={disabled}
            placeholder={field.placeholder}
            rows={4}
          />
        ) : null}

        {field.type === "richtext" ? (
          <RichTextEditor
            value={value && typeof value === "object" ? (value as JSONContent) : null}
            disabled={disabled}
            onChange={(nextValue) => handleFieldChange(field.name, nextValue)}
            onUploadImage={async (file) => {
              const uploaded = await uploadAdminProjectImage(file);
              return uploaded.url;
            }}
          />
        ) : null}

        {field.type === "boolean" ? (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => handleFieldChange(field.name, event.target.checked)}
            disabled={disabled}
          />
        ) : null}

        {field.type === "select" ? (
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(event) => handleFieldChange(field.name, event.target.value)}
            disabled={disabled}
          >
            <option value="">{getAdminTranslation(lang, "messages.select-option")}</option>
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        {field.type === "file" ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleFieldChange(field.name, event.target.files?.[0] || null)}
              disabled={disabled}
            />
            {existingFileValue ? (
              <a className={styles.fileLink} href={existingFileValue} target="_blank" rel="noreferrer">
                {getAdminTranslation(lang, "messages.current-file")}
              </a>
            ) : null}
          </>
        ) : null}

        {isReadOnlyDateField ? (
          <input
            type="text"
            value={
              typeof value === "string" || typeof value === "number"
                ? formatDateByContext(String(value), field.type, field.name)
                : ""
            }
            disabled
            readOnly
          />
        ) : null}

        {field.type === "ids" ? (() => {
          if (field.name === "tags") {
            const selectedTagIds = normalizeIdArray(value);
            const selectedTagIdSet = new Set(selectedTagIds);
            const selectedFromRow = Array.isArray(selectedRow?.[field.name])
              ? (selectedRow?.[field.name] as unknown[])
                  .map((item) => {
                    if (!item || typeof item !== "object") {
                      return null;
                    }

                    const rowTag = item as Record<string, unknown>;
                    const id = toFiniteNumber(rowTag.id);
                    if (id === null) {
                      return null;
                    }

                    return {
                      id,
                      name_en: toText(rowTag.name_en).trim(),
                      name_bg: toText(rowTag.name_bg).trim(),
                    } as TagOption;
                  })
                  .filter((item): item is TagOption => item !== null)
              : [];

            const optionById = new Map<number, TagOption>();
            for (const tag of availableTags) {
              optionById.set(tag.id, tag);
            }
            for (const tag of selectedFromRow) {
              if (!optionById.has(tag.id)) {
                optionById.set(tag.id, tag);
              }
            }

            const tagOptions = sortTagOptions(Array.from(optionById.values()));
            const selectedTagOptions = selectedTagIds.map(
              (id) =>
                optionById.get(id) || {
                  id,
                  name_en: "",
                  name_bg: "",
                },
            );
            const availableToAdd = tagOptions.filter((tag) => !selectedTagIdSet.has(tag.id));
            const canAddTag =
              pendingTagId !== "" &&
              availableToAdd.some((tag) => String(tag.id) === pendingTagId);

            return (
              <>
                {selectedTagOptions.length > 0 ? (
                  <div className={styles.tagChips}>
                    {selectedTagOptions.map((tag) => (
                      <span key={tag.id} className={styles.tagChip}>
                        {getTagDisplayName(tag)}
                        {!disabled ? (
                          <button
                            type="button"
                            className={styles.tagChipRemove}
                            onClick={() => {
                              handleFieldChange(
                                field.name,
                                selectedTagIds.filter((id) => id !== tag.id),
                              );
                            }}
                            aria-label={getAdminTranslation(lang, "buttons.remove-tag")}
                          >
                            x
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.fieldHint}>
                    {getAdminTranslation(lang, "messages.no-tags-selected")}
                  </p>
                )}

                {!disabled ? (
                  <div className={styles.tagPickerRow}>
                    <select
                      value={pendingTagId}
                      onChange={(event) => setPendingTagId(event.target.value)}
                      disabled={tagsLoading || availableToAdd.length === 0}
                    >
                      <option value="">
                        {tagsLoading
                          ? getAdminTranslation(lang, "messages.loading-tags")
                          : availableToAdd.length === 0
                            ? getAdminTranslation(lang, "messages.no-tags-available")
                            : getAdminTranslation(lang, "placeholders.select-tag")}
                      </option>
                      {availableToAdd.map((tag) => (
                        <option key={tag.id} value={String(tag.id)}>
                          {getTagDisplayName(tag)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        const parsedId = Number(pendingTagId);
                        if (!Number.isFinite(parsedId)) {
                          return;
                        }
                        handleFieldChange(field.name, [...selectedTagIds, parsedId]);
                        setPendingTagId("");
                      }}
                      disabled={!canAddTag || tagsLoading}
                    >
                      {getAdminTranslation(lang, "buttons.add-tag")}
                    </button>
                  </div>
                ) : null}
              </>
            );
          }

          const rawTags = selectedRow?.[field.name];
          const namedTags = Array.isArray(rawTags)
            ? (rawTags as unknown[]).filter(
                (item): item is { name_en?: unknown; name_bg?: unknown; id?: unknown } =>
                  item !== null && typeof item === "object" && ("name_en" in (item as object) || "name_bg" in (item as object)),
              )
            : [];

          return (
            <>
              {namedTags.length > 0 && (
                <div className={styles.tagChips}>
                  {namedTags.map((tag, idx) => (
                    <span key={idx} className={styles.tagChip}>
                      {String(tag.name_en || tag.name_bg || tag.id || "?")}
                    </span>
                  ))}
                </div>
              )}
              {!disabled && (
                <input
                  type="text"
                  value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
                  onChange={(event) => handleFieldChange(field.name, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </>
          );
        })() : null}

        {!isReadOnlyDateField &&
        (field.type === "text" ||
          field.type === "number" ||
          field.type === "date" ||
          field.type === "datetime") ? (
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text"}
            value={typeof value === "string" || typeof value === "number" ? (field.type === "datetime" ? String(value).slice(0, 16) : String(value)) : ""}
            onChange={(event) => handleFieldChange(field.name, event.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        ) : null}
      </label>
    );
  };

  const courseSectionFields = useMemo(() => {
    if (!currentDefinition || currentDefinition.key !== "courses") {
      return {
        main: [] as FieldDefinition[],
        title: [] as FieldDefinition[],
        about: [] as FieldDefinition[],
        payments: [] as FieldDefinition[],
      };
    }

    const fieldByName = new Map(currentDefinition.fields.map((field) => [field.name, field] as const));
    const pick = (names: readonly string[]) =>
      names
        .map((name) => fieldByName.get(name))
        .filter((field): field is FieldDefinition => Boolean(field));

    return {
      main: pick(COURSE_FIELD_GROUPS.main),
      title: pick(COURSE_FIELD_GROUPS.title),
      about: pick(COURSE_FIELD_GROUPS.about),
      payments: pick(COURSE_FIELD_GROUPS.payments),
    };
  }, [currentDefinition]);

  if (authState === "checking") {
    return null;
  }

  if (authState === "unauthorized") {
    return null;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <h1>{getAdminTranslation(lang, "ui.admin-title")}</h1>
        </div>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <p className={styles.groupTitle}>{getAdminTranslation(lang, group.label)}</p>
              {group.tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={tab === activeTab ? styles.navItemActive : styles.navItem}
                >
                  {getTabLabel(tab, RESOURCE_DEFINITIONS, lang)}
                  {tab === "operator-chat" && hasUnreadMessages ? (
                    <span className={styles.navBadge}>
                      {totalUnreadMessages}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          {getAdminTranslation(lang, "buttons.logout")}
        </button>
      </aside>

      <main className={styles.content}>
        {activeTab === "operator-chat" ? (
          <section className={styles.chatSection}>
            <div className={styles.headerRow}>
              <div>
                <h2>{getAdminTranslation(lang, "ui.chats")}</h2>
              </div>
              <div className={styles.chatTools}>
                <span
                  className={
                    chatConnectionStatus === "connected" ? styles.connectionOnline : styles.connectionOffline
                  }
                >
                  {getAdminTranslation(lang, `messages.connection-${chatConnectionStatus}`)}
                </span>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => void loadChatSessions()}
                >
                  {getAdminTranslation(lang, "buttons.refresh")}
                </button>
              </div>
            </div>

            {chatConnectionError ? <p className={styles.errorBox}>{chatConnectionError}</p> : null}
            {chatSessionsError ? <p className={styles.errorBox}>{chatSessionsError}</p> : null}

            <div className={styles.chatLayout}>
              <aside className={styles.sessionList}>
                {chatSessionsLoading ? null : null}

                {sortedChatSessions.map((session) => {
                  const isSelected = session.id === selectedChatSessionId;
                  const unread = chatUnreadBySession[session.id] || 0;
                  const isUnread = unread > 0;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      className={`${isSelected ? styles.sessionItemActive : styles.sessionItem} ${
                        isUnread ? styles.sessionItemUnread : ""
                      }`.trim()}
                      onClick={() => handleSelectChatSession(session.id)}
                    >
                      <div className={styles.sessionItemTop}>
                        <span className={styles.sessionKey}>{session.session_key}</span>
                        {unread > 0 ? <span className={styles.unreadIndicator}>•</span> : null}
                      </div>
                      <p className={styles.sessionPreview}>
                        {session.last_message ? session.last_message.text : getAdminTranslation(lang, "messages.no-messages-yet")}
                      </p>
                      <p className={styles.sessionMeta}>
                        {session.is_active ? getAdminTranslation(lang, "messages.active") : getAdminTranslation(lang, "messages.archived")} • {formatDateTime(session.updated_at)}
                      </p>
                    </button>
                  );
                })}
              </aside>

              <div className={styles.chatPanel}>
                {selectedChatSession ? (
                  <>
                    <div className={styles.chatPanelHeader}>
                      <div>
                        <h3>{selectedChatSession.session_key}</h3>
                        <p>{selectedChatSession.is_active ? getAdminTranslation(lang, "messages.active") : getAdminTranslation(lang, "messages.archived")}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => void handleToggleSessionActive()}
                      >
                        {selectedChatSession.is_active ? getAdminTranslation(lang, "buttons.archive-session") : getAdminTranslation(lang, "buttons.activate-session")}
                      </button>
                    </div>

                    <div className={styles.messageList}>
                      {selectedChatMessages.length === 0 ? (
                        <p className={styles.dimText}>{getAdminTranslation(lang, "messages.no-messages-in-session")}</p>
                      ) : (
                        selectedChatMessages.map((message) => (
                          <article
                            key={message.id}
                            className={
                              message.sender_type === "operator"
                                ? styles.operatorMessage
                                : message.sender_type === "bot"
                                  ? styles.botMessage
                                  : styles.userMessage
                            }
                          >
                            <div className={styles.messageBubble}>
                              <p className={styles.messageText}>{message.text}</p>
                              <time className={styles.messageTime}>{formatChatTime(message.created_at)}</time>
                            </div>
                          </article>
                        ))
                      )}
                    </div>

                    <form className={styles.messageComposer} onSubmit={handleSendOperatorMessage}>
                      <textarea
                        value={chatDraft}
                        onChange={(event) => setChatDraft(event.target.value)}
                        placeholder={getAdminTranslation(lang, "placeholders.message")}
                        rows={3}
                        disabled={chatSendPending}
                      />
                      <button type="submit" className={styles.primaryButton} disabled={chatSendPending}>
                        {chatSendPending ? getAdminTranslation(lang, "buttons.sending") : getAdminTranslation(lang, "buttons.send-reply")}
                      </button>
                    </form>

                    {chatSendError ? <p className={styles.errorBox}>{chatSendError}</p> : null}
                  </>
                ) : (
                  <p className={styles.dimText}>{getAdminTranslation(lang, "messages.select-dialog")}</p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {currentDefinition ? (
          <section className={styles.resourceSection}>
            <div className={styles.headerRow}>
              <div>
                <h2>{currentDefinition.title}</h2>
              </div>

              <div className={styles.toolsRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => void handleRefreshCurrentResource()}
                >
                  {getAdminTranslation(lang, "buttons.reload")}
                </button>

                {!currentDefinition.readOnly ? (
                  <button type="button" className={styles.secondaryButton} onClick={handleResetForm}>
                    {getAdminTranslation(lang, "buttons.new-record")}
                  </button>
                ) : null}
              </div>
            </div>

            {resourceError ? <p className={styles.errorBox}>{resourceError}</p> : null}

            <div
              className={
                isRequestTableOnlyTab
                  ? `${styles.resourceLayout} ${styles.resourceLayoutSingle}`
                  : styles.resourceLayout
              }
            >
              <div className={styles.tableWrap}>
                {resourceLoading ? null : null}

                {!resourceLoading ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {visibleTableColumns.map((column) => (
                          <th key={column}>{fieldLabelByName.get(column) ?? column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resourceRows.map((row) => {
                        const id = row.id as string | number | undefined;
                        const isSelected =
                          !isRequestTableOnlyTab &&
                          selectedRow &&
                          selectedRow.id !== undefined &&
                          id !== undefined &&
                          String(selectedRow.id) === String(id);

                        return (
                          <tr
                            key={id !== undefined ? String(id) : JSON.stringify(row)}
                            onClick={isRequestTableOnlyTab ? undefined : () => handleSelectRow(row)}
                            className={isSelected ? styles.rowSelected : undefined}
                          >
                            {visibleTableColumns.map((column) => (
                              <td key={column}>
                                {toTableValue(row[column], fieldTypeByName.get(column), column)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
              </div>

              {!isRequestTableOnlyTab ? (
                <div className={styles.formWrap}>
                <h3>
                  {currentDefinition.readOnly
                    ? getAdminTranslation(lang, "ui.details")
                    : selectedRow
                      ? `${getAdminTranslation(lang, "ui.edit")} #${String(selectedRow.id ?? "")}`
                      : getAdminTranslation(lang, "ui.create-new")}
                </h3>

                <form className={styles.form} onSubmit={handleSaveForm}>
                  {isCourseTab(currentDefinition) ? (
                    <>
                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-main")}</h4>
                        <div className={styles.inlineGridTwo}>
                          {courseSectionFields.main.map((field) => renderDefinitionField(field))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-titles")}</h4>
                        <div className={styles.inlineGridTwo}>
                          {courseSectionFields.title.map((field) => renderDefinitionField(field))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-about")}</h4>
                        <div className={styles.inlineGridTwo}>
                          {courseSectionFields.about.map((field) => renderDefinitionField(field))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-payments")}</h4>
                        <div className={styles.inlineGridTwo}>
                          {courseSectionFields.payments.map((field) => renderDefinitionField(field))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-audience")}</h4>
                        <div className={styles.inlineGrid}>
                          {courseAudienceCards.map((card, index) => (
                            <article key={`audience-${index}`} className={styles.inlineItem}>
                              <div className={styles.inlineItemHeader}>
                                <strong>{getAdminTranslation(lang, "ui.card")} {index + 1}</strong>
                              </div>
                              <div className={styles.inlineGridTwo}>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "title_en")}</span>
                                  <input
                                    type="text"
                                    value={card.title_en}
                                    onChange={(event) =>
                                      updateCourseAudienceCard(index, "title_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "title_bg")}</span>
                                  <input
                                    type="text"
                                    value={card.title_bg}
                                    onChange={(event) =>
                                      updateCourseAudienceCard(index, "title_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "text_en")}</span>
                                  <textarea
                                    value={card.text_en}
                                    onChange={(event) =>
                                      updateCourseAudienceCard(index, "text_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={3}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "text_bg")}</span>
                                  <textarea
                                    value={card.text_bg}
                                    onChange={(event) =>
                                      updateCourseAudienceCard(index, "text_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={3}
                                  />
                                </label>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <div className={styles.inlineTitleRow}>
                          <h4>{getAdminTranslation(lang, "ui.course-instruments")}</h4>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={addCourseInstrument}
                            disabled={isSaving}
                          >
                            {getAdminTranslation(lang, "buttons.add-instrument")}
                          </button>
                        </div>
                        <div className={styles.inlineGrid}>
                          {courseInstruments.map((instrument, index) => (
                            <article key={`instrument-${index}`} className={styles.inlineItem}>
                              <div className={styles.inlineItemHeader}>
                                <strong>{getAdminTranslation(lang, "ui.instrument")} {index + 1}</strong>
                                <button
                                  type="button"
                                  className={styles.secondaryButton}
                                  onClick={() => removeCourseInstrument(index)}
                                  disabled={isSaving}
                                >
                                  {getAdminTranslation(lang, "buttons.remove")}
                                </button>
                              </div>
                              <div className={styles.inlineGridTwo}>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "name_en")}</span>
                                  <input
                                    type="text"
                                    value={instrument.name_en}
                                    onChange={(event) =>
                                      updateCourseInstrument(index, "name_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "name_bg")}</span>
                                  <input
                                    type="text"
                                    value={instrument.name_bg}
                                    onChange={(event) =>
                                      updateCourseInstrument(index, "name_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "icon")}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      updateCourseInstrument(
                                        index,
                                        "iconFile",
                                        event.target.files?.[0] || null,
                                      )
                                    }
                                    disabled={isSaving}
                                  />
                                  {instrument.iconUrl ? (
                                    <a
                                      className={styles.fileLink}
                                      href={instrument.iconUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {getAdminTranslation(lang, "messages.current-icon")}
                                    </a>
                                  ) : null}
                                </label>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <h4>{getAdminTranslation(lang, "ui.course-outcomes")}</h4>
                        <div className={styles.inlineGrid}>
                          {courseOutcomes.map((outcome, index) => (
                            <article key={`outcome-${index}`} className={styles.inlineItem}>
                              <div className={styles.inlineItemHeader}>
                                <strong>{getAdminTranslation(lang, "ui.outcome")} {index + 1}</strong>
                              </div>
                              <div className={styles.inlineGridTwo}>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "text_en")}</span>
                                  <textarea
                                    value={outcome.text_en}
                                    onChange={(event) =>
                                      updateCourseOutcome(index, "text_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={3}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "text_bg")}</span>
                                  <textarea
                                    value={outcome.text_bg}
                                    onChange={(event) =>
                                      updateCourseOutcome(index, "text_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={3}
                                  />
                                </label>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className={styles.inlineSection}>
                        <div className={styles.inlineTitleRow}>
                          <h4>{getAdminTranslation(lang, "ui.course-modules")}</h4>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={addCourseModule}
                            disabled={isSaving}
                          >
                            {getAdminTranslation(lang, "buttons.add-module")}
                          </button>
                        </div>
                        <div className={styles.inlineGrid}>
                          {courseModules.map((module, index) => (
                            <article key={`module-${index}`} className={styles.inlineItem}>
                              <div className={styles.inlineItemHeader}>
                                <strong>{getAdminTranslation(lang, "ui.module")} {index + 1}</strong>
                                <button
                                  type="button"
                                  className={styles.secondaryButton}
                                  onClick={() => removeCourseModule(index)}
                                  disabled={isSaving}
                                >
                                  {getAdminTranslation(lang, "buttons.remove")}
                                </button>
                              </div>

                              <div className={styles.inlineGridTwo}>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "title_en")}</span>
                                  <input
                                    type="text"
                                    value={module.title_en}
                                    onChange={(event) =>
                                      updateCourseModule(index, "title_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "title_bg")}</span>
                                  <input
                                    type="text"
                                    value={module.title_bg}
                                    onChange={(event) =>
                                      updateCourseModule(index, "title_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "descriptions_en")}</span>
                                  <textarea
                                    value={module.descriptions_en}
                                    onChange={(event) =>
                                      updateCourseModule(index, "descriptions_en", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={4}
                                    placeholder={getAdminTranslation(lang, "messages.one-line-description")}
                                  />
                                </label>
                                <label className={styles.formField}>
                                  <span>{getAdminTranslation(lang, "fieldLabels", "descriptions_bg")}</span>
                                  <textarea
                                    value={module.descriptions_bg}
                                    onChange={(event) =>
                                      updateCourseModule(index, "descriptions_bg", event.target.value)
                                    }
                                    disabled={isSaving}
                                    rows={4}
                                    placeholder={getAdminTranslation(lang, "messages.one-line-description")}
                                  />
                                </label>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    </>
                  ) : (
                    visibleResourceFields.map((field) => renderDefinitionField(field))
                  )}

                  {formError ? <p className={styles.errorBox}>{formError}</p> : null}

                  {!currentDefinition.readOnly ? (
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                        {isSaving ? getAdminTranslation(lang, "buttons.saving") : selectedRow ? getAdminTranslation(lang, "buttons.update") : getAdminTranslation(lang, "buttons.create")}
                      </button>

                      {selectedRow && currentDefinition.allowDelete !== false ? (
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => void handleDeleteSelected()}
                          disabled={isDeleting}
                        >
                          {isDeleting ? getAdminTranslation(lang, "buttons.deleting") : getAdminTranslation(lang, "buttons.delete")}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </form>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
