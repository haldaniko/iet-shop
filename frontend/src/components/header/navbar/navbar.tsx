"use client";

import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import { CoursesDropdown } from "@/components/header/CoursesDropdown/CoursesDropdown";
import { useLanguage } from "@/lib/LanguageContext";
import { NavLinks, type SimpleLink } from "@/components/ui/NavLinks/NavLinks";
import { translations } from "./translations";
import styles from "./Navbar.module.scss";

type NavKey = keyof typeof translations.en;

interface NavLink {
  key: NavKey;
  href: string;
}

const navLinks: NavLink[] = [
  { key: "events", href: "/#events" },
  { key: "projects", href: "/projects" },
  { key: "blog", href: "/#blog" },
  { key: "contact", href: "/#consultation" },
];

interface NavbarProps {
  onLinkClick?: () => void;
}

export const Navbar = ({ onLinkClick }: NavbarProps) => {
  const { lang } = useLanguage();
  const tr = translations[lang] ?? translations.bg;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onLinkClick?.();

    const [path, hash] = href.split('#');
    if (!hash) return;

    // Check if we are on the same page (considering the lang prefix)
    const currentPurePath = window.location.pathname.replace(`/${lang}`, '') || '/';
    const targetPurePath = path || '/';

    if (currentPurePath === targetPurePath) {
      const el = document.getElementById(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        // Update hash in URL without jump
        window.history.pushState(null, '', href.startsWith('/') ? href : `/${lang}${href}`);
      }
    }
  };

  const simpleLinks: SimpleLink[] = navLinks.map((link) => ({
    label: tr[link.key],
    href: link.href,
    onClick: (e: any) => handleAnchorClick(e, link.href),
  }));

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li>
          <CoursesDropdown onLinkClick={onLinkClick} />
        </li>
        <NavLinks links={simpleLinks} linkClassName={styles.navLink} asListItems />
      </ul>
    </nav>
  );
};
