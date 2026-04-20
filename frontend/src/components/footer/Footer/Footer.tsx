"use client";

import { useState, MouseEvent } from "react";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { NavLinks, type SimpleLink } from "@/components/ui/NavLinks/NavLinks";
import { Modal } from "@/components/ui/Modal/Modal";
import { PrivacyPolicyModal } from "@/components/ui/PrivacyPolicyModal/PrivacyPolicyModal";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from "./Footer.module.scss";
import { ChatButton } from "@/components/ui/ChatButton/ChatButton";
import { ChatWidget } from "@/components/ui/ChatWidget/ChatWidget";
import { CookiePolicyModal } from "@/components/ui/CookiePolicyModal/CookiePolicyModal";

import euProjectImg from "@/assets/Plakat-IOT-Digi.jpg";
import {
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconYouTube
} from "@/components/icons";
import { Logo } from "@/components/header/Logo/Logo";
import { getTags, type Tag } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ciscoLogo from "@/assets/Partners/cisco.png";
import microsoftLogo from "@/assets/Partners/microsoft.png";
import autodeskLogo from "@/assets/Partners/autodesc.png";


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
      href: "https://www.facebook.com/innovativeedutech/",
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
    email: "office.inovativni@gmail.com",
  },
  legal: {
    title: "Legal",
    links: [
      { label: "EU Project Information", href: "#", translationKey: "footerLegalEuInfo" },
      // { label: "Terms and Conditions", href: "#", translationKey: "footerLegalTerms" },
      { label: "Cookie Settings", href: "#", translationKey: "footerLegalCookies" },
      { label: "Cookie Policy", href: "#", translationKey: "footerLegalCookiePolicy" },
      { label: "Privacy Policy", href: "#", translationKey: "footerLegalPrivacy" },
    ],
  },
  courses: {
    title: "Courses",
    links: [
      { label: "Design", href: "/#courses", translationKey: "footerCourseDesign" },
      { label: "Marketing", href: "/#courses", translationKey: "footerCourseMarketing" },
      { label: "Coding", href: "/#courses", translationKey: "footerCourseCoding" },
      { label: "For Kids", href: "/#courses", translationKey: "footerCourseKids" },
      { label: "SMM", href: "/#courses", translationKey: "footerCourseSmm" },
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

const getTagLabel = (tag: Tag, lang: "en" | "bg") => {
  const fallbackName = tag.name;
  let localizedFromName: string | undefined;

  if (typeof fallbackName === "string") {
    localizedFromName = fallbackName;
  } else if (fallbackName && typeof fallbackName === "object") {
    localizedFromName = lang === "bg" ? fallbackName.bg : fallbackName.en;
  }

  return (lang === "bg" ? tag.name_bg : tag.name_en) || localizedFromName || "";
};

export const Footer = ({ config }: FooterProps) => {
  const { lang } = useLanguage();
  const tr = translations[lang] ?? translations.bg;
  const [isEuModalOpen, setIsEuModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCookiePolicyOpen, setIsCookiePolicyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categories, setCategories] = useState<Tag[]>([]);
  const router = useRouter();

  useEffect(() => {
    getTags().then(tags => {
      setCategories(tags);
    });
  }, []);

  const {
    companyName,
    logoText,
    socials,
    contact,
    legal,
    courses,
    bottomText,
  } = mergeConfig(config);

  const handleOpenEuModal = (e: MouseEvent) => {
    e.preventDefault();
    setIsEuModalOpen(true);
  };

  const handleOpenPrivacy = (e: MouseEvent) => {
    e.preventDefault();
    setIsPrivacyOpen(true);
  };

  const handleOpenCookie = (e: MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-cookie-banner"));
  };

  const handleOpenCookiePolicy = (e: MouseEvent) => {
    e.preventDefault();
    setIsCookiePolicyOpen(true);
  };

  useEffect(() => {
    const handlePolicyOpen = () => setIsCookiePolicyOpen(true);
    window.addEventListener("open-cookie-policy", handlePolicyOpen);
    return () => window.removeEventListener("open-cookie-policy", handlePolicyOpen);
  }, []);

  const handleToggleChat = () => {
    setIsChatOpen((current) => !current);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
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

  const legalLinks: SimpleLink[] = legal.links.map((item) => {
    let onClick = undefined;
    if (item.translationKey === "footerLegalEuInfo") onClick = handleOpenEuModal;
    else if (item.translationKey === "footerLegalPrivacy") onClick = handleOpenPrivacy;
    else if (item.translationKey === "footerLegalCookies") onClick = handleOpenCookie;
    else if (item.translationKey === "footerLegalCookiePolicy") onClick = handleOpenCookiePolicy;

    return {
      label: item.translationKey ? tr[item.translationKey] : item.label,
      href: item.href,
      external: item.external,
      onClick,
    };
  });

  const scrollToSection = (sectionId: string, extraParams?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);

    const targetUrl = extraParams
      ? `/${lang}/?${extraParams}#${sectionId}`
      : `/${lang}/#${sectionId}`;

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      router.push(targetUrl, { scroll: false });
    } else {
      window.location.href = targetUrl;
    }
  };

  const coursesLinks: SimpleLink[] = categories.length > 0
    ? categories.map(tag => {
      const label = getTagLabel(tag, lang);
      return {
        label,
        href: `/#courses`,
        onClick: scrollToSection("courses", `courseTag=${tag.id}`),
      };
    })
    : courses.links.map((item) => ({
      label: item.translationKey ? tr[item.translationKey] : item.label,
      href: "/#courses",
      onClick: scrollToSection(
        "courses",
        item.translationKey === "footerCourseKids" ? "audience=kids" : undefined
      ),
      external: item.external,
    }));


  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.companyColumn}>
              <div className={styles.company}>
                <Logo className={styles.footerLogo} />
                <div className={styles.companyName}>{companyNameText}</div>
                {socials.length > 0 && (
                  <div className={styles.socials}>
                    {socials.map((social) => {
                      let Icon = null;
                      if (social.name === "facebook") Icon = IconFacebook;
                      else if (social.name === "instagram") Icon = IconInstagram;
                      else if (social.name === "linkedin") Icon = IconLinkedIn;
                      else if (social.name === "youtube") Icon = IconYouTube;

                      return (
                        <Link
                          key={social.name}
                          href={social.href}
                          aria-label={social.label}
                          className={styles.socialBtn}
                          target={social.href.startsWith("http") ? "_blank" : undefined}
                          rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                        >
                          {Icon ? <Icon className={styles.socialIcon} /> : social.label[0]}
                        </Link>
                      );
                    })}
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
                  rounded="xl"
                  variant="primary"
                  onClick={scrollToSection("consultation")}
                >
                  {tr.leaveRequest}
                </Button>
              </div>
              <ChatButton 
                onClick={handleToggleChat} 
                isOpen={isChatOpen} 
                liveLabel={tr.chatLive}
                closeLabel={tr.chatClose}
              />
            </div>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.partnered}>
              <div className={styles.partneredLabel}>{partneredText}</div>
              <div className={styles.partners}>
                <Image src={ciscoLogo} alt="Cisco" height={24} className={styles.partnerLogo} />
                <Image src={microsoftLogo} alt="Microsoft" height={24} className={styles.partnerLogo} />
                <Image src={autodeskLogo} alt="Autodesk" height={24} className={styles.partnerLogo} />
              </div>
            </div>

            <div className={styles.bottom}>
              <span>{bottomTextText}</span>
            </div>
          </div>
        </div>
      </footer>
      <Modal isOpen={isEuModalOpen} onClose={() => setIsEuModalOpen(false)}>
        <div style={{ textAlign: "center" }}>
          <Image
            src={euProjectImg}
            alt="EU Project Information"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
          />
        </div>
      </Modal>
      <ChatWidget isOpen={isChatOpen} onClose={handleCloseChat} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CookiePolicyModal isOpen={isCookiePolicyOpen} onClose={() => setIsCookiePolicyOpen(false)} />
    </>
  );
};
