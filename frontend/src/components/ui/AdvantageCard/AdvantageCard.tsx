import React from 'react';
import Image from 'next/image';
import styles from './AdvantageCard.module.scss';
import pointIcon from '@/assets/pointAdvantage.png';

export interface AdvantageCardProps {
    title: string;
    description: string;
    bg?: string;
    index?: number;
    style?: React.CSSProperties;
}

export const AdvantageCard = ({ title, description, bg = '#FFFFFF', style }: AdvantageCardProps) => {
    return (
        <div className={styles.card} style={{ backgroundColor: bg, ...style }}>
            <div className={styles.top}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.iconWrapper}>
                    <Image
                        src={pointIcon}
                        alt="point"
                        width={64}
                        height={64}
                        priority
                    />
                </div>
            </div>
            <p className={styles.description}>{description}</p>
        </div>
    );
};