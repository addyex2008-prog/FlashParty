
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_VENDORS, calculateVendorCost, calculateVendorCostBreakdown, isVendorAvailable, TAIWAN_LOCATIONS, EVENT_TYPE_RECOMMENDATIONS, resetVendorsForTesting, MOCK_ORDERS, randomlyEnableVendors, MOCK_DISCOUNTS } from '../services/mockData';
import { Vendor, ServiceCategory, UserRequest, SelectedService, EventType, VendorPackage, Order, Discount } from '../types';
import { generateEventPlan } from '../services/geminiService';
import VendorDetailModal from './VendorDetailModal';

// Category Icons Mapping
const CATEGORY_ICONS: Record<ServiceCategory, React.ReactNode> = {
  [ServiceCategory.PLANNER]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  [ServiceCategory.HOST]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m-3-8V5a3 3 0 116 0v6a3 3 0 01-6 0z" /></svg>,
  [ServiceCategory.PHOTOGRAPHER]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>,
  [ServiceCategory.BAND]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>,
  [ServiceCategory.SINGER]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4" /><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /></svg>,
  [ServiceCategory.DJ]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /><path d="M8 12h8" /></svg>,
  [ServiceCategory.MAGICIAN]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11l-7-7-7 7m14 0v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0h-2m-2 0h-5m-4 0H3" /></svg>,
  [ServiceCategory.LION_DANCE]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  [ServiceCategory.BALLOON]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="8" r="6" /><path d="M12 14v7" /></svg>,
  [ServiceCategory.PT]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [ServiceCategory.PERFORMER]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></svg>,
  [ServiceCategory.ACTOR]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9 10h.01M15 10h.01M9.5 15.5c.667.667 1.5 1 2.5 1s1.833-.333 2.5-1" /></svg>,
  [ServiceCategory.ACROBATICS]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 7v5l3 3" /></svg>,
  [ServiceCategory.DANCE]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 5v14l-4-4H5V9h4l4-4z" /></svg>,
  [ServiceCategory.DYNAMIC_PHOTO]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  [ServiceCategory.STATIC_PHOTO]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="12" cy="12" r="3" /></svg>,
  [ServiceCategory.VIDEOGRAPHY]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  [ServiceCategory.DECOR]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
  [ServiceCategory.VENUE_RENTAL]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></svg>,
  [ServiceCategory.CATERING]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  [ServiceCategory.STAGE_HARDWARE]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  [ServiceCategory.CAKE]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-1.5-.454V6.454C3.454 6.151 3.977 6 4.5 6s1.046.151 1.5.454a2.704 2.704 0 013 0 2.703 2.703 0 013 0 2.703 2.703 0 013 0 2.704 2.704 0 011.5-.454v9.092z" /></svg>,
  [ServiceCategory.FLORIST]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>,
  [ServiceCategory.DESIGN_PRINT]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  [ServiceCategory.STAFF]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  [ServiceCategory.OTHER]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
};

// Toast Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-20 right-5 left-5 md:left-auto z-[999] animate-fade-in">
    <div className="bg-[#f46011]/90 text-white px-8 py-5 rounded-xl shadow-[0_0_20px_rgba(244,96,17,0.5)] flex items-center gap-4 border border-[#f46011]/50 justify-between md:justify-start">
      <div className="flex items-center gap-3">
        <div className="bg-white text-[#f46011] rounded-full w-8 h-8 flex shrink-0 items-center justify-center font-bold text-lg">!</div>
        <span className="font-bold tracking-wide text-base md:text-lg">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 text-orange-200 hover:text-white shrink-0 text-xl">✕</button>
    </div>
  </div>
);

const SERVICE_GROUPS = [
  {
    label: '軟體服務 (Software)',
    color: 'text-primary',
    items: [
      ServiceCategory.PLANNER, 
      ServiceCategory.HOST, 
      ServiceCategory.PHOTOGRAPHER, 
      ServiceCategory.BAND, 
      ServiceCategory.SINGER, 
      ServiceCategory.DJ, 
      ServiceCategory.MAGICIAN, 
      ServiceCategory.LION_DANCE, 
      ServiceCategory.BALLOON, 
      ServiceCategory.PT,
      ServiceCategory.PERFORMER,
      ServiceCategory.ACTOR,
      ServiceCategory.ACROBATICS,
      ServiceCategory.DANCE
    ]
  },
  {
    label: '硬體服務 (Hardware)',
    color: 'text-orange-300',
    items: [
      ServiceCategory.DECOR, 
      ServiceCategory.VENUE_RENTAL, 
      ServiceCategory.CATERING, 
      ServiceCategory.STAGE_HARDWARE, 
      ServiceCategory.CAKE, 
      ServiceCategory.FLORIST, 
      ServiceCategory.DESIGN_PRINT, 
      ServiceCategory.STAFF
    ]
  }
];

