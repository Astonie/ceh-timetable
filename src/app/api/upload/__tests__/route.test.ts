import { NextRequest } from 'next/server';
import { POST } from '../route';

// Type definitions for mocks
interface MockFile {
  name: string;
  size: number;
  arrayBuffer: jest.Mock;
}

interface MockFormData {
  get: jest.Mock;
}

interface MockRequest {
  formData: jest.Mock;
}

// Mock File
const mockFile: MockFile = {
  name: 'test.pdf',
  size: 1024,
  arrayBuffer: jest.fn()
};

// Mock FormData
const mockFormData: MockFormData = {
  get: jest.fn()
};

global.File = jest.fn().mockImplementation(() => mockFile) as unknown as typeof File;

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should upload a PDF file successfully', async () => {
      const mockArrayBuffer = Buffer.from('mock pdf content');
      mockFile.arrayBuffer.mockResolvedValue(mockArrayBuffer);
      mockFormData.get.mockReturnValue(mockFile);

      // Mock Request with formData
      const mockRequest: MockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({
        success: true,
        fileUrl: expect.stringContaining('data:application/pdf;base64,'),
        filename: 'test.pdf',
        size: 1024
      });
      expect(mockFile.arrayBuffer).toHaveBeenCalled();
    });

    it('should return 400 for no file uploaded', async () => {
      mockFormData.get.mockReturnValue(null);

      const mockRequest: MockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'No file uploaded' });
    });

    it('should return 400 for non-PDF files', async () => {
      const mockNonPdfFile = {
        ...mockFile,
        name: 'test.txt'
      };
      mockFormData.get.mockReturnValue(mockNonPdfFile);

      const mockRequest: MockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'Only PDF files are allowed' });
    });

    it('should return 400 for files exceeding size limit', async () => {
      const mockLargeFile = {
        ...mockFile,
        size: 6 * 1024 * 1024 // 6MB, exceeds 5MB limit
      };
      mockFormData.get.mockReturnValue(mockLargeFile);

      const mockRequest: MockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: 'File size exceeds 5MB limit' });
    });

    it('should handle file processing errors', async () => {
      const errorMessage = 'File processing failed';
      mockFile.arrayBuffer.mockRejectedValue(new Error(errorMessage));
      mockFormData.get.mockReturnValue(mockFile);

      const mockRequest: MockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Upload failed',
        details: errorMessage
      });
    });

    it('should handle form data parsing errors', async () => {
      const errorMessage = 'Invalid form data';
      const mockRequest: MockRequest = {
        formData: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      const response = await POST(mockRequest as unknown as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: 'Upload failed',
        details: errorMessage
      });
    });
  });
});
