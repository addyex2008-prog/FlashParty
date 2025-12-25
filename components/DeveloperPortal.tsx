
import React, { useState, useRef } from 'react';
import { MOCK_DEVELOPERS, MOCK_VENDORS } from '../services/mockData';
import { DeveloperPartner, DevRank, DevelopedVendorInfo } from '../types';

interface DeveloperPortalProps {
  onBack: () => void;
}

const RANK_CONFIG: Record<DevRank, { icon: string; color: string; bg: string; shadow: string }> = {
  [DevRank.BRONZE]: { icon: '🥉', color: 'text-[#CD7F32]', bg: 'from-[#CD7F32]/20 to-black', shadow: 'shadow-[#CD7F32]/30' },
  [DevRank.SILVER]: { icon: '🥈', color: 'text-[#C0C0C0]', bg: 'from-[#C0C0C0]/20 to-black', shadow: 'shadow-[#C0C0C0]/30' },
  [DevRank.GOLD]: { icon: '🥇', color: 'text-[#FFD700]', bg: 'from-[#FFD700]/20 to-black', shadow: 'shadow-[#FFD700]/30' },
  [DevRank.DIAMOND]: { icon: '💎', color: 'text-[#B9F2FF]', bg: 'from-[#B9F2FF]/20 to-black', shadow: 'shadow-[#B9F2FF]/30' },
  [DevRank.METEORITE]: { icon: '☄️', color: 'text-[#FF4500]', bg: 'from-[#FF4500]/20 to-black', shadow: 'shadow-[#FF4500]/30' },
  [DevRank.COSMIC_GEM]: { icon: '🌌', color: 'text-[#A020F0]', bg: 'from-[#A020F0]/20 to-black', shadow: 'shadow-[#A020F0]/50' },
};

