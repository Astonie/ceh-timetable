import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { week, title, details, facilitatorId } = await req.json();
    if (!week || !title || !details) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const entry = await prisma.timetableEntry.update({
      where: { id },
      data: { 
        week, 
        title, 
        details, 
        facilitatorId: facilitatorId || null 
      },
      include: {
        facilitator: true
      }
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error("PATCH /api/timetable/[id] error:", error);
    return NextResponse.json({ error: "Failed to update timetable entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.timetableEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/timetable/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete timetable entry" }, { status: 500 });
  }
}
