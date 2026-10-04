import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, name } = await req.json();

    if (!courseId || !name) {
      return NextResponse.json({ error: "Missing course or name" }, { status: 400 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { category: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update user's name if they entered a new one
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name }
    });

    // Mark enrollment as completed (if not already)
    await prisma.studentEnrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { isCompleted: true, completedAt: new Date(), progress: 100 },
      create: { userId: session.user.id, courseId, isCompleted: true, completedAt: new Date(), progress: 100 }
    });

    // Generate Certificate Signature
    const signature = crypto.createHash('sha256').update(`${session.user.id}-${courseId}-${Date.now()}`).digest('hex');

    // Create or find Certificate
    const certificate = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { signature },
      create: {
        userId: session.user.id,
        courseId: course.id,
        signature
      }
    });

    // Award Achievement badge + XP (only on first completion)
    const existingBadge = await prisma.achievement.findFirst({
      where: { userId: session.user.id, title: `Completed: ${course.title}` }
    });

    if (!existingBadge) {
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          title: `Completed: ${course.title}`,
          description: `Successfully completed the course "${course.title}" and earned a certificate.`,
          badgeIcon: 'Trophy',
          xpReward: 100,
        }
      });

      // Add XP to user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: 100 } }
      });
    }

    // Send Email via SMTP
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const certUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/academy/certificate/${certificate.uuid}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || '"CyberAid Academy" <academy@cyberaid.com>',
        to: session.user.email,
        subject: `Your Certificate of Completion: ${course.title}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0A0A0A; padding: 30px; text-align: center; border-bottom: 2px solid #00F0FF;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CyberAid <span style="color: #00F0FF;">Academy</span></h1>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-top: 0;">Congratulations, ${name}!</h2>
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                You have successfully completed <strong>${course.title}</strong> and earned your official Certificate of Completion.
              </p>
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                Your certificate is securely stored on the blockchain-inspired CyberAid verification ledger and can be shared with employers or added to your LinkedIn profile.
              </p>
              <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="${certUrl}" style="background-color: #00F0FF; color: #0A0A0A; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  View & Download Certificate
                </a>
              </div>
            </div>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        if (info.messageId && nodemailer.getTestMessageUrl) {
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) {
            console.log("📧 Certificate Email Preview URL:", preview);
          }
        }
      } catch (err) {
        console.error("Failed to send certificate email:", err);
      }
    }

    return NextResponse.json({ success: true, certificateId: certificate.uuid });

  } catch (error: any) {
    console.error("Error issuing certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
