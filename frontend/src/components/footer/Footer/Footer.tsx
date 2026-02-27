"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { NavLinks, type SimpleLink } from "@/components/ui/NavLinks/NavLinks";
import { Modal } from "@/components/ui/Modal/Modal";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from "./Footer.module.scss";
// Импортируем плакат на случай если это он
import euProjectImg from "@/assets/Plakat-IOT-Digi.jpg";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  translationKey?: keyof typeof translations.en;
};

type SocialLink = {
  name: string;
  label: string;
  href: string;
};

type FooterConfig = {
  companyName: string;
  logoText?: string;
  socials: SocialLink[];
  contact: {
    title: string;
    addressLines: string[];
    phone?: string;
    email?: string;
  };
  legal: {
    title: string;
    links: FooterLink[];
  };
  courses: {
    title: string;
    links: FooterLink[];
  };
  bottomText: string;
};

const defaultConfig: FooterConfig = {
  companyName: "Innovative Educational Technologies",
  logoText: "LOGO",
  socials: [
    {
      name: "facebook",
      label: "Facebook",
      href: "#",
    },
    {
      name: "linkedin",
      label: "LinkedIn",
      href: "#",
    },
    {
      name: "instagram",
      label: "Instagram",
      href: "#",
    },
    {
      name: "youtube",
      label: "YouTube",
      href: "#",
    },
  ],
  contact: {
    title: "Contact",
    addressLines: ["188 Slivnica Blvd", "Sofia, Bulgaria"],
    phone: "+359 87 532 9945",
    email: "email_office@gmail.com",
  },
  legal: {
    title: "Legal",
    links: [
      { label: "EU Project Information", href: "#", translationKey: "footerLegalEuInfo" },
      { label: "Terms and Conditions", href: "#", translationKey: "footerLegalTerms" },
      { label: "Cookie Settings", href: "#", translationKey: "footerLegalCookies" },
      { label: "Privacy Policy", href: "#", translationKey: "footerLegalPrivacy" },
    ],
  },
  courses: {
    title: "Courses",
    links: [
      { label: "Design", href: "#", translationKey: "footerCourseDesign" },
      { label: "Marketing", href: "#", translationKey: "footerCourseMarketing" },
      { label: "Coding", href: "#", translationKey: "footerCourseCoding" },
      { label: "For Kids", href: "#", translationKey: "footerCourseKids" },
      { label: "SMM", href: "#", translationKey: "footerCourseSmm" },
    ],
  },
  bottomText: "© 2026 Innovative Educational Technologies. All rights reserved.",
};

interface FooterProps {
  config?: Partial<FooterConfig>;
}

const mergeConfig = (custom?: Partial<FooterConfig>): FooterConfig => {
  if (!custom) return defaultConfig;

  return {
    ...defaultConfig,
    ...custom,
    contact: {
      ...defaultConfig.contact,
      ...custom.contact,
      addressLines: custom.contact?.addressLines ?? defaultConfig.contact.addressLines,
    },
    legal: {
      ...defaultConfig.legal,
      ...custom.legal,
      links: custom.legal?.links ?? defaultConfig.legal.links,
    },
    courses: {
      ...defaultConfig.courses,
      ...custom.courses,
      links: custom.courses?.links ?? defaultConfig.courses.links,
    },
  };
};

export const Footer = ({ config }: FooterProps) => {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    companyName,
    logoText,
    socials,
    contact,
    legal,
    courses,
    bottomText,
  } = mergeConfig(config);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const companyNameText = tr.footerCompanyName ?? companyName;
  const partneredText = tr.footerPartnered ?? "Partnered with";
  const contactTitle = tr.contact ?? contact.title;
  const legalTitle = tr.footerLegalTitle ?? legal.title;
  const coursesTitle = tr.footerCoursesTitle ?? courses.title;
  const addressLines = [
    tr.footerAddressLine1 ?? contact.addressLines[0],
    tr.footerAddressLine2 ?? contact.addressLines[1],
  ].filter(Boolean);
  const phoneText = tr.footerPhone ?? contact.phone;
  const emailText = tr.footerEmail ?? contact.email;
  const bottomTextText = tr.footerCopyright ?? bottomText;

  const legalLinks: SimpleLink[] = legal.links.map((item) => ({
    label: item.translationKey ? tr[item.translationKey] : item.label,
    href: item.href,
    external: item.external,
    onClick: item.translationKey === "footerLegalEuInfo" ? handleOpenModal : undefined,
  }));

  const coursesLinks: SimpleLink[] = courses.links.map((item) => ({
    label: item.translationKey ? tr[item.translationKey] : item.label,
    href: item.href,
    external: item.external,
  }));

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.companyColumn}>
              <div className={styles.company}>
                <div className={styles.companyName}>{companyNameText}</div>
                {logoText && <div className={styles.logo}>{logoText}</div>}
                {socials.length > 0 && (
                  <div className={styles.socials}>
                    {socials.map((social) => (
                      <Link
                        key={social.name}
                        href={social.href}
                        aria-label={social.label}
                        className={styles.socialBtn}
                        target={social.href.startsWith("http") ? "_blank" : undefined}
                        rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {social.label[0]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.contactColumn}>
              <div className={styles.contact}>
                <div className={styles.sectionTitle}>{contactTitle}</div>
                {addressLines.length > 0 && (
                  <a
                    href={`https://www.google.com/maps/place/%D0%A1%D0%BE%D1%84%D0%B8%D1%8F+%D1%86%D0%B5%D0%BD%D1%82%D1%8A%D1%80,+%D0%B1%D1%83%D0%BB.+%E2%80%9E%D0%A1%D0%BB%D0%B8%D0%B2%D0%BD%D0%B8%D1%86%D0%B0%E2%80%9C+188,+1202+%D0%A1%D0%BE%D1%84%D0%B8%D1%8F/@42.7041318,23.3235039,712m/data=!3m1!1e3!4m6!3m5!1s0x40aa8563f8421bf3:0x4df1a54061df705a!8m2!3d42.7041591!4d23.3281138!16s%2Fg%2F11jz4lftph?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    {addressLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </a>
                )}
                {phoneText && (
                  <a href={`tel:${phoneText.replace(/\s+/g, "")}`} className={styles.contactLink}>
                    {phoneText}
                  </a>
                )}
                {emailText && (
                  <a href={`mailto:${emailText}`} className={styles.contactLink}>
                    {emailText}
                  </a>
                )}
              </div>

              <div className={styles.legal}>
                <div className={styles.sectionTitle}>{legalTitle}</div>
                <NavLinks links={legalLinks} />
              </div>
            </div>

            <div className={styles.coursesColumn}>
              <div className={styles.courses}>
                <div className={styles.sectionTitle}>{coursesTitle}</div>
                <NavLinks links={coursesLinks} />
              </div>
            </div>

            <div className={styles.actionColumn}>
              <div className={styles.leaveRequest}>
                <Button
                  type="button"
                  aria-label={tr.leaveRequest}
                  className={styles.leaveRequestBtn}
                  size="lg"
                  rounded="full"
                  variant="white"
                >
                  {tr.leaveRequest}
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.partnered}>
              <div>{partneredText}</div>
              <div className={styles.partners}>
                <div className={styles.partnerLogo} />
                <div className={styles.partnerLogo} />
              </div>
            </div>

            <div className={styles.bottom}>
              <span>{bottomTextText}</span>
            </div>
          </div>
        </div>
      </footer>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ textAlign: "center" }}>
          <Image
            src={euProjectImg}
            alt="EU Project Information"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
          />
        </div>
      </Modal>
    </>
  );
};
