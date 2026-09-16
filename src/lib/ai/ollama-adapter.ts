import { AIProvider } from '@/types/ai';

export function createOllamaAdapter(baseUrl: string, model: string): AIProvider {
  return {
    async generate(prompt, systemPrompt) {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: fullPrompt, stream: false }),
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
      const data = await res.json();
      return data.response ?? '';
    },
  };
}
