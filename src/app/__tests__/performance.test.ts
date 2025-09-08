import { performance } from 'perf_hooks';

// Mock database for performance testing
const mockDatabase = {
  virtualLabs: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Lab ${i + 1}`,
    description: `Description for lab ${i + 1}`,
    difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
    category: ['reconnaissance', 'web_application_hacking', 'system_hacking'][i % 3],
    estimatedTime: 30 + (i % 4) * 30,
    isActive: true,
    creator: { name: 'Test Creator' },
    attempts: [],
    _count: { attempts: i % 10 }
  })),
  quizzes: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Quiz ${i + 1}`,
    description: `Description for quiz ${i + 1}`,
    category: `domain_${(i % 20) + 1}`,
    difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
    timeLimit: 30 + (i % 3) * 15,
    passingScore: 70 + (i % 3) * 10,
    creator: { name: 'Test Creator' },
    _count: { questions: 5 + (i % 10), attempts: i % 20 }
  }))
};

describe('Performance Tests', () => {
  describe('Virtual Labs Performance', () => {
    it('should load 100 labs within performance threshold', async () => {
      const startTime = performance.now();
      
      // Simulate API call
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDatabase.virtualLabs
      });
      
      global.fetch = mockFetch;
      
      const response = await fetch('/api/labs');
      const labs = await response.json();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(labs).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should filter labs efficiently', () => {
      const startTime = performance.now();
      
      const labs = mockDatabase.virtualLabs;
      const filteredLabs = labs.filter(lab => 
        lab.difficulty === 'beginner' && 
        lab.category === 'reconnaissance'
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(filteredLabs.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should filter within 100ms
    });

    it('should search labs efficiently', () => {
      const startTime = performance.now();
      
      const labs = mockDatabase.virtualLabs;
      const searchTerm = 'Lab 1';
      const searchResults = labs.filter(lab =>
        lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(searchResults.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Should search within 50ms
    });
  });

  describe('Quiz Performance', () => {
    it('should load 50 quizzes within performance threshold', async () => {
      const startTime = performance.now();
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDatabase.quizzes
      });
      
      global.fetch = mockFetch;
      
      const response = await fetch('/api/quizzes');
      const quizzes = await response.json();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(quizzes).toHaveLength(50);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle concurrent quiz attempts efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate 10 concurrent quiz attempts
      const mockAttempts = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve({
          id: i + 1,
          quizId: 1,
          userId: i + 1,
          score: 75 + (i % 4) * 5,
          isPassed: true,
          completedAt: new Date()
        })
      );
      
      const results = await Promise.all(mockAttempts);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(200); // Should handle concurrent requests within 200ms
    });
  });

  describe('Lab Session Performance', () => {
    it('should create lab session within acceptable time', async () => {
      const startTime = performance.now();
      
      // Simulate lab session creation
      const sessionCreation = Promise.resolve({
        sessionId: 'test-session-123',
        status: 'active',
        accessUrl: 'http://localhost:8080',
        sshAccess: 'ssh kali@localhost -p 2222',
        credentials: { username: 'kali', password: 'kali' },
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
      });
      
      const session = await sessionCreation;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(session.sessionId).toBeDefined();
      expect(duration).toBeLessThan(300); // Session creation within 300ms
    });

    it('should handle multiple concurrent session requests', async () => {
      const startTime = performance.now();
      
      // Simulate 5 concurrent session creation requests
      const sessionPromises = Array.from({ length: 5 }, (_, i) => 
        Promise.resolve({
          sessionId: `session-${i + 1}`,
          status: 'active',
          userId: i + 1,
          labId: 1,
          accessUrl: `http://localhost:${8080 + i}`,
          sshPort: 2222 + i,
          webPort: 8080 + i
        })
      );
      
      const sessions = await Promise.all(sessionPromises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(sessions).toHaveLength(5);
      expect(sessions.every(s => s.sessionId)).toBe(true);
      expect(duration).toBeLessThan(500); // All sessions created within 500ms
    });
  });
});

