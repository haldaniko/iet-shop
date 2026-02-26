import type { Lang } from "@/lib/translations";

type CoursesTranslations = {
  courses: string;
  allCourses: string;
  online: string;
  offline: string;
};

export const translations: Record<Lang, CoursesTranslations> = {
  en: {
    courses: "Courses",
    allCourses: "All Courses",
    online: "Online",
    offline: "Offline",
  },
  bg: {
    courses: "Курсове",
    allCourses: "Всички курсове",
    online: "Онлайн",
    offline: "Офлайн",
  },
};

