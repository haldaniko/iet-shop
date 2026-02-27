"use client";

import React, { useRef, useState } from 'react';
import { useTranslate } from "@/lib/useTranslate";
import { translations } from "./translations";
import achievmentStar from '@/assets/AchievmentsStar.png'
import styles from "./AchievementsSection.module.scss";

import Image from 'next/image';

const PlayIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="29" stroke="white" strokeWidth="2" />
    <path d="M38 30L26 37L26 23L38 30Z" fill="white" />
  </svg>
);

export const AchievementsSection = () => {
  const { t } = useTranslate(translations);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className={styles.achievmentsSection}>
      <div className={styles.infoContainer}>
        <div className={styles.statsColumn}>
          <div className={`${styles.statItem} ${styles.accent}`}>
            <span className={styles.statCount}>1200</span>
            <p className={styles.statText}>{t.studentsText}</p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statCount}>600</span>
              <p className={styles.statText}>{t.coursesText}</p>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statCount}>500</span>
              <p className={styles.statText}>{t.reviewsText}</p>
            </div>
          </div>

          <div className={`${styles.statItem} ${styles.accent}`}>
            <span className={styles.statCount}>7+</span>
            <p className={styles.statText}>{t.experienceText}</p>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.communityBlock}>
            <div className={styles.stars}>
              <Image src={achievmentStar} alt="stars" width={40} height={26} />
            </div>
            <p className={styles.communityText}>{t.communityText}</p>
          </div>

          <div className={styles.videoWrapper} onClick={togglePlay}>
            <video
              ref={videoRef}
              className={styles.video}
              src="/assets/Info-video.mov"
            />
            {!isPlaying && (
              <div className={styles.playOverlay}>
                <PlayIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
