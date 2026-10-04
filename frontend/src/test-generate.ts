import { generateObjectWithFallback } from "./lib/ai-fallback";
import { z } from "zod";
import "dotenv/config";

async function main() {
  try {
    const { object } = await generateObjectWithFallback({
      schema: z.object({
        isScam: z.boolean(),
        confidence: z.number(),
      }),
      prompt: "Test message",
    });
    console.log("Success:", object);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

main();
