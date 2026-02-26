import React from "react";
import styles from "./BlogCard.module.scss";
import { IconExternalLink, IconHelpBtn } from "@/components/icons";
import Link from "next/link";

export interface BlogCardProps {
  id: string;
  tags: string[];
  author: string;
  title: string;
  description: string;
  slug: string;
}

export const BlogCard = ({
  tags,
  author,
  title,
  description,
  slug,
}: BlogCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.tags}>
          {tags.map((tag, idx) => (
            <span key={idx} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <Link 
            href={`/blog/${slug}`}
            className={styles.actionLink}
            aria-label="Read full post">
                
          <IconHelpBtn />
        </Link>
      </div>

      <div className={styles.imageWrapper}>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.content}>
        <span className={styles.author}>{author}</span>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};
