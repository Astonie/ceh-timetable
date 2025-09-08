import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    virtualLab: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    quiz: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    labSession: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    quizAttempt: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Import API handlers after mocking
import { GET as getVirtualLabs, POST as createVirtualLab } from '../api/labs/route';
import { GET as getQuizzes, POST as createQuiz } from '../api/quizzes/route';
import { GET as getLabSessions, POST as createLabSession } from '../api/lab-sessions/route';

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Virtual Labs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/labs', () => {
    it('should return all virtual labs', async () => {
      const mockLabs = [
        {
          id: 1,
          title: 'Nmap Network Discovery Lab',
          description: 'Learn network reconnaissance using Nmap',
          difficulty: 'beginner',
          category: 'reconnaissance',
          estimatedTime: 60,
          instructions: 'Lab instructions here',
          objectives: ['Learn Nmap', 'Network discovery'],
          prerequisites: ['Basic networking'],
          resources: {},
          isActive: true,
          weekReference: 'Week 2',
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          creator: { id: 1, name: 'Test Creator' },
          attempts: [],
          _count: { attempts: 0 }
        }
      ];

      (mockPrisma.virtualLab.findMany as jest.Mock).mockResolvedValue(mockLabs);

      const request = new NextRequest('http://localhost:3000/api/labs');
      const response = await getVirtualLabs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLabs);
      expect(mockPrisma.virtualLab.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          attempts: expect.any(Object),
          _count: { select: { attempts: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should filter labs by category', async () => {
      const mockLabs = [
        {
          id: 1,
          title: 'SQL Injection Lab',
          category: 'web_application_hacking',
          difficulty: 'intermediate'
        }
      ];

      (mockPrisma.virtualLab.findMany as jest.Mock).mockResolvedValue(mockLabs);

      const request = new NextRequest('http://localhost:3000/api/labs?category=web_application_hacking');
      const response = await getVirtualLabs(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.virtualLab.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          category: 'web_application_hacking'
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should filter labs by difficulty', async () => {
      const request = new NextRequest('http://localhost:3000/api/labs?difficulty=beginner');
      (mockPrisma.virtualLab.findMany as jest.Mock).mockResolvedValue([]);

      await getVirtualLabs(request);

      expect(mockPrisma.virtualLab.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          difficulty: 'beginner'
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.virtualLab.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/labs');
      const response = await getVirtualLabs(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Failed to fetch labs' });
    });
  });

  describe('POST /api/labs', () => {
    it('should create a new virtual lab', async () => {
      const newLab = {
        title: 'Test Lab',
        description: 'Test description',
        difficulty: 'beginner',
        category: 'test',
        estimatedTime: 30,
        instructions: 'Test instructions',
        objectives: ['Test objective'],
        prerequisites: ['Test prerequisite'],
        resources: {},
        createdBy: 1
      };

      const createdLab = { id: 1, ...newLab, createdAt: new Date(), updatedAt: new Date(), isActive: true };
      (mockPrisma.virtualLab.create as jest.Mock).mockResolvedValue(createdLab);

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(newLab)
      });

      const response = await createVirtualLab(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdLab);
      expect(mockPrisma.virtualLab.create).toHaveBeenCalledWith({
        data: newLab,
        include: {
          creator: { select: { id: true, name: true, email: true } }
        }
      });
    });

    it('should validate required fields', async () => {
      const invalidLab = {
        title: '', // Empty title should fail validation
        description: 'Test description'
      };

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(invalidLab)
      });

      const response = await createVirtualLab(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Missing required fields' });
    });
  });
});

describe('Quiz API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quizzes', () => {
    it('should return all quizzes', async () => {
      const mockQuizzes = [
        {
          id: 1,
          title: 'Reconnaissance Quiz',
          description: 'Test your reconnaissance knowledge',
          category: 'domain_2',
          difficulty: 'beginner',
          timeLimit: 30,
          passingScore: 70.0,
          isActive: true,
          isPublic: true,
          creator: { id: 1, name: 'Test Creator' },
          questions: [],
          attempts: [],
          _count: { questions: 5, attempts: 10 }
        }
      ];

      (mockPrisma.quiz.findMany as jest.Mock).mockResolvedValue(mockQuizzes);

      const request = new NextRequest('http://localhost:3000/api/quizzes');
      const response = await getQuizzes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockQuizzes);
    });

    it('should filter quizzes by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes?category=domain_2');
      (mockPrisma.quiz.findMany as jest.Mock).mockResolvedValue([]);

      await getQuizzes(request);

      expect(mockPrisma.quiz.findMany).toHaveBeenCalledWith({
        where: { 
          isActive: true,
          isPublic: true,
          category: 'domain_2'
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const newQuiz = {
        title: 'Test Quiz',
        description: 'Test description',
        category: 'general',
        difficulty: 'beginner',
        timeLimit: 30,
        passingScore: 70.0,
        createdBy: 1
      };

      const createdQuiz = { id: 1, ...newQuiz, createdAt: new Date(), updatedAt: new Date() };
      (mockPrisma.quiz.create as jest.Mock).mockResolvedValue(createdQuiz);

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(newQuiz)
      });

      const response = await createQuiz(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdQuiz);
    });
  });
});

describe('Lab Sessions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/lab-sessions', () => {
    it('should return lab sessions for a user', async () => {
      const mockSessions = [
        {
          id: 1,
          sessionId: 'test-session-123',
          userId: 1,
          labId: 1,
          status: 'active',
          accessUrl: 'http://localhost:8080',
          sshAccess: 'ssh user@localhost -p 2222',
          sshPort: 2222,
          webPort: 8080,
          credentials: { username: 'user', password: 'pass' },
          instructions: 'Lab environment ready',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (mockPrisma.labSession.findMany as jest.Mock).mockResolvedValue(mockSessions);

      const request = new NextRequest('http://localhost:3000/api/lab-sessions?userId=1');
      const response = await getLabSessions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSessions);
    });
  });

  describe('POST /api/lab-sessions', () => {
    it('should create a new lab session', async () => {
      const sessionRequest = {
        userId: 1,
        labId: 1
      };

      const createdSession = {
        id: 1,
        sessionId: 'test-session-123',
        userId: 1,
        labId: 1,
        status: 'active',
        accessUrl: 'http://localhost:8080',
        sshAccess: 'ssh user@localhost -p 2222',
        sshPort: 2222,
        webPort: 8080,
        credentials: { username: 'user', password: 'pass' },
        instructions: 'Lab environment ready',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma.labSession.create as jest.Mock).mockResolvedValue(createdSession);

      const request = new NextRequest('http://localhost:3000/api/lab-sessions', {
        method: 'POST',
        body: JSON.stringify(sessionRequest)
      });

      const response = await createLabSession(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdSession);
    });

    it('should validate required fields for session creation', async () => {
      const invalidRequest = {
        userId: 1
        // Missing labId
      };

      const request = new NextRequest('http://localhost:3000/api/lab-sessions', {
        method: 'POST',
        body: JSON.stringify(invalidRequest)
      });

      const response = await createLabSession(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Missing required fields: userId and labId' });
    });
  });
});
