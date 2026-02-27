import { useLanguage } from "./LanguageContext";
import type { Lang } from "./LanguageContext";

export function useTranslate<T>(translations: Record<Lang, T>) {
    const { lang } = useLanguage();
    return {
        t: translations[lang as Lang],
        lang: lang as Lang
    };
}
