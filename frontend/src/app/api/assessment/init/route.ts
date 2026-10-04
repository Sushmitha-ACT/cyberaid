import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { generateObjectWithFallback } from "@/lib/ai-fallback";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 30; // Max execution time for Vercel

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const { description, screenshotBase64 } = await req.json();

    if (!description && !screenshotBase64) {
      return NextResponse.json({ error: "Please provide a description or a screenshot." }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "AI Services are currently unavailable (Missing API Key)." }, { status: 500 });
    }

    // Build AI prompt content
    const promptContent: any[] = [
      { 
        type: "text", 
        text: `You are an expert Security Operations Center analyst.
        A user is reporting a digital incident and needs an initial assessment.
        User Description: "${description || "None provided"}"
        
        Analyze the description and the attached screenshot (if any).
        
        1. Determine if this is a genuine cybersecurity incident or scam (not a random image, not a dog, not wallpaper).
        2. Identify the platform (e.g. Google, Instagram, Bank Name).
        3. Determine the Incident Type.
        4. Calculate the Severity based on strict rules:
           - PREVENTIVE: No action taken yet (e.g. received phishing email but didn't click).
           - MEDIUM: Action taken but no sensitive data exposed (e.g. clicked link, but didn't enter password).
           - HIGH: Data exposed, but account accessible (e.g. entered password on fake site, but 2FA still active).
           - CRITICAL: Account lost, money transferred, or attacker has active access.
           Do NOT default to CRITICAL unless justified.
           
        If it's an unrelated screenshot, set isGenuine to false and provide a rejection reason.`
      }
    ];

    if (screenshotBase64) {
      const base64Data = screenshotBase64.split(',')[1] || screenshotBase64;
      if (base64Data) {
        promptContent.push({ type: "image", image: base64Data });
      }
    }

    const { object } = await generateObjectWithFallback({
      schema: z.object({
        isGenuine: z.boolean().describe("Whether this is a real cybersecurity issue."),
        rejectionReason: z.string().describe("If isGenuine is false, explain why (e.g. 'This appears to be a picture of a dog.')."),
        platform: z.string().describe("The platform involved, e.g. Instagram, Gmail, Chase Bank."),
        incidentType: z.string().describe("The category of the incident, e.g. Account Takeover, Phishing."),
        severity: z.enum(["PREVENTIVE", "MEDIUM", "HIGH", "CRITICAL"]),
        severityReason: z.string().describe("Why this severity level was chosen based on the rules.")
      }),
      messages: [{ role: "user", content: promptContent }]
    });

    if (!object.isGenuine) {
      return NextResponse.json({ error: object.rejectionReason || "The provided evidence does not appear to be related to a cybersecurity incident." }, { status: 400 });
    }

    // Determine IncidentType enum (Fallback to ACCOUNT_HACKED if not exact match)
    const typeMapping: Record<string, any> = {
      "Account Takeover": "ACCOUNT_HACKED",
      "Phishing": "FAKE_WEBSITE",
      "Scam": "BANK_SCAM"
    };
    const mappedType = typeMapping[object.incidentType] || "ACCOUNT_HACKED";

    // Create the DB record
    let firstCountry = await prisma.country.findFirst();
    if (!firstCountry) {
      firstCountry = await prisma.country.create({
        data: { code: "US", name: "United States" }
      });
    }

    const incident = await prisma.incident.create({
      data: {
        userId: session?.user?.id || null,
        type: mappedType,
        status: "OPEN",
        severity: object.severity as any,
        countryId: firstCountry.id,
        contextData: {
          originalDescription: description,
          initialPlatform: object.platform,
          initialIncidentType: object.incidentType,
          severityReason: object.severityReason,
          generatedSteps: [], // will be filled dynamically by next-step API
          completedSteps: [],
          failedAttempts: []
        }
      }
    });

    return NextResponse.json({
      success: true,
      assessmentId: incident.id,
      analysis: object
    });

  } catch (error: any) {
    console.error("Assessment Init Error:", error);
    return NextResponse.json({ error: "Failed to initialize assessment" }, { status: 500 });
  }
}
