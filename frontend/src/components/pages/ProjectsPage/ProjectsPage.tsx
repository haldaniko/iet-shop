"use client";

import Image from "next/image";
import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { IconArrowUpRight } from "@/components/icons";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import projectImage from "@/assets/event.jpg";
import styles from "./ProjectsPage.module.scss";

export const ProjectsPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.bg;

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.breadcrumbsWrap}>
              <Breadcrumbs items={[{ label: t.breadcrumbCurrent }]} />
            </div>

            <h1 className={styles.heading}>
              {t.headingStart}
              <br />
              <span className={styles.headingAccent}>{t.headingAccent}</span>
            </h1>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <ul className={styles.grid}>
              {t.cards.map((card, index) => (
                <li key={`${card.title}-${index}`} className={styles.cardItem}>
                  <article className={styles.card}>
                    <div className={styles.cardTop}>
                      <h2 className={styles.cardTitle}>{card.title}</h2>
                      <button
                        type="button"
                        className={styles.cardAction}
                        aria-label={card.title}
                      >
                        <IconArrowUpRight className={styles.cardActionIcon} />
                      </button>
                    </div>

                    <p className={styles.cardDescription}>{card.description}</p>

                    <div className={styles.imageWrap}>
                      <Image
                        src={projectImage}
                        alt={t.cardImageAlt}
                        className={styles.image}
                        sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                      />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
