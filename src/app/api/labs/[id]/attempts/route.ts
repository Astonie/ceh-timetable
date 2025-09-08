import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/labs/[id]/attempts - Get attempts for specific lab
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const whereClause = {
      labId: parseInt(id),
      ...(userId && { userId: parseInt(userId) })
    };

    const attempts = await prisma.labAttempt.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        lab: {
          select: { id: true, title: true, category: true, difficulty: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching lab attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab attempts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/labs/[id]/attempts - Start new lab attempt
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user already has an active attempt
    const existingAttempt = await prisma.labAttempt.findUnique({
      where: {
        userId_labId: {
          userId: parseInt(userId),
          labId: parseInt(id)
        }
      }
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'in_progress') {
        return NextResponse.json(existingAttempt);
      } else {
        // Update existing attempt to start new one
        const attempt = await prisma.labAttempt.update({
          where: { id: existingAttempt.id },
          data: {
            status: 'in_progress',
            startedAt: new Date(),
            completedAt: null,
            timeSpent: null,
            score: null,
            notes: null,
            screenshots: []
          },
          include: {
            lab: {
              select: { id: true, title: true, instructions: true, objectives: true, resources: true }
            }
          }
        });
        return NextResponse.json(attempt);
      }
    }

    // Create new attempt
    const attempt = await prisma.labAttempt.create({
      data: {
        userId: parseInt(userId),
        labId: parseInt(id),
        status: 'in_progress',
        startedAt: new Date()
      },
      include: {
        lab: {
          select: { id: true, title: true, instructions: true, objectives: true, resources: true }
        }
      }
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Error creating lab attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start lab attempt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
