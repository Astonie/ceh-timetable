const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupQuizData() {
  try {
    console.log('Cleaning up incomplete quiz attempts...');
    
    // Delete all quiz responses for incomplete attempts
    const incompleteAttempts = await prisma.quizAttempt.findMany({
      where: { completedAt: null },
      include: { responses: true }
    });
    
    console.log(`Found ${incompleteAttempts.length} incomplete attempts`);
    
    for (const attempt of incompleteAttempts) {
      if (attempt.responses.length > 0) {
        console.log(`Cleaning up ${attempt.responses.length} responses for attempt ${attempt.id}`);
        await prisma.quizResponse.deleteMany({
          where: { attemptId: attempt.id }
        });
      }
    }
    
    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupQuizData();
