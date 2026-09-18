import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import ProjectDetailClient from "./ProjectDetailClient";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const projects = db.getProjects();
  // case insensitive search
  const project = projects.find((p: any) => p.id.toLowerCase() === resolvedParams.id.toLowerCase());
  
  if (!project) {
    return notFound();
  }

  return (
    <>
      <ProjectDetailClient initialProject={project} />
    </>
  );
}