const eventTypes = Object.values(EventType);

// Decor Config Modal
const DecorConfigModal = ({ 
    visible, 
    onClose, 
    onConfirm, 
    vendor, 
    pkg,
    eventDate 
}: { 
    visible: boolean; 
    onClose: () => void; 
    onConfirm: (options: any) => void;
    vendor: Vendor | null;
    pkg: VendorPackage | null;
    eventDate: string;
}) => {
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'setup'>('setup');
    const [pickupTime, setPickupTime] = useState('10:00');
    const [needTeardown, setNeedTeardown] = useState(false);
    const [needUpstairs, setNeedUpstairs] = useState(false);
    
    if (!visible || !vendor) return null;

    const basePrice = pkg ? pkg.price : vendor.rate;
    const isSetupAllowed = basePrice >= 5000;

    const handleConfirm = () => {
        if (deliveryMethod === 'setup' && !isSetupAllowed) {
            alert('專人到府佈置低消需滿 $5000 以上，請選擇其他方式或升級方案。');
            return;
        }
        onConfirm({
            deliveryMethod,
            pickupTime,
            needTeardown,
            needUpstairs: deliveryMethod === 'delivery' ? needUpstairs : false,
        });
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 w-full max-w-lg shadow-[0_0_50px_rgba(244,96,17,0.2)] animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white flex items-center">
                        <span className="w-1.5 h-8 bg-primary mr-4 rounded-full"></span>
                        場地佈置 - 配送服務設定
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
                </div>

                <div className="space-y-8">
                    {/* Method */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <label className="text-sm text-slate-500 font-black uppercase mb-4 block">取貨/服務方式</label>
                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => setDeliveryMethod('pickup')} 
                                className={`py-4 rounded-2xl text-sm font-bold transition-all border ${deliveryMethod === 'pickup' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-black/20 text-slate-400 border-white/10 hover:border-white/30'}`}
                            >
                                自取 (免運)
                            </button>
                            <button 
                                onClick={() => setDeliveryMethod('delivery')} 
                                className={`py-4 rounded-2xl text-sm font-bold transition-all border ${deliveryMethod === 'delivery' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-black/20 text-slate-400 border-white/10 hover:border-white/30'}`}
                            >
                                純外送
                            </button>
                            <button 
                                onClick={() => setDeliveryMethod('setup')} 
                                className={`py-4 rounded-2xl text-sm font-bold transition-all border relative ${deliveryMethod === 'setup' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-black/20 text-slate-400 border-white/10 hover:border-white/30'} ${!isSetupAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isSetupAllowed}
                            >
                                專人佈置
                                {!isSetupAllowed && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">低消5000</span>}
                            </button>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <label className="text-sm text-slate-500 font-black uppercase mb-4 block">預計取貨/進場時間</label>
                        <div className="flex gap-4 items-center">
                            <div className="bg-black/20 px-6 py-4 rounded-2xl text-slate-300 font-bold border border-white/10 flex-1 text-center text-lg">
                                {eventDate}
                            </div>
                            <input 
                                type="time" 
                                value={pickupTime} 
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="bg-black/20 px-6 py-4 rounded-2xl text-white font-bold border border-white/10 outline-none focus:border-primary flex-1 text-center text-lg"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center font-bold">若為專人佈置，此為廠商進場佈置時間</p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className={`p-6 rounded-3xl border transition-all ${deliveryMethod === 'pickup' ? 'opacity-30 pointer-events-none border-white/5' : 'bg-white/5 border-white/5'}`}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-base font-bold text-white">是否需撤場?</span>
                                <input 
                                    type="checkbox" 
                                    checked={needTeardown} 
                                    onChange={(e) => setNeedTeardown(e.target.checked)}
                                    className="accent-primary w-6 h-6"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-2 font-bold">活動結束後專人前往回收道具</p>
                        </div>

                        <div className={`p-6 rounded-3xl border transition-all ${deliveryMethod === 'delivery' ? 'bg-white/5 border-white/5' : 'opacity-30 pointer-events-none border-white/5'}`}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-base font-bold text-white">是否需上樓?</span>
                                <input 
                                    type="checkbox" 
                                    checked={needUpstairs} 
                                    onChange={(e) => setNeedUpstairs(e.target.checked)}
                                    className="accent-primary w-6 h-6"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-2 font-bold">僅限無電梯公寓或特殊搬運需求</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                    <button onClick={handleConfirm} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg hover:bg-[#d9520e] transition-all">
                        確認配送細節
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ClientWizardProps {
  onBack: () => void;
  onGoToMemberCenter?: () => void;
}

const ClientWizard: React.FC<ClientWizardProps> = ({ onBack, onGoToMemberCenter }) => {
  const [step, setStep] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlightErrors, setHighlightErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeDetailVendor, setActiveDetailVendor] = useState<Vendor | null>(null);
  const [selectedOrderVendor, setSelectedOrderVendor] = useState<{order: Order, selection: SelectedService} | null>(null);
  
  // Pending decoration config state
  const [pendingDecorSelection, setPendingDecorSelection] = useState<{vendorId: string, packageId?: string} | null>(null);

  // Discount state
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);

  const [request, setRequest] = useState<UserRequest>({
    name: '', phone: '', date: '', startTime: '14:00', endTime: '18:00',
    isLocationUndecided: false, city: '', district: '', venueName: '', address: '', eventType: '',
  });

  const [neededServices, setNeededServices] = useState<ServiceCategory[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<SelectedService[]>([]);
  const [aiPlan, setAiPlan] = useState<string>('');

  const availableDistricts = request.city ? TAIWAN_LOCATIONS[request.city] || [] : [];
  const duration = 4; // Simplified duration

  const rawTotalPrice = selectedVendors.reduce((sum, selection) => {
    const vendor = MOCK_VENDORS.find(v => v.id === selection.vendorId);
    if (!vendor) return sum;
    return calculateVendorCost(vendor, request, duration, selection.packageId, selection.options);
  }, 0);

  const finalTotalPrice = appliedDiscount ? Math.round(rawTotalPrice * appliedDiscount.multiplier) : rawTotalPrice;
  const discountAmount = rawTotalPrice - finalTotalPrice;

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRequest(prev => ({ ...prev, [name]: checked }));
    } else {
      setRequest(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleService = (category: ServiceCategory) => {
    setNeededServices(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    setSelectedVendors(prev => prev.filter(s => s.category !== category));
  };

  const selectVendor = (category: ServiceCategory, vendorId: string, packageId?: string, options?: any) => {
    // If it's Decor, we need extra config first
    if (category === ServiceCategory.DECOR && !options) {
        setPendingDecorSelection({ vendorId, packageId });
        setActiveDetailVendor(null);
        return;
    }

    setSelectedVendors(prev => {
      const filtered = prev.filter(s => s.category !== category);
      return [...filtered, { category, vendorId, packageId, options }];
    });
    setActiveDetailVendor(null); // Close modal on selection
  };

  const handleDecorConfigConfirm = (options: any) => {
      if (pendingDecorSelection) {
          selectVendor(ServiceCategory.DECOR, pendingDecorSelection.vendorId, pendingDecorSelection.packageId, options);
          setPendingDecorSelection(null);
      }
  };

  const handleApplyDiscount = () => {
    const discount = MOCK_DISCOUNTS.find(d => d.code === discountCodeInput);
    if (!discount) {
      setToastMessage('❌ 折扣碼無效或已過期');
      return;
    }
    if (new Date(discount.expiry) < new Date()) {
      setToastMessage('❌ 此折扣碼已超過有效期限');
      return;
    }
    setAppliedDiscount(discount);
    setToastMessage(`✅ 折扣碼 "${discount.code}" 已套用：${(1 - discount.multiplier) * 100}% OFF`);
  };

  const handleQuickTest = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    const cities = Object.keys(TAIWAN_LOCATIONS);
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomDist = TAIWAN_LOCATIONS[randomCity][0];

    const testRequest = {
        name: 'JK小丑',
        phone: '0857888888',
        date: dateStr,
        startTime: '14:00',
        endTime: '18:00',
        isLocationUndecided: false,
        city: randomCity,
        district: randomDist,
        venueName: '測試派對中心',
        address: '測試路 123 號 4 樓',
        eventType: EventType.BIRTHDAY
    };

    randomlyEnableVendors(dateStr, randomCity);
    setRequest(testRequest);
    setNeededServices([ServiceCategory.HOST, ServiceCategory.DECOR, ServiceCategory.CAKE]);
    setToastMessage("✅ 快速測試已填入，隨機挑選一半供應商已開啟檔期！");
  };

  const handleGenerateAiPlan = async () => {
    setIsAiLoading(true);
    const plan = await generateEventPlan({
      userRequest: request, selections: selectedVendors, totalCost: finalTotalPrice, durationHours: duration
    });
    setAiPlan(plan);
    setIsAiLoading(false);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    // Add default PENDING status to all selected vendors
    const finalSelections = selectedVendors.map(s => ({...s, status: 'PENDING' as const}));
    
    setTimeout(() => {
        const newOrder: Order = {
            id: 'EZ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            userRequest: request,
            selections: finalSelections,
            totalCost: finalTotalPrice,
            discountApplied: discountAmount,
            discountCode: appliedDiscount?.code,
            durationHours: duration,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            aiPlan: aiPlan
        };
        MOCK_ORDERS.push(newOrder);

        // Update sold counts for vendors in mock data
        finalSelections.forEach(sel => {
            const vendor = MOCK_VENDORS.find(v => v.id === sel.vendorId);
            if (vendor && sel.packageId) {
                const pkg = vendor.packages.find(p => p.id === sel.packageId);
                if (pkg) {
                    pkg.soldCount = (pkg.soldCount || 0) + 1;
                }
            }
        });

        setIsSubmitting(false);
        setStep(5);
    }, 1500);
  };

  const validateStep1 = () => {
      const errors = !request.name || !request.phone || !request.date || !request.eventType || !request.city || !request.district;
      if (errors) {
          setHighlightErrors(true);
          setToastMessage(`🔥 請完整填寫所有標示欄位`);
          return false;
      }
      return true;
  };

  const getInputClass = (value: any, isError: boolean = false) => `
    mt-2 block w-full rounded-2xl p-5 transition-all duration-300 text-base font-bold
    ${isError ? 'border-2 border-red-500 bg-red-900/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border border-white/10'}
    ${value ? 'bg-[#f46011]/15 text-white border-[#f46011] shadow-[0_0_15px_rgba(244,96,17,0.2)]' : 'bg-white/5 text-slate-400'}
    hover:border-[#f46011]/50 focus:border-[#f46011] focus:ring-1 focus:ring-[#f46011] focus:bg-[#f46011]/10 outline-none
  `;

  // Render modal for client to view specific order details
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

  const renderStep1 = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <span className="mr-4 text-primary neon-text">⚡</span> 活動基本資訊
        </h2>
        <button onClick={handleQuickTest} className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-full hover:bg-indigo-500 hover:text-white transition-all font-bold uppercase tracking-wider">快速測試</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {/* Row 1: Type, Date, Start, End */}
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase tracking-widest mb-3">活動性質</label>
            <select name="eventType" value={request.eventType} onChange={handleInputChange} className={getInputClass(request.eventType, highlightErrors && !request.eventType)}>
                <option value="">請選擇類型...</option>
                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2">日期</label>
            <input type="date" name="date" value={request.date} onChange={handleInputChange} className={getInputClass(request.date, highlightErrors && !request.date)} />
        </div>
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2">開始</label>
            <input type="time" name="startTime" value={request.startTime} onChange={handleInputChange} className={getInputClass(request.startTime)} />
        </div>
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2">結束</label>
            <input type="time" name="endTime" value={request.endTime} onChange={handleInputChange} className={getInputClass(request.endTime)} />
        </div>

        {/* Row 2: Name, Phone, City, District */}
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2">聯絡姓名</label>
            <input type="text" name="name" value={request.name} onChange={handleInputChange} className={getInputClass(request.name, highlightErrors && !request.name)} placeholder="您的姓名" />
        </div>
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2">聯絡電話</label>
            <input type="tel" name="phone" value={request.phone} onChange={handleInputChange} className={getInputClass(request.phone, highlightErrors && !request.phone)} placeholder="手機號碼" />
        </div>
        <div className="md:col-span-1">
           <label className="block text-lg font-bold text-slate-500 uppercase mb-2">縣市</label>
           <select name="city" value={request.city} onChange={handleInputChange} className={getInputClass(request.city, highlightErrors && !request.city)}><option value="">請選擇</option>{Object.keys(TAIWAN_LOCATIONS).map(city => <option key={city} value={city}>{city}</option>)}</select>
        </div>
        <div className="md:col-span-1">
           <label className="block text-lg font-bold text-slate-500 uppercase mb-2">地區</label>
           <select name="district" value={request.district} onChange={handleInputChange} disabled={!request.city} className={getInputClass(request.district, highlightErrors && !request.district)}><option value="">請選擇</option>{availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}</select>
        </div>

        {/* Row 3: Venue, Address */}
        <div className="md:col-span-1">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2 tracking-widest">場地 / 飯店 / 餐廳名稱</label>
            <input 
              type="text" 
              name="venueName" 
              value={request.venueName} 
              onChange={handleInputChange} 
              className={getInputClass(request.venueName)} 
              placeholder="例如：台北 W 飯店" 
            />
        </div>
        <div className="md:col-span-3">
            <label className="block text-lg font-bold text-slate-500 uppercase mb-2 tracking-widest">詳細地址</label>
            <input 
              type="text" 
              name="address" 
              value={request.address} 
              onChange={handleInputChange} 
              className={getInputClass(request.address)} 
              placeholder="例如：中山區民權東路三段 1 號 3 樓 A 廳" 
            />
            <p className="mt-3 text-xs text-slate-600 italic font-bold">精確的地址能幫助供應商更準確計算車馬費與搬運費用。</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-12 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold border-b border-white/5 pb-6 text-white flex items-center">
          <span className="mr-4 text-primary neon-text">✨</span> 選擇活動所需服務
      </h2>
      {SERVICE_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
              <h3 className={`text-sm font-black ${group.color} uppercase tracking-[0.3em] ml-2`}>{group.label}</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.items.map((cat) => (
                      <label 
                        key={cat} 
                        className={`group relative p-3 md:p-4 border rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 h-full ${
                          neededServices.includes(cat) 
                            ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(244,96,17,0.4)] scale-[1.02]' 
                            : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                          <input type="checkbox" checked={neededServices.includes(cat)} onChange={() => toggleService(cat)} className="hidden" />
                          <div className={`transition-all duration-300 ${neededServices.includes(cat) ? 'text-white scale-110' : 'text-slate-600 group-hover:text-primary'}`}>
                            {CATEGORY_ICONS[cat] || <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>}
                          </div>
                          <span className={`font-black text-sm tracking-widest uppercase transition-colors text-center leading-tight ${neededServices.includes(cat) ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            {cat}
                          </span>
                          {neededServices.includes(cat) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                      </label>
                  ))}
              </div>
          </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-12 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold border-b border-white/5 pb-6 text-white flex items-center">
          <span className="mr-4 text-primary neon-text">🤝</span> 供應商即時報價
      </h2>
      <p className="text-sm text-slate-500 -mt-8 mb-6 font-bold">點擊供應商卡片可查看 <span className="text-white font-bold">作品集照片</span>、<span className="text-white font-bold">示範影片</span> 及 <span className="text-white font-bold">詳細方案內容</span>。</p>
      
      {neededServices.map(category => {
          const vendors = MOCK_VENDORS.filter(v => v.category === category);
          const sel = selectedVendors.find(s => s.category === category);
          return (
            <div key={category} className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-primary flex items-center"><span className="w-1.5 h-6 bg-primary mr-4 rounded-full"></span>{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendors.map(v => (
                  <div key={v.id} onClick={() => setActiveDetailVendor(v)} className={`p-6 rounded-3xl border transition-all glass-card cursor-pointer group ${sel?.vendorId === v.id ? 'border-[#f46011] bg-[#f46011]/5' : 'border-white/10 hover:border-white/30'}`}>
                    <div className="flex gap-6">
                      <img src={v.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-lg md:text-xl group-hover:text-primary transition-colors">{v.name}</h4>
                            <span className="text-primary font-black text-lg md:text-xl">${v.rate.toLocaleString()}</span>
                        </div>
                        {sel?.vendorId === v.id ? (
                            <div className="mt-4 w-full py-3 rounded-xl text-sm font-bold tracking-widest bg-[#f46011] text-white shadow-[0_5px_15px_rgba(244,96,17,0.3)] text-center">
                                已選擇 (點擊查看詳情)
                            </div>
                        ) : (
                            <div className="mt-4 w-full py-3 rounded-xl text-sm font-bold tracking-widest bg-white/10 text-slate-400 text-center group-hover:bg-white/20 group-hover:text-white transition-all">
                                查看作品與方案
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
      })}
    </div>
  );

  const renderStep4Review = () => (
    <div className="space-y-10 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold border-b border-white/5 pb-6 text-white flex items-center">
          <span className="mr-4 text-primary neon-text">📑</span> 訂購總表檢視
      </h2>
      <div className="glass-card rounded-[40px] p-8 md:p-12 border border-white/10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <div className="p-6 bg-white/5 rounded-3xl"><span className="text-slate-500 block text-xs font-bold uppercase mb-3 tracking-wider">主辦人</span><span className="font-bold text-white text-lg">{request.name}</span></div>
              <div className="p-6 bg-white/5 rounded-3xl"><span className="text-slate-500 block text-xs font-bold uppercase mb-3 tracking-wider">聯絡資訊</span><span className="font-bold text-white text-lg">{request.phone}</span></div>
              <div className="p-6 bg-white/5 rounded-3xl"><span className="text-slate-500 block text-xs font-bold uppercase mb-3 tracking-wider">活動日期時間</span><span className="font-bold text-white text-lg">{request.date} {request.startTime}-{request.endTime}</span></div>
              <div className="p-6 bg-white/5 rounded-3xl md:col-span-2"><span className="text-slate-500 block text-xs font-bold uppercase mb-3 tracking-wider">場地與詳細地址</span><span className="font-bold text-white text-lg">{request.city}{request.district} {request.venueName} - {request.address} ({request.eventType})</span></div>
          </div>
          
          <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3"></span> 選購服務清單</span>
                  <span className="text-[10px] text-primary/70 font-bold bg-primary/10 px-2 py-1 rounded">點擊項目可修改方案</span>
              </h4>
              <div className="space-y-4">
                  {selectedVendors.map((sel, idx) => {
                      const vendor = MOCK_VENDORS.find(v => v.id === sel.vendorId);
                      const pkg = vendor?.packages?.find(p => p.id === sel.packageId);
                      const breakdown = calculateVendorCostBreakdown(vendor!, request, duration, sel.packageId, sel.options);
                      
                      return (
                        <div 
                            key={idx} 
                            onClick={() => {
                                if(vendor) setActiveDetailVendor(vendor);
                            }}
                            className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group relative"
                        >
                            <div className="absolute top-6 right-6 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-primary/30 shadow-lg z-10">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                修改方案
                            </div>

                            <div className="flex items-center gap-6">
                                <img src={pkg ? pkg.imageUrls[0] : vendor?.imageUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                                <div className="flex-1">
                                    <span className="text-xs text-primary font-black uppercase">{sel.category}</span>
                                    <div className="font-bold text-white text-lg md:text-xl">{vendor?.name}</div>
                                    {pkg && <div className="text-sm text-slate-400 mt-1 truncate max-w-[200px] md:max-w-none font-medium">方案: {pkg.name}</div>}
                                </div>
                                <span className="font-black text-white text-xl md:text-2xl">${breakdown.total.toLocaleString()}</span>
                            </div>
                            {/* Cost Breakdown Details */}
                            {breakdown.items.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-white/5 pl-24 text-sm space-y-2">
                                    {breakdown.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-slate-400 font-medium">
                                            <span>• {item.label}</span>
                                            <span>${item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                      );
                  })}
              </div>
          </div>

          <div className="space-y-6 border-t border-white/5 pt-10">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">折扣優惠套用</h4>
              <div className="flex gap-6">
                  <input 
                      type="text" 
                      placeholder="請輸入折扣碼 (例如: 7979)" 
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-base text-white focus:border-primary outline-none transition-all w-full font-bold"
                  />
                  <button 
                      onClick={handleApplyDiscount}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap"
                  >
                      套用
                  </button>
              </div>
              {appliedDiscount && (
                  <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl">
                      <span className="text-sm text-green-400 font-bold">已成功套用: {appliedDiscount.code}</span>
                      <span className="text-sm text-green-400 font-black">-${discountAmount.toLocaleString()}</span>
                  </div>
              )}
          </div>

          <div className="flex justify-between items-center border-t border-white/10 pt-10">
              <span className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest">媒合委託預估總預算</span>
              <div className="text-right">
                  {appliedDiscount && <div className="text-sm text-slate-500 line-through mb-1 font-bold">${rawTotalPrice.toLocaleString()}</div>}
                  <span className="text-4xl md:text-5xl font-black text-primary neon-text tracking-tighter">${finalTotalPrice.toLocaleString()}</span>
              </div>
          </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-10 rounded-[32px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <h3 className="text-indigo-400 font-black text-sm mb-6 flex items-center tracking-widest uppercase">
              ✨ AI 生成活動企劃建議 (選填)
          </h3>
          {aiPlan ? (
            <p className="text-sm text-slate-300 whitespace-pre-line leading-loose font-medium">{aiPlan}</p>
          ) : (
            <div className="text-center py-6">
                <p className="text-sm text-slate-500 mb-8 italic font-bold">點擊下方按鈕，讓 AI 為您的活動生成專業流程建議</p>
                <button 
                  onClick={handleGenerateAiPlan}
                  disabled={isAiLoading}
                  className="px-10 py-4 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-600/50 text-indigo-100 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {isAiLoading ? (
                      <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 正在規劃中...</span>
                  ) : "生成 AI 企劃建議"}
                </button>
            </div>
          )}
      </div>

      <button 
        disabled={isSubmitting}
        onClick={handleFinalSubmit}
        className="w-full py-8 rounded-[32px] bg-[#f46011] text-white font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(244,96,17,0.4)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-xl md:text-2xl mb-24"
      >
        {isSubmitting ? '正在提交訂單...' : '確認送出媒合訂購單'}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 md:px-6 relative pb-40">
       <div ref={topRef}></div>
       
       <button 
         onClick={step === 1 ? onBack : () => setStep(prev => prev - 1)}
         className="fixed top-6 left-4 md:left-8 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:border-white/30"
       >
         <span>←</span> {step === 1 ? '回首頁' : '上一步'}
       </button>

       {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

       {step === 1 && renderStep1()}
       {step === 2 && renderStep2()}
       {step === 3 && renderStep3()}
       {step === 4 && renderStep4Review()}
       
       {step === 5 && (
           <div className="text-center py-20 animate-fade-in flex flex-col items-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-6">委託需求已送出！</h2>
                <p className="text-slate-400 text-lg mb-12 font-bold max-w-md">我們已將您的需求發送給相關供應商。<br/>請留意您的會員中心，供應商將在稍後回覆報價。</p>
                <button 
                  onClick={onGoToMemberCenter} 
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                >
                  前往會員中心
                </button>
           </div>
       )}

       {/* Modals */}
       <DecorConfigModal 
          visible={!!pendingDecorSelection}
          onClose={() => setPendingDecorSelection(null)}
          onConfirm={handleDecorConfigConfirm}
          vendor={MOCK_VENDORS.find(v => v.id === pendingDecorSelection?.vendorId) || null}
          pkg={pendingDecorSelection?.packageId ? MOCK_VENDORS.find(v => v.id === pendingDecorSelection?.vendorId)?.packages?.find(p => p.id === pendingDecorSelection.packageId) || null : null}
          eventDate={request.date}
       />
       
       {activeDetailVendor && (
          <VendorDetailModal 
            vendor={activeDetailVendor}
            onClose={() => setActiveDetailVendor(null)}
            onSelect={(vid, pid) => selectVendor(activeDetailVendor.category, vid, pid)}
            userName={request.name}
            eventType={request.eventType as EventType}
          />
       )}

       {renderClientOrderDetailModal()}

       {/* Floating Navigation Bar */}
       {step < 4 && (
          <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-40 flex justify-center items-end h-32">
             <button 
               onClick={() => {
                   if (step === 1) {
                       if(validateStep1()) setStep(2);
                   } else if (step === 2) {
                       if(neededServices.length === 0) {
                           setToastMessage("請至少選擇一項服務");
                           return;
                       }
                       setStep(3);
                   } else if (step === 3) {
                       setStep(4);
                   }
               }}
               className="w-full max-w-md py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
             >
               {step === 3 ? '下一步：確認訂單' : '下一步'} <span className="text-xl">→</span>
             </button>
          </div>
       )}
    </div>
  );
};

export default ClientWizard;
