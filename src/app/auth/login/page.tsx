"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import "../../cyberpunk.css";

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
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 5) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Matrix rain background effect */}
      <div className="matrix-rain"></div>
      
      {/* Cyberpunk grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Back to Landing Page */}
      <Link 
        href="/"
        className="fixed top-6 left-6 z-50 px-4 py-2 bg-gradient-to-r from-green-600/40 to-cyan-600/40 border border-green-500/40 rounded-xl backdrop-blur-sm shadow-lg hover:from-green-500/50 hover:to-cyan-500/50 transition-all flex items-center gap-2"
      >
        <span className="text-xl">🏠</span>
        <span className="text-green-200 font-bold text-sm">RETURN.HOME</span>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative">
                <span className="text-4xl animate-pulse">🔒</span>
                <div className="absolute inset-0 bg-green-400/20 rounded-3xl animate-ping"></div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-2 glitch-text">
              SECURE ACCESS
            </h1>
            <p className="text-green-400/80 text-sm font-mono">
              {'// ENTER_5_DIGIT_AUTHORIZATION_CODE'}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-gradient-to-br from-slate-800/50 via-black/70 to-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10">
              {/* PIN Input */}
              <div className="mb-6">
                <label className="block text-green-300 text-sm font-bold mb-3 font-mono">
                  AUTHORIZATION PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  maxLength={5}
                  className="w-full p-4 bg-black/60 border-2 border-green-500/40 rounded-xl text-green-300 text-center text-2xl font-mono tracking-widest focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50"
                  placeholder="●●●●●"
                  disabled={isLocked}
                />
                
                {/* PIN dots indicator */}
                <div className="flex justify-center gap-2 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i < pin.length 
                          ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                          : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded-xl">
                  <p className="text-red-300 text-sm font-mono text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLocked || pin.length !== 5}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg relative overflow-hidden"
              >
                <span className="relative z-10">
                  {isLocked ? 'SYSTEM LOCKED' : 'AUTHENTICATE'}
                </span>
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs font-mono">
                  Security Level: <span className="text-green-400">MAXIMUM</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {attempts > 0 && !isLocked && `Failed attempts: ${attempts}/3`}
                  {isLocked && 'System locked for 30 seconds'}
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs font-mono">
              CEH.ADMIN_v3.7.2 | AUTHORIZED_PERSONNEL_ONLY
            </p>
          </div>
        </div>
      </div>

      {/* Scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>
  );
}
