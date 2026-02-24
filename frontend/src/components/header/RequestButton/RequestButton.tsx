"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/Button/Button";
import styles from "./RequestButton.module.scss";

export const RequestButton = () => {
    const router = useRouter();
    const { lang } = useLanguage();

    return (
        <div className={styles.wrapper}>
            <Button
                variant="dark-outline"
                size="lg"
                rounded="full"
                onClick={() => router.push("/contact")}
            >
                {t[lang].leaveRequest}
            </Button>
        </div>
    );
};
