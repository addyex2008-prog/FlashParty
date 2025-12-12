
import React, { useState } from 'react';
import { MOCK_VENDORS, TAIWAN_LOCATIONS } from '../services/mockData';
import { Vendor, ServiceCategory, EventType } from '../types';

interface VendorPortalProps {
  onBack: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const Icons = {
  Host: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Performer: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Photographer: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  AV: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
  Decor: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Florist: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, 
  Print: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Venue: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Food: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
};

const VENDOR_TYPES = [
  { 
    label: '軟體服務', 
    subcategories: [
      { id: ServiceCategory.PLANNER, label: '活動統籌師' }, // Moved here
      { id: ServiceCategory.HOST, label: '主持人' },
      { id: ServiceCategory.ACTOR, label: '魔術/演員' },
      { id: ServiceCategory.BAND, label: '樂團' },
      { id: ServiceCategory.SINGER, label: '歌手' },
      { id: ServiceCategory.DJ, label: 'DJ' },
      { id: ServiceCategory.DANCE, label: '舞蹈' },
      { id: ServiceCategory.BALLOON, label: '互動折氣球' },
      { id: ServiceCategory.PHOTOGRAPHER, label: '攝影師' },
      { id: ServiceCategory.VIDEOGRAPHY, label: '影片製作' },
      { id: ServiceCategory.PT, label: 'PT人員' },
    ],
    icon: <Icons.Host />, 
    color: 'from-pink-500 to-rose-500' 
  },
  { 
    label: '硬體服務', 
    subcategories: [
      { id: ServiceCategory.DECOR, label: '氣球佈置' },
      { id: ServiceCategory.FLORIST, label: '花藝' },
      { id: ServiceCategory.VENUE_RENTAL, label: '場地租借' },
      { id: ServiceCategory.STAGE_HARDWARE, label: '舞台/音響/燈光' }, // Merged
      { id: ServiceCategory.DESIGN_PRINT, label: '設計/背板輸出' }, // Merged
      { id: ServiceCategory.CAKE, label: '客製化蛋糕' },
      { id: ServiceCategory.CATERING, label: '餐點外燴' },
    ],
    icon: <Icons.AV />, 
    color: 'from-blue-500 to-indigo-600' 
  }
];

type PortalStep = 'SELECT_TYPE' | 'LOGIN' | 'DASHBOARD';
type DashboardTab = 'SCHEDULE' | 'PROFILE' | 'PACKAGES';

const VendorPortal: React.FC<VendorPortalProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<PortalStep>('SELECT_TYPE');
  const [activeTab, setActiveTab] = useState<DashboardTab>('SCHEDULE');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  
  // Schedule Editing
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Batch
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchWeekdays, setBatchWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); 
  const [batchStartHour, setBatchStartHour] = useState('0:00'); 
  const [batchEndHour, setBatchEndHour] = useState('23:00');   
  const [batchTargetMonths, setBatchTargetMonths] = useState<string[]>([new Date().toISOString().slice(0, 7)]);

  // UI Helper for managing travel fees
  const [selectedCityForFee, setSelectedCityForFee] = useState('');
  const [feeInput, setFeeInput] = useState('');

  // Host Surcharge
  const [selectedEventTypeForSurcharge, setSelectedEventTypeForSurcharge] = useState<string>('');
  const [surchargeInput, setSurchargeInput] = useState('');

  // Decorator Settings Modal
  const [isDecorSettingsModalOpen, setIsDecorSettingsModalOpen] = useState(false);
  const [decorSettingsTab, setDecorSettingsTab] = useState<'LOCATION' | 'TIME' | 'HOLIDAY'>('LOCATION');
  
  // Decorator Helper States
  const [locCity, setLocCity] = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locSetupFee, setLocSetupFee] = useState('');
  const [locTeardownFee, setLocTeardownFee] = useState('');
  const [locDeliveryFee, setLocDeliveryFee] = useState(''); // New: Delivery Fee Input
  const [newHolidayDate, setNewHolidayDate] = useState('');

  // Helper for available districts dropdown
  const availableDistrictsForDecor = locCity ? TAIWAN_LOCATIONS[locCity] : [];

  const handleCategorySelect = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setCurrentStep('LOGIN');
    setLoginId('');
    setLoginPwd('');
  };

  const handleLogin = (mockVendorId?: string) => {
    let targetId = mockVendorId || loginId;
    const vendor = MOCK_VENDORS.find(v => v.id === targetId);
    if (vendor) {
      setVendorData(JSON.parse(JSON.stringify(vendor))); 
      setCurrentStep('DASHBOARD');
      setActiveTab('SCHEDULE'); // Reset tab on login
    } else {
      alert("找不到此帳號");
    }
  };

  const handleLogout = () => {
      setVendorData(null); 
      setCurrentStep('SELECT_TYPE');
  };

  const handleProfileUpdate = (field: keyof Vendor, value: any) => {
    if (!vendorData) return;
    setVendorData({ ...vendorData, [field]: value });
    const idx = MOCK_VENDORS.findIndex(v => v.id === vendorData.id);
    if (idx !== -1) { (MOCK_VENDORS[idx] as any)[field] = value; }
  };

  const togglePauseStatus = () => {
    if (!vendorData) return;
    handleProfileUpdate('isPaused', !vendorData.isPaused);
  };

  const toggleLocation = (city: string) => {
    if (!vendorData) return;
    const areas = vendorData.serviceAreas.includes(city)
      ? vendorData.serviceAreas.filter(c => c !== city)
      : [...vendorData.serviceAreas, city];
    handleProfileUpdate('serviceAreas', areas);
  };

  // --- Decorator Complex Logic Updates ---
  
  // 1. Location Rule Add/Remove
  const addLocationRule = () => {
    if (!vendorData?.decoratorSettings) return;
    if (!locCity || !locDistrict || !locSetupFee || !locTeardownFee) return;

    const newRule = {
        city: locCity,
        district: locDistrict,
        setupFee: parseInt(locSetupFee),
        teardownFee: parseInt(locTeardownFee),
        deliveryFee: parseInt(locDeliveryFee) || 0, // Include delivery fee
    };

    // Filter out existing rule for same city+district to overwrite
    const filteredRules = vendorData.decoratorSettings.locationFeeRules.filter(
        r => !(r.city === locCity && r.district === locDistrict)
    );

    handleProfileUpdate('decoratorSettings', {
        ...vendorData.decoratorSettings,
        locationFeeRules: [...filteredRules, newRule]
    });
    
    // Reset inputs but keep city for convenience
    setLocDistrict('');
    setLocSetupFee('');
    setLocTeardownFee('');
    setLocDeliveryFee('');
  };

  const removeLocationRule = (city: string, district: string) => {
     if (!vendorData?.decoratorSettings) return;
     const filteredRules = vendorData.decoratorSettings.locationFeeRules.filter(
        r => !(r.city === city && r.district === district)
    );
    handleProfileUpdate('decoratorSettings', {
        ...vendorData.decoratorSettings,
        locationFeeRules: filteredRules
    });
  };

  // 2. Time Surcharge
  const updateHourlySurcharge = (hour: number, fee: number) => {
      if (!vendorData?.decoratorSettings) return;
      const newSurcharges = { ...vendorData.decoratorSettings.hourlySurcharges };
      if (fee > 0) newSurcharges[hour] = fee;
      else delete newSurcharges[hour];

      handleProfileUpdate('decoratorSettings', {
          ...vendorData.decoratorSettings,
          hourlySurcharges: newSurcharges
      });
  };

  // 3. Holiday Logic
  const toggleFixedHoliday = (dateStr: string) => { // MM-DD
    if (!vendorData?.decoratorSettings) return;
    const current = vendorData.decoratorSettings.holidays || [];
    const newHolidays = current.includes(dateStr) 
      ? current.filter(d => d !== dateStr)
      : [...current, dateStr];
    handleProfileUpdate('decoratorSettings', { ...vendorData.decoratorSettings, holidays: newHolidays });
  };

  const toggleLunarHoliday = (key: string) => {
    if (!vendorData?.decoratorSettings) return;
    const current = vendorData.decoratorSettings.lunarHolidays || [];
    const newLunar = current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key];
    handleProfileUpdate('decoratorSettings', { ...vendorData.decoratorSettings, lunarHolidays: newLunar });
  };

  // --- Common ---
  const updateTravelFee = () => {
      if (!vendorData || !selectedCityForFee || !feeInput) return;
      const fees = { ...vendorData.travelFees, [selectedCityForFee]: parseInt(feeInput) };
      handleProfileUpdate('travelFees', fees);
      setFeeInput('');
  };

  const removeTravelFee = (city: string) => {
      if (!vendorData) return;
      const fees = { ...vendorData.travelFees };
      delete fees[city];
      handleProfileUpdate('travelFees', fees);
  };

  // Host Surcharge Logic
  const updateHostSurcharge = () => {
      if (!vendorData || !vendorData.hostSettings || !selectedEventTypeForSurcharge || !surchargeInput) return;
      const addons = { ...vendorData.hostSettings.eventTypeAddons, [selectedEventTypeForSurcharge]: parseInt(surchargeInput) };
      handleProfileUpdate('hostSettings', { ...vendorData.hostSettings, eventTypeAddons: addons });
      setSurchargeInput('');
  };

  const removeHostSurcharge = (eType: string) => {
      if (!vendorData || !vendorData.hostSettings) return;
      const addons = { ...vendorData.hostSettings.eventTypeAddons };
      delete addons[eType];
      handleProfileUpdate('hostSettings', { ...vendorData.hostSettings, eventTypeAddons: addons });
  };

  // Portfolio Management
  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!vendorData) return;
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const newUrl = URL.createObjectURL(file);
        const newPortfolio = [...(vendorData.portfolio || []), newUrl];
        handleProfileUpdate('portfolio', newPortfolio);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!vendorData) return;
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const newUrl = URL.createObjectURL(file);
        const newVideos = [...(vendorData.portfolioVideos || []), newUrl];
        handleProfileUpdate('portfolioVideos', newVideos);
    }
  };

  const handleAddVideoUrl = (url: string) => {
     if (!vendorData || !url) return;
     const newVideos = [...(vendorData.portfolioVideos || []), url];
     handleProfileUpdate('portfolioVideos', newVideos);
  };

  const handleRemovePortfolioImage = (indexToRemove: number) => {
      if (!vendorData) return;
      const newPortfolio = vendorData.portfolio.filter((_, idx) => idx !== indexToRemove);
      handleProfileUpdate('portfolio', newPortfolio);
  };

  const handleRemoveVideo = (indexToRemove: number) => {
      if (!vendorData) return;
      const newVideos = (vendorData.portfolioVideos || []).filter((_, idx) => idx !== indexToRemove);
      handleProfileUpdate('portfolioVideos', newVideos);
  };

  // Package Video Management
  const handleAddPackageVideo = (pkgIndex: number, url: string) => {
      if (!vendorData || !vendorData.packages) return;
      const newPkgs = [...vendorData.packages];
      newPkgs[pkgIndex].videoUrl = url; 
      handleProfileUpdate('packages', newPkgs);
  };

  const handleEventCheckbox = (pkgIndex: number, eventType: any, checked: boolean) => {
      if (!vendorData || !vendorData.packages) return;
      const newPkgs = [...vendorData.packages];
      const currentEvents = newPkgs[pkgIndex].eventTypes || [];
      if (checked) {
          newPkgs[pkgIndex].eventTypes = [...currentEvents, eventType];
      } else {
          newPkgs[pkgIndex].eventTypes = currentEvents.filter(e => e !== eventType);
      }
      handleProfileUpdate('packages', newPkgs);
  };

  // --- Schedule Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        dateString: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay(), // 0=Sun, 1=Mon
        dayOfMonth: i + 1
      };
    });
  };

  const nextMonth = () => {
      const next = new Date(currentMonth);
      next.setMonth(currentMonth.getMonth() + 1);
      // Limit to 1 year ahead
      const today = new Date();
      const limit = new Date(today);
      limit.setFullYear(today.getFullYear() + 1);
      if (next <= limit) setCurrentMonth(next);
  };

  const prevMonth = () => {
      const prev = new Date(currentMonth);
      prev.setMonth(currentMonth.getMonth() - 1);
      // Limit to current month
      const today = new Date();
      today.setDate(1); // Compare only Y/M
      if (prev >= today) setCurrentMonth(prev);
  };

  const getFutureMonthsList = () => {
      const list = [];
      const d = new Date();
      d.setDate(1);
      for(let i=0; i<12; i++) {
          const iso = d.toISOString().slice(0, 7); // YYYY-MM
          list.push(iso);
          d.setMonth(d.getMonth() + 1);
      }
      return list;
  };

  const handleHourToggle = (dateStr: string, hourStr: string) => {
    if (!vendorData) return;
    const currentHours = vendorData.availableHours[dateStr] || [];
    const newHours = currentHours.includes(hourStr)
      ? currentHours.filter(h => h !== hourStr)
      : [...currentHours, hourStr];
    
    handleProfileUpdate('availableHours', {
      ...vendorData.availableHours,
      [dateStr]: newHours.sort((a, b) => parseInt(a) - parseInt(b))
    });
  };

  const handleBatchApply = () => {
    if (!vendorData) return;
    const newAvailability = { ...vendorData.availableHours };
    
    // Generate hours range
    const startH = parseInt(batchStartHour.split(':')[0]);
    const endH = parseInt(batchEndHour.split(':')[0]);
    const hoursToAdd: string[] = [];
    for(let h = startH; h <= endH; h++) {
        hoursToAdd.push(`${h}:00`);
    }

    batchTargetMonths.forEach(monthStr => { // monthStr is YYYY-MM
        const [y, m] = monthStr.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        
        for(let d=1; d<=daysInMonth; d++) {
            const dateObj = new Date(y, m - 1, d);
            const dateStr = dateObj.toISOString().split('T')[0];
            const dayOfWeek = dateObj.getDay(); // 0-6
            
            // Check if this weekday matches selection
            if(batchWeekdays.includes(dayOfWeek)) {
                newAvailability[dateStr] = [...hoursToAdd];
            }
        }
    });

    handleProfileUpdate('availableHours', newAvailability);
    setIsBatchModalOpen(false);
  };
  
  // --- Render Sections ---

  const renderPackagesTab = () => {
    if (!vendorData || !vendorData.decoratorSettings) return null;
    
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                <h3 className="text-xl font-bold text-white">方案與報價管理</h3>
                <button 
                  onClick={() => setIsDecorSettingsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-transform hover:scale-105"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    基礎報價設定
                </button>
            </div>
            
            {/* 1. Package Management */}
            <div className="mb-10">
                <h4 className="font-bold text-orange-400 mb-4 flex items-center">
                    <span className="bg-orange-900/50 p-1 rounded mr-2">📦</span> 服務方案
                </h4>
                <div className="space-y-6">
                    {vendorData.packages.map((pkg, idx) => (
                        <div key={pkg.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">方案名稱</label>
                                    <input 
                                        value={pkg.name} 
                                        onChange={(e) => {
                                            const newPkgs = [...vendorData.packages];
                                            newPkgs[idx].name = e.target.value;
                                            handleProfileUpdate('packages', newPkgs);
                                        }}
                                        className="w-full bg-slate-900 border-slate-600 rounded px-3 py-2 font-bold text-white"
                                    />
                                </div>
                                <div className="w-full md:w-40">
                                    <label className="block text-xs text-slate-400 mb-1">方案價格</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-500">$</span>
                                        <input 
                                            type="number"
                                            value={pkg.price} 
                                            onChange={(e) => {
                                                const newPkgs = [...vendorData.packages];
                                                newPkgs[idx].price = parseInt(e.target.value);
                                                handleProfileUpdate('packages', newPkgs);
                                            }}
                                            className="w-full bg-slate-900 border-slate-600 rounded pl-6 pr-3 py-2 text-orange-400 font-bold text-right"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 mb-1">方案描述</label>
                                <textarea 
                                    value={pkg.description}
                                    onChange={(e) => {
                                        const newPkgs = [...vendorData.packages];
                                        newPkgs[idx].description = e.target.value;
                                        handleProfileUpdate('packages', newPkgs);
                                    }}
                                    className="w-full bg-slate-900 border-slate-600 rounded p-2 text-sm text-slate-300"
                                    rows={3}
                                />
                            </div>

                            {/* Event Categories */}
                            <div className="mb-4 bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                <label className="block text-xs text-slate-400 mb-2">適用活動類型 (勾選後將推薦給該類客戶)</label>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                                    {Object.values(EventType).map((etype: any) => (
                                        <label key={etype} className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-pointer hover:bg-slate-700">
                                            <input 
                                                type="checkbox" 
                                                checked={pkg.eventTypes?.includes(etype) || false}
                                                onChange={(e) => handleEventCheckbox(idx, etype, e.target.checked)}
                                                className="rounded bg-slate-900 border-slate-600 text-orange-500"
                                            />
                                            <span className="text-[10px] text-slate-300">{etype}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Package Media */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-2">方案照片與影片</label>
                                    <div className="flex flex-wrap gap-2">
                                        {pkg.imageUrls.map((url, imgIdx) => (
                                            <img key={imgIdx} src={url} className="w-16 h-16 object-cover rounded border border-slate-600" />
                                        ))}
                                        <label className="w-16 h-16 border border-dashed border-slate-600 rounded flex items-center justify-center cursor-pointer hover:bg-slate-700">
                                            <span className="text-xl text-slate-500">+</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                if(e.target.files?.[0]) {
                                                    const newPkgs = [...vendorData.packages];
                                                    newPkgs[idx].imageUrls.push(URL.createObjectURL(e.target.files[0]));
                                                    handleProfileUpdate('packages', newPkgs);
                                                }
                                            }}/>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-2">影片連結 (YouTube/Vimeo)</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://youtube.com/..." 
                                        value={pkg.videoUrl || ''}
                                        onChange={(e) => handleAddPackageVideo(idx, e.target.value)}
                                        className="w-full bg-slate-900 border-slate-600 rounded p-2 text-xs text-blue-400"
                                    />
                                    {pkg.videoUrl && <a href={pkg.videoUrl} target="_blank" className="text-xs text-slate-500 hover:text-white mt-1 block">預覽影片</a>}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="text-red-400 text-xs hover:text-red-300 px-3 py-1 border border-red-900 rounded hover:bg-red-900/20">刪除此方案</button>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-dashed border-slate-600 text-sm font-bold transition-colors">
                        + 新增服務方案
                    </button>
                </div>
            </div>

            <hr className="border-slate-800 my-8" />
        </div>
    );
  };

  const renderProfileTab = () => {
    if (!vendorData) return null;
    return (
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
           {/* Basic Info */}
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6 shadow-sm">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">基本資料</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-sm text-slate-400 mb-1">名稱</label>
                       <input 
                          type="text" 
                          value={vendorData.name} 
                          onChange={e => handleProfileUpdate('name', e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white"
                       />
                   </div>
                   <div>
                       <label className="block text-sm text-slate-400 mb-1">大頭貼 URL</label>
                       <input 
                          type="text" 
                          value={vendorData.imageUrl} 
                          onChange={e => handleProfileUpdate('imageUrl', e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white text-sm"
                       />
                   </div>
                   <div className="md:col-span-2">
                       <label className="block text-sm text-slate-400 mb-1">服務描述</label>
                       <textarea 
                          value={vendorData.description} 
                          onChange={e => handleProfileUpdate('description', e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white h-24"
                       />
                   </div>
                   {vendorData.category === ServiceCategory.DECOR && (
                       <div className="md:col-span-2">
                           <label className="block text-sm text-slate-400 mb-1">官網連結</label>
                           <input 
                              type="text" 
                              value={vendorData.websiteUrl || ''} 
                              onChange={e => handleProfileUpdate('websiteUrl', e.target.value)}
                              className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white"
                           />
                       </div>
                   )}
               </div>
           </div>

           {/* Pricing & Fees */}
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6 shadow-sm">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">報價設定</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div>
                       <label className="block text-sm text-slate-400 mb-1">
                           {vendorData.rateType === 'hourly' ? '每小時基本費率' : '單次/基本費率'}
                       </label>
                       <div className="relative">
                           <span className="absolute left-3 top-2 text-slate-500">$</span>
                           <input 
                              type="number" 
                              value={vendorData.rate} 
                              onChange={e => handleProfileUpdate('rate', parseInt(e.target.value))}
                              className="w-full bg-slate-900 border-slate-600 rounded p-2 pl-6 text-white font-bold"
                           />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm text-slate-400 mb-1">計費方式</label>
                       <select 
                          value={vendorData.rateType}
                          onChange={e => handleProfileUpdate('rateType', e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white"
                       >
                           <option value="hourly">每小時計費</option>
                           <option value="fixed">單次固定價</option>
                           <option value="package">方案制</option>
                       </select>
                   </div>
                   {/* Overtime Rate if applicable */}
                   {vendorData.rateType === 'fixed' && vendorData.category !== ServiceCategory.DECOR && (
                      <div>
                           <label className="block text-sm text-slate-400 mb-1">超時費用 ($/hr)</label>
                           <input 
                              type="number" 
                              value={vendorData.overtimeRate || 0} 
                              onChange={e => handleProfileUpdate('overtimeRate', parseInt(e.target.value))}
                              className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white"
                           />
                      </div>
                   )}
               </div>
               
               {/* Host Specific Settings */}
               {vendorData.category === ServiceCategory.HOST && (
                   <div className="bg-slate-900/50 p-4 rounded border border-slate-600 mb-4">
                       <h4 className="text-sm font-bold text-indigo-400 mb-3">主持人進階設定</h4>
                       <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                               <label className="text-xs text-slate-400 block mb-1">基本時數 (hr)</label>
                               <input 
                                  type="number"
                                  value={vendorData.hostSettings?.baseDuration || 4}
                                  onChange={e => handleProfileUpdate('hostSettings', { ...vendorData.hostSettings, baseDuration: parseInt(e.target.value) })}
                                  className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-white"
                               />
                           </div>
                           <div>
                               <label className="text-xs text-slate-400 block mb-1">超時費率 ($/hr)</label>
                               <input 
                                  type="number"
                                  value={vendorData.hostSettings?.overtimeRate || 0}
                                  onChange={e => handleProfileUpdate('hostSettings', { ...vendorData.hostSettings, overtimeRate: parseInt(e.target.value) })}
                                  className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-white"
                               />
                           </div>
                       </div>
                       
                       <div className="border-t border-slate-700 pt-3">
                           <label className="text-xs text-slate-400 block mb-2">特殊活動加價</label>
                           <div className="flex gap-2 mb-2">
                               <select 
                                  value={selectedEventTypeForSurcharge}
                                  onChange={e => setSelectedEventTypeForSurcharge(e.target.value)}
                                  className="flex-1 bg-slate-800 border-slate-600 rounded text-xs text-white p-1"
                               >
                                   <option value="">選擇活動類型</option>
                                   {Object.values(EventType).map(et => <option key={et} value={et}>{et}</option>)}
                               </select>
                               <input 
                                  type="number"
                                  value={surchargeInput}
                                  onChange={e => setSurchargeInput(e.target.value)}
                                  placeholder="加價金額"
                                  className="w-24 bg-slate-800 border-slate-600 rounded text-xs text-white p-1"
                               />
                               <button onClick={updateHostSurcharge} className="bg-indigo-600 text-white px-3 rounded text-xs">新增</button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                               {vendorData.hostSettings?.eventTypeAddons && Object.entries(vendorData.hostSettings.eventTypeAddons).map(([type, fee]) => (
                                   <span key={type} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-600 flex items-center">
                                       {type}: +${fee}
                                       <button onClick={() => removeHostSurcharge(type)} className="ml-2 text-red-400 hover:text-white">×</button>
                                   </span>
                               ))}
                           </div>
                       </div>
                   </div>
               )}

               {/* Travel Fees */}
               <div className="border-t border-slate-700 pt-4">
                   <h4 className="text-sm font-bold text-slate-300 mb-2">跨區車馬費設定</h4>
                   <div className="flex gap-2 mb-3">
                       <select 
                          value={selectedCityForFee}
                          onChange={e => setSelectedCityForFee(e.target.value)}
                          className="bg-slate-900 border-slate-600 rounded p-2 text-white text-sm flex-1"
                       >
                           <option value="">選擇縣市</option>
                           {Object.keys(TAIWAN_LOCATIONS).map(city => <option key={city} value={city}>{city}</option>)}
                       </select>
                       <input 
                          type="number" 
                          value={feeInput}
                          onChange={e => setFeeInput(e.target.value)}
                          placeholder="費用"
                          className="bg-slate-900 border-slate-600 rounded p-2 text-white text-sm w-24"
                       />
                       <button onClick={updateTravelFee} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-bold">新增</button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                       {Object.entries(vendorData.travelFees).map(([city, fee]) => (
                           <div key={city} className="bg-slate-700 px-3 py-1 rounded-full text-sm text-white flex items-center">
                               {city} +${fee}
                               <button onClick={() => removeTravelFee(city)} className="ml-2 text-slate-400 hover:text-white">×</button>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Portfolio */}
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">作品集管理</h3>
               
               <div className="mb-6">
                   <label className="block text-sm text-slate-400 mb-2">圖片集 (支援多張上傳)</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {vendorData.portfolio.map((url, idx) => (
                           <div key={idx} className="relative group">
                               <img src={url} className="w-full h-32 object-cover rounded border border-slate-600" />
                               <button 
                                  onClick={() => handleRemovePortfolioImage(idx)}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                           </div>
                       ))}
                       <label className="border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-slate-700 hover:border-indigo-500 transition-colors">
                           <span className="text-2xl text-slate-500 mb-1">+</span>
                           <span className="text-xs text-slate-500">上傳圖片</span>
                           <input type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                       </label>
                   </div>
               </div>

               <div>
                   <label className="block text-sm text-slate-400 mb-2">影片連結</label>
                   <div className="space-y-2 mb-2">
                       {vendorData.portfolioVideos?.map((url, idx) => (
                           <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-700">
                               <span className="text-xs text-blue-400 truncate flex-1">{url}</span>
                               <button onClick={() => handleRemoveVideo(idx)} className="text-red-400 hover:text-white">×</button>
                           </div>
                       ))}
                   </div>
                   <div className="flex gap-2">
                       <input 
                          type="text" 
                          placeholder="輸入 YouTube 連結..." 
                          onKeyDown={e => {
                              if (e.key === 'Enter') {
                                  handleAddVideoUrl(e.currentTarget.value);
                                  e.currentTarget.value = '';
                              }
                          }}
                          className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white text-sm"
                       />
                   </div>
               </div>
           </div>
      </div>
    );
  };

  const renderDashboard = () => {
      // ... (existing dashboard render code omitted) ...
      // Keeping wrapper structure
      return (
           <div className="min-h-screen bg-slate-950 p-4 md:p-6 text-slate-200">
               {/* ... (Header and Tabs) ... */}
               <div className="max-w-6xl mx-auto">
                   <button 
                     onClick={handleLogout} 
                     className="mb-4 flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium"
                   >
                       <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                       </svg>
                       回到上一頁
                   </button>
                   <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                       <div className="flex items-center gap-4">
                           <img src={vendorData!.imageUrl} className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover"/>
                           <div><h1 className="text-2xl font-bold text-white">{vendorData!.name}</h1><span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded">{vendorData!.category}</span></div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                           <button 
                             onClick={togglePauseStatus}
                             className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${vendorData!.isPaused 
                                ? 'bg-red-900/30 border-red-500 text-red-400 animate-pulse' 
                                : 'bg-green-900/30 border-green-500 text-green-400'}`}
                           >
                               <span className={`w-3 h-3 rounded-full ${vendorData!.isPaused ? 'bg-red-500' : 'bg-green-500'}`}></span>
                               {vendorData!.isPaused ? '已暫停接案' : '接案中'}
                           </button>

                           <button onClick={handleLogout} className="text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded">登出</button>
                       </div>
                   </div>
                   
                   <div className="flex space-x-1 mb-6 border-b border-slate-800">
                        <button onClick={() => setActiveTab('SCHEDULE')} className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'SCHEDULE' ? 'bg-slate-800 text-indigo-400 border-t border-x border-slate-700' : 'text-slate-500 hover:bg-slate-900'}`}>📅 檔期管理</button>
                        <button onClick={() => setActiveTab('PROFILE')} className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'PROFILE' ? 'bg-slate-800 text-indigo-400 border-t border-x border-slate-700' : 'text-slate-500 hover:bg-slate-900'}`}>👤 廠商檔案</button>
                        {vendorData!.category === ServiceCategory.DECOR && (
                             <button onClick={() => setActiveTab('PACKAGES')} className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'PACKAGES' ? 'bg-slate-800 text-indigo-400 border-t border-x border-slate-700' : 'text-slate-500 hover:bg-slate-900'}`}>📦 方案與報價</button>
                        )}
                   </div>

                   <div className="bg-slate-900/50 min-h-[500px] rounded-b-xl rounded-tr-xl">
                        {activeTab === 'PROFILE' && renderProfileTab()}
                        {activeTab === 'PACKAGES' && renderPackagesTab()}
                        {activeTab === 'SCHEDULE' && (
                             <div className="p-4 md:p-6 animate-fade-in">
                                 {/* Existing Schedule UI */}
                                 <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                     <div className="flex items-center space-x-4">
                                         <button onClick={prevMonth} className="text-slate-400 hover:text-white p-2 border border-slate-700 rounded-full">←</button>
                                         <h2 className="text-xl font-bold text-white tracking-wide">
                                             {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                                         </h2>
                                         <button onClick={nextMonth} className="text-slate-400 hover:text-white p-2 border border-slate-700 rounded-full">→</button>
                                     </div>
                                     <button onClick={() => setIsBatchModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold transition-all flex items-center">
                                         ➕ 快速設定本月排班
                                     </button>
                                 </div>

                                 <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                     <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">接案地區 (點擊切換)</h3>
                                     <div className="flex flex-wrap gap-2">
                                         {Object.keys(TAIWAN_LOCATIONS).map(city => (
                                             <button 
                                                key={city}
                                                onClick={() => toggleLocation(city)}
                                                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                                    vendorData!.serviceAreas.includes(city) 
                                                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                                }`}
                                             >
                                                 {city}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                                 {/* Calendar Grid */}
                                 <div className="grid grid-cols-7 gap-2">
                                     {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                                         <div key={d} className="text-center font-bold text-slate-500 py-2">{d}</div>
                                     ))}
                                     
                                     {Array.from({length: getDaysInMonth(currentMonth)[0].dayOfWeek}).map((_, i) => <div key={`empty-${i}`} className="bg-transparent"></div>)}
                                     
                                     {getDaysInMonth(currentMonth).map(day => {
                                         const hours = vendorData!.availableHours[day.dateString] || [];
                                         const isFull = hours.length === 24;
                                         const isPartial = hours.length > 0 && hours.length < 24;
                                         const isNone = hours.length === 0;
                                         
                                         return (
                                             <div 
                                                key={day.dateString}
                                                onClick={() => setEditingDate(day.dateString)}
                                                className={`
                                                    min-h-[80px] rounded-lg p-2 cursor-pointer border transition-all hover:scale-105
                                                    ${isFull ? 'bg-indigo-900/30 border-indigo-500/50 hover:bg-indigo-900/50' : ''}
                                                    ${isPartial ? 'bg-orange-900/30 border-orange-500/50 hover:bg-orange-900/50' : ''}
                                                    ${isNone ? 'bg-slate-800/50 border-slate-800 hover:border-slate-600' : ''}
                                                `}
                                             >
                                                 <div className="flex justify-between items-start">
                                                     <span className={`font-bold ${isNone ? 'text-slate-600' : 'text-white'}`}>{day.dayOfMonth}</span>
                                                     {isFull && <span className="text-[10px] bg-green-900 text-green-300 px-1 rounded">全天</span>}
                                                 </div>
                                                 {isPartial && <div className="text-[10px] text-orange-300 mt-1">{hours.length} 小時</div>}
                                             </div>
                                         )
                                     })}
                                 </div>
                             </div>
                        )}
                   </div>
               </div>

               {/* ... (Batch Modal code kept as is) ... */}
               {isBatchModalOpen && (
                   <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-fade-in-up">
                            {/* ... Content of Batch Modal kept same ... */}
                            <h3 className="text-xl font-bold text-white mb-4">批量排班設定</h3>
                             <div className="mb-4">
                               <label className="block text-sm text-slate-400 mb-2">1. 選擇套用月份</label>
                               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-800 rounded custom-scrollbar">
                                   {getFutureMonthsList().map(monthStr => (
                                       <label key={monthStr} className={`flex items-center space-x-2 px-3 py-1.5 rounded cursor-pointer border transition-all ${batchTargetMonths.includes(monthStr) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                           <input 
                                                type="checkbox" 
                                                checked={batchTargetMonths.includes(monthStr)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setBatchTargetMonths(prev => [...prev, monthStr]);
                                                    else setBatchTargetMonths(prev => prev.filter(m => m !== monthStr));
                                                }}
                                                className="hidden"
                                           />
                                           <span className="text-xs font-bold">{monthStr}</span>
                                       </label>
                                   ))}
                               </div>
                           </div>
                           <div className="mb-4">
                               <label className="block text-sm text-slate-400 mb-2">2. 選擇星期</label>
                               <div className="flex flex-wrap gap-2">
                                   {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                                       <button 
                                        key={i}
                                        onClick={() => setBatchWeekdays(prev => prev.includes(i) ? prev.filter(w => w !== i) : [...prev, i])}
                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${batchWeekdays.includes(i) ? 'bg-orange-600 text-white shadow' : 'bg-slate-800 text-slate-500'}`}
                                       >
                                           {d}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           <div className="flex gap-4 mb-6">
                               <div className="flex-1">
                                   <label className="block text-sm text-slate-400 mb-1">開始時間</label>
                                   <select value={batchStartHour} onChange={e => setBatchStartHour(e.target.value)} className="w-full bg-slate-800 text-white rounded p-2 border border-slate-700">
                                       {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                   </select>
                               </div>
                               <div className="flex-1">
                                   <label className="block text-sm text-slate-400 mb-1">結束時間</label>
                                   <select value={batchEndHour} onChange={e => setBatchEndHour(e.target.value)} className="w-full bg-slate-800 text-white rounded p-2 border border-slate-700">
                                       {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                   </select>
                               </div>
                           </div>
                           <div className="flex justify-end space-x-2">
                               <button onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">取消</button>
                               <button onClick={handleBatchApply} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold">確認套用</button>
                           </div>
                        </div>
                   </div>
               )}

               {/* Decorator Settings Modal */}
               {isDecorSettingsModalOpen && vendorData && vendorData.decoratorSettings && (
                   <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                       <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl animate-fade-in-up">
                           <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                               <h3 className="text-xl font-bold text-white flex items-center">
                                   <span className="bg-indigo-600 p-2 rounded-full mr-3">⚙️</span>
                                   基礎報價設定
                               </h3>
                               <button onClick={() => setIsDecorSettingsModalOpen(false)} className="text-slate-400 hover:text-white">
                                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                           </div>

                           <div className="flex border-b border-slate-800 bg-slate-800/50">
                               <button onClick={() => setDecorSettingsTab('LOCATION')} className={`flex-1 py-4 text-sm font-bold transition-colors ${decorSettingsTab === 'LOCATION' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800'}`}>
                                   1. 地區與外送費用
                               </button>
                               <button onClick={() => setDecorSettingsTab('TIME')} className={`flex-1 py-4 text-sm font-bold transition-colors ${decorSettingsTab === 'TIME' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800'}`}>
                                   2. 特殊時段加成
                               </button>
                               <button onClick={() => setDecorSettingsTab('HOLIDAY')} className={`flex-1 py-4 text-sm font-bold transition-colors ${decorSettingsTab === 'HOLIDAY' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800'}`}>
                                   3. 特殊節慶加成
                               </button>
                           </div>

                           <div className="flex-1 overflow-y-auto p-6 bg-slate-900 custom-scrollbar">
                               {decorSettingsTab === 'LOCATION' && (
                                   <div className="space-y-6">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Upstairs Fee Config */}
                                            <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg flex flex-col justify-between">
                                                <div className="mb-2">
                                                    <h4 className="font-bold text-orange-400 text-sm">搬運/上樓費設定 (統一計價)</h4>
                                                    <p className="text-xs text-orange-200 mt-1">若外送地點非 1 樓 (含地下室)，將額外收取此費用。</p>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <span className="text-slate-400 text-sm mr-2">$</span>
                                                    <input 
                                                            type="number" 
                                                            value={vendorData.decoratorSettings.upstairsFee || 0}
                                                            onChange={(e) => handleProfileUpdate('decoratorSettings', { ...vendorData!.decoratorSettings, upstairsFee: parseInt(e.target.value) })}
                                                            className="bg-slate-800 border-slate-600 rounded px-2 py-1 text-white w-24 text-center font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Urgent Order Fee Config */}
                                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex flex-col justify-between">
                                                <div className="mb-2">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-red-400 text-sm">急件接單設定</h4>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer"
                                                                checked={vendorData.decoratorSettings.urgentOrderEnabled}
                                                                onChange={(e) => handleProfileUpdate('decoratorSettings', { ...vendorData!.decoratorSettings, urgentOrderEnabled: e.target.checked })}
                                                            />
                                                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-red-200 mt-1">當訂單日期距離活動日 2 天內，自動加收費用 (依方案金額級距)。</p>
                                                </div>
                                                <div className="text-[10px] text-slate-300 bg-slate-900/50 p-2 rounded">
                                                    <div className="flex justify-between border-b border-slate-700/50 pb-1 mb-1"><span>$5,000 以下</span> <span className="font-bold text-red-300">+$500</span></div>
                                                    <div className="flex justify-between border-b border-slate-700/50 pb-1 mb-1"><span>$5,001 - $10,000</span> <span className="font-bold text-red-300">+$1,000</span></div>
                                                    <div className="flex justify-between border-b border-slate-700/50 pb-1 mb-1"><span>$10,001 - $20,000</span> <span className="font-bold text-red-300">+$1,500</span></div>
                                                    <div className="flex justify-between"><span>$20,001 以上</span> <span className="font-bold text-red-300">+$2,000</span></div>
                                                </div>
                                            </div>
                                       </div>

                                       <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                           <h4 className="font-bold text-white mb-4">新增地區規則</h4>
                                           <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                                               <div>
                                                   <label className="block text-xs text-slate-400 mb-1">縣市</label>
                                                   <select value={locCity} onChange={e => { setLocCity(e.target.value); setLocDistrict(''); }} className="w-full bg-slate-900 border-slate-600 rounded px-2 py-2 text-white text-sm">
                                                       <option value="">選擇縣市</option>
                                                       {Object.keys(TAIWAN_LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                                                   </select>
                                               </div>
                                               <div>
                                                   <label className="block text-xs text-slate-400 mb-1">行政區</label>
                                                   <select value={locDistrict} onChange={e => setLocDistrict(e.target.value)} disabled={!locCity} className="w-full bg-slate-900 border-slate-600 rounded px-2 py-2 text-white text-sm disabled:opacity-50">
                                                       <option value="">選擇區域</option>
                                                       <option value="all">全部 (預設)</option>
                                                       {availableDistrictsForDecor?.map(d => <option key={d} value={d}>{d}</option>)}
                                                   </select>
                                               </div>
                                               <div>
                                                   <label className="block text-xs text-slate-400 mb-1">佈置費 ($)</label>
                                                   <input type="number" value={locSetupFee} onChange={e => setLocSetupFee(e.target.value)} className="w-full bg-slate-900 border-slate-600 rounded px-2 py-2 text-white text-sm" placeholder="2000" />
                                               </div>
                                               <div>
                                                   <label className="block text-xs text-slate-400 mb-1">撤場費 ($)</label>
                                                   <input type="number" value={locTeardownFee} onChange={e => setLocTeardownFee(e.target.value)} className="w-full bg-slate-900 border-slate-600 rounded px-2 py-2 text-white text-sm" placeholder="1000" />
                                               </div>
                                               <div>
                                                   <label className="block text-xs text-slate-400 mb-1">外送費 ($)</label>
                                                   <input type="number" value={locDeliveryFee} onChange={e => setLocDeliveryFee(e.target.value)} className="w-full bg-slate-900 border-slate-600 rounded px-2 py-2 text-white text-sm" placeholder="500" />
                                               </div>
                                               <button onClick={addLocationRule} className="bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-500">新增</button>
                                           </div>
                                       </div>

                                       <div>
                                           <h4 className="font-bold text-slate-300 mb-3 text-sm">現有規則列表</h4>
                                           <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                               <table className="w-full text-sm text-left">
                                                   <thead className="bg-slate-700 text-slate-300">
                                                       <tr>
                                                           <th className="p-3">縣市</th>
                                                           <th className="p-3">行政區</th>
                                                           <th className="p-3">佈置費</th>
                                                           <th className="p-3">撤場費</th>
                                                           <th className="p-3">外送費</th>
                                                           <th className="p-3 text-right">操作</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-700">
                                                       {vendorData.decoratorSettings.locationFeeRules.map((rule, idx) => (
                                                           <tr key={idx} className="hover:bg-slate-700/50">
                                                               <td className="p-3 font-bold text-white">{rule.city}</td>
                                                               <td className="p-3">
                                                                   {rule.district === 'all' 
                                                                    ? <span className="bg-slate-600 text-xs px-2 py-0.5 rounded text-white">全區適用</span> 
                                                                    : <span className="text-indigo-400 font-bold">{rule.district}</span>}
                                                               </td>
                                                               <td className="p-3 text-slate-300">${rule.setupFee}</td>
                                                               <td className="p-3 text-slate-300">${rule.teardownFee}</td>
                                                               <td className="p-3 text-slate-300">${rule.deliveryFee || 0}</td>
                                                               <td className="p-3 text-right">
                                                                   <button onClick={() => removeLocationRule(rule.city, rule.district)} className="text-red-400 hover:text-white text-xs border border-red-900 bg-red-900/20 px-2 py-1 rounded">刪除</button>
                                                               </td>
                                                           </tr>
                                                       ))}
                                                        {vendorData.decoratorSettings.locationFeeRules.length === 0 && (
                                                            <tr><td colSpan={6} className="p-4 text-center text-slate-500">暫無設定規則，請由上方新增</td></tr>
                                                        )}
                                                   </tbody>
                                               </table>
                                           </div>
                                       </div>
                                   </div>
                               )}

                               {/* ... (Other tabs same as before) ... */}
                               {decorSettingsTab === 'TIME' && (
                                   <div>
                                       <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg mb-6 text-sm text-indigo-200">
                                           ℹ️ 設定每個小時的加價金額。若該小時無加價，請留空或填 0。
                                       </div>
                                       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                           {HOURS.map((h, i) => {
                                               const currentFee = vendorData!.decoratorSettings?.hourlySurcharges[i] || '';
                                               return (
                                                   <div key={i} className={`bg-slate-800 p-3 rounded border ${currentFee ? 'border-orange-500 bg-slate-800' : 'border-slate-700'}`}>
                                                       <div className="text-xs text-slate-400 mb-1 font-bold">{h} - {i+1}:00</div>
                                                       <div className="relative">
                                                           <span className="absolute left-2 top-1.5 text-slate-500 text-xs">$</span>
                                                           <input 
                                                                type="number" 
                                                                value={currentFee} 
                                                                onChange={e => updateHourlySurcharge(i, parseInt(e.target.value) || 0)}
                                                                className={`w-full bg-slate-900 rounded px-2 py-1 pl-5 text-sm ${currentFee ? 'text-orange-400 font-bold' : 'text-slate-500'}`}
                                                                placeholder="0"
                                                           />
                                                       </div>
                                                   </div>
                                               )
                                           })}
                                       </div>
                                   </div>
                               )}

                               {decorSettingsTab === 'HOLIDAY' && (
                                   <div className="space-y-8">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Fixed Date Holidays */}
                                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                                <h4 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">固定國曆節日</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { d: '01-01', label: '元旦 (1/1)' },
                                                        { d: '02-14', label: '西洋情人節 (2/14)' },
                                                        { d: '05-20', label: '520 情人節' },
                                                        { d: '12-31', label: '跨年夜 (12/31)' },
                                                    ].map(item => (
                                                        <label key={item.d} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-700 rounded transition-colors">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={vendorData!.decoratorSettings?.holidays.includes(item.d)}
                                                                onChange={() => toggleFixedHoliday(item.d)}
                                                                className="w-5 h-5 rounded border-slate-500 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-slate-200">{item.label}</span>
                                                        </label>
                                                    ))}
                                                    
                                                    {/* Custom Date Input */}
                                                    <div className="pt-4 border-t border-slate-700 mt-2">
                                                        <label className="text-xs text-slate-400 block mb-1">新增其他日期 (MM-DD)</label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                placeholder="如: 10-10" 
                                                                value={newHolidayDate}
                                                                onChange={e => setNewHolidayDate(e.target.value)}
                                                                className="flex-1 bg-slate-900 border-slate-600 rounded px-2 py-1 text-sm text-white"
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    if(newHolidayDate.match(/^\d{2}-\d{2}$/)) {
                                                                        toggleFixedHoliday(newHolidayDate);
                                                                        setNewHolidayDate('');
                                                                    } else {
                                                                        alert('格式錯誤，請輸入 MM-DD (例如 12-25)');
                                                                    }
                                                                }}
                                                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                                                            >
                                                                新增
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {vendorData!.decoratorSettings?.holidays
                                                                .filter(d => !['01-01','02-14','05-20','12-31'].includes(d))
                                                                .map(d => (
                                                                    <span key={d} className="bg-slate-900 text-xs px-2 py-1 rounded border border-slate-600 flex items-center">
                                                                        {d}
                                                                        <button onClick={() => toggleFixedHoliday(d)} className="ml-1 text-red-400">×</button>
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lunar Holidays */}
                                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-bl-full -mr-4 -mt-4"></div>
                                                <h4 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">農曆節日 (自動換算)</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { key: 'CNY_EVE', label: '除夕', desc: '農曆十二月三十' },
                                                        { key: 'CNY', label: '春節 (初一)', desc: '農曆正月初一' },
                                                        { key: 'CHINESE_VALENTINES', label: '七夕情人節', desc: '農曆七月初七' },
                                                    ].map(item => (
                                                        <label key={item.key} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-700 rounded transition-colors group">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={vendorData!.decoratorSettings?.lunarHolidays.includes(item.key)}
                                                                onChange={() => toggleLunarHoliday(item.key)}
                                                                className="w-5 h-5 rounded border-slate-500 bg-slate-900 text-red-500 focus:ring-red-500"
                                                            />
                                                            <div>
                                                                <div className="text-slate-200 font-bold group-hover:text-red-400 transition-colors">{item.label}</div>
                                                                <div className="text-xs text-slate-500">{item.desc}</div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                       </div>
                                       
                                       <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                                           <span className="text-slate-300 font-bold">特殊節日加價百分比 (%)</span>
                                           <div className="flex items-center">
                                               <span className="mr-2 text-slate-500">加收</span>
                                               <input 
                                                    type="number" 
                                                    value={vendorData!.decoratorSettings?.holidaySurchargePercent} 
                                                    onChange={e => handleProfileUpdate('decoratorSettings', { ...vendorData!.decoratorSettings, holidaySurchargePercent: parseInt(e.target.value) })}
                                                    className="w-20 bg-slate-900 border-slate-600 rounded px-2 py-1 text-center font-bold text-orange-400"
                                               />
                                               <span className="ml-2 text-slate-500">%</span>
                                           </div>
                                       </div>
                                   </div>
                               )}
                           </div>
                           
                           <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
                               <button onClick={() => setIsDecorSettingsModalOpen(false)} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg">確認儲存</button>
                           </div>
                       </div>
                   </div>
               )}

               {editingDate && (
                   <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                       <div className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-slate-700 shadow-2xl animate-fade-in-up">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="text-xl font-bold text-white">編輯時段: {editingDate}</h3>
                               <button onClick={() => setEditingDate(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
                           </div>
                           
                           <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
                               {HOURS.map(h => {
                                   const isSelected = vendorData!.availableHours[editingDate] && vendorData!.availableHours[editingDate].includes(h);
                                   const hNum = parseInt(h);
                                   const isSpecial = hNum < 8 || hNum > 21; // 0-8 & 21-23

                                   return (
                                       <button 
                                        key={h}
                                        onClick={() => handleHourToggle(editingDate, h)}
                                        className={`py-2 rounded text-sm font-medium border transition-all ${
                                            isSelected 
                                            ? (isSpecial ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'bg-indigo-600 border-indigo-500 text-white shadow')
                                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                        }`}
                                       >
                                           {h}
                                       </button>
                                   )
                               })}
                           </div>

                           <div className="flex justify-between border-t border-slate-800 pt-4">
                               <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleProfileUpdate('availableHours', { ...vendorData!.availableHours, [editingDate]: [...HOURS] })}
                                     className="text-xs px-3 py-1 bg-slate-800 text-indigo-400 rounded hover:bg-slate-700"
                                   >
                                       全選
                                   </button>
                                   <button 
                                     onClick={() => handleProfileUpdate('availableHours', { ...vendorData!.availableHours, [editingDate]: [] })}
                                     className="text-xs px-3 py-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700"
                                   >
                                       全取消
                                   </button>
                               </div>
                               <button onClick={() => setEditingDate(null)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-lg">完成</button>
                           </div>
                       </div>
                   </div>
               )}
           </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {currentStep === 'SELECT_TYPE' && (
          <div className="max-w-6xl mx-auto mt-10 p-6">
              <h2 className="text-4xl font-black text-center text-slate-100 mb-12"><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">合作夥伴</span> 入口</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {VENDOR_TYPES.map((mainType, idx) => (
                      <div key={idx} className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 backdrop-blur">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mainType.color} flex items-center justify-center text-white shadow-lg mb-6`}>
                             {mainType.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-6">{mainType.label}</h3>
                          
                          <div className="grid grid-cols-2 gap-3">
                              {mainType.subcategories.map(sub => (
                                  <button 
                                    key={sub.id}
                                    onClick={() => handleCategorySelect(sub.id)}
                                    className="text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-xl transition-all text-slate-300 hover:text-white text-sm font-medium"
                                  >
                                      {sub.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>

              <button onClick={onBack} className="mt-12 block mx-auto text-slate-500 hover:text-white">← 返回平台首頁</button>
          </div>
      )}
      
      {currentStep === 'LOGIN' && (
           <div className="min-h-screen flex flex-col justify-center items-center p-4">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white text-center mb-8">後台登入</h2>
                  {selectedCategory && (
                      <div className="text-center mb-6">
                          <span className="bg-indigo-900 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-700">
                              {selectedCategory}
                          </span>
                      </div>
                  )}
                  <div className="space-y-4">
                      <input type="text" placeholder="Email" value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full bg-slate-800 border-slate-700 text-white p-3 rounded"/>
                      <input type="password" placeholder="Password" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} className="w-full bg-slate-800 border-slate-700 text-white p-3 rounded"/>
                      <button onClick={() => handleLogin()} className="w-full bg-indigo-600 text-white py-3 rounded font-bold">登入</button>
                  </div>
                  <div className="mt-8 border-t border-slate-800 pt-4">
                      <p className="text-xs text-slate-500 mb-2 text-center">測試帳號 (僅顯示同類別)：</p>
                      {MOCK_VENDORS.filter(v => v.category === selectedCategory).map(v => (
                          <button key={v.id} onClick={() => handleLogin(v.id)} className="block w-full text-left text-xs text-indigo-400 hover:text-indigo-300 py-1">{v.name} ({v.id})</button>
                      ))}
                      {MOCK_VENDORS.filter(v => v.category === selectedCategory).length === 0 && (
                          <p className="text-xs text-slate-600 text-center">無此類別測試帳號</p>
                      )}
                  </div>
                  <button onClick={() => setCurrentStep('SELECT_TYPE')} className="mt-4 w-full text-center text-slate-500 text-sm">取消</button>
              </div>
           </div>
      )}

      {currentStep === 'DASHBOARD' && renderDashboard()}
    </div>
  );
};

export default VendorPortal;
