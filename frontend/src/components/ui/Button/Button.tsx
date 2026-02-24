"use client";

import React from 'react'
import styles from './Button.module.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'white' | 'outline' | 'dark-outline' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'custom'
    rounded?: 'xl' | 'full'
    isLoading?: boolean
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    rounded = 'xl',
    isLoading,
    className = "",
    ...props
}: ButtonProps) => {

    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        styles[`rounded-${rounded}`],
        className
    ].filter(Boolean).join(' ')

    return (
        <button
            className={classNames}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <span className={styles.spinner}></span>
                    Загрузка...
                </span>
            ) : children}
        </button>
    )
}
