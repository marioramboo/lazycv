import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { optimizeSingleProject } from '@/lib/ai/cv-generator';
import { AIProviderConfig } from '@/types/ai';
import { ParsedJob } from '@/types/cv';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      parsedJob: ParsedJob;
      project: { name: string; description: string; techStack: string[] };
      aiConfig: AIProviderConfig;
    };

    if (!body.parsedJob || !body.project || !body.aiConfig) {
      return NextResponse.json({ error: 'Missing parsedJob, project, or aiConfig' }, { status: 400 });
    }

    const ai = createAIProvider(body.aiConfig);
    const optimizedProject = await optimizeSingleProject(body.parsedJob, body.project, ai);

    return NextResponse.json({ project: optimizedProject });
  } catch (error: any) {
    console.error('Project optimization API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to optimize project' }, { status: 500 });
  }
}
