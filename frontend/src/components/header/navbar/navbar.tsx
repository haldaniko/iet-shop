"use client";

import Link from "next/link";
import { CoursesDropdown } from "@/components/header/CoursesDropdown/CoursesDropdown";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";
import { NavLinks, type SimpleLink } from "@/components/ui/NavLinks/NavLinks";
import styles from "./Navbar.module.scss";

interface NavLink {
  key: keyof typeof t.en;
  href: string;
  hasDropdown: boolean;
}

const navLinks: NavLink[] = [
  { key: "courses", href: "/courses", hasDropdown: true },
  { key: "events", href: "/events", hasDropdown: false },
  { key: "blog", href: "/blog", hasDropdown: false },
  { key: "contact", href: "/contact", hasDropdown: false },
];

export const Navbar = () => {
  const { lang } = useLanguage();
  const tr = t[lang];

  const simpleLinks: SimpleLink[] = navLinks
    .filter((link) => !link.hasDropdown)
    .map((link) => ({
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
