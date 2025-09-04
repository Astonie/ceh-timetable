"use client";
import { useState } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  studyPoints: number;
  joinDate: string;
}

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function JoinModal({ isOpen, onClose, onSuccess }: JoinModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join');
      }

      const user = await response.json();
      onSuccess(user);
      onClose();
      setFormData({ username: '', email: '', name: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 min-w-[400px] max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🚀</span>
            Join CEH Study Community
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="Enter unique username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="Your display name"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.username.trim() || !formData.email.trim() || !formData.name.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Joining...' : 'Join Community'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-slate-400 text-center">
            By joining, you&apos;ll be able to view profiles, join study groups, and earn study points!
          </div>
        </div>
      </div>
    </div>
  );
}
