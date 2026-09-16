import OpenAI from 'openai';
import { AIProvider } from '@/types/ai';

export function createOpenAIAdapter(apiKey: string, model: string, baseURL?: string): AIProvider {
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
    ...(baseURL && { baseURL }),
    timeout: 90000,
    maxRetries: 1,
  });

  return {
    async generate(prompt, systemPrompt) {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await client.chat.completions.create({ model, messages, temperature: 0.3 });
      return res.choices[0]?.message?.content ?? '';
    },
  };
}
