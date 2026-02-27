"use client";

import React, { useState, useRef } from 'react';
import styles from './BlogSection.module.scss';
import { BlogCard } from '@/components/ui/BlogCard/BlogCard';
import { CarouselNav } from '@/components/ui/CarouselNav/CarouselNav';
import { useTranslate } from "@/lib/useTranslate";
import { translations, translationsTitle } from './translations';

export const BlogSection = () => {
    const { t } = useTranslate(translations);
    const { t: tTitle } = useTranslate(translationsTitle);

    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const total = t.blogs.length - 1;

    const cardWidth = 509;
    const gap = 24;

    const scrollToStep = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                left: (cardWidth + gap) * index,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        const nextIndex = (activeIndex + 1) % total;
        setActiveIndex(nextIndex);
        scrollToStep(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (activeIndex - 1 + total) % total;
        setActiveIndex(prevIndex);
        scrollToStep(prevIndex);
    };

    const handleGoTo = (index: number) => {
        setActiveIndex(index);
        scrollToStep(index);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.info}>
                    <h2>
                        {tTitle.title} <span className={styles.infoBadge}>{tTitle.badge}</span>
                    </h2>
                    <CarouselNav
                        currentIndex={activeIndex}
                        totalSteps={total}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onGoTo={handleGoTo}
                    />
                </div>

                <div className={styles.scrollWrapper} ref={containerRef}>
                    <ul className={styles.blogList}>
                        {t.blogs.map((blog) => (
                            <BlogCard key={blog.id} {...blog} />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};