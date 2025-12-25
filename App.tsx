
import React, { useState } from 'react';
import VendorPortal from './components/VendorPortal';
import ClientWizard from './components/ClientWizard';
import DeveloperPortal from './components/DeveloperPortal';
import { MOCK_ORDERS, MOCK_VENDORS, calculateVendorCostBreakdown } from './services/mockData';
import { Order, SelectedService } from './types';

type ViewMode = 'LANDING' | 'CLIENT' | 'VENDOR' | 'MEMBER_CENTER' | 'DEVELOPER';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LANDING');
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  
  // State for Member Center Modal
  const [selectedOrderVendor, setSelectedOrderVendor] = useState<{order: Order, selection: SelectedService} | null>(null);

  const renderClientOrderDetailModal = () => {
      if (!selectedOrderVendor) return null;
      const { order, selection } = selectedOrderVendor;
      const vendor = MOCK_VENDORS.find(v => v.id === selection.vendorId);
      const pkg = vendor?.packages?.find(p => p.id === selection.packageId);
      const breakdown = calculateVendorCostBreakdown(vendor!, order.userRequest, order.durationHours, selection.packageId, selection.options);

      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrderVendor(null)}></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 w-full max-w-xl shadow-[0_0_80px_rgba(244,96,17,0.3)] animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h4 className="text-2xl font-black text-white flex items-center">
                        <span className="w-2 h-8 bg-primary mr-4 rounded-full"></span>
                        訂單細項內容
                    </h4>
                    <button onClick={() => setSelectedOrderVendor(null)} className="text-slate-500 hover:text-white text-xl">✕</button>
                </div>

                <div className="space-y-8 mb-10">
                    <div className="bg-white/5 p-6 rounded-3xl">
                        <span className="text-sm text-slate-500 font-bold block mb-2">供應商</span>
                        <div className="text-white font-bold text-2xl">{vendor?.name}</div>
                        <div className="text-primary font-bold text-sm uppercase mt-1">{selection.category}</div>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-3xl border border-primary/20">
                        <span className="text-sm text-slate-500 font-bold block mb-2">服務項目</span>
                        <div className="text-white font-bold text-xl">{pkg?.name || '基本服務'}</div>
                        {selection?.options?.deliveryMethod && <div className="text-primary text-base font-bold mt-2">方式: {selection.options.deliveryMethod === 'setup' ? '專人佈置' : (selection.options.deliveryMethod === 'delivery' ? '外送' : '自取')}</div>}
                        {selection?.options?.pickupTime && <div className="text-slate-400 text-base font-bold mt-1">預計時間: {selection.options.pickupTime}</div>}
                        
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            {breakdown.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-base">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-white font-bold">${item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-xl font-black text-primary pt-4 border-t border-white/10 mt-4">
                                <span>總計</span>
                                <span>${breakdown.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setSelectedOrderVendor(null)} className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-lg transition-all">關閉</button>
                </div>
            </div>
        </div>
      );
  };

  const renderConceptModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setShowConceptModal(false)}></div>
      
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[48px] shadow-[0_0_80px_rgba(244,96,17,0.3)] p-6 md:p-12 animate-fade-in-up">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl md:text-4xl font-black text-white flex items-center tracking-tight">
                    <span className="w-3 h-10 bg-gradient-to-b from-[#f46011] to-[#f9cd34] mr-4 md:mr-6 rounded-full shadow-[0_0_20px_rgba(244,96,17,0.5)]"></span>
                    什麼是「一站式媒合」？
                </h3>
                <button 
                    onClick={() => setShowConceptModal(false)}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Visual Flow Chart - Mobile Stacked, Desktop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center mb-12">
                {/* Step 1: User */}
                <div className="md:col-span-2 flex flex-col items-center text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl mb-4 border border-white/10 shadow-lg">👤</div>
                    <h4 className="font-bold text-white text-xl">您 (活動主辦)</h4>
                    <p className="text-sm text-slate-500 mt-2 font-bold">只需填寫 <span className="text-primary">1 張</span> 需求單</p>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 flex justify-center py-4 md:py-0">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-primary font-black uppercase tracking-widest hidden md:block">Auto</span>
                        <svg className="w-10 h-10 text-primary animate-pulse transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                </div>

                {/* Center: Platform */}
                <div className="md:col-span-1 flex justify-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#f46011] to-[#f9a234] rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(244,96,17,0.5)] transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="font-black text-white text-3xl italic tracking-tighter">EZ</span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 flex justify-center py-4 md:py-0">
                    <div className="flex flex-col items-center gap-1">
                         <span className="text-xs text-primary font-black uppercase tracking-widest hidden md:block">Match</span>
                         <svg className="w-10 h-10 text-primary animate-pulse transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                </div>

                {/* Step 3: Vendors */}
                <div className="md:col-span-2 flex flex-col items-center text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">🎤</div>
                        <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl">🎈</div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">📸</div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">🍰</div>
                    </div>
                    <h4 className="font-bold text-white text-xl">多類別供應商</h4>
                    <p className="text-sm text-slate-500 mt-2 font-bold">同步收到通知並報價</p>
                </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-gradient-to-r from-white/5 to-transparent p-8 md:p-10 rounded-[32px] border border-white/10">
                <h5 className="text-primary font-black text-base uppercase tracking-[0.2em] mb-6">為什麼選擇 EZparty?</h5>
                <p className="text-slate-300 leading-loose text-base md:text-lg font-medium">
                    傳統辦活動，您需要分別聯絡主持人、佈置、攝影師、外燴...重複說明相同的需求 N 次。
                    <br/>
                    <span className="text-white">在 EZparty，一切化繁為簡。</span>
                    您只需要輸入一次時間、地點與預算，系統會自動根據您的需求，
                    <span className="text-[#f9a234] border-b border-[#f9a234]/50 pb-0.5">即時媒合所有相關類別的優質供應商</span>。
                    您可以一次預覽所有人的報價、作品集與檔期，像點餐一樣輕鬆組建您的夢幻團隊。
                </p>
            </div>
            
            <button 
                onClick={() => setShowConceptModal(false)}
                className="w-full mt-8 py-5 bg-[#f46011] hover:bg-[#d9520e] text-white rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all"
            >
                了解了，立即體驗
            </button>
         </div>
      </div>
    </div>
  );

  const renderQuoteModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setShowQuoteModal(false)}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[48px] shadow-[0_0_80px_rgba(244,96,17,0.3)] p-6 md:p-12 animate-fade-in-up">
         {/* Background Decoration */}
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl md:text-4xl font-black text-white flex items-center tracking-tight">
                    <span className="w-3 h-10 bg-gradient-to-b from-emerald-400 to-emerald-600 mr-4 md:mr-6 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]"></span>
                    什麼是「即時報價」？
                </h3>
                <button 
                    onClick={() => setShowQuoteModal(false)}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Traditional Way */}
                <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 flex flex-col items-center opacity-70 hover:opacity-100 transition-all duration-500">
                    <div className="text-sm md:text-base font-black text-slate-500 uppercase tracking-widest mb-6">傳統詢價流程 (Old Way)</div>
                    
                    <div className="space-y-4 w-full max-w-[95%] mx-auto">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm md:text-base text-slate-300 text-center relative">
                            活動方私訊等待回覆 <span className="text-slate-500 block text-xs mt-1">(10-60分鐘)</span>
                        </div>
                        <div className="flex justify-center text-slate-700 text-sm">↓</div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm md:text-base text-slate-300 text-center">
                            廠商回覆後初估報價 <span className="text-slate-500 block text-xs mt-1">(60分鐘-1天)</span>
                        </div>
                        <div className="flex justify-center text-slate-700 text-sm">↓</div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm md:text-base text-slate-300 text-center">
                            活動方(親友討論/長官)等待結果 <span className="text-slate-500 block text-xs mt-1">(60分鐘-1天)</span>
                        </div>
                    </div>

                    <div className="mt-8 py-4 px-8 bg-red-500/10 text-red-400 rounded-xl text-base font-black w-full text-center border border-red-500/20">平均耗時：3 ~ 7 天</div>
                </div>

                {/* EZparty Way */}
                <div className="bg-gradient-to-br from-emerald-900/20 to-black rounded-[32px] p-8 border border-emerald-500/30 flex flex-col items-center justify-between text-center shadow-[0_0_30px_rgba(52,211,153,0.1)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <div className="w-full">
                        <div className="text-sm md:text-base font-black text-emerald-400 uppercase tracking-widest mb-8">EZparty 智慧系統</div>
                        <div className="w-28 h-28 bg-emerald-500/20 rounded-full flex items-center justify-center text-6xl mb-8 shadow-lg shadow-emerald-500/20 mx-auto">⚡️</div>
                        <ul className="space-y-6 text-base md:text-lg text-slate-200 text-left w-full pl-6">
                            <li className="flex items-center gap-4">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,1)]"></span>
                                輸入日期與地點
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,1)]"></span>
                                系統自動計算距離車馬費
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,1)]"></span>
                                <span className="text-white font-bold text-xl">立刻顯示最終總價</span>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8 py-4 px-8 bg-emerald-500 text-black rounded-2xl text-base font-black shadow-lg shadow-emerald-500/30 animate-pulse w-full">平均耗時：0.1 秒</div>
                </div>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <p className="text-slate-300 text-base leading-relaxed font-medium">
                    EZparty 要求所有供應商設定標準化的 <span className="text-emerald-400 font-bold">透明價格與加價規則</span>。
                    當您選擇地點與時段時，系統後端會自動計算跨區車馬費、夜間加成或特殊節日費用。
                    <span className="block mt-2 text-white font-bold text-lg">您看到的價格，就是最終成交價。不再有隱藏費用。</span>
                </p>
            </div>
            
            <button 
                onClick={() => setShowQuoteModal(false)}
                className="w-full mt-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all"
            >
                太棒了！開始詢價
            </button>
         </div>
      </div>
    </div>
  );

  const renderScheduleModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setShowScheduleModal(false)}></div>
      
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[48px] shadow-[0_0_80px_rgba(99,102,241,0.3)] p-6 md:p-12 animate-fade-in-up">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl md:text-4xl font-black text-white flex items-center tracking-tight">
                    <span className="w-3 h-10 bg-gradient-to-b from-indigo-400 to-indigo-600 mr-4 md:mr-6 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></span>
                    什麼是「檔期秒定」？
                </h3>
                <button 
                    onClick={() => setShowScheduleModal(false)}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white/5 rounded-[32px] p-10 border border-white/5 text-center flex flex-col justify-center opacity-60">
                    <div className="text-6xl mb-8">📅 ?</div>
                    <h4 className="text-white font-bold text-2xl mb-6">痛苦的「喬」時間</h4>
                    <p className="text-lg text-slate-400 leading-loose">
                        「請問這天有空嗎？」<br/>
                        「不好意思這天滿了。」<br/>
                        「那下週呢？」<br/>
                        「我確認一下行事曆...」
                    </p>
                </div>

                <div className="bg-indigo-900/20 rounded-[32px] p-10 border border-indigo-500/30 text-center flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                    <div className="text-6xl mb-8">✅ OK</div>
                    <h4 className="text-white font-bold text-2xl mb-6">實時同步行事曆</h4>
                    <p className="text-lg text-indigo-200 leading-loose font-bold">
                        供應商後台與平台即時連線。<br/>
                        您選定日期的瞬間，<br/>
                        系統只顯示「當天有空」的廠商。<br/>
                        <span className="text-white border-b-2 border-indigo-400 pb-1 inline-block mt-4">看到就能訂，不用問！</span>
                    </p>
                </div>
            </div>

            <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-full mt-4 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 transition-all"
            >
                立即查看檔期
            </button>
         </div>
      </div>
    </div>
  );

  const renderSimModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setShowSimModal(false)}></div>
      
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[48px] shadow-[0_0_80px_rgba(236,72,153,0.3)] p-6 md:p-12 animate-fade-in-up">
         <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl md:text-4xl font-black text-white flex items-center tracking-tight">
                    <span className="w-3 h-10 bg-gradient-to-b from-pink-400 to-pink-600 mr-4 md:mr-6 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]"></span>
                    什麼是「模擬畫面」？
                </h3>
                <button 
                    onClick={() => setShowSimModal(false)}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-10">
                <div className="flex-1 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">👁️</div>
                    <h4 className="text-white font-bold text-xl mb-4">眼見為憑 (WYSIWYG)</h4>
                    <p className="text-slate-400 text-base leading-relaxed">
                        不要靠想像力辦活動。EZparty 整合廠商豐富的影音作品集與方案實景照，讓您在下訂前就能看見 90% 的現場還原度。
                    </p>
                </div>
                <div className="flex-1 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🤖</div>
                    <h4 className="text-white font-bold text-xl mb-4">AI 智能企劃</h4>
                    <p className="text-slate-400 text-base leading-relaxed">
                        系統內建 Gemini AI 引擎，能根據您選擇的廠商組合，自動生成活動流程模擬與氛圍建議，預演活動當天的精彩時刻。
                    </p>
                </div>
            </div>

            <button 
                onClick={() => setShowSimModal(false)}
                className="w-full mt-4 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-pink-500/20 transition-all"
            >
                體驗視覺化媒合
            </button>
         </div>
      </div>
    </div>
  );

  const renderMemberCenter = () => (
    <div className="min-h-screen bg-black pt-16 px-6 pb-40 max-w-5xl mx-auto animate-fade-in">
      {selectedOrderVendor && renderClientOrderDetailModal()}
      
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white flex items-center tracking-tighter">
            <span className="w-3 h-12 bg-indigo-500 mr-4 md:mr-6 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"></span>
            活動方會員中心
        </h2>
        <button 
          onClick={() => setView('LANDING')} 
          className="text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors"
        >
          回首頁
        </button>
      </div>
      
      <div className="space-y-12">
        <h3 className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">我的媒合委託紀錄 ({MOCK_ORDERS.length})</h3>
        {MOCK_ORDERS.length === 0 ? (
          <div className="text-center py-40 glass-card rounded-[40px] border border-white/5 border-dashed">
            <p className="text-slate-500 font-bold text-xl">目前尚無任何進行中的媒合委託</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {[...MOCK_ORDERS].reverse().map(order => (
              <div key={order.id} className="glass-card p-8 md:p-12 rounded-[48px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] space-y-12 hover:border-white/20 transition-all group">
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                  <div className="flex flex-col">
                      <span className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">委託單編號</span>
                      <span className="text-white font-black text-4xl tracking-tight">{order.id}</span>
                  </div>
                  <div className="flex flex-col items-end">
                      <span className="text-sm px-8 py-3 bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 rounded-full font-black uppercase tracking-widest shadow-lg">待供應商確認預約</span>
                      <span className="text-sm text-slate-600 font-bold mt-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5"><span className="text-xs text-slate-500 font-black uppercase tracking-widest block mb-3">預計日期</span><span className="text-white font-bold text-2xl">{order.userRequest.date}</span></div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5"><span className="text-xs text-slate-500 font-black uppercase tracking-widest block mb-3">活動性質</span><span className="text-white font-bold text-2xl">{order.userRequest.eventType}</span></div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5"><span className="text-xs text-slate-500 font-black uppercase tracking-widest block mb-3">縣市地區</span><span className="text-white font-bold text-2xl">{order.userRequest.city}</span></div>
                  <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
                      <span className="text-xs text-primary font-black uppercase tracking-widest block mb-3">媒合總預算</span>
                      <div className="flex flex-col">
                        <span className="text-[#f46011] font-black text-4xl tracking-tighter">${order.totalCost.toLocaleString()}</span>
                        {order.discountApplied && <span className="text-sm text-green-500 font-bold mt-1">已扣除折扣 ${order.discountApplied.toLocaleString()}</span>}
                      </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-base font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-4"></span>
                      已選預約服務清單 ({order.selections.length})
                  </h4>
                  <p className="text-xs text-slate-600 font-bold">※ 點擊下方供應商卡片可查看訂單細項</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {order.selections.map((sel, i) => {
                      const vendor = MOCK_VENDORS.find(v => v.id === sel.vendorId);
                      const isPending = !sel.status || sel.status === 'PENDING';
                      return (
                        <div 
                            key={i} 
                            onClick={() => setSelectedOrderVendor({order, selection: sel})}
                            className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all cursor-pointer hover:scale-105 active:scale-95 ${isPending ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'}`}
                        >
                          <div className="relative">
                              <img src={vendor?.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                              {!isPending && (
                                  <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-1.5 border-4 border-black">
                                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                              )}
                          </div>
                          <div className="flex flex-col overflow-hidden flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm text-indigo-400 font-black uppercase truncate">{sel.category}</span>
                                <span className={`text-xs font-black uppercase ${isPending ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {isPending ? '待確認' : '已承接'}
                                </span>
                            </div>
                            <span className="text-lg text-white font-bold truncate">{vendor?.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.aiPlan && (
                    <div className="bg-indigo-900/10 border border-indigo-500/10 p-10 rounded-[32px]">
                        <h4 className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                            AI 智能活動企劃建議
                        </h4>
                        <p className="text-base text-slate-300 whitespace-pre-line leading-loose italic">{order.aiPlan.substring(0, 300)}...</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen bg-transparent relative flex flex-col items-center justify-center px-8 py-10 overflow-hidden">
      {/* LOGO 移至畫面左上 (RWD adjusted) */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 z-50">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#f46011] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(244,96,17,0.5)]">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
        </div>
      </div>

      {/* 管理中心按鈕移至畫面右上 (RWD adjusted) */}
      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={() => setView('MEMBER_CENTER')} 
          className="group relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 hover:bg-white/15 transition-all border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
          title="活動方管理中心"
        >
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white mb-0.5 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:block text-[8px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-tighter">Login</span>
          </div>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 animate-fade-in-up -mt-10">
        <h1 className="text-7xl md:text-[80px] font-bold tracking-tight text-white mb-0 md:mb-0 neon-text outline-none leading-none md:leading-none">
            極速派對
        </h1>
        <h2 className="text-7xl md:text-[90px] font-black italic tracking-tighter mb-12 md:mb-20 neon-text text-transparent bg-clip-text bg-gradient-to-b from-[#f9a234] to-[#ed5c11] leading-none md:leading-none">EZparty</h2>
        <p className="text-slate-100 text-sm md:text-lg tracking-[0.1em] mb-12 opacity-90 font-medium uppercase outline-none neon-white-text flex flex-wrap justify-center items-center gap-2 md:gap-6 px-4">
            <span 
                onClick={() => setShowConceptModal(true)}
                className="cursor-pointer border-b border-white/30 hover:border-primary hover:text-primary transition-all pb-1 flex items-center gap-2 group whitespace-nowrap"
            >
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                一站式媒合
            </span>
             <span className="opacity-50">×</span> 
            <span 
                onClick={() => setShowQuoteModal(true)}
                className="cursor-pointer border-b border-white/30 hover:border-emerald-400 hover:text-emerald-400 transition-all pb-1 flex items-center gap-2 group whitespace-nowrap"
            >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-75"></span>
                即時報價
            </span>
             <span className="opacity-50">×</span> 
             <span 
                onClick={() => setShowScheduleModal(true)}
                className="cursor-pointer border-b border-white/30 hover:border-indigo-400 hover:text-indigo-400 transition-all pb-1 flex items-center gap-2 group whitespace-nowrap"
            >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse delay-100"></span>
                檔期秒定
            </span>
             <span className="opacity-50">×</span> 
             <span 
                onClick={() => setShowSimModal(true)}
                className="cursor-pointer border-b border-white/30 hover:border-pink-400 hover:text-pink-400 transition-all pb-1 flex items-center gap-2 group whitespace-nowrap"
            >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse delay-150"></span>
                模擬畫面
            </span>
        </p>

        <div className="w-[70%] md:w-full md:max-w-[360px] space-y-5 md:space-y-8">
          <button 
            onClick={() => setView('CLIENT')} 
            className="w-full py-4 md:py-6 px-4 md:px-8 rounded-[28px] flex items-center justify-center text-black font-black text-lg md:text-xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-[#f46424] to-[#f9cd34] shadow-[0_20px_50px_rgba(244,96,17,0.4)] uppercase tracking-widest opacity-90"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 mr-3 md:mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            立即開始媒合
          </button>
          <button 
            onClick={() => setView('VENDOR')} 
            className="w-full py-4 md:py-6 px-4 md:px-8 rounded-[28px] flex items-center justify-center text-white font-black text-lg md:text-xl transition-all hover:bg-white/10 active:scale-95 bg-[#1a1a1a]/50 border border-white/10 backdrop-blur-md uppercase tracking-widest"
          >
            {/* 更換為雙人擊掌圖案的 SVG */}
            <svg className="w-6 h-6 md:w-7 md:h-7 mr-3 md:mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            我是供應商
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20">
        <button 
          onClick={() => setView('DEVELOPER')} 
          className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 hover:bg-indigo-600 transition-all border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden"
          title="開發夥伴登入"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.6 12.2l-3.8-3.8a2.83 2.83 0 00-4 0l-1.7 1.7a2.83 2.83 0 000 4l.9.9-2.1 2.1a2.83 2.83 0 01-4 0l-3.8-3.8a2.83 2.83 0 114-4l2.1 2.1.9-.9a2.83 2.83 0 000-4L8.4 2.4a2.83 2.83 0 00-4 0l-2 2a2.83 2.83 0 000 4l6.2 6.2a2.83 2.83 0 004 0l2.1-2.1.9.9a2.83 2.83 0 004 0l2-2a2.83 2.83 0 000-4z" />
          </svg>
          <span className="absolute -left-32 bg-black/80 text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">開發夥伴後台</span>
        </button>
      </div>

      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[140%] h-[60vh] bg-gradient-to-t from-[#f46011]/50 via-[#f46011]/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      {showConceptModal && renderConceptModal()}
      {showQuoteModal && renderQuoteModal()}
      {showScheduleModal && renderScheduleModal()}
      {showSimModal && renderSimModal()}
      {view === 'LANDING' && renderLanding()}
      {view === 'CLIENT' && <ClientWizard onBack={() => setView('LANDING')} onGoToMemberCenter={() => setView('MEMBER_CENTER')} />}
      {view === 'VENDOR' && <VendorPortal onBack={() => setView('LANDING')} />}
      {view === 'MEMBER_CENTER' && renderMemberCenter()}
      {view === 'DEVELOPER' && <DeveloperPortal onBack={() => setView('LANDING')} />}
    </div>
  );
};

export default App;