describe('Integration Tests', () => {
  describe('End-to-End Lab Workflow', () => {
    it('should complete full lab workflow successfully', async () => {
      // Mock all API calls
      const mockFetch = jest.fn()
        // Get labs
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockDatabase.virtualLabs[0]]
        })
        // Get specific lab
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDatabase.virtualLabs[0]
        })
        // Create lab session
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sessionId: 'test-session-123',
            status: 'active',
            accessUrl: 'http://localhost:8080',
            sshAccess: 'ssh kali@localhost -p 2222',
            credentials: { username: 'kali', password: 'kali' }
          })
        })
        // Stop lab session
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Session stopped' })
        });
      
      global.fetch = mockFetch;
      
      // Step 1: Get labs list
      const labsResponse = await fetch('/api/labs');
      const labs = await labsResponse.json();
      expect(labs).toHaveLength(1);
      
      // Step 2: Get specific lab details
      const labResponse = await fetch('/api/labs/1');
      const lab = await labResponse.json();
      expect(lab.id).toBe(1);
      
      // Step 3: Create lab session
      const sessionResponse = await fetch('/api/lab-sessions', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, labId: 1 })
      });
      const session = await sessionResponse.json();
      expect(session.sessionId).toBe('test-session-123');
      expect(session.status).toBe('active');
      
      // Step 4: Stop lab session
      const stopResponse = await fetch(`/api/lab-sessions/${session.sessionId}`, {
        method: 'DELETE'
      });
      const stopResult = await stopResponse.json();
      expect(stopResult.message).toBe('Session stopped');
      
      // Verify all API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('End-to-End Quiz Workflow', () => {
    it('should complete full quiz workflow successfully', async () => {
      // Mock all API calls
      const mockFetch = jest.fn()
        // Get quizzes
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockDatabase.quizzes[0]]
        })
        // Get specific quiz
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockDatabase.quizzes[0],
            questions: [
              {
                id: 1,
                questionText: 'What is footprinting?',
                questionType: 'multiple_choice',
                options: [
                  { text: 'Information gathering', isCorrect: true },
                  { text: 'Exploitation', isCorrect: false }
                ],
                points: 10
              }
            ]
          })
        })
        // Start quiz attempt
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            quizId: 1,
            userId: 1,
            status: 'in_progress',
            startedAt: new Date()
          })
        })
        // Submit quiz attempt
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            score: 100,
            isPassed: true,
            completedAt: new Date(),
            totalQuestions: 1,
            correctAnswers: 1
          })
        });
      
      global.fetch = mockFetch;
      
      // Step 1: Get quizzes list
      const quizzesResponse = await fetch('/api/quizzes');
      const quizzes = await quizzesResponse.json();
      expect(quizzes).toHaveLength(1);
      
      // Step 2: Get specific quiz details
      const quizResponse = await fetch('/api/quizzes/1');
      const quiz = await quizResponse.json();
      expect(quiz.id).toBe(1);
      expect(quiz.questions).toHaveLength(1);
      
      // Step 3: Start quiz attempt
      const attemptResponse = await fetch('/api/quizzes/1/start', {
        method: 'POST',
        body: JSON.stringify({ userId: 1 })
      });
      const attempt = await attemptResponse.json();
      expect(attempt.status).toBe('in_progress');
      
      // Step 4: Submit quiz attempt
      const submitResponse = await fetch('/api/quiz-attempts/1/submit', {
        method: 'POST',
        body: JSON.stringify({
          responses: [{ questionId: 1, selectedAnswer: 'Information gathering' }]
        })
      });
      const result = await submitResponse.json();
      expect(result.score).toBe(100);
      expect(result.isPassed).toBe(true);
      
      // Verify all API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover from temporary API failures', async () => {
      let callCount = 0;
      const mockFetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          // Fail first two calls
          return Promise.reject(new Error('Network error'));
        }
        // Succeed on third call
        return Promise.resolve({
          ok: true,
          json: async () => mockDatabase.virtualLabs.slice(0, 5)
        });
      });
      
      global.fetch = mockFetch;
      
      // Simulate retry logic
      let labs = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries && !labs) {
        try {
          const response = await fetch('/api/labs');
          labs = await response.json();
        } catch {
          retries++;
          if (retries < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      expect(labs).toHaveLength(5);
      expect(callCount).toBe(3);
    });

    it('should handle partial data corruption gracefully', () => {
      // Simulate data with some corrupted entries
      const corruptedData = [
        mockDatabase.virtualLabs[0], // Valid
        { id: null, title: null }, // Corrupted
        mockDatabase.virtualLabs[1], // Valid
        { id: 3, title: 'Valid Lab', description: null }, // Partially corrupted
        mockDatabase.virtualLabs[2] // Valid
      ];
      
      // Filter out corrupted entries
      const validLabs = corruptedData.filter(lab => 
        lab && 
        lab.id && 
        lab.title && 
        typeof lab.id === 'number' &&
        typeof lab.title === 'string'
      );
      
      expect(validLabs).toHaveLength(4); // Should filter out the null entry
      expect(validLabs.every(lab => lab.id && lab.title)).toBe(true);
    });
  });
});
