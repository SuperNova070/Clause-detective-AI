
import React, { useState } from 'react';
import { performAdminAction } from '../services/geminiService';
import { UserProfile, AnalysisReview } from '../types';

interface AdminDashboardProps {
  user: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisReview | null>(null);
  const [adminReport, setAdminReport] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated platform financial data
  const platformStats = {
    totalRevenue: 14250.50,
    premiumUpsellRevenue: 8420.00,
    mrr: 4200.00,
    premiumUsers: 284,
    conversionRate: "8.4%",
    avgOrderValue: 49.99
  };

  // Simulated internal platform data
  const mockAnalyses: AnalysisReview[] = [
    {
      userId: "usr_8821",
      contractType: "Rental (Mietvertrag)",
      analysisOutput: "The contract is for an apartment in Berlin. The rent is €1200. Deposit is 3 months. Notice period is standard 3 months...",
      accessLevel: "free",
      timestamp: "2024-05-20 14:30"
    },
    {
      userId: "usr_9902",
      contractType: "Employment (Arbeitsvertrag)",
      analysisOutput: "Full-time position as Senior Engineer. Salary €85,000. Probation 6 months. 30 days vacation...",
      accessLevel: "premium",
      timestamp: "2024-05-20 15:10"
    }
  ];

  const handleReview = async (analysis: AnalysisReview) => {
    setSelectedAnalysis(analysis);
    setIsProcessing(true);
    setAdminReport(null);
    try {
      const report = await performAdminAction(user.adminRole || 'admin', "Review Analysis Quality", {
        ...analysis,
        platformFinancialContext: platformStats
      });
      setAdminReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Clause Detective Admin</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              Role: <span className="text-indigo-400 font-mono">{user.adminRole?.toUpperCase()}</span> | Security Level: <span className="text-amber-500">Tier 1</span>
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center shadow-lg">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Gateway: Active
            </div>
            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-lg">Load: 0.12ms</div>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Total Gross Revenue</p>
            <h3 className="text-3xl font-black text-emerald-400 tracking-tighter">
              €{platformStats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-500/80">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              +14.2% Growth
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Premium Service Upsells</p>
            <h3 className="text-3xl font-black text-indigo-400 tracking-tighter">
              €{platformStats.premiumUpsellRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-4 font-medium italic">59% of total revenue share</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Active Premium Subscriptions</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{platformStats.premiumUsers}</h3>
            <div className="mt-4 flex gap-1">
               {Array.from({length: 10}).map((_, i) => (
                 <div key={i} className={`h-1 flex-1 rounded-full ${i < 8 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
               ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">LTV Conversion Rate</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{platformStats.conversionRate}</h3>
            <p className="text-[10px] text-slate-500 mt-4 font-medium">Free to Premium activation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Live User Activity</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </div>
            {mockAnalyses.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleReview(item)}
                className={`w-full text-left p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                  selectedAnalysis === item 
                    ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-900/10' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black font-mono text-slate-500 tracking-widest">{item.userId}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border ${
                    item.accessLevel === 'premium' 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {item.accessLevel}
                  </span>
                </div>
                <div className="font-bold text-sm mb-1 text-slate-200">{item.contractType}</div>
                <div className="text-[10px] text-slate-500 font-bold flex items-center mt-2 opacity-60">
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.timestamp}
                </div>
              </button>
            ))}
          </div>

          {/* Admin Review Result */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedAnalysis ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-700 bg-slate-900/20">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                  <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-lg font-black tracking-tight text-slate-600">Select Activity for Review</p>
                <p className="text-xs max-w-[240px] text-center mt-2 font-medium opacity-40">Access deep AI moderation, hallucination scans, and safety compliance reports.</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[70vh] shadow-2xl relative">
                <div className="p-5 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                    <h3 className="font-black text-xs uppercase tracking-widest">Internal Report: {selectedAnalysis.userId}</h3>
                  </div>
                  <button onClick={() => setSelectedAnalysis(null)} className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        Raw AI Transaction Log
                      </h4>
                      <span className="text-[9px] font-mono text-slate-700 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">REF: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl text-[11px] text-slate-400 font-mono leading-relaxed border border-slate-800/50 shadow-inner">
                      {selectedAnalysis.analysisOutput}
                    </div>
                  </section>

                  <section className="border-t border-slate-800 pt-12 relative">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center">
                        <svg className="w-3 h-3 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                        Moderation & Quality Report
                      </h4>
                    </div>
                    
                    {isProcessing ? (
                      <div className="space-y-6">
                        <div className="h-4 bg-slate-800 rounded-lg animate-pulse w-full"></div>
                        <div className="h-4 bg-slate-800 rounded-lg animate-pulse w-11/12"></div>
                      </div>
                    ) : adminReport ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-slate">
                        {adminReport.split('\n').map((line, i) => (
                          <p key={i} className="text-slate-400 mb-4 leading-relaxed font-medium">{line}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-slate-950/30 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-slate-400 text-sm font-bold mb-8 max-w-[240px] mx-auto">Analyze output for hallucinations, legal overreach, and tone compliance.</p>
                        <button 
                          onClick={() => handleReview(selectedAnalysis)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98]"
                        >
                          Run Compliance Scan
                        </button>
                      </div>
                    )}
                  </section>
                </div>

                <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 text-[9px] font-black text-slate-700 uppercase tracking-widest flex justify-between items-center">
                  <span>Clause Detective Security Protocol v8.0.2</span>
                  <span>CONFIDENTIAL - INTERNAL ONLY</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
