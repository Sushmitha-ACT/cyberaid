import { getAuthSession } from "./auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Helper for APIs to require any authenticated user
export async function requireUser() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

// Helper for APIs to require an admin role
export async function requireRole(role: "ADMIN" | "USER") {
  const user = await requireUser();
  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Helper to check incident ownership securely. Deny by default.
export async function requireIncidentOwner(incidentId: string) {
  // If the request doesn't have a session, we cannot authorize ownership
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  // Fetch the incident on the server
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId }
  });

  // Return generic error without leaking existence
  if (!incident || incident.userId !== session.user.id) {
    throw new Error("NOT_FOUND");
  }

  return { incident, user: session.user };
}

// Standardized API error responses
export function authErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
