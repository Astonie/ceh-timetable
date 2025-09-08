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
  creator?: {
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

  const categories = [
    'all', 'domain_1', 'domain_2', 'domain_3', 'domain_4', 'domain_5',
    'domain_6', 'domain_7', 'domain_8', 'domain_9', 'domain_10',
    'domain_11', 'domain_12', 'domain_13', 'domain_14', 'domain_15',
    'domain_16', 'domain_17', 'domain_18', 'domain_19', 'domain_20',
    'general', 'practice'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono animate-pulse mb-4">Loading quizzes...</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-green-600/10" />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      <div className="relative z-10">
        {/* Navigation header */}
        <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  CEH TimeTable
                </Link>
                <span className="text-slate-400">/</span>
                <span className="text-blue-400 font-mono">Quizzes</span>
              </div>
              <div className="text-sm text-slate-400">
                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} available
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Practice Quizzes
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Test your knowledge with our comprehensive CEH practice quizzes. Each quiz is designed to 
              prepare you for real-world scenarios and certification exams.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="space-y-2">
                <label className="block text-sm font-mono text-slate-400">Search</label>
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-mono text-slate-400">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-mono text-slate-400">Difficulty</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quizzes Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2 text-slate-300">No quizzes found</h3>
              <p className="text-slate-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="group">
                  <Link href={`/quizzes/${quiz.id}`}>
                    <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20 group-hover:transform group-hover:scale-105">
                      {/* Quiz Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {categoryIcons[quiz.category as keyof typeof categoryIcons] || '📝'}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-mono border ${difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}`}>
                            {quiz.difficulty}
                          </div>
                        </div>
                        {quiz.userAttempt && (
                          <div className={`px-2 py-1 rounded-full text-xs font-mono ${
                            quiz.userAttempt.isPassed 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {quiz.userAttempt.isPassed ? '✓ Passed' : '✗ Failed'}
                          </div>
                        )}
                      </div>

                      {/* Quiz Title */}
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                        {quiz.title}
                      </h3>

                      {/* Quiz Description */}
                      {quiz.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      {/* Quiz Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-slate-400">Questions</div>
                          <div className="text-white font-mono">{quiz._count.questions}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-slate-400">Time Limit</div>
                          <div className="text-white font-mono">
                            {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-slate-400">Passing Score</div>
                          <div className="text-white font-mono">{quiz.passingScore}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-slate-400">Attempts</div>
                          <div className="text-white font-mono">{quiz._count.attempts}</div>
                        </div>
                      </div>

                      {/* Week Reference */}
                      {quiz.weekReference && (
                        <div className="mb-4">
                          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-mono">
                            Week {quiz.weekReference}
                          </span>
                        </div>
                      )}

                      {/* Previous Attempt Info */}
                      {quiz.userAttempt && (
                        <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                          <div className="text-sm text-slate-400 mb-1">Last Attempt:</div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-mono">
                              Score: {quiz.userAttempt.score}%
                            </span>
                            <span className="text-xs text-slate-400">
                              Attempt #{quiz.userAttempt.attemptNumber}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          By {quiz.creator?.name || 'System'}
                        </span>
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-mono text-sm group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                          {quiz.userAttempt ? 'Retake Quiz' : 'Start Quiz'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
