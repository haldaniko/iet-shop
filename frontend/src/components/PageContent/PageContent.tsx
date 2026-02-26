"use client";

import { Hero } from "@/components/home/Hero/Hero";
import { Achievments } from "@/components/home/Achievments/Achievments";
import { AdvantagesSection } from "@/components/home/AdvantagesSection/AdvantagesSection";
import { JourneySection } from "@/components/home/JourneySection/JourneySection";
import { CoursesSection } from "../home/CoursesSection/CoursesSection";
import { ReviewsSection } from "../home/ReviewsSection/ReviewsSection";
import { ConsultationSection } from "../home/ConsultationSection/ConsultationSection";
import styles from "./PageContent.module.scss";

export const PageContent = ({
    products,
    metadata = {}
}: {
    products: unknown[],
    metadata?: Record<string, unknown>
}) => {
    return (
        <div className={styles.page}>
            <Hero metadata={metadata} />
            <Achievments />
            <CoursesSection />
            <AdvantagesSection />
            <JourneySection />
            <ReviewsSection />
            <ConsultationSection />
        </div>
    );
};
