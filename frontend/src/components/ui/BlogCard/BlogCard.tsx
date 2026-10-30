"use client";

import React from "react";
import styles from "./BlogCard.module.scss";
import { IconArrowUpRight } from "@/components/icons";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink/LocalizedLink";
import { useRouter } from 'next/navigation';
import { Tag } from "@/lib/api";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import { useBlog } from "@/lib/BlogContext";
import { Post } from "@/lib/api";

export interface BlogCardProps {
  id: number;
  tags: Tag[];
  author: string;
  title: string;
  excerpt?: string;
  slug: string;
  created_at: string;
  picture?: string;
  fullPost?: Post;
}

const asText = (value: unknown, lang: "en" | "bg") => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const localized = value as { en?: string; bg?: string };
    return (lang === "bg" ? localized.bg : localized.en) || localized.en || localized.bg || "";
  }
  return "";
};

export const BlogCard = ({
  tags,
  author,
  title,
  excerpt,
  slug,
  created_at,
  picture,
  fullPost,
}: BlogCardProps) => {
  const router = useRouter();
  const { lang } = useLanguage();
  const { setSelectedBlog } = useBlog();
  const publicationDate = fullPost?.published_at || created_at;
  const formattedDate = publicationDate
    ? new Date(publicationDate).toLocaleDateString(lang === "bg" ? "bg-BG" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleCardClick = () => {
    if (fullPost) {
      setSelectedBlog(fullPost);
    }
    router.push(`/${lang}/blog/${slug}`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.top}>
        <div className={styles.tags}>
          {tags.map((tag) => {
            const tagName = asText(lang === 'bg' ? tag.name_bg || tag.name : tag.name_en || tag.name, lang);
            return (
              <span key={tag.id} className={styles.tag}>
                {tagName}
              </span>
            );
          })}
        </div>
        <Link
          href={`/blog/${slug}`}
          className={styles.actionLink}
          aria-label="Read full post"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.arrowCircle}>
            <IconArrowUpRight className={styles.arrowIcon} />
          </div>
        </Link>
      </div>

      <div className={styles.imageWrapper}>
        {picture ? (
          <Image
            src={picture.startsWith('http') ? picture : `/${picture}`}
            alt={title}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 509px"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.authorLabel}>{author}</div>
        {formattedDate ? (
          <time className={styles.publicationDate} dateTime={publicationDate}>
            {lang === "bg" ? "Публикувано на" : "Published on"} {formattedDate}
          </time>
        ) : null}
        <h4 className={styles.title}>{title}</h4>
        {excerpt && <p className={styles.description}>{excerpt}</p>}
      </div>
    </div>
  );
};
