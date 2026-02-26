import React from 'react';
import styles from './ReminderCard.module.scss';

interface ReminderCardProps {
    title: string;
    text: string;
}

export const ReminderCard = ({ title, text }: ReminderCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.iconWrapper}></div>
            <div className={styles.content}>
                <h4 className={styles.title}>{title}:</h4>
                <p className={styles.text}>{text}</p>
            </div>
        </div>
    );
};
