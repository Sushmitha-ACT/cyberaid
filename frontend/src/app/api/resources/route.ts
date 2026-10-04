import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("cat") || "All";

    const whereClause: any = {
      isPublished: true,
    };

    if (cat !== "All") {
      whereClause.category = cat;
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ];
    }

    const guides = await prisma.guide.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        estimatedMinutes: true,
        category: true,
        tags: true,
      }
    });

    return NextResponse.json({ guides });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}
