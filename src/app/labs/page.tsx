'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface LabAttempt {
  id: number;
  status: string;
  score?: number;
  completedAt?: string;
  timeSpent?: number;
}

interface VirtualLab {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  estimatedTime: number;
  objectives: string[];
  prerequisites: string[];
  weekReference?: string;
  creator: {
    name: string;
  };
  attempts: LabAttempt[];
  _count: {
    attempts: number;
  };
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const categoryIcons = {
  'footprinting': '🕵️',
  'scanning': '📡',
  'enumeration': '📋',
  'vulnerability': '🛡️',
  'system-hacking': '💻',
  'malware': '🦠',
  'sniffing': '🔍',
  'social-engineering': '🎭',
  'dos': '⚡',
  'session-hijacking': '🔐',
  'web-hacking': '🌐',
  'wireless': '📶',
  'mobile': '📱',
  'cloud': '☁️',
  'cryptography': '🔒',
  'general': '🧪'
};

export default function VirtualLabsPage() {
  const [labs, setLabs] = useState<VirtualLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLabs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
      
      const response = await fetch(`/api/labs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLabs(data);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDifficulty]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const filteredLabs = labs.filter(lab => 
    lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    'all', 'footprinting', 'scanning', 'enumeration', 'vulnerability',
    'system-hacking', 'malware', 'sniffing', 'social-engineering', 
    'dos', 'session-hijacking', 'web-hacking', 'wireless', 'mobile', 
    'cloud', 'cryptography', 'general'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl font-mono animate-pulse">Loading virtual labs...</div>
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
            🧪 Virtual Labs
          </h1>
          <p className="text-gray-300 text-lg">
            Hands-on cybersecurity labs to practice your CEH skills
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Labs</label>
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            <div className="text-2xl font-bold text-cyan-400">{filteredLabs.length}</div>
            <div className="text-sm text-gray-400">Total Labs</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {filteredLabs.filter(lab => lab.difficulty === 'beginner').length}
            </div>
            <div className="text-sm text-gray-400">Beginner</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredLabs.filter(lab => lab.difficulty === 'intermediate').length}
            </div>
            <div className="text-sm text-gray-400">Intermediate</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {filteredLabs.filter(lab => lab.difficulty === 'advanced').length}
            </div>
            <div className="text-sm text-gray-400">Advanced</div>
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <div key={lab.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {categoryIcons[lab.category as keyof typeof categoryIcons] || '🧪'}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{lab.title}</h3>
                    <p className="text-sm text-gray-400">by {lab.creator.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border ${difficultyColors[lab.difficulty as keyof typeof difficultyColors]}`}>
                  {lab.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{lab.description}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span>⏱️ {lab.estimatedTime}m</span>
                <span>👥 {lab._count.attempts} attempts</span>
                {lab.weekReference && <span>📅 {lab.weekReference}</span>}
              </div>

              {/* Objectives Preview */}
              {lab.objectives.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-cyan-400 mb-2">Objectives:</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {lab.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                    {lab.objectives.length > 2 && (
                      <li className="text-gray-500">...and {lab.objectives.length - 2} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/labs/${lab.id}`}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-center py-2 px-4 rounded-md transition-colors text-sm font-medium"
                >
                  Start Lab
                </Link>
                <Link
                  href={`/labs/${lab.id}?view=details`}
                  className="px-4 py-2 border border-gray-600 hover:border-gray-500 rounded-md transition-colors text-sm"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLabs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Labs Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No virtual labs are available yet. Check back soon!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
