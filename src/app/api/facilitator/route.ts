import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());

export async function GET() {
  try {
    console.log("GET /api/facilitator called");
    
    // Get all facilitators from the database
    const facilitators = await prisma.facilitator.findMany({
      orderBy: { id: 'asc' }
    });
    
    if (facilitators.length === 0) {
      return NextResponse.json({ error: "No facilitators found" }, { status: 404 });
    }

    // For now, return the first facilitator as the current one
    // In a more sophisticated system, you'd track which facilitator is current
    const teamMembers = facilitators.map(f => f.name);
    const currentIndex = 0; // You can implement rotation logic here if needed
    
    console.log(`Returning facilitators:`, teamMembers);
    return NextResponse.json({ 
      index: currentIndex, 
      teamMembers,
      currentFacilitator: facilitators[currentIndex]
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/facilitator error:", error);
    return NextResponse.json({ error: "Failed to fetch facilitator" }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log("POST /api/facilitator called");
    
    // Get all facilitators
    const facilitators = await prisma.facilitator.findMany({
      orderBy: { id: 'asc' }
    });
    
    if (facilitators.length === 0) {
      return NextResponse.json({ error: "No facilitators found" }, { status: 404 });
    }

    const teamMembers = facilitators.map(f => f.name);
    // Simple rotation - you can implement more sophisticated logic here
    const newIndex = (Math.floor(Math.random() * facilitators.length)) % facilitators.length;
    
    console.log(`Rotating to facilitator index: ${newIndex}`);
    return NextResponse.json({ 
      index: newIndex, 
      teamMembers,
      currentFacilitator: facilitators[newIndex]
    }, { status: 200 });
  } catch (error) {
    console.error("POST /api/facilitator error:", error);
    return NextResponse.json({ error: "Failed to update facilitator" }, { status: 500 });
  }
}