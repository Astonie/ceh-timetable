import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/quizzes - Get all quizzes with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const weekReference = searchParams.get('week');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') !== 'false';

    const where: Record<string, unknown> = {
      isActive: true,
      ...(isPublic && { isPublic: true })
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (weekReference) where.weekReference = weekReference;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        questions: {
          select: {
            id: true,
            questionType: true,
            points: true
          }
        },
        attempts: userId ? {
          where: { userId: parseInt(userId) },
          select: { 
            id: true, 
            score: true, 
            isPassed: true, 
            completedAt: true, 
            attemptNumber: true,
            timeSpent: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Latest attempt
        } : false,
        _count: {
          select: { 
            questions: true,
            attempts: true 
          }
        }
      },
      orderBy: [
        { weekReference: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Calculate total points for each quiz
    const quizzesWithStats = quizzes.map(quiz => ({
      ...quiz,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      userAttempt: quiz.attempts?.[0] || null
    }));

    return NextResponse.json(quizzesWithStats);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/quizzes - Create new quiz (Admin/Facilitator only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingScore,
      maxAttempts,
      isPublic,
      randomizeQuestions,
      showCorrectAnswers,
      weekReference,
      createdBy,
      questions
    } = data;

    // Validate required fields
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || '',
        category: category || 'general',
        difficulty: difficulty || 'intermediate',
        timeLimit,
        passingScore: passingScore || 70.0,
        maxAttempts,
        isPublic: isPublic !== false,
        randomizeQuestions: randomizeQuestions !== false,
        showCorrectAnswers: showCorrectAnswers || false,
        weekReference,
        createdBy: createdBy ? parseInt(createdBy) : null,
        questions: {
          create: questions.map((q: { questionText: string; questionType?: string; options?: unknown; correctAnswer: string; explanation?: string; points?: number }, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'multiple_choice',
            options: q.options || null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            points: q.points || 1,
            orderIndex: index
          }))
        }
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

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
