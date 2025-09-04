import { NextRequest } from 'next/server';

// Mock PrismaClient before importing the route
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    facilitator: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

import { PrismaClient } from '@prisma/client';
import { GET, POST } from '../route';

const mockPrisma = new PrismaClient();

describe('/api/facilitators', () => {
  let mockFacilitatorFindMany: jest.Mock;
  let mockFacilitatorCreate: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFacilitatorFindMany = mockPrisma.facilitator.findMany as jest.Mock;
    mockFacilitatorCreate = mockPrisma.facilitator.create as jest.Mock;
    mockDisconnect = mockPrisma.$disconnect as jest.Mock;
  });

  describe('GET /api/facilitators', () => {
    it('should return all facilitators successfully', async () => {
      const mockFacilitators = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@ceh.local',
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@ceh.local',
          createdAt: new Date()
        }
      ];

      mockFacilitatorFindMany.mockResolvedValue(mockFacilitators);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockFacilitators);
      expect(mockFacilitatorFindMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database connection failed';
      mockFacilitatorFindMany.mockRejectedValue(new Error(errorMessage));

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Failed to fetch facilitators',
        details: errorMessage
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('POST /api/facilitators', () => {
    it('should create a new facilitator successfully', async () => {
      const facilitatorData = {
        name: 'Bob Johnson'
      };

      const createdFacilitator = {
        id: 1,
        name: 'Bob Johnson',
        email: 'bob.johnson@ceh.local',
        createdAt: new Date()
      };

      mockFacilitatorCreate.mockResolvedValue(createdFacilitator);

      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify(facilitatorData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdFacilitator);
      expect(mockFacilitatorCreate).toHaveBeenCalledWith({
        data: {
          name: 'Bob Johnson',
          email: 'bob.johnson@ceh.local'
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should generate correct email from name with spaces', async () => {
      const facilitatorData = {
        name: 'Alice Mary Wilson'
      };

      const createdFacilitator = {
        id: 2,
        name: 'Alice Mary Wilson',
        email: 'alice.mary.wilson@ceh.local',
        createdAt: new Date()
      };

      mockFacilitatorCreate.mockResolvedValue(createdFacilitator);

      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify(facilitatorData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdFacilitator);
      expect(mockFacilitatorCreate).toHaveBeenCalledWith({
        data: {
          name: 'Alice Mary Wilson',
          email: 'alice.mary.wilson@ceh.local'
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should trim whitespace from name', async () => {
      const facilitatorData = {
        name: '  Charlie Brown  '
      };

      const createdFacilitator = {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie.brown@ceh.local',
        createdAt: new Date()
      };

      mockFacilitatorCreate.mockResolvedValue(createdFacilitator);

      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify(facilitatorData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdFacilitator);
      expect(mockFacilitatorCreate).toHaveBeenCalledWith({
        data: {
          name: 'Charlie Brown',
          email: 'charlie.brown@ceh.local'
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing name', async () => {
      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify({}), // Missing name
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Name is required' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for empty name', async () => {
      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Name is required' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for non-string name', async () => {
      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify({ name: 123 }),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Name is required' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const facilitatorData = {
        name: 'Test Facilitator'
      };

      mockFacilitatorCreate.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/facilitators', {
        method: 'POST',
        body: JSON.stringify(facilitatorData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to create facilitator');
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
