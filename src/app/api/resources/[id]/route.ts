import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resourceId = Number(id);
    
    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }
    
    await prisma.resource.delete({
      where: { id: resourceId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
