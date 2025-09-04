"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
  id: number;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  studyPoints: number;
  joinDate: string;
  lastActive: string;
  isPublic: boolean;
  ownedGroups: Array<{
    id: number;
    name: string;
    description?: string;
    _count: { members: number };
  }>;
  memberships: Array<{
    group: {
      id: number;
      name: string;
      description?: string;
      _count: { members: number };
    };
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.status === 404) {
        setError('Profile not found');
        return;
      }
      if (response.status === 403) {
        setError('This profile is private');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-slate-600"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
              <p className="text-slate-400 mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-slate-300 mb-6 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{profile.studyPoints.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Study Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{profile.ownedGroups.length}</div>
                  <div className="text-slate-400 text-sm">Groups Owned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{profile.memberships.length}</div>
                  <div className="text-slate-400 text-sm">Groups Joined</div>
                </div>
              </div>

              {/* Dates */}
              <div className="text-sm text-slate-500">
                <p>Joined {formatDate(profile.joinDate)}</p>
                <p>Last active {formatDate(profile.lastActive)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Owned Groups */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">👑</span>
              Groups Owned
            </h2>

            <div className="space-y-3">
              {profile.ownedGroups.map((group) => (
                <div key={group.id} className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-white font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-slate-400 text-sm mt-1">{group.description}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    {group._count.members} members
                  </p>
                </div>
              ))}

              {profile.ownedGroups.length === 0 && (
                <p className="text-slate-400 text-center py-4">No groups owned yet</p>
              )}
            </div>
          </div>

          {/* Member Groups */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">👥</span>
              Groups Joined
            </h2>

            <div className="space-y-3">
              {profile.memberships.map((membership) => (
                <div key={membership.group.id} className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-white font-semibold">{membership.group.name}</h3>
                  {membership.group.description && (
                    <p className="text-slate-400 text-sm mt-1">{membership.group.description}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    {membership.group._count.members} members
                  </p>
                </div>
              ))}

              {profile.memberships.length === 0 && (
                <p className="text-slate-400 text-center py-4">No groups joined yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
