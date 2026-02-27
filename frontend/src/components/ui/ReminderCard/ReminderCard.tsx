import React from 'react';
import styles from './ReminderCard.module.scss';

interface ReminderCardProps {
    title: string;
    text: string;
    className?: string;
}

export const ReminderCard = ({ title, text, className }: ReminderCardProps) => {
    return (
        <div className={`${styles.card} ${className || ''}`}>
            <div className={styles.iconWrapper}></div>
            <div className={styles.content}>
                <h4 className={styles.title}>{title}:</h4>
                <p className={styles.text}>{text}</p>
            </div>
        </div>
    );
};
