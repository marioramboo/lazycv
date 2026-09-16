import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { generateCV, reOptimize } from '@/lib/ai/cv-generator';
import { AIProviderConfig } from '@/types/ai';
import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';
import { GeneratedCV } from '@/types/cv';

// SSE helper
function sseMessage(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const body = await request.json() as {
    jobText: string;
    profile: UserProfile;
    projects: Project[];
    aiConfig: AIProviderConfig;
    reOptimizeCV?: GeneratedCV;
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: object) =>
        controller.enqueue(encoder.encode(sseMessage(payload)));

      try {
        const ai = createAIProvider(body.aiConfig);

        let cv: GeneratedCV;

        if (body.reOptimizeCV) {
          cv = await reOptimize(body.reOptimizeCV, ai, (step, name) =>
            send({ type: 'progress', step, name })
          );
        } else {
          cv = await generateCV(
            body.jobText,
            body.profile,
            body.projects,
            ai,
            (step, name) => send({ type: 'progress', step, name })
          );
        }

        send({ type: 'done', cv });
      } catch (e: unknown) {
        send({ type: 'error', message: e instanceof Error ? e.message : 'Generation failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
