"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroImage from '@/assets/HeroImage.png'
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/Button/Button";
import locationIcon from "@/assets/Location.svg";
import { translations } from "./translations";
import styles from "./Hero.module.scss";

interface HeroProps {
    metadata?: Record<string, unknown>;
}

export const Hero = ({ metadata = {} }: HeroProps) => {
    const { lang } = useLanguage();
    const tr = translations[lang as keyof typeof translations];

    const getDynamic = (key: string, fallback: string) => {
        const dynamicKey = `${key}_${lang}`;
        const value = metadata[dynamicKey];
        return typeof value === "string" ? value : fallback;
    };

    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <div className={styles.heroContentLeft}>
                    <h3 className={styles.heroTitle}>
                        {getDynamic("heroTitle", tr.heroTitle)}{" "}
                        <span className={styles.heroTitleHighlight}>
                            {getDynamic("heroTitleHighlight", tr.heroTitleHighlight)}
                        </span>
                    </h3>

                    <p className={styles.heroDescription}>
                        {getDynamic("heroDescription", tr.heroDescription)}{" "}
                        <span className={styles.heroDescriptionHighlight}>
                            {getDynamic("heroDescriptionHighlight", tr.heroDescriptionHighlight)}
                        </span>{" "}
                        {getDynamic("heroDescriptionEnd", tr.heroDescriptionEnd)}
                    </p>

                    <div className={styles.location}>
                        <Image
                            src={locationIcon}
                            alt="location"
                            width={20}
                            height={20}
                            className={styles.locationIcon}
                        />
                        <span>{getDynamic("location", tr.location)}</span>
                    </div>
                </div>

                <div className={styles.heroContentRight}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={HeroImage}
                            alt="hero-image"
                            fill
                            className={styles.heroImage}
                            priority
                        />
                    </div>
                </div>
            </div>

            <div className={styles.heroActions}>
                <Link href="/courses">
                    <Button variant="primary" size="lg" rounded="full">
                        {getDynamic("browseCourses", tr.browseCourses)}
                    </Button>
                </Link>
            </div>
            <div></div>
        </section>
    );
};
