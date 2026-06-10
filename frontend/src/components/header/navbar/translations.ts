import type { Lang } from "@/lib/translations";

type NavbarTranslations = {
  projects: string;
  events: string;
  blog: string;
  contact: string;
  euProjectCode: string;
};

export const translations: Record<Lang, NavbarTranslations> = {
  en: {
    projects: "Projects",
    events: "Events",
    blog: "Blog",
    contact: "Contact",
    euProjectCode: "Project BG16RFPR001",
  },
  bg: {
    projects: "Проекти",
    events: "Събития",
    blog: "Блог",
    contact: "Контакти",
    euProjectCode: "Проект BG16RFPR001",
  },
};

