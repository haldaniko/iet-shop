import { BlogPage } from "@/components/pages/BlogPage/BlogPage";
import { getPostBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    return <BlogPage post={post} slug={slug} />;
}
