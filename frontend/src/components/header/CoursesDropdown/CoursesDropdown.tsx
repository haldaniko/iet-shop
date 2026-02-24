"use client";

import Link from "next/link";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/translations";
import styles from "./CoursesDropdown.module.scss";

export const CoursesDropdown = () => {
    const { lang } = useLanguage();
    const tr = t[lang];

    const courseLinks = [
        { label: tr.allCourses, href: "/courses" },
        { label: tr.online, href: "/courses/online" },
        { label: tr.offline, href: "/courses/offline" },
    ];

    return (
        <Dropdown
            trigger={
                <span className={styles.navLink}>
                    {tr.courses}
                </span>
            }
        >
            {courseLinks.map(({ label, href }) => (
                <DropdownItem key={href}>
                    <Link href={href} style={{ width: '100%' }}>
                        {label}
                    </Link>
                </DropdownItem>
            ))}
        </Dropdown>
    );
};
