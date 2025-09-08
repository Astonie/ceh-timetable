'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  weekReference?: string;
}

export default function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lab, setLab] = useState<VirtualLab | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedParams = React.use(params);
  const userId = 1; // Mock user ID for demo

  const fetchLab = useCallback(async () => {
    try {
      const response = await fetch(`/api/labs/${resolvedParams.id}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLab(data);
      }
    } catch (error) {
      console.error('Error fetching lab:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, userId]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchLab();
    }
  }, [resolvedParams.id, fetchLab]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-600 border-green-600';
      case 'intermediate': return 'text-yellow-600 border-yellow-600';
      case 'advanced': return 'text-red-600 border-red-600';
      default: return 'text-gray-600 border-gray-600';
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lab Not Found</h1>
            <Link href="/labs" className="text-blue-600 hover:text-blue-800">
              ← Back to Labs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lab.title}</h1>
              <p className="text-gray-600 mb-4">{lab.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full border ${getDifficultyColor(lab.difficulty)}`}>
              {lab.difficulty.toUpperCase()}
            </span>
            <span className="text-gray-600">Category: {lab.category}</span>
            <span className="text-gray-600">Duration: {lab.estimatedTime} min</span>
            {lab.weekReference && (
              <span className="text-gray-600">Week: {lab.weekReference}</span>
            )}
          </div>
        </div>

        {/* Lab Details */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Objectives */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 Learning Objectives</h3>
            <ul className="space-y-2">
              {lab.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📚 Prerequisites</h3>
            <ul className="space-y-2">
              {lab.prerequisites.map((prerequisite, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Instructions</h3>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{lab.instructions}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href="/labs" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to All Labs
          </Link>
        </div>
      </div>
    </div>
  );
}
