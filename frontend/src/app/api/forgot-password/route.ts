import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { sendOTP } from "@/lib/email";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, otp, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (action === "request") {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Generic success message to prevent email enumeration
        return NextResponse.json({ message: "If an account exists, an OTP was sent." }, { status: 200 });
      }

      if (!user.password) {
        return NextResponse.json({ error: "This account uses Google Sign-In and does not have a password to reset. Please sign in using Google." }, { status: 400 });
      }

      // Generate 6-digit OTP
      const token = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Upsert the token so previous unused tokens for this email are replaced
      // Prisma schema has `@@unique([identifier, token])` but we can't easily upsert by identifier.
      // We will delete existing tokens for this identifier first.
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Send the email and get the preview URL if using Ethereal
      const previewUrl = await sendOTP(email, token);

      return NextResponse.json({ 
        message: "OTP sent successfully.",
        previewUrl: typeof previewUrl === "string" ? previewUrl : undefined 
      }, { status: 200 });
    }

    if (action === "reset") {
      if (!otp || !newPassword) {
        return NextResponse.json({ error: "OTP and new password are required" }, { status: 400 });
      }

      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          token: otp,
        },
      });

      if (!verificationToken) {
        return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
      }

      if (verificationToken.expires < new Date()) {
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: otp,
            }
          }
        });
        return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
      }

      const hashedPassword = hashPassword(newPassword);

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Clean up token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: otp,
          }
        }
      });

      return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
