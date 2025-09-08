import { NextRequest } from 'next/server';

// Create proper mock instances
const mockVirtualLabFindMany = jest.fn();
const mockVirtualLabCreate = jest.fn();
const mockDisconnect = jest.fn();

// Mock PrismaClient before importing the route
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    virtualLab: {
      findMany: mockVirtualLabFindMany,
      create: mockVirtualLabCreate,
    },
    $disconnect: mockDisconnect,
  })),
}));

import { GET, POST } from '../route';

describe('/api/labs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should fetch all virtual labs successfully', async () => {
      const mockLabs = [
        {
          id: 1,
          title: 'Network Penetration Testing Lab',
          description: 'Hands-on experience with network penetration testing tools',
          category: 'Penetration Testing',
          difficulty: 'intermediate',
          estimatedTime: 120,
          instructions: 'Follow the lab guide to complete network scans',
          objectives: ['Learn Nmap', 'Understand network reconnaissance'],
          prerequisites: ['Basic networking knowledge'],
          resources: {
            tools: ['Nmap', 'Wireshark'],
            documentation: ['https://nmap.org/docs']
          },
          weekReference: 'Week 3',
          isActive: true,
          createdAt: new Date('2023-01-01').toISOString(),
          updatedAt: new Date('2023-01-01').toISOString(),
          creator: {
            id: 1,
            name: 'Lab Instructor',
            email: 'instructor@example.com'
          },
          _count: {
            attempts: 0
          }
        }
      ];

      mockVirtualLabFindMany.mockResolvedValue(mockLabs);

      const request = new NextRequest('http://localhost:3000/api/labs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        id: 1,
        title: 'Network Penetration Testing Lab',
        category: 'Penetration Testing',
        difficulty: 'intermediate',
        estimatedTime: 120
      });
    });

    it('should filter labs by category', async () => {
      mockVirtualLabFindMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/labs?category=Web%20Security');
      await GET(request);

      expect(mockVirtualLabFindMany).toHaveBeenCalledWith({
        where: { isActive: true, category: 'Web Security' },
        include: expect.any(Object),
        orderBy: expect.any(Array)
      });
    });

    it('should filter labs by difficulty', async () => {
      mockVirtualLabFindMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/labs?difficulty=advanced');
      await GET(request);

      expect(mockVirtualLabFindMany).toHaveBeenCalledWith({
        where: { isActive: true, difficulty: 'advanced' },
        include: expect.any(Object),
        orderBy: expect.any(Array)
      });
    });

    it('should handle database errors', async () => {
      mockVirtualLabFindMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/labs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch virtual labs',
        details: 'Database connection failed'
      });
    });
  });

  describe('POST', () => {
    it('should create a new virtual lab successfully', async () => {
      const newLab = {
        id: 1,
        title: 'Advanced Web Application Testing',
        description: 'Learn to test web applications for vulnerabilities',
        difficulty: 'advanced',
        category: 'Web Security',
        estimatedTime: 180,
        instructions: 'Use OWASP ZAP and Burp Suite to analyze the target application',
        objectives: ['Identify SQL injection', 'Find XSS vulnerabilities'],
        prerequisites: ['Basic web knowledge', 'HTTP protocol understanding'],
        resources: {
          tools: ['OWASP ZAP', 'Burp Suite'],
          targets: ['http://testapp.example.com']
        },
        weekReference: 'Week 5',
        createdBy: 1,
        isActive: true,
        createdAt: new Date('2023-01-01').toISOString(),
        updatedAt: new Date('2023-01-01').toISOString(),
        creator: {
          id: 1,
          name: 'Security Expert',
          email: 'expert@example.com'
        },
        _count: {
          attempts: 0
        }
      };

      mockVirtualLabCreate.mockResolvedValue(newLab);

      const requestBody = {
        title: 'Advanced Web Application Testing',
        description: 'Learn to test web applications for vulnerabilities',
        difficulty: 'advanced',
        category: 'Web Security',
        estimatedTime: 180,
        instructions: 'Use OWASP ZAP and Burp Suite to analyze the target application',
        objectives: ['Identify SQL injection', 'Find XSS vulnerabilities'],
        prerequisites: ['Basic web knowledge', 'HTTP protocol understanding'],
        resources: {
          tools: ['OWASP ZAP', 'Burp Suite'],
          targets: ['http://testapp.example.com']
        },
        weekReference: 'Week 5',
        createdBy: 1
      };

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        id: 1,
        title: 'Advanced Web Application Testing',
        category: 'Web Security',
        difficulty: 'advanced'
      });
    });

    it('should validate required fields - missing title', async () => {
      const requestBody = {
        description: 'Missing title',
        instructions: 'Some instructions'
      };

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title, description, and instructions are required');
    });

    it('should apply default values correctly', async () => {
      const newLab = {
        id: 1,
        title: 'Minimal Lab',
        description: 'Basic lab',
        instructions: 'Follow the steps',
        difficulty: 'intermediate',
        category: 'general',
        estimatedTime: 60,
        objectives: [],
        prerequisites: [],
        resources: {},
        createdBy: null
      };

      mockVirtualLabCreate.mockResolvedValue(newLab);

      const requestBody = {
        title: 'Minimal Lab',
        description: 'Basic lab',
        instructions: 'Follow the steps'
      };

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockVirtualLabCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          difficulty: 'intermediate',
          category: 'general',
          estimatedTime: 60,
          objectives: [],
          prerequisites: [],
          resources: {},
          createdBy: null
        }),
        include: expect.any(Object)
      });
    });

    it('should handle database errors during creation', async () => {
      mockVirtualLabCreate.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        title: 'Test Lab',
        description: 'Test description',
        instructions: 'Test instructions'
      };

      const request = new NextRequest('http://localhost:3000/api/labs', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create virtual lab',
        details: 'Database error'
      });
    });
  });
});