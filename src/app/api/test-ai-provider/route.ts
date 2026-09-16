import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
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
    let message = error instanceof Error ? error.message : 'Connection test failed';
    if (message.includes('404') && (message.includes('page not found') || message.includes('Not Found'))) {
      message = `Model '${config?.model || ''}' was not found on ${config?.provider || 'provider'}. Please choose a supported model.`;
    } else if (message.includes('410')) {
      message = `Model '${config?.model || ''}' is retired/deprecated by ${config?.provider || 'provider'}. Please select an active model.`;
    } else if (message.includes('401') || message.includes('403')) {
      message = `Authentication failed for ${config?.provider || 'provider'}. Please verify that your API key is correct.`;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
