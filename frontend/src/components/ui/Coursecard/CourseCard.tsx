"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { IconHelpBtn } from '@/components/icons';
import styles from './CourseCard.module.scss';

import { useTranslate } from "@/lib/useTranslate";
import { Product } from "@/lib/api";
import { translations } from "./translations";

interface CourseCardProps {
  product?: Product;
}

export const CourseCard = ({ product }: CourseCardProps) => {
  const { t } = useTranslate(translations);

  const title = product?.title || "Front End Development";
  // For now, using mock logic for badges if product is provided

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
        <h3 className={styles.title}>{title}</h3>
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
