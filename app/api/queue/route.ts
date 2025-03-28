import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "@/lib/modules/events/jobQueue";
import { randomUUID } from "crypto";
import EventEmitter from "@/lib/modules/events/eventEmitter";

export async function POST(
  request: NextRequest,
  response: NextResponse,
) {
  const params = await request.json();
  const url: string | null = params.url;

  if (!url) {
    return NextResponse.json(
      { error: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  jobQueue.addJob({
    id: randomUUID(),
    youtubeUrl: url,
    priority: 1,
    status: 'queued',
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Job added to queue' }, { status: 200 });
}

export async function GET(request: NextRequest, response: NextResponse) {
  const id = randomUUID();
	const encoder = new TextEncoder();
  const stream = new TransformStream({
		async start(controller) {
			const queueStatus = await jobQueue.getQueueStatus();
			const message = `event: queueState\ndata: ${JSON.stringify(queueStatus)}\n\n`;
			
			controller.enqueue(encoder.encode(message));
		}
	});

  const writer = stream.writable.getWriter();
  
  EventEmitter.addConnection(id, writer);
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}