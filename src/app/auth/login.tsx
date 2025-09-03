"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import "../cyberpunk.css";

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // If already authenticated, redirect to admin
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl cyberpunk-glow">
          LOADING...
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (pin.length !== 5 || !/^\d{5}$/.test(pin)) {
      setError('PIN must be exactly 5 digits');
      return;
    }

    const success = login(pin);
    if (!success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Invalid PIN. Attempt ${newAttempts}/3`);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setError('Access denied. Too many failed attempts.');
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          setError('');
        }, 30000); // 30 second lockout
      }
      setPin('');
    } else {
      // Successful login - redirect will happen via useEffect
      router.push('/admin');
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setPin(value);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 text-white font-mono antialiased relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full animate-pulse"></div>
        <div className="absolute top-20 left-40 w-full h-full animate-pulse"></div>
      </div>

      {/* Back to Landing Page */}
      <Link 
        href="/"
        className="fixed top-6 left-6 z-50 px-4 py-2 bg-gradient-to-r from-green-600/40 to-cyan-600/40 border border-green-500/40 rounded-xl backdrop-blur-sm shadow-lg hover:from-green-500/50 hover:to-cyan-500/50 transition-all flex items-center gap-2"
      >
        <span className="text-xl">🏠</span>
        <span className="text-green-200 font-bold text-sm">RETURN.HOME</span>
      </Link>

      <div className="w-full max-w-md p-8">
        {/* Login Terminal */}
        <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-orange-400/5 animate-pulse"></div>
          
          {/* Terminal Header */}
          <div className="relative z-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl relative">
                <span className="text-3xl">🔐</span>
                <div className="absolute inset-0 bg-red-400/20 rounded-2xl animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-orange-300">
                  ACCESS.CONTROL
                </h1>
                <p className="text-red-400 font-mono text-sm">{'// admin.authentication.required'}</p>
              </div>
            </div>

            {/* ASCII Warning */}
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl font-mono text-red-400 text-xs text-center">
              <pre className="whitespace-pre">
{`⚠️  RESTRICTED AREA  ⚠️
    AUTHORIZED PERSONNEL ONLY
    5-DIGIT PIN REQUIRED`}
              </pre>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div>
              <label className="block text-red-300 text-sm font-bold mb-2 font-mono">
                ADMIN.PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="Enter 5-digit PIN..."
                  disabled={isLocked}
                  className={`w-full px-4 py-4 bg-slate-900/70 border rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 transition-all ${
                    isLocked 
                      ? 'border-red-700/50 text-red-500 cursor-not-allowed' 
                      : 'border-red-400/50 text-red-100 focus:ring-red-400 focus:border-red-400'
                  }`}
                  maxLength={5}
                  autoComplete="off"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-500' : pin.length === 5 ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-lg">🚨</span>
                  <span className="text-red-300 font-mono text-sm font-bold">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 5 || isLocked}
              className={`w-full px-6 py-4 rounded-xl font-mono font-black text-lg transition-all duration-200 transform ${
                pin.length === 5 && !isLocked
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLocked ? (
                <div className="flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>ACCESS_DENIED</span>
                </div>
              ) : pin.length === 5 ? (
                <div className="flex items-center justify-center gap-2">
                  <span>🔓</span>
                  <span>AUTHENTICATE</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>⏳</span>
                  <span>ENTER_PIN</span>
                </div>
              )}
            </button>
          </form>

          {/* System Info */}
          <div className="relative z-10 mt-8 pt-6 border-t border-red-700/30">
            <div className="text-center space-y-2 text-xs font-mono">
              <div className="text-red-500">SECURITY.LEVEL: MAXIMUM</div>
              <div className="text-red-400">ATTEMPTS: {attempts}/3</div>
              <div className="text-red-600/60">{'© 2025 CEH.ADMIN.TERMINAL'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
