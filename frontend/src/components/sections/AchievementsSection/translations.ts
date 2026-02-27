import type { Lang } from "@/lib/translations";

type AchievmentsTranslations = {
  studentsText: string;
  coursesText: string;
  reviewsText: string;
  experienceText: string;
  communityText: string;
};

export const translations: Record<Lang, AchievmentsTranslations> = {
  en: {
    studentsText: "students successfully finished their course",
    coursesText: "courses arranged",
    reviewsText: "positive reviews",
    experienceText: "years of experience of teaching",
    communityText: "Join the community of people that opened new paragraph of their lives",
  },
  bg: {
    studentsText: "студенти успешно завършиха своя курс",
    coursesText: "организирани курса",
    reviewsText: "положителни отзива",
    experienceText: "години опит в преподаването",
    communityText: "Присъединете се към общността от хора, които отвориха нова глава в живота си",
  },
};
