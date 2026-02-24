"use client";

import { Hero } from "@/components/home/Hero/Hero";
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
            
        </div>
    );
};
