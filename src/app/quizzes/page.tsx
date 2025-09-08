'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Quiz {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  timeLimit?: number;
  passingScore: number;
  totalPoints: number;
  weekReference?: string;
  creator: {
    name: string;
  };
  userAttempt?: {
    score?: number;
    isPassed?: boolean;
    completedAt?: string;
    attemptNumber: number;
  };
  _count: {
    questions: number;
    attempts: number;
  };
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const categoryIcons = {
  'domain_1': '🎯',
  'domain_2': '🕵️',
  'domain_3': '📡',
  'domain_4': '📋',
  'domain_5': '🛡️',
  'domain_6': '💻',
  'domain_7': '🦠',
  'domain_8': '🔍',
  'domain_9': '🎭',
  'domain_10': '⚡',
  'domain_11': '🔐',
  'domain_12': '🛡️',
  'domain_13': '🌐',
  'domain_14': '📶',
  'domain_15': '📱',
  'domain_16': '☁️',
  'domain_17': '🔒',
  'domain_18': '⚖️',
  'domain_19': '📊',
  'domain_20': '🎓',
  'general': '📝',
  'practice': '🏋️'
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuizzes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
      params.append('userId', '1'); // TODO: Get from auth context
      
      const response = await fetch(`/api/quizzes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDifficulty]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl font-mono animate-pulse">Loading quizzes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            📝 CEH Quizzes
          </h1>
          <p className="text-gray-300 text-lg">
            Test your knowledge with comprehensive CEH practice quizzes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Quizzes</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="general">General Knowledge</option>
                <option value="practice">Practice Tests</option>
                {Array.from({length: 20}, (_, i) => (
                  <option key={i} value={`domain_${i + 1}`}>
                    Domain {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{filteredQuizzes.length}</div>
            <div className="text-sm text-gray-400">Total Quizzes</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {filteredQuizzes.filter(q => q.userAttempt?.isPassed).length}
            </div>
            <div className="text-sm text-gray-400">Passed</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredQuizzes.filter(q => q.userAttempt && !q.userAttempt.isPassed).length}
            </div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {filteredQuizzes.filter(q => !q.userAttempt).length}
            </div>
            <div className="text-sm text-gray-400">Not Attempted</div>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {categoryIcons[quiz.category as keyof typeof categoryIcons] || '📝'}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                    <p className="text-sm text-gray-400">by {quiz.creator.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border ${difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}`}>
                  {quiz.difficulty}
                </span>
              </div>

              {/* Description */}
              {quiz.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{quiz.description}</p>
              )}

              {/* Quiz Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span>❓ {quiz._count.questions} questions</span>
                <span>🎯 {quiz.passingScore}% to pass</span>
                {quiz.timeLimit && <span>⏱️ {quiz.timeLimit}m</span>}
              </div>

              {/* User Progress */}
              {quiz.userAttempt ? (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Latest Attempt:</span>
                    <span className={`text-sm font-medium ${
                      quiz.userAttempt.isPassed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {quiz.userAttempt.score?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      Attempt #{quiz.userAttempt.attemptNumber}
                    </span>
                    <span className={`text-xs ${
                      quiz.userAttempt.isPassed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {quiz.userAttempt.isPassed ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg text-center">
                  <span className="text-sm text-gray-400">Not attempted yet</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-center py-2 px-4 rounded-md transition-colors text-sm font-medium"
                >
                  {quiz.userAttempt ? 'Retake Quiz' : 'Start Quiz'}
                </Link>
                <Link
                  href={`/quizzes/${quiz.id}?view=results`}
                  className="px-4 py-2 border border-gray-600 hover:border-gray-500 rounded-md transition-colors text-sm"
                >
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Quizzes Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No quizzes are available yet. Check back soon!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
