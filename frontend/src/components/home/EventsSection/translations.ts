import type { Lang } from "@/lib/LanguageContext";

export type Event = {
    id: string;
    title: string;
    date: string;
    tags: string[];
    isFree: boolean;
    location: string;
    joinUrl: string;
};

export type EventsTranslations = {
    title: string;
    badge: string;
    dateLabel: string;
    joinBtn: string;
    events: Event[];
};

export const translations: Record<Lang, EventsTranslations> = {
    en: {
        title: "Upcoming Events",
        badge: "Don't miss out!",
        dateLabel: "Date",
        joinBtn: "Join",
        events: [
            {
                id: '1',
                title: "How to become an interior designer without education?",
                date: "10 May 2026",
                tags: ["Design", "Online/Offline"],
                isFree: true,
                location: "Online/Offline",
                joinUrl: "#"
            },
            {
                id: '2',
                title: "How to create a stunning portfolio as a self-taught designer?",
                date: "15 Jun 2026",
                tags: ["Portfolio", "Online"],
                isFree: true,
                location: "Online",
                joinUrl: "#"
            },
            {
                id: '3',
                title: "Essential software tools for interior design beginners",
                date: "01 Aug 2026",
                tags: ["Tools", "Online"],
                isFree: false,
                location: "Online",
                joinUrl: "#"
            },
            {
                id: '4',
                title: "Mastering light and shadow in interior visualization",
                date: "12 Sep 2026",
                tags: ["Visualization", "Online"],
                isFree: true,
                location: "Online",
                joinUrl: "#"
            },
            {
                id: '5',
                title: "How to work with clients and manage projects?",
                date: "05 Oct 2026",
                tags: ["Business", "Online/Offline"],
                isFree: false,
                location: "Online/Offline",
                joinUrl: "#"
            }
        ]
    },
    bg: {
        title: "Предстоящи събития",
        badge: "Не пропускайте!",
        dateLabel: "Дата",
        joinBtn: "Включи се",
        events: [
            {
                id: '1',
                title: "Как да станете интериорен дизайнер без образование?",
                date: "10 Май 2026",
                tags: ["Дизайн", "Онлайн/Офлайн"],
                isFree: true,
                location: "Онлайн/Офлайн",
                joinUrl: "#"
            },
            {
                id: '2',
                title: "Как да създадете зашеметяващо портфолио като дизайнер самоук?",
                date: "15 Юни 2026",
                tags: ["Портфолио", "Онлайн"],
                isFree: true,
                location: "Онлайн",
                joinUrl: "#"
            },
            {
                id: '3',
                title: "Основни софтуерни инструменти за начинаещи в интериорния дизайн",
                date: "01 Август 2026",
                tags: ["Инструменти", "Онлайн"],
                isFree: false,
                location: "Онлайн",
                joinUrl: "#"
            },
            {
                id: '4',
                title: "Майсторство на светлина и сянка в интериорната визуализация",
                date: "12 Септември 2026",
                tags: ["Визуализация", "Онлайн"],
                isFree: true,
                location: "Онлайн",
                joinUrl: "#"
            },
            {
                id: '5',
                title: "Как да работите с клиенти и да управлявате проекти?",
                date: "05 Октомври 2026",
                tags: ["Бизнес", "Онлайн/Офлайн"],
                isFree: false,
                location: "Онлайн/Офлайн",
                joinUrl: "#"
            }
        ]
    }
};
