"use client";

import { useEffect, useState } from "react";
import { useProjectsStore } from "@/stores/projects-store";
import { Project } from "@/types/project";
import { RepoList } from "@/components/projects/RepoList";
import { ManualProjectForm } from "@/components/projects/ManualProjectForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FolderGit2, Plus, RefreshCw, Search, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'pinned' | 'hidden' | 'github' | 'manual';

export default function ProjectsPage() {
  const { projects, isLoading, lastSynced, loadProjects, syncGitHub, addManualProject, updateProject } = useProjectsStore();
  
  const [githubToken, setGithubToken] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSync = async () => {
    if (!githubToken && !lastSynced) {
      alert("Please enter a GitHub Personal Access Token first.");
      return;
    }
    // If we have a token, we sync. If we already synced, we assume the server can use the token. Wait, the server needs the token.
    // So if no token is provided but it was synced, maybe the token is in settings?
    // Let's assume the user has to input it for now per requirements, or we save it locally in state.
    await syncGitHub(githubToken);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addManualProject(data);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'pinned' && !p.pinned) return false;
    if (filter === 'hidden' && !p.hidden) return false;
    if (filter === 'github' && p.source !== 'github') return false;
    if (filter === 'manual' && p.source !== 'manual') return false;
    if (filter === 'all' && p.hidden) return false; // Default: don't show hidden

    if (search) {
      const q = search.toLowerCase();
      const inName = p.name.toLowerCase().includes(q);
      const inTech = p.techStack.some(t => t.toLowerCase().includes(q));
      if (!inName && !inTech) return false;
    }

    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage repositories and manual projects.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingProject(null); setIsFormOpen(true); }} variant="default">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-sm font-medium">GitHub Integration</label>
            <div className="flex gap-2 w-full">
              <Input 
                type="password" 
                placeholder="ghp_..." 
                value={githubToken} 
                onChange={(e) => setGithubToken(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={handleSync} disabled={isLoading} variant="secondary">
                <FolderGit2 className="w-4 h-4 mr-2" />
                {isLoading ? "Syncing..." : (lastSynced ? "Re-sync" : "Fetch Repos")}
              </Button>
            </div>
          </div>
          {lastSynced && (
            <div className="text-sm text-muted-foreground shrink-0 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Synced: {new Date(lastSynced).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-md border shadow-sm">
        <div className="flex items-center w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input 
            placeholder="Search projects or tech..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-none shadow-none focus-visible:ring-1"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {(['all', 'pinned', 'github', 'manual', 'hidden'] as FilterType[]).map((f) => (
            <Badge 
              key={f}
              variant={filter === f ? 'default' : 'secondary'}
              className={cn(
                "cursor-pointer capitalize px-3 py-1 text-xs font-medium transition-colors hover:bg-primary/80 hover:text-primary-foreground",
                filter === f && "shadow-sm"
              )}
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
          
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          
          <div className="hidden sm:flex items-center bg-secondary rounded-md p-0.5">
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", viewMode === 'grid' && "bg-background shadow-sm")} onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", viewMode === 'list' && "bg-background shadow-sm")} onClick={() => setViewMode('list')}>
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <RepoList projects={filteredProjects} viewMode={viewMode} onEdit={handleEdit} />

      <ManualProjectForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleFormSubmit}
        initialData={editingProject}
      />
    </div>
  );
}
