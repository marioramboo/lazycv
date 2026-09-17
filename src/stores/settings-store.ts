import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProviderType } from '@/types/ai';

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20240620',
  gemini: 'gemini-1.5-flash',
  ollama: 'llama3',
  nvidia: 'deepseek-ai/deepseek-r1',
};

export const isDeprecatedModel = (provider: AIProviderType, m: string): boolean => {
  if (provider === 'nvidia') {
    const trimmed = (m || '').trim();
    return (
      trimmed === 'meta/llama-3.3-70b-instruct' ||
      trimmed === 'nvidia/llama-3.1-nemotron-70b-instruct' ||
      trimmed === 'deepseek-ai/deepseek-v4-flash-0731' ||
      !trimmed
    );
  }
  return false;
};

interface SettingsState {
  aiProvider: AIProviderType;
  apiKey: string;
  providerKeys: Partial<Record<AIProviderType, string>>;
  model: string;
  providerModels: Partial<Record<AIProviderType, string>>;
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
  providerKeys: {} as Partial<Record<AIProviderType, string>>,
  model: 'gpt-4o-mini',
  providerModels: {} as Partial<Record<AIProviderType, string>>,
  ollamaBaseUrl: 'http://localhost:11434',
  theme: 'system',
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setProvider: (p) =>
        set((state) => {
          const keyForProvider = state.providerKeys?.[p] ?? (state.aiProvider === p ? state.apiKey : '');
          const rawModel = state.providerModels?.[p] || (state.aiProvider === p ? state.model : DEFAULT_MODELS[p]);
          const sanitizedModel = isDeprecatedModel(p, rawModel) ? DEFAULT_MODELS[p] : rawModel;
          return {
            aiProvider: p,
            apiKey: keyForProvider,
            model: sanitizedModel,
            providerModels: {
              ...(state.providerModels || {}),
              [p]: sanitizedModel,
            },
          };
        }),
      setApiKey: (k) => {
        const trimmed = k.trim();
        set((state) => ({
          apiKey: trimmed,
          providerKeys: {
            ...(state.providerKeys || {}),
            [state.aiProvider]: trimmed,
          },
        }));
      },
      setModel: (m) =>
        set((state) => {
          const trimmed = (m || '').trim();
          const sanitized = isDeprecatedModel(state.aiProvider, trimmed) ? DEFAULT_MODELS[state.aiProvider] : trimmed;
          return {
            model: sanitized,
            providerModels: {
              ...(state.providerModels || {}),
              [state.aiProvider]: sanitized,
            },
          };
        }),
      setOllamaBaseUrl: (url) => set({ ollamaBaseUrl: url.trim() }),
      setTheme: (t) => set({ theme: t }),
      setOnboardingCompleted: (c) => set({ onboardingCompleted: c }),
      resetSettings: () => set(initialState),
    }),
    {
      name: 'lazycv-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.aiProvider === 'nvidia' && isDeprecatedModel('nvidia', state.model)) {
            state.model = DEFAULT_MODELS['nvidia'];
            if (!state.providerModels) state.providerModels = {};
            state.providerModels['nvidia'] = DEFAULT_MODELS['nvidia'];
          }
          if (state.providerKeys && state.providerKeys[state.aiProvider]) {
            state.apiKey = state.providerKeys[state.aiProvider]!;
          }
        }
      },
    }
  )
);
