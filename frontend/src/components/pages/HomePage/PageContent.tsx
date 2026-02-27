"use client";

import { HeroSection } from "@/components/sections/HeroSection/HeroSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection/AchievementsSection";
import { EventsSection } from "@/components/sections/EventsSection/EventsSection";
import { AdvantagesSection } from "@/components/sections/AdvantagesSection/AdvantagesSection";
import { JourneySection } from "@/components/sections/JourneySection/JourneySection";
import { CoursesSection } from "@/components/sections/CoursesSection/CoursesSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection/ReviewsSection";
import { ConsultationSection } from "@/components/sections/ConsultationSection/ConsultationSection";
import { BlogSection } from "@/components/sections/BlogSection/BlogSection";
import { FAQSection } from "@/components/sections/FAQSection/FAQSection";

import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import styles from "./PageContent.module.scss";
import { Product } from "@/lib/api";


export const PageContent = ({
    metadata = {},
    products = []
}: {
    metadata?: Record<string, unknown>,
    products?: Product[]
}) => {
    return (
        <>
            <Header />
            <main className={styles.page}>
                <HeroSection metadata={metadata} />
                <AchievementsSection />
                <CoursesSection products={products} />
                <AdvantagesSection />
                <JourneySection />
                <ReviewsSection />
                <ConsultationSection />
                <EventsSection />
                <BlogSection />
                <FAQSection />
            </main>
            <Footer />
        </>
    );
};
