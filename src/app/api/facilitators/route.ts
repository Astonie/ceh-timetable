import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET /api/facilitators
export async function GET() {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    console.log("Attempting to fetch facilitators...");
    const facilitators = await prisma.facilitator.findMany({ orderBy: { id: "asc" } });
    console.log("Successfully fetched facilitators:", facilitators.length);
    return NextResponse.json(facilitators, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("GET /api/facilitators error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilitators", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST /api/facilitators
export async function POST(req: Request) {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate email from name
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@ceh.local`;

    const facilitator = await prisma.facilitator.create({
      data: {
        name: name.trim(),
        email: email
      }
    });
    return NextResponse.json(facilitator, { status: 201 });
  } catch (error) {
    console.error("POST /api/facilitators error:", error);
    return NextResponse.json({ error: "Failed to create facilitator" }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
