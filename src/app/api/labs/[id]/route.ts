import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/labs/[id] - Get specific virtual lab
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const lab = await prisma.virtualLab.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        labQuizzes: {
          include: {
            quiz: {
              include: {
                questions: true,
                _count: {
                  select: { attempts: true }
                }
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        attempts: userId ? {
          where: { userId: parseInt(userId) },
          orderBy: { createdAt: 'desc' }
        } : {
          include: {
            user: {
              select: { id: true, name: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 attempts for admin view
        },
        _count: {
          select: { attempts: true }
        }
      }
    });

    if (!lab) {
      return NextResponse.json(
        { error: 'Virtual lab not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lab);
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: 'Failed to fetch virtual lab', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/labs/[id] - Update virtual lab (Admin/Facilitator only)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const lab = await prisma.virtualLab.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
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

    return NextResponse.json(lab);
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: 'Failed to update virtual lab', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/labs/[id] - Delete virtual lab (Admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.virtualLab.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Virtual lab deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json(
      { error: 'Failed to delete virtual lab', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
