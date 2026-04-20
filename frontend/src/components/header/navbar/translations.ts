import type { Lang } from "@/lib/translations";

type NavbarTranslations = {
  projects: string;
  events: string;
  blog: string;
  contact: string;
};

export const translations: Record<Lang, NavbarTranslations> = {
  en: {
    projects: "Projects",
    events: "Events",
    blog: "Blog",
    contact: "Contact",
  },
  bg: {
    projects: "Проекти",
    events: "Събития",
    blog: "Блог",
    contact: "Контакти",
  },
};

