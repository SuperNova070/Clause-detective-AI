
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showDemoPopup, setShowDemoPopup] = useState(false);

  const GOOGLE_CLIENT_ID = "YOUR_REAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            use_fedcm_for_prompt: false, 
          });
          setGoogleInitialized(true);
        } catch (e) {
          console.warn("Google Identity Services failed to initialize.", e);
        }
      }
    };

    if ((window as any).google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
    setIsLoading(true);
    const userObject = decodeJwt(response.credential);
    if (userObject) {
      setTimeout(() => {
        onLogin({
          email: userObject.email,
          role: userObject.email.endsWith('@vertragcheck.de') ? 'admin' : 'user',
          accessLevel: 'free'
        });
        setIsLoading(false);
      }, 800);
    } else {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const isRealId = GOOGLE_CLIENT_ID !== "YOUR_REAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
    if (googleInitialized && isRealId) {
      (window as any).google.accounts.id.prompt();
    } else {
      setShowDemoPopup(true);
    }
  };

  const handleDemoLogin = () => {
    setShowDemoPopup(false);
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        email: "alex.immigrant@gmail.com",
        role: 'user',
        accessLevel: 'free'
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const isAdmin = email.endsWith('@vertragcheck.de');
      onLogin({
        email,
        role: isAdmin ? 'admin' : 'user',
        adminRole: isAdmin ? (email.startsWith('super') ? 'super_admin' : 'admin') : undefined,
        accessLevel: 'free'
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F2ED] relative font-sans">
      {/* Background Layer consistent with main app */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="" />
      </div>

      {showDemoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-sm flex items-center justify-center text-white font-black text-xl">C</div>
              </div>
              <h2 className="brand-font text-xl font-bold text-center text-slate-900 mb-2 uppercase tracking-widest">Sign in with Google</h2>
              <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest mb-8">Access Clause Navigator AI</p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleDemoLogin}
                  className="w-full flex items-center p-4 border border-slate-100 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-8 h-8 bg-slate-100 flex items-center justify-center font-bold mr-3 rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-colors text-[10px]">AI</div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Alex Immigrant</p>
                    <p className="text-[10px] text-slate-400 font-medium">alex.immigrant@gmail.com</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Secure Handshake</p>
              <button onClick={() => setShowDemoPopup(false)} className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Content Side (Visual) */}
      <div className="hidden md:flex md:w-1/2 p-12 lg:p-20 flex-col justify-between relative z-10 overflow-hidden">
        <div className="space-y-6">
          <div className="brand-font font-black text-2xl tracking-tighter flex items-center space-x-2">
            <span className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-sm">C</span>
            <span>CLAUSE.</span>
          </div>
          <h2 className="brand-font text-6xl lg:text-7xl font-black leading-none tracking-tighter text-slate-950">
            NAVIGATE <br />
            <span className="opacity-30">FREELY.</span>
          </h2>
        </div>
        
        <div className="max-w-xs space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-relaxed">
            The premium intelligence platform for international residents in Berlin.
          </p>
          <div className="h-0.5 w-12 bg-slate-950"></div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-sm w-full space-y-8 bg-white p-10 lg:p-12 scout-card shadow-2xl">
          <div className="space-y-2">
            <h3 className="brand-font text-3xl font-black text-slate-950 tracking-tight uppercase">
              {isLogin ? 'Welcome back' : 'Join the mission'}
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Personnel Identification Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Station Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-950 transition-all outline-none font-medium text-slate-700 text-xs"
                placeholder="USER@DOMAIN.COM"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Access Token</label>
                {isLogin && <button type="button" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950">Recovery?</button>}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-950 transition-all outline-none font-medium text-slate-700 text-xs"
                placeholder="••••••••"
              />
            </div>

            {/* FIXED HIGH-CONTRAST BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 text-white font-black py-5 shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center uppercase text-[11px] tracking-[0.25em]"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isLogin ? 'Initiate Log In' : 'Create Credentials'
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-black"><span className="px-4 bg-white text-slate-300">Alternate Connection</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleClick}
            className="w-full border border-slate-100 text-slate-900 font-black py-4 hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] uppercase text-[10px] tracking-widest"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Network</span>
          </button>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isLogin ? "New Explorer?" : "Existing operative?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 font-black text-slate-950 underline underline-offset-4 decoration-slate-200">
              {isLogin ? 'Join Here' : 'Log In'}
            </button>
          </p>

          <div className="pt-4 flex justify-center">
             <div className="bg-slate-50 px-4 py-2 border border-slate-100 flex items-center space-x-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Admin:</span>
                <code className="text-[9px] text-slate-900 font-mono">admin@vertragcheck.de</code>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
