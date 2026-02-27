"use client";

import React from "react";
import styles from "./EventsSection.module.scss";
import { useTranslate } from "@/lib/useTranslate";
import { translations } from "./translations";
import { EventCard } from "@/components/ui/EventCard/EventCard";
import { IconArrowDown } from "@/components/icons";
import { useVerticalScroll } from "@/lib/useVerticalScroll";

export const EventsSection = () => {
  const { t } = useTranslate(translations);

  const { containerRef, scrollNext } = useVerticalScroll({
    cardHeight: 148,
    gap: 24,
  });

  const canScroll = t.events.length > 3;

  return (
    <section className={styles.section} id="events">
      <div className={styles.container}>
        <div className={styles.eventsListContainer} ref={containerRef}>
          <div className={styles.eventsList}>
            {t.events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                joinBtnText={t.joinBtn}
                onJoin={() => console.log("Joining event:", event.id)}
              />
            ))}
          </div>
        </div>

        {canScroll && (
          <button className={styles.scrollBtn} onClick={scrollNext}>
            <IconArrowDown />
          </button>
        )}
      </div>
    </section>
  );
};
