
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

  const mockSlots: ConsultationSlot[] = [
    { id: '1', date: 'Upcoming Monday', time: '10:00' },
    { id: '2', date: 'Upcoming Monday', time: '14:30' },
    { id: '3', date: 'Upcoming Tuesday', time: '11:00' },
    { id: '4', date: 'Upcoming Wednesday', time: '16:00' },
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
      setError(inputMode === 'text' ? "PLEASE INPUT TEXT TO NAVIGATE." : "PLEASE UPLOAD DOCUMENT TO SCAN.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeContract(input, accessLevel, accessLevel === 'premium' ? mockSlots : undefined);
      setAnalysis(result);
      setTimeout(() => {
        document.getElementById('result-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err: any) {
      setError(err.message || "SCANNER ERROR.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError("INVALID FORMAT. PDF REQUIRED.");
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

  const handleDownloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("CLAUSE.", margin, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("INTELLIGENCE MAP REPORT", margin, 32);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, 25);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    
    const cleanText = analysis
      .replace(/[#*]/g, '')
      .replace(/🟢|🟡|🔴/g, (match) => `[${match === '🟢' ? 'OK' : match === '🟡' ? 'WARNING' : 'RISK'}] `);

    const splitText = doc.splitTextToSize(cleanText, contentWidth);
    
    let cursorY = 55;
    const lineHeight = 7;
    
    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - margin - 20) {
        doc.addPage();
        cursorY = margin;
        doc.setDrawColor(2, 6, 23);
        doc.line(margin, margin - 5, pageWidth - margin, margin - 5);
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = 30;
    }
    
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY + 10, pageWidth - margin, cursorY + 10);
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    const disclaimer = "DISCLAIMER: CLAUSE. PROVIDES INFORMATIONAL MAPS FOR NAVIGATION ONLY. THIS IS NOT LEGAL ADVICE AND DOES NOT CONSTITUTE A BINDING LEGAL OPINION.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(splitDisclaimer, margin, cursorY + 20);

    doc.save(`Clause_Map_Report_${new Date().getTime()}.pdf`);
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  if (user.role === 'admin' && viewMode === 'admin') {
    return <AdminDashboard user={user} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* SCOUT-STYLE HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled ? 'glass-nav py-3' : 'py-6 md:py-8'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <div className="brand-font font-black text-xl md:text-2xl tracking-tighter flex items-center space-x-2">
              <span className="w-7 h-7 md:w-8 md:h-8 bg-slate-900 text-white flex items-center justify-center rounded-sm">C</span>
              <span>CLAUSE<span className="opacity-30">.</span></span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
              <a href="#" className="hover:opacity-100 transition-opacity">The Compass</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Expert Review</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={handlePremiumRequest} className="hidden sm:block text-[10px] md:text-[11px] font-bold uppercase tracking-widest border-b border-slate-950 pb-0.5 hover:opacity-50 transition-opacity">
              Deep Audit
            </button>
            <div className="h-4 w-px bg-slate-300"></div>
            <button onClick={handleLogout} className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-16 md:pb-24 px-4 md:px-6 max-w-[1400px] mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-end">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h1 className="text-hero brand-font animate-in fade-in slide-in-from-bottom-8 duration-700">
              EXPLORE <br />
              <span className="opacity-40 italic font-light">WITHOUT</span> <br />
              RISK.
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-base md:text-lg text-slate-600 font-medium leading-relaxed opacity-80 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              German contracts are complex territories. We provide the map and the gear you need to move forward with absolute confidence.
            </p>
          </div>
          <div className="flex flex-col space-y-4 items-center lg:items-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
            <div className="flex -space-x-3 mb-2 md:mb-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-[#F5F2ED] bg-slate-200 shadow-sm overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i*10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Trusted by 12,000+ Explorers</p>
          </div>
        </div>
      </section>

      {/* MAIN CONSOLE GRID */}
      <main className="max-w-[1400px] mx-auto w-full px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 md:pb-32">
        
        {/* ACTION PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="scout-card p-6 md:p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex space-x-4 md:space-x-6 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
                <button 
                  onClick={() => setInputMode('file')}
                  className={`pb-1 border-b-2 transition-all ${inputMode === 'file' ? 'border-slate-900' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                >
                  Scan
                </button>
                <button 
                  onClick={() => setInputMode('text')}
                  className={`pb-1 border-b-2 transition-all ${inputMode === 'text' ? 'border-slate-900' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                >
                  Snippet
                </button>
              </div>
              {contractFile && (
                <button onClick={handleClear} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Reset</button>
              )}
            </div>

            <div className="flex-1">
              {inputMode === 'file' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-[4/3] w-full border border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center p-8 md:p-12 text-center cursor-pointer hover:bg-white transition-all group relative overflow-hidden rounded-sm`}
                >
                  {isLoading && <div className="scanner-line"></div>}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                  
                  {contractFile ? (
                    <div className="animate-in zoom-in duration-300 z-10">
                      <svg className="w-12 h-12 md:w-16 md:h-16 text-slate-900 mx-auto mb-4 md:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="font-bold text-lg md:text-xl tracking-tight mb-2 truncate max-w-[200px] md:max-w-[250px]">{contractFile.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Secured</p>
                    </div>
                  ) : (
                    <div className="z-10 group-hover:scale-105 transition-transform">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center shadow-sm mx-auto mb-4 md:mb-6">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <p className="brand-font font-bold text-slate-400 tracking-widest text-sm md:text-base">UPLOAD DOCUMENT</p>
                      <p className="text-[10px] text-slate-300 mt-2">PDF | Max 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="PASTE CONTRACT TEXT HERE FOR ANALYSIS..."
                  className="w-full aspect-[4/3] p-6 md:p-10 bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-slate-900 outline-none text-xs md:text-sm font-medium leading-relaxed resize-none transition-all placeholder:text-slate-300 rounded-sm"
                ></textarea>
              )}
            </div>

            <div className="mt-8 md:mt-10">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full scout-button py-4 md:py-6 flex items-center justify-center disabled:opacity-30 text-xs md:text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-3">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Mapping...</span>
                  </span>
                ) : (
                  <>START INTELLIGENCE SCAN</>
                )}
              </button>
              {error && <p className="text-rose-600 text-[10px] font-bold text-center mt-4 uppercase tracking-widest">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-6 md:p-8 scout-card flex flex-col justify-between ${accessLevel === 'premium' ? 'bg-slate-900 text-white border-slate-800' : ''}`}>
              <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 opacity-60">Tier Status</div>
              <div>
                <p className="text-xl md:text-2xl font-black brand-font">{accessLevel.toUpperCase()}</p>
                <p className="text-[9px] md:text-[10px] font-medium opacity-60 mt-1">Deep analysis {accessLevel === 'premium' ? 'active' : 'ready'}.</p>
              </div>
            </div>
            <button 
              onClick={handlePremiumRequest}
              className="p-6 md:p-8 scout-card bg-[#DED9D2] hover:bg-slate-900 hover:text-white flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-400 flex items-center justify-center group-hover:border-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-1">Expert Hub</p>
                <p className="text-[9px] md:text-[10px] font-medium opacity-60">Consultation service.</p>
              </div>
            </button>
          </div>
        </div>

        {/* RESULTS CANVAS */}
        <div id="result-canvas" className="lg:col-span-7 min-h-[400px]">
          {!analysis && !isLoading ? (
            <div className="w-full h-full scout-card border-dashed flex flex-col items-center justify-center p-12 md:p-20 text-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
               <svg className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mb-6 md:mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               <h3 className="brand-font text-xl md:text-2xl font-bold tracking-widest">NAVIGATOR READY</h3>
               <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mt-4">Awaiting environmental input for scan...</p>
            </div>
          ) : isLoading ? (
            <div className="w-full h-full scout-card p-12 md:p-20 flex flex-col items-center justify-center text-center">
               <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 md:mb-12">
                  <div className="absolute inset-0 border border-slate-900/10 rounded-full animate-ping"></div>
                  <div className="absolute inset-4 border border-slate-900/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <svg className="w-10 h-10 md:w-12 md:h-12 text-slate-900 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                  </div>
               </div>
               <h2 className="brand-font text-2xl md:text-3xl font-black mb-3 md:mb-4">MAPPING...</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Building Intelligence Log</p>
            </div>
          ) : (
            <div className="scout-card shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-16 md:top-24 bg-white/90 backdrop-blur z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <h2 className="brand-font text-lg md:text-xl font-bold tracking-wider">MAP REPORT</h2>
                </div>
                <div className="flex space-x-2 md:space-x-3 w-full sm:w-auto">
                   <button 
                    onClick={handleDownloadPDF}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2 border border-slate-200 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                   >
                    PDF
                   </button>
                   <button className="flex-1 sm:flex-none px-4 md:px-6 py-2 scout-button text-[9px] md:text-[10px]">Export</button>
                </div>
              </div>

              <div className="p-6 md:p-12 lg:p-20 space-y-12 md:space-y-16">
                <div className="prose prose-slate max-w-none">
                  {analysis?.split('\n').map((line, i) => {
                    if (!line.trim()) return null;
                    
                    if (line.startsWith('#')) return <h1 key={i} className="brand-font text-3xl md:text-5xl font-black mb-8 md:mb-12 tracking-tighter leading-none">{line.replace('#', '').trim()}</h1>;
                    if (line.startsWith('##')) return <h2 key={i} className="brand-font text-2xl md:text-3xl font-black mt-12 md:mt-20 mb-6 md:mb-8 border-l-4 border-slate-950 pl-4 md:pl-6">{line.replace('##', '').trim()}</h2>;
                    
                    if (line.includes('🟢') || line.includes('🟡') || line.includes('🔴')) {
                       const isGood = line.includes('🟢');
                       const isWarning = line.includes('🟡');
                       return (
                         <div key={i} className={`p-6 md:p-10 mb-6 md:mb-8 border-l-8 ${isGood ? 'bg-emerald-50/50 border-emerald-500' : isWarning ? 'bg-amber-50/50 border-amber-500' : 'bg-rose-50/50 border-rose-500'}`}>
                           <p className="text-xs md:text-sm font-bold leading-relaxed">{line.replace(/[🟢🟡🔴]/g, '').trim()}</p>
                         </div>
                       );
                    }

                    if (line.includes('🎥') || line.includes('Consultation')) {
                       return (
                         <div key={i} className="bg-slate-900 text-white p-8 md:p-12 my-12 md:my-16 relative group overflow-hidden rounded-sm">
                           <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
                              <svg className="w-16 h-16 md:w-24 md:h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                           </div>
                           <h4 className="brand-font text-2xl md:text-3xl font-black mb-4 md:mb-6">EXPERT DEPLOYMENT</h4>
                           <p className="text-slate-400 text-xs md:text-sm mb-8 md:mb-12 max-w-md">Your premium access includes a direct video session with a German relocation specialist to finalize your navigation strategy.</p>
                           <div className="grid grid-cols-2 gap-2 mb-8 md:mb-10">
                              {mockSlots.map(slot => (
                                <button key={slot.id} className="bg-white/5 border border-white/10 p-3 md:p-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                            <button className="w-full bg-white text-slate-900 py-4 md:py-6 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#F5F2ED] transition-colors">SECURE VIDEO SLOT</button>
                         </div>
                       );
                    }

                    return <p key={i} className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-medium">{line}</p>;
                  })}
                </div>

                <div className="pt-16 md:pt-24 border-t border-slate-100">
                  <div className="bg-[#DED9D2]/30 p-8 md:p-12 border-l border-r border-slate-200 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-loose text-center">
                    DISCLAIMER: CLAUSE. PROVIDES INFORMATIONAL MAPS FOR NAVIGATION ONLY. THIS IS NOT LEGAL ADVICE.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showPaymentGate && (
        <PaymentGate onSuccess={() => { setAccessLevel('premium'); setShowPaymentGate(false); }} onCancel={() => setShowPaymentGate(false)} />
      )}
      
      <footer className="bg-slate-950 text-white py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-6 md:space-y-8">
            <div className="brand-font font-black text-2xl md:text-3xl tracking-tighter">CLAUSE<span className="opacity-20">.</span></div>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xs">
              Defining the new standard for legal exploration in Europe. Join the community of informed explorers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-30">Vessel</p>
              <ul className="space-y-2 text-xs md:text-sm font-medium">
                <li><a href="#" className="hover:text-slate-400">The Map</a></li>
                <li><a href="#" className="hover:text-slate-400">Deep Audit</a></li>
                <li><a href="#" className="hover:text-slate-400">Experts</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-30">Support</p>
              <ul className="space-y-2 text-xs md:text-sm font-medium">
                <li><a href="#" className="hover:text-slate-400">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-400">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-6 md:space-y-8">
             <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-30">Coordinates</p>
             <p className="text-xl md:text-2xl font-black brand-font">BERLIN / GERMANY</p>
             <div className="pt-6 md:pt-8 border-t border-white/5 flex space-x-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
               <span>EST. 2024</span>
               <span>© CLAUSE GMBH</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
