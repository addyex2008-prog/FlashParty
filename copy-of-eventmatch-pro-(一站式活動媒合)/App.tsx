
import React, { useState } from 'react';
import VendorPortal from './components/VendorPortal';
import ClientWizard from './components/ClientWizard';

type ViewMode = 'LANDING' | 'CLIENT' | 'VENDOR';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LANDING');

  const renderLanding = () => (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-center items-center p-4">
      {/* Decorative Background Elements (Dark Mode) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-yellow-600/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center mb-16 animate-fade-in-up relative z-10">
        <h1 
          data-text="極速派對"
          className="fire-text text-7xl md:text-9xl font-black tracking-tighter mb-4 transform -skew-x-6 py-4 px-2"
        >
          極速派對
        </h1>
        
        <p className="text-lg text-slate-400 mt-8 max-w-xl mx-auto leading-relaxed border-l-2 border-orange-500 pl-4">
          全台首創一站式活動媒合。<br/>
          <span className="text-orange-300">即時報價</span> × <span className="text-red-300">智能匹配</span> × <span className="text-yellow-300">極速規劃</span> × <span className="text-orange-400">模擬佈置</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        {/* Client Card - Fire Icon */}
        <div 
          onClick={() => setView('CLIENT')}
          className="group relative bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700 overflow-hidden cursor-pointer hover:border-orange-500/50 hover:shadow-[0_0_50px_rgba(234,88,12,0.2)] transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            {/* Dynamic Burning Fire Animation */}
            <div className="fire-container transform group-hover:scale-110 transition-transform duration-500">
                <div className="fire-flame"></div>
                <div className="fire-flame"></div>
                <div className="fire-flame"></div>
                <div className="fire-smoke"></div>
                <div className="fire-smoke"></div>
                <div className="fire-smoke"></div>
                <div className="ember"></div>
                <div className="ember"></div>
                <div className="ember"></div>
            </div>

          </div>
          <div className="p-8 text-center relative">
            <h3 className="text-3xl font-black text-slate-100 mb-3 group-hover:text-orange-400 transition-colors">我要辦活動</h3>
            <p className="text-slate-400 text-sm mb-8 font-light tracking-wide">
              快速尋找主持人、攝影師或場地佈置<br/>輸入需求，立即獲得透明報價
            </p>
            <div className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-full group-hover:shadow-[0_0_20px_rgba(234,88,12,0.6)] transition-all shadow-lg">
              開始預約 <span className="ml-2 animate-bounce">🔥</span>
            </div>
          </div>
        </div>

        {/* Vendor Card - Store Icon */}
        <div 
          onClick={() => setView('VENDOR')}
          className="group relative bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_0_50px_rgba(99,102,241,0.2)] transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(45deg, #6366f1 25%, transparent 25%, transparent 75%, #6366f1 75%, #6366f1), linear-gradient(45deg, #6366f1 25%, transparent 25%, transparent 75%, #6366f1 75%, #6366f1)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'}}></div>
             {/* Store/Briefcase Icon */}
             <svg className="w-24 h-24 text-indigo-500 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="p-8 text-center relative">
            <h3 className="text-3xl font-black text-slate-100 mb-3 group-hover:text-indigo-400 transition-colors">我是供應商</h3>
            <p className="text-slate-400 text-sm mb-8 font-light tracking-wide">
              管理接案檔期，讓客戶自動找上門<br/>簡單、隱私、高效率
            </p>
            <div className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all shadow-lg">
              進入後台 <span className="ml-2">💎</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-slate-500 text-xs font-medium tracking-wide border-t border-slate-800 pt-6 w-full max-w-4xl text-center">
        © 2024 極速派對 Speedy Party. All rights reserved.
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {view === 'LANDING' && renderLanding()}
      {view === 'CLIENT' && (
        <div className="pt-4 bg-slate-950 min-h-screen">
           <button onClick={() => setView('LANDING')} className="absolute top-4 left-4 text-slate-400 hover:text-white z-20 flex items-center bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full shadow-md border border-slate-700 transition-all hover:border-orange-500">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             回首頁
           </button>
           <ClientWizard onBack={() => setView('LANDING')} />
        </div>
      )}
      {view === 'VENDOR' && <VendorPortal onBack={() => setView('LANDING')} />}
    </div>
  );
};

export default App;
