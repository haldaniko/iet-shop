"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import { useSearchParams, useRouter } from "next/navigation";
import { translations, courseTypes } from "./translations";
import helpGuy from "@/assets/emojii/helpIcon.png";
import styles from "./CoursesSection.module.scss";
import { IconLightbulb, IconHelpBtn } from "@/components/icons";
import { CourseCard } from "@/components/ui/Coursecard/CourseCard";
import { Select } from "@/components/ui/Select/Select";
import { Course, getTags, Tag } from "@/lib/api";
import { useTranslate } from "@/lib/useTranslate";

interface CoursesSectionProps {
  courses?: Course[];
  tags?: Tag[];
}

const CoursesContent = ({ courses = [], tags: initialTags = [] }: CoursesSectionProps) => {
  const { t, lang } = useTranslate(translations);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dbTags, setDbTags] = useState<Tag[]>(initialTags);
  const types = courseTypes[lang];

  useEffect(() => {
    if (initialTags.length === 0) {
      getTags().then(tags => {
        setDbTags(tags);
      });
    } else {
      setDbTags(initialTags);
    }
  }, [initialTags]);

  const tags = [
    { id: 'all', name: lang === 'bg' ? 'Всички категории' : 'All Categories' },
    ...dbTags.map(tag => {
      const name = tag.name;
      const tagName = (function () {
        if (typeof name === 'string') return name;
        if (name && typeof name === 'object') return name[lang as keyof typeof name] || name.en || name.bg || "";
        return "";
      })();
      return { id: tag.id.toString(), name: tagName };
    })
  ];

  const tagFromUrl = searchParams.get("courseTag");
  const activeTag = (tagFromUrl && tags.some(t => t.id === tagFromUrl)) ? tagFromUrl : "all";

  const typeFromUrl = searchParams.get("courseType");
  const activeType = (typeFromUrl && types.some(t => t.id === typeFromUrl)) ? typeFromUrl : "all";

  const audienceFromUrl = searchParams.get("audience");
  const activeAudience = (audienceFromUrl && ["adults", "kids"].includes(audienceFromUrl)) ? audienceFromUrl : "all";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}#courses`, { scroll: false });
  };

  const handleTagChange = (id: string) => updateParams("courseTag", id);
  const handleTypeChange = (id: string) => updateParams("courseType", id);
  const handleAudienceChange = (id: string) => {
    if (id === "all") {
      const params = new URLSearchParams();
      router.push(`?#courses`, { scroll: false });
    } else {
      updateParams("audience", id);
    }
  };


  const filteredCourses = courses.filter((course) => {
    const matchesTag = activeTag === "all" || course.tags.some(tag => {
      const name = tag.name;
      const tagName = (function () {
        if (typeof name === 'string') return name;
        if (name && typeof name === 'object') return name[lang as keyof typeof name] || name.en || name.bg || "";
        return "";
      })();
      return tagName.toLowerCase() === activeTag.toLowerCase() || tag.id.toString() === activeTag;
    });
    const matchesType = activeType === "all" || course.type === activeType;
    const matchesAudience = activeAudience === "all" || course.audience === activeAudience;
    return matchesTag && matchesType && matchesAudience;
  });


  const audienceButtons = [
    { id: "all", label: t.allAudience },
    { id: "adults", label: t.forAdults },
    { id: "kids", label: t.forKids },
  ];

  return (
    <section id="courses" className={styles.coursesSection}>
      <div className={styles.container}>
        <div className={styles.head}>
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
        </div>



        <div className={styles.filterBar}>
          <div className={styles.filterControls}>
            <div className={styles.audienceTabs}>
              {audienceButtons.map((btn) => (
                <button
                  key={btn.id}
                  className={`${styles.audienceTab} ${activeAudience === btn.id ? styles.active : ""}`}
                  onClick={() => handleAudienceChange(btn.id)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className={styles.selectors}>
              <Select
                options={tags}
                value={activeTag}
                onChange={handleTagChange}
                placeholder={t.categoryPlaceholder}
                className={styles.selector}
              />
              <Select
                options={types}
                value={activeType}
                onChange={handleTypeChange}
                placeholder={t.formatPlaceholder}
                className={styles.selector}
              />
            </div>
          </div>

          <div className={styles.helpContact}>
            <Image
              src={helpGuy}
              alt="Help Icon"
              width={106}
              height={106}
              className={styles.helpIcon}
              style={{ height: 'auto' }}
            />
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
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className={styles.noResults}>{t.noResults}</div>
          )}
        </div>
      </div>
    </section>
  );
};

export const CoursesSection = (props: CoursesSectionProps) => {
  return (
    <Suspense fallback={<div>Loading courses...</div>}>
      <CoursesContent {...props} />
    </Suspense>
  );
};
