import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/lab-sessions - Start a new lab session (simulated for demo)
export async function POST(req: NextRequest) {
  try {
    const { userId, labId } = await req.json();

    if (!userId || !labId) {
      return NextResponse.json(
        { error: 'User ID and Lab ID are required' },
        { status: 400 }
      );
    }

    // Get lab details
    const lab = await prisma.virtualLab.findUnique({
      where: { id: parseInt(labId) }
    });

    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Check for existing active session
    const existingSession = await prisma.labSession.findFirst({
      where: {
        userId: parseInt(userId),
        labId: parseInt(labId),
        status: 'running'
      }
    });

    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        status: 'running',
        accessUrl: existingSession.accessUrl,
        sshPort: existingSession.sshPort,
        webPort: existingSession.webPort
      });
    }

    // Generate unique session ID
    const sessionId = `lab-${userId}-${labId}-${Date.now()}`;
    
    // Simulate port allocation
    const sshPort = 2222 + Math.floor(Math.random() * 1000);
    const webPort = 8080 + Math.floor(Math.random() * 1000);

    // Simulate container creation (for demo purposes)
    // In production, this would actually create Docker containers
    const containerId = `simulated-container-${sessionId}`;

    // Create session record
    await prisma.labSession.create({
      data: {
        id: sessionId,
        userId: parseInt(userId),
        labId: parseInt(labId),
        containerId,
        status: 'running',
        accessUrl: `https://demo-lab-${sessionId}.example.com`,
        sshPort,
        webPort,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      }
    });

    return NextResponse.json({
      sessionId,
      status: 'running',
      accessUrl: `https://demo-lab-${sessionId}.example.com`,
      sshAccess: `# Demo Mode - SSH simulation: ssh labuser@demo-server -p ${sshPort}`,
      sshPort,
      webPort,
      credentials: {
        username: 'labuser',
        password: 'password123'
      },
      instructions: `
🎯 DEMO MODE - Virtual Lab Environment

This is a demonstration of the virtual lab system. In production, this would:
- Launch a real Docker container with Kali Linux
- Provide actual SSH access to a penetration testing environment
- Include vulnerable applications for ${lab.category} exercises

SSH Access (simulated): ssh labuser@localhost -p ${sshPort}
Web Access (simulated): http://localhost:${webPort}

The environment would include:
- Comprehensive penetration testing tools (nmap, sqlmap, nikto, etc.)
- Vulnerable targets specific to ${lab.category}
- Pre-configured lab exercises and scenarios
- Real-time session monitoring and timeout management

Session expires in 4 hours.

To enable real Docker integration:
1. Build the lab image: docker build -t ceh-virtual-lab .
2. Install Docker on the server
3. Enable the full Docker API implementation
      `
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating lab session:', error);
    return NextResponse.json(
      { error: 'Failed to create lab session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/lab-sessions - List user's lab sessions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessions = await prisma.labSession.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        lab: {
          select: { title: true, category: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Error fetching lab sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab sessions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
