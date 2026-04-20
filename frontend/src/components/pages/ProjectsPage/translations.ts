import type { Lang } from "@/lib/translations";

interface ProjectCardTranslation {
  title: string;
  description: string;
}

type ProjectsPageTranslations = {
  breadcrumbCurrent: string;
  headingStart: string;
  headingAccent: string;
  cards: ProjectCardTranslation[];
  cardImageAlt: string;
};

const SHARED_PROJECT_CARD: ProjectCardTranslation = {
  title: "Project Title",
  description:
    "This project is about helping jobless people such as marketologists, designers and de..",
};

const SHARED_PROJECT_CARDS: ProjectCardTranslation[] = Array.from({ length: 6 }, () => ({
  ...SHARED_PROJECT_CARD,
}));

export const translations: Record<Lang, ProjectsPageTranslations> = {
  en: {
    breadcrumbCurrent: "Projects",
    headingStart: "Our projects were created to",
    headingAccent: "inspire, help and improve.",
    cardImageAlt: "Project illustration",
    cards: SHARED_PROJECT_CARDS,
  },
  bg: {
    breadcrumbCurrent: "Проекти",
    headingStart: "Нашите проекти са създадени да",
    headingAccent: "вдъхновяват, помагат и развиват.",
    cardImageAlt: "Илюстрация на проект",
    cards: SHARED_PROJECT_CARDS,
  },
};
