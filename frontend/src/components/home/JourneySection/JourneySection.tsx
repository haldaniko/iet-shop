"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from './JourneySection.module.scss';

import step1Img from '@/assets/journeyimg/Step1.jpg';
import step2Img from '@/assets/journeyimg/Step2.jpg';
import step3Img from '@/assets/journeyimg/Step3.jpg';

export const JourneySection = () => {
    const { lang } = useLanguage();
    const t = translations[lang];

    const sectionRef = useRef<HTMLElement>(null);
    const [inView, setInView] = useState(false);

    const [progress, setProgress] = useState(0);
    const [emojiPos, setEmojiPos] = useState(-20);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (inView && !hasAnimated) {
            setHasAnimated(true);

            const animateSteps = async () => {
                const steps = [
                    // { progress: 8, emoji: 17 },    // Breakpoint at Step 1
                    { progress: 36, emoji: 167 },  // Breakpoint at Step 2
                    { progress: 64, emoji: 317 },  // Breakpoint at Step 3
                    { progress: 100, emoji: 485 }  // Final position
                ];

                for (const step of steps) {
                    setProgress(step.progress);
                    setEmojiPos(step.emoji);
                    await new Promise(resolve => setTimeout(resolve, 2500));
                }
            };

            animateSteps();
        }
    }, [inView, hasAnimated]);

    return (
        <section className={styles.journeySection} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t.title}</h2>
                    <p className={styles.subtitle}>{t.highlight}</p>
                </div>

                <div className={styles.mainGrid}>
                    <div className={styles.leftDecoration}>
                        <p className={styles.decorationLabel}>{t.decorations[0].label}</p>
                        <div className={styles.imageBox}>
                            <Image src={step1Img} alt="Step 1" className={styles.stepImage} />
                            <div className={styles.curveLineLeft}></div>
                        </div>
                    </div>

                    <div className={styles.centerSection}>
                        <div
                            className={styles.progressBarWrapper}
                            style={{
                                '--progress': `${progress}%`,
                                '--emoji-pos': `${emojiPos}px`
                            } as React.CSSProperties}
                        >
                            <div className={styles.progressBar}></div>
                            <div className={styles.emoji}>🥳</div>
                        </div>
                        <ul className={styles.stepsList}>
                            {t.steps.map((step, index) => (
                                <li key={index} className={styles.stepItem}>
                                    {step.text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.rightDecoration}>
                        <div className={styles.decorationBox}>
                            <div className={styles.imageBoxSmall}>
                                <Image src={step2Img} alt="Step 2" className={styles.stepImage} />
                            </div>
                            <p className={styles.decorationLabel}>{t.decorations[1].label}</p>
                        </div>

                        <div className={styles.decorationBox}>
                            <div className={styles.imageBoxSmall}>
                                <Image src={step3Img} alt="Step 3" className={styles.stepImage} />
                            </div>
                            <p className={styles.decorationLabel}>{t.decorations[2].label}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
