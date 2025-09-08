import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/lab-sessions/[sessionId] - Get session status
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    const session = await prisma.labSession.findUnique({
      where: { id: sessionId },
      include: {
        lab: {
          select: { title: true, category: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId,
      status: session.status,
      accessUrl: session.accessUrl,
      sshPort: session.sshPort,
      webPort: session.webPort,
      lab: session.lab,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/lab-sessions/[sessionId] - Stop lab session
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    const session = await prisma.labSession.findUnique({
      where: { id: sessionId }
    });

    if (session) {
      // Update session status to stopped
      await prisma.labSession.update({
        where: { id: sessionId },
        data: { status: 'stopped' }
      });
    }
    
    return NextResponse.json({ 
      message: 'Session terminated successfully',
      sessionId 
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
