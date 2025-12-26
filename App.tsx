
import React, { useState, useRef } from 'react';
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
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('free');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError(inputMode === 'text' ? "Please paste your contract text to begin analysis." : "Please upload a PDF document to begin analysis.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeContract(input, accessLevel, accessLevel === 'premium' ? mockSlots : undefined);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Auditing failure. Please try again.");
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

  const downloadPDFSummary = () => {
    alert("Generating your secure PDF briefing...");
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
            className="bg-white/10 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 backdrop-blur-xl transition-all shadow-2xl"
          >
            User View
          </button>
          <button onClick={handleLogout} className="bg-rose-500 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
            Logout
          </button>
        </div>
        <AdminDashboard user={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaff]">
      {/* Navbar */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-9 h-9 md:w-11 md:h-11 premium-gradient rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-violet-200">
              <span className="text-white font-black text-xl md:text-2xl tracking-tighter">C</span>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tighter text-slate-900 leading-tight">Clause Detective <span className="premium-text-gradient">AI</span></h1>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Intelligence</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[11px] font-black uppercase tracking-widest text-slate-400 mr-4">
               <a href="#" className="hover:text-violet-600 transition-colors text-violet-600">Analyze</a>
               <a href="#" className="hover:text-violet-600 transition-colors">Vault</a>
               <a href="#" className="hover:text-violet-600 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl">
              <button
                onClick={() => setAccessLevel('free')}
                className={`px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${
                  accessLevel === 'free' ? 'bg-white shadow-md text-violet-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Standard
              </button>
              <button
                onClick={handlePremiumRequest}
                className={`px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all flex items-center ${
                  accessLevel === 'premium' ? 'premium-gradient shadow-lg shadow-violet-200 text-white scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {accessLevel === 'premium' && (
                  <svg className="w-2.5 h-2.5 mr-1.5 md:mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                )}
                Premium
              </button>
            </div>

            <div className="flex items-center space-x-3 pl-4 md:pl-6 border-l border-slate-100 group cursor-pointer" onClick={handleLogout}>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] font-black text-slate-900 group-hover:text-violet-600 transition-colors">{user.email.split('@')[0]}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sign Out</span>
              </div>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm shadow-md transition-all ${accessLevel === 'premium' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-600'}`}>
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 md:py-10 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-10 items-start">
          
          {/* Input Panel */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 mb-2">Audit your contract.</h2>
              <p className="text-slate-500 font-medium text-xs md:text-sm">Clear, simple explanations for complex German legal terms.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-5 md:p-7 shadow-2xl shadow-violet-100/50 border border-violet-50">
              <div className="flex items-center justify-between mb-5 md:mb-6">
                 <div className="flex p-0.5 bg-slate-50 rounded-xl">
                    <button 
                      onClick={() => setInputMode('text')}
                      className={`px-4 md:px-5 py-1.5 md:py-2 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setInputMode('file')}
                      className={`px-4 md:px-5 py-1.5 md:py-2 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${inputMode === 'file' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Upload
                    </button>
                  </div>
              </div>

              {inputMode === 'text' ? (
                <div className="relative">
                  <textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder="Enter your contract text (German)..."
                    className="w-full min-h-[300px] md:h-[420px] p-5 md:p-6 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-500/10 text-xs md:text-sm leading-relaxed text-slate-700 font-medium resize-none placeholder:text-slate-300 outline-none transition-all"
                  ></textarea>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full min-h-[300px] md:h-[420px] border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center p-6 md:p-10 cursor-pointer transition-all ${contractFile ? 'border-violet-400 bg-violet-50/30' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                  {contractFile ? (
                    <div className="text-center">
                      <div className="w-14 h-14 md:w-20 md:h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-200">
                        <svg className="w-7 h-7 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="font-black text-slate-900 text-sm md:text-base tracking-tight truncate max-w-[180px] md:max-w-xs">{contractFile.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Verified PDF</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        className="mt-6 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <p className="text-sm md:text-base font-black text-slate-800 tracking-tight">Drop PDF here</p>
                      <p className="text-[9px] md:text-xs text-slate-400 mt-1 font-medium">Safe & Secure</p>
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 md:mt-8">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className={`w-full font-black py-4 rounded-xl md:rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-violet-200 active:scale-[0.98] ${
                    accessLevel === 'premium' ? 'premium-gradient text-white' : 'bg-slate-950 hover:bg-slate-900 text-white'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Auditing...</span>
                    </div>
                  ) : (
                    <>Start Audit Report</>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-5 p-4 bg-rose-50 text-rose-700 text-[10px] md:text-xs font-bold rounded-xl border border-rose-100 flex items-center animate-in fade-in duration-300">
                  <svg className="w-4 h-4 mr-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  <span className="leading-tight">{error}</span>
                </div>
              )}
            </div>

            <div className={`p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] border transition-all ${accessLevel === 'premium' ? 'bg-violet-50/50 border-violet-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-start space-x-3.5">
                 <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${accessLevel === 'premium' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200/50' : 'bg-slate-200 text-slate-500'}`}>
                   <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 text-[10px] md:text-[11px] mb-1 uppercase tracking-widest">{accessLevel === 'premium' ? 'Premium Active' : 'Go Premium'}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      {accessLevel === 'premium' 
                        ? 'Full intelligence access. Deep risk detection is active for your audits.' 
                        : 'Unlock clause-by-clause analysis and hidden risk detection.'}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="min-h-[500px] md:min-h-[800px]">
            {!analysis && !isLoading && (
              <div className="h-full min-h-[350px] border-2 border-dashed border-violet-100 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center p-6 md:p-12 text-center bg-white/50 backdrop-blur-sm">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-violet-100/30 text-violet-100">
                  <svg className="w-7 h-7 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-400 tracking-tight">Intelligence Preview</h3>
                <p className="text-[10px] md:text-sm font-medium text-slate-300 mt-3 max-w-[240px] mx-auto leading-relaxed">Generated briefing will appear here after analysis.</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full min-h-[350px] bg-white rounded-[2.5rem] md:rounded-[3rem] border border-violet-50 flex flex-col items-center justify-center p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-violet-100/40">
                 <div className="absolute inset-x-0 top-0 h-1 bg-violet-50 overflow-hidden">
                    <div className="scanner-line h-full w-full opacity-60"></div>
                 </div>
                 <div className="w-16 h-16 md:w-24 md:h-24 mb-8 md:mb-10 relative">
                    <div className="absolute inset-0 bg-violet-600 rounded-2xl opacity-10 animate-ping"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-violet-600">
                       <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                 </div>
                 <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Processing AI Intelligence</h3>
                 <p className="text-[10px] md:text-xs text-slate-400 max-w-[240px] mt-3 font-medium leading-relaxed">Translating legal jargon and auditing clauses...</p>
              </div>
            )}

            {analysis && (
              <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-violet-100 shadow-2xl flex flex-col overflow-hidden report-page animate-in slide-in-from-right-8 duration-700 h-full">
                <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div className="min-w-0 pr-4">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter truncate">Intelligence Briefing</h2>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[9px] text-violet-600 font-black uppercase tracking-[0.2em] whitespace-nowrap">Secure Report</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{accessLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {accessLevel === 'premium' && (
                      <button 
                        onClick={downloadPDFSummary}
                        className="p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    )}
                    <button className="px-5 md:px-7 py-2 md:py-3 premium-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl shadow-lg shadow-violet-200 active:scale-95 transition-all">Export</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
                  <div className="markdown-content max-w-none">
                    {analysis.split('\n').map((line, i) => {
                      if (line.startsWith('###')) return <h3 key={i} className="text-base md:text-lg font-black mt-8 md:mt-12 mb-3 md:mb-5 text-slate-950 flex items-center border-b border-slate-50 pb-2 md:pb-3 leading-tight">{line.replace('###', '')}</h3>;
                      if (line.startsWith('##')) return <h2 key={i} className={`text-xl md:text-2xl font-black mt-10 md:mt-16 mb-5 md:mb-8 tracking-tighter leading-tight ${accessLevel === 'premium' ? 'premium-text-gradient' : 'text-slate-950'}`}>{line.replace('##', '')}</h2>;
                      if (line.startsWith('#')) return <h1 key={i} className="text-2xl md:text-4xl font-black mb-6 md:mb-10 tracking-tighter text-slate-950 leading-tight">{line.replace('#', '')}</h1>;
                      
                      if (line.trim().startsWith('🟢')) return <div key={i} className="bg-emerald-50 text-emerald-800 p-5 md:p-7 rounded-xl md:rounded-[1.5rem] border border-emerald-100/50 my-5 md:my-7 flex items-start shadow-sm"><div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] md:text-[10px] mr-3.5 md:mr-4 mt-0.5 md:mt-1 shrink-0 font-black">✓</div><div className="text-xs md:text-sm font-bold leading-relaxed">{line.replace('🟢', '')}</div></div>;
                      if (line.trim().startsWith('🟡')) return <div key={i} className="bg-amber-50 text-amber-800 p-5 md:p-7 rounded-xl md:rounded-[1.5rem] border border-amber-100/50 my-5 md:my-7 flex items-start shadow-sm"><div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px] md:text-[10px] mr-3.5 md:mr-4 mt-0.5 md:mt-1 shrink-0 font-black">!</div><div className="text-xs md:text-sm font-bold leading-relaxed">{line.replace('🟡', '')}</div></div>;
                      if (line.trim().startsWith('🔴')) return <div key={i} className="bg-rose-50 text-rose-800 p-5 md:p-7 rounded-xl md:rounded-[1.5rem] border border-rose-100/50 my-5 md:my-7 flex items-start shadow-sm"><div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] md:text-[10px] mr-3.5 md:mr-4 mt-0.5 md:mt-1 shrink-0 font-black">✕</div><div className="text-xs md:text-sm font-bold leading-relaxed">{line.replace('🔴', '')}</div></div>;
                      
                      if (line.includes('🎥') || line.includes('Consultation')) {
                        return (
                          <div key={i} className="premium-gradient text-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] my-10 md:my-12 shadow-2xl shadow-violet-300/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -m-8 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px] pointer-events-none animate-subtle"></div>
                            <h4 className="text-xl md:text-2xl font-black mb-3 tracking-tighter leading-tight">Expert Review</h4>
                            <p className="text-violet-50 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed font-medium">30-minute session included with Premium.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 mb-6 md:mb-8">
                              {mockSlots.map(slot => (
                                <button key={slot.id} className="bg-white/10 hover:bg-white/20 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-white/20 transition-all text-center truncate">
                                  {slot.date} @ {slot.time}
                                </button>
                              ))}
                            </div>
                            <button className="w-full bg-white text-violet-700 py-3.5 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-violet-50 transition-all active:scale-[0.97]">Reserve Slot</button>
                          </div>
                        );
                      }

                      if (line.startsWith('🔒')) return (
                        <div key={i} className="bg-slate-950 text-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] my-10 md:my-12 relative overflow-hidden group shadow-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 opacity-40"></div>
                          <div className="relative z-10 text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 backdrop-blur-xl border border-white/10">
                              <svg className="w-6 h-6 md:w-8 md:h-8 text-violet-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            </div>
                            <h4 className="text-xl md:text-2xl font-black mb-2 md:mb-3 tracking-tighter leading-tight">Unlock Analysis</h4>
                            <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed font-medium max-w-[240px] md:max-w-sm mx-auto">Get deep risk detection and comparison with local standards.</p>
                            <button 
                              onClick={handlePremiumRequest}
                              className="bg-white text-slate-950 px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-violet-50 transition-all shadow-xl active:scale-95"
                            >
                              Go Premium
                            </button>
                          </div>
                        </div>
                      );

                      if (line.trim().startsWith('-')) return <li key={i} className="ml-5 md:ml-8 mb-2 md:mb-3 text-slate-700 list-disc font-medium marker:text-violet-500 leading-relaxed text-xs md:text-sm">{line.replace('-', '').trim()}</li>;
                      if (line.trim() === '') return null;
                      return <p key={i} className="text-slate-600 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 font-medium">{line}</p>;
                    })}
                  </div>

                  <div className="mt-16 md:mt-24 pt-8 md:pt-12 border-t border-slate-50 flex flex-col items-center">
                    <div className="bg-violet-50/50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] text-[9px] md:text-[10px] text-slate-500 italic border border-violet-100/50 leading-relaxed font-medium max-w-xl text-center shadow-inner">
                      ⚠️ REGULATORY DISCLAIMER: This automated briefing is for informational purposes only. Clause Detective AI provides intelligence based on general legal standards in Germany and does not constitute legally binding advice.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showPaymentGate && (
        <PaymentGate onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentGate(false)} />
      )}
      
      <footer className="bg-white border-t border-slate-50 py-8 md:py-12 mt-8 md:mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] text-center md:text-left gap-4 md:gap-0">
          <div className="flex items-center space-x-2.5">
             <div className="w-5 h-5 md:w-7 md:h-7 rounded-lg premium-gradient opacity-30"></div>
             <p>© 2024 Clause Detective AI • Legal Intel</p>
          </div>
          <div className="flex space-x-8 md:space-x-10">
            <a href="#" className="hover:text-violet-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
