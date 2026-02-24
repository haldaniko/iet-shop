"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IconFlagUK, IconFlagBG } from "@/components/icons";
import styles from "./LanguageDropdown.module.scss";

const flags = {
    en: IconFlagUK,
    bg: IconFlagBG,
};

export const LanguageDropdown = () => {
    const { lang, setLang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const other = lang === "en" ? "bg" : "en";
    const CurrentFlag = flags[lang];
    const OtherFlag = flags[other];

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className={styles.wrapper}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={styles.langFlag}
            >
                <CurrentFlag />
            </button>

            {isOpen && (
                <div className={`${styles.menu} ${styles.right}`}>
                    <button
                        onClick={() => {
                            setLang(other);
                            setIsOpen(false);
                        }}
                        className={styles.langOption}
                        title={other === "en" ? "English" : "Български"}
                    >
                        <OtherFlag />
                    </button>
                </div>
            )}
        </div>
    );
};
