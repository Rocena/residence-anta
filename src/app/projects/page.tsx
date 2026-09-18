import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const projects = db.getProjects();
  
  return (
    <>
      <ProjectsClient initialProjects={projects} />
    </>
  );
}
