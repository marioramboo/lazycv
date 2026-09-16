import { create } from 'zustand';
import { db } from '../lib/db';
import { Project } from '../types/project';
import { useProfileStore } from './profile-store';
import { toast } from 'sonner';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  lastSynced: string | null;
  loadProjects: () => Promise<void>;
  syncGitHub: (token: string) => Promise<void>;
  addManualProject: (project: Omit<Project, 'id' | 'source' | 'createdAt' | 'updatedAt' | 'pinned' | 'hidden'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  isLoading: false,
  lastSynced: null,

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await db.projects.toArray();
      set({ projects, isLoading: false });
    } catch (e) {
      console.error('Failed to load projects', e);
      set({ isLoading: false });
    }
  },

  syncGitHub: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch GitHub repos');
      }

      const { repos } = await response.json();
      
      const existingProjects = await db.projects.toArray();
      const existingMap = new Map(existingProjects.map(p => [p.id, p]));
      
      const newSkillsToSuggest = new Set<string>();

      const mergedProjects: Project[] = repos.map((repo: Project) => {
        // Collect skills
        repo.techStack.forEach(tech => newSkillsToSuggest.add(tech));
        
        const existing = existingMap.get(repo.id);
        if (existing) {
          return {
            ...repo,
            // Preserve user overrides
            pinned: existing.pinned,
            hidden: existing.hidden,
            description: existing.description, // user might have customized it
            role: existing.role,
            impact: existing.impact,
          };
        }
        return repo;
      });

      // Keep manual projects
      const manualProjects = existingProjects.filter(p => p.source === 'manual');
      const finalProjects = [...manualProjects, ...mergedProjects];

      await db.projects.clear();
      await db.projects.bulkPut(finalProjects);

      set({ projects: finalProjects, lastSynced: new Date().toISOString(), isLoading: false });
      
      // Auto-skill detection: cross reference with profile skills
      const profileSkills = useProfileStore.getState().skills.map(s => s.name.toLowerCase());
      const newSkillsArray = Array.from(newSkillsToSuggest).filter(s => !profileSkills.includes(s.toLowerCase()));
      
      if (newSkillsArray.length > 0) {
        toast.success(`GitHub synced. Detected ${newSkillsArray.length} potential new skills!`, {
          action: {
            label: 'Add All',
            onClick: () => {
              newSkillsArray.forEach(skill => {
                useProfileStore.getState().addSkill({
                  id: crypto.randomUUID(),
                  name: skill,
                  category: 'languages',
                  proficiency: 'familiar'
                });
              });
              toast.success('Skills added to your profile');
            }
          },
          duration: 10000,
        });
      } else {
        toast.success('GitHub synced successfully.');
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('GitHub sync error:', e);
      toast.error(e.message || 'Failed to sync GitHub');
      set({ isLoading: false });
    }
  },

  addManualProject: async (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      source: 'manual',
      pinned: false,
      hidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.projects.put(newProject);
    set(state => ({ projects: [...state.projects, newProject] }));
    toast.success('Project added');
  },

  updateProject: async (id, updates) => {
    await db.projects.update(id, { ...updates, updatedAt: new Date().toISOString() });
    set(state => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    }));
  },

  deleteProject: async (id) => {
    await db.projects.delete(id);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id)
    }));
    toast.success('Project deleted');
  }
}));
