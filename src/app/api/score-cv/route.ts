import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { scoreCV } from '@/lib/ai/cv-generator';
import { formatAIError } from '@/lib/ai/error-handler';
import { AIProviderConfig } from '@/types/ai';
import { GeneratedCV } from '@/types/cv';

export async function POST(request: Request) {
  let aiConfig: AIProviderConfig | undefined;
  try {
    const body = await request.json() as {
      cv: GeneratedCV;
      aiConfig: AIProviderConfig;
    };
    aiConfig = body.aiConfig;

    if (!body.cv || !body.aiConfig) {
      return NextResponse.json({ error: 'Missing cv or aiConfig' }, { status: 400 });
    }

    const ai = createAIProvider(body.aiConfig);
    const score = await scoreCV(body.cv, ai);

    return NextResponse.json({ score });
  } catch (error: unknown) {
    console.error('ATS Scoring API error:', error);
    const message = formatAIError(error, {
      provider: aiConfig?.provider,
      model: aiConfig?.model,
      baseUrl: aiConfig?.baseUrl,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
