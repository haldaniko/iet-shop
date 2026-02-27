import type { Lang } from "@/lib/translations";

type CoursesTranslations = {
    choosePath: string;
    tipLabel: string;
    tipText: string;
    helpDeciding: string;
    helpDecidingText: string;
};


export type CourseTag = {
    id: string;
    name: string;
}

export const courseTags: Record<Lang, CourseTag[]> = {
    en: [
        { id: 'all', name: 'All' },
        { id: 'design', name: 'UI/UX Design' },
        { id: 'programming', name: 'Programming' },
        { id: 'marketing', name: 'Marketing' },
    ],
    bg: [
        { id: 'all', name: 'Всички' },
        { id: 'design', name: 'UI/UX Дизайн' },
        { id: 'programming', name: 'Програмиране' },
        { id: 'marketing', name: 'Маркетинг' },
    ],
}

export const translations: Record<Lang, CoursesTranslations> = {
    en: {
        choosePath: "Choose Your Path",
        tipLabel: "Tip:",
        tipText: "No experience needed. Every course is beginner friendly.",
        helpDeciding: "Need help with deciding?",
        helpDecidingText: "Contact us via an online form.",
    },
    bg: {
        choosePath: "Изберете своя път",
        tipLabel: "Съвет:",
        tipText: "Не е необходим опит. Всеки курс е подходящ за начинаещи.",
        helpDeciding: "Нуждаете се от помощ при избора?",
        helpDecidingText: "Свържете се с нас чрез онлайн форма.",
    },
};
