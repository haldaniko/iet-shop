"use client";

import React, { useState } from 'react';
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "./translations";
import styles from "./ConsultationSection.module.scss";
import { Button } from "@/components/ui/Button/Button";
import Link from 'next/link';

export const ConsultationSection = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    privacyAccepted: false
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    privacy: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Reset error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: formData.name.trim() === '',
      email: !validateEmail(formData.email),
      phone: formData.phone.trim().length < 6,
      privacy: !formData.privacyAccepted
    };

    setErrors(newErrors);

    const hasNoErrors = !Object.values(newErrors).some(val => val === true);

    if (hasNoErrors) {
      setIsSubmitting(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Form data submitted:', formData);
        setIsSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.section}>
        <div className={styles.container}>
          <div className={styles.successMessage}>
            {t.successMessage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="consultation" className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.description}>{t.description}</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="name"
              placeholder={t.namePlaceholder}
              className={`${styles.field} ${errors.name ? styles.hasError : ''}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className={styles.errorText}>{t.errorName}</span>}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder={t.emailPlaceholder}
              className={`${styles.field} ${errors.email ? styles.hasError : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className={styles.errorText}>{t.errorEmail}</span>}
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.phoneFieldWrapper} ${errors.phone ? styles.hasError : ''}`}>
              <div className={styles.flagWrapper}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg"
                  alt="BG"
                  className={styles.flag}
                />
                <span className={styles.countryCode}>+359</span>
              </div>
              <input
                type="tel"
                name="phone"
                placeholder={t.phonePlaceholder}
                className={styles.phoneInput}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && <span className={styles.errorText}>{t.errorPhone}</span>}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="interest"
              placeholder={t.interestPlaceholder}
              className={styles.field}
              value={formData.interest}
              onChange={handleChange}
            />
          </div>

          <div className={styles.privacy} onClick={() => setFormData(p => ({ ...p, privacyAccepted: !p.privacyAccepted }))}>
            <div className={`${styles.checkboxWrapper} ${formData.privacyAccepted ? styles.checked : ''} ${errors.privacy ? styles.hasError : ''}`}>
              {formData.privacyAccepted && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={styles.privacyText}>
              {t.privacyPrefix}
              <Link href="/privacy" className={styles.link} onClick={(e) => e.stopPropagation()}>
                {t.privacyLink}
              </Link>
              {t.privacySuffix}
            </span>
          </div>

          <div className={styles.submitWrapper}>
            <Button
              type="submit"
              className={styles.submitButton}
              isLoading={isSubmitting}
              variant="primary"
              size="lg"
              rounded="full"
            >
              {t.buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
