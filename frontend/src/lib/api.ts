
export type LocalizedValue = string | { en?: string; bg?: string };

export interface Tag {
  id: number;
  name?: LocalizedValue;
  name_en?: string;
  name_bg?: string;
}

export interface Course {
  id: number;
  slug: string;
  title?: LocalizedValue;
  title_en?: string;
  title_bg?: string;
  start: string;
  image?: string;
  description?: LocalizedValue;
  description_en?: string;
  description_bg?: string;
  duration?: LocalizedValue;
  duration_en?: string;
  duration_bg?: string;
  type: "hybrid" | "online" | "offline";
  price: number;
  is_active: boolean;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  tags: Tag[];
  audience?: "adults" | "kids";
  monthly_installment_price?: number;
  visits_per_week?: number;
  about_title?: LocalizedValue;
  about_title_en?: string;
  about_title_bg?: string;
  about_description_top?: LocalizedValue;
  about_description_top_en?: string;
  about_description_top_bg?: string;
  about_description_bottom?: LocalizedValue;
  about_description_bottom_en?: string;
  about_description_bottom_bg?: string;
  about_image?: string;
  audience_image?: string;

  extra_audience_tags?: {
    title?: LocalizedValue;
    title_en?: string;
    title_bg?: string;
    text?: LocalizedValue;
    text_en?: string;
    text_bg?: string;
  }[];

  instruments?: {
    name?: LocalizedValue;
    name_en?: string;
    name_bg?: string;
    icon?: string;
  }[];

  outcomes?: {
    text?: LocalizedValue;
    text_en?: string;
    text_bg?: string;
  }[];

  modules?: {
    title?: LocalizedValue;
    title_en?: string;
    title_bg?: string;
    description?: LocalizedValue;
    description_en?: string;
    description_bg?: string;
    // For components that might still look for 'descriptions' array or object
    descriptions?: {
      text_en?: string;
      text_bg?: string;
    };
  }[];
}

export interface Post {
  id: number;
  slug: string;
  title?: LocalizedValue;
  title_en?: string;
  title_bg?: string;
  author: string;
  content?: LocalizedValue;
  content_en?: string;
  content_bg?: string;
  picture?: string;
  created_at: string;
  tags: Tag[];
}

export interface Project {
  id: number;
  slug: string;
  title?: LocalizedValue;
  title_en?: string;
  title_bg?: string;
  excerpt?: LocalizedValue;
  excerpt_en?: string;
  excerpt_bg?: string;
  content?: LocalizedValue;
  content_en?: Record<string, unknown>;
  content_bg?: Record<string, unknown>;
  cover_image?: string;
  is_active: boolean;
  created_at: string;
}

export interface Event {
  id: number;
  title: LocalizedValue;
  title_en?: string;
  title_bg?: string;
  date: string;
  description: LocalizedValue;
  description_en?: string;
  description_bg?: string;
  type: "online" | "offline" | "hybrid";
  tags: Tag[];
  image_1?: string;
  image_2?: string;
}


