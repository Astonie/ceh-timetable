import { NextRequest } from 'next/server';

// Mock PrismaClient before importing the route
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    studyGroup: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    studyGroupMember: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

import { PrismaClient } from '@prisma/client';
import { GET, POST } from '../route';

const mockPrisma = new PrismaClient();

describe('/api/groups', () => {
  let mockStudyGroupFindMany: jest.Mock;
  let mockStudyGroupCreate: jest.Mock;
  let mockUserFindUnique: jest.Mock;
  let mockStudyGroupMemberCreate: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStudyGroupFindMany = mockPrisma.studyGroup.findMany as jest.Mock;
    mockStudyGroupCreate = mockPrisma.studyGroup.create as jest.Mock;
    mockUserFindUnique = mockPrisma.user.findUnique as jest.Mock;
    mockStudyGroupMemberCreate = mockPrisma.studyGroupMember.create as jest.Mock;
    mockDisconnect = mockPrisma.$disconnect as jest.Mock;
  });

  describe('GET /api/groups', () => {
    it('should return all public study groups successfully', async () => {
      const mockGroups = [
        {
          id: 1,
          name: 'Test Group',
          description: 'Test description',
          ownerId: 1,
          isPublic: true,
          maxMembers: 10,
          createdAt: new Date(),
          owner: {
            id: 1,
            username: 'owner',
            name: 'Group Owner'
          },
          members: [
            {
              user: {
                id: 1,
                username: 'member1',
                name: 'Member One'
              }
            }
          ],
          _count: { members: 1 }
        }
      ];

      mockStudyGroupFindMany.mockResolvedValue(mockGroups);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockGroups);
      expect(mockStudyGroupFindMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              name: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database connection failed';
      mockStudyGroupFindMany.mockRejectedValue(new Error(errorMessage));

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Failed to fetch groups',
        details: errorMessage
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('POST /api/groups', () => {
    it('should create a new study group successfully', async () => {
      const groupData = {
        name: 'New Study Group',
        description: 'New group description',
        ownerId: 1,
        maxMembers: 15
      };

      const mockOwner = {
        id: 1,
        username: 'owner',
        name: 'Group Owner'
      };

      const createdGroup = {
        id: 1,
        ...groupData,
        isPublic: true,
        createdAt: new Date(),
        owner: mockOwner
      };

      mockUserFindUnique.mockResolvedValue(mockOwner);
      mockStudyGroupCreate.mockResolvedValue(createdGroup);
      mockStudyGroupMemberCreate.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdGroup);
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: groupData.ownerId }
      });
      expect(mockStudyGroupCreate).toHaveBeenCalledWith({
        data: {
          name: groupData.name,
          description: groupData.description,
          ownerId: groupData.ownerId,
          maxMembers: groupData.maxMembers
        },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });
      expect(mockStudyGroupMemberCreate).toHaveBeenCalledWith({
        data: {
          userId: groupData.ownerId,
          groupId: createdGroup.id,
          role: 'owner'
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should create a group with default maxMembers when not provided', async () => {
      const groupData = {
        name: 'Default Group',
        ownerId: 1
      };

      const mockOwner = {
        id: 1,
        username: 'owner',
        name: 'Group Owner'
      };

      const createdGroup = {
        id: 2,
        ...groupData,
        description: null,
        maxMembers: 10,
        isPublic: true,
        createdAt: new Date(),
        owner: mockOwner
      };

      mockUserFindUnique.mockResolvedValue(mockOwner);
      mockStudyGroupCreate.mockResolvedValue(createdGroup);
      mockStudyGroupMemberCreate.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdGroup);
      expect(mockStudyGroupCreate).toHaveBeenCalledWith({
        data: {
          name: groupData.name,
          description: null,
          ownerId: groupData.ownerId,
          maxMembers: 10
        },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify({ description: 'Test' }), // Missing name and ownerId
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Missing required fields' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 404 for non-existent owner', async () => {
      const groupData = {
        name: 'Test Group',
        ownerId: 999
      };

      mockUserFindUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result).toEqual({ error: 'Owner not found' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const groupData = {
        name: 'New Group',
        ownerId: 1
      };

      mockUserFindUnique.mockResolvedValue({ id: 1 });
      mockStudyGroupCreate.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to create group');
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
