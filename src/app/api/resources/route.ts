import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET /api/resources - Get all resources
export async function GET() {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST /api/resources - Create a new resource
export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const { title, description, type, url, fileSize, isUploadedFile } = await req.json();
    
    if (!title || !type || !url) {
      return NextResponse.json({ error: "Title, type, and URL are required" }, { status: 400 });
    }
    
    // Validate type is either 'pdf' or 'link' or 'uploaded-pdf'
    if (type !== 'pdf' && type !== 'link' && type !== 'uploaded-pdf') {
      return NextResponse.json({ error: "Type must be either 'pdf', 'uploaded-pdf' or 'link'" }, { status: 400 });
    }
    
    const resource = await prisma.resource.create({
      data: { 
        title, 
        description, 
        type, 
        url,
        fileSize: fileSize || null,
        isUploadedFile: isUploadedFile || false
      }
    });
    
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to create resource", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
