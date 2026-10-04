import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { uuid },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, instructor: true } }
      }
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
