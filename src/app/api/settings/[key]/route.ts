import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/settings/[key]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("GET /api/settings/[key] error:", error);
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
  }
}

// PATCH /api/settings/[key]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;
    const { value, description } = await req.json();
    if (value === undefined) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }
    
    const setting = await prisma.setting.update({
      where: { key },
      data: { value, description },
    });
    
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/settings/[key] error:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}

// DELETE /api/settings/[key]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;
    await prisma.setting.delete({ where: { key } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/settings/[key] error:", error);
    return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 });
  }
}
