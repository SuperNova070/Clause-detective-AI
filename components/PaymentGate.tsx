
import React, { useState, useEffect } from 'react';
import { getPaymentGuidance } from '../services/geminiService';
import { PaymentStatus } from '../types';

interface PaymentGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGate: React.FC<PaymentGateProps> = ({ onSuccess, onCancel }) => {
  const [status, setStatus] = useState<PaymentStatus>('not_started');
  const [guidance, setGuidance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadGuidance(); }, [status]);

  const loadGuidance = async () => {
    setIsLoading(true);
    try {
      const text = await getPaymentGuidance(status);
      setGuidance(text);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const startPayment = (method: string) => {
    setStatus('pending');
    setTimeout(() => {
      const success = Math.random() > 0.05;
      if (success) {
        setStatus('successful');
        setTimeout(onSuccess, 2000);
      } else {
        setStatus('failed');
      }
    }, 3500);
  };

  /**
   * Helper to render guidance lines with appropriate formatting based on prefixes.
   * This structure prevents JSX parsing errors that can occur with complex mapping logic.
   */
  const renderGuidanceLine = (line: string, i: number) => {
    if (line.trim() === '') return null;

    if (line.startsWith('⭐')) {
      return (
        <h3 key={i} className="text-xl md:text-2xl font-black text-slate-950 flex items-center tracking-tighter mb-4 md:mb-5">
          {line.substring(1).trim()}
        </h3>
      );
    }

    if (line.startsWith('🔒')) {
      return (
        <div key={i} className="premium-gradient text-white p-7 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-bold my-6 md:my-8 leading-relaxed shadow-2xl shadow-violet-200 flex items-start">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 md:mr-5 shrink-0 shadow-inner">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm md:text-base leading-snug">{line.substring(1).trim()}</div>
        </div>
      );
    }

    if (line.startsWith('✅')) {
      return (
        <div key={i} className="bg-emerald-50 text-emerald-800 p-7 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-100 font-black my-6 md:my-8 flex items-center shadow-xl animate-in zoom-in duration-500">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl md:rounded-[1rem] flex items-center justify-center text-white mr-4 md:mr-5 shadow-lg shadow-emerald-200 animate-bounce shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-lg md:text-xl tracking-tighter leading-tight">{line.substring(1).trim()}</div>
        </div>
      );
    }

    if (line.startsWith('❌')) {
      return (
        <div key={i} className="bg-rose-50 text-rose-800 p-6 rounded-xl md:rounded-[1.5rem] border border-rose-100 font-bold my-6 md:my-8 shadow-sm text-xs md:text-sm">
          {line.substring(1).trim()}
        </div>
      );
    }

    if (line.startsWith('⏳')) {
      return (
        <div key={i} className="bg-slate-950 text-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] my-6 md:my-8 flex flex-col items-center justify-center shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-600/10 animate-pulse"></div>
          <svg className="animate-spin h-9 w-9 md:h-10 md:w-10 mb-5 md:mb-6 text-violet-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg md:text-xl font-black tracking-tight mb-2 md:mb-2.5">Confirming...</span>
          <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Secure verification</span>
        </div>
      );
    }

    return (
      <p key={i} className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-4.5 font-medium">
        {line}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] animate-in zoom-in duration-500">
        
        <div className="flex h-full min-h-0">
          {/* Progress Sidebar */}
          <div className="hidden lg:flex w-72 bg-slate-50 border-r border-slate-100 p-10 flex-col justify-between overflow-y-auto shrink-0">
             <div className="space-y-12">
                <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center text-white shadow-2xl shadow-violet-200">
                  <span className="font-black text-2xl tracking-tighter">C</span>
                </div>
                <div className="space-y-8">
                   <div className="flex items-start space-x-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${status === 'not_started' ? 'premium-gradient text-white shadow-lg shadow-violet-200/50' : 'bg-emerald-100 text-emerald-600'}`}>1</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Choose Plan</span>
                        <span className="text-[9px] text-slate-400 font-bold mt-1">Deep Audit Package</span>
                      </div>
                   </div>
                   <div className="flex items-start space-x-4 opacity-60">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${status === 'pending' ? 'premium-gradient text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Processing</span>
                        <span className="text-[9px] text-slate-400 font-bold mt-1">Safe verification</span>
                      </div>
                   </div>
                   <div className="flex items-start space-x-4 opacity-40">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${status === 'successful' ? 'premium-gradient text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Complete</span>
                        <span className="text-[9px] text-slate-400 font-bold mt-1">Unlock intelligence</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group mt-10 shrink-0">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-600 opacity-20"></div>
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">"Premium identified a hidden cost that saved me €3,000 upfront."</p>
                <div className="mt-4 flex items-center space-x-2.5">
                  <div className="w-5 h-5 bg-slate-100 rounded-lg"></div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">— TOBIAS K.</span>
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Modal Header */}
            <div className="p-6 md:p-8 pb-0 flex justify-between items-center shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter leading-tight truncate">Premium Access</h2>
                <div className="flex items-center space-x-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">SECURE CHECKOUT</p>
                </div>
              </div>
              <button 
                onClick={onCancel}
                className="p-2 md:p-3 text-slate-300 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 active:scale-95 shrink-0"
                disabled={status === 'pending' || status === 'successful'}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-6 custom-scrollbar min-h-0">
              {isLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-8 bg-slate-100 rounded-xl w-3/4"></div>
                  <div className="h-28 bg-slate-50 rounded-[1.5rem]"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                    <div className="h-24 bg-slate-50 rounded-[1.5rem]"></div>
                    <div className="h-24 bg-slate-50 rounded-[1.5rem]"></div>
                    <div className="h-24 bg-slate-50 rounded-[1.5rem]"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  <div className="prose prose-slate max-w-none">
                    {guidance.split('\n').map((line, i) => renderGuidanceLine(line, i))}
                  </div>

                  {status === 'not_started' && !isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 md:gap-4 mt-8 md:mt-10 animate-in slide-in-from-bottom-8 duration-700">
                      <button onClick={() => startPayment('paypal')} className="bg-white border border-slate-100 hover:border-violet-400 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center transition-all group shadow-sm hover:shadow-2xl active:scale-95">
                        <div className="text-violet-600 font-black text-xl md:text-2xl mb-1.5 md:mb-2 group-hover:scale-110 transition-transform italic">PayPal</div>
                        <span className="text-[8px] md:text-[9px] text-slate-300 font-black uppercase tracking-widest group-hover:text-slate-400 transition-colors">Instant</span>
                      </button>
                      <button onClick={() => startPayment('klarna')} className="bg-[#FFB3C7]/5 border border-[#FFB3C7]/10 hover:border-[#FFB3C7] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center transition-all group shadow-sm hover:shadow-2xl active:scale-95">
                        <div className="text-[#FFB3C7] font-black text-xl md:text-2xl mb-1.5 md:mb-2 group-hover:scale-110 transition-transform">Klarna.</div>
                        <span className="text-[8px] md:text-[9px] text-[#FFB3C7]/40 font-black uppercase tracking-widest group-hover:text-[#FFB3C7]/60 transition-colors">Pay in 30</span>
                      </button>
                      <button onClick={() => startPayment('card')} className="bg-white border border-slate-100 hover:border-violet-400 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center transition-all group shadow-sm hover:shadow-2xl active:scale-95">
                        <div className="text-slate-900 font-black text-xl md:text-2xl mb-1.5 md:mb-2 group-hover:scale-110 transition-transform flex space-x-1.5">
                          <svg className="w-8 h-8 md:w-9 md:h-9" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                        <span className="text-[8px] md:text-[9px] text-slate-300 font-black uppercase tracking-widest group-hover:text-slate-400 transition-colors">Card</span>
                      </button>
                    </div>
                  )}

                  {status === 'failed' && (
                    <button onClick={() => setStatus('not_started')} className="w-full bg-slate-950 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-slate-900 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-[0.25em] mt-6">Try Again</button>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] shrink-0">
               <div className="flex items-center space-x-2.5">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.942V14.41a1 1 0 01-.597.918l-7.5 3.5a1 1 0 01-.806 0l-7.5-3.5a1 1 0 01-.597-.918V5.842a1 1 0 01.666-.942zM10 14a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  <span>PCI-DSS COMPLIANT</span>
               </div>
               <div className="flex space-x-4 md:space-x-6 opacity-20 grayscale shrink-0">
                  <div className="w-8 h-5 md:w-10 md:h-6 bg-slate-400 rounded-lg"></div>
                  <div className="w-8 h-5 md:w-10 md:h-6 bg-slate-400 rounded-lg"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGate;
