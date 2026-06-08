"use client";

import React from "react";
import { Course } from "@/lib/api";
import { CourseCard } from "@/components/ui/Coursecard/CourseCard";
import styles from "./SimilarCoursesSection.module.scss";

import { useTranslate } from "@/lib/useTranslate";
import { translations } from "./translations";

interface SimilarCoursesSectionProps {
    course: Course;
    allCourses: Course[];
}

export const SimilarCoursesSection = ({ course, allCourses }: SimilarCoursesSectionProps) => {
    const { t } = useTranslate(translations);
    const currentTagIds = new Set(course.tags?.map((t) => t.id) ?? []);


    const candidateCourses = allCourses.filter((c) => {
        if (c.id === course.id) return false;
        return true;
    });

    let similarCourses = candidateCourses.filter((c) => {
        return c.audience === course.audience && c.tags?.some((t) => currentTagIds.has(t.id));
    });

    if (similarCourses.length === 0) {
        similarCourses = candidateCourses.filter((c) => c.audience === course.audience);
    }

    if (similarCourses.length === 0) return null;

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{t.title}</h2>
            <div className={styles.scrollRow}>
                {similarCourses.map((c) => (
                    <div key={c.id} className={styles.cardWrapper}>
                        <CourseCard course={c} />
                    </div>
                ))}
            </div>
        </section>
    );
};
