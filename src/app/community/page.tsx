"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Member = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
};

type Facilitator = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  type: "info" | "warning" | "success" | "update";
};

export default function CommunityPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "facilitators" | "announcements">("overview");

  // Mock announcements data
  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Welcome to CEH v13 Study Group!",
      content: "Welcome to our Certified Ethical Hacker v13 study group! We're excited to have you join us on this 20-week journey. Please introduce yourself and let us know your background in cybersecurity.",
      author: "Lucius Malizani",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "success"
    },
    {
      id: "2",
      title: "Week 3 Study Materials Available",
      content: "The study materials for Week 3 (Social Engineering) have been uploaded to the resources section. Don't forget to complete the practical exercises before our next session.",
      author: "Astonie Mukiwa",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: "info"
    },
    {
      id: "3",
      title: "Virtual Lab Access Issues",
      content: "Some members are experiencing connectivity issues with the virtual lab environment. We're working with the provider to resolve this. In the meantime, please use the alternative lab setup guide.",
      author: "Hopkins Ceaser",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: "warning"
    },
    {
      id: "4",
      title: "Study Group Meeting Schedule Update",
      content: "Our weekly group sessions will now be held on Saturdays at 10:00 AM UTC. Please update your calendars accordingly. Recordings will be available for those who cannot attend live.",
      author: "Lucius Malizani",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: "update"
    }
  ];

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
            setMembers(membersData);
          }
        }

        // Fetch facilitators
        const facilitatorsRes = await fetch("/api/facilitator", { cache: "no-store" });
        if (facilitatorsRes.ok) {
          const facilitatorsData = await facilitatorsRes.json();
          if (Array.isArray(facilitatorsData)) {
            setFacilitators(facilitatorsData);
          } else {
            console.warn("Facilitators data is not an array:", facilitatorsData);
            setFacilitators([]);
          }
        }
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to load community data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "info": return "ℹ️";
      case "warning": return "⚠️";
      case "success": return "✅";
      case "update": return "📢";
      default: return "📝";
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "info": return "border-cyan-500/50 bg-cyan-900/20";
      case "warning": return "border-yellow-500/50 bg-yellow-900/20";
      case "success": return "border-green-500/50 bg-green-900/20";
      case "update": return "border-purple-500/50 bg-purple-900/20";
      default: return "border-gray-500/50 bg-gray-900/20";
    }
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
              <p className="text-xs text-green-400 opacity-80">Community</p>
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
              COMMUNITY
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Connect with fellow ethical hackers and facilitators in our study group
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-cyan-500/30 flex flex-wrap">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl transition-all text-sm ${
                  activeTab === "overview"
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`px-4 py-2 rounded-xl transition-all text-sm ${
                  activeTab === "announcements"
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 rounded-xl transition-all text-sm ${
                  activeTab === "members"
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab("facilitators")}
                className={`px-4 py-2 rounded-xl transition-all text-sm ${
                  activeTab === "facilitators"
                    ? 'bg-yellow-600 text-white shadow-lg'
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
              <span className="text-green-300 text-lg">Loading community data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
                <span className="text-red-400 text-lg">{error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Community Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 text-center">
                      <div className="text-3xl font-black text-green-300">{members.length}</div>
                      <div className="text-sm text-gray-400">Active Members</div>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 text-center">
                      <div className="text-3xl font-black text-cyan-300">{facilitators.length}</div>
                      <div className="text-sm text-gray-400">Expert Facilitators</div>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 text-center">
                      <div className="text-3xl font-black text-yellow-300">20</div>
                      <div className="text-sm text-gray-400">Study Weeks</div>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 text-center">
                      <div className="text-3xl font-black text-purple-300">{announcements.length}</div>
                      <div className="text-sm text-gray-400">Recent Updates</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                    <h2 className="text-2xl font-bold text-cyan-300 mb-6">Recent Community Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div>
                          <p className="text-white">New member <span className="text-green-400 font-bold">John Doe</span> joined the study group</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <div>
                          <p className="text-white">New resources uploaded for <span className="text-cyan-400 font-bold">Week 3</span></p>
                          <p className="text-xs text-gray-400">1 day ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <div>
                          <p className="text-white"><span className="text-purple-400 font-bold">Hopkins Ceaser</span> posted a new announcement</p>
                          <p className="text-xs text-gray-400">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/schedule" className="group">
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all group-hover:scale-105">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📅</div>
                          <h3 className="text-xl font-bold text-green-300 mb-2">Study Schedule</h3>
                          <p className="text-sm text-gray-400">View the complete 20-week study timeline</p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/resources" className="group">
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group-hover:scale-105">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📚</div>
                          <h3 className="text-xl font-bold text-cyan-300 mb-2">Study Resources</h3>
                          <p className="text-sm text-gray-400">Access PDFs, tools, and learning materials</p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/leaderboard" className="group">
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all group-hover:scale-105">
                        <div className="text-center">
                          <div className="text-4xl mb-4">🏆</div>
                          <h3 className="text-xl font-bold text-yellow-300 mb-2">Leaderboard</h3>
                          <p className="text-sm text-gray-400">Track progress and achievements</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Announcements Tab */}
              {activeTab === "announcements" && (
                <div className="space-y-6">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border ${getAnnouncementColor(announcement.type)}`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{getAnnouncementIcon(announcement.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                            <span className="text-sm text-gray-400">{formatDate(announcement.createdAt)}</span>
                          </div>
                          <p className="text-gray-300 mb-3">{announcement.content}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Posted by:</span>
                            <span className="text-sm text-cyan-400 font-bold">{announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-6 max-w-md mx-auto">
                        <span className="text-yellow-400 text-lg">No members data available</span>
                      </div>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👨‍💻</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{member.email}</p>
                          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                            <span>Joined:</span>
                            <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
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
                        className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👨‍🏫</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">{facilitator.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{facilitator.email}</p>
                          {facilitator.bio && (
                            <p className="text-sm text-gray-300 text-center leading-relaxed">
                              {facilitator.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
