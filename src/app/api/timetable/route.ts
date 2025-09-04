import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const entries = await prisma.timetableEntry.findMany({
      orderBy: { id: "asc" },
      include: {
        facilitator: true
      }
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable entries", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const { week, title, details, facilitatorId } = await req.json();
    if (!week || !title || !details) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const entry = await prisma.timetableEntry.create({
      data: {
        week,
        title,
        details,
        facilitatorId: facilitatorId || null,
      },
      include: {
        facilitator: true
      }
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error("POST /api/timetable error:", error);
    return NextResponse.json(
      { error: "Failed to create timetable entry", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
