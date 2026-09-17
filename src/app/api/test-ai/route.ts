import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { formatAIError } from '@/lib/ai/error-handler';
import { AIProviderConfig } from '@/types/ai';

// ponytail: quick diagnostic endpoint — test if AI API responds at all
export async function POST(request: Request) {
  const { aiConfig } = await request.json() as { aiConfig: AIProviderConfig };

  const start = Date.now();
  try {
    const ai = createAIProvider(aiConfig);

    // AbortController with 15s timeout so we don't hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const result = await Promise.race([
      ai.generate('Respond with exactly: "ok"', 'You are a test. Reply with only "ok".'),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI API timeout after 15s')), 15000)
      ),
    ]);

    clearTimeout(timeout);
    const elapsed = Date.now() - start;

    return NextResponse.json({
      status: 'ok',
      provider: aiConfig.provider,
      model: aiConfig.model,
      responseMs: elapsed,
      response: result.substring(0, 100),
    });
  } catch (e: unknown) {
    const elapsed = Date.now() - start;
    const errorMsg = formatAIError(e, {
      provider: aiConfig.provider,
      model: aiConfig.model,
      baseUrl: aiConfig.baseUrl,
    });
    return NextResponse.json({
      status: 'error',
      provider: aiConfig.provider,
      model: aiConfig.model,
      responseMs: elapsed,
      error: errorMsg,
    }, { status: 500 });
  }
}
