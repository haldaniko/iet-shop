"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import { IconArrowUpRight } from "@/components/icons";
import { useLanguage } from "@/lib/LanguageContext";
import type { Project } from "@/lib/api";
import projectImage from "@/assets/event.jpg";
import styles from "./ProjectsPage.module.scss";

const translations = {
  en: {
    breadcrumbCurrent: "Projects",
    headingStart: "Our projects were created to",
    headingAccent: "inspire, help and improve.",
    cardImageAlt: "Project cover",
    empty: "No projects available yet.",
    readMore: "Read project",
  },
  bg: {
    breadcrumbCurrent: "Проекти",
    headingStart: "Нашите проекти са създадени да",
    headingAccent: "вдъхновяват, помагат и развиват.",
    cardImageAlt: "Изображение на проект",
    empty: "Все още няма проекти.",
    readMore: "Към проекта",
  },
};

interface ProjectsPageProps {
  projects: Project[];
}

const toLocalizedText = (value: unknown, lang: "en" | "bg") => {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    const localized = value as { en?: string; bg?: string };
    return (lang === "bg" ? localized.bg : localized.en) || localized.en || localized.bg || "";
  }
  return "";
};

export const ProjectsPage = ({ projects }: ProjectsPageProps) => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.bg;

  const normalizedProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        localizedTitle: toLocalizedText(project.title, lang),
        localizedExcerpt: toLocalizedText(project.excerpt, lang),
      })),
    [lang, projects],
  );

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
            {normalizedProjects.length === 0 ? (
              <p className={styles.emptyState}>{t.empty}</p>
            ) : (
              <ul className={styles.grid}>
                {normalizedProjects.map((project) => (
                  <li key={project.id} className={styles.cardItem}>
                    <article className={styles.card}>
                      <div className={styles.cardTop}>
                        <h2 className={styles.cardTitle}>{project.localizedTitle || "Project"}</h2>
                        <Link
                          href={`/projects/${project.slug}`}
                          className={styles.cardAction}
                          aria-label={project.localizedTitle || t.readMore}
                        >
                          <IconArrowUpRight className={styles.cardActionIcon} />
                        </Link>
                      </div>

                      <p className={styles.cardDescription}>{project.localizedExcerpt || "-"}</p>

                      <div className={styles.imageWrap}>
                        <Image
                          src={project.cover_image || projectImage}
                          alt={t.cardImageAlt}
                          className={styles.image}
                          width={1000}
                          height={560}
                          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                        />
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
