"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: number;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  studyPoints: number;
  joinDate: string;
  lastActive: string;
  _count: {
    ownedGroups: number;
    memberships: number;
  };
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">🏆</span>
        Study Leaderboard
      </h2>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors"
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {index === 0 && <span className="text-2xl">🥇</span>}
              {index === 1 && <span className="text-2xl">🥈</span>}
              {index === 2 && <span className="text-2xl">🥉</span>}
              {index > 2 && (
                <span className="text-lg font-bold text-slate-400 w-8 text-center">
                  #{index + 1}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${user.id}`}
                className="text-white font-semibold hover:text-green-400 transition-colors block truncate"
              >
                {user.name}
              </Link>
              <p className="text-slate-400 text-sm truncate">@{user.username}</p>
              {user.bio && (
                <p className="text-slate-500 text-xs truncate mt-1">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right">
              <div className="text-green-400 font-bold text-lg">
                {user.studyPoints.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs">points</div>
              <div className="text-slate-500 text-xs mt-1">
                {user._count.memberships} groups
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No users yet. Be the first to join!</p>
          </div>
        )}
      </div>
    </div>
  );
}
