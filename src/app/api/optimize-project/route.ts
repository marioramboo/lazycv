import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { optimizeSingleProject } from '@/lib/ai/cv-generator';
import { formatAIError } from '@/lib/ai/error-handler';
import { AIProviderConfig } from '@/types/ai';
import { ParsedJob } from '@/types/cv';

export async function POST(request: Request) {
  let aiConfig: AIProviderConfig | undefined;
  try {
    const body = await request.json() as {
      parsedJob: ParsedJob;
      project: { name: string; description: string; techStack: string[] };
      aiConfig: AIProviderConfig;
    };
    aiConfig = body.aiConfig;

    if (!body.parsedJob || !body.project || !body.aiConfig) {
      return NextResponse.json({ error: 'Missing parsedJob, project, or aiConfig' }, { status: 400 });
    }

    const ai = createAIProvider(body.aiConfig);
    const optimizedProject = await optimizeSingleProject(body.parsedJob, body.project, ai);

    return NextResponse.json({ project: optimizedProject });
  } catch (error: unknown) {
    console.error('Project optimization API error:', error);
    const message = formatAIError(error, {
      provider: aiConfig?.provider,
      model: aiConfig?.model,
      baseUrl: aiConfig?.baseUrl,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
