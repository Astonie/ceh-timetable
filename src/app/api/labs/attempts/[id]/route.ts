import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/labs/attempts/[id] - Get specific lab attempt
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const attempt = await prisma.labAttempt.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        lab: {
          include: {
            creator: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Lab attempt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Error fetching lab attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab attempt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/labs/attempts/[id] - Update lab attempt (progress, completion, etc.)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const {
      status,
      notes,
      screenshots,
      feedback,
      score,
      timeSpent
    } = data;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) updateData.notes = notes;
    if (screenshots !== undefined) updateData.screenshots = screenshots;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (score !== undefined) updateData.score = score;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;

    const attempt = await prisma.labAttempt.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, username: true }
        },
        lab: {
          select: { id: true, title: true, category: true, difficulty: true }
        }
      }
    });

    // Update user progress and points if lab completed successfully
    if (status === 'completed' && score && score >= 70) {
      await updateUserProgress(attempt.userId, 'labs', score);
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Error updating lab attempt:', error);
    return NextResponse.json(
      { error: 'Failed to update lab attempt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to update user progress
async function updateUserProgress(userId: number, category: string, score: number) {
  try {
    // Update completed labs count
    await prisma.userProgress.upsert({
      where: {
        userId_category_metric: {
          userId,
          category,
          metric: 'completed_labs'
        }
      },
      update: {
        value: { increment: 1 },
        lastUpdated: new Date()
      },
      create: {
        userId,
        category,
        metric: 'completed_labs',
        value: 1
      }
    });

    // Update average score
    const completedLabs = await prisma.labAttempt.findMany({
      where: {
        userId,
        status: 'completed',
        score: { not: null }
      },
      select: { score: true }
    });

    if (completedLabs.length > 0) {
      const averageScore = completedLabs.reduce((sum, lab) => sum + (lab.score || 0), 0) / completedLabs.length;
      
      await prisma.userProgress.upsert({
        where: {
          userId_category_metric: {
            userId,
            category,
            metric: 'average_score'
          }
        },
        update: {
          value: averageScore,
          lastUpdated: new Date()
        },
        create: {
          userId,
          category,
          metric: 'average_score',
          value: averageScore
        }
      });
    }

    // Award study points
    const pointsToAward = Math.floor(score / 10); // 10 points per 10% score
    await prisma.user.update({
      where: { id: userId },
      data: {
        studyPoints: { increment: pointsToAward }
      }
    });

  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}
