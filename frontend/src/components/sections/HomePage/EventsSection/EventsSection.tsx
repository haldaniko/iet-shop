"use client";

import React, { useState, useRef } from "react";
import styles from "./EventsSection.module.scss";
import { useTranslate } from "@/lib/useTranslate";
import { translations, type EventsTranslations } from "./translations";
import { EventCard } from "@/components/ui/EventCard/EventCard";
import { IconArrowDown } from "@/components/icons";
import { Event } from "@/lib/api";
import { EventRegistrationModal } from "@/components/ui/EventRegistrationModal/EventRegistrationModal";

interface EventsSectionProps {
  events?: Event[];
}

export const EventsSection = ({ events = [] }: EventsSectionProps) => {
  const { t, lang } = useTranslate<EventsTranslations>(translations);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openEventId, setOpenEventId] = useState<number | null>(null);

  const toggleExpanded = () => {
    if (isExpanded && cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsExpanded(!isExpanded);
  };

  const handleJoinClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = [...events]
    .filter((event) => !event.date || event.date >= today)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  const hasMore = upcomingEvents.length > 3;

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} id="events">
      <div className={styles.container}>
        <div className={styles.titleWrapper}>
          <div className={styles.badge}>
            <span>{t.badge}</span>
          </div>
          <h2 className={styles.title}>{t.title}</h2>
        </div>

        <div 
          className={`${styles.scrollContainer} ${isExpanded ? styles.expanded : ''} ${openEventId ? styles.hasOpenedCard : ''}`} 
          ref={cardsRef}
        >
          <div className={styles.eventsList}>
            {upcomingEvents.map((event) => {
              const dateObj = new Date(event.date);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
                : event.date;

              const title = typeof event.title === 'object' && event.title
                ? (event.title[lang === 'bg' ? 'bg' : 'en'] || event.title.en || event.title.bg || "")
                : event.title;

              const eventTags = event.tags.map(tag => {
                const tagName = tag.name;
                if (typeof tagName === 'object' && tagName) {
                  return tagName[lang === 'bg' ? 'bg' : 'en'] || tagName.en || tagName.bg || "";
                }
                return tagName || "";
              });

              const description = typeof event.description === 'object' && event.description
                ? (event.description[lang === 'bg' ? 'bg' : 'en'] || event.description.en || event.description.bg || "")
                : event.description;

              return (
                <EventCard
                  key={event.id}
                  title={String(title || "")}
                  date={formattedDate}
                  tags={eventTags.map(String)}
                  location={event.type}
                  description={String(description || "")}
                  image1={event.image_1}
                  image2={event.image_2}
                  joinBtnText={t.joinBtn}
                  onJoin={() => handleJoinClick(event)}
                  isOpened={openEventId === event.id}
                  onToggle={() => setOpenEventId(prev => prev === event.id ? null : event.id)}
                />
              );
            })}
          </div>
        </div>

        {hasMore && (
          <button
            className={`${styles.scrollBtn} ${isExpanded ? styles.rotated : ''}`}
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse events" : "Expand all events"}
          >
            <IconArrowDown />
          </button>
        )}
      </div>

      <EventRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </section>
  );
};
