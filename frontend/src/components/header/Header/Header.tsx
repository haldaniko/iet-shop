import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/header/navbar/navbar";
import { IconBag, IconUser } from "@/components/icons";
import { RequestButton } from "@/components/header/RequestButton/RequestButton";
import { LanguageDropdown } from "@/components/header/LanguageDropdown/LanguageDropdown";
import styles from "./Header.module.scss";

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.inner}>

                    {/* LOGO + NAV */}
                    <div className={styles.left}>
                        <Link href="/" className={styles.logo}>
                            <span>IOT</span>
                        </Link>

                        <div className={styles.navbarHidden}>
                            <Navbar />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className={styles.actions}>
                        <Link href="/cart" className={styles.actionIcon}>
                            <IconBag />
                        </Link>

                        <LanguageDropdown />

                        <Link href="/account" className={styles.actionIcon}>
                            <IconUser />
                        </Link>

                        <RequestButton />
                    </div>
                </div>
            </div>
        </header>
    );
};
