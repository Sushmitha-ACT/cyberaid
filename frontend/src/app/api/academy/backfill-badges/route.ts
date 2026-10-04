import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time backfill: award badges to users who already have certificates
export async function GET() {
  try {
    const certs = await prisma.certificate.findMany({
      include: { user: true, course: true }
    });

    let awarded = 0;
    for (const cert of certs) {
      const existing = await prisma.achievement.findFirst({
        where: { userId: cert.userId, title: `Completed: ${cert.course.title}` }
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            userId: cert.userId,
            title: `Completed: ${cert.course.title}`,
            description: `Successfully completed the course "${cert.course.title}" and earned a certificate.`,
            badgeIcon: 'Trophy',
            xpReward: 100,
          }
        });
        await prisma.user.update({
          where: { id: cert.userId },
          data: { xp: { increment: 100 } }
        });
        awarded++;
      }
    }

    return NextResponse.json({ success: true, badgesAwarded: awarded });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
