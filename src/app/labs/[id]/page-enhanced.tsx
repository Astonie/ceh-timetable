'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  resources?: Record<string, unknown>;
  isActive: boolean;
  weekReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LabSession {
  sessionId: string;
  status: string;
  accessUrl: string;
  sshAccess: string;
  sshPort: number;
  webPort: number;
  credentials: {
    username: string;
    password: string;
  };
  instructions: string;
}

const LabDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [lab, setLab] = useState<VirtualLab | null>(null);
  const [labSession, setLabSession] = useState<LabSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');

  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        const response = await fetch(`/api/labs/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setLab(data);
        } else {
          setError('Lab not found');
        }
      } catch {
        setError('Failed to load lab');
      } finally {
        setLoading(false);
      }
    };

    fetchLab();
  }, [resolvedParams.id]);

  const launchLab = async () => {
    if (!lab) return;
    
    setLaunching(true);
    setError('');

    try {
      const response = await fetch('/api/lab-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Demo user ID - in production, get from authentication
          labId: lab.id
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        setLabSession(sessionData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to launch lab');
      }
    } catch {
      setError('Failed to launch lab environment');
    } finally {
      setLaunching(false);
    }
  };

  const stopLab = async () => {
    if (!labSession) return;

    try {
      const response = await fetch(`/api/lab-sessions/${labSession.sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLabSession(null);
      } else {
        setError('Failed to stop lab session');
      }
    } catch {
      setError('Failed to stop lab session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-400">Loading lab details...</p>
        </div>
      </div>
    );
  }

  if (error && !lab) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            href="/labs" 
            className="inline-block bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg transition-colors"
          >
            Back to Labs
          </Link>
        </div>
      </div>
    );
  }

  if (!lab) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 border-green-500';
      case 'intermediate': return 'bg-yellow-500/20 border-yellow-500';
      case 'advanced': return 'bg-red-500/20 border-red-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/labs" 
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Labs
              </Link>
              <h1 className="text-3xl font-bold text-white">{lab.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBg(lab.difficulty)}`}>
                  {lab.difficulty.toUpperCase()}
                </span>
                <span className="text-gray-400">Category: {lab.category}</span>
                <span className="text-gray-400">Duration: {lab.estimatedTime} min</span>
              </div>
            </div>
            
            {/* Lab Control Panel */}
            <div className="text-right">
              {!labSession ? (
                <button
                  onClick={launchLab}
                  disabled={launching}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                >
                  {launching ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Launching...
                    </span>
                  ) : (
                    '🚀 Launch Lab Environment'
                  )}
                </button>
              ) : (
                <div className="text-right">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 font-medium">Lab Environment Active</span>
                    </div>
                    <p className="text-sm text-gray-300">Session ID: {labSession.sessionId}</p>
                  </div>
                  <button
                    onClick={stopLab}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🛑 Stop Lab
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Lab Environment Access */}
        {labSession && (
          <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">🖥️ Lab Environment Access</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">SSH Access</h3>
                <div className="bg-black rounded p-3 font-mono text-sm">
                  <p className="text-green-400">$ {labSession.sshAccess}</p>
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  <p><strong>Username:</strong> {labSession.credentials.username}</p>
                  <p><strong>Password:</strong> {labSession.credentials.password}</p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Web Access</h3>
                <a 
                  href={labSession.accessUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg transition-colors"
                >
                  Open Lab Interface
                </a>
                <div className="mt-3 text-sm text-gray-400">
                  <p><strong>URL:</strong> {labSession.accessUrl}</p>
                  <p><strong>Port:</strong> {labSession.webPort}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Environment Details</h4>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{labSession.instructions}</pre>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">📋 Lab Description</h2>
              <p className="text-gray-300 leading-relaxed">{lab.description}</p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">📝 Instructions</h2>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap">{lab.instructions}</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Learning Objectives */}
            <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">🎯 Learning Objectives</h3>
              <ul className="space-y-2">
                {lab.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-cyan-400 mr-2">•</span>
                    <span className="text-gray-300">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">📚 Prerequisites</h3>
              <ul className="space-y-2">
                {lab.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span className="text-gray-300">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lab Info */}
            <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">ℹ️ Lab Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`ml-2 font-medium ${getDifficultyColor(lab.difficulty)}`}>
                    {lab.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="ml-2 text-white">{lab.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="ml-2 text-white">{lab.estimatedTime} minutes</span>
                </div>
                {lab.weekReference && (
                  <div>
                    <span className="text-gray-400">Week Reference:</span>
                    <span className="ml-2 text-white">{lab.weekReference}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetailPage;
