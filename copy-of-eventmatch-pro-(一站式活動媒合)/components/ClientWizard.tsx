
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_VENDORS, calculateVendorCost, calculateVendorCostBreakdown, isVendorAvailable, TAIWAN_LOCATIONS, EVENT_TYPE_RECOMMENDATIONS, resetVendorsForTesting } from '../services/mockData';
import { Vendor, ServiceCategory, UserRequest, SelectedService, EventType, VendorPackage } from '../types';
import { generateEventPlan } from '../services/geminiService';
import VendorDetailModal from './VendorDetailModal';

// Toast Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-20 right-5 z-[999] animate-fade-in">
    <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 border border-red-400">
      <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">!</div>
      <span className="font-bold tracking-wide">{message}</span>
      <button onClick={onClose} className="ml-4 text-red-200 hover:text-white">✕</button>
    </div>
  </div>
);

// Group definitions for Step 2
const SERVICE_GROUPS = [
  {
    label: '軟體服務 (Software)',
    color: 'text-rose-400',
    borderColor: 'border-rose-500',
    icon: '🎭',
    items: [
      ServiceCategory.PLANNER, // Updated Name: 活動統籌師
      ServiceCategory.HOST,
      ServiceCategory.ACTOR, 
      ServiceCategory.BAND,
      ServiceCategory.SINGER,
      ServiceCategory.DJ,
      ServiceCategory.DANCE,
      ServiceCategory.BALLOON,
      ServiceCategory.ACROBATICS,
      ServiceCategory.LION_DANCE,
      ServiceCategory.PHOTOGRAPHER,
      ServiceCategory.STATIC_PHOTO,
      ServiceCategory.DYNAMIC_PHOTO,
      ServiceCategory.VIDEOGRAPHY,
      ServiceCategory.PT,
      ServiceCategory.PERFORMER,
      ServiceCategory.STAFF
    ]
  },
  {
    label: '硬體服務 (Hardware)',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500',
    icon: '🛠️',
    items: [
      ServiceCategory.DECOR,
      ServiceCategory.VENUE_RENTAL,
      ServiceCategory.FLORIST,
      ServiceCategory.STAGE_HARDWARE, // Merged: AV, Lighting, Truss
      ServiceCategory.DESIGN_PRINT, // Merged: Print, Backdrop
      ServiceCategory.CAKE,
      ServiceCategory.CATERING, // Added
      ServiceCategory.OTHER
    ]
  }
];

const categories = Object.values(ServiceCategory);
const eventTypes = Object.values(EventType);

interface ClientWizardProps {
  onBack: () => void;
}

