import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PATCH /api/facilitators/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await req.json();
    const id = Number(params.id);
    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }
    const facilitator = await prisma.facilitator.update({ where: { id }, data: { name } });
    return NextResponse.json(facilitator, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update facilitator" }, { status: 500 });
  }
}

// DELETE /api/facilitators/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.facilitator.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete facilitator" }, { status: 500 });
  }
}
