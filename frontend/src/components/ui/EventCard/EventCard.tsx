import React from 'react';
import styles from './EventCard.module.scss';
import { Button } from '@/components/ui/Button/Button';

interface EventCardProps {
    title: string;
    date: string;
    tags: string[];
    joinBtnText: string;
    onJoin?: () => void;
}

export const EventCard = ({ title, date, tags, joinBtnText, onJoin }: EventCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.left}>
                <div className={styles.imagePlaceholder} />
            </div>

            <div className={styles.middle}>
                <h4 className={styles.title}>{title}</h4>
                <div className={styles.tags}>
                    {tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.date}>{date}</div>
                <Button
                    variant="primary"
                    rounded="full"
                    className={styles.joinBtn}
                    onClick={onJoin}
                >
                    {joinBtnText}
                </Button>
            </div>
        </div>
    );
};
