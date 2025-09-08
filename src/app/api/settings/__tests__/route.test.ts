import { NextRequest } from 'next/server';

// Create proper mock instances
const mockSettingFindMany = jest.fn();
const mockSettingUpsert = jest.fn();
const mockDisconnect = jest.fn();

// Mock PrismaClient before importing the route
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    setting: {
      findMany: mockSettingFindMany,
      upsert: mockSettingUpsert,
    },
    $disconnect: mockDisconnect,
  })),
}));

import { GET, POST } from '../route';

describe('/api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/settings', () => {
    it('should return all settings successfully', async () => {
      const mockSettings = [
        {
          id: 1,
          key: 'theme',
          value: 'dark',
          description: 'Application theme setting',
          updatedAt: new Date('2023-01-01').toISOString()
        },
        {
          id: 2,
          key: 'notifications',
          value: 'enabled',
          description: 'Notification preferences',
          updatedAt: new Date('2023-01-02').toISOString()
        }
      ];

      mockSettingFindMany.mockResolvedValue(mockSettings);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockSettings);
      expect(mockSettingFindMany).toHaveBeenCalledWith({
        orderBy: { key: 'asc' }
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database connection failed';
      mockSettingFindMany.mockRejectedValue(new Error(errorMessage));

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Failed to fetch settings',
        details: errorMessage
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('POST /api/settings', () => {
    it('should create a new setting successfully', async () => {
      const settingData = {
        key: 'newSetting',
        value: 'newValue',
        description: 'New setting description'
      };

      const createdSetting = {
        id: 1,
        ...settingData,
        updatedAt: new Date('2023-01-01').toISOString(),
        createdAt: new Date('2023-01-01').toISOString()
      };

      mockSettingUpsert.mockResolvedValue(createdSetting);

      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(createdSetting);
      expect(mockSettingUpsert).toHaveBeenCalledWith({
        where: { key: settingData.key },
        update: {
          value: settingData.value,
          description: settingData.description
        },
        create: settingData
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should update an existing setting successfully', async () => {
      const settingData = {
        key: 'existingSetting',
        value: 'updatedValue',
        description: 'Updated description'
      };

      const updatedSetting = {
        id: 1,
        ...settingData,
        updatedAt: new Date('2023-01-02').toISOString(),
        createdAt: new Date('2023-01-01').toISOString()
      };

      mockSettingUpsert.mockResolvedValue(updatedSetting);

      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(updatedSetting);
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing key', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ value: 'test' }), // Missing key
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Key and value are required' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should return 400 for missing value', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'test' }), // Missing value
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Key and value are required' });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle database errors during upsert', async () => {
      const settingData = {
        key: 'testSetting',
        value: 'testValue'
      };

      mockSettingUpsert.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
        headers: { 'content-type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to create/update setting');
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
