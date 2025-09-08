import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/labs - Get all virtual labs with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const weekReference = searchParams.get('week');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (weekReference) where.weekReference = weekReference;

    const labs = await prisma.virtualLab.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        labQuizzes: {
          include: {
            quiz: {
              select: { id: true, title: true, difficulty: true, passingScore: true }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        attempts: userId ? {
          where: { userId: parseInt(userId) },
          select: { id: true, status: true, score: true, completedAt: true, timeSpent: true }
        } : false,
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: [
        { weekReference: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(labs);
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch virtual labs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/labs - Create new virtual lab (Admin/Facilitator only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const {
      title,
      description,
      difficulty,
      category,
      estimatedTime,
      instructions,
      objectives,
      prerequisites,
      resources,
      weekReference,
      createdBy
    } = data;

    // Validate required fields
    if (!title || !description || !instructions) {
      return NextResponse.json(
        { error: 'Title, description, and instructions are required' },
        { status: 400 }
      );
    }

    const lab = await prisma.virtualLab.create({
      data: {
        title,
        description,
        difficulty: difficulty || 'intermediate',
        category: category || 'general',
        estimatedTime: estimatedTime || 60,
        instructions,
        objectives: objectives || [],
        prerequisites: prerequisites || [],
        resources: resources || {},
        weekReference,
        createdBy: createdBy ? parseInt(createdBy) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { attempts: true }
        }
      }
    });

    return NextResponse.json(lab, { status: 201 });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: 'Failed to create virtual lab', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
