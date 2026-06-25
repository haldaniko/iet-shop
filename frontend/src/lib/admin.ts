import type { ChatMessage } from "@/lib/chat";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null;
}

export interface AdminStats {
  tags: number;
  courses: number;
  events: number;
  posts: number;
  projects: number;
  consultations: number;
  event_requests: number;
  orders: number;
  chat_sessions: number;
  messages: number;
}

export interface AdminChatSession {
  id: string;
  session_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages_count: number;
  last_message: ChatMessage | null;
}

export type AdminChatSocketEvent =
  | { type: "admin.chat.ready" }
  | { type: "admin.chat.message"; chat_session_id: string; message: ChatMessage }
  | {
      type: "chat.error";
      code: string;
      detail: string | Record<string, string[]>;
      wait_seconds?: number;
    }
  | { type: "pong" };

export type AdminResourceKey =
  | "tags"
  | "courses"
  | "events"
  | "posts"
  | "projects"
  | "consultations"
  | "event-requests"
  | "orders"
  | "course-audience-tag-cards"
  | "course-instruments"
  | "course-outcomes"
  | "course-modules"
  | "course-module-descriptions"
  | "chat-sessions"
  | "messages";

export type AdminPayload = Record<string, unknown>;

type QueryParams = Record<string, string | number | boolean | undefined>;

type ResourceId = number | string;

const getApiBaseUrl = () => {
  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configuredBase) {
    return configuredBase;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.hostname}:8000`;
  }

  return "http://127.0.0.1:8000";
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
};

const buildApiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

const stringifyErrorValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => stringifyErrorValue(item));
  }

  if (typeof value === "string") {
    return [value];
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nestedValue]) =>
      stringifyErrorValue(nestedValue).map((message) => `${key}: ${message}`),
    );
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [String(value)];
};

const extractErrorDetail = async (response: Response) => {
  const payload = await response.json().catch(() => null as unknown);

  if (!payload || typeof payload !== "object") {
    return `Заявката беше неуспешна със статус ${response.status}.`;
  }

  if ("detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  if ("detail" in payload && Array.isArray(payload.detail)) {
    return payload.detail.join(" ");
  }

  if ("text" in payload) {
    if (Array.isArray(payload.text)) {
      return payload.text.join(" ");
    }
    if (typeof payload.text === "string") {
      return payload.text;
    }
  }

  if ("non_field_errors" in payload && Array.isArray(payload.non_field_errors)) {
    return payload.non_field_errors.join(" ");
  }

  const fieldErrors = Object.entries(payload).flatMap(([key, value]) =>
    stringifyErrorValue(value).map((message) => `${key}: ${message}`),
  );

  if (fieldErrors.length > 0) {
    return fieldErrors.join(" ");
  }

  return `Заявката беше неуспешна със статус ${response.status}.`;
};

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await extractErrorDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const normalizeEndpoint = (resource: AdminResourceKey, id?: ResourceId, params?: QueryParams) => {
  const base = `/api/admin/${resource}/`;
  const withId = id === undefined ? base : `${base}${id}/`;

  if (!params) {
    return withId;
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${withId}?${queryString}` : withId;
};

const appendFormValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendFormValue(formData, key, item);
    }
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }

  if (typeof value === "number") {
    formData.append(key, String(value));
    return;
  }

  if (typeof value === "string") {
    formData.append(key, value);
    return;
  }

  formData.append(key, JSON.stringify(value));
};

const hasFileMap = (files?: Record<string, File | null>) => {
  if (!files) {
    return false;
  }

  return Object.values(files).some((value) => value instanceof File);
};

async function ensureCsrfToken() {
  const existingToken = getCookie("csrftoken");
  if (existingToken) {
    return existingToken;
  }

  // The endpoint returns the token in the response body too.
  // Using it directly handles cases where the cookie is set on a different
  // hostname than the page (e.g. 127.0.0.1 vs localhost) and document.cookie
  // cannot read it, while the browser still sends it on subsequent requests.
  const data = await requestJson<{ csrfToken: string }>("/api/admin/auth/csrf/");
  const token = data.csrfToken || getCookie("csrftoken");

  if (!token) {
    throw new Error("Липсва CSRF токен.");
  }

  return token;
}

export async function adminLogin(username: string, password: string) {
  const csrfToken = await ensureCsrfToken();
  return requestJson<{ user: AdminUser }>("/api/admin/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout() {
  const csrfToken = await ensureCsrfToken();
  return requestJson<void>("/api/admin/auth/logout/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
}

export async function adminMe() {
  return requestJson<{ user: AdminUser }>("/api/admin/auth/me/", {
    cache: "no-store",
  });
}

export async function getAdminStats() {
  return requestJson<AdminStats>("/api/admin/dashboard/stats/", {
    cache: "no-store",
  });
}

export async function listAdminResource<T>(resource: AdminResourceKey, params?: QueryParams) {
  return requestJson<T[]>(normalizeEndpoint(resource, undefined, params), {
    cache: "no-store",
  });
}

export async function createAdminResource<T>(
  resource: AdminResourceKey,
  payload: AdminPayload,
  files?: Record<string, File | null>,
) {
  const csrfToken = await ensureCsrfToken();

  if (hasFileMap(files)) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(payload)) {
      appendFormValue(formData, key, value);
    }

    for (const [key, value] of Object.entries(files || {})) {
      if (value instanceof File) {
        formData.set(key, value);
      }
    }

    return requestJson<T>(normalizeEndpoint(resource), {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    });
  }

  return requestJson<T>(normalizeEndpoint(resource), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminResource<T>(
  resource: AdminResourceKey,
  id: ResourceId,
  payload: AdminPayload,
  files?: Record<string, File | null>,
) {
  const csrfToken = await ensureCsrfToken();

  if (hasFileMap(files)) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(payload)) {
      appendFormValue(formData, key, value);
    }

    for (const [key, value] of Object.entries(files || {})) {
      if (value instanceof File) {
        formData.set(key, value);
      }
    }

    return requestJson<T>(normalizeEndpoint(resource, id), {
      method: "PATCH",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    });
  }

  return requestJson<T>(normalizeEndpoint(resource, id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminResource(resource: AdminResourceKey, id: ResourceId) {
  const csrfToken = await ensureCsrfToken();
  return requestJson<void>(normalizeEndpoint(resource, id), {
    method: "DELETE",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
}

export async function listAdminChatSessions(isActive?: boolean) {
  const params = isActive === undefined ? undefined : { is_active: isActive };
  return listAdminResource<AdminChatSession>("chat-sessions", params);
}

export async function listAdminSessionMessages(chatSessionId: string) {
  return listAdminResource<ChatMessage>("messages", { chat_session: chatSessionId });
}

export async function sendAdminOperatorMessage(chatSessionId: string, text: string) {
  return createAdminResource<ChatMessage>("messages", {
    chat_session: chatSessionId,
    sender_type: "operator",
    text,
  });
}

export async function uploadAdminProjectImage(file: File) {
  const csrfToken = await ensureCsrfToken();
  const formData = new FormData();
  formData.set("image", file);

  return requestJson<{ url: string }>("/api/admin/projects/upload-image/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    body: formData,
  });
}

export function buildAdminChatWebSocketUrl() {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl.startsWith("https://")) {
    return `wss://${apiBaseUrl.slice("https://".length)}/ws/admin/chat/`;
  }

  if (apiBaseUrl.startsWith("http://")) {
    return `ws://${apiBaseUrl.slice("http://".length)}/ws/admin/chat/`;
  }

  if (typeof window === "undefined") {
    throw new Error("Cannot infer websocket origin on the server.");
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/admin/chat/`;
}
