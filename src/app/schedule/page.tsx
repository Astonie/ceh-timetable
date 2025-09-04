"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type TimetableEntry = {
  id: number;
  week: string;
  title: string;
  details: string[];
};

export default function SchedulePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/timetable", { cache: "no-store" });
        if (!res.ok) throw new Error(`Timetable API error: ${res.status}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setTimetable(data);
        }
      } catch (e) {
        console.error("Fetch timetable error:", e);
        setError("Failed to load timetable");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimetable();
  }, []);

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
              <p className="text-xs text-green-400 opacity-80">Study Schedule</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-4">
              STUDY SCHEDULE
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Complete CEH v13 Certification Timeline
            </p>
            <div className="flex justify-center items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-300 text-sm">Current Week</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Future Weeks</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-green-300 text-lg">Loading schedule...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
                <span className="text-red-400 text-lg">{error}</span>
              </div>
            </div>
          ) : timetable.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-yellow-400 text-lg">No schedule data available</span>
            </div>
          ) : (
            <div className="space-y-4">
              {timetable.map((week, idx) => {
                const isCurrentWeek = idx === 0; // Simplified for now
                
                return (
                  <div 
                    key={week.week} 
                    className={`bg-black/40 backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden ${
                      isCurrentWeek ? 'border-green-500/40 ring-2 ring-green-500/20' : 'border-gray-500/20'
                    }`}
                  >
                    <button
                      className="w-full flex items-center justify-between px-6 py-6 text-left focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-gray-800/30 transition-all"
                      onClick={() => setOpenWeek(openWeek === idx ? null : idx)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          isCurrentWeek 
                            ? 'bg-gradient-to-br from-green-500 to-cyan-600' 
                            : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          <span className="text-white font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xl font-bold mb-2 ${
                            isCurrentWeek ? 'text-green-300' : 'text-gray-300'
                          }`}>
                            {week.week}
                            {isCurrentWeek && (
                              <span className="ml-3 text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                CURRENT
                              </span>
                            )}
                          </h3>
                          <p className="text-white text-lg">{week.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          isCurrentWeek ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-2xl ${
                          isCurrentWeek ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {openWeek === idx ? "−" : "+"}
                        </span>
                      </div>
                    </button>
                    
                    {openWeek === idx && (
                      <div className="px-8 pb-6 bg-gray-900/30">
                        <div className="space-y-3">
                          {week.details.map((detail: string, i: number) => (
                            <div 
                              key={i} 
                              className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                isCurrentWeek 
                                  ? 'bg-green-900/20 border-green-500/20' 
                                  : 'bg-gray-900/20 border-gray-500/20'
                              }`}
                            >
                              <span className={`text-sm mt-1 ${
                                isCurrentWeek ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                ▸
                              </span>
                              <span className={`text-sm leading-relaxed ${
                                isCurrentWeek ? 'text-green-100' : 'text-gray-300'
                              }`}>
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
