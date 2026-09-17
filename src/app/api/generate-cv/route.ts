import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider';
import { generateCV, reOptimize } from '@/lib/ai/cv-generator';
import { formatAIError } from '@/lib/ai/error-handler';
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
        const keySnippet = body.aiConfig?.apiKey
          ? `${body.aiConfig.apiKey.substring(0, 7)}...`
          : 'MISSING';
        console.log(`[generate-cv] Starting generation with provider=${body.aiConfig?.provider}, model=${body.aiConfig?.model}, key=${keySnippet}`);

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
        console.error('[generate-cv] Generation error:', e);
        const message = formatAIError(e, {
          provider: body.aiConfig?.provider,
          model: body.aiConfig?.model,
          baseUrl: body.aiConfig?.baseUrl,
        });
        send({ type: 'error', message });
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
