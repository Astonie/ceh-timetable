"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../cyberpunk.css";

type TimetableEntry = {
  id: number;
  week: string;
  title: string;
  details: string[];
};

type Facilitator = {
  id: number;
  name: string;
};

type Resource = {
  id: number;
  title: string;
  description: string | null;
  type: string;  // 'pdf', 'uploaded-pdf', or 'link'
  url: string | null;
  fileSize?: number | null;
  isUploadedFile?: boolean;
  createdAt: string;
};

// Enhanced modal component with glassmorphism
function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 min-w-[400px] max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-10 h-10 bg-slate-800/50 hover:bg-red-600/20 border border-slate-600 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 text-xl font-bold transition-all z-10 flex items-center justify-center"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Facilitator state
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [newMember, setNewMember] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'link' as 'link' | 'pdf' | 'uploaded-pdf',
    url: '',
    fileSize: null as number | null,
    isUploadedFile: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editName, setEditName] = useState("");

  // Timetable state
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ week: "", title: "", details: "" });
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState({ week: "", title: "", details: "" });
  const [ttLoading, setTtLoading] = useState(false);
  const [ttError, setTtError] = useState<string | null>(null);
  const [ttSuccess, setTtSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'facilitators' | 'timetable' | 'settings' | 'resources'>("facilitators");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Array<{key: string, value: string, description: string}>>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch data on component mount
  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchFacilitators();
      fetchTimetable();
      fetchSettings();
      fetchResources();
    }
  }, [mounted, isAuthenticated]);
  
  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 5MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadProgress(0);
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      // Wait for upload to complete
      const uploadPromise = new Promise<{ fileUrl: string, size: number }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve({ fileUrl: response.fileUrl, size: response.size });
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });
      
      // Start upload
      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
      
      // Wait for upload to complete
      const response = await uploadPromise;
      
      // Update resource with file info
      setNewResource(prev => ({
        ...prev,
        url: response.fileUrl,
        fileSize: response.size,
        isUploadedFile: true
      }));
      
      setUploadProgress(100);
      setSuccess('File uploaded successfully');
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  // Show loading during authentication check or if not mounted
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl cyberpunk-glow">
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl cyberpunk-glow">
          VERIFYING ACCESS...
        </div>
      </div>
    );
  }

  async function fetchFacilitators() {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/facilitators", { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      // Ensure data is always an array
      setFacilitators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch facilitator error:', err);
      setError("Failed to load facilitators. Please check your connection.");
      setFacilitators([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Timetable CRUD (mock, replace with API integration as needed)
  async function fetchTimetable() {
    setTtLoading(true);
    setTtError(null);
    try {
      const res = await fetch("/api/timetable", { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch timetable error:', err);
      setTtError("Failed to load timetable. Please check your connection.");
      setTimetable([]);
    } finally {
      setTtLoading(false);
    }
  }

  function handleEntryInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  }

  async function addTimetableEntry(e: React.FormEvent) {
    e.preventDefault();
    setTtLoading(true);
    setTtError(null);
    setTtSuccess(null);
    try {
      const detailsArr = newEntry.details.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: newEntry.week, title: newEntry.title, details: detailsArr })
      });
      if (!res.ok) throw new Error("Failed to add entry");
      setTtSuccess("Entry added");
      setNewEntry({ week: "", title: "", details: "" });
      fetchTimetable();
    } catch {
      setTtError("Failed to add entry.");
    } finally {
      setTtLoading(false);
    }
  }

  function cancelEditEntry() {
    setEditingEntryId(null);
    setEditEntry({ week: "", title: "", details: "" });
  }

  async function updateTimetableEntry(e: React.FormEvent) {
    e.preventDefault();
    setTtLoading(true);
    setTtError(null);
    setTtSuccess(null);
    try {
      const detailsArr = editEntry.details.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/timetable/${editingEntryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: editEntry.week, title: editEntry.title, details: detailsArr })
      });
      if (!res.ok) throw new Error("Failed to update entry");
      setTtSuccess("Entry updated");
      setEditingEntryId(null);
      setEditEntry({ week: "", title: "", details: "" });
      fetchTimetable();
    } catch {
      setTtError("Failed to update entry.");
    } finally {
      setTtLoading(false);
    }
  }

  async function deleteTimetableEntry(id: number) {
    setTtLoading(true);
    setTtError(null);
    setTtSuccess(null);
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
      setTtSuccess("Entry deleted");
      fetchTimetable();
    } catch {
      setTtError("Failed to delete entry.");
    } finally {
      setTtLoading(false);
    }
  }

  // Settings CRUD functions
  async function fetchSettings() {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/settings", { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setSettings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch settings error:', err);
      setSettingsError("Failed to load settings. Please check your connection.");
      setSettings([]);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function updateSetting(key: string, value: string) {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      fetchSettings();
      setEditingSetting(null);
      setEditingValue("");
    } catch (err) {
      console.error('Update setting error:', err);
      setSettingsError("Failed to update setting.");
    } finally {
      setSettingsLoading(false);
    }
  }

  function startSettingEdit(key: string, value: string) {
    setEditingSetting(key);
    setEditingValue(value);
  }

  function cancelSettingEdit() {
    setEditingSetting(null);
    setEditingValue("");
  }

  // Helper function to format time for display
  function formatTimeForDisplay(time24: string, timezone: string = 'CAT') {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm} ${timezone}`;
  }

  function startEdit(facilitator: Facilitator) {
    setEditingId(facilitator.id);
    setEditName(facilitator.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function updateFacilitator(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || editingId === null) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/facilitators/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update facilitator");
      setSuccess("Facilitator updated");
      setEditingId(null);
      setEditName("");
      fetchFacilitators();
    } catch {
      setError("Failed to update facilitator.");
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setNewMember(e.target.value);
  }

  async function addFacilitator(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newMember.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/facilitators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMember.trim() })
      });
      if (!res.ok) throw new Error("Failed to add facilitator");
      setNewMember("");
      setSuccess("Facilitator added");
      fetchFacilitators();
      setShowAddModal(false);
    } catch {
      setError("Failed to add facilitator.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteFacilitator(id: number) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/facilitators/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete facilitator");
      setSuccess("Facilitator deleted");
      fetchFacilitators();
    } catch {
      setError("Failed to delete facilitator.");
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-900 text-white font-mono antialiased relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full animate-pulse"></div>
        <div className="absolute top-20 left-40 w-full h-full animate-pulse"></div>
      </div>

      {/* Enhanced Cyberpunk Sidebar - Made Sticky */}
      <aside className="w-80 bg-slate-950/60 backdrop-blur-xl border-r border-green-500/30 flex flex-col py-8 px-6 shadow-2xl fixed top-0 left-0 h-screen z-40 overflow-y-auto">
        {/* Glitch lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        
        {/* Hacker Logo/Brand Section */}
        <div className="mb-10 p-6 bg-gradient-to-br from-green-900/30 via-slate-900/50 to-cyan-900/30 rounded-2xl border border-green-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-cyan-400/5 animate-pulse"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative">
              <span className="text-3xl font-bold text-black animate-pulse">🛡️</span>
              <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 glitch-text">
                C.E.H CONTROL
              </h1>
              <p className="text-xs text-green-400 mt-1 font-mono tracking-wider">
                {'// ETHICAL_HACKER_ADMIN_v3.7.2'}
              </p>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mb-8 space-y-3">
          <Link
            href="/"
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/40 rounded-xl backdrop-blur-sm hover:from-blue-500/50 hover:to-purple-500/50 transition-all group"
          >
            <span className="text-xl group-hover:animate-bounce">🏠</span>
            <div>
              <span className="text-blue-200 font-bold text-sm">RETURN.HOME</span>
              <div className="text-xs text-blue-400 opacity-70">Navigate to landing page</div>
            </div>
          </Link>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-red-600/40 to-orange-600/40 border border-red-500/40 rounded-xl backdrop-blur-sm hover:from-red-500/50 hover:to-orange-500/50 transition-all group"
          >
            <span className="text-xl group-hover:animate-pulse">🔒</span>
            <div>
              <span className="text-red-200 font-bold text-sm">LOGOUT</span>
              <div className="text-xs text-red-400 opacity-70">Terminate session</div>
            </div>
          </button>
        </div>

        {/* Hacker Navigation */}
        <nav className="flex flex-col gap-3 mb-8">
          <button 
            onClick={() => setActiveSection('facilitators')} 
            className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-left transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
              activeSection === 'facilitators' 
                ? 'bg-gradient-to-r from-green-600/80 to-green-500/80 text-black shadow-xl border border-green-400/70 shadow-green-500/20' 
                : 'text-green-300 hover:bg-green-900/30 hover:text-green-100 border border-green-700/30 hover:border-green-500/50'
            }`}
          >
            {activeSection === 'facilitators' && <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>}
            <span className="text-2xl filter drop-shadow-lg">�‍💻</span>
            <div className="relative z-10">
              <div className="text-base font-black tracking-wide">OPERATORS</div>
              <div className={`text-xs font-mono ${activeSection === 'facilitators' ? 'text-green-900' : 'text-green-400/80'}`}>
                {'// manage_team_access'}
              </div>
            </div>
            {activeSection === 'facilitators' && (
              <div className="ml-auto text-green-900 animate-bounce">{'>'}</div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveSection('timetable')} 
            className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-left transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
              activeSection === 'timetable' 
                ? 'bg-gradient-to-r from-cyan-600/80 to-cyan-500/80 text-black shadow-xl border border-cyan-400/70 shadow-cyan-500/20' 
                : 'text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-100 border border-cyan-700/30 hover:border-cyan-500/50'
            }`}
          >
            {activeSection === 'timetable' && <div className="absolute inset-0 bg-cyan-400/10 animate-pulse"></div>}
            <span className="text-2xl filter drop-shadow-lg">⚡</span>
            <div className="relative z-10">
              <div className="text-base font-black tracking-wide">MISSIONS</div>
              <div className={`text-xs font-mono ${activeSection === 'timetable' ? 'text-cyan-900' : 'text-cyan-400/80'}`}>
                {'// schedule_operations'}
              </div>
            </div>
            {activeSection === 'timetable' && (
              <div className="ml-auto text-cyan-900 animate-bounce">{'>'}</div>
            )}
          </button>

          <button 
            onClick={() => setActiveSection('settings')} 
            className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-left transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
              activeSection === 'settings' 
                ? 'bg-gradient-to-r from-purple-600/80 to-purple-500/80 text-black shadow-xl border border-purple-400/70 shadow-purple-500/20' 
                : 'text-purple-300 hover:bg-purple-900/30 hover:text-purple-100 border border-purple-700/30 hover:border-purple-500/50'
            }`}
          >
            {activeSection === 'settings' && <div className="absolute inset-0 bg-purple-400/10 animate-pulse"></div>}
            <span className="text-2xl filter drop-shadow-lg">⚙️</span>
            <div className="relative z-10">
              <div className="text-base font-black tracking-wide">SETTINGS</div>
              <div className={`text-xs font-mono ${activeSection === 'settings' ? 'text-purple-900' : 'text-purple-400/80'}`}>
                {'// system_configuration'}
              </div>
            </div>
            {activeSection === 'settings' && (
              <div className="ml-auto text-purple-900 animate-bounce">{'>'}</div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveSection('resources')} 
            className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-left transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
              activeSection === 'resources' 
                ? 'bg-gradient-to-r from-amber-600/80 to-amber-500/80 text-black shadow-xl border border-amber-400/70 shadow-amber-500/20' 
                : 'text-amber-300 hover:bg-amber-900/30 hover:text-amber-100 border border-amber-700/30 hover:border-amber-500/50'
            }`}
          >
            {activeSection === 'resources' && <div className="absolute inset-0 bg-amber-400/10 animate-pulse"></div>}
            <span className="text-2xl filter drop-shadow-lg">📚</span>
            <div className="relative z-10">
              <div className="text-base font-black tracking-wide">RESOURCES</div>
              <div className={`text-xs font-mono ${activeSection === 'resources' ? 'text-amber-900' : 'text-amber-400/80'}`}>
                {'// study_materials'}
              </div>
            </div>
            {activeSection === 'resources' && (
              <div className="ml-auto text-amber-900 animate-bounce">{'>'}</div>
            )}
          </button>
        </nav>

        {/* Cyberpunk Stats Display */}
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg border border-green-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-400/5 animate-pulse"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-green-300 text-sm font-bold font-mono">ACTIVE_HACKERS</span>
                <div className="text-xs text-green-500 font-mono mt-1">{'// authenticated_users'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-green-400 tabular-nums">{String(facilitators.length).padStart(2, '0')}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-lg border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-cyan-300 text-sm font-bold font-mono">OPERATIONS</span>
                <div className="text-xs text-cyan-500 font-mono mt-1">{'// scheduled_missions'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-cyan-400 tabular-nums">{String(timetable.length).padStart(2, '0')}</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm font-bold font-mono">SYSTEM_STATUS</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-mono">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />
        
        {/* Hacker Footer */}
        <div className="pt-6 border-t border-green-700/30">
          <div className="text-center space-y-2">
            <div className="text-xs text-green-500 font-mono">
              root@ceh-admin:~$ uptime
            </div>
            <div className="text-xs text-green-400/80 font-mono">
              {new Date().getFullYear()} - SECURE_CONNECTION_ESTABLISHED
            </div>
            <div className="text-xs text-green-600/60 font-mono">
              {'// Ethical.Hacking.Control.Panel.v3.7.2'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content with Cyberpunk Enhancement - Adjusted for fixed sidebar */}
      <main className="flex-1 bg-gradient-to-br from-slate-950 via-green-950/10 to-slate-900 min-h-screen ml-80">
        {/* Enhanced Cyberpunk Top Bar - Made Sticky */}
        <div className="fixed top-0 left-80 right-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-green-500/30 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-cyan-400/5 animate-pulse"></div>
          <div className="px-8 py-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 drop-shadow-lg font-mono tracking-wide">
                {'<CEH_TERMINAL/>'}
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-3 h-8 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
                <div className="w-1 h-8 bg-cyan-400 rounded-full shadow-lg animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-2 h-8 bg-green-400 rounded-full shadow-lg animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-green-600/40 to-cyan-600/40 border border-green-500/40 rounded-xl backdrop-blur-sm shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span className="text-green-200 font-bold text-sm font-mono">
                    {activeSection === 'facilitators' ? '[OPERATORS_MODE]' : 
                     activeSection === 'timetable' ? '[MISSIONS_MODE]' : '[SETTINGS_MODE]'}
                  </span>
                </div>
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <span className="text-black font-black text-lg">🔒</span>
                <div className="absolute inset-0 bg-green-400/20 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 relative pt-24">
          {/* ASCII Art Header */}
          <div className="mb-8 p-4 bg-slate-950/80 border border-green-500/30 rounded-2xl font-mono text-green-400 text-xs overflow-x-auto">
            <pre className="whitespace-pre">
{`╭──────────────────────────────────────────────────────╮
│   ██████╗███████╗██╗  ██╗    ██████╗  █████╗ ███████╗│
│  ██╔════╝██╔════╝██║  ██║    ██╔══██╗██╔══██╗██╔════╝│
│  ██║     █████╗  ███████║    ██║  ██║███████║█████╗  │
│  ██║     ██╔══╝  ██╔══██║    ██║  ██║██╔══██║██╔══╝  │
│  ╚██████╗███████╗██║  ██║    ██████╔╝██║  ██║███████╗│
│   ╚═════╝╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝│
│                CERTIFIED ETHICAL HACKER                │
│              >> ADMINISTRATIVE INTERFACE <<            │
╰──────────────────────────────────────────────────────╯`}
            </pre>
            <div className="mt-2 text-center">
              <span className="text-green-300">STATUS: </span>
              <span className="text-green-400 animate-pulse">🟢 SYSTEM ONLINE</span>
              <span className="text-green-300 ml-4">USER: </span>
              <span className="text-cyan-400">root@ceh-admin</span>
              <span className="text-green-300 ml-4">SESSION: </span>
              <span className="text-yellow-400">AUTHENTICATED</span>
            </div>
          </div>
          {activeSection === 'facilitators' && (
            <section className="max-w-5xl mx-auto">
              {/* Enhanced Cyberpunk Facilitators Section */}
              <div className="bg-slate-950/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-500/30 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-cyan-400/5 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl relative">
                      <span className="text-4xl filter drop-shadow-lg">�‍💻</span>
                      <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping"></div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 font-mono">
                        OPERATOR.CONTROL
                      </h2>
                      <p className="text-green-400 mt-2 font-mono text-lg">{'// manage.authenticated.hackers'}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-mono text-sm">SECURE_ACCESS</span>
                    </div>
                  </div>

                  {/* Enhanced Add Facilitator Section */}
                  <div className="mb-10 p-6 bg-gradient-to-r from-green-900/40 to-cyan-900/40 rounded-2xl border border-green-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-400/5 animate-pulse"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-green-200 mb-4 flex items-center gap-3 font-mono">
                        <span className="text-2xl">⚡</span>
                        ADD_NEW.OPERATOR
                      </h3>
                      <form onSubmit={addFacilitator} className="flex gap-4">
                        <input
                          type="text"
                          value={newMember}
                          onChange={handleInput}
                          placeholder="root@hacker:~$ Enter operator name..."
                          className="flex-1 px-5 py-4 bg-slate-950/70 border border-green-400/40 rounded-xl text-green-100 placeholder-green-500/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all backdrop-blur-sm font-mono"
                        />
                        <button 
                          type="submit" 
                          className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-black font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-mono tracking-wide"
                        >
                          AUTHENTICATE
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Terminal Loading Indicator */}
                  {isLoading && (
                    <div className="mb-6 p-4 bg-slate-950/80 border border-green-500/40 rounded-xl text-green-300 flex items-center gap-3 font-mono backdrop-blur-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="font-bold">PROCESSING...</span>
                      <span className="text-green-400 animate-pulse">█</span>
                    </div>
                  )}

                  {/* Enhanced Status Messages */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-3 font-mono backdrop-blur-sm">
                      <span className="text-2xl animate-pulse">🚨</span>
                      <div>
                        <div className="font-bold">ERROR:</div>
                        <div>{error}</div>
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="mb-6 p-4 bg-green-900/40 border border-green-500/50 rounded-xl text-green-300 flex items-center gap-3 font-mono backdrop-blur-sm">
                      <span className="text-2xl animate-bounce">✅</span>
                      <div>
                        <div className="font-bold">SUCCESS:</div>
                        <div>{success}</div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Facilitators List */}
                  <div className="space-y-4">
                    {facilitators.length === 0 ? (
                      <div className="text-center py-16 relative">
                        <div className="absolute inset-0 bg-red-900/10 rounded-2xl animate-pulse"></div>
                        <div className="relative z-10">
                          <div className="mb-8 p-4 bg-slate-950/80 border border-red-500/40 rounded-xl font-mono text-red-400 text-sm">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-red-500 animate-pulse">🚨</span>
                              <span className="font-bold">SYSTEM ALERT</span>
                              <span className="text-red-500 animate-pulse">🚨</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div>root@ceh-admin:~$ ls /var/lib/operators/</div>
                              <div className="text-red-300">ls: cannot access &apos;/var/lib/operators/&apos;: No such file or directory</div>
                              <div className="text-red-400">ERROR: No authenticated operators found in database</div>
                              <div className="text-yellow-400 mt-2">SOLUTION: Initialize first operator below ↓</div>
                            </div>
                          </div>
                          <span className="text-8xl mb-6 block filter grayscale opacity-50">👨‍💻</span>
                          <h3 className="text-3xl font-black text-red-400 mb-3 font-mono tracking-wide">
                            ACCESS_DENIED
                          </h3>
                          <p className="text-red-300 text-lg mb-2 font-mono">
                            {'// database.operators.count = 0'}
                          </p>
                          <p className="text-red-500/80 text-sm font-mono mb-6">
                            Initialize first authenticated user above to continue...
                          </p>
                          <div className="flex justify-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      facilitators.map((f, index) => (
                        <div key={f.id} className="group p-5 bg-slate-800/40 hover:bg-slate-700/60 border border-green-600/30 hover:border-green-400/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                          {editingId === f.id ? (
                            <form onSubmit={updateFacilitator} className="flex items-center gap-4 relative z-10">
                              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-lg">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="flex-1 px-4 py-3 bg-slate-900/70 border border-amber-400/50 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                              />
                              <button 
                                type="submit" 
                                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-black rounded-lg shadow-md hover:shadow-lg transition-all font-mono"
                              >
                                SAVE
                              </button>
                              <button 
                                type="button" 
                                onClick={cancelEdit} 
                                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-all font-mono"
                              >
                                ABORT
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-5 relative z-10">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-lg">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-black text-green-100 text-xl font-mono">{f.name}</span>
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-green-400/80 text-sm font-mono">ID:{String(f.id).padStart(4, '0')} | STATUS:ACTIVE | CLEARANCE:ADMIN</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEdit(f)}
                                  className="p-3 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-all border border-amber-600/30 hover:border-amber-400/50"
                                  title="Modify operator"
                                >
                                  <span className="text-lg">⚡</span>
                                </button>
                                <button
                                  onClick={() => deleteFacilitator(f.id)}
                                  className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all border border-red-600/30 hover:border-red-400/50"
                                  title="Terminate access"
                                >
                                  <span className="text-lg">�</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeSection === 'timetable' && (
            <section className="max-w-6xl mx-auto">
              {/* Enhanced Timetable Section */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-3xl">📅</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Schedule Management</h2>
                      <p className="text-slate-400 mt-1">Manage CEH study group timetable</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setShowAddModal(true); setEditingEntryId(null); setEditEntry({ week: '', title: '', details: '' }); }} 
                    className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3"
                  >
                    <span className="text-xl">✨</span>
                    <span>Add to Schedule</span>
                  </button>
                </div>

                {/* Enhanced Modal */}
                <Modal open={showAddModal || editingEntryId !== null} onClose={() => { setShowAddModal(false); cancelEditEntry(); }}>
                  <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{editingEntryId ? 'Edit Schedule' : 'Add New Session'}</h3>
                        <p className="text-slate-400">Manage CEH study session details</p>
                      </div>
                    </div>

                    <form onSubmit={editingEntryId ? updateTimetableEntry : addTimetableEntry} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-purple-300 mb-2">Week Period</label>
                        <input
                          type="text"
                          name="week"
                          value={editingEntryId ? editEntry.week : newEntry.week}
                          onChange={editingEntryId ? (e) => setEditEntry({ ...editEntry, week: e.target.value }) : handleEntryInput}
                          placeholder="e.g., Week 1 (June 10–15)"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-purple-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-purple-300 mb-2">Session Title</label>
                        <input
                          type="text"
                          name="title"
                          value={editingEntryId ? editEntry.title : newEntry.title}
                          onChange={editingEntryId ? (e) => setEditEntry({ ...editEntry, title: e.target.value }) : handleEntryInput}
                          placeholder="e.g., Domain 1: Information Security Overview"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-purple-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-purple-300 mb-2">Session Details</label>
                        <textarea
                          name="details"
                          value={editingEntryId ? editEntry.details : newEntry.details}
                          onChange={editingEntryId ? (e) => setEditEntry({ ...editEntry, details: e.target.value }) : handleEntryInput}
                          placeholder="Enter details, one per line:&#10;Concepts: InfoSec fundamentals&#10;Tools: Terminology, hacker types&#10;Lab: Set up environment"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-purple-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                          required
                          rows={5}
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button 
                          type="submit" 
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          {editingEntryId ? "💾 Save Changes" : "✨ Add Session"}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setShowAddModal(false); cancelEditEntry(); }} 
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </Modal>

                {/* Status Messages */}
                {ttLoading && (
                  <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-300 flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">⏳</span>
                    <span className="font-medium">Loading timetable...</span>
                  </div>
                )}
                {ttError && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <span className="font-medium">{ttError}</span>
                  </div>
                )}
                {ttSuccess && (
                  <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="font-medium">{ttSuccess}</span>
                  </div>
                )}

                {/* Enhanced Timetable List */}
                <div className="space-y-4">
                  {timetable.length === 0 && !ttLoading ? (
                    <div className="text-center py-16">
                      <span className="text-8xl mb-6 block">📅</span>
                      <h3 className="text-2xl font-bold text-slate-300 mb-2">No schedule entries yet</h3>
                      <p className="text-slate-400 text-lg mb-6">Start building your CEH study schedule!</p>
                      <button 
                        onClick={() => { setShowAddModal(true); setEditingEntryId(null); setEditEntry({ week: '', title: '', details: '' }); }} 
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        ✨ Add First Session
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {timetable.map((entry, index) => (
                        <div key={entry.id} className="group p-6 bg-gradient-to-r from-slate-700/30 to-slate-800/30 hover:from-slate-700/50 hover:to-slate-800/50 border border-slate-600/30 hover:border-purple-500/30 rounded-2xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium">
                                    {entry.week}
                                  </span>
                                </div>
                                <h3 className="font-bold text-xl text-white mb-3 leading-tight">{entry.title}</h3>
                                <div className="space-y-1">
                                  {entry.details.map((detail, i) => (
                                    <div key={i} className="flex items-start gap-2 text-slate-300">
                                      <span className="text-purple-400 mt-1 text-xs">▸</span>
                                      <span className="text-sm leading-relaxed">{detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => { setEditingEntryId(entry.id); setEditEntry({ week: entry.week, title: entry.title, details: entry.details.join('\n') }); setShowAddModal(false); }}
                                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-all"
                                title="Edit session"
                              >
                                <span className="text-lg">✏️</span>
                              </button>
                              <button
                                onClick={() => deleteTimetableEntry(entry.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                                title="Delete session"
                              >
                                <span className="text-lg">🗑️</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <section className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-purple-900/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-purple-500/5 animate-pulse"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-400">
                        SYSTEM CONFIGURATION
                      </h2>
                      <p className="text-purple-400/80 text-sm font-mono">
                        {'// manage_application_settings'}
                      </p>
                    </div>
                  </div>
                </div>

                {settingsError && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-xl">
                    <p className="text-red-300 text-sm">{settingsError}</p>
                  </div>
                )}

                {settingsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    <p className="text-purple-400 mt-4 font-mono">LOADING_SETTINGS...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settings.map((setting) => (
                      <div key={setting.key} className="bg-black/40 rounded-xl border border-purple-500/20 p-6 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-purple-200 font-mono uppercase">
                                {setting.key.replace(/_/g, ' ')}
                              </h3>
                              {setting.key === 'meeting_time' && (
                                <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-xs text-purple-300 font-mono">
                                  TIME_CONFIG
                                </span>
                              )}
                            </div>
                            <p className="text-purple-400/70 text-sm mb-4 font-mono">
                              {setting.description}
                            </p>
                            
                            {editingSetting === setting.key ? (
                              <div className="flex gap-3">
                                {setting.key === 'meeting_time' ? (
                                  <input
                                    type="time"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="flex-1 p-3 bg-black/60 border border-purple-500/40 rounded-lg text-purple-200 font-mono focus:border-purple-400 focus:outline-none"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="flex-1 p-3 bg-black/60 border border-purple-500/40 rounded-lg text-purple-200 font-mono focus:border-purple-400 focus:outline-none"
                                    placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                                  />
                                )}
                                <button
                                  onClick={() => updateSetting(setting.key, editingValue)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelSettingEdit}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-all"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-bold text-purple-100 font-mono">
                                    {setting.key === 'meeting_time' 
                                      ? formatTimeForDisplay(setting.value) 
                                      : setting.value
                                    }
                                  </span>
                                  {setting.key === 'meeting_time' && (
                                    <span className="text-purple-400 text-sm font-mono">
                                      ({setting.value} 24h format)
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => startSettingEdit(setting.key, setting.value)}
                                  className="px-4 py-2 bg-purple-600/40 hover:bg-purple-500/60 text-purple-200 rounded-lg font-bold transition-all border border-purple-500/30"
                                >
                                  EDIT
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        {/* RESOURCES SECTION */}
        {activeSection === 'resources' && (
          <section className="mb-10 p-4">
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/10 rounded-3xl p-6 border border-amber-700/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-300">CEH Study Materials</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-amber-600/40 hover:bg-amber-500/60 text-amber-200 rounded-lg font-bold transition-all border border-amber-500/30"
                >
                  ADD NEW RESOURCE
                </button>
              </div>
              
              {error && (
                <div className="p-4 mb-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="p-4 mb-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400">{success}</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="terminal-loading text-amber-400">LOADING RESOURCES...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.length === 0 ? (
                    <p className="text-amber-400 text-center p-8">No study materials have been added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resources.map(resource => (
                        <div key={resource.id} className="bg-black/50 border border-amber-700/30 rounded-xl p-5 shadow-md hover:shadow-amber-600/20 hover:border-amber-600/40 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-amber-300 mb-1">
                              {resource.type === 'uploaded-pdf' ? '📄 ' : resource.type === 'pdf' ? '🔗📄 ' : '🔗 '}
                              {resource.title}
                            </h3>
                            <span className="px-2 py-1 text-xs rounded bg-amber-900/50 text-amber-300 border border-amber-700/30">
                              {resource.type === 'uploaded-pdf' ? 'UPLOADED PDF' : resource.type.toUpperCase()}
                            </span>
                          </div>
                          
                          {resource.description && (
                            <p className="text-amber-200 mb-3">{resource.description}</p>
                          )}
                          
                          <div className="text-amber-400 font-mono text-sm mb-2 truncate">
                            {resource.url}
                          </div>
                          
                          {resource.fileSize && (
                            <div className="text-amber-400/70 text-xs mb-2">
                              File size: {(resource.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <a 
                              href={resource.url || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-amber-300 hover:text-amber-200 underline flex items-center"
                            >
                              <span className="mr-1">
                                {resource.type === 'uploaded-pdf' ? 'Download' : 'Preview'}
                              </span> <span className="text-xs">↗</span>
                            </a>
                            <button 
                              onClick={() => deleteResource(resource.id)}
                              className="text-red-400 hover:text-red-300 flex items-center"
                            >
                              <span className="mr-1">Delete</span> <span>×</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Resource Modal */}
            <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-amber-300 mb-4">Add Study Material</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-amber-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-3 py-2 bg-black text-amber-200 border border-amber-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="CEH v12 Study Guide"
                      value={newResource.title}
                      onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-amber-300 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 bg-black text-amber-200 border border-amber-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Official study guide with practice exams..."
                      value={newResource.description}
                      onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-amber-300 mb-1">
                      Resource Type
                    </label>
                    <div className="flex space-x-4 flex-wrap">
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="radio"
                          className="form-radio text-amber-600"
                          name="resourceType"
                          value="uploaded-pdf"
                          checked={newResource.type === "uploaded-pdf"}
                          onChange={() => setNewResource({...newResource, type: "uploaded-pdf", url: ""})}
                        />
                        <span className="ml-2 text-amber-200">Upload PDF</span>
                      </label>
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="radio"
                          className="form-radio text-amber-600"
                          name="resourceType"
                          value="pdf"
                          checked={newResource.type === "pdf"}
                          onChange={() => setNewResource({...newResource, type: "pdf", url: ""})}
                        />
                        <span className="ml-2 text-amber-200">External PDF Link</span>
                      </label>
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="radio"
                          className="form-radio text-amber-600"
                          name="resourceType"
                          value="link"
                          checked={newResource.type === "link"}
                          onChange={() => setNewResource({...newResource, type: "link", url: ""})}
                        />
                        <span className="ml-2 text-amber-200">External Link</span>
                      </label>
                    </div>
                  </div>
                  
                  {newResource.type === "uploaded-pdf" ? (
                    <div>
                      <label htmlFor="fileUpload" className="block text-sm font-medium text-amber-300 mb-1">
                        PDF File (max 5MB)
                      </label>
                      <input
                        type="file"
                        id="fileUpload"
                        accept=".pdf"
                        className="w-full px-3 py-2 bg-black text-amber-200 border border-amber-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        onChange={handleFileChange}
                      />
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-amber-500 h-2.5 rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-amber-400 mt-1 text-right">{uploadProgress}% uploaded</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-amber-300 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        id="url"
                        className="w-full px-3 py-2 bg-black text-amber-200 border border-amber-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder={newResource.type === "pdf" ? "https://example.com/ceh-guide.pdf" : "https://example.com/ceh-resources"}
                        value={newResource.url}
                        onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addResource}
                      className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
                      disabled={
                        !newResource.title || 
                        ((newResource.type === 'pdf' || newResource.type === 'link') && !newResource.url) ||
                        (newResource.type === 'uploaded-pdf' && !newResource.url)
                      }
                    >
                      Add Resource
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </section>
        )}
      </main>
    </div>
  );
  
  async function fetchResources() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error('Fetch resources error:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function addResource() {
    setError(null);
    setSuccess(null);
    
    // Validate based on type
    if (newResource.type === 'uploaded-pdf') {
      if (!newResource.title || !newResource.url) {
        setError('Please upload a PDF file and provide a title');
        return;
      }
    } else if (!newResource.title || !newResource.url) {
      setError('Title and URL are required');
      return;
    }
    
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add resource');
      }
      
      // Reset form and close modal
      setNewResource({
        title: '',
        description: '',
        type: 'link',
        url: '',
        fileSize: null,
        isUploadedFile: false
      });
      setUploadProgress(0);
      setShowAddModal(false);
      
      // Refresh resources list
      fetchResources();
      setSuccess('Resource added successfully');
    } catch (err) {
      console.error('Add resource error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    }
  }
  
  async function deleteResource(id: number) {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete resource');
      
      // Refresh resources list
      fetchResources();
      setSuccess('Resource deleted successfully');
    } catch (err) {
      console.error('Delete resource error:', err);
      setError('Failed to delete resource');
    }
  }
}