const getEffectiveApiBase = () => {
  const internalBase = process.env.API_INTERNAL_URL?.replace(/\/+$/, "");
  if (typeof window === "undefined" && internalBase) {
    return internalBase;
  }

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

const getPublicApiBase = () => {
  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configuredBase) {
    return configuredBase;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.hostname}:8000`;
  }

  return undefined;
};

const normalizeAbsoluteAssetUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    const publicBase = getPublicApiBase();
    if (!publicBase) {
      return rawUrl;
    }

    const publicOrigin = new URL(publicBase).origin;
    const internalBase = process.env.API_INTERNAL_URL?.replace(/\/+$/, "");
    const internalOrigin = internalBase ? new URL(internalBase).origin : undefined;

    if (internalOrigin && parsed.origin === internalOrigin) {
      return `${publicOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    if (parsed.hostname === "backend" || parsed.hostname === "django_backend") {
      return `${publicOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
};

const API_BASE = getEffectiveApiBase();
export const API_URL = `${API_BASE}/api`;

const resolveUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return normalizeAbsoluteAssetUrl(url);
  const base = getEffectiveApiBase();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};


const localize = (value: any) => {
  if (!value) return "";
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if ('en' in value || 'bg' in value) {
      return value;
    }
  }
  return value;
};

const mapTags = (tagIds: any[], allTags: Tag[]) => (tagIds || []).map(id => {
  if (typeof id === 'object') return id;
  const tagId = Number(id);
  const found = allTags.find(t => t.id === tagId);
  if (found) return found;
  return { id: tagId };
});

const SERVER_REVALIDATE_SECONDS = 300;

type SafeFetchOptions = {
  cache?: RequestCache;
};

const safeFetch = async (endpoint: string, options: SafeFetchOptions = {}) => {
  const url = `${API_URL}${endpoint}/`.replace(/\/+$/, '/');
  const isServer = typeof window === 'undefined';
  const requestOptions: any = {
    headers: {
      'Accept': 'application/json'
    }
  };

  if (isServer) {
    if (options.cache) {
      requestOptions.cache = options.cache;
    } else {
      requestOptions.next = { revalidate: SERVER_REVALIDATE_SECONDS };
    }
  } else {
    requestOptions.cache = 'no-store';
  }

  try {
    const res = await fetch(url, requestOptions);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    return null;
  }
};

export async function getTags(): Promise<Tag[]> {
  const tags = await safeFetch('/tags');
  return (tags || []).map((t: any) => flattenData(t));
}

const flattenData = (item: any) => {
  if (item && item.fields) {
    return {
      id: item.pk,
      ...item.fields
    };
  }
  return item;
}

export async function getHomePageData() {
  const [tags, courses, posts, events] = await Promise.all([
    getTags(),
    safeFetch('/courses'),
    safeFetch('/posts'),
    safeFetch('/events')
  ]);

  const allTags = tags || [];

  return {
    tags: allTags,
    courses: (courses || []).map((c: any) => {
      const flat = flattenData(c);
      return {
        ...flat,
        title: flat.title, // Now a {en, bg} object from DRF
        description: flat.description,
        duration: flat.duration,
        about_title: flat.about_title,
        about_description_top: flat.about_description_top,
        about_description_bottom: flat.about_description_bottom,
        image: resolveUrl(flat.image),
        about_image: resolveUrl(flat.about_image),
        audience_image: resolveUrl(flat.audience_image),
        tags: mapTags(flat.tags, allTags),
        audience: flat.audience ?? ((flat.age_group === "adult" || flat.age_group === "Adult") ? "adults" : "kids"),
        monthly_installment_price: flat.monthly_installment_price,
        visits_per_week: flat.visits_per_week,

        // Map related cards
        extra_audience_tags: (flat.audience_tags || []).map((card: any) => ({
          title: card.title,
          text: card.text
        })),
        instruments: (flat.instruments || []).map((instr: any) => ({
          name: instr.name,
          icon: resolveUrl(instr.icon)
        })),
        outcomes: (flat.outcomes || []).map((out: any) => out),
        modules: (flat.modules || []).map((mod: any) => ({
          title: mod.title,
          description: mod.description
        }))
      };
    }),
    posts: (posts || []).map((p: any) => {
      const flat = flattenData(p);
      return {
        ...flat,
        title: flat.title,
        content: flat.content,
        picture: resolveUrl(flat.picture),
        tags: mapTags(flat.tags, allTags)
      };
    }),
    events: (events || []).map((e: any) => {
      const flat = flattenData(e);

      const mappedEvent = {
        ...flat,
        id: flat.id,
        title: flat.title,
        description: flat.description || {
          bg: "Информация за събитието ще бъде добавена скоро.",
          en: "Event information will be added soon."
        },
        date: flat.date,
        type: flat.type,
        image_1: resolveUrl(flat.image_1),
        image_2: resolveUrl(flat.image_2),
        tags: mapTags(flat.tags, allTags)
      };


      return mappedEvent;
    })
  };
}

export async function getCourses(): Promise<Course[]> {
  const data = await getHomePageData();
  return data.courses as any;
}

export async function getPosts(): Promise<Post[]> {
  const data = await getHomePageData();
  return data.posts as any;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await safeFetch('/projects', { cache: 'no-store' });

  return (projects || []).map((project: any) => {
    const flat = flattenData(project);
    return {
      ...flat,
      title: flat.title,
      excerpt: flat.excerpt,
      content: flat.content,
      cover_image: resolveUrl(flat.cover_image),
    } as Project;
  });
}

export async function getEvents(): Promise<Event[]> {
  const data = await getHomePageData();
  return data.events as any;
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const courses = await getCourses();
  if (!courses || courses.length === 0) return undefined;
  const targetSlug = slug.toLowerCase().trim();
  return courses.find(c => c.slug?.toLowerCase().trim() === targetSlug);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  const targetSlug = slug.toLowerCase().trim();
  return posts.find(p => p.slug?.toLowerCase().trim() === targetSlug);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  const targetSlug = slug.toLowerCase().trim();
  return projects.find((project) => project.slug?.toLowerCase().trim() === targetSlug);
}

export async function getEventBySlug(title: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find(e => e.title === title || (typeof e.title === 'object' && e.title && ((e.title as any).en === title || (e.title as any).bg === title)));
}

export async function submitConsultation(data: { name: string; email: string; phone: string; interested: number }) {
  const url = `${API_URL}/consultations/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to submit consultation');
  }

  return await res.json();
}

export async function submitEventRequest(data: { name: string; email: string; phone: string; interested: number }) {
  const url = `${API_URL}/event-requests/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to submit event request');
  }

  return await res.json();
}

export async function createCheckoutSession(productSlug: string, customerEmail?: string): Promise<{ sessionId: string }> {
  const url = `${API_URL}/create-checkout-session/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      product_slug: productSlug,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.sessionId) {
    const detail = payload?.detail ? String(payload.detail) : 'Failed to create checkout session';
    throw new Error(detail);
  }

  return { sessionId: String(payload.sessionId) };
}
