import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { generateObjectWithFallback } from "@/lib/ai-fallback";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const body = await req.json();
    const { incidentCategory, urgency, financialLoss, dataCompromised, screenshotBase64, description } = body;

    let severity = "LOW";
    if (financialLoss === "Yes" || dataCompromised === "Yes" || urgency === "High") {
      severity = "CRITICAL";
    } else if (urgency === "Medium") {
      severity = "HIGH";
    }

    let assessmentId = "temp-" + Date.now().toString();
    let finalChecklist: any[] = [];

    // Check if we need to call the AI
    // We call AI if the user provided a custom description, a screenshot, or selected the "Other" category.
    const needsAiAnalysis = description || screenshotBase64 || incidentCategory === "Other / Custom Problem";

    if (needsAiAnalysis && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Build the message content for the AI
      const promptContent: any[] = [
        { 
          type: "text", 
          text: `You are an expert cybersecurity incident responder. 
          A user is reporting a digital safety emergency.
          Category selected: ${incidentCategory}
          Urgency: ${urgency}
          Financial Loss: ${financialLoss}
          Data Compromised: ${dataCompromised}
          User Description: ${description || "None provided"}
          
          Analyze this information (and the attached screenshot if available). 
          Determine the exact problem and provide a step-by-step recovery checklist.
          CRITICAL: You must verify if the provided screenshot or description is actually related to a cybersecurity incident or scam. 
          If the user uploaded an unrelated image (e.g., a dog, a selfie, a video game, a random landscape), you MUST reject it by returning a single checklist item titled "Unrelated Content Detected", priority "LOW", and description explaining that this does not appear to be a cybersecurity incident.
          Otherwise, keep titles short. Keep descriptions actionable and under 2 sentences.`
        }
      ];

      // Attach image if present
      if (screenshotBase64) {
        // screenshotBase64 is typically "data:image/png;base64,iVBORw0KGgo..."
        const base64Data = screenshotBase64.split(',')[1];
        if (base64Data) {
          promptContent.push({
            type: "image",
            image: base64Data
          });
        }
      }

      try {
        const { object } = await generateObjectWithFallback({
          schema: z.object({
            isRelated: z.boolean().describe("Whether the provided text/image is actually related to a digital security incident."),
            reason: z.string().describe("If isRelated is false, explain why. If true, leave empty."),
            checklist: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string(),
              priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
            })).max(5).describe("List of 3 to 5 actionable recovery steps. Empty if isRelated is false.")
          }),
          messages: [
            {
              role: "user",
              content: promptContent
            }
          ]
        });
        
        if (!object.isRelated) {
          return NextResponse.json({ error: object.reason || "The provided image or description does not appear to be related to a cybersecurity incident." }, { status: 400 });
        }

        finalChecklist = object.checklist;
      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
        // Fallback below
      }
    }

    // Fallback if AI fails, API key is missing, or AI wasn't needed
    if (!finalChecklist.length) {
      finalChecklist = [
        { id: "1", title: "Secure your primary email", description: "Change your password and enable 2FA on your main email account immediately.", priority: "CRITICAL" },
        { id: "2", title: "Contact your bank", description: "If financial details were exposed, freeze your cards or monitor for suspicious activity.", priority: "HIGH" },
        { id: "3", title: "Scan your devices", description: "Run a full antivirus/anti-malware scan on your primary devices.", priority: "MEDIUM" },
        { id: "4", title: "Document everything", description: "Take screenshots of any suspicious messages or unauthorized transactions.", priority: "LOW" },
      ];
    }

    if (session?.user?.id) {
       // Match to enum or fallback to a default
       const typeEnum = "ACCOUNT_HACKED"; // Fallback default for MVP
       
       // Try to find a real country to attach (since it's required)
       const firstCountry = await prisma.country.findFirst();
       if (!firstCountry) throw new Error("No countries seeded");

       const incident = await prisma.incident.create({
         data: {
           userId: session.user.id,
           type: typeEnum,
           status: "OPEN",
           severity: severity as any,
           countryId: firstCountry.id,
         }
       });
       assessmentId = incident.id;
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      severity,
      checklist: finalChecklist
    });

  } catch (error) {
    console.error("Assessment processing error:", error);
    return NextResponse.json({ error: "Failed to process assessment" }, { status: 500 });
  }
}
