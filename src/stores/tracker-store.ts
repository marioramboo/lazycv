import { create } from 'zustand';
import { db } from '@/lib/db';
import { JobApplication } from '@/types/job';
import { toast } from 'sonner';

interface TrackerState {
  applications: JobApplication[];
  isLoading: boolean;

  loadApplications: () => Promise<void>;
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateApplication: (id: string, changes: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  applications: [],
  isLoading: false,

  loadApplications: async () => {
    set({ isLoading: true });
    try {
      const apps = await db.jobApplications.toArray();
      // ponytail: in-memory sort by dateApplied / createdAt desc
      apps.sort((a, b) => new Date(b.dateApplied || b.createdAt).getTime() - new Date(a.dateApplied || a.createdAt).getTime());
      set({ applications: apps, isLoading: false });
    } catch (e) {
      console.error('Failed to load job applications', e);
      set({ isLoading: false });
    }
  },

  addApplication: async (appData) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const newApp: JobApplication = {
      ...appData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.jobApplications.put(newApp);
    await get().loadApplications();
    toast.success('Job application logged!');
    return id;
  },

  updateApplication: async (id, changes) => {
    const existing = await db.jobApplications.get(id);
    if (!existing) return;
    const updated: JobApplication = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    await db.jobApplications.put(updated);
    await get().loadApplications();
    toast.success('Application updated');
  },

  deleteApplication: async (id) => {
    await db.jobApplications.delete(id);
    await get().loadApplications();
    toast.success('Application deleted');
  },
}));
