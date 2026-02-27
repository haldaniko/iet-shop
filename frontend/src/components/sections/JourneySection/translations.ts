import type { Lang } from "@/lib/translations";

type JourneyStep = {
    text: string;
};

type Decoration = {
    label: string;
};

type JourneyTranslations = {
    title: string;
    highlight: string;
    steps: JourneyStep[];
    decorations: Decoration[];
};

export const translations: Record<Lang, JourneyTranslations> = {
    en: {
        title: "Your Student Journey",
        highlight: "in IET",
        steps: [
            { text: "Choose your course" },
            { text: "Practice" },
            { text: "Get Your Certificate" },
            { text: "Start Your Career" }
        ],
        decorations: [
            { label: "1). start here" },
            { label: "2). keep going..." },
            { label: "3). well done!" }
        ]
    },
    bg: {
        title: "Твоят студентски път",
        highlight: "в ИОТ",
        steps: [
            { text: "Избери своя курс" },
            { text: "Практикувай" },
            { text: "Вземи своя сертификат" },
            { text: "Започни своята кариера" }
        ],
        decorations: [
            { label: "1). започни тук" },
            { label: "2). продължавай..." },
            { label: "3). браво!" }
        ]
    }
};
