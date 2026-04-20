"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import { CarouselNav } from "@/components/ui/CarouselNav/CarouselNav";
import { IconArrowUpRight } from "@/components/icons";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer/RichContentRenderer";
import { useLanguage } from "@/lib/LanguageContext";
import type { Project } from "@/lib/api";
import projectFallback from "@/assets/event.jpg";

import styles from "./ProjectDetailPage.module.scss";

const translations = {
  en: {
    projects: "Projects",
    projectImageAlt: "Project image",
    relatedProjects: "Related Projects",
  },
  bg: {
    projects: "Проекти",
    projectImageAlt: "Изображение на проект",
    relatedProjects: "Други проекти",
  },
};

interface ProjectDetailPageProps {
  project: Project;
  relatedProjects: Project[];
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

const toLocalizedRichContent = (value: unknown, lang: "en" | "bg") => {
  if (value && typeof value === "object" && ("en" in (value as object) || "bg" in (value as object))) {
    const localized = value as { en?: unknown; bg?: unknown };
    return (lang === "bg" ? localized.bg : localized.en) || localized.en || localized.bg || null;
  }
  return value;
};

const formatDate = (dateValue: string | undefined, lang: "en" | "bg") => {
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";

  const locale = lang === "bg" ? "bg-BG" : "en-GB";
  return parsed.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export function ProjectDetailPage({ project, relatedProjects }: ProjectDetailPageProps) {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.bg;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const title = toLocalizedText(project.title, lang);
  const excerpt = toLocalizedText(project.excerpt, lang);
  const content = toLocalizedRichContent(project.content, lang);
  const formattedDate = useMemo(() => formatDate(project.created_at, lang), [project.created_at, lang]);

  const cardWidth = 509;
  const gap = 24;

  const scrollToStep = (index: number) => {
    if (!carouselRef.current) return;

    carouselRef.current.scrollTo({
      left: (cardWidth + gap) * index,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (relatedProjects.length <= 1) return;
    const nextIndex = (activeIndex + 1) % relatedProjects.length;
    setActiveIndex(nextIndex);
    scrollToStep(nextIndex);
  };

  const handlePrev = () => {
    if (relatedProjects.length <= 1) return;
    const prevIndex = (activeIndex - 1 + relatedProjects.length) % relatedProjects.length;
    setActiveIndex(prevIndex);
    scrollToStep(prevIndex);
  };

  const handleGoTo = (index: number) => {
    setActiveIndex(index);
    scrollToStep(index);
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.page}>
        <div className={styles.breadcrumbWrapper}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: t.projects, href: "/projects" },
                { label: title || project.slug },
              ]}
            />
          </div>
        </div>

        <div className={styles.container}>
          <article className={styles.article}>
            <h1 className={styles.title}>{title || project.slug}</h1>

            <div className={styles.coverWrap}>
              <Image
                src={project.cover_image || projectFallback}
                alt={title || t.projectImageAlt}
                width={1400}
                height={760}
                className={styles.coverImage}
                sizes="(max-width: 768px) 100vw, 1200px"
              />

              {formattedDate ? <span className={styles.coverDate}>{formattedDate}</span> : null}
            </div>

            <div className={styles.articleContentWrapper}>
              {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}

              <RichContentRenderer content={content} />
            </div>
          </article>
        </div>

        {relatedProjects.length > 0 ? (
          <section className={styles.relatedSection}>
            <div className={styles.container}>
              <div className={styles.relatedHeader}>
                <h2 className={styles.relatedTitle}>{t.relatedProjects}</h2>
              </div>

              <div className={styles.carouselWrapper} ref={carouselRef}>
                <ul className={styles.relatedList}>
                  {relatedProjects.map((item) => {
                    const relatedTitle = toLocalizedText(item.title, lang) || item.slug;
                    const relatedExcerpt = toLocalizedText(item.excerpt, lang);
                    const relatedDate = formatDate(item.created_at, lang);

                    return (
                      <li key={item.id} className={styles.relatedItem}>
                        <article className={styles.relatedCard}>
                          <div className={styles.relatedImageWrap}>
                            <Image
                              src={item.cover_image || projectFallback}
                              alt={relatedTitle || t.projectImageAlt}
                              width={1000}
                              height={560}
                              className={styles.relatedImage}
                              sizes="(max-width: 767px) 100vw, 509px"
                            />
                          </div>

                          <div className={styles.relatedBody}>
                            <div className={styles.relatedTop}>
                              <h3 className={styles.relatedCardTitle}>{relatedTitle}</h3>
                              <Link
                                href={`/projects/${item.slug}`}
                                className={styles.relatedAction}
                                aria-label={relatedTitle}
                              >
                                <IconArrowUpRight className={styles.relatedActionIcon} />
                              </Link>
                            </div>

                            {relatedExcerpt ? <p className={styles.relatedDescription}>{relatedExcerpt}</p> : null}
                            {relatedDate ? <p className={styles.relatedDate}>{relatedDate}</p> : null}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className={styles.carouselNavWrapper}>
                <CarouselNav
                  currentIndex={activeIndex}
                  totalSteps={Math.max(relatedProjects.length - 1, 0)}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onGoTo={handleGoTo}
                />
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
