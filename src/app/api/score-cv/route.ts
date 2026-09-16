import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { scoreCV } from '@/lib/ai/cv-generator';
import { AIProviderConfig } from '@/types/ai';
import { GeneratedCV } from '@/types/cv';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      cv: GeneratedCV;
      aiConfig: AIProviderConfig;
    };

    if (!body.cv || !body.aiConfig) {
      return NextResponse.json({ error: 'Missing cv or aiConfig' }, { status: 400 });
    }

    const ai = createAIProvider(body.aiConfig);
    const score = await scoreCV(body.cv, ai);

    return NextResponse.json({ score });
  } catch (error: unknown) {
    console.error('ATS Scoring API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to score CV' }, { status: 500 });
  }
}
