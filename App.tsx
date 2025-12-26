
import React, { useState, useRef, useEffect } from 'react';
import { analyzeContract } from './services/geminiService';
import { AccessLevel, UserProfile, ConsultationSlot } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import PaymentGate from './components/PaymentGate';
import { jsPDF } from 'jspdf';

type InputMode = 'text' | 'file';
type ViewMode = 'user' | 'admin';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [contractText, setContractText] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('free');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setAccessLevel(authenticatedUser.accessLevel);
    if (authenticatedUser.role === 'admin') setViewMode('admin');
  };

  const handleLogout = () => {
    setUser(null);
    handleClear();
  };

  const handleAnalyze = async () => {
    const input = inputMode === 'text' ? contractText : contractFile;
    if (!input) {
      setError(inputMode === 'text' ? "Awaiting your text input..." : "Upload document to proceed.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeContract(input, accessLevel);
      setAnalysis(result);
      setTimeout(() => {
        document.getElementById('result-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err: any) {
      setError("Intelligence scan interrupted. Check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setContractText('');
    setContractFile(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) return <Auth onLogin={handleLogin} />;
  if (user.role === 'admin' && viewMode === 'admin') return <AdminDashboard user={user} />;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* SCOUT-STYLE HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'glass-nav py-4' : 'py-10'}`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-16">
            <div className="brand-font font-black text-2xl tracking-tighter flex items-center space-x-3">
              <span className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-sm text-sm">C</span>
              <span>CLAUSE<span className="opacity-20">.</span></span>
            </div>
            <nav className="hidden lg:flex space-x-12 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
              <a href="#" className="hover:opacity-100 transition-opacity">Navigator</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Expert Hub</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Our Mission</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-10">
            {accessLevel === 'free' && (
              <button 
                onClick={() => setShowPaymentGate(true)}
                className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-950 pb-1 hover:opacity-50 transition-opacity"
              >
                Deep Audit Package
              </button>
            )}
            <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
              Exit Station
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Increased PT for header clearance */}
      <section className="pt-64 md:pt-80 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-end">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <h1 className="text-hero brand-font">
              FREEDOM <br />
              <span className="opacity-20 font-light italic">TO</span> <br />
              EXPLORE.
            </h1>
            <p className="max-w-md text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              Legal navigation doesn't have to be a struggle. CLAUSE provides the map, the terrain data, and the confidence to sign.
            </p>
          </div>
          <div className="flex flex-col space-y-8 lg:items-end animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
             <div className="w-full lg:max-w-md aspect-[16/10] bg-slate-200 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer shadow-2xl">
               <img src="https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Explorer View" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Coordinates: Berlin, DE // 52.5200° N</p>
          </div>
        </div>
      </section>

      {/* ACTION CONSOLE */}
      <main className="max-w-[1600px] mx-auto w-full px-6 md:px-12 pb-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CONTROL PANEL */}
          <div className="lg:col-span-5 space-y-8">
            <div className="scout-card p-12 flex flex-col min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-16 relative z-10">
                <div className="flex space-x-10 text-[10px] font-bold uppercase tracking-[0.3em]">
                  <button 
                    onClick={() => setInputMode('file')}
                    className={`pb-2 border-b-2 transition-all ${inputMode === 'file' ? 'border-slate-900' : 'border-transparent text-slate-300'}`}
                  >
                    Satellite Scan
                  </button>
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`pb-2 border-b-2 transition-all ${inputMode === 'text' ? 'border-slate-900' : 'border-transparent text-slate-300'}`}
                  >
                    Direct Feed
                  </button>
                </div>
                { (contractFile || contractText) && (
                  <button onClick={handleClear} className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:scale-105 transition-transform">Reset Console</button>
                )}
              </div>

              <div className="flex-1 relative z-10">
                {isLoading && <div className="scan-line"></div>}
                {inputMode === 'file' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-full w-full border border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white transition-all group`}
                  >
                    <input type="file" ref={fileInputRef} onChange={(e) => setContractFile(e.target.files?.[0] || null)} accept=".pdf" className="hidden" />
                    {contractFile ? (
                      <div className="animate-in zoom-in duration-500">
                        <svg className="w-20 h-20 text-slate-900 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="font-black text-2xl tracking-tighter mb-2">{contractFile.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Data Link Established</p>
                      </div>
                    ) : (
                      <div className="group-hover:scale-105 transition-transform duration-700">
                        <div className="w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-sm mx-auto mb-8">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <p className="brand-font text-lg font-bold tracking-widest text-slate-400">LOAD MISSION DATA</p>
                        <p className="text-[10px] text-slate-300 mt-4 tracking-widest">PDF FORMAT | MAX 20MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder="PASTE INTEL HERE..."
                    className="w-full h-full p-12 bg-slate-50/30 border border-slate-100 focus:bg-white focus:border-slate-900 outline-none text-base font-medium leading-relaxed resize-none transition-all placeholder:text-slate-200"
                  ></textarea>
                )}
              </div>

              <div className="mt-12 relative z-10">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full scout-button flex items-center justify-center disabled:opacity-40"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-4">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>TRANSMITTING...</span>
                    </span>
                  ) : (
                    <>ENGAGE INTELLIGENCE SCAN</>
                  )}
                </button>
                {error && <p className="text-rose-600 text-[10px] font-bold text-center mt-6 uppercase tracking-[0.2em]">{error}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-10 scout-card bg-slate-950 text-white flex flex-col justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">System Status</p>
                <div>
                  <p className="text-3xl font-black brand-font tracking-tighter">{accessLevel.toUpperCase()}</p>
                  <p className="text-[10px] font-bold opacity-30 mt-2 uppercase tracking-widest">Global Protocol Active</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentGate(true)}
                className="p-10 scout-card bg-[#DED9D2] hover:bg-slate-950 hover:text-white transition-all group flex flex-col justify-between"
              >
                 <div className="w-10 h-10 border border-slate-900 group-hover:border-white rounded-full flex items-center justify-center transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                 </div>
                 <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Expert Hub</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Book Human Audit</p>
                </div>
              </button>
            </div>
          </div>

          {/* INTELLIGENCE OUTPUT */}
          <div id="result-canvas" className="lg:col-span-7 min-h-[600px]">
            {!analysis && !isLoading ? (
              <div className="w-full h-full scout-card border-dashed flex flex-col items-center justify-center p-24 text-center opacity-20 grayscale transition-all duration-1000 hover:opacity-40 hover:grayscale-0">
                 <svg className="w-24 h-24 text-slate-200 mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                 <h3 className="brand-font text-3xl font-bold tracking-[0.2em]">AWAITING DATA</h3>
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-6">Upload or paste content to generate map report</p>
              </div>
            ) : isLoading ? (
              <div className="w-full h-full scout-card p-24 flex flex-col items-center justify-center text-center">
                 <div className="relative w-40 h-40 mb-16">
                    <div className="absolute inset-0 border-2 border-slate-900/5 rounded-full animate-ping"></div>
                    <div className="absolute inset-8 border border-slate-900/10 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <svg className="w-16 h-16 text-slate-900 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z M12 8v4l3 3" /></svg>
                    </div>
                 </div>
                 <h2 className="brand-font text-4xl font-black mb-6 tracking-tighter">CONSTRUCTING MAP...</h2>
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Processing Legal Terrain Data</p>
              </div>
            ) : (
              <div className="scout-card shadow-3xl animate-in fade-in slide-in-from-right-12 duration-1000">
                <div className="p-8 md:p-12 border-b border-slate-100 flex items-center justify-between sticky top-24 bg-white/95 backdrop-blur z-20">
                  <div className="flex items-center space-x-6">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <h2 className="brand-font text-2xl font-bold tracking-widest">MAP REPORT</h2>
                  </div>
                  <button 
                    onClick={() => {}} 
                    className="px-8 py-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors rounded-sm"
                  >
                    EXPORT PDF
                  </button>
                </div>

                <div className="p-12 md:p-24 space-y-20">
                  <div className="prose prose-slate max-w-none">
                    {analysis?.split('\n').map((line, i) => {
                      if (!line.trim()) return null;
                      if (line.startsWith('#')) return <h1 key={i} className="brand-font text-6xl font-black mb-16 tracking-tighter leading-none text-slate-950">{line.replace('#', '').trim()}</h1>;
                      if (line.startsWith('##')) return <h2 key={i} className="brand-font text-4xl font-black mt-24 mb-10 text-slate-950">{line.replace('##', '').trim()}</h2>;
                      
                      if (line.includes('🟢') || line.includes('🟡') || line.includes('🔴')) {
                         const isGood = line.includes('🟢');
                         const isWarn = line.includes('🟡');
                         return (
                           <div key={i} className={`p-12 mb-8 border-l-[12px] transition-all hover:scale-[1.01] ${isGood ? 'bg-emerald-50/50 border-emerald-500' : isWarn ? 'bg-amber-50/50 border-amber-500' : 'bg-rose-50/50 border-rose-500'}`}>
                             <p className="text-lg font-bold leading-relaxed text-slate-800">{line.replace(/[🟢🟡🔴]/g, '').trim()}</p>
                           </div>
                         );
                      }

                      return <p key={i} className="text-slate-500 text-xl leading-relaxed mb-10 font-medium opacity-80">{line}</p>;
                    })}
                  </div>

                  <div className="pt-32 border-t border-slate-100">
                    <div className="bg-slate-50 p-16 text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em] leading-loose text-center">
                      DISCLAIMER: CLAUSE. PROVIDES INFORMATIONAL MAPS FOR NAVIGATION ONLY. THIS IS NOT LEGAL ADVICE AND DOES NOT CONSTITUTE A BINDING LEGAL OPINION.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showPaymentGate && (
        <PaymentGate onSuccess={() => { setAccessLevel('premium'); setShowPaymentGate(false); }} onCancel={() => setShowPaymentGate(false)} />
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-32 px-6 md:px-12 border-t border-white/5 relative z-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="md:col-span-2 space-y-12">
            <div className="brand-font font-black text-4xl tracking-tighter">CLAUSE<span className="opacity-20">.</span></div>
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
              Exploring the frontiers of German legal complexity so you don't have to. Built for explorers, by explorers.
            </p>
          </div>
          <div className="space-y-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">Station</p>
            <ul className="space-y-6 text-sm font-medium">
              <li><a href="#" className="hover:text-slate-400 transition-colors uppercase tracking-widest">Navigator</a></li>
              <li><a href="#" className="hover:text-slate-400 transition-colors uppercase tracking-widest">Expert Review</a></li>
              <li><a href="#" className="hover:text-slate-400 transition-colors uppercase tracking-widest">Upgrade Intel</a></li>
            </ul>
          </div>
          <div className="space-y-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">Coordinates</p>
            <p className="text-2xl font-black brand-font tracking-widest">BERLIN / DE</p>
            <div className="pt-10 border-t border-white/5 flex flex-col space-y-4 text-[10px] font-bold uppercase tracking-[0.3em] opacity-20">
               <span>EST. 2024 // VERSION 1.0.4</span>
               <span>© CLAUSE GMBH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
