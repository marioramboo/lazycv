import { AIProvider, AIProviderConfig } from '@/types/ai';
import { createOpenAIAdapter } from './openai-adapter';
import { createClaudeAdapter } from './claude-adapter';
import { createGeminiAdapter } from './gemini-adapter';
import { createOllamaAdapter } from './ollama-adapter';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return createOpenAIAdapter(config.apiKey, config.model);
    case 'anthropic':
      return createClaudeAdapter(config.apiKey, config.model);
    case 'gemini':
      return createGeminiAdapter(config.apiKey, config.model);
    case 'ollama':
      return createOllamaAdapter(config.baseUrl ?? 'http://localhost:11434', config.model);
    case 'nvidia':
      return createOpenAIAdapter(config.apiKey, config.model, NVIDIA_BASE_URL);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
