"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from "./AdvantagesSection.module.scss";
import { AdvantageCard } from "@/components/ui/AdvantageCard/AdvantageCard";

export const AdvantagesSection = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <section className={styles.advantagesSection}>
      <div className={styles.cardContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {t.items.map((item, index) => (
              <AdvantageCard
                key={index}
                title={item.title}
                description={item.description}
                bg={item.bg}
                style={item.bg ? { color: "white" } : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
