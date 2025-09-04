"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  maxMembers: number;
  createdAt: string;
  owner: {
    id: number;
    username: string;
    name: string;
  };
  members: Array<{
    user: {
      id: number;
      username: string;
      name: string;
    };
  }>;
  _count: {
    members: number;
  };
}

interface CurrentUser {
  id: number;
  name: string;
}

export default function StudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetchGroups();
    // For demo purposes, we'll simulate a current user
    // In a real app, you'd get this from authentication
    setCurrentUser({ id: 1, name: 'Demo User' });
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join group');
      }

      // Refresh groups to show updated member count
      fetchGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave group');
      }

      // Refresh groups to show updated member count
      fetchGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to leave group');
    }
  };

  const isMember = (group: StudyGroup) => {
    return currentUser && group.members.some(member => member.user.id === currentUser.id);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-2">👥</span>
          Study Groups
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
        >
          Create Group
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-800/70 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white mb-2">{group.name}</h3>

            {group.description && (
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">{group.description}</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">
                <p>Owner: <Link href={`/profile/${group.owner.id}`} className="text-green-400 hover:text-green-300">{group.owner.name}</Link></p>
                <p>{group._count.members}/{group.maxMembers} members</p>
              </div>
            </div>

            {/* Members List */}
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Members:</p>
              <div className="flex flex-wrap gap-1">
                {group.members.slice(0, 5).map((member) => (
                  <Link
                    key={member.user.id}
                    href={`/profile/${member.user.id}`}
                    className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                  >
                    {member.user.name}
                  </Link>
                ))}
                {group.members.length > 5 && (
                  <span className="text-xs text-slate-500 px-2 py-1">
                    +{group.members.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Join/Leave Button */}
            {currentUser && (
              <div className="flex justify-end">
                {isMember(group) ? (
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={group._count.members >= group.maxMembers}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                  >
                    {group._count.members >= group.maxMembers ? 'Group Full' : 'Join Group'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400 mb-4">No study groups yet. Be the first to create one!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              Create First Group
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateForm && (
        <CreateGroupModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchGroups();
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onSuccess, currentUser }: {
  onClose: () => void;
  onSuccess: () => void;
  currentUser: CurrentUser | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 10
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: currentUser.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 min-w-[400px] max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Create Study Group</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400 h-24 resize-none"
                placeholder="Describe your study group's focus and goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Members
              </label>
              <input
                type="number"
                min="2"
                max="50"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 10 }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
              />
            </div>

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
                disabled={loading || !formData.name.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
