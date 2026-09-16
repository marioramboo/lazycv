import { AIProvider } from '@/types/ai';

export function createOllamaAdapter(baseUrl: string, model: string): AIProvider {
  return {
    async generate(prompt, systemPrompt) {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      // Strip trailing slashes and common extraneous path segments (/v1, /api)
      const cleanBase = baseUrl.replace(/\/+$/, '').replace(/\/(v1|api)$/, '');
      const res = await fetch(`${cleanBase}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: fullPrompt, stream: false }),
      });

      if (!res.ok) {
        let errorDetails = res.statusText;
        try {
          const errData = await res.json();
          if (errData?.error) errorDetails = errData.error;
        } catch {
          try {
            const rawText = await res.text();
            if (rawText) errorDetails = rawText.trim();
          } catch {
            // fallback to statusText
          }
        }
        throw new Error(`Ollama error (${res.status}): ${errorDetails}`);
      }
      const data = await res.json();
      return data.response ?? '';
    },
  };
}
