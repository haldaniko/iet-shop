"use client";

import React from "react";
import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { useTranslate } from "@/lib/useTranslate";
import { translations } from "./translations";
import styles from "./CoursePage.module.scss";

/**
 * CoursePage Component
 * NOTE: Header and Footer are already included in the root layout.tsx.
 * They are added here as per user request to maintain consistency with PageContent 
 * if it were to be moved.
 */
export const CoursePage = () => {
    const { t } = useTranslate(translations);

    return (
        <div className={styles.coursePageWrapper}>
            <Header />
            <main className={styles.coursePage}>
                <div className={styles.container}>
                    <h1>{t.title}</h1>
                    <p>{t.description}</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};
