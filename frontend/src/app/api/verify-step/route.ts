import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateObjectWithFallback } from "@/lib/ai-fallback";
import { z } from "zod";

export const maxDuration = 60; // Allow 60s for Gemini API image processing

export async function POST(req: Request) {
  try {
    const { assessmentId, stepTitle, stepDescription, screenshotBase64, userDescription } = await req.json();

    if (!screenshotBase64) {
      return NextResponse.json({ error: "Missing screenshot" }, { status: 400 });
    }

    type VerificationResult = {
      verified: boolean;
      confidence: number;
      reason: string;
      missingElements: string[];
      actionableAdvice?: string;
    };

    let verificationResult: VerificationResult;
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Simulate verification if no API key is present for development
      verificationResult = {
        verified: true,
        confidence: 95,
        reason: "Simulated verification success (Missing API Key).",
        missingElements: []
      };
    } else {
      // Extract base64
      const base64Data = screenshotBase64.split(',')[1] || screenshotBase64;

      const { object } = await generateObjectWithFallback({
        schema: z.object({
          verified: z.boolean().describe("Whether the screenshot and description prove the user completed the required step."),
          confidence: z.number().min(0).max(100).describe("Confidence score of the verification."),
          reason: z.string().describe("A 1-2 sentence explanation of why it was verified or rejected."),
          missingElements: z.array(z.string()).describe("If rejected, list what is missing from the screen or description (e.g. 'Submit button', 'Security settings'). Empty if verified."),
          actionableAdvice: z.string().optional().describe("If rejected, provide specific, step-by-step instructions on what the user needs to do next to complete the step correctly. Empty if verified.")
        }),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert Security Operations Center analyst. 
                The user was asked to complete this specific cybersecurity recovery step:
                
                Title: "${stepTitle}"
                Description: "${stepDescription}"
                
                They have provided a description of what they did and uploaded a screenshot as proof of completion.
                
                User's Description of Action:
                "${userDescription}"
                
                Analyze the image and the user's description to verify if they match the expected outcome of the step.
                - Look for UI elements indicating success (e.g. "Password changed successfully", or being on the correct settings page).
                - Ensure their described action aligns with the image and step instructions.
                - Reject if it is a random image, the wrong platform, or clearly unrelated.
                - Be somewhat forgiving of UI variations (dark mode, mobile, language) but strict on the action.
                - If you reject it, populate the actionableAdvice field with clear instructions on how the user can correctly complete the step based on where they went wrong.`
              },
              {
                type: "image",
                image: base64Data
              }
            ]
          }
        ]
      });
      verificationResult = object as VerificationResult;
    }

    if (assessmentId) {
      const incident = await prisma.incident.findUnique({ where: { id: assessmentId } });
      if (incident && incident.contextData) {
        const contextData: any = incident.contextData;
        
        if (verificationResult.verified) {
          contextData.completedSteps = contextData.completedSteps || [];
          contextData.completedSteps.push({
            title: stepTitle,
            verifiedReason: verificationResult.reason
          });
        } else {
          contextData.failedAttempts = contextData.failedAttempts || [];
          contextData.failedAttempts.push({
            stepTitle,
            reason: verificationResult.reason
          });
        }
        
        await prisma.incident.update({
          where: { id: assessmentId },
          data: { contextData }
        });
      }
    }

    return NextResponse.json({
      success: true,
      verification: verificationResult
    });

  } catch (error) {
    console.error("Step Verification Error:", error);
    return NextResponse.json({ error: "Failed to verify screenshot" }, { status: 500 });
  }
}
