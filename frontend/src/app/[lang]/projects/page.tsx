import { ProjectsPage } from "@/components/pages/ProjectsPage/ProjectsPage";
import { getProjects } from "@/lib/api";

export default async function Page() {
  const projects = await getProjects();

  return <ProjectsPage projects={projects} />;
}
