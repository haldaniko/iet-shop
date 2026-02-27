import type { Lang } from "@/lib/LanguageContext";


export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export type FAQTranslations = {
  faqs: FAQ[];
};

export type FAQTitleTranslations = {
  title: string;
}

export const translationsTitle: Record<Lang, FAQTitleTranslations & { reminderTitle: string, reminderText: string }> = {
  en: {
    title: "Any Questions?",
    reminderTitle: "Glad You Asked!",
    reminderText: "If there's still something you want to check, don't hesitate to give us a shout!"
  },
  bg: {
    title: "Имате ли въпроси?",
    reminderTitle: "Радваме се, че попитахте!",
    reminderText: "Ако все още има нещо, което искате да проверите, не се колебайте да ни се обадите!"
  }
}

export const translations: Record<Lang, FAQTranslations> = {
  en: {
    faqs: [
      {
        id: "1",
        question: "What are the technical requirements to join a course?",
        answer: "Technical requirements vary by course, but generally you need a computer with stable internet access and specific software depending on the subject.",
      },
      {
        id: "2",
        question: "What documents are required for admission?",
        answer: "Typically, you need a copy of your ID, previous education certificates, and a completed application form.",
      },
      {
        id: "3",
        question: "What document/certificate will I receive after graduating from the Institute?",
        answer: "Upon successful completion, you will receive an official certificate from the Institute recognized by industry partners.",
      },
      {
        id: "4",
        question: "Are there evening or weekend timings available?",
        answer: "Yes, we offer flexible schedules including evening and weekend classes for many of our courses.",
      },
      {
        id: "5",
        question: "What documents are required for registration?",
        answer: "Registration requires proof of payment, ID, and any course-specific prerequisites documentation.",
      },
      {
        id: "6",
        question: "Can I change my training schedule?",
        answer: "Schedule changes are possible within the first week of the course, subject to availability in other groups.",
      },
      {
        id: "7",
        question: "How can I choose the suitable course for me?",
        answer: "You can consult with our academic advisors or take a self-assessment test on our website to find the best fit.",
      },
      {
        id: "8",
        question: "Will there be homework and how long will it take?",
        answer: "Yes, there is homework to reinforce learning. It typically takes 2-4 hours per week depending on the course intensity.",
      }
    ]
  },
  bg: {
    faqs: [
      {
        id: "1",
        question: "Каква е политиката за връщане?",
        answer: "Нашата политика за връщане позволява връщане на продукти в рамките на 30 дни от покупката.",
      },
      {
        id: "2",
        question: "Колко време отнема доставката?",
        answer: "Времето за доставка вари в зависимост от вашето местоположение.",
      },
      {
        id: "3",
        question: "Предлагате ли международна доставка?",
        answer: "Да, предлагаме международна доставка до избрани страни.",
      },
      {
        id: "4",
        question: "Как мога да проследя моята поръчка?",
        answer: "След като вашата поръчка бъде изпратена, ще получите номер за проследяване по имейл.",
      },
      {
        id: "5",
        question: "Какви методи на плащане приемате?",
        answer: "Приемаме различни методи на плащане, включително кредитни карти, дебитни карти и PayPal.",
      },
      {
        id: "6",
        question: "Мога ли да променя или отменя моята поръчка?",
        answer: "Можете да промените или отмените вашата поръчка в рамките на 24 часа след нейното поставяне.",
      }
    ]
  }
};