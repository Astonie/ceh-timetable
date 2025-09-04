// file path: src/app/page.tsx

"use client";
import { useState, useEffect, useCallback } from "react";
import "./cyberpunk.css";
// Helper to extract the first date in the week string (e.g. 'Week 1 (June 10–15)' => June 10)
function getStartDateFromWeek(weekStr: string): Date | null {
  const match = weekStr.match(/\(([^–\)]+)[–\)]/);
  if (!match) return null;
  const dateStr = match[1].trim() + ' 2025'; // Assume year is 2025
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
  const [nextMeetingDate, setNextMeetingDate] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [meetingTime, setMeetingTime] = useState("20:00"); // Default to 8:00 PM
  const [meetingTimezone, setMeetingTimezone] = useState("CAT");
  const [meetingLink, setMeetingLink] = useState(""); // Meeting link URL
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [ttLoading, setTtLoading] = useState(true);
  const [ttError, setTtError] = useState<string | null>(null);
  // Find the current week index based on today's date
  const getCurrentWeekIndex = () => {
    if (!timetable.length) return -1;
    const today = new Date();
    for (let i = 0; i < timetable.length; i++) {
      const start = getStartDateFromWeek(timetable[i].week);
      const nextStart = i + 1 < timetable.length ? getStartDateFromWeek(timetable[i + 1].week) : null;
      if (start && (!nextStart || today < nextStart)) {
        if (today >= start) return i;
      }
    }
    return -1;
  };

  const currentWeekIdx = getCurrentWeekIndex();

  useEffect(() => {
    // Fetch latest resources
    fetch('/api/resources', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
      })
      .then(data => {
        // Only show up to 3 latest resources
        setLatestResources(data.slice(0, 3));
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
      });
      
    // Fetch timetable
    setTtLoading(true);
    fetch('/api/timetable', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch timetable');
        return res.json();
      })
      .then(data => {
        setTimetable(data);
        setTtLoading(false);
      })
      .catch(() => {
        setTtError('Failed to load timetable.');
        setTimetable([]);
        setTtLoading(false);
      });
  }, []);

  // Fetch meeting settings
  async function fetchMeetingSettings() {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const settings = await res.json();
        const timeSettings = settings.find((s: {key: string, value: string}) => s.key === 'meeting_time');
        const timezoneSettings = settings.find((s: {key: string, value: string}) => s.key === 'meeting_timezone');
        const linkSettings = settings.find((s: {key: string, value: string}) => s.key === 'meeting_link');
        
        if (timeSettings) setMeetingTime(timeSettings.value);
        if (timezoneSettings) setMeetingTimezone(timezoneSettings.value);
        if (linkSettings) setMeetingLink(linkSettings.value);
      }
    } catch (error) {
      console.error('Failed to fetch meeting settings:', error);
    }
  }

  // Format meeting time for display
  const formatMeetingTime = useCallback(() => {
    return `${meetingTime} ${meetingTimezone}`;
  }, [meetingTime, meetingTimezone]);

  const getNextMeetingDateTime = useCallback(() => {
    const [hours, minutes] = meetingTime.split(':').map(Number);
    const now = new Date();
    const catNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Harare" }));
    const day = catNow.getDay();
    const currentHours = catNow.getHours();
    const currentMinutes = catNow.getMinutes();
    
    // Check if today is Tuesday (2) or Thursday (4) and before meeting time
    if ((day === 2 || day === 4) && (currentHours < hours || (currentHours === hours && currentMinutes < minutes))) {
      const todayMeetingTime = new Date(catNow);
      todayMeetingTime.setHours(hours, minutes, 0, 0);
      return todayMeetingTime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Harare",
      });
    }
    
    // Calculate next meeting day
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

  useEffect(() => {
    // Fetch settings first, then calculate meeting time
    async function initializeData() {
      await fetchMeetingSettings();
    }
    
    initializeData();
  }, []);

  useEffect(() => {
    // Recalculate meeting time when meeting time settings change
    setNextMeetingDate(getNextMeetingDateTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingTime]);

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
      
      setShowFacilitatorName((day === 2 || day === 4) && hours === 19 && minutes < 20);
      if ((day === 2 || day === 4) && hours === 19 && minutes >= 20 && minutes < 21) {
        advanceFacilitator();
        setNextMeetingDate(getNextMeetingDateTime());
      }
    };

    // Initial setup
    fetchFacilitator();
    checkTime();
    setNextMeetingDate(getNextMeetingDateTime());
    
    const generalInterval = setInterval(() => {
      if (isMounted) {
        fetchFacilitator();
        checkTime();
      }
    }, 300000); // 5 minutes
    
    const preciseInterval = setInterval(() => {
      if (!isMounted) return;
      
      const catTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Harare" }));
      const day = catTime.getDay();
      const hours = catTime.getHours();
      const minutes = catTime.getMinutes();
      if ((day === 2 || day === 4) && hours === 19 && minutes >= 20 && minutes < 21) {
        advanceFacilitator();
        setNextMeetingDate(getNextMeetingDateTime());
      }
    }, 10000); // 10 seconds for precise check

    return () => {
      isMounted = false;
      clearInterval(generalInterval);
      clearInterval(preciseInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty deps to prevent infinite loop with getNextMeetingDateTime

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-900 text-white font-mono antialiased relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full animate-pulse"></div>
        <div className="absolute top-20 left-40 w-full h-full animate-pulse"></div>
      </div>

      {/* Enhanced Cyberpunk Top Navigation Bar - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-green-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-cyan-400/5 animate-pulse"></div>
        <div className="px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative">
              <span className="text-2xl font-bold text-black animate-pulse">🛡️</span>
              <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                {'<CEH_TERMINAL/>'}
              </h1>
              <p className="text-xs text-green-400 font-mono tracking-wider">
                {'// ETHICAL_HACKER_STUDY_GROUP'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              className="p-3 text-green-300 hover:text-green-100 hover:bg-green-900/30 rounded-xl transition-all border border-green-600/30 hover:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="System Info"
              onClick={() => setShowInfo(true)}
            >
              <span className="text-lg">ℹ️</span>
            </button>
            
            <a 
              href="/admin" 
              className="px-4 py-2 bg-gradient-to-r from-green-600/40 to-cyan-600/40 border border-green-500/40 rounded-xl backdrop-blur-sm shadow-lg hover:from-green-500/50 hover:to-cyan-500/50 transition-all flex items-center gap-2"
              title="Access Admin Control Panel"
            >
              <span className="text-green-200 font-bold text-sm font-mono">ADMIN.ACCESS</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </a>
          </div>
        </div>
      </nav>

      {/* Enhanced Cyberpunk Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-500/30 p-8 w-full max-w-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-cyan-400/5 animate-pulse"></div>
            
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800/50 hover:bg-red-600/20 border border-slate-600 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 text-xl font-bold transition-all z-10 flex items-center justify-center"
              onClick={() => setShowInfo(false)}
              aria-label="Close"
            >
              ×
            </button>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl">🛡️</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 font-mono">
                    SYSTEM.INFO
                  </h2>
                  <p className="text-green-400 font-mono text-sm">{'// application.documentation'}</p>
                </div>
              </div>

              <div className="space-y-6 text-green-100 font-mono">
                <div className="p-4 bg-slate-900/50 border border-green-500/30 rounded-xl">
                  <h3 className="text-lg font-bold text-green-300 mb-2">{'> MISSION_OVERVIEW'}</h3>
                  <p className="text-sm leading-relaxed mb-3">
                    This terminal manages the Ethical Hacking Study Group schedule with automated facilitator assignment 
                    and real-time session tracking. Built for CEH v13 certification preparation.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/50 border border-green-500/30 rounded-xl">
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">{'> SYSTEM_FEATURES'}</h3>
                  <ul className="list-none space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">▸</span>
                      <span>Persistent round-robin facilitator rotation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">▸</span>
                      <span>Real-time current/previous/next topic display</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">▸</span>
                      <span>Automated session scheduling for Tuesday/Thursday {formatMeetingTime()}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">▸</span>
                      <span>Administrative control panel for operators</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/50 border border-green-500/30 rounded-xl">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">{'> BUILD_INFO'}</h3>
                  <div className="text-xs space-y-1">
                    <div><span className="text-yellow-300">VERSION:</span> <span className="text-green-400">CEH_TERMINAL_v3.7.2</span></div>
                    <div><span className="text-yellow-300">TARGET:</span> <span className="text-cyan-400">Ethical Hacking v13 Certification</span></div>
                    <div><span className="text-yellow-300">STATUS:</span> <span className="text-green-400 animate-pulse">OPERATIONAL</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Terminal Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4 relative">
        {/* ASCII Art Banner */}
        <div className="mb-12 p-6 bg-slate-950/80 border border-green-500/30 rounded-2xl font-mono text-green-400 text-xs overflow-x-auto w-full max-w-4xl">
          <pre className="whitespace-pre text-center">
{`╭──────────────────────────────────────────────────────╮
│   ██████╗███████╗██╗  ██╗    ██████╗  █████╗ ███████╗│
│  ██╔════╝██╔════╝██║  ██║    ██╔══██╗██╔══██╗██╔════╝│
│  ██║     █████╗  ███████║    ██║  ██║███████║█████╗  │
│  ██║     ██╔══╝  ██╔══██║    ██║  ██║██╔══██║██╔══╝  │
│  ╚██████╗███████╗██║  ██║    ██████╔╝██║  ██║███████╗│
│   ╚═════╝╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝│
│              CERTIFIED ETHICAL HACKER TERMINAL         │
│                 >> STUDY GROUP INTERFACE <<            │
╰──────────────────────────────────────────────────────╯`}
          </pre>
          <div className="mt-4 text-center">
            <span className="text-green-300">STATUS: </span>
            <span className="text-green-400 animate-pulse">🟢 SYSTEM ONLINE</span>
            <span className="text-green-300 ml-4">PROTOCOL: </span>
            <span className="text-cyan-400">CEH_v13</span>
            <span className="text-green-300 ml-4">MODE: </span>
            <span className="text-yellow-400">STUDY_SESSION</span>
          </div>
        </div>

        {/* Main Terminal Display */}
        <section className="w-full max-w-5xl bg-slate-950/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-green-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-cyan-400/5 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 drop-shadow-lg font-mono tracking-wide mb-4">
                {'ETHICAL.HACKER.PROTOCOL'}
              </h1>
              <p className="text-lg text-green-200 font-mono mb-6">
                {'// Automated facilitator assignment & session tracking system'}
              </p>
              <div className="flex justify-center gap-2 mb-8">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            {/* Current Presenter Terminal */}
            <div className="mb-8 p-6 bg-slate-900/70 border border-green-500/40 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👨‍💻</span>
                </div>
                <div>
                  <span className="text-green-400 text-sm font-bold font-mono tracking-wider">ACTIVE_OPERATOR</span>
                  <div className="text-green-300 text-xs font-mono">{'// current.session.facilitator'}</div>
                </div>
              </div>
              
              <div className="text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="ml-3 text-green-300 font-mono">Authenticating operator...</span>
                  </div>
                ) : error ? (
                  <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl">
                    <span className="text-red-400 font-mono text-sm">ERROR: {error}</span>
                  </div>
                ) : showFacilitatorName ? (
                  teamMembers[facilitatorIndex] ? (
                    <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-xl">
                      <span className="text-3xl font-black text-green-100 tracking-wide font-mono animate-pulse">
                        {teamMembers[facilitatorIndex]}
                      </span>
                      <div className="text-green-400 text-sm font-mono mt-2">{'>> AUTHENTICATED & ACTIVE <<'}</div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl">
                      <span className="text-red-400 font-mono">OPERATOR_NOT_FOUND</span>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-xl">
                    <span className="text-yellow-300 font-mono">STANDBY_MODE: Operator reveals at {formatMeetingTime()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Meeting Info Terminal */}
            <div className="p-6 bg-slate-900/70 border border-cyan-500/40 rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-cyan-300 font-bold font-mono tracking-wider">NEXT_MISSION_BRIEFING</span>
              </div>
              
              <div className="text-center p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                <span className="text-cyan-100 text-lg font-mono font-bold">{nextMeetingDate}</span>
                <div className="text-cyan-400 text-sm font-mono mt-2">{'// Tuesday.Thursday @ ' + formatMeetingTime().replace(' ', '.')}</div>
                {meetingLink && (
                  <div className="mt-4">
                    <a 
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500/90 border border-cyan-400/50 rounded-lg text-cyan-100 hover:text-white font-mono text-sm transition-all duration-200 hover:scale-105"
                    >
                      <span className="text-lg">🔗</span>
                      <span>JOIN_MEETING</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Status Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Previous Mission */}
          <div className="bg-slate-950/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-orange-400/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-sm">📋</span>
                </div>
                <div>
                  <span className="text-red-400 text-xs font-bold font-mono tracking-wider">PREVIOUS_MISSION</span>
                  <div className="text-red-300/60 text-xs font-mono">{'// completed.session'}</div>
                </div>
              </div>
              
              {ttLoading ? (
                <div className="text-red-300 animate-pulse text-sm font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  Loading mission data...
                </div>
              ) : ttError ? (
                <div className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded border border-red-500/30">
                  ERROR: {ttError}
                </div>
              ) : currentWeekIdx > 0 && timetable[currentWeekIdx - 1] ? (
                <>
                  <div className="mb-3 p-2 bg-red-900/20 rounded border border-red-500/30">
                    <span className="font-bold text-red-200 text-sm font-mono block truncate">
                      {timetable[currentWeekIdx - 1].week}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-white text-sm font-medium font-mono block">
                      {timetable[currentWeekIdx - 1].title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {timetable[currentWeekIdx - 1].details.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs mt-1">▸</span>
                        <span className="text-red-100 text-xs leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-red-400/60 font-mono text-sm">No previous mission found.</div>
              )}
            </div>
          </div>

          {/* Current Mission */}
          <div className="bg-slate-950/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-cyan-400/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-sm animate-pulse">⚡</span>
                </div>
                <div>
                  <span className="text-green-400 text-xs font-bold font-mono tracking-wider">ACTIVE_MISSION</span>
                  <div className="text-green-300/60 text-xs font-mono">{'// current.session'}</div>
                </div>
              </div>
              
              {ttLoading ? (
                <div className="text-green-300 animate-pulse text-sm font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  Loading mission data...
                </div>
              ) : ttError ? (
                <div className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded border border-red-500/30">
                  ERROR: {ttError}
                </div>
              ) : currentWeekIdx >= 0 && timetable[currentWeekIdx] ? (
                <>
                  <div className="mb-3 p-2 bg-green-900/20 rounded border border-green-500/30">
                    <span className="font-bold text-green-200 text-sm font-mono block truncate">
                      {timetable[currentWeekIdx].week}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-white text-sm font-medium font-mono block">
                      {timetable[currentWeekIdx].title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {timetable[currentWeekIdx].details.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs mt-1">▸</span>
                        <span className="text-green-100 text-xs leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-green-400/60 font-mono text-sm">No active mission found.</div>
              )}
            </div>
          </div>

          {/* Next Mission */}
          <div className="bg-slate-950/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-sm">🔮</span>
                </div>
                <div>
                  <span className="text-cyan-400 text-xs font-bold font-mono tracking-wider">NEXT_MISSION</span>
                  <div className="text-cyan-300/60 text-xs font-mono">{'// upcoming.session'}</div>
                </div>
              </div>
              
              {ttLoading ? (
                <div className="text-cyan-300 animate-pulse text-sm font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  Loading mission data...
                </div>
              ) : ttError ? (
                <div className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded border border-red-500/30">
                  ERROR: {ttError}
                </div>
              ) : currentWeekIdx >= 0 && timetable[currentWeekIdx + 1] ? (
                <>
                  <div className="mb-3 p-2 bg-cyan-900/20 rounded border border-cyan-500/30">
                    <span className="font-bold text-cyan-200 text-sm font-mono block truncate">
                      {timetable[currentWeekIdx + 1].week}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-white text-sm font-medium font-mono block">
                      {timetable[currentWeekIdx + 1].title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {timetable[currentWeekIdx + 1].details.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 text-xs mt-1">▸</span>
                        <span className="text-cyan-100 text-xs leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-cyan-400/60 font-mono text-sm">No next mission found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Full Schedule Access Terminal */}
        <div className="flex justify-center mb-8 w-full max-w-4xl">
          <button
            className="px-8 py-4 bg-gradient-to-r from-green-600/80 to-cyan-600/80 hover:from-green-500/90 hover:to-cyan-500/90 border border-green-500/50 hover:border-green-400/70 text-green-100 hover:text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-mono tracking-wide relative overflow-hidden"
            onClick={() => setShowAllTopics((prev) => !prev)}
            aria-expanded={showAllTopics ? "true" : "false"}
            aria-controls="all-topics-accordion"
          >
            <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span>{showAllTopics ? 'HIDE_FULL_PROTOCOL' : 'SHOW_FULL_PROTOCOL'}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>

        {showAllTopics && (
          <div id="all-topics-accordion" className="w-full max-w-6xl space-y-4">
            <div className="mb-6 p-4 bg-slate-950/80 border border-green-500/30 rounded-2xl font-mono text-green-400 text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-2xl">🗂️</span>
                <span className="font-bold text-lg">COMPLETE_MISSION_ARCHIVE</span>
                <span className="text-2xl">🗂️</span>
              </div>
              <div className="text-xs text-green-300">{'// Full CEH v13 study protocol & session details'}</div>
            </div>
            
            {ttLoading ? (
              <div className="text-green-300 animate-pulse text-lg font-mono text-center flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="ml-3">Loading mission archive...</span>
              </div>
            ) : ttError ? (
              <div className="text-red-400 text-lg font-mono text-center p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                ERROR: {ttError}
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-yellow-400 text-center font-mono">No mission archive found.</div>
            ) : timetable.map((week, idx) => (
              <div key={week.week} className="bg-slate-950/60 backdrop-blur-xl rounded-2xl shadow-lg border border-green-500/20 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-green-400 bg-slate-900/50 hover:bg-slate-800/60 transition-all border-b border-green-500/20"
                  onClick={() => setOpenWeek(openWeek === idx ? null : idx)}
                  aria-expanded={openWeek === idx ? "true" : "false"}
                  aria-controls={`week-details-${idx}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-black font-bold text-sm">{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-green-200 text-lg font-mono block truncate">
                        {week.week}
                      </span>
                      <span className="text-green-100 text-sm font-mono block truncate mt-1">
                        {week.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-2xl font-mono">{openWeek === idx ? "−" : "+"}</span>
                  </div>
                </button>
                
                {openWeek === idx && (
                  <div id={`week-details-${idx}`} className="px-8 pb-6 pt-4 bg-slate-900/30">
                    <div className="space-y-3">
                      {week.details.map((d: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                          <span className="text-green-400 text-sm mt-1 font-mono">▸</span>
                          <span className="text-green-100 text-sm leading-relaxed font-mono">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Study Resources Section */}
        {latestResources.length > 0 && (
          <div className="w-full max-w-6xl mt-12 p-6 bg-slate-950/80 border border-cyan-500/30 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-300 font-mono">STUDY_RESOURCES</h2>
              <a 
                href="/resources" 
                className="px-4 py-2 bg-cyan-600/40 hover:bg-cyan-500/60 text-cyan-200 rounded-lg font-bold transition-all border border-cyan-500/30 text-sm"
              >
                VIEW_ALL →
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestResources.map((resource) => (
                <div 
                  key={resource.id}
                  className="bg-black/50 border border-cyan-700/30 rounded-xl p-4 hover:border-cyan-600/40 transition-all"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-cyan-400 mr-2 text-lg">
                      {resource.type === 'uploaded-pdf' ? '📄' : resource.type === 'pdf' ? '📄' : '🔗'}
                    </span>
                    <h3 className="text-cyan-300 font-bold text-sm truncate">{resource.title}</h3>
                  </div>
                  
                  {resource.description && (
                    <p className="text-cyan-200/70 text-xs mb-3 line-clamp-2">{resource.description}</p>
                  )}
                  
                  <a 
                    href={resource.url || '#'} 
                    download={resource.type === 'uploaded-pdf' ? (resource.title ? `${resource.title}.pdf` : 'download.pdf') : undefined}
                    target={resource.type === 'uploaded-pdf' ? undefined : "_blank"}
                    rel={resource.type === 'uploaded-pdf' ? undefined : "noopener noreferrer"}
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-xs font-mono"
                  >
                    {resource.type === 'uploaded-pdf' ? 'Download' : 'View'} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* System Status Footer */}
        <div className="w-full max-w-6xl mt-12 p-4 bg-slate-950/80 border border-green-500/30 rounded-2xl font-mono text-center">
          <div className="flex items-center justify-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300">SYSTEM.ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-300">DATABASE.CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-300">PROTOCOL.CEH_v13</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-500">
            {'© 2025 ETHICAL.HACKER.TERMINAL // CEH_STUDY_GROUP_v3.7.2'}
          </div>
        </div>
      </div>
    </div>
  );
}