import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { generateCoverLetter } from '@/lib/ai/cover-letter';
import { formatAIError } from '@/lib/ai/error-handler';
import { GeneratedCV } from '@/types/cv';
import { AIProviderConfig } from '@/types/ai';
import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';

export async function POST(request: Request) {
  let aiConfig: AIProviderConfig | undefined;
  try {
    const body = (await request.json()) as {
      cv: GeneratedCV;
      profile: UserProfile;
      projects: Project[];
      aiConfig: AIProviderConfig;
    };
    aiConfig = body.aiConfig;
    const { cv, profile, projects } = body;

    if (!cv || !aiConfig || !profile) {
      return NextResponse.json({ error: 'CV, profile, and AI Config are required' }, { status: 400 });
    }

    const ai = createAIProvider(aiConfig);
    const coverLetter = await generateCoverLetter(cv, profile, projects || [], ai);

    return NextResponse.json({ coverLetter });
  } catch (error: unknown) {
    const message = formatAIError(error, {
      provider: aiConfig?.provider,
      model: aiConfig?.model,
      baseUrl: aiConfig?.baseUrl,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
