
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const isAdmin = email.endsWith('@vertragcheck.de');
      onLogin({
        email,
        role: isAdmin ? 'admin' : 'user',
        accessLevel: 'free'
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
        <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

      <div className="w-full max-w-lg relative z-10 space-y-16 animate-in fade-in zoom-in duration-1000">
        <div className="text-center space-y-8">
           <div className="w-20 h-20 bg-white text-slate-950 flex items-center justify-center mx-auto rounded-sm mb-12 shadow-2xl">
              <span className="brand-font font-black text-4xl tracking-tighter">C</span>
           </div>
           <h1 className="text-white text-hero brand-font text-5xl md:text-7xl">
             ENTER <br /> THE <span className="opacity-30">COMPASS.</span>
           </h1>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.5em]">Identity verification required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-1">Mission Identifier</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-8 py-6 text-white outline-none focus:border-white/40 transition-all font-medium rounded-sm"
              placeholder="EMAIL@ACCESS.COM"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-1">Security Token</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-8 py-6 text-white outline-none focus:border-white/40 transition-all font-medium rounded-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-slate-950 font-black py-8 text-xs uppercase tracking-[0.4em] hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center rounded-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'INITIALIZE CONNECTION'
            )}
          </button>
        </form>

        <div className="pt-12 flex items-center justify-between border-t border-white/5">
           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Protocol v4.2.1</span>
           <div className="flex space-x-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
