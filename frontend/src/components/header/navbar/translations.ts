import type { Lang } from "@/lib/translations";

type NavbarTranslations = {
  events: string;
  blog: string;
  contact: string;
};

export const translations: Record<Lang, NavbarTranslations> = {
  en: {
    events: "Events",
    blog: "Blog",
    contact: "Contact",
  },
  bg: {
    events: "Събития",
    blog: "Блог",
    contact: "Контакти",
  },
};

