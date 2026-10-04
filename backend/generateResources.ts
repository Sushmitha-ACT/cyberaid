require('dotenv').config();
const { prisma } = require('./src/lib/prisma');
const { generateObject } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');

async function main() {
  const guides = await prisma.guide.findMany();
  console.log('Found ' + guides.length + ' guides to update.');
  for (let i = 0; i < guides.length; i++) {
    const guide = guides[i];
    if (!guide.description.includes("covering the essential steps for:")) {
      console.log('Skipping ' + (i+1) + '/' + guides.length + ': ' + guide.title + ' (already done)');
      continue;
    }
    console.log('Generating ' + (i+1) + '/' + guides.length + ': ' + guide.title);
    try {
      const { object } = await generateObject({
        model: google('gemini-flash-latest'),
        schema: z.object({
          description: z.string().describe('A compelling 2-sentence summary of the guide.'),
          content: z.string().describe('The full comprehensive markdown content of the guide (at least 300 words) with proper headers, lists, and actionable advice.')
        }),
        prompt: `You are an expert cybersecurity writer for CyberAid. Write a highly detailed, realistic, and comprehensive guide for the topic: "${guide.title}". Category: ${guide.category}`
      });
      await prisma.guide.update({
        where: { id: guide.id },
        data: { description: object.description, content: object.content }
      });
    } catch (e) {
      console.error('Failed on ' + guide.title, e.message);
    }
    await new Promise(r => setTimeout(r, 6000));
  }
  console.log('Done generating real resources.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
