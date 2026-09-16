"use client";

import { Project } from "@/types/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderGit2, Pin, EyeOff, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useProjectsStore } from "@/stores/projects-store";
import { cn } from "@/lib/utils";

interface RepoCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function RepoCard({ project, onEdit }: RepoCardProps) {
  const { updateProject, deleteProject } = useProjectsStore();

  const togglePin = () => updateProject(project.id, { pinned: !project.pinned });
  const toggleHide = () => updateProject(project.id, { hidden: !project.hidden });

  return (
    <Card className={cn(
      "flex flex-col h-full transition-all group",
      project.hidden && "opacity-60 grayscale-[0.5]"
    )}>
      <CardHeader className="pb-3 flex-row justify-between items-start space-y-0 gap-4">
        <div className="space-y-1 overflow-hidden">
          <CardTitle className="flex items-center gap-2 text-lg truncate" title={project.name}>
            {project.source === 'github' ? <FolderGit2 className="w-4 h-4 shrink-0" /> : null}
            <span className="truncate">{project.name}</span>
          </CardTitle>
          <CardDescription className="line-clamp-2" title={project.description}>
            {project.description || "No description provided."}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePin} title={project.pinned ? "Unpin" : "Pin"}>
            <Pin className={cn("w-4 h-4", project.pinned && "fill-current text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleHide} title={project.hidden ? "Unhide" : "Hide"}>
            <EyeOff className={cn("w-4 h-4", project.hidden && "text-destructive")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end gap-4">
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.techStack.slice(0, 5).map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs font-normal px-2 py-0">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 5 && (
            <Badge variant="outline" className="text-xs font-normal px-2 py-0">
              +{project.techStack.length - 5}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onEdit(project)}>
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            {project.source === 'manual' && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => {
                if (confirm('Delete this project?')) deleteProject(project.id);
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
          {project.githubUrl && (
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.open(project.githubUrl, '_blank')} title="View on GitHub">
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
