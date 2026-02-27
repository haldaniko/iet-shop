import type { Lang } from "@/lib/translations";

type Advantage = {
    title: string;
    description: string;
    bg?: string;
};

type AdvantagesTranslations = {
    title: string;
    subtitle: string;
    items: Advantage[];
};

export const translations: Record<Lang, AdvantagesTranslations> = {
    en: {
        title: "Learning Tech has ",
        subtitle: "never been easier",
        items: [
            {
                title: "Expert Mentors",
                description: "Learn from industry professionals with years of real-world experience.",

            },
            {
                title: "Practical Learning",
                description: "Focus on hands-on projects and real-world scenarios to build your portfolio.",

            },
            {
                title: "Career Support",
                description: "We help you with job search, resume building, and interview preparation.",
                bg: "#5A55F4"
            },
            {
                title: "Flexible Format",
                description: "Choose between online, offline, or hybrid learning models.",

            },
            {
                title: "Modern Tech Stack",
                description: "Our curriculum is always up-to-date with the latest industry standards.",

            }
        ]
    },
    bg: {
        title: "Ученето на технологии никога ",
        subtitle: "не е било по-лесно",
        items: [
            {
                title: "Експертни ментори",
                description: "Учете се от професионалисти в бранша с дългогодишен практически опит.",

            },
            {
                title: "Практическо обучение",
                description: "Фокус върху практически проекти и реални сценарии за изграждане на вашето портфолио.",

            },
            {
                title: "Кариерна подкрепа",
                description: "Помагаме ви в търсенето на работа, съставянето на автобиография и подготовката за интервю.",
                bg: "#5A55F4"
            },
            {
                title: "Гъвкав формат",
                description: "Изберете между онлайн, офлайн или хибридни модели на обучение.",

            },
            {
                title: "Модерен технологичен стек",
                description: "Нашата учебна програма е винаги в крак с най-новите индустриални стандарти.",

            }
        ]
    }
};
