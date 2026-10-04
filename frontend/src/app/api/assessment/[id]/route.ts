import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    const resolvedParams = await params;
    
    const incident = await prisma.incident.findUnique({
      where: { 
        id: resolvedParams.id,
        // If a user is logged in, ensure they own it. If not logged in, just fetch it (or we could omit this check and just use ID)
        ...(session?.user?.id ? { userId: session.user.id } : {})
      }
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Failed to fetch incident:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
