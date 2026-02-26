"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { IconHelpBtn } from '@/components/icons';
import styles from './CourseCard.module.scss';

import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";

export const CourseCard = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.imagePlaceholder} />
        <div className={styles.badges}>
          <div className={styles.badge}>2 {t.months}</div>
          <div className={styles.badge}>{t.hybrid}</div>
          <div className={styles.badge}>{t.start}: 12 May 2026</div>
        </div>
      </div>

      <div className={styles.titleWrapper}>
        <div className={styles.dot} />
        <h3 className={styles.title}>Front End Development</h3>
      </div>

      <div className={styles.footer}>
        <Link href="#contact" className={styles.actionLink}>
          <IconHelpBtn />
        </Link>
        <Button
          variant="primary"
          rounded="full"
          className={styles.submitBtn}
        >
          {t.leaveRequest}
        </Button>
      </div>
    </div>
  );
};
