"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
}

export const Dropdown = ({ trigger, children, align = "left" }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className={styles.dropdownWrapper}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={styles.trigger}
            >
                {trigger}
            </button>

            {isOpen && (
                <div className={`${styles.menu} ${styles[align]}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const DropdownItem = ({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick?: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={styles.item}
    >
        {children}
    </button>
);
