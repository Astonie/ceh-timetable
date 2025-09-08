import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/quizzes/[id] - Get specific quiz (with or without answers based on user access)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const showAnswers = searchParams.get('showAnswers') === 'true';

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            points: true,
            orderIndex: true,
            ...(showAnswers && { 
              correctAnswer: true,
              explanation: true 
            })
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
          select: { 
            questions: true,
            attempts: true 
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Randomize questions if enabled and not showing answers
    if (quiz.randomizeQuestions && !showAnswers) {
      quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return NextResponse.json({
      ...quiz,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/quizzes/[id] - Update quiz (Admin/Facilitator only)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        questions: true,
        _count: {
          select: { 
            questions: true,
            attempts: true 
          }
        }
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/quizzes/[id] - Delete quiz (Admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.quiz.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
