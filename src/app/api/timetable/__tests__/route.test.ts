import { NextRequest } from 'next/server';

// Create proper mock instances
const mockTimetableEntryFindMany = jest.fn();
const mockTimetableEntryCreate = jest.fn();
const mockDisconnect = jest.fn();

// Mock PrismaClient before importing the route
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    timetableEntry: {
      findMany: mockTimetableEntryFindMany,
      create: mockTimetableEntryCreate,
    },
    $disconnect: mockDisconnect,
  })),
}));

import { GET, POST } from '../route';

describe('/api/timetable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/timetable', () => {
    it('should return all timetable entries successfully', async () => {
      const mockEntries = [
        {
          id: 1,
          week: 'Week 1',
          title: 'Introduction to CEH',
          details: ['Topic 1', 'Topic 2'],
          facilitatorId: 1,
          createdAt: new Date('2023-01-01').toISOString(),
          facilitator: {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@ceh.local'
          }
        },
        {
          id: 2,
          week: 'Week 2',
          title: 'Network Security',
          details: ['Topic 3', 'Topic 4'],
          facilitatorId: null,
          createdAt: new Date('2023-01-02').toISOString(),
          facilitator: null
        }
      ];

      mockTimetableEntryFindMany.mockResolvedValue(mockEntries);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockEntries);
      expect(mockTimetableEntryFindMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        include: {
          facilitator: true
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database connection failed';
      mockTimetableEntryFindMany.mockRejectedValue(new Error(errorMessage));

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Failed to fetch timetable entries',
        details: errorMessage
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('POST /api/timetable', () => {
    it('should create a new timetable entry successfully', async () => {
      const entryData = {
        week: 'Week 3',
        title: 'Web Application Security',
        details: ['SQL Injection', 'XSS', 'CSRF'],
        facilitatorId: 1
      };

      const createdEntry = {
        id: 1,
        ...entryData,
        createdAt: new Date('2023-01-03').toISOString(),
        facilitator: {
          id: 1,
          name: 'Jane Smith',
          email: 'jane.smith@ceh.local'
        }
      };

      mockTimetableEntryCreate.mockResolvedValue(createdEntry);

      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify(entryData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(createdEntry);
      expect(mockTimetableEntryCreate).toHaveBeenCalledWith({
        data: entryData,
        include: {
          facilitator: true
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should create a timetable entry without facilitator', async () => {
      const entryData = {
        week: 'Week 4',
        title: 'Cryptography',
        details: ['Symmetric Encryption', 'Asymmetric Encryption']
      };

      const createdEntry = {
        id: 2,
        ...entryData,
        facilitatorId: null,
        createdAt: new Date('2023-01-04').toISOString(),
        facilitator: null
      };

      mockTimetableEntryCreate.mockResolvedValue(createdEntry);

      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify(entryData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(createdEntry);
      expect(mockTimetableEntryCreate).toHaveBeenCalledWith({
        data: {
          ...entryData,
          facilitatorId: null
        },
        include: {
          facilitator: true
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }), // Missing week and details
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Missing fields' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing week', async () => {
      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Title',
          details: ['Detail 1']
        }), // Missing week
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Missing fields' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing title', async () => {
      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify({
          week: 'Week 1',
          details: ['Detail 1']
        }), // Missing title
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Missing fields' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing details', async () => {
      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify({
          week: 'Week 1',
          title: 'Test Title'
        }), // Missing details
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Missing fields' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const entryData = {
        week: 'Week 5',
        title: 'Test Entry',
        details: ['Test detail']
      };

      mockTimetableEntryCreate.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/timetable', {
        method: 'POST',
        body: JSON.stringify(entryData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Failed to create timetable entry',
        details: 'Database error'
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
