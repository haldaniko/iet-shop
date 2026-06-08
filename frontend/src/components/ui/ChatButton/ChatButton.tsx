import React from "react";
import styles from "./ChatButton.module.scss";

interface ChatButtonProps {
    isOpen: boolean;
    onClick: () => void;
    liveLabel: string;
    closeLabel: string;
}

export const ChatButton = ({ isOpen, onClick, liveLabel, closeLabel }: ChatButtonProps) => {
    if (isOpen) {
        return null;
    }

    return (
        <div className={styles.btnWrapper}>
            <button className={styles.chatButton} onClick={onClick} aria-label={liveLabel} title={liveLabel}>
                <svg className={styles.chatIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M7.5 17.25L4.5 20.25V7.75C4.5 6.50736 5.50736 5.5 6.75 5.5H17.25C18.4926 5.5 19.5 6.50736 19.5 7.75V15.25C19.5 16.4926 18.4926 17.5 17.25 17.5H8.05C7.85671 17.5 7.67145 17.5778 7.5 17.25Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8 9.25H16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 12.25H14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
                <span className={styles.srOnly}>{closeLabel}</span>
            </button>
        </div>
    );
};
