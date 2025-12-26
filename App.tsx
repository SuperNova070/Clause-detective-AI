
import React, { useState, useRef, useEffect } from 'react';
import { analyzeContract } from './services/geminiService';
import { AccessLevel, UserProfile, ConsultationSlot } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import PaymentGate from './components/PaymentGate';

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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mockSlots: ConsultationSlot[] = [
    { id: '1', date: 'Next Monday', time: '10:00' },
    { id: '2', date: 'Next Monday', time: '14:30' },
    { id: '3', date: 'Next Tuesday', time: '11:00' },
    { id: '4', date: 'Next Wednesday', time: '16:00' },
  ];

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
      setError(inputMode === 'text' ? "Paste your contract to begin." : "Upload a PDF to begin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    // Smooth scroll to results after a short delay
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const result = await analyzeContract(input, accessLevel, accessLevel === 'premium' ? mockSlots : undefined);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Auditing failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError("Invalid format. Please provide a PDF.");
        setContractFile(null);
        return;
      }
      setContractFile(file);
      setError(null);
    }
  };

  const handleClear = () => {
    setContractText('');
    setContractFile(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePremiumRequest = () => {
    if (accessLevel === 'free') setShowPaymentGate(true);
    else setAccessLevel('premium');
  };

  const handlePaymentSuccess = () => {
    setAccessLevel('premium');
    setShowPaymentGate(false);
    if (user) setUser({ ...user, accessLevel: 'premium' });
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  if (user.role === 'admin' && viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="fixed top-6 right-8 z-50 flex items-center space-x-3">
          <button 
            onClick={() => setViewMode('user')}
            className="bg-white/10 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
          >
            User View
          </button>
          <button onClick={handleLogout} className="bg-rose-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
            Logout
          </button>
        </div>
        <AdminDashboard user={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Premium Pill Navbar */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-4xl px-4 transition-all duration-500 ${scrolled ? 'translate-y-[-10px]' : ''}`}>
        <div className="glass-header rounded-full px-6 h-14 flex items-center justify-between border border-black/5 shadow-2xl">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm tracking-tighter">C.</div>
             <span className="text-xs font-black uppercase tracking-[0.2em] hidden sm:inline-block">Clause.</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6 text-[10px] font-black uppercase tracking-widest">
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-violet-600">Home</button>
               <button onClick={handlePremiumRequest} className="hover:text-violet-600">Upgrade</button>
               <button className="hover:text-violet-600">Help</button>
            </div>
            
            <div className="h-4 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleLogout}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors hidden xs:block">Logout</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-600 group-hover:bg-slate-200 transition-all">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center max-w-7xl mx-auto w-full">
         <div className="inline-block px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[9px] font-black uppercase tracking-[0.25em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Powered by Gemini Intelligence
         </div>
         <h1 className="text-huge text-slate-950 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
           Legal Clarity. <br />
           <span className="text-slate-300">Simplified.</span>
         </h1>
         <p className="max-w-xl text-slate-500 font-medium text-base md:text-lg mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           The new standard for German contract analysis. Join 12,000+ people decoding complex legal terms in seconds.
         </p>
         
         <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-4 border-white bg-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by Professionals</span>
         </div>
      </header>

      {/* Studio View */}
      <main className="max-w-7xl mx-auto px-6 pb-32 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Action Control */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
           <div className="bento-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex bg-slate-50 p-1 rounded-full border border-black/5">
                    <button 
                      onClick={() => setInputMode('file')}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === 'file' ? 'bg-white shadow-xl text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Document
                    </button>
                    <button 
                      onClick={() => setInputMode('text')}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white shadow-xl text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Snippet
                    </button>
                 </div>
                 {inputMode === 'file' && contractFile && (
                   <button onClick={handleClear} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Clear</button>
                 )}
              </div>

              {inputMode === 'file' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer transition-all duration-500 ${contractFile ? 'scale-100' : 'hover:scale-[1.01]'}`}
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                   <div className={`w-full aspect-[4/5] md:aspect-[3/4] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-12 text-center transition-all ${contractFile ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 hover:border-violet-300'}`}>
                      {isLoading && <div className="scanner-bar"></div>}
                      
                      {contractFile ? (
                        <div className="animate-in zoom-in duration-300">
                           <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 text-violet-600">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <p className="font-black text-slate-950 tracking-tighter text-lg truncate max-w-[220px] mx-auto">{contractFile.name}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Ready for Audit</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                           </div>
                           <p className="font-bold text-slate-800 tracking-tight">Drop your contract</p>
                           <p className="text-[10px] font-bold text-slate-400">PDF Files only</p>
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste contract sections here..."
                  className="w-full aspect-[4/5] md:aspect-[3/4] p-8 bg-slate-50 rounded-[2rem] focus:ring-4 focus:ring-violet-500/5 text-sm leading-relaxed text-slate-700 font-medium resize-none placeholder:text-slate-300 outline-none border border-black/5"
                ></textarea>
              )}

              <div className="mt-8">
                 <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full premium-button bg-slate-950 text-white font-black py-5 rounded-full text-[11px] uppercase tracking-[0.25em] shadow-2xl disabled:opacity-50 flex items-center justify-center group overflow-hidden relative"
                 >
                    {isLoading ? (
                      <span className="flex items-center space-x-3">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Analyzing Core...</span>
                      </span>
                    ) : (
                      <>Run Intelligence Scan</>
                    )}
                 </button>
                 {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-4 animate-in fade-in duration-300">{error}</p>}
              </div>
           </div>

           {/* Access Bento */}
           <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between h-40 ${accessLevel === 'premium' ? 'bg-violet-600 text-white' : 'bg-white border-black/5'}`}>
                 <svg className={`w-6 h-6 ${accessLevel === 'premium' ? 'text-white' : 'text-violet-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{accessLevel === 'premium' ? 'Status Active' : 'Basic Tier'}</p>
                    <p className={`text-[11px] font-bold ${accessLevel === 'premium' ? 'text-violet-100' : 'text-slate-400'}`}>Deep risk scans {accessLevel === 'premium' ? 'enabled' : 'locked'}.</p>
                 </div>
              </div>
              <button 
                onClick={handlePremiumRequest}
                className="bg-slate-900 rounded-[2rem] p-6 text-white text-left flex flex-col justify-between h-40 hover:bg-black transition-all group"
              >
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Upgrade</p>
                    <p className="text-[11px] font-bold text-slate-400">Unlock Expert Review & PDF Reports.</p>
                 </div>
              </button>
           </div>
        </div>

        {/* Right: Output Canvas */}
        <div id="result-section" className="lg:col-span-7 min-h-[600px]">
           {!analysis && !isLoading ? (
             <div className="w-full aspect-video lg:h-full bg-slate-50/50 rounded-[3rem] border border-black/5 border-dashed flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                   <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-300 tracking-tight">Intelligence Canvas</h3>
                <p className="text-xs font-bold text-slate-400 mt-4 max-w-[200px] leading-relaxed uppercase tracking-widest">Awaiting document for scan results...</p>
             </div>
           ) : isLoading ? (
             <div className="w-full min-h-[600px] lg:h-full bg-white rounded-[3rem] p-16 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-50/20 to-transparent"></div>
                <div className="w-24 h-24 mb-10 relative">
                   <div className="absolute inset-0 bg-violet-600 rounded-3xl opacity-10 animate-ping"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-violet-600">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Translating Jargon...</h2>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Building your intelligence report</p>
             </div>
           ) : (
             <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-12 duration-1000">
                <div className="px-10 py-10 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-10">
                   <div>
                      <h2 className="text-2xl font-black tracking-tight">Intelligence Report</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Status: Confirmed Analysis</p>
                   </div>
                   <div className="flex space-x-3">
                      <button className="p-4 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                      <button className="bg-slate-950 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Export</button>
                   </div>
                </div>

                <div className="p-10 md:p-16 space-y-12">
                   <div className="markdown-content">
                      {analysis?.split('\n').map((line, i) => {
                        if (!line.trim()) return null;
                        
                        // Custom rendering for "Nike/Brand" style output
                        if (line.startsWith('#')) return <h1 key={i} className="text-4xl font-black mb-10 tracking-tight leading-none text-slate-950">{line.replace('#', '').trim()}</h1>;
                        if (line.startsWith('##')) return <h2 key={i} className="text-2xl font-black mt-16 mb-6 tracking-tight text-slate-950">{line.replace('##', '').trim()}</h2>;
                        
                        if (line.includes('🟢') || line.includes('🟡') || line.includes('🔴')) {
                           const isGood = line.includes('🟢');
                           const isWarning = line.includes('🟡');
                           return (
                             <div key={i} className={`p-8 rounded-[2rem] border mb-6 flex items-start ${isGood ? 'bg-emerald-50/50 border-emerald-100' : isWarning ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'}`}>
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0 text-white font-black text-xs ${isGood ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                 {isGood ? '✓' : isWarning ? '!' : '×'}
                               </div>
                               <p className="text-sm font-bold leading-relaxed">{line.replace(/[🟢🟡🔴]/g, '').trim()}</p>
                             </div>
                           );
                        }

                        if (line.includes('🎥') || line.includes('Consultation')) {
                           return (
                             <div key={i} className="bg-slate-950 text-white p-10 rounded-[3rem] my-12 relative overflow-hidden group">
                               <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20"></div>
                               <h4 className="text-2xl font-black mb-4 relative z-10">Expert Deep-Dive</h4>
                               <p className="text-slate-400 text-sm font-medium mb-10 relative z-10">Need human clarity? Your premium membership includes a 30-minute session with a German specialist.</p>
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                                  {mockSlots.map(slot => (
                                    <button key={slot.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                                      {slot.time}
                                    </button>
                                  ))}
                                </div>
                                <button className="w-full bg-white text-slate-950 py-4 rounded-full text-[10px] font-black uppercase tracking-widest mt-8 relative z-10 hover:bg-slate-100 transition-colors">Reserve Video Slot</button>
                             </div>
                           );
                        }

                        if (line.startsWith('-')) return <li key={i} className="ml-6 mb-3 text-slate-600 font-medium leading-relaxed list-none relative before:content-[''] before:absolute before:left-[-20px] before:top-2 before:w-1.5 before:h-1.5 before:bg-violet-400 before:rounded-full">{line.replace('-', '').trim()}</li>;
                        
                        return <p key={i} className="text-slate-600 text-base leading-relaxed mb-6 font-medium">{line}</p>;
                      })}
                   </div>

                   <div className="pt-20 border-t border-black/5 text-center">
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-black/5 text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-[0.2em] max-w-lg mx-auto italic">
                        Disclaimer: CLAUSE. provides AI-driven informational briefs based on general standards. This is not legally binding advice.
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>

      {showPaymentGate && (
        <PaymentGate onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentGate(false)} />
      )}
      
      <footer className="py-20 border-t border-black/5 text-center">
         <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm tracking-tighter mx-auto mb-8">C.</div>
         <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Security Protocol</a>
         </div>
         <p className="mt-12 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">© 2024 CLAUSE. • Intelligence for Life</p>
      </footer>
    </div>
  );
};

export default App;
