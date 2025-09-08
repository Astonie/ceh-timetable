'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  instructions: string;
  objectives: string[];
  prerequisites: string[];
  resources: Record<string, unknown>;
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

export default function LabPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [lab, setLab] = useState<VirtualLab | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState<LabAttempt | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');
  
  const isDetailsView = searchParams.get('view') === 'details';
  const userId = 1; // TODO: Get from auth context

  const fetchLab = useCallback(async () => {
    try {
      const response = await fetch(`/api/labs/${params.id}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLab(data);
        
        // Check for current attempt
        const activeAttempt = data.attempts.find((a: LabAttempt) => a.status === 'in_progress');
        if (activeAttempt) {
          setCurrentAttempt(activeAttempt);
          setActiveTab('lab');
        }
      }
    } catch (error) {
      console.error('Error fetching lab:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, userId]);

  useEffect(() => {
    if (params.id) {
      fetchLab();
    }
  }, [params.id, fetchLab]);

  const startLab = async () => {
    try {
      const response = await fetch(`/api/labs/${params.id}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        const attempt = await response.json();
        setCurrentAttempt(attempt);
        setActiveTab('lab');
        fetchLab(); // Refresh lab data
      }
    } catch (error) {
      console.error('Error starting lab:', error);
    }
  };

  const completeLab = async () => {
    if (!currentAttempt) return;
    
    try {
      const response = await fetch(`/api/labs/attempts/${currentAttempt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          notes,
          score: 85, // TODO: Implement proper scoring
          timeSpent: Math.floor((Date.now() - new Date(currentAttempt.id).getTime()) / 60000)
        }),
      });
      
      if (response.ok) {
        fetchLab(); // Refresh lab data
        setCurrentAttempt(null);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error completing lab:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl font-mono animate-pulse">Loading lab...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Lab Not Found</h3>
            <Link href="/labs" className="text-cyan-400 hover:text-cyan-300">
              ← Back to Labs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/labs" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              ← Back to Labs
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">{lab.title}</h1>
              <p className="text-gray-300 mb-4">{lab.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full border ${difficultyColors[lab.difficulty as keyof typeof difficultyColors]}`}>
                  {lab.difficulty}
                </span>
                <span className="text-gray-400">⏱️ {lab.estimatedTime} minutes</span>
                <span className="text-gray-400">👥 {lab._count.attempts} attempts</span>
                <span className="text-gray-400">by {lab.creator.name}</span>
              </div>
            </div>
            
            {!isDetailsView && (
              <div className="ml-6">
                {currentAttempt ? (
                  <div className="text-center">
                    <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg mb-4">
                      Lab in Progress
                    </div>
                    <button
                      onClick={completeLab}
                      className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Complete Lab
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startLab}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg transition-colors text-lg font-medium"
                  >
                    Start Lab
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {['overview', 'lab', 'resources', 'attempts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Objectives */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {lab.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-gray-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prerequisites */}
                {lab.prerequisites.length > 0 && (
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">Prerequisites</h3>
                    <ul className="space-y-2">
                      {lab.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span className="text-gray-300">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Lab Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className="text-white">{lab.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{lab.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{lab.estimatedTime}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Attempts:</span>
                      <span className="text-white">{lab._count.attempts}</span>
                    </div>
                  </div>
                </div>

                {/* User Progress */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                  {lab.attempts.length > 0 ? (
                    <div className="space-y-3">
                      {lab.attempts.slice(0, 3).map((attempt, index) => (
                        <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                          <div>
                            <div className="text-sm font-medium">
                              Attempt #{lab.attempts.length - index}
                            </div>
                            <div className="text-xs text-gray-400">
                              {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'In Progress'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              attempt.status === 'completed' ? 'text-green-400' :
                              attempt.status === 'in_progress' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {attempt.status === 'completed' && attempt.score ? `${attempt.score}%` : attempt.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No attempts yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Instructions */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4">Lab Instructions</h3>
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300">{lab.instructions}</div>
                  </div>
                </div>
              </div>

              {/* Lab Notes */}
              <div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Lab Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes during your lab session..."
                    className="w-full h-64 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Lab Resources</h3>
              {lab.resources && Object.keys(lab.resources).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(lab.resources).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-white mb-2">{key.replace('_', ' ').toUpperCase()}</h4>
                      <div className="text-gray-300">{String(value)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No additional resources provided for this lab.</p>
              )}
            </div>
          )}

          {activeTab === 'attempts' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Your Attempts</h3>
              {lab.attempts.length > 0 ? (
                <div className="space-y-4">
                  {lab.attempts.map((attempt, index) => (
                    <div key={attempt.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Attempt #{lab.attempts.length - index}</h4>
                          <p className="text-sm text-gray-400">
                            {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'In Progress'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            attempt.status === 'completed' ? 'text-green-400' :
                            attempt.status === 'in_progress' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {attempt.status === 'completed' && attempt.score ? `${attempt.score}%` : attempt.status}
                          </div>
                          {attempt.timeSpent && (
                            <div className="text-sm text-gray-400">{attempt.timeSpent} minutes</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No attempts yet. Start your first lab attempt!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
