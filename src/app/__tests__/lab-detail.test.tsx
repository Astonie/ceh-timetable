import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null)
  }),
}));

// Mock React.use for Next.js 15
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn().mockReturnValue({ id: '1' }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Import component after mocking
import LabDetailPage from '../labs/[id]/page';

describe('Lab Detail Page Integration Tests', () => {
  const mockLab = {
    id: 1,
    title: 'Nmap Network Discovery Lab',
    description: 'Learn network reconnaissance using Nmap to discover hosts, services, and vulnerabilities in target networks.',
    difficulty: 'beginner',
    category: 'reconnaissance',
    estimatedTime: 60,
    instructions: `# Nmap Network Discovery Lab

## Objective
Learn to use Nmap for network discovery and reconnaissance.

## Tasks
1. Perform host discovery on the target network
2. Scan for open ports and services
3. Perform version detection
4. Conduct vulnerability scanning
5. Document your findings

## Commands to Use
- nmap -sn 192.168.1.0/24 (Host discovery)
- nmap -sS 192.168.1.100 (SYN scan)
- nmap -sV 192.168.1.100 (Version detection)
- nmap --script vuln 192.168.1.100 (Vulnerability scan)`,
    objectives: [
      'Understand network reconnaissance techniques',
      'Master Nmap command-line options',
      'Identify live hosts and open services',
      'Perform basic vulnerability assessment'
    ],
    prerequisites: [
      'Basic networking knowledge',
      'Familiarity with command line',
      'Understanding of TCP/IP'
    ],
    resources: {},
    isActive: true,
    weekReference: 'Week 2',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockLabSession = {
    sessionId: 'test-session-123',
    status: 'active',
    accessUrl: 'http://localhost:8080',
    sshAccess: 'ssh kali@localhost -p 2222',
    sshPort: 2222,
    webPort: 8080,
    credentials: {
      username: 'kali',
      password: 'kali'
    },
    instructions: `Lab Environment Ready!

This is a simulated Kali Linux environment for practicing Nmap commands.
Available tools:
- Nmap (Network Mapper)
- Netcat
- Basic networking utilities

Target network: 192.168.1.0/24
Practice targets: 192.168.1.100-110

Use the SSH connection to access the command line, or click the Web Access link for a browser-based terminal.`
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Lab Loading and Display', () => {
    it('should render lab details correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLab
      });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('Nmap Network Discovery Lab')).toBeInTheDocument();
        expect(screen.getByText('BEGINNER')).toBeInTheDocument();
        expect(screen.getByText('Category: reconnaissance')).toBeInTheDocument();
        expect(screen.getByText('Duration: 60 min')).toBeInTheDocument();
      });
    });

    it('should display lab objectives and prerequisites', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLab
      });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Learning Objectives')).toBeInTheDocument();
        expect(screen.getByText('Understand network reconnaissance techniques')).toBeInTheDocument();
        expect(screen.getByText('📚 Prerequisites')).toBeInTheDocument();
        expect(screen.getByText('Basic networking knowledge')).toBeInTheDocument();
      });
    });

    it('should show launch button when no session is active', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLab
      });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });
    });
  });

  describe('Virtual Lab Environment Functionality', () => {
    it('should launch lab environment successfully', async () => {
      // Mock lab fetch
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        // Mock lab session creation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabSession
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      // Click launch button
      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Wait for session to be created
      await waitFor(() => {
        expect(screen.getByText('🖥️ Lab Environment Access')).toBeInTheDocument();
        expect(screen.getByText('Lab Environment Active')).toBeInTheDocument();
        expect(screen.getByText('Session ID: test-session-123')).toBeInTheDocument();
      });
    });

    it('should display SSH access details in lab session', async () => {
      // Mock lab fetch
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        // Mock lab session creation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabSession
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      // Launch lab
      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Wait for SSH details to appear
      await waitFor(() => {
        expect(screen.getByText('SSH Access')).toBeInTheDocument();
        expect(screen.getByText('$ ssh kali@localhost -p 2222')).toBeInTheDocument();
        expect(screen.getByText('Username:')).toBeInTheDocument();
        expect(screen.getByText('kali')).toBeInTheDocument();
        expect(screen.getByText('Password:')).toBeInTheDocument();
      });
    });

    it('should display web access interface in lab session', async () => {
      // Mock lab fetch and session creation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabSession
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      // Launch lab
      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Wait for web access details to appear
      await waitFor(() => {
        expect(screen.getByText('Web Access')).toBeInTheDocument();
        expect(screen.getByText('Open Lab Interface')).toBeInTheDocument();
        expect(screen.getByText('URL:')).toBeInTheDocument();
        expect(screen.getByText('http://localhost:8080')).toBeInTheDocument();
        expect(screen.getByText('Port:')).toBeInTheDocument();
        expect(screen.getByText('8080')).toBeInTheDocument();
      });
    });

    it('should show environment instructions in lab session', async () => {
      // Mock lab fetch and session creation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabSession
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      // Launch lab
      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Wait for environment instructions to appear
      await waitFor(() => {
        expect(screen.getByText('Environment Details')).toBeInTheDocument();
        expect(screen.getByText(/Lab Environment Ready!/)).toBeInTheDocument();
        expect(screen.getByText(/Available tools:/)).toBeInTheDocument();
        expect(screen.getByText(/Target network: 192.168.1.0\/24/)).toBeInTheDocument();
      });
    });

    it('should allow stopping lab session', async () => {
      // Mock lab fetch, session creation, and session deletion
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabSession
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Session stopped' })
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      // Launch lab
      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Wait for stop button to appear
      await waitFor(() => {
        expect(screen.getByText('🛑 Stop Lab')).toBeInTheDocument();
      });

      // Click stop button
      const stopButton = screen.getByText('🛑 Stop Lab');
      fireEvent.click(stopButton);

      // Verify session is stopped (should show launch button again)
      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
        expect(screen.queryByText('Lab Environment Active')).not.toBeInTheDocument();
      });
    });

    it('should show loading state during lab launch', async () => {
      // Mock lab fetch
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        // Mock delayed session creation
        .mockImplementationOnce(() =>
          new Promise(resolve => 
            setTimeout(() => resolve({
              ok: true,
              json: async () => mockLabSession
            }), 500)
          )
        );

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      // Click launch button
      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Should show loading state
      expect(screen.getByText('Launching...')).toBeInTheDocument();
      expect(launchButton).toBeDisabled();

      // Wait for session to be created
      await waitFor(() => {
        expect(screen.getByText('Lab Environment Active')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle lab launch errors gracefully', async () => {
      // Mock lab fetch
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLab
        })
        // Mock failed session creation
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Failed to create lab session' })
        });

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Launch Lab Environment')).toBeInTheDocument();
      });

      // Click launch button
      const launchButton = screen.getByText('🚀 Launch Lab Environment');
      fireEvent.click(launchButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to create lab session')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle lab not found error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      });

      render(<LabDetailPage params={Promise.resolve({ id: '999' })} />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Lab not found')).toBeInTheDocument();
        expect(screen.getByText('Back to Labs')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<LabDetailPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load lab')).toBeInTheDocument();
      });
    });
  });
});
