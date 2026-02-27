"use client";

import React, { useState } from "react";
import Link from "next/link";
import { translations, courseTags } from "./translations";
import styles from "./CoursesSection.module.scss";
import { IconLightbulb, IconHelpBtn } from "@/components/icons";
import { CourseCard } from "@/components/ui/Coursecard/CourseCard";
import { Product } from "@/lib/api";
import { useTranslate } from "@/lib/useTranslate";

interface CoursesSectionProps {
  products?: Product[];
}

export const CoursesSection = ({ products = [] }: CoursesSectionProps) => {
  const { t, lang } = useTranslate(translations);
  const tags = courseTags[lang];
  const [activeTag, setActiveTag] = useState("all");

  return (
    <section id="courses" className={styles.coursesSection}>
      <div className={styles.container}>
        <div className={styles.head}>
          {/* <div className={styles.topSeparator}></div> */}
          <h2 className={styles.title}>{t.choosePath}</h2>

          <div className={styles.tipBlock}>
            <div className={styles.tipContent}>
              <IconLightbulb className={styles.tipIcon} />
              <div className={styles.tipText}>
                <span className={styles.tipTitle}>{t.tipLabel}</span>{" "}
                {t.tipText}
              </div>
            </div>
          </div>
          {/* <div className={styles.bottomSeparator}></div> */}
        </div>

        <div className={styles.helpContainer}>
          <div className={styles.helpTags}>
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`${styles.tag} ${activeTag === tag.id ? styles.active : ""}`}
                onClick={() => setActiveTag(tag.id)}
              >
                {tag.name}
              </div>
            ))}
          </div>

          <div className={styles.helpContact}>
            <div className={styles.helpTextWrapper}>
              <h4 className={styles.helpSubtitle}>{t.helpDeciding}</h4>
              <p className={styles.helpDescription}>{t.helpDecidingText}</p>
            </div>

            <Link href="#consultation" className={styles.helpLink} aria-label="Contact us">
              <IconHelpBtn />
            </Link>
          </div>
        </div>

        <div className={styles.coursesGrid}>
          {products.length > 0 ? (
            products.map((product) => (
              <CourseCard key={product.id} product={product} />
            ))
          ) : (
            <>
              <CourseCard />
              <CourseCard />
              <CourseCard />
              <CourseCard />
            </>
          )}
        </div>
      </div>
    </section>
  );
};
