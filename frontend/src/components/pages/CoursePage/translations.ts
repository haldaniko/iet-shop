import type { Lang } from "@/lib/LanguageContext";

type CoursePageTranslations = {
    title: string;
    description: string;
};

export const translations: Record<Lang, CoursePageTranslations> = {
    en: {
        title: "Course Details",
        description: "Learn more about our professional training programs.",
    },
    bg: {
        title: "Детайли за курса",
        description: "Научете повече за нашите професионални програми за обучение.",
    },
};
