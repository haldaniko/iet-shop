import React from 'react';
import { IconArrowLeft, IconArrowRight } from "@/components/icons";
import styles from './CarouselNav.module.scss';

interface CarouselNavProps {
    currentIndex: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
    onGoTo: (index: number) => void;
    className?: string;
}

export const CarouselNav = ({ currentIndex, totalSteps, onPrev, onNext, onGoTo, className }: CarouselNavProps) => {
    return (
        <nav className={`${styles.navigation} ${className || ''}`}>
            <ul className={styles.navList}>
                <li
                    className={styles.navArrow}
                    onClick={onPrev}
                    aria-label="Previous"
                >
                    <IconArrowLeft />
                </li>
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <li key={index} className={styles.navItem}>
                        <span
                            className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ""}`}
                            onClick={() => onGoTo(index)}
                        />
                    </li>
                ))}
                <li
                    className={styles.navArrow}
                    onClick={onNext}
                    aria-label="Next"
                >
                    <IconArrowRight />
                </li>
            </ul>
        </nav>
    );
};
