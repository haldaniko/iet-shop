"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/Button/Button";
import { translations } from "./translations";
import styles from "./RequestButton.module.scss";

export const RequestButton = () => {
    const router = useRouter();
    const { lang } = useLanguage();
    const tr = translations[lang];

    return (
        <div className={styles.wrapper}>
            <Button
                variant="dark-outline"
                size="lg"
                rounded="full"
                onClick={() => router.push("/contact")}
            >
                {tr.leaveRequest}
            </Button>
        </div>
    );
};
