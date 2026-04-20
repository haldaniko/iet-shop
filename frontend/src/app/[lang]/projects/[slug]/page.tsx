import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/pages/ProjectsPage/ProjectDetailPage";
import { getProjectBySlug, getProjects } from "@/lib/api";
import { i18n } from "@/i18n-config";

export async function generateStaticParams() {
  const projects = await getProjects();
  const paths: { lang: string; slug: string }[] = [];

  i18n.locales.forEach((locale) => {
    projects.forEach((project) => {
      if (project.slug) {
        paths.push({ lang: locale, slug: project.slug });
      }
    });
  });

  return paths;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getProjects();
  const relatedProjects = allProjects.filter((item) => item.slug !== slug).slice(0, 4);

  return <ProjectDetailPage project={project} relatedProjects={relatedProjects} />;
}
