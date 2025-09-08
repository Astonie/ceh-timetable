import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/quizzes/attempts/[id]/submit - Submit quiz responses
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { responses, timeSpent } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Responses array is required' },
        { status: 400 }
      );
    }

    // Get the attempt
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parseInt(id) },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Quiz attempt not found' },
        { status: 404 }
      );
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: 'Quiz attempt already completed' },
        { status: 400 }
      );
    }

    // Process responses and calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const responsePromises = responses.map(async (response: { questionId: number; answer: string }) => {
      const question = attempt.quiz.questions.find(q => q.id === response.questionId);
      if (!question) return null;

      const isCorrect = response.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      const pointsEarned = isCorrect ? question.points : 0;

      totalPoints += question.points;
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += pointsEarned;
      }

      return prisma.quizResponse.create({
        data: {
          attemptId: parseInt(id),
          questionId: response.questionId,
          userAnswer: response.answer,
          isCorrect,
          pointsEarned
        }
      });
    });

    // Create all responses
    await Promise.all(responsePromises.filter(p => p !== null));

    // Calculate final score percentage
    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = scorePercentage >= attempt.quiz.passingScore;

    // Update the attempt with final results
    const completedAttempt = await prisma.quizAttempt.update({
      where: { id: parseInt(id) },
      data: {
        completedAt: new Date(),
        score: scorePercentage,
        correctAnswers,
        timeSpent: timeSpent || null,
        isPassed
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            showCorrectAnswers: true
          }
        },
        responses: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                correctAnswer: true,
                explanation: true
              }
            }
          }
        }
      }
    });

    // Update user progress and award points
    if (isPassed) {
      await updateUserQuizProgress(attempt.userId, scorePercentage);
    }

    // Return results with correct answers if allowed
    const result = {
      ...completedAttempt,
      showAnswers: attempt.quiz.showCorrectAnswers || false
    };

    if (!attempt.quiz.showCorrectAnswers) {
      // Remove correct answers and explanations if not allowed
      result.responses = result.responses.map(r => ({
        ...r,
        question: {
          ...r.question,
          correctAnswer: '',
          explanation: null
        }
      }));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to update user quiz progress
async function updateUserQuizProgress(userId: number, score: number) {
  try {
    // Update completed quizzes count
    await prisma.userProgress.upsert({
      where: {
        userId_category_metric: {
          userId,
          category: 'quizzes',
          metric: 'completed_quizzes'
        }
      },
      update: {
        value: { increment: 1 },
        lastUpdated: new Date()
      },
      create: {
        userId,
        category: 'quizzes',
        metric: 'completed_quizzes',
        value: 1
      }
    });

    // Update average quiz score
    const completedQuizzes = await prisma.quizAttempt.findMany({
      where: {
        userId,
        isPassed: true,
        score: { not: null }
      },
      select: { score: true }
    });

    if (completedQuizzes.length > 0) {
      const averageScore = completedQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedQuizzes.length;
      
      await prisma.userProgress.upsert({
        where: {
          userId_category_metric: {
            userId,
            category: 'quizzes',
            metric: 'average_score'
          }
        },
        update: {
          value: averageScore,
          lastUpdated: new Date()
        },
        create: {
          userId,
          category: 'quizzes',
          metric: 'average_score',
          value: averageScore
        }
      });
    }

    // Award study points
    const pointsToAward = Math.floor(score / 5); // 20 points for 100% score
    await prisma.user.update({
      where: { id: userId },
      data: {
        studyPoints: { increment: pointsToAward }
      }
    });

  } catch (error) {
    console.error('Error updating user quiz progress:', error);
  }
}
