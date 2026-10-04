import { NextResponse } from 'next/server';
import { streamTextWithFallback } from "@/lib/ai-fallback";
import { prisma } from "@/lib/prisma";
import { convertToModelMessages, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // In ai v7, DefaultChatTransport sends UIMessage[] (parts-based).
    // streamText expects ModelMessage[] (content-based) — convert first.
    const body = await req.json();
    let messages: UIMessage[] = Array.isArray(body) ? body : (body.messages || []);
    
    // Fallback for old client sessions that haven't refreshed
    if (messages.length === 0 && body.text) {
      messages = [{ id: Date.now().toString(), role: 'user', content: body.text } as any];
    }
    const assessmentId = body.assessmentId;

    let contextStr = "The user is asking for help with a digital security emergency.";
    if (assessmentId && !assessmentId.startsWith('temp-')) {
      try {
        const incident = await prisma.incident.findUnique({
          where: { id: assessmentId }
        });
        if (incident) {
          contextStr = `The user has a digital security emergency.
Severity: ${incident.severity}
Incident type: ${incident.type}
Context: ${JSON.stringify(incident.contextData, null, 2)}`;
        }
      } catch {
        // ignore DB errors, proceed without context
      }
    }

    const system = `You are a cybersecurity incident response expert assisting a user in distress.
Context about their situation: ${contextStr}

Your job is to provide specific, step-by-step technical and practical advice.
If a user says a step isn't working, provide an alternative.
Be concise, empathetic, and highly actionable.`;

    // Convert UIMessage[] (parts-based or content-based) -> CoreMessage[]
    const modelMessages = messages.map((m: any) => {
      let text = m.content || "";
      if (!text && Array.isArray(m.parts)) {
        text = m.parts.map((p: any) => p.text || "").join("");
      }
      return {
        role: m.role || 'user',
        content: text
      };
    });

    console.log("[chat] Starting stream with", modelMessages.length, "messages");

    const result = await streamTextWithFallback({
      system,
      messages: modelMessages,
    });

    // Pass onError so stream errors surface as error chunks (not silent failures)
    return result.toUIMessageStreamResponse({
      onError: (error: unknown) => {
        console.error("[chat] Stream error:", error);
        return error instanceof Error ? error.message : "An error occurred during streaming.";
      },
    });
  } catch (error: unknown) {
    console.error("Error in AI Chat:", error);
    return NextResponse.json({ 
      error: "Failed to process chat request."
    }, { status: 500 });
  }
}
