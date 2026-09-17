import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { formatAIError } from '@/lib/ai/error-handler';
import { AIProviderConfig } from '@/types/ai';

export async function POST(request: Request) {
  let config: AIProviderConfig | null = null;
  try {
    config = (await request.json()) as AIProviderConfig;

    if (config.provider !== 'ollama' && !config.apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    const provider = createAIProvider(config);
    const response = await provider.generate('Say hello in one word.');

    return NextResponse.json({ success: true, response });
  } catch (error: unknown) {
    const message = formatAIError(error, {
      provider: config?.provider,
      model: config?.model,
      baseUrl: config?.baseUrl,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