const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'LOGIN' | 'DASHBOARD'>('LOGIN');
  const [selectedDev, setSelectedDev] = useState<DeveloperPartner | null>(null);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PERFORMANCE' | 'VENDORS'>('PROFILE');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Vendors Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const dev = MOCK_DEVELOPERS.find(d => d.account === account && account === password);
    if (dev) {
      setSelectedDev(JSON.parse(JSON.stringify(dev)));
      setCurrentStep('DASHBOARD');
      setError('');
    } else {
      setError('帳號或密碼錯誤 (測試提示：1/1, 2/2...)');
    }
  };

  const quickLogin = (acc: string) => {
    setAccount(acc);
    setPassword(acc);
    const dev = MOCK_DEVELOPERS.find(d => d.account === acc);
    if (dev) {
      setSelectedDev(JSON.parse(JSON.stringify(dev)));
      setCurrentStep('DASHBOARD');
    }
  };

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (selectedDev && e.target?.result) {
        setSelectedDev({ ...selectedDev, avatarUrl: e.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderLogin = () => (
    <div className="max-w-md mx-auto pt-32 px-8 animate-fade-in relative z-10">
      <div className="glass-card p-12 rounded-[48px] border border-white/10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
           <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
           </svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">開發夥伴系統</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-10">Partner Dashboard</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="text" 
            value={account} 
            onChange={e => setAccount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600" 
            placeholder="夥伴帳號"
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600" 
            placeholder="登入密碼"
          />
          {error && <p className="text-red-400 text-[10px] font-bold animate-pulse">{error}</p>}
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            進入後台
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4">測試帳號快捷登入</p>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button 
                key={n} 
                onClick={() => quickLogin(String(n))}
                className="w-8 h-8 rounded-lg bg-white/5 text-[10px] font-black hover:bg-indigo-600 transition-all border border-white/5 text-slate-400 hover:text-white"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    const config = RANK_CONFIG[selectedDev!.rank];
    return (
      <div className="animate-fade-in space-y-12 pb-20">
        <div className="flex flex-col items-center">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className={`relative w-44 h-44 rounded-[48px] overflow-hidden border-4 transition-all cursor-pointer group p-1 ${config.shadow} shadow-2xl border-white/10 bg-gradient-to-br ${config.bg}`}
          >
            <img src={selectedDev!.avatarUrl} className="w-full h-full object-cover rounded-[40px] group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-full shadow-lg">更換照片</span>
            </div>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => e.target.files && handleAvatarChange(e.target.files[0])} />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-4xl font-black text-white mb-2">{selectedDev!.name}</h3>
            <div className={`flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 inline-flex`}>
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-sm font-black uppercase tracking-[0.2em] ${config.color}`}>{selectedDev!.rank} 等級開發官</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: '暱稱', value: selectedDev!.nickname },
            { label: 'Email', value: selectedDev!.email },
            { label: '聯絡電話', value: selectedDev!.phone },
            { label: '收件地址', value: selectedDev!.address },
            { label: '生日', value: selectedDev!.birthday },
            { label: '專屬推薦碼', value: selectedDev!.referralCode, highlight: true }
          ].map((item, idx) => (
            <div key={idx} className={`glass-card p-6 rounded-3xl border border-white/10 group hover:border-indigo-500/50 transition-all ${item.highlight ? 'bg-indigo-600/10 border-indigo-500/30' : ''}`}>
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">{item.label}</label>
              <div className={`text-base font-bold ${item.highlight ? 'text-indigo-400 text-xl tracking-widest' : 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPerformance = () => (
    <div className="animate-fade-in space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[40px] border border-white/10 text-center relative overflow-hidden group">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">累積開發供應商數量</div>
          <div className="text-6xl font-black text-white tracking-tighter">{selectedDev!.performance.totalVendors}</div>
        </div>
        <div className="glass-card p-8 rounded-[40px] border border-white/10 text-center bg-indigo-600/5 group">
          <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-4">本月開發數量</div>
          <div className="text-6xl font-black text-white tracking-tighter">{selectedDev!.performance.monthlyVendors}</div>
        </div>
        <div className="glass-card p-8 rounded-[40px] border border-white/10 text-center bg-white/5">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">距離下個等級還有</div>
          <div className="text-4xl font-black text-white tracking-tight">{selectedDev!.performance.nextRankThreshold} <span className="text-sm text-slate-500">筆</span></div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[48px] border border-white/10 shadow-2xl">
        <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center">
          <span className="w-2 h-6 bg-indigo-500 rounded-full mr-4"></span>
          本月獎金結算看板
        </h4>
        <div className="grid grid-cols-1 gap-8">
          {[
            { label: '本月累積媒合獎金', value: selectedDev!.performance.monthlyMatchBonus, color: 'text-white' },
            { label: '本月累積開發獎金', value: selectedDev!.performance.monthlyDevBonus, color: 'text-indigo-400' },
            { label: '本月累積推薦獎金', value: selectedDev!.performance.monthlyReferralBonus, color: 'text-emerald-400' }
          ].map((bonus, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white/5 p-8 rounded-[32px] border border-white/5 group hover:bg-white/10 transition-all">
              <span className="text-slate-400 font-black text-sm uppercase tracking-widest">{bonus.label}</span>
              <span className={`text-4xl font-black ${bonus.color} tracking-tighter`}>${bonus.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-6 p-8 border-t border-white/10">
            <span className="text-white font-black text-lg uppercase tracking-widest">本月預計實領總額</span>
            <span className="text-6xl font-black text-indigo-500 neon-text tracking-tighter">
              ${(selectedDev!.performance.monthlyMatchBonus + selectedDev!.performance.monthlyDevBonus + selectedDev!.performance.monthlyReferralBonus).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVendors = () => {
    // 1. Map developedVendors objects to actual mock vendor data + joinDate
    const vendorsWithData = selectedDev!.developedVendors
      .map(devInfo => {
        const vendor = MOCK_VENDORS.find(v => v.id === devInfo.vendorId);
        return vendor ? { ...vendor, joinDate: devInfo.joinDate } : null;
      })
      .filter((v): v is (typeof MOCK_VENDORS[0] & { joinDate: string }) => v !== null);

    // 2. Filter by search term
    const filtered = vendorsWithData.filter(v => v.name.includes(searchTerm));

    // 3. Sort by join date
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.joinDate).getTime();
      const dateB = new Date(b.joinDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
      <div className="animate-fade-in space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2 mb-8">
          <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-4">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  我的開發清單
              </h3>
              <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-4 py-1.5 rounded-full font-black border border-indigo-500/30 uppercase tracking-widest">
                  Total {sorted.length}
              </span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <input 
                  type="text" 
                  placeholder="搜尋供應商..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none flex-1 md:w-64"
              />
              <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                  <span>{sortOrder === 'asc' ? '最早加入' : '最近加入'}</span>
                  <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
          </div>
        </div>

        <div className="space-y-4">
          {sorted.map((vendor) => (
            <div key={vendor.id} className="glass-card p-6 rounded-3xl border border-white/10 flex items-center gap-6 group hover:border-indigo-500/30 transition-all">
               <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img src={vendor.imageUrl} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="text-white font-bold text-lg">{vendor.name}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{vendor.category}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-indigo-400 font-black text-lg">{vendor.rating} ★</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase">{vendor.reviewCount} 評價</div>
                     </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                      <div className="text-[10px] text-slate-500 font-bold">
                          加入日期: <span className="text-slate-300">{vendor.joinDate}</span>
                      </div>
                      <button className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all font-bold">
                          查看詳情
                      </button>
                  </div>
               </div>
            </div>
          ))}
          {sorted.length === 0 && (
              <div className="text-center py-20 text-slate-500 font-bold">
                  沒有找到符合的供應商
              </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto pt-20 px-6 animate-fade-in relative z-10 pb-48">
      <div className="flex justify-between items-center mb-10">
         <div>
            <h2 className="text-3xl font-black text-white tracking-tight">夥伴後台</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Welcome back, {selectedDev!.nickname}</p>
         </div>
         <button 
            onClick={() => { setCurrentStep('LOGIN'); setSelectedDev(null); }}
            className="px-6 py-3 rounded-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all"
         >
            登出
         </button>
      </div>

      <div className="flex space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2">
        {[
            { id: 'PROFILE', label: '個人資料' },
            { id: 'PERFORMANCE', label: '成效報表' },
            { id: 'VENDORS', label: '開發清單' }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {activeTab === 'PROFILE' && renderProfile()}
      {activeTab === 'PERFORMANCE' && renderPerformance()}
      {activeTab === 'VENDORS' && renderVendors()}

    </div>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
        <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none z-0"></div>
        
        {currentStep === 'LOGIN' && renderLogin()}
        {currentStep === 'DASHBOARD' && renderDashboard()}
        
        {currentStep === 'LOGIN' && (
            <button 
                onClick={onBack} 
                className="fixed bottom-10 left-10 text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 z-50 bg-black/50 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md hover:border-white/20"
            >
                <span>←</span> 回首頁
            </button>
        )}
    </div>
  );
};

export default DeveloperPortal;
