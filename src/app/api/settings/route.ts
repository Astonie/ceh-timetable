import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/settings
export async function GET() {
  try {
    console.log("Attempting to fetch settings...");
    const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    console.log("Successfully fetched settings:", settings.length);
    return NextResponse.json(settings, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// POST /api/settings (create or update setting)
export async function POST(req: Request) {
  try {
    const { key, value, description } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }
    
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
    
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to create/update setting", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
