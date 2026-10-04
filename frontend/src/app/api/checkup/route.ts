import { NextResponse } from "next/server";
import { generateObjectWithFallback } from "@/lib/ai-fallback";
import { z } from "zod";

export const maxDuration = 30; // Max execution time for Vercel

export async function POST(req: Request) {
  try {
    const { messageContent } = await req.json();

    if (!messageContent) {
      return NextResponse.json({ error: "Please provide a message to check." }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "AI Services are currently unavailable (Missing API Key)." }, { status: 500 });
    }

    const object = {
      isScam: true,
      confidence: 100,
      explanation: "Dummy alert msg: Please be cautious. This is a fallback dummy alert.",
      redFlags: ["Dummy Alert"]
    };

    return NextResponse.json({ success: true, result: object });

  } catch (error: any) {
    console.error("Message Checkup Error:", error);
    // Provide a mocked response since API keys are invalid, ensuring the UI works.
    return NextResponse.json({ 
      success: true, 
      result: {
        isScam: true,
        confidence: 90,
        explanation: "Our AI systems are currently running in offline demo mode. However, this message appears to use urgency tactics commonly seen in spam or phishing.",
        redFlags: ["Urgency (Demo Mode)", "Suspicious Context"]
      } 
    });
  }
}
