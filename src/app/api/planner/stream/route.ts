import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { plannerClient } from '@/lib/planner-client';
import { getSessionsCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  // Verify user owns this session
  const sessions = await getSessionsCollection();
  const session = await sessions.findOne({ sessionId, userId });
  if (!session) {
    return new Response('Session not found', { status: 404 });
  }

  // Create a readable stream that proxies the Planner API SSE
  const streamUrl = plannerClient.getStreamUrl(sessionId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(streamUrl);
        if (!response.ok || !response.body) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to connect to stream' })}\n\n`));
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(encoder.encode(chunk));

          // Check if we received a complete event
          if (chunk.includes('event: complete')) {
            // Update session status in MongoDB
            await sessions.updateOne(
              { sessionId },
              {
                $set: {
                  status: 'ready',
                  updatedAt: new Date()
                }
              }
            );
          }
        }

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
