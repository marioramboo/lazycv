"use client";

import { Project } from "@/types/project";
import { RepoCard } from "./RepoCard";
import { cn } from "@/lib/utils";
import { FolderGit2 } from "lucide-react";

interface RepoListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onEdit: (project: Project) => void;
}

export function RepoList({ projects, viewMode, onEdit }: RepoListProps) {
  if (projects.length === 0) {
    return (
      <div className="py-24 text-center border rounded-lg border-dashed bg-muted/20">
        <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No projects found</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">
          Sync your GitHub account or manually add projects to see them here. Try adjusting your filters if you have projects.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      viewMode === 'grid' 
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    )}>
      {projects.map(project => (
        <RepoCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}
