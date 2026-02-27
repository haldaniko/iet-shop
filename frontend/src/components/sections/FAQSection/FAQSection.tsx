import React, { useState } from "react";
import styles from "./FAQSection.module.scss";
import { useTranslate } from "@/lib/useTranslate";
import { translations, translationsTitle } from "./translations";
import { ReminderCard } from "@/components/ui/ReminderCard/ReminderCard";

export const FAQSection = () => {
  const { t: tr } = useTranslate(translations);
  const { t: titleTr } = useTranslate(translationsTitle);

  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setActiveFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2>{titleTr?.title}</h2>
        <ul className={styles.faqList}>
          {tr.faqs.map((faq) => (
            <li key={faq.id} className={styles.faqItemWrapper}>
              <div className={styles.decorations}>
                <div className={styles.decorLarge}></div>
                <div className={styles.decorSmall}></div>
              </div>
              <div className={styles.faqItem}>
                <div
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(faq.id)}
                >
                  {faq.question}
                </div>
                {activeFAQ === faq.id && (
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.bottomContent}>
          <ReminderCard
            title={titleTr?.reminderTitle}
            text={titleTr?.reminderText}
          />
        </div>
      </div>
    </section>
  );
};
