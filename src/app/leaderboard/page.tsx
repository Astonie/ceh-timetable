"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Member = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  progress?: number;
  completedWeeks?: number;
  score?: number;
  lastActive?: string;
  rank?: number;
  badges?: string[];
};

type Facilitator = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  rating: number | null;
  totalSessions: number | null;
  expertise: string[];
};

export default function LeaderboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "facilitators">("members");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch members
        const membersRes = await fetch("/api/members", { cache: "no-store" });
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          if (Array.isArray(membersData)) {
            // Add mock progress data for demonstration
            const membersWithProgress = membersData.map((member: Member, index: number) => ({
              ...member,
              progress: Math.floor(Math.random() * 100),
              completedWeeks: Math.floor(Math.random() * 20),
              score: Math.floor(Math.random() * 1000) + 500,
              lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              rank: index + 1,
              badges: generateRandomBadges()
            }));
            
            // Sort by score for leaderboard
            membersWithProgress.sort((a: Member, b: Member) => (b.score || 0) - (a.score || 0));
            membersWithProgress.forEach((member: Member, index: number) => {
              member.rank = index + 1;
            });
            
            setMembers(membersWithProgress);
          }
        }

        // Fetch facilitators
        const facilitatorsRes = await fetch("/api/facilitator", { cache: "no-store" });
        if (facilitatorsRes.ok) {
          const facilitatorsData = await facilitatorsRes.json();
          if (Array.isArray(facilitatorsData)) {
            // Add mock session data
            const facilitatorsWithStats = facilitatorsData.map((facilitator: Facilitator) => ({
              ...facilitator,
              rating: Math.random() * 2 + 3, // 3-5 rating
              totalSessions: Math.floor(Math.random() * 50) + 10,
              expertise: generateRandomExpertise()
            }));
            setFacilitators(facilitatorsWithStats);
          } else {
            console.warn("Facilitators data is not an array:", facilitatorsData);
            setFacilitators([]);
          }
        }
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const generateRandomBadges = () => {
    const allBadges = ["🥇 Top Performer", "🔥 Streak Master", "📚 Knowledge Seeker", "⚡ Fast Learner", "🎯 Goal Crusher", "🏆 Champion"];
    const numBadges = Math.floor(Math.random() * 3) + 1;
    return allBadges.sort(() => 0.5 - Math.random()).slice(0, numBadges);
  };

  const generateRandomExpertise = () => {
    const allSkills = ["Penetration Testing", "Network Security", "Web Application Security", "Malware Analysis", "Social Engineering", "Cryptography"];
    const numSkills = Math.floor(Math.random() * 3) + 2;
    return allSkills.sort(() => 0.5 - Math.random()).slice(0, numSkills);
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = "⭐".repeat(fullStars);
    if (hasHalfStar) stars += "⭐";
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation Header */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-green-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                CEH Terminal
              </h1>
              <p className="text-xs text-green-400 opacity-80">Leaderboard</p>
            </div>
          </Link>
          
          <Link 
            href="/"
            className="px-4 py-2 bg-green-600/80 hover:bg-green-500 rounded-lg text-green-100 hover:text-white transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-4">
              LEADERBOARD
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Track progress and celebrate achievements in our CEH study group
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-cyan-500/30">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === "members"
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Study Members
              </button>
              <button
                onClick={() => setActiveTab("facilitators")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === "facilitators"
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Facilitators
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-green-300 text-lg">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
                <span className="text-red-400 text-lg">{error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-6 max-w-md mx-auto">
                        <span className="text-yellow-400 text-lg">No members data available</span>
                      </div>
                    </div>
                  ) : (
                    members.map((member, index) => (
                      <div
                        key={member.id}
                        className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                          index < 3 
                            ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                            : 'border-cyan-500/30 hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-black">
                              {getRankIcon(member.rank || index + 1)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{member.name}</h3>
                              <p className="text-sm text-gray-400">{member.email}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-300">{member.score}</div>
                            <div className="text-sm text-gray-400">points</div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Progress</div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{width: `${member.progress}%`}}
                                ></div>
                              </div>
                              <span className="text-sm text-green-400">{member.progress}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Weeks Completed</div>
                            <div className="text-lg font-bold text-white">{member.completedWeeks}/20</div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Last Active</div>
                            <div className="text-sm text-white">{formatLastActive(member.lastActive || member.joinedAt)}</div>
                          </div>
                        </div>

                        {member.badges && member.badges.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-gray-400 mb-2">Achievements</div>
                            <div className="flex flex-wrap gap-2">
                              {member.badges.map((badge, badgeIndex) => (
                                <span 
                                  key={badgeIndex}
                                  className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded-full text-yellow-300 text-xs"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Facilitators Tab */}
              {activeTab === "facilitators" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilitators.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-6 max-w-md mx-auto">
                        <span className="text-yellow-400 text-lg">No facilitators data available</span>
                      </div>
                    </div>
                  ) : (
                    facilitators.map((facilitator) => (
                      <div
                        key={facilitator.id}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all"
                      >
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👨‍🏫</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">{facilitator.name}</h3>
                          <p className="text-sm text-gray-400">{facilitator.email}</p>
                        </div>

                        {facilitator.bio && (
                          <p className="text-sm text-gray-300 mb-4 text-center">
                            {facilitator.bio}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{getRatingStars(facilitator.rating || 0)}</span>
                              <span className="text-xs text-gray-400">({facilitator.rating?.toFixed(1)})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Sessions:</span>
                            <span className="text-sm text-white font-bold">{facilitator.totalSessions}</span>
                          </div>
                        </div>

                        {facilitator.expertise && facilitator.expertise.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-gray-400 mb-2">Expertise</div>
                            <div className="flex flex-wrap gap-1">
                              {facilitator.expertise.map((skill, skillIndex) => (
                                <span 
                                  key={skillIndex}
                                  className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* Statistics */}
          {!isLoading && !error && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 text-center">
                <div className="text-3xl font-black text-green-300">{members.length}</div>
                <div className="text-sm text-gray-400">Total Members</div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 text-center">
                <div className="text-3xl font-black text-cyan-300">{facilitators.length}</div>
                <div className="text-sm text-gray-400">Active Facilitators</div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 text-center">
                <div className="text-3xl font-black text-yellow-300">
                  {members.length > 0 ? Math.round(members.reduce((sum, m) => sum + (m.progress || 0), 0) / members.length) : 0}%
                </div>
                <div className="text-sm text-gray-400">Avg Progress</div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 text-center">
                <div className="text-3xl font-black text-purple-300">20</div>
                <div className="text-sm text-gray-400">Study Weeks</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
