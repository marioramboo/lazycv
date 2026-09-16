import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from '@/types/ai';

export function createClaudeAdapter(apiKey: string, model: string): AIProvider {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  return {
    async generate(prompt, systemPrompt) {
      const res = await client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = res.content[0];
      return block?.type === 'text' ? block.text : '';
    },
  };
}
