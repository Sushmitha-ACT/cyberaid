import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateObjectWithFallback } from "@/lib/ai-fallback";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { assessmentId } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: "Missing assessmentId" }, { status: 400 });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: assessmentId }
    });

    if (!incident || !incident.contextData) {
      return NextResponse.json({ error: "Incident not found or missing context data" }, { status: 404 });
    }

    const contextData: any = incident.contextData;

    // Check if recovery is already complete
    if (contextData.isComplete) {
      return NextResponse.json({ success: true, isComplete: true, nextStep: null });
    }

    // Build the history for the AI
    const historyText = `
    Initial Description: ${contextData.originalDescription || "N/A"}
    Platform: ${contextData.initialPlatform || "Unknown"}
    Incident Type: ${contextData.initialIncidentType || "Unknown"}
    
    Completed Steps:
    ${contextData.completedSteps?.map((s: any, i: number) => `${i + 1}. ${s.title} - Verified: ${s.verifiedReason}`).join("\n") || "None"}
    
    Failed Attempts:
    ${contextData.failedAttempts?.map((s: any) => `Tried to complete '${s.stepTitle}' but failed: ${s.reason}`).join("\n") || "None"}
    `;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "AI Services are currently unavailable (Missing API Key)." }, { status: 500 });
    }

    const responseSchema = z.object({
      isComplete: z.boolean().describe("True if all necessary recovery steps for this incident are completed based on standard security practices."),
      nextStep: z.object({
        id: z.string().describe("A unique slug for this step, e.g. 'change-google-password'"),
        title: z.string().describe("Clear, concise title for this step"),
        whyItMatters: z.string().describe("Explanation of why this step is critical for recovery"),
        instructions: z.string().describe("Numbered list of detailed instructions"),
        expectedResult: z.string().describe("What the user should see when they succeed"),
        expectedNextScreenshot: z.string().describe("Description of the screenshot the user needs to upload as proof"),
        estimatedTimeMinutes: z.number().describe("Estimated time in minutes"),
        priority: z.enum(["IMMEDIATE", "HIGH", "NORMAL"]),
        helpfulTips: z.array(z.string()).describe("1-3 helpful tips for completing this step"),
        commonMistakes: z.array(z.string()).describe("1-2 common mistakes to avoid"),
        videoTutorialUrl: z.string().optional().describe("Optional URL to a relevant video tutorial"),
        officialResourceLink: z.string().optional().describe("Optional URL to official documentation"),
        estimatedTotalSteps: z.number().describe("Estimated total number of steps required to fully resolve this incident type")
      }).nullable().describe("The single next step to perform. Null if isComplete is true.")
    });

    const { object } = await generateObjectWithFallback({
      schema: responseSchema,
      prompt: `You are an expert Security Operations Center analyst guiding a user through incident recovery.
      Incident details:
      Type: ${incident.type}
      Severity: ${incident.severity}
      Original user description: ${contextData.originalDescription}
      Platform: ${contextData.initialPlatform}
      
      Completed steps so far:
      ${JSON.stringify(contextData.completedSteps, null, 2)}
      
      Analyze the completed steps. If the incident is fully mitigated based on standard security practices for the platform, set isComplete to true.
      Otherwise, generate ONLY the next logical recovery step the user must take.`
    });

    if (object.isComplete || !object.nextStep) {
      // Mark incident as complete
      const updatedContext = { ...contextData, isComplete: true };
      await prisma.incident.update({
        where: { id: assessmentId },
        data: { contextData: updatedContext, status: "RESOLVED" }
      });
      return NextResponse.json({ step: null });
    }

    // Update incident contextData with the newly generated step
    const updatedSteps = [...(contextData.generatedSteps || []), object.nextStep];
    const updatedContext = {
      ...contextData,
      generatedSteps: updatedSteps
    };

    await prisma.incident.update({
      where: { id: assessmentId },
      data: { contextData: updatedContext }
    });

    return NextResponse.json({ step: object.nextStep });

  } catch (error: any) {
    console.error("Next Step Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate next step" }, { status: 500 });
  }
}
