"use client";
import { useState, useEffect, useCallback } from "react";
import "./cyberpunk.css";
import JoinModal from "../components/JoinModal";

// Helper to extract the first date in the week string
function getStartDateFromWeek(weekStr: string): Date | null {
  const match = weekStr.match(/\(([^–\)]+)[–\)]/);
  if (!match) return null;
  const dateStr = match[1].trim() + ' 2025';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

type TimetableEntry = {
  id: number;
  week: string;
  title: string;
  details: string[];
};

type Resource = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  fileSize?: number | null;
  isUploadedFile?: boolean;
  createdAt: string;
};

export default function Home() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [facilitatorIndex, setFacilitatorIndex] = useState(0);
  const [showFacilitatorName, setShowFacilitatorName] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [meetingTime, setMeetingTime] = useState("20:00");
  const [meetingTimezone, setMeetingTimezone] = useState("CAT");
  const [meetingLink, setMeetingLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ttLoading, setTtLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ttError, setTtError] = useState<string | null>(null);

  // Fetch meeting settings
  const fetchMeetingSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) throw new Error(`Settings API error: ${res.status}`);
      const data = await res.json();
      
      // Convert array of settings to object for easier access
      const settings: { [key: string]: string } = {};
      if (Array.isArray(data)) {
        data.forEach((setting: { key: string; value: string }) => {
          settings[setting.key] = setting.value;
        });
      }
      
      if (settings.meeting_time) setMeetingTime(settings.meeting_time);
      if (settings.meeting_timezone) setMeetingTimezone(settings.meeting_timezone);
      if (settings.meeting_link) setMeetingLink(settings.meeting_link);
    } catch (e) {
      console.error("Fetch settings error:", e);
    }
  }, []);

  // Format meeting time for display
  const formatMeetingTime = useCallback(() => {
    if (!meetingTime) return "8:00 PM CAT";
    try {
      const [hours, minutes] = meetingTime.split(':').map(Number);
      const time = new Date();
      time.setHours(hours, minutes, 0, 0);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }) + ` ${meetingTimezone}`;
    } catch {
      return "8:00 PM CAT";
    }
  }, [meetingTime, meetingTimezone]);

  // Calculate next meeting date
  const getNextMeetingDateTime = useCallback(() => {
    if (!meetingTime) return "Next meeting: TBA";
    
    const catNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Harare" }));
    const day = catNow.getDay();
    const [hours, minutes] = meetingTime.split(':').map(Number);
    
    const daysUntilNextMeeting = day <= 1 ? 2 - day : day === 2 ? 2 : day === 3 ? 1 : day === 4 ? 5 : 2 + (7 - day);
    const nextDate = new Date(catNow);
    nextDate.setDate(catNow.getDate() + daysUntilNextMeeting);
    nextDate.setHours(hours, minutes, 0, 0);
    
    return nextDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Harare",
    });
  }, [meetingTime]);

  // Check if meeting button should be visible (2 minutes before to 2 hours after meeting)
  const getMeetingStatus = useCallback(() => {
    if (!meetingTime) return { showButton: false, status: "No meeting scheduled" };
    
    const catNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Harare" }));
    const [hours, minutes] = meetingTime.split(':').map(Number);
    
    // Get today's meeting time
    const todayMeeting = new Date(catNow);
    todayMeeting.setHours(hours, minutes, 0, 0);
    
    // Calculate time difference in minutes
    const timeDiff = (todayMeeting.getTime() - catNow.getTime()) / (1000 * 60);
    
    // Show button from 2 minutes before to 2 hours after
    const showButton = timeDiff >= -2 && timeDiff <= 120;
    
    let status = "";
    if (timeDiff > 2) {
      status = `Meeting starts in ${Math.ceil(timeDiff)} minutes`;
    } else if (timeDiff >= -2 && timeDiff <= 0) {
      status = "Meeting is starting now!";
    } else if (timeDiff > -120) {
      status = `Meeting in progress (${Math.abs(Math.floor(timeDiff))} min ago)`;
    } else {
      status = "Next meeting: " + getNextMeetingDateTime();
    }
    
    return { showButton, status, timeDiff };
  }, [meetingTime, getNextMeetingDateTime]);

  // Fetch timetable data
  useEffect(() => {
    async function fetchTimetable() {
      try {
        setTtLoading(true);
        setTtError(null);
        const res = await fetch("/api/timetable", { cache: "no-store" });
        if (!res.ok) throw new Error(`Timetable API error: ${res.status}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setTimetable(data);
          
          const now = new Date();
          let foundCurrentWeek = false;
          
          for (let i = 0; i < data.length; i++) {
            const startDate = getStartDateFromWeek(data[i].week);
            if (startDate) {
              const endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + 6);
              
              if (now >= startDate && now <= endDate) {
                setCurrentWeekIdx(i);
                foundCurrentWeek = true;
                break;
              }
            }
          }
          
          if (!foundCurrentWeek) {
            setCurrentWeekIdx(0);
          }
        }
      } catch (e) {
        console.error("Fetch timetable error:", e);
        setTtError("Failed to load timetable");
      } finally {
        setTtLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  // Fetch latest resources
  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources?limit=3", { cache: "no-store" });
        if (!res.ok) throw new Error(`Resources API error: ${res.status}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setLatestResources(data);
        }
      } catch (e) {
        console.error("Fetch resources error:", e);
      }
    }

    fetchResources();
  }, []);

  // Initialize data
  useEffect(() => {
    async function initializeData() {
      await fetchMeetingSettings();
    }
    
    initializeData();
  }, [fetchMeetingSettings]);

  // Update meeting status every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      // This will trigger a re-render to update the meeting status
      setMeetingTime(prev => prev);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Facilitator management
  useEffect(() => {
    let isMounted = true;
    
    async function fetchFacilitator() {
      try {
        if (isMounted) setIsLoading(true);
        setError(null);
        const res = await fetch("/api/facilitator", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (typeof data.index !== "number" || data.index < 0) throw new Error("Invalid facilitator index");
        
        if (isMounted) {
          setFacilitatorIndex(data.index);
          if (data.teamMembers && Array.isArray(data.teamMembers) && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
        }
      } catch (e) {
        console.error("Fetch facilitator error:", e);
        if (isMounted) {
          setError("Failed to load facilitator. Please try again later.");
          setFacilitatorIndex(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    async function advanceFacilitator() {
      try {
        const res = await fetch("/api/facilitator", { method: "POST", cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        
        if (isMounted) {
          setFacilitatorIndex(data.index);
          if (data.teamMembers && Array.isArray(data.teamMembers) && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
        }
      } catch (e) {
        console.error("Advance facilitator error:", e);
        if (isMounted) {
          setError("Failed to update facilitator. Please try again later.");
        }
      }
    }

    const checkTime = () => {
      if (!isMounted) return;
      
      const now = new Date();
      const catTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Harare" }));
      const day = catTime.getDay();
      const hours = catTime.getHours();
      const minutes = catTime.getMinutes();
      
      // Update facilitator display based on meeting status
      const meetingStatus = getMeetingStatus();
      setShowFacilitatorName(meetingStatus.showButton);
      
      if ((day === 2 || day === 4) && hours === 19 && minutes >= 20 && minutes < 21) {
        advanceFacilitator();
      }
    };

    fetchFacilitator();
    checkTime();
    
    const generalInterval = setInterval(() => {
      if (isMounted) {
        fetchFacilitator();
        checkTime();
      }
    }, 300000);
    
    const preciseInterval = setInterval(() => {
      if (!isMounted) return;
      
      const catTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Harare" }));
      const day = catTime.getDay();
      const hours = catTime.getHours();
      const minutes = catTime.getMinutes();
      if ((day === 2 || day === 4) && hours === 19 && minutes >= 20 && minutes < 21) {
        advanceFacilitator();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(generalInterval);
      clearInterval(preciseInterval);
    };
  }, [getMeetingStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-cyan-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-green-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                CEH Terminal
              </h1>
              <p className="text-xs text-green-400 opacity-80">Ethical Hacker Study Group</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-blue-100 hover:text-white transition-all font-medium text-sm"
            >
              Join Community
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-green-300 hover:text-green-100 hover:bg-green-900/30 rounded-lg transition-all"
            >
              ℹ️
            </button>
            <a 
              href="/admin" 
              className="px-4 py-2 bg-green-600/80 hover:bg-green-500 rounded-lg text-green-100 hover:text-white transition-all font-medium text-sm"
            >
              Admin
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 mb-6">
              ETHICAL HACKER
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Study Group Protocol
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our structured CEH v13 certification study program with automated facilitator rotation 
              and comprehensive session tracking.
            </p>
            
            {/* Status Indicators */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">System Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm">Sessions Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-300 text-sm">CEH v13</span>
              </div>
            </div>
          </div>
        </section>

        {/* Current Status Dashboard */}
        <section className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Current Facilitator */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👨‍💻</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-300">Current Facilitator</h3>
                  <p className="text-sm text-green-400/80">Session Leader</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="ml-3 text-green-300">Loading...</span>
                  </div>
                ) : error ? (
                  <span className="text-red-400">{error}</span>
                ) : showFacilitatorName ? (
                  teamMembers[facilitatorIndex] ? (
                    <div>
                      <span className="text-2xl font-bold text-green-100">
                        {teamMembers[facilitatorIndex]}
                      </span>
                      <div className="text-green-400 text-sm mt-2">Active Now</div>
                    </div>
                  ) : (
                    <span className="text-red-400">Facilitator Not Found</span>
                  )
                ) : (
                  <div>
                    <span className="text-yellow-300">Standby Mode</span>
                    <div className="text-yellow-400/80 text-sm mt-2">Reveals at {formatMeetingTime()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Meeting */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cyan-300">Next Session</h3>
                  <p className="text-sm text-cyan-400/80">Meeting Status</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30">
                <div className="text-lg font-bold text-cyan-100 mb-2">{getMeetingStatus().status}</div>
                <div className="text-cyan-400/80 text-sm mb-4">Tuesday & Thursday @ {formatMeetingTime()}</div>
                {meetingLink && getMeetingStatus().showButton && (
                  <a 
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500 rounded-lg text-cyan-100 hover:text-white transition-all animate-pulse"
                  >
                    <span>🔗</span>
                    <span>Join Meeting</span>
                  </a>
                )}
                {!getMeetingStatus().showButton && meetingLink && (
                  <div className="text-cyan-400/60 text-sm">
                    Meeting link will appear 2 minutes before session
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Study Progress */}
        <section className="container mx-auto px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
              Study Progress
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Previous Week */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📋</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-300">Previous</h3>
                </div>
                
                {ttLoading ? (
                  <div className="text-red-300 animate-pulse">Loading...</div>
                ) : ttError ? (
                  <div className="text-red-400">{ttError}</div>
                ) : currentWeekIdx > 0 && timetable[currentWeekIdx - 1] ? (
                  <div>
                    <div className="text-sm font-bold text-red-200 mb-2">
                      {timetable[currentWeekIdx - 1].week}
                    </div>
                    <div className="text-sm text-white mb-3">
                      {timetable[currentWeekIdx - 1].title}
                    </div>
                    <div className="space-y-1">
                      {timetable[currentWeekIdx - 1].details.slice(0, 2).map((d: string, i: number) => (
                        <div key={i} className="text-xs text-red-100 opacity-80">• {d}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400/60">No previous session</div>
                )}
              </div>

              {/* Current Week */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 ring-2 ring-green-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm animate-pulse">⚡</span>
                  </div>
                  <h3 className="text-lg font-bold text-green-300">Current</h3>
                </div>
                
                {ttLoading ? (
                  <div className="text-green-300 animate-pulse">Loading...</div>
                ) : ttError ? (
                  <div className="text-red-400">{ttError}</div>
                ) : currentWeekIdx >= 0 && timetable[currentWeekIdx] ? (
                  <div>
                    <div className="text-sm font-bold text-green-200 mb-2">
                      {timetable[currentWeekIdx].week}
                    </div>
                    <div className="text-sm text-white mb-3">
                      {timetable[currentWeekIdx].title}
                    </div>
                    <div className="space-y-1">
                      {timetable[currentWeekIdx].details.slice(0, 2).map((d: string, i: number) => (
                        <div key={i} className="text-xs text-green-100">• {d}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-green-400/60">No current session</div>
                )}
              </div>

              {/* Next Week */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🔮</span>
                  </div>
                  <h3 className="text-lg font-bold text-cyan-300">Next</h3>
                </div>
                
                {ttLoading ? (
                  <div className="text-cyan-300 animate-pulse">Loading...</div>
                ) : ttError ? (
                  <div className="text-red-400">{ttError}</div>
                ) : currentWeekIdx >= 0 && timetable[currentWeekIdx + 1] ? (
                  <div>
                    <div className="text-sm font-bold text-cyan-200 mb-2">
                      {timetable[currentWeekIdx + 1].week}
                    </div>
                    <div className="text-sm text-white mb-3">
                      {timetable[currentWeekIdx + 1].title}
                    </div>
                    <div className="space-y-1">
                      {timetable[currentWeekIdx + 1].details.slice(0, 2).map((d: string, i: number) => (
                        <div key={i} className="text-xs text-cyan-100 opacity-80">• {d}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-cyan-400/60">No upcoming session</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
              Quick Access
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a 
                href="/schedule" 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all group text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-bold text-green-300 mb-2">Full Schedule</h3>
                <p className="text-sm text-gray-400">View complete study timeline</p>
              </a>

              <a 
                href="/resources" 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-bold text-cyan-300 mb-2">Resources</h3>
                <p className="text-sm text-gray-400">Study materials & tools</p>
              </a>

              <a 
                href="/leaderboard" 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all group text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-bold text-yellow-300 mb-2">Leaderboard</h3>
                <p className="text-sm text-gray-400">Track group progress</p>
              </a>

              <a 
                href="/community" 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all group text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-purple-300 mb-2">Community</h3>
                <p className="text-sm text-gray-400">Join discussions</p>
              </a>
            </div>
          </div>
        </section>

        {/* Latest Resources */}
        {latestResources.length > 0 && (
          <section className="container mx-auto px-4 mb-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                  Latest Resources
                </h2>
                <a 
                  href="/resources" 
                  className="px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500 rounded-lg text-cyan-100 hover:text-white transition-all"
                >
                  View All →
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestResources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📄</span>
                      </div>
                      <span className="text-cyan-300 text-xs font-bold">{resource.type.toUpperCase()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                      {resource.url && (
                        <a 
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-xl border-t border-green-500/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
              CEH Terminal
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Ethical Hacker Study Group • CEH v13 Certification Program
          </p>
          <p className="text-gray-500 text-xs">
            Built with Next.js • Powered by dedication to cybersecurity excellence
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showJoinModal && (
        <JoinModal 
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)} 
          onSuccess={(user) => {
            console.log('User joined:', user);
            setShowJoinModal(false);
          }}
        />
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-500/30 p-8 w-full max-w-2xl">
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800/50 hover:bg-red-600/20 border border-slate-600 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 text-xl font-bold transition-all flex items-center justify-center"
              onClick={() => setShowInfo(false)}
            >
              ×
            </button>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                  System Info
                </h2>
                <p className="text-green-400">Application Documentation</p>
              </div>
            </div>

            <div className="space-y-6 text-gray-200">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-green-300 mb-2">Mission Overview</h3>
                <p className="text-sm">
                  This platform manages our Ethical Hacking Study Group schedule with automated facilitator 
                  assignment and real-time session tracking for CEH v13 certification preparation.
                </p>
              </div>

              <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-cyan-300 mb-2">Features</h3>
                <ul className="text-sm space-y-2">
                  <li>• Round-robin facilitator rotation</li>
                  <li>• Real-time session tracking</li>
                  <li>• Automated scheduling for Tuesday/Thursday {formatMeetingTime()}</li>
                  <li>• Administrative control panel</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">Build Info</h3>
                <div className="text-sm space-y-1">
                  <div><span className="text-yellow-300">Version:</span> CEH Terminal v3.8.0</div>
                  <div><span className="text-yellow-300">Target:</span> Ethical Hacking v13 Certification</div>
                  <div><span className="text-yellow-300">Status:</span> <span className="text-green-400">Operational</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
