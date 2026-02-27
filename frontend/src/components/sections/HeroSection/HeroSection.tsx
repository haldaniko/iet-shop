"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroImage from "@/assets/HeroImage.png";
import { useTranslate } from "@/lib/useTranslate";
import { Button } from "@/components/ui/Button/Button";
import RectangleHero from "@/assets/RectangleHero.png";
import locationIcon from "@/assets/Location.svg";
import { translations } from "./translations";
import styles from "./HeroSection.module.scss";

interface HeroSectionProps {
  metadata?: Record<string, unknown>;
}

export const HeroSection = ({ metadata = {} }: HeroSectionProps) => {
  const { t: tr, lang } = useTranslate(translations);

  const getDynamic = (key: string, fallback: string) => {
    const dynamicKey = `${key}_${lang}`;
    const value = metadata[dynamicKey];
    return typeof value === "string" ? value : fallback;
  };


  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroContentLeft}>
          <h3 className={styles.heroTitle}>
            {getDynamic("heroTitle", tr.heroTitle)}{" "}
            <span className={styles.heroTitleHighlight}>
              {getDynamic("heroTitleHighlight", tr.heroTitleHighlight)}
            </span>
          </h3>

          <p className={styles.heroDescription}>
            {getDynamic("heroDescription", tr.heroDescription)}{" "}
            <span className={styles.heroDescriptionHighlight}>
              {getDynamic(
                "heroDescriptionHighlight",
                tr.heroDescriptionHighlight,
              )}
            </span>{" "}
            {getDynamic("heroDescriptionEnd", tr.heroDescriptionEnd)}
          </p>

          <div className={styles.location}>
            <Image
              src={locationIcon}
              alt="location"
              width={20}
              height={20}
              className={styles.locationIcon}
            />
            <span>{getDynamic("location", tr.location)}</span>
          </div>
        </div>

        <div className={styles.heroContentRight}>
          <div className={styles.imageWrapper}>
            <Image
              src={HeroImage}
              alt="hero-image"
              fill
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </div>
      <div className={styles.heroActions}>
        <Link href="#courses">
          <Button className={styles.browseButton}>
            {getDynamic("browseCourses", tr.browseCourses)}
          </Button>
        </Link>
      </div>
      <div className={styles.mainTitleBlock}>
        <div className={styles.watermarkWrapper}>
          <div className={styles.decorationRectangle}>
            <Image
              src={RectangleHero}
              alt="decoration"
              fill
              className={styles.decorationImage}
            />
          </div>
          <h1 className={styles.mainTitleH1}>{getDynamic("mainTitleBlock", tr.mainTitleBlock)}</h1>
        </div>
      </div>
    </section>
  );
};
