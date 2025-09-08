import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Import components after mocking
import LabsPage from '../labs/page';
import QuizzesPage from '../quizzes/page';

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('Virtual Labs Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Labs Page', () => {
    const mockLabs = [
      {
        id: 1,
        title: 'Nmap Network Discovery Lab',
        description: 'Learn network reconnaissance using Nmap to discover hosts, services, and vulnerabilities.',
        difficulty: 'beginner',
        category: 'reconnaissance',
        estimatedTime: 60,
        weekReference: 'Week 2',
        isActive: true,
        creator: { name: 'Test Creator' },
        attempts: [],
        _count: { attempts: 0 }
      },
      {
        id: 2,
        title: 'SQL Injection Attack Lab',
        description: 'Practice identifying and exploiting SQL injection vulnerabilities in web applications.',
        difficulty: 'intermediate',
        category: 'web_application_hacking',
        estimatedTime: 90,
        weekReference: 'Week 8',
        isActive: true,
        creator: { name: 'Test Creator' },
        attempts: [],
        _count: { attempts: 0 }
      },
      {
        id: 3,
        title: 'Metasploit Exploitation Framework',
        description: 'Master the Metasploit framework for vulnerability exploitation and post-exploitation activities.',
        difficulty: 'advanced',
        category: 'system_hacking',
        estimatedTime: 120,
        weekReference: 'Week 10',
        isActive: true,
        creator: { name: 'Test Creator' },
        attempts: [],
        _count: { attempts: 0 }
      }
    ];

    it('should render labs page with loading state', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockLabs
        }), 100))
      );

      render(<LabsPage />);

      // Check loading state
      expect(screen.getByText('Loading labs...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Virtual Labs')).toBeInTheDocument();
      });
    });

    it('should display all labs after loading', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLabs
      });

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('Nmap Network Discovery Lab')).toBeInTheDocument();
        expect(screen.getByText('SQL Injection Attack Lab')).toBeInTheDocument();
        expect(screen.getByText('Metasploit Exploitation Framework')).toBeInTheDocument();
      });
    });

    it('should filter labs by difficulty', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLabs
      });

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('Virtual Labs')).toBeInTheDocument();
      });

      // Find and click beginner filter
      const beginnerFilter = screen.getByText('Beginner');
      fireEvent.click(beginnerFilter);

      await waitFor(() => {
        expect(screen.getByText('Nmap Network Discovery Lab')).toBeInTheDocument();
        // Advanced labs should be filtered out
        expect(screen.queryByText('Metasploit Exploitation Framework')).not.toBeInTheDocument();
      });
    });

    it('should filter labs by category', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLabs
      });

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('Virtual Labs')).toBeInTheDocument();
      });

      // Find and click web application hacking filter
      const categoryFilter = screen.getByText('Web Application Hacking');
      fireEvent.click(categoryFilter);

      await waitFor(() => {
        expect(screen.getByText('SQL Injection Attack Lab')).toBeInTheDocument();
        // Other categories should be filtered out
        expect(screen.queryByText('Nmap Network Discovery Lab')).not.toBeInTheDocument();
      });
    });

    it('should search labs by title', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLabs
      });

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('Virtual Labs')).toBeInTheDocument();
      });

      // Find search input and type
      const searchInput = screen.getByPlaceholderText('Search labs...');
      fireEvent.change(searchInput, { target: { value: 'Nmap' } });

      await waitFor(() => {
        expect(screen.getByText('Nmap Network Discovery Lab')).toBeInTheDocument();
        // Other labs should be filtered out
        expect(screen.queryByText('SQL Injection Attack Lab')).not.toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('No labs available')).toBeInTheDocument();
      });
    });

    it('should navigate to lab details on card click', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLabs
      });

      render(<LabsPage />);

      await waitFor(() => {
        expect(screen.getByText('Nmap Network Discovery Lab')).toBeInTheDocument();
      });

      // Click on lab card
      const labCard = screen.getByText('Nmap Network Discovery Lab').closest('div');
      fireEvent.click(labCard!);

      expect(mockPush).toHaveBeenCalledWith('/labs/1');
    });
  });

  describe('Quizzes Page', () => {
    const mockQuizzes = [
      {
        id: 1,
        title: 'Reconnaissance and Footprinting Quiz',
        description: 'Test your knowledge of reconnaissance techniques and information gathering methods.',
        category: 'domain_2',
        difficulty: 'beginner',
        timeLimit: 30,
        passingScore: 70,
        weekReference: 'Week 2',
        creator: { name: 'Test Creator' },
        userAttempt: null,
        _count: { questions: 5, attempts: 10 }
      },
      {
        id: 2,
        title: 'Web Application Security Quiz',
        description: 'Assess your understanding of web application vulnerabilities and attack methods.',
        category: 'domain_8',
        difficulty: 'intermediate',
        timeLimit: 45,
        passingScore: 75,
        weekReference: 'Week 8',
        creator: { name: 'Test Creator' },
        userAttempt: {
          score: 85,
          isPassed: true,
          completedAt: '2025-09-07T10:00:00Z',
          attemptNumber: 1
        },
        _count: { questions: 8, attempts: 15 }
      }
    ];

    it('should render quizzes page with loading state', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockQuizzes
        }), 100))
      );

      render(<QuizzesPage />);

      // Check loading state
      expect(screen.getByText('Loading quizzes...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('CEH Practice Quizzes')).toBeInTheDocument();
      });
    });

    it('should display all quizzes after loading', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuizzes
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText('Reconnaissance and Footprinting Quiz')).toBeInTheDocument();
        expect(screen.getByText('Web Application Security Quiz')).toBeInTheDocument();
      });
    });

    it('should show quiz completion status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuizzes
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        // Should show completed quiz with score
        expect(screen.getByText('Score: 85%')).toBeInTheDocument();
        expect(screen.getByText('✅ Completed')).toBeInTheDocument();
        
        // Should show not attempted quiz
        expect(screen.getByText('Not attempted')).toBeInTheDocument();
      });
    });

    it('should filter quizzes by difficulty', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuizzes
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText('CEH Practice Quizzes')).toBeInTheDocument();
      });

      // Find and click beginner filter
      const beginnerFilter = screen.getByText('Beginner');
      fireEvent.click(beginnerFilter);

      await waitFor(() => {
        expect(screen.getByText('Reconnaissance and Footprinting Quiz')).toBeInTheDocument();
        // Intermediate quizzes should be filtered out
        expect(screen.queryByText('Web Application Security Quiz')).not.toBeInTheDocument();
      });
    });

    it('should search quizzes by title', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuizzes
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText('CEH Practice Quizzes')).toBeInTheDocument();
      });

      // Find search input and type
      const searchInput = screen.getByPlaceholderText('Search quizzes...');
      fireEvent.change(searchInput, { target: { value: 'Reconnaissance' } });

      await waitFor(() => {
        expect(screen.getByText('Reconnaissance and Footprinting Quiz')).toBeInTheDocument();
        // Other quizzes should be filtered out
        expect(screen.queryByText('Web Application Security Quiz')).not.toBeInTheDocument();
      });
    });

    it('should display quiz statistics correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuizzes
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        // Check quiz statistics display
        expect(screen.getByText('5 questions')).toBeInTheDocument();
        expect(screen.getByText('8 questions')).toBeInTheDocument();
        expect(screen.getByText('30 min')).toBeInTheDocument();
        expect(screen.getByText('45 min')).toBeInTheDocument();
      });
    });

    it('should handle empty quiz list', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => []
      });

      render(<QuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText('No quizzes available')).toBeInTheDocument();
      });
    });
  });
});
