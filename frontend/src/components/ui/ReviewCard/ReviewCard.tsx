import React from 'react';

import styles from './ReviewCard.module.scss';
import { IconGoogle } from '@/components/icons';

interface ReviewCardProps {
    id?: string;
    text: string;
    name: string;
    studentStatus: string;
}

export const ReviewCard = ({ text, name, studentStatus }: ReviewCardProps) => {
    return (
        <div className={styles.card}>
            <p className={styles.reviewText}>
                &ldquo;{text}&rdquo;
            </p>

            <div className={styles.footer}>
                <div className={styles.studentInfo}>
                    <span className={styles.status}>{studentStatus}</span>
                    <h4 className={styles.name}>{name}</h4>
                </div>

                <div className={styles.googleWrapper}>
                    <IconGoogle className={styles.googleIcon} />
                </div>
            </div>
        </div>
    );
};
