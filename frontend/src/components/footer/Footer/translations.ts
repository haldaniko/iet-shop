import type { Lang } from "@/lib/translations";

type FooterTranslations = {
  leaveRequest: string;
  contact: string;
  footerCompanyName: string;
  footerAddressLine1: string;
  footerAddressLine2: string;
  footerPhone: string;
  footerEmail: string;
  footerLegalTitle: string;
  footerLegalEuInfo: string;
  footerLegalTerms: string;
  footerLegalCookies: string;
  footerLegalPrivacy: string;
  footerCoursesTitle: string;
  footerCourseDesign: string;
  footerCourseMarketing: string;
  footerCourseCoding: string;
  footerCourseKids: string;
  footerCourseSmm: string;
  footerPartnered: string;
  footerCopyright: string;
};

export const translations: Record<Lang, FooterTranslations> = {
  en: {
    leaveRequest: "Leave Request",
    contact: "Contact",
    footerCompanyName: "Innovative Educational Technologies",
    footerAddressLine1: "188 Slivnica Blvd",
    footerAddressLine2: "Sofia, Bulgaria",
    footerPhone: "+359 87 532 9945",
    footerEmail: "email_office@gmail.com",
    footerLegalTitle: "Legal",
    footerLegalEuInfo: "EU Project Information",
    footerLegalTerms: "Terms and Conditions",
    footerLegalCookies: "Cookie Settings",
    footerLegalPrivacy: "Privacy Policy",
    footerCoursesTitle: "Courses",
    footerCourseDesign: "Design",
    footerCourseMarketing: "Marketing",
    footerCourseCoding: "Coding",
    footerCourseKids: "For Kids",
    footerCourseSmm: "SMM",
    footerPartnered: "Partnered with",
    footerCopyright:
      "© 2026 Innovative Educational Technologies. All rights reserved.",
  },
  bg: {
    leaveRequest: "Оставете заявка",
    contact: "Контакти",
    footerCompanyName: "Инновативни образователни технологии",
    footerAddressLine1: "Бул. Сливница 188",
    footerAddressLine2: "София, България",
    footerPhone: "+359 87 532 9945",
    footerEmail: "email_office@gmail.com",
    footerLegalTitle: "Правна информация",
    footerLegalEuInfo: "Информация за проекта на ЕС",
    footerLegalTerms: "Общи условия",
    footerLegalCookies: "Настройки на бисквитките",
    footerLegalPrivacy: "Политика за поверителност",
    footerCoursesTitle: "Курсове",
    footerCourseDesign: "Дизайн",
    footerCourseMarketing: "Маркетинг",
    footerCourseCoding: "Програмиране",
    footerCourseKids: "За деца",
    footerCourseSmm: "SMM",
    footerPartnered: "В партньорство с",
    footerCopyright:
      "© 2026 Инновативни образователни технологии. Всички права запазени.",
  },
};

