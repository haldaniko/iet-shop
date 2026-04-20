import React from "react";
import styles from "./ChatButton.module.scss";

interface ChatButtonProps {
    isOpen: boolean;
    onClick: () => void;
    liveLabel: string;
    closeLabel: string;
}

export const ChatButton = ({ isOpen, onClick, liveLabel, closeLabel }: ChatButtonProps) => {
    return (
        <div className={styles.btnWrapper}>
            <button className={styles.chatButton} onClick={onClick}>
                {isOpen ? closeLabel : liveLabel}
            </button>
        </div>
    );
};
