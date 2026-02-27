"use client";

import Link from "next/link";
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
  { key: "events", href: "/events" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
];

export const Navbar = () => {
  const { lang } = useLanguage();
  const tr = translations[lang];

  const simpleLinks: SimpleLink[] = navLinks.map((link) => ({
    label: tr[link.key],
    href: link.href,
  }));

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li>
          <CoursesDropdown />
        </li>
        <NavLinks links={simpleLinks} linkClassName={styles.navLink} asListItems />
      </ul>
    </nav>
  );
};
