export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'nvidia';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey: string;        // empty for Ollama
  model: string;         // e.g., 'gpt-4o', 'claude-sonnet-4-20250514', 'gemini-1.5-flash', 'llama3'
  baseUrl?: string;      // for Ollama, default 'http://localhost:11434'
}

export interface AIProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}
