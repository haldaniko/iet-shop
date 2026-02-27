import type { Lang } from "@/lib/translations";

export type ConsultationTranslations = {
    title: string;
    description: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    interestPlaceholder: string;
    privacyPrefix: string;
    privacyLink: string;
    privacySuffix: string;
    buttonLabel: string;
    errorName: string;
    errorEmail: string;
    errorPhone: string;
    errorPrivacy: string;
    successMessage: string;
};

export const translations: Record<Lang, ConsultationTranslations> = {
    en: {
        title: "Get a Free Consultation",
        description: "(If you have questions about courses or don't know what to choose, leave your number: we'll call to answer all your questions)",
        namePlaceholder: "Name",
        emailPlaceholder: "Email",
        phonePlaceholder: "Phone",
        interestPlaceholder: "I'm interested in",
        privacyPrefix: "I agree to the ",
        privacyLink: "Privacy Policy",
        privacySuffix: " and personal data processing.",
        buttonLabel: "Leave Request",
        errorName: "Please enter your name.",
        errorEmail: "Please enter a valid email.",
        errorPhone: "Please enter a valid phone number.",
        errorPrivacy: "You must agree to the privacy policy.",
        successMessage: "Thank you! We will contact you soon."
    },
    bg: {
        title: "Вземете безплатна консултация",
        description: "(Ако имате въпроси относно курсовете или не знаете какво да изберете, оставете своя номер: ние ще се обадим, за да отговорим на всички ваши въпроси)",
        namePlaceholder: "Име",
        emailPlaceholder: "Имейл",
        phonePlaceholder: "Телефон",
        interestPlaceholder: "Интересувам се от",
        privacyPrefix: "Съгласен съм с ",
        privacyLink: "Политиката за поверителност",
        privacySuffix: " и обработката на лични данни.",
        buttonLabel: "Оставете заявка",
        errorName: "Моля, въведете вашето име.",
        errorEmail: "Моля, въведете валиден имейл.",
        errorPhone: "Моля, въведете валиден телефонен номер.",
        errorPrivacy: "Трябва да се съгласите с политиката за поверителност.",
        successMessage: "Благодарим ви! Ще се свържем с вас скоро."
    }
};
