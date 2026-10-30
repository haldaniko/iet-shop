"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { Post, getPostBySlug, getPosts } from "@/lib/api";
import styles from "./BlogPage.module.scss";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { useTranslate } from "@/lib/useTranslate";
import { HeroSectionBlog } from "@/components/sections/BlogPage/HeroSectionBlog/HeroSectionBlog";
import { BlogCard } from "@/components/ui/BlogCard/BlogCard";
import { CarouselNav } from "@/components/ui/CarouselNav/CarouselNav";
import { translations } from "./translations";
import { useBlog } from "@/lib/BlogContext";
import { localizedRichText, richTextToPlainText } from "@/lib/richText";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer/RichContentRenderer";

interface BlogPageProps {
    post?: Post;
    slug: string;
}

export const BlogPage = ({ post: initialPost, slug }: BlogPageProps) => {
    const { t, lang } = useTranslate(translations);
    const { selectedBlog } = useBlog();

    const [fetchedPost, setFetchedPost] = useState<Post | undefined | null>(undefined);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const postFromSource = React.useMemo(() => {
        const targetSlug = slug.toLowerCase().trim();
        if (selectedBlog && selectedBlog.slug?.toLowerCase().trim() === targetSlug) return selectedBlog;
        return initialPost;
    }, [selectedBlog, initialPost, slug]);

    useEffect(() => {
        if (!postFromSource && fetchedPost === undefined) {
            getPostBySlug(slug).then(res => setFetchedPost(res || null));
        }
    }, [postFromSource, fetchedPost, slug]);

    const finalPost = postFromSource || (fetchedPost === null ? undefined : fetchedPost);

    useEffect(() => {
        const loadRelated = async () => {
            const allPosts = await getPosts();
            setRelatedPosts(allPosts.filter(p => p.slug !== slug));
        };
        loadRelated();
    }, [slug]);

    const postTitle = (function () {
        const title = finalPost?.title;
        if (typeof title === 'string') return title;
        if (title && typeof title === 'object') return title[lang as keyof typeof title] || title.en || title.bg || "";
        return "";
    })();

    const postContent = localizedRichText(finalPost?.content, lang);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: t.blog, href: "/#blog" },
        { label: postTitle || slug }
    ];

    const formattedDate = (() => {
        if (finalPost?.created_at) {
            const locale = lang === "bg" ? "bg-BG" : "en-GB";
            return new Date(finalPost.created_at).toLocaleDateString(locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        }
        return "";
    })();

    // Carousel handlers
    const cardWidth = 509;
    const gap = 24;

    const scrollToStep = (index: number) => {
        if (carouselRef.current) {
            carouselRef.current.scrollTo({
                left: (cardWidth + gap) * index,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        if (relatedPosts.length <= 1) return;
        const nextIndex = (activeIndex + 1) % (relatedPosts.length);
        setActiveIndex(nextIndex);
        scrollToStep(nextIndex);
    };

    const handlePrev = () => {
        if (relatedPosts.length <= 1) return;
        const prevIndex = (activeIndex - 1 + relatedPosts.length) % relatedPosts.length;
        setActiveIndex(prevIndex);
        scrollToStep(prevIndex);
    };

    const handleGoTo = (index: number) => {
        setActiveIndex(index);
        scrollToStep(index);
    };

    return (
        <div className={styles.blogPageWrapper}>
            <Header />
            <main className={styles.blogPage}>
                <div className={styles.breadcrumbWrapper}>
                    <div className={styles.container}>
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                </div>

                <div className={styles.container}>
                    {!finalPost ? (
                        <div style={{ padding: '80px 0', textAlign: 'center' }}>
                            <div className={styles.loading}>{t.loading}</div>
                        </div>
                    ) : (
                        <>
                            <HeroSectionBlog
                                post={finalPost}
                                formattedDate={formattedDate}
                            />

                            <div className={styles.articleContentWrapper}>
                                <h1 className={styles.title}>{postTitle}</h1>
                                <div className={styles.content}>
                                    <RichContentRenderer content={postContent} />
                                </div>
                            </div>
                        </>
                    )}
                </div>


                {relatedPosts.length > 0 && (
                    <section className={styles.relatedSection}>
                        <div className={styles.container}>
                            <div className={styles.relatedHeader}>
                                <h2 className={styles.relatedTitle}>{t.relatedArticles}</h2>
                            </div>

                            <div className={styles.carouselWrapper} ref={carouselRef}>
                                <ul className={styles.blogList}>
                                    {relatedPosts.map((p) => {
                                        const pTitle = (function () {
                                            const title = p.title;
                                            if (typeof title === 'string') return title;
                                            if (title && typeof title === 'object') return title[lang as keyof typeof title] || title.en || title.bg || "";
                                            return "";
                                        })();
                                        const pContent = richTextToPlainText(localizedRichText(p.content, lang));
                                        return (
                                            <li key={p.id}>
                                                <BlogCard
                                                    id={p.id}
                                                    author={p.author}
                                                    title={pTitle || ""}
                                                    excerpt={(pContent || "").length > 150 ? (pContent || "").slice(0, 150) + "…" : pContent}
                                                    slug={p.slug}
                                                    tags={p.tags}
                                                    created_at={p.created_at}
                                                    picture={p.picture}
                                                    fullPost={p}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className={styles.carouselNavWrapper}>
                                <CarouselNav
                                    currentIndex={activeIndex}
                                    totalSteps={relatedPosts.length - 1}
                                    onNext={handleNext}
                                    onPrev={handlePrev}
                                    onGoTo={handleGoTo}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};
