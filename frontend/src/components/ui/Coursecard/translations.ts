import type { Lang } from "@/lib/translations";

type CourseCardTranslations = {
    leaveRequest: string;
    months: string;
    hybrid: string;
    start: string;
};

export const translations: Record<Lang, CourseCardTranslations> = {
    en: {
        leaveRequest: "Leave Request",
        months: "months",
        hybrid: "hybrid (offline/online)",
        start: "start",
    },
    bg: {
        leaveRequest: "Остави заявка",
        months: "месеца",
        hybrid: "хибридно (офлайн/онлайн)",
        start: "начало",
    },
};
