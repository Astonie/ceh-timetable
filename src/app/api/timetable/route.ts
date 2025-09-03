import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const entries = await prisma.timetableEntry.findMany({ 
      orderBy: { id: "asc" },
      include: {
        facilitator: true
      }
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to fetch timetable entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
  }
}
