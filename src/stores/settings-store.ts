import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProviderType } from '@/types/ai';

interface SettingsState {
  aiProvider: AIProviderType;
  apiKey: string;
  model: string;
  ollamaBaseUrl: string;
  theme: string;
  onboardingCompleted: boolean;
  setProvider: (p: AIProviderType) => void;
  setApiKey: (key: string) => void;
  setModel: (m: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setTheme: (t: string) => void;
  setOnboardingCompleted: (c: boolean) => void;
  resetSettings: () => void;
}

const initialState = {
  aiProvider: 'openai' as AIProviderType,
  apiKey: '',
  model: 'gpt-4o-mini',
  ollamaBaseUrl: 'http://localhost:11434',
  theme: 'system',
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setProvider: (p) => set({ aiProvider: p }),
      setApiKey: (k) => set({ apiKey: k }),
      setModel: (m) => set({ model: m }),
      setOllamaBaseUrl: (url) => set({ ollamaBaseUrl: url }),
      setTheme: (t) => set({ theme: t }),
      setOnboardingCompleted: (c) => set({ onboardingCompleted: c }),
      resetSettings: () => set(initialState),
    }),
    { name: 'lazycv-settings' }
  )
);
