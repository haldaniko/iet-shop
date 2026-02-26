import React from "react";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from "./ReviewsSection.module.scss";
import { ReviewCard } from "@/components/ui/ReviewCard/ReviewCard";
import { ReminderCard } from "@/components/ui/ReminderCard/ReminderCard";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

export const ReviewsSection = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSteps = t.reviews.length;

  const maxIndex = Math.max(0, totalSteps - 2);

  const nextStep = () => setCurrentIndex((prev) => (prev + 1) % maxIndex);
  const prevStep = () =>
    setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
  const goToStep = (index: number) => setCurrentIndex(index);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div>
            
        </div>
        <div className={styles.sectionLayout}>
          <div className={styles.mainLayout}>
            <div className={styles.titleWrapper}>
              <div className={styles.titleContainer}>
                <h3 className={styles.title}>
                  {t.title}{" "}
                  <span className={styles.highlight}>{t.highlight}</span>
                </h3>
              </div>

              <nav className={styles.navigation}>
                <ul className={styles.navList}>
                  <li
                    className={styles.navArrow}
                    onClick={prevStep}
                    aria-label="Previous review"
                    style={{ cursor: "pointer" }}
                  >
                    <IconArrowLeft />
                  </li>
                  {Array.from({ length: maxIndex }).map((_, index) => (
                    <li key={index} className={styles.navItem}>
                      <span
                        className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ""}`}
                        onClick={() => goToStep(index)}
                      />
                    </li>
                  ))}
                  <li
                    className={styles.navArrow}
                    onClick={nextStep}
                    aria-label="Next review"
                    style={{ cursor: "pointer" }}
                  >
                    <IconArrowRight />
                  </li>
                </ul>
              </nav>
            </div>

            <div className={styles.carouselContent}>
              <ul
                className={styles.reviewList}
                style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
              >
                {t.reviews.map((review, index) => (
                  <li
                    key={review.id}
                    className={`${styles.reviewItem} ${index === currentIndex + 1 ? styles.rotated : ""}`}
                  >
                    <ReviewCard {...review} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.reminderLayout}>
          <ReminderCard title={t.reminderTitle} text={t.reminderHighlight} />
        </div>
      </div>
    </section>
  );
};