const ClientWizard: React.FC<ClientWizardProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlightErrors, setHighlightErrors] = useState(false);
  
  // Form State
  const [request, setRequest] = useState<UserRequest>({
    name: '',
    phone: '',
    date: '',
    startTime: '14:00',
    endTime: '18:00',
    isLocationUndecided: false, // Now means "Address Undecided"
    city: '',
    district: '',
    address: '',
    eventType: '',
  });

  const [neededServices, setNeededServices] = useState<ServiceCategory[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<SelectedService[]>([]);
  const [aiPlan, setAiPlan] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);

  const availableDistricts = request.city ? TAIWAN_LOCATIONS[request.city] || [] : [];

  const duration = (() => {
    const [startH, startM] = request.startTime.split(':').map(Number);
    const [endH, endM] = request.endTime.split(':').map(Number);
    const totalStart = startH + startM / 60;
    const totalEnd = endH + endM / 60;
    const diff = totalEnd - totalStart;
    return diff > 0 ? diff : 0;
  })();

  const totalPrice = selectedVendors.reduce((sum, selection) => {
    const vendor = MOCK_VENDORS.find(v => v.id === selection.vendorId);
    if (!vendor) return sum;
    return sum + calculateVendorCost(vendor, request, duration, selection.packageId, selection.options);
  }, 0);

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (step === 2 && neededServices.length === 0) {
      const recs = request.eventType ? (EVENT_TYPE_RECOMMENDATIONS[request.eventType as EventType] || []) : [];
      const combined = Array.from(new Set([...recs]));
      
      if (combined.length === 0 && request.eventType) combined.push(ServiceCategory.DECOR);
      
      setNeededServices(combined);
    }
  }, [step, request]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'isLocationUndecided') {
         // When checking "Address Undecided", we DO NOT clear city/district anymore.
         // We just clear the specific address input.
         setRequest(prev => ({
            ...prev,
            isLocationUndecided: checked,
            address: checked ? '' : prev.address
         }));
      } else {
         setRequest(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      if (name === 'city') {
        setRequest(prev => ({ 
            ...prev, 
            city: value, 
            district: '',
            isLocationUndecided: false // Reset undecided if city changes to force re-selection flow if needed
        }));
      } else if (name === 'district') {
        setRequest(prev => ({ 
            ...prev, 
            district: value 
        }));
      } else {
        setRequest(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const toggleService = (category: ServiceCategory) => {
    setNeededServices(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
    if (neededServices.includes(category)) {
      setSelectedVendors(prev => prev.filter(s => s.category !== category));
    }
  };

  const selectVendor = (category: ServiceCategory, vendorId: string, packageId?: string, options?: any) => {
    setSelectedVendors(prev => {
      const filtered = prev.filter(s => s.category !== category);
      return [...filtered, { category, vendorId, packageId, options }];
    });
  };

  const handleFinish = async () => {
    setStep(4);
    setIsLoadingAi(true);
    const plan = await generateEventPlan({
      userRequest: request,
      selections: selectedVendors,
      totalCost: totalPrice,
      durationHours: duration
    });
    setAiPlan(plan);
    setIsLoadingAi(false);
  };

  // Quick Test / Auto Fill
  const handleQuickTest = () => {
    resetVendorsForTesting();

    setRequest({
      name: '測試員',
      phone: '0900000000',
      date: new Date().toISOString().split('T')[0], // Today
      startTime: '09:00',
      endTime: '22:00',
      isLocationUndecided: true, // Address undecided
      city: '台北市', // Auto fill city
      district: '信義區', // Auto fill district
      address: '',
      eventType: EventType.BIRTHDAY,
    });

    const allCats = Object.values(ServiceCategory);
    setNeededServices(allCats);

    setStep(3);
    
    setToastMessage('🚀 測試模式：已強制解鎖所有廠商，並自動填寫(台北市/信義區)！');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const validateStep1 = () => {
      const errors = [];
      if (!request.name) errors.push('姓名');
      if (!request.phone) errors.push('電話');
      if (!request.date) errors.push('日期');
      if (!request.eventType) errors.push('活動性質');
      
      if (!request.city) errors.push('縣市');
      if (!request.district) errors.push('地區');
      
      // Address is required ONLY if isLocationUndecided is false
      if (!request.isLocationUndecided && !request.address) errors.push('活動地址');
      
      if (errors.length > 0) {
          setHighlightErrors(true);
          setToastMessage(`🔥 請填寫以下必填欄位：${errors.join('、')}`);
          setTimeout(() => setToastMessage(null), 4000);
          return false;
      }
      setHighlightErrors(false);
      return true;
  };

  const getInputClass = (value: any, isError: boolean = false, disabled: boolean = false) => `
    mt-1 block w-full rounded-md shadow-sm p-3 transition-all duration-300
    ${isError ? 'border-2 border-red-500 bg-red-900/10' : 'border border-slate-600'}
    ${value ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}
    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-slate-700
  `;

  const renderStarRating = (rating: number, count: number) => (
    <div className="flex items-center space-x-1">
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-current' : 'text-slate-600'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-slate-400">({count})</span>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2">
        <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2 text-orange-500">🔥</span> 基本資料與活動資訊
        </h2>
        <button 
            onClick={handleQuickTest}
            className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-full border border-teal-400/50 shadow-lg animate-pulse"
        >
            🚀 測試專用：一鍵媒合 (全廠商解鎖)
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
        <label className="block text-sm font-bold text-orange-400 mb-2">活動性質 (影響系統推薦)</label>
        <select
          name="eventType"
          value={request.eventType}
          onChange={handleInputChange}
          className={`${getInputClass(request.eventType, highlightErrors && !request.eventType)} text-lg`}
        >
          <option value="">請選擇活動類型...</option>
          {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300">聯絡人姓名</label>
          <input type="text" name="name" value={request.name} onChange={handleInputChange} className={getInputClass(request.name, highlightErrors && !request.name)} placeholder="王小明" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">聯絡電話</label>
          <input type="tel" name="phone" value={request.phone} onChange={handleInputChange} className={getInputClass(request.phone, highlightErrors && !request.phone)} placeholder="0912-345-678" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">活動日期</label>
          <input type="date" name="date" value={request.date} onChange={handleInputChange} className={`${getInputClass(request.date, highlightErrors && !request.date)} h-12 text-lg cursor-pointer`} />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-slate-300">開始時間</label>
            <input type="time" name="startTime" value={request.startTime} onChange={handleInputChange} className={getInputClass(request.startTime)} />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-slate-300">結束時間</label>
            <input type="time" name="endTime" value={request.endTime} onChange={handleInputChange} className={getInputClass(request.endTime)} />
          </div>
        </div>

        {/* Location Section */}
        <div className="md:col-span-2 space-y-3 border-t border-slate-700 pt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">活動地點</label>
            
            <div className="flex space-x-4 mb-2">
               <div className="w-1/2">
                 <select 
                   name="city"
                   value={request.city}
                   onChange={handleInputChange}
                   className={getInputClass(request.city, highlightErrors && !request.city)}
                 >
                   <option value="">選擇縣市</option>
                   {Object.keys(TAIWAN_LOCATIONS).map(city => (
                     <option key={city} value={city}>{city}</option>
                   ))}
                 </select>
               </div>
               <div className="w-1/2">
                 <select 
                   name="district"
                   value={request.district}
                   onChange={handleInputChange}
                   disabled={!request.city}
                   className={getInputClass(request.district, highlightErrors && !request.district)}
                 >
                   <option value="">選擇地區</option>
                   {availableDistricts.map(dist => (
                     <option key={dist} value={dist}>{dist}</option>
                   ))}
                 </select>
               </div>
            </div>

            <div className="mb-2">
                <input 
                    type="text" 
                    name="address" 
                    value={request.address} 
                    onChange={handleInputChange} 
                    disabled={request.isLocationUndecided}
                    className={getInputClass(request.address, highlightErrors && !request.address && !request.isLocationUndecided, request.isLocationUndecided)} 
                    placeholder="請輸入詳細地址 (路/街/號/樓)" 
                />
            </div>

            <div className="flex justify-end">
                <label className={`flex items-center space-x-2 text-sm cursor-pointer transition-colors ${!request.city || !request.district ? 'opacity-50 cursor-not-allowed text-slate-500' : 'text-orange-400 hover:text-orange-300'}`}>
                    <input 
                        type="checkbox" 
                        name="isLocationUndecided" 
                        checked={request.isLocationUndecided} 
                        onChange={handleInputChange} 
                        disabled={!request.city || !request.district}
                        className="rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500 disabled:opacity-50" 
                    />
                    <span>地址未定，為我推薦</span>
                </label>
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 text-white flex items-center">
            <span className="mr-2 text-orange-500">✨</span> 選擇服務項目
        </h2>
        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700 mb-6">
          <div>
            <span className="text-slate-400 text-sm">活動時數：</span>
            <span className="font-bold text-lg text-orange-500 ml-2">{duration.toFixed(1)} 小時</span>
          </div>
          <div className="text-xs text-slate-500">({request.startTime} - {request.endTime})</div>
        </div>

        {SERVICE_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-8 last:mb-0">
                <h3 className={`text-lg font-bold mb-4 flex items-center ${group.color} border-b ${group.borderColor} pb-2 w-full md:w-1/3`}>
                    <span className="mr-2">{group.icon}</span> {group.label}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {group.items.map((cat) => (
                        <label key={cat} className={`relative flex flex-col items-center p-3 border rounded-xl cursor-pointer transition-all text-center justify-center min-h-[100px] ${neededServices.includes(cat) ? 'border-orange-500 bg-orange-900/20 shadow-[0_0_10px_rgba(234,88,12,0.2)]' : 'hover:bg-slate-800 border-slate-700 bg-slate-900'}`}>
                            <input type="checkbox" checked={neededServices.includes(cat)} onChange={() => toggleService(cat)} className="h-5 w-5 text-orange-600 bg-slate-800 border-slate-600 rounded mb-2" />
                            <span className="font-medium text-slate-200 text-xs md:text-sm">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>
        ))}
      </div>
    );
  };

  const renderStep3 = () => {
    // Only sort to keep Software/Hardware grouping implicitly or just sort by user need? 
    // Usually user wants to see what they selected. 
    // Let's filter needed categories but preserve the priority order constant or grouping.
    // We can flat map the groups to maintain the order.
    const orderedCategories = [...SERVICE_GROUPS[0].items, ...SERVICE_GROUPS[1].items];
    const sortedNeededServices = orderedCategories.filter(c => neededServices.includes(c));

    return (
      <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 text-white flex items-center">
            <span className="mr-2 text-orange-500">🤝</span> 媒合供應商
        </h2>
        
        {sortedNeededServices.length === 0 ? (
          <div className="text-center py-10 text-slate-500">您尚未選擇任何服務。</div>
        ) : (
          sortedNeededServices.map(category => {
            const startH = parseInt(request.startTime.split(':')[0]);
            const endH = Math.ceil(parseInt(request.endTime.split(':')[0]) + (parseInt(request.endTime.split(':')[1])/60));

            const availableVendors = MOCK_VENDORS.filter(v => 
              v.category === category && 
              isVendorAvailable(v, request.date, startH, endH, request.city, request.isLocationUndecided)
            );

            const selection = selectedVendors.find(s => s.category === category);

            return (
              <div key={category} className="border-b border-slate-700 pb-8 last:border-0">
                <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center">
                  <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded mr-2 border border-indigo-700">{category}</span>
                  選擇您的{category === ServiceCategory.ACTOR ? '魔術師/演員' : category}
                </h3>
                
                {availableVendors.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded p-4 text-center">
                    <p className="text-slate-500 text-sm">抱歉，在 <span className="font-bold text-slate-400">{request.city || '所有地區'}</span> 的該時段沒有可用的 {category}。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableVendors.map(vendor => {
                      const isSelected = selection?.vendorId === vendor.id;
                      
                      // For Decorators, we might need to show a package selector
                      // For others, we calculate standard cost
                      const { total: cost, items: costItems } = calculateVendorCostBreakdown(vendor, request, duration, selection?.packageId, selection?.options);

                      // Package Service Logic (Decorator, Cake, Catering)
                      const isPackageService = vendor.rateType === 'package' && vendor.packages.length > 0;
                      const isDecorator = vendor.category === ServiceCategory.DECOR;
                      const isCake = vendor.category === ServiceCategory.CAKE;
                      const isCatering = vendor.category === ServiceCategory.CATERING;
                      const isHost = vendor.category === ServiceCategory.HOST;

                      // Hourly Rate Logic (Host/Performer/Photographer/Band)
                      const isHourly = vendor.rateType === 'hourly';

                      // Determine current times to show in inputs
                      const currentStart = selection?.options?.serviceStartTime || request.startTime;
                      const currentEnd = selection?.options?.serviceEndTime || request.endTime;

                      // Setup/Teardown/Delivery State
                      const deliveryMethod = selection?.options?.deliveryMethod || 'pickup';
                      const needTeardown = selection?.options?.needTeardown || false;
                      const setupStart = selection?.options?.setupStartTime || '10:00';
                      const setupEnd = selection?.options?.setupEndTime || '12:00';
                      const floor = selection?.options?.floor || '1F';
                      
                      // Check for Setup Availability based on Package Price
                      const selectedPkgObj = isPackageService ? vendor.packages.find(p => p.id === selection?.packageId) : null;
                      const isSetupAvailable = selectedPkgObj ? selectedPkgObj.price >= 5000 : false;

                      return (
                        <div key={vendor.id} className={`relative p-5 rounded-xl border transition-all flex flex-col glow-card ${isSelected ? 'border-orange-500 bg-slate-800 ring-2 ring-orange-500/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
                          <div className="flex gap-4">
                            <img src={vendor.imageUrl} alt={vendor.name} className="w-24 h-24 rounded-lg object-cover bg-slate-800 border border-slate-600" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-100 truncate pr-2 text-lg">{vendor.name}</h4>
                                {isPackageService ? (
                                    <div className="text-right">
                                        <span className="text-orange-500 font-bold text-sm">
                                            {isCake ? '商品價' : '方案價'}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-orange-500 font-bold text-sm whitespace-nowrap">
                                        ${cost.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ {vendor.rateType === 'hourly' ? 'hr' : '式'}</span>
                                    </span>
                                )}
                              </div>
                              <div className="mt-1">{renderStarRating(vendor.rating, vendor.reviewCount)}</div>
                              <p className="mt-2 text-sm text-slate-400 line-clamp-2">{vendor.description}</p>
                            </div>
                          </div>
                          
                          {/* Specific Time Selection for Hourly Vendors */}
                          {isHourly && (
                              <div className="mt-4 bg-slate-800 p-2 rounded border border-slate-700">
                                  <label className="text-xs text-slate-400 block mb-1 font-bold">預約時段 (依時數計費)</label>
                                  <div className="flex gap-2">
                                      <input 
                                        type="time" 
                                        value={currentStart}
                                        onChange={(e) => {
                                            const newOpts = { ...selection?.options, serviceStartTime: e.target.value };
                                            // Auto adjust end time to be at least start + 1hr if needed, or just let calc handle it
                                            if(!selection?.options?.serviceEndTime) newOpts.serviceEndTime = request.endTime;
                                            selectVendor(category, vendor.id, selection?.packageId, newOpts);
                                        }}
                                        className="bg-slate-900 border border-slate-600 rounded text-xs text-white p-1 w-full"
                                      />
                                      <span className="text-slate-500 self-center">to</span>
                                      <input 
                                        type="time" 
                                        value={currentEnd}
                                        onChange={(e) => {
                                             const newOpts = { ...selection?.options, serviceEndTime: e.target.value };
                                             if(!selection?.options?.serviceStartTime) newOpts.serviceStartTime = request.startTime;
                                             selectVendor(category, vendor.id, selection?.packageId, newOpts);
                                        }}
                                        className="bg-slate-900 border border-slate-600 rounded text-xs text-white p-1 w-full"
                                      />
                                  </div>
                              </div>
                          )}

                          {/* Package/Product Selector */}
                          {isPackageService && (
                              <div className="mt-4 bg-slate-800 p-2 rounded border border-slate-700">
                                  <label className="text-xs text-slate-400 block mb-1">
                                      {isHost ? '選擇主持方案' : (isCake ? '選擇蛋糕款式' : (isCatering ? '選擇餐點方案' : '選擇佈置方案'))}
                                  </label>
                                  <select 
                                    className="w-full bg-slate-900 text-white text-sm border border-slate-600 rounded p-1 mb-2"
                                    value={selection?.packageId || ''}
                                    onChange={(e) => {
                                        const newPkgId = e.target.value;
                                        const newPkg = vendor.packages.find(p => p.id === newPkgId);
                                        let newMethod = selection?.options?.deliveryMethod || 'pickup';

                                        // If switching to a cheap package and currently on setup, reset to pickup to prevent invalid state
                                        // Exception for Catering, setup usually allowed
                                        // Exception for Host, delivery method not used (stays pickup/default)
                                        if (!isCatering && !isHost && newPkg && newPkg.price < 5000 && newMethod === 'setup') {
                                            newMethod = 'pickup';
                                        }
                                        
                                        selectVendor(category, vendor.id, newPkgId, { ...selection?.options, deliveryMethod: newMethod, needSetup: newMethod === 'setup' });
                                    }}
                                  >
                                      <option value="" disabled>
                                          {isCake ? '請選擇商品' : '請選擇方案'}
                                      </option>
                                      {vendor.packages.map(p => (
                                          <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString()}</option>
                                      ))}
                                  </select>
                                  
                                  {/* Delivery Options - Hide for Host packages */}
                                  {!isHost && (
                                    <div className="mt-2 border-t border-slate-700 pt-2">
                                        <label className="text-xs text-slate-400 block mb-1">取貨/配送方式</label>
                                        <select 
                                            value={deliveryMethod}
                                            onChange={(e) => selectVendor(category, vendor.id, selection?.packageId, { ...selection?.options, deliveryMethod: e.target.value, needSetup: e.target.value === 'setup' })}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sm text-white"
                                        >
                                            <option value="pickup">自行取貨 (免運費)</option>
                                            <option value="delivery">純外送 (僅配送不佈置)</option>
                                            {/* Show Setup Option primarily for Decor and Catering, typically not for single Cakes unless specified */}
                                            {(!isCake || isSetupAvailable) && (
                                                <option value="setup" disabled={!isSetupAvailable} className={!isSetupAvailable ? 'text-slate-500' : ''}>
                                                    {isCatering ? '外送含擺盤服務 (Buffet Line)' : '專人到府佈置'} {!isSetupAvailable && !isCatering ? '(需選購$5,000以上方案)' : ''}
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                  )}

                                  {/* Setup Time & Floor Selection - Only show relevant fields */}
                                  {!isHost && deliveryMethod !== 'pickup' && (
                                      <div className="mt-2 pt-2 border-t border-slate-600 animate-fade-in">
                                          {deliveryMethod === 'setup' && (
                                              <>
                                                <label className="text-[10px] text-orange-400 block mb-1 font-bold">專人進場/擺盤時間</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input 
                                                        type="time" 
                                                        value={setupStart}
                                                        onChange={(e) => selectVendor(category, vendor.id, selection?.packageId, { ...selection?.options, setupStartTime: e.target.value })}
                                                        className="bg-slate-900 border border-slate-600 rounded text-[10px] text-white p-1 w-full"
                                                    />
                                                    <span className="text-slate-500 self-center text-[10px]">to</span>
                                                    <input 
                                                        type="time" 
                                                        value={setupEnd}
                                                        onChange={(e) => selectVendor(category, vendor.id, selection?.packageId, { ...selection?.options, setupEndTime: e.target.value })}
                                                        className="bg-slate-900 border border-slate-600 rounded text-[10px] text-white p-1 w-full"
                                                    />
                                                </div>
                                              </>
                                          )}

                                          {/* Hide Floor/Teardown for simple Cakes to keep it clean, show for Catering/Decor */}
                                          {!isCake && (
                                              <>
                                                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                                                      {deliveryMethod === 'delivery' ? '樓層 (非 1F 會有樓層費)' : '樓層 (請告知以利進場)'}
                                                  </label>
                                                  <select 
                                                    value={floor}
                                                    onChange={(e) => selectVendor(category, vendor.id, selection?.packageId, { ...selection?.options, floor: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded text-[10px] text-white p-1 mb-2"
                                                  >
                                                      <option value="1F">1F (無樓層費)</option>
                                                      <option value="2F">2F</option>
                                                      <option value="3F">3F</option>
                                                      <option value="4F">4F</option>
                                                      <option value="5F">5F</option>
                                                      <option value="6F以上">6F以上</option>
                                                      <option value="B1">B1</option>
                                                      <option value="B2">B2</option>
                                                  </select>

                                                  {isDecorator && (
                                                      <label className="flex items-center space-x-1 text-xs text-slate-300 cursor-pointer">
                                                          <input 
                                                            type="checkbox" 
                                                            checked={needTeardown} 
                                                            onChange={(e) => selectVendor(category, vendor.id, selection?.packageId, { ...selection?.options, needTeardown: e.target.checked })}
                                                            className="rounded bg-slate-700 border-slate-500"
                                                          />
                                                          <span>需要撤場服務</span>
                                                      </label>
                                                  )}
                                              </>
                                          )}
                                      </div>
                                  )}

                                  {isSelected && selection?.packageId && (
                                      <div className="mt-4 bg-slate-950/50 rounded-lg p-3 border border-slate-600/50">
                                          <div className="space-y-1.5 mb-2">
                                              {costItems.map((item, idx) => (
                                                  <div key={idx} className="flex justify-between text-xs text-slate-400">
                                                      <span>{item.label}</span>
                                                      <span className="font-mono">${item.amount.toLocaleString()}</span>
                                                  </div>
                                              ))}
                                          </div>
                                          <div className="flex justify-between items-center border-t border-slate-600/50 pt-2 mt-2">
                                              <span className="text-sm font-bold text-white">總計</span>
                                              <span className="text-xl font-black text-orange-500 tracking-tight">${cost.toLocaleString()}</span>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}

                          <div className="mt-4 flex space-x-3 pt-3 border-t border-slate-700">
                            <button onClick={() => setViewingVendor(vendor)} className="flex-1 text-xs py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-800 font-medium transition-colors">查看作品與評價</button>
                            <button 
                                onClick={() => {
                                    // If package service and no package selected, select first package by default
                                    if (isPackageService && !selection?.packageId && vendor.packages.length > 0) {
                                        selectVendor(category, vendor.id, vendor.packages[0].id, selection?.options);
                                    } else {
                                        // Ensure options carry over or initialize defaults if newly selecting
                                        const defaultOpts = isHourly ? { serviceStartTime: request.startTime, serviceEndTime: request.endTime } : selection?.options;
                                        selectVendor(category, vendor.id, selection?.packageId, defaultOpts);
                                    }
                                }} 
                                className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors shadow-md ${isSelected ? 'bg-orange-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                              {isSelected ? '已選擇' : '選擇'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 text-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <h2 className="text-2xl font-bold text-green-400 mb-2">預約成功！</h2>
          <p className="text-green-200">您的活動需求單已送出，我們將儘快與您聯繫確認。</p>
        </div>
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-2 text-white">訂單摘要</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6 text-slate-300">
            <div><span className="text-slate-500">活動性質：</span> {request.eventType}</div>
            <div><span className="text-slate-500">聯絡人：</span> {request.name}</div>
            <div><span className="text-slate-500">日期：</span> {request.date}</div>
            <div><span className="text-slate-500">時間：</span> {request.startTime} - {request.endTime}</div>
            <div className="col-span-2">
                <span className="text-slate-500">地點：</span> 
                {request.isLocationUndecided 
                    ? `${request.city} ${request.district} (地址未定)` 
                    : `${request.city}${request.district}${request.address}`}
            </div>
          </div>
          <h4 className="font-medium mb-2 text-white">已選服務</h4>
          <div className="space-y-2 mb-6">
            {selectedVendors.map((sel, idx) => {
              const vendor = MOCK_VENDORS.find(v => v.id === sel.vendorId);
              const cost = vendor ? calculateVendorCost(vendor, request, duration, sel.packageId, sel.options) : 0;
              const pkgName = vendor?.packages?.find(p => p.id === sel.packageId)?.name;
              
              // Display time range if specific
              const timeDisplay = sel.options?.serviceStartTime && sel.options?.serviceEndTime 
                ? ` (${sel.options.serviceStartTime}-${sel.options.serviceEndTime})`
                : '';
              
              const floorDisplay = sel.options?.floor && sel.options?.floor !== '1F' ? `, ${sel.options.floor}` : '';
              
              // Method Display
              let methodDisplay = '';
              if (sel.options?.deliveryMethod === 'setup') methodDisplay = sel.category === ServiceCategory.CATERING ? '外送含擺盤' : '專人佈置';
              else if (sel.options?.deliveryMethod === 'delivery') methodDisplay = '純外送';
              else if (sel.options?.deliveryMethod === 'pickup') methodDisplay = '自取';

              return (
                <div key={idx} className="flex justify-between text-sm bg-slate-900 p-3 rounded border border-slate-700">
                  <div className="flex flex-col">
                      <span className="text-slate-200 font-bold">{sel.category} - {vendor?.name}</span>
                      {pkgName && <span className="text-xs text-slate-500">{pkgName}</span>}
                      {timeDisplay && <span className="text-xs text-indigo-400">{timeDisplay}</span>}
                      {methodDisplay && (
                          <span className="text-xs text-orange-400">
                              {/* Hide delivery method text for Host, except if logic changes */}
                              {sel.category !== ServiceCategory.HOST && methodDisplay} 
                              {sel.options?.deliveryMethod !== 'pickup' && sel.category !== ServiceCategory.CAKE && sel.category !== ServiceCategory.HOST && floorDisplay}
                              {sel.options?.setupStartTime && ` (${sel.options.setupStartTime}-${sel.options.setupEndTime})`}
                          </span>
                      )}
                  </div>
                  <span className="font-mono text-orange-400 font-bold">${cost.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between items-center border-t border-slate-700 pt-4">
            <span className="text-xl font-bold text-white">總金額</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">${totalPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900/40 border border-indigo-500/30 rounded-lg p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-indigo-200 mb-2">AI 智慧活動助手</h3>
             {isLoadingAi ? <p className="text-slate-400">正在生成...</p> : <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-line">{aiPlan}</div>}
        </div>
        <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors border border-slate-600">回到首頁</button>
      </div>
    );
  };

  return (
    <div ref={topRef} className="max-w-3xl mx-auto pb-24 px-4 relative z-10">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <a href="tel:0982779903" className="fixed bottom-24 right-4 z-[60] bg-slate-800 text-indigo-400 font-bold py-3 px-4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-500/50 flex items-center hover:bg-slate-700 transition-all hover:scale-105">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        聯絡客服
      </a>
      {viewingVendor && (
        <VendorDetailModal
          vendor={viewingVendor}
          onClose={() => setViewingVendor(null)}
          onSelect={(id) => { selectVendor(viewingVendor.category, id); setViewingVendor(null); }}
          userName={request.name}
        />
      )}
      {step < 4 && (
        <div className="flex items-center justify-between mb-8 pt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step >= i ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{i}</div>
              {i < 3 && <div className={`flex-1 h-1 mx-2 transition-all rounded-full ${step > i ? 'bg-orange-600 shadow-[0_0_5px_rgba(249,115,22,0.5)]' : 'bg-slate-800'}`}></div>}
            </div>
          ))}
        </div>
      )}
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderSummary()}
      </div>
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] p-4 z-50">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="text-slate-200">
              <span className="text-xs text-slate-500 block uppercase tracking-wider">預估總金額</span>
              <span className="text-2xl font-black text-orange-500 drop-shadow-sm">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="space-x-4">
               {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">上一步</button>}
               {step < 3 ? <button onClick={() => { if (step === 1 && !validateStep1()) return; setStep(step + 1) }} className="px-8 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(234,88,12,0.5)] transition-all font-bold shadow-md transform active:scale-95">下一步</button> : 
               <button onClick={handleFinish} className={`px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all font-bold shadow-md transform active:scale-95 ${selectedVendors.length < neededServices.length ? 'opacity-50 cursor-not-allowed grayscale' : ''}`} disabled={selectedVendors.length < neededServices.length}>確認預約</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientWizard;
