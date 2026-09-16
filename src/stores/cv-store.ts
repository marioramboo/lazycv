import { create } from 'zustand';
import { db } from '@/lib/db';
import { GeneratedCV, ATSScore } from '@/types/cv';
import { AIProviderConfig } from '@/types/ai';
import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';
import { toast } from 'sonner';

interface CVState {
  currentCV: GeneratedCV | null;
  cvHistory: GeneratedCV[];
  isGenerating: boolean;
  generationStep: number;
  generationStepName: string;
  totalSteps: number;
  error: string | null;

  generateCV: (jobText: string, profile: UserProfile, projects: Project[], aiConfig: AIProviderConfig) => Promise<void>;
  reOptimize: (aiConfig: AIProviderConfig) => Promise<void>;
  updateSection: (sectionId: string, content: unknown) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  addSection: (section: import('@/types/cv').CVSection) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  updateScore: (score: ATSScore) => void;
  saveToDB: () => Promise<void>;
  loadFromDB: (id: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadAllCVs: () => Promise<void>;
  deleteCV: (id: string) => Promise<void>;
  duplicateCV: (id: string) => Promise<string | null>;
  clearCurrent: () => void;
}

/** Consume the SSE stream from /api/generate-cv and update store state. */
async function consumeGenerationStream(
  body: object,
  set: (s: Partial<CVState>) => void,
): Promise<GeneratedCV> {
  const res = await fetch('/api/generate-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message ?? 'Failed to start generation');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      let payload;
      try {
        payload = JSON.parse(line.slice(6));
      } catch {
        console.warn('[cv-store] Skipping malformed SSE line:', line.slice(0, 100));
        continue;
      }

      if (payload.type === 'progress') {
        set({ generationStep: payload.step, generationStepName: payload.name });
      } else if (payload.type === 'done') {
        return payload.cv as GeneratedCV;
      } else if (payload.type === 'error') {
        throw new Error(payload.message);
      }
    }
  }

  throw new Error('Stream ended without a result');
}

export const useCVStore = create<CVState>((set, get) => ({
  currentCV: null,
  cvHistory: [],
  isGenerating: false,
  generationStep: 0,
  generationStepName: '',
  totalSteps: 7,
  error: null,

  generateCV: async (jobText, profile, projects, aiConfig) => {
    set({ isGenerating: true, generationStep: 0, generationStepName: '', error: null, currentCV: null });
    try {
      const cv = await consumeGenerationStream({ jobText, profile, projects, aiConfig }, (s) => set(s as Partial<CVState>));
      await db.generatedCVs.put(cv);
      set({ currentCV: cv, isGenerating: false });
      toast.success('CV generated successfully!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      set({ error: msg, isGenerating: false });
      toast.error(msg);
    }
  },

  reOptimize: async (aiConfig) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({ isGenerating: true, error: null });
    try {
      const updated = await consumeGenerationStream(
        { aiConfig, reOptimizeCV: currentCV },
        (s) => set(s as Partial<CVState>),
      );
      await db.generatedCVs.put(updated);
      set({ currentCV: updated, isGenerating: false });
      toast.success(`CV Re-optimized! New ATS score: ${updated.atsScore.overall}%`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Re-optimization failed';
      set({ error: msg, isGenerating: false });
      toast.error(msg);
    }
  },

  updateSection: (sectionId, content) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({
      currentCV: {
        ...currentCV,
        sections: currentCV.sections.map(s => s.id === sectionId ? { ...s, content } : s),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateSectionTitle: (sectionId, title) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({
      currentCV: {
        ...currentCV,
        sections: currentCV.sections.map(s => s.id === sectionId ? { ...s, title } : s),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addSection: (section) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({
      currentCV: {
        ...currentCV,
        sections: [...currentCV.sections, section],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  removeSection: (sectionId) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({
      currentCV: {
        ...currentCV,
        sections: currentCV.sections.filter(s => s.id !== sectionId),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  moveSection: (sectionId, direction) => {
    const { currentCV } = get();
    if (!currentCV) return;
    const index = currentCV.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentCV.sections.length) return;

    const newSections = [...currentCV.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    set({
      currentCV: {
        ...currentCV,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateScore: (score) => {
    const { currentCV } = get();
    if (!currentCV) return;
    set({
      currentCV: {
        ...currentCV,
        atsScore: score,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  saveToDB: async () => {
    const { currentCV } = get();
    if (currentCV) {
      await db.generatedCVs.put(currentCV);
      toast.success('CV saved');
    }
  },

  loadFromDB: async (id) => {
    const cv = await db.generatedCVs.get(id);
    if (cv) set({ currentCV: cv });
  },

  loadHistory: async () => {
    const all = await db.generatedCVs.orderBy('createdAt').reverse().limit(20).toArray();
    set({ cvHistory: all });
  },

  loadAllCVs: async () => {
    const all = await db.generatedCVs.orderBy('createdAt').reverse().toArray();
    set({ cvHistory: all });
  },

  deleteCV: async (id) => {
    await db.generatedCVs.delete(id);
    const letters = await db.coverLetters.where('cvId').equals(id).toArray();
    for (const l of letters) {
      await db.coverLetters.delete(l.id);
    }
    await get().loadAllCVs();
    toast.success('CV deleted');
  },

  duplicateCV: async (id) => {
    const original = await db.generatedCVs.get(id);
    if (!original) {
      toast.error('Original CV not found');
      return null;
    }
    const now = new Date().toISOString();
    const newId = crypto.randomUUID();
    const copy: GeneratedCV = {
      ...structuredClone(original),
      id: newId,
      jobTitle: `${original.jobTitle} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    await db.generatedCVs.put(copy);
    await get().loadAllCVs();
    toast.success('CV duplicated as a new base');
    return newId;
  },

  clearCurrent: () => set({ currentCV: null, generationStep: 0, generationStepName: '', error: null }),
}));
