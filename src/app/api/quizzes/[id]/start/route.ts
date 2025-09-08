import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/quizzes/[id]/start - Start a new quiz attempt
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

    // Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          select: { id: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check attempt limits
    if (quiz.maxAttempts) {
      const existingAttempts = await prisma.quizAttempt.count({
        where: {
          userId: parseInt(userId),
          quizId: parseInt(id)
        }
      });

      if (existingAttempts >= quiz.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum number of attempts reached' },
          { status: 403 }
        );
      }
    }

    // Get the next attempt number
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: parseInt(userId),
        quizId: parseInt(id)
      },
      orderBy: { attemptNumber: 'desc' }
    });

    const attemptNumber = (lastAttempt?.attemptNumber || 0) + 1;

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: parseInt(userId),
        quizId: parseInt(id),
        totalQuestions: quiz.questions.length,
        attemptNumber,
        startedAt: new Date()
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            timeLimit: true,
            passingScore: true,
            randomizeQuestions: true
          }
        }
      }
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz attempt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
