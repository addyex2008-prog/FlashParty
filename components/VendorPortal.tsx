
import React, { useState, useRef } from 'react';
import { MOCK_VENDORS, TAIWAN_LOCATIONS, MOCK_ORDERS, calculateVendorCostBreakdown } from '../services/mockData';
import { Vendor, ServiceCategory, EventType, Order, VendorPackage, PackageItem, LocationFeeRule, SpecialDateRule } from '../types';

interface VendorPortalProps {
  onBack: () => void;
}

// Toast Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-20 right-5 z-[999] animate-fade-in">
    <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 border border-green-500/50">
      <div className="flex items-center gap-3">
        <div className="bg-white text-green-600 rounded-full w-6 h-6 flex shrink-0 items-center justify-center font-bold">✓</div>
        <span className="font-bold tracking-wide text-sm">{message}</span>
      </div>
    </div>
  </div>
);

const CATEGORY_ICONS: Record<ServiceCategory, React.ReactNode> = {
  [ServiceCategory.PLANNER]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  [ServiceCategory.HOST]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m-3-8V5a3 3 0 116 0v6a3 3 0 01-6 0z" /></svg>,
  [ServiceCategory.PHOTOGRAPHER]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  [ServiceCategory.BAND]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  [ServiceCategory.SINGER]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
  [ServiceCategory.DJ]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  [ServiceCategory.MAGICIAN]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.569 2.327l.142.028a2 2 0 002.327-1.569l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-2.327 1.569l-.477 2.387a2 2 0 001.569 2.327l.142.028a2 2 0 002.327-1.569l.477-2.387a2 2 0 00-1.414-1.96" /></svg>,
  [ServiceCategory.LION_DANCE]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [ServiceCategory.BALLOON]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  [ServiceCategory.PT]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  [ServiceCategory.PERFORMER]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [ServiceCategory.ACTOR]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [ServiceCategory.ACROBATICS]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>,
  [ServiceCategory.DANCE]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [ServiceCategory.DYNAMIC_PHOTO]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  [ServiceCategory.STATIC_PHOTO]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  [ServiceCategory.VIDEOGRAPHY]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  [ServiceCategory.DECOR]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
  [ServiceCategory.VENUE_RENTAL]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  [ServiceCategory.CATERING]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  [ServiceCategory.STAGE_HARDWARE]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  [ServiceCategory.CAKE]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-1.5-.454V6.454C3.454 6.151 3.977 6 4.5 6s1.046.151 1.5.454a2.704 2.704 0 013 0 2.703 2.703 0 013 0 2.703 2.703 0 013 0 2.704 2.704 0 011.5-.454v9.092z" /></svg>,
  [ServiceCategory.FLORIST]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  [ServiceCategory.DESIGN_PRINT]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  [ServiceCategory.STAFF]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  [ServiceCategory.OTHER]: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
};

const VENDOR_SERVICE_GROUPS = [
  {
    label: '軟體服務',
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
      ServiceCategory.DANCE, 
      ServiceCategory.DYNAMIC_PHOTO, 
      ServiceCategory.STATIC_PHOTO, 
      ServiceCategory.VIDEOGRAPHY
    ]
  },
  {
    label: '硬體與周邊服務',
    color: 'text-orange-300',
    items: [
      ServiceCategory.DECOR, 
      ServiceCategory.VENUE_RENTAL, 
      ServiceCategory.CATERING, 
      ServiceCategory.STAGE_HARDWARE, 
      ServiceCategory.CAKE, 
      ServiceCategory.FLORIST, 
      ServiceCategory.DESIGN_PRINT, 
      ServiceCategory.STAFF, 
      ServiceCategory.OTHER
    ]
  }
];

type VendorTab = 'SCHEDULE' | 'PACKAGES' | 'ORDERS' | 'PROFILE' | 'FEES';

const VENDOR_TABS: { id: VendorTab; label: string }[] = [
  { id: 'ORDERS', label: '訂單管理' },
  { id: 'PACKAGES', label: '方案管理' },
  { id: 'SCHEDULE', label: '檔期管理' },
  { id: 'FEES', label: '計費設定' },
  { id: 'PROFILE', label: '基本資料' },
];

const VendorPortal: React.FC<VendorPortalProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'CATEGORY_SELECT' | 'LOGIN' | 'DASHBOARD'>('CATEGORY_SELECT');
  const [selectedCats, setSelectedCats] = useState<ServiceCategory[]>([]);
  const [activeTab, setActiveTab] = useState<VendorTab>('ORDERS');
  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  const [dragActive, setDragActive] = useState<{id: string | 'package', active: boolean}>({id: '', active: false});
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // 檔案輸入引用
  const packageImageInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const itemImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 方案管理過濾狀態
  const [pkgEventTypeFilter, setPkgEventTypeFilter] = useState<EventType | ''>('');
  
  // 編輯方案狀態
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<VendorPackage>>({
    name: '',
    price: 0,
    soldCount: 0,
    description: '',
    imageUrls: ['https://picsum.photos/id/1025/800/600'],
    includedItems: [],
    eventTypes: [] // Default empty
  });

  // 檔期管理狀態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null); // For detailed day edit
  const [batchStart, setBatchStart] = useState('09:00');
  const [batchEnd, setBatchEnd] = useState('18:00');
  const [batchDays, setBatchDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // 0=Sun, 1=Mon, ...

  // 計費設定狀態 - 新增規則
  const [newLocationRule, setNewLocationRule] = useState<LocationFeeRule>({ city: '台北市', district: 'all', minSpend: 5000, setupFee: 2000, teardownFee: 2000, deliveryFee: 500 });
  const [newSpecialDate, setNewSpecialDate] = useState<SpecialDateRule>({ date: '', multiplier: 1.2, note: '' });

  const toggleCategory = (cat: ServiceCategory) => {
    setSelectedCats(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat);
      if (prev.length >= 2) return prev;
      return [...prev, cat];
    });
  };

  const handleLogin = (mockVendorId?: string) => {
    const vendor = MOCK_VENDORS.find(v => v.id === (mockVendorId || 'v1'));
    if (vendor) {
      setVendorData(JSON.parse(JSON.stringify(vendor)));
      setCurrentStep('DASHBOARD');
    }
  };

  const handleSave = () => {
      if (!vendorData) return;
      const idx = MOCK_VENDORS.findIndex(v => v.id === vendorData.id);
      if (idx !== -1) {
          MOCK_VENDORS[idx] = vendorData;
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 3000);
      }
  };

  const handleAcceptOrder = () => {
      if(!selectedOrderForDetail || !vendorData) return;
      
      const orderIndex = MOCK_ORDERS.findIndex(o => o.id === selectedOrderForDetail.id);
      if(orderIndex !== -1) {
          const order = MOCK_ORDERS[orderIndex];
          const selectionIndex = order.selections.findIndex(s => s.vendorId === vendorData.id);
          
          if(selectionIndex !== -1) {
              MOCK_ORDERS[orderIndex].selections[selectionIndex].status = 'ACCEPTED';
              // Force re-render of order list logic
              setSelectedOrderForDetail(null);
              alert('已確認承接訂單！');
          }
      }
  };

  const processImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent, id: string | 'package') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({id, active: true});
    } else if (e.type === "dragleave") {
      setDragActive({id: '', active: false});
    }
  };

  const handleDrop = async (e: React.DragEvent, id: string | 'package') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({id: '', active: false});
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const base64 = await processImageUpload(e.dataTransfer.files[0]);
      if (id === 'package') {
        setEditingPackage(prev => ({ ...prev, imageUrls: [base64] }));
      } else {
        updatePackageItem(id, 'imageUrl', base64);
      }
    }
  };

  const handlePackageImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await processImageUpload(e.target.files[0]);
      setEditingPackage(prev => ({ ...prev, imageUrls: [base64] }));
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await processImageUpload(e.target.files[0]);
      setVendorData({ ...vendorData!, imageUrl: base64 });
    }
  };

  const handleItemImageChange = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await processImageUpload(e.target.files[0]);
      updatePackageItem(itemId, 'imageUrl', base64);
    }
  };

  const handleAddPackageItem = () => {
    const newItem: PackageItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      quantity: 1,
      imageUrl: 'https://picsum.photos/id/10/200/200'
    };
    setEditingPackage(prev => ({
      ...prev,
      includedItems: [...(prev.includedItems || []), newItem]
    }));
  };

  const updatePackageItem = (id: string, field: keyof PackageItem, value: any) => {
    setEditingPackage(prev => ({
      ...prev,
      includedItems: prev.includedItems?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePackageItem = (id: string) => {
    setEditingPackage(prev => ({
      ...prev,
      includedItems: prev.includedItems?.filter(item => item.id !== id)
    }));
  };

  const togglePackageEventType = (type: EventType) => {
    setEditingPackage(prev => {
      const current = prev.eventTypes || [];
      if (current.includes(type)) {
        return { ...prev, eventTypes: current.filter(t => t !== type) };
      } else {
        return { ...prev, eventTypes: [...current, type] };
      }
    });
  };

  const savePackage = () => {
    if (!vendorData) return;
    const newPkg: VendorPackage = {
      id: editingPackage.id || Math.random().toString(36).substr(2, 9),
      name: editingPackage.name || '未命名方案',
      price: editingPackage.price || 0,
      soldCount: editingPackage.soldCount || 0,
      description: editingPackage.description || '',
      imageUrls: editingPackage.imageUrls || ['https://picsum.photos/id/1025/800/600'],
      eventTypes: editingPackage.eventTypes || [],
      includedItems: editingPackage.includedItems || []
    };
    const updatedPackages = editingPackage.id 
      ? vendorData.packages.map(p => p.id === editingPackage.id ? newPkg : p)
      : [...vendorData.packages, newPkg];
    setVendorData({ ...vendorData, packages: updatedPackages });
    setIsEditingPackage(false);
  };

  // Fees Tab Helpers
  const addLocationRule = () => {
    if (!vendorData?.decoratorSettings) return;
    const rules = [...vendorData.decoratorSettings.locationFeeRules, newLocationRule];
    setVendorData({ ...vendorData, decoratorSettings: { ...vendorData.decoratorSettings, locationFeeRules: rules } });
  };

  const removeLocationRule = (idx: number) => {
    if (!vendorData?.decoratorSettings) return;
    const rules = vendorData.decoratorSettings.locationFeeRules.filter((_, i) => i !== idx);
    setVendorData({ ...vendorData, decoratorSettings: { ...vendorData.decoratorSettings, locationFeeRules: rules } });
  };

  const addSpecialDateRule = () => {
    if (!vendorData?.decoratorSettings || !newSpecialDate.date) return;
    const rules = [...(vendorData.decoratorSettings.specialDateModifiers || []), newSpecialDate];
    setVendorData({ ...vendorData, decoratorSettings: { ...vendorData.decoratorSettings, specialDateModifiers: rules } });
    setNewSpecialDate({ date: '', multiplier: 1.2, note: '' });
  };
  
  const removeSpecialDateRule = (idx: number) => {
     if (!vendorData?.decoratorSettings) return;
     const rules = vendorData.decoratorSettings.specialDateModifiers.filter((_, i) => i !== idx);
     setVendorData({ ...vendorData, decoratorSettings: { ...vendorData.decoratorSettings, specialDateModifiers: rules } });
  };

  // Schedule Tab Helpers
  const generateHourRange = (start: string, end: string) => {
    const startH = parseInt(start.split(':')[0]);
    const endH = parseInt(end.split(':')[0]);
    const hours = [];
    for (let h = startH; h <= endH; h++) {
        hours.push(`${h}:00`);
    }
    return hours;
  };

  const toggleDayHour = (hour: string) => {
      if (!vendorData || !editingDate) return;
      const currentHours = vendorData.availableHours[editingDate] || [];
      let newHours;
      if (currentHours.includes(hour)) {
          newHours = currentHours.filter(h => h !== hour);
      } else {
          newHours = [...currentHours, hour].sort((a,b) => parseInt(a) - parseInt(b));
      }
      setVendorData({
          ...vendorData,
          availableHours: { ...vendorData.availableHours, [editingDate]: newHours }
      });
  };

  const setDayHours = (hours: string[]) => {
      if (!vendorData || !editingDate) return;
      setVendorData({
          ...vendorData,
          availableHours: { ...vendorData.availableHours, [editingDate]: hours }
      });
  };

  const toggleBatchDay = (day: number) => {
      setBatchDays(prev => 
          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
  };

  const toggleServiceArea = (city: string) => {
      if (!vendorData) return;
      const current = vendorData.serviceAreas || [];
      let nextAreas = [];
      if (current.includes(city)) {
          nextAreas = current.filter(c => c !== city);
      } else {
          nextAreas = [...current, city];
      }
      setVendorData({ ...vendorData, serviceAreas: nextAreas });
  };

  const applyBatchSchedule = (scope: 'MONTH' | 'YEAR') => {
      if (!vendorData) return;
      const newAvailableHours = { ...vendorData.availableHours };
      const hoursToAdd = generateHourRange(batchStart, batchEnd);
      
      let startDate: Date;
      let endDate: Date;

      if (scope === 'MONTH') {
          // Set to 1st of the displayed month
          startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          // Set to last day of the displayed month
          endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      } else {
          // Set to today for YEAR scope
          startDate = new Date();
          endDate = new Date();
          endDate.setFullYear(startDate.getFullYear() + 1);
      }

      let loopDate = new Date(startDate);
      let appliedCount = 0;

      while (loopDate <= endDate) {
          if (batchDays.includes(loopDate.getDay())) {
              const y = loopDate.getFullYear();
              const m = String(loopDate.getMonth() + 1).padStart(2, '0');
              const d = String(loopDate.getDate()).padStart(2, '0');
              const dateStr = `${y}-${m}-${d}`;
              
              newAvailableHours[dateStr] = hoursToAdd;
              appliedCount++;
          }
          loopDate.setDate(loopDate.getDate() + 1);
      }

      setVendorData({ ...vendorData, availableHours: newAvailableHours });
      alert(`已成功套用標準時段 (${batchStart}-${batchEnd}) 至${scope === 'MONTH' ? '本月' : '未來一年'}！共更新了 ${appliedCount} 天`);
  };

  const renderCategorySelect = () => (
    <div className="max-w-4xl mx-auto pt-20 px-6 animate-fade-in relative z-10 pb-48">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">我是供應商夥伴</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">請選擇您的服務類別以進行登入或註冊</p>
      </div>
      <div className="space-y-12">
        {VENDOR_SERVICE_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className={`text-sm md:text-base font-black ${group.color} uppercase tracking-widest ml-2`}>{group.label}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.items.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`p-4 md:p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${
                    selectedCats.includes(cat)
                      ? 'border-primary bg-primary/20 text-white shadow-[0_0_20px_rgba(244,96,17,0.3)]'
                      : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  <div className={`transition-colors ${selectedCats.includes(cat) ? 'text-white' : 'text-slate-600 group-hover:text-primary'}`}>
                    {CATEGORY_ICONS[cat] || <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>}
                  </div>
                  <span className="font-black text-[10px] md:text-sm tracking-widest uppercase text-center">
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => setCurrentStep('LOGIN')}
          disabled={selectedCats.length === 0}
          className="px-8 py-4 rounded-full bg-primary text-white font-black text-sm md:text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
        >
          下一步：進入登入頁面
        </button>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="max-w-md mx-auto pt-32 px-6 animate-fade-in text-center relative z-10 pb-48">
      <div className="glass-card p-8 md:p-12 rounded-[48px] border border-white/10 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-8 tracking-tight">合作夥伴登入</h2>
        <div className="space-y-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">請選擇一個測試帳號登入系統</p>
          {MOCK_VENDORS.filter(v => selectedCats.includes(v.category)).map(vendor => (
            <button
              key={vendor.id}
              onClick={() => handleLogin(vendor.id)}
              className="w-full p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:border-primary/50 transition-all group"
            >
              <img src={vendor.imageUrl} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover" />
              <div className="text-left">
                <div className="text-white font-black text-base md:text-lg group-hover:text-primary transition-colors">{vendor.name}</div>
                <div className="text-slate-600 text-xs font-bold uppercase">{vendor.category}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => handleLogin('v10')}
            className="w-full py-6 mt-4 rounded-2xl border border-white/10 text-slate-500 text-sm md:text-base font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
          >
            進入測試 (迪爾氣球佈置)
          </button>
        </div>
      </div>
      <button 
        onClick={() => setCurrentStep('CATEGORY_SELECT')}
        className="mt-10 text-slate-600 hover:text-white text-xs md:text-sm font-black uppercase tracking-widest transition-colors"
      >
        ← 返回重新選擇類別
      </button>
    </div>
  );

  const renderOrderDetailModal = () => {
      if(!selectedOrderForDetail || !vendorData) return null;
      const selection = selectedOrderForDetail.selections.find(s => s.vendorId === vendorData.id);
      const pkg = vendorData.packages.find(p => p.id === selection?.packageId);
      const breakdown = calculateVendorCostBreakdown(vendorData, selectedOrderForDetail.userRequest, selectedOrderForDetail.durationHours, selection?.packageId, selection?.options);

      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrderForDetail(null)}></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 w-full max-w-lg shadow-[0_0_80px_rgba(244,96,17,0.3)] animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h4 className="text-xl font-black text-white flex items-center">
                        <span className="w-1.5 h-6 bg-primary mr-3 rounded-full"></span>
                        訂單詳細內容確認
                    </h4>
                    <button onClick={() => setSelectedOrderForDetail(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                <div className="space-y-6 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold block mb-1">客戶資料</span>
                        <div className="text-white font-bold text-lg">{selectedOrderForDetail.userRequest.name}</div>
                        <div className="text-primary font-bold">{selectedOrderForDetail.userRequest.phone}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 font-bold block mb-1">活動資訊</span>
                        <div className="text-white font-bold">{selectedOrderForDetail.userRequest.date} ({selectedOrderForDetail.userRequest.startTime} - {selectedOrderForDetail.userRequest.endTime})</div>
                        <div className="text-slate-400 text-sm mt-1">{selectedOrderForDetail.userRequest.city}{selectedOrderForDetail.userRequest.district} {selectedOrderForDetail.userRequest.venueName}</div>
                        <div className="text-slate-500 text-xs mt-1">{selectedOrderForDetail.userRequest.address}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-primary/20">
                        <span className="text-xs text-slate-500 font-bold block mb-1">您的服務項目</span>
                        <div className="text-white font-bold text-lg">{pkg?.name || '基本服務'}</div>
                        {selection?.options?.deliveryMethod && <div className="text-primary text-sm font-bold mt-1">方式: {selection.options.deliveryMethod === 'setup' ? '專人佈置' : (selection.options.deliveryMethod === 'delivery' ? '外送' : '自取')}</div>}
                        {selection?.options?.pickupTime && <div className="text-slate-400 text-sm font-bold">預計時間: {selection.options.pickupTime}</div>}
                        
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                            {breakdown.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-white font-bold">${item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-lg font-black text-primary pt-2 border-t border-white/10 mt-2">
                                <span>總計</span>
                                <span>${breakdown.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setSelectedOrderForDetail(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all">再考慮</button>
                    <button onClick={handleAcceptOrder} className="flex-1 py-4 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-[#d9520e] transition-all">確認承接</button>
                </div>
            </div>
        </div>
      );
  };

  const renderPackageEditor = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h3 className="text-2xl font-black text-white">{editingPackage.id ? '編輯方案' : '新增方案'}</h3>
            <button onClick={() => setIsEditingPackage(false)} className="text-slate-500 hover:text-white font-bold">✕ 取消</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                 {/* Basic Info */}
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">方案名稱</label>
                     <input 
                        type="text" 
                        value={editingPackage.name} 
                        onChange={e => setEditingPackage({...editingPackage, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none font-bold"
                     />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">價格</label>
                         <input 
                            type="number" 
                            value={editingPackage.price} 
                            onChange={e => setEditingPackage({...editingPackage, price: Number(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none font-bold"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">已售出數量 (系統自動計算)</label>
                         <input 
                            type="number" 
                            value={editingPackage.soldCount} 
                            disabled
                            className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-400 font-bold cursor-not-allowed"
                         />
                     </div>
                     {/* Event Types */}
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">適用活動類型</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(EventType).map(type => (
                                <button
                                    key={type}
                                    onClick={() => togglePackageEventType(type)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        editingPackage.eventTypes?.includes(type) 
                                        ? 'bg-primary text-white border-primary' 
                                        : 'bg-transparent text-slate-500 border-white/10 hover:border-white/30'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">方案描述</label>
                     <textarea 
                        value={editingPackage.description} 
                        onChange={e => setEditingPackage({...editingPackage, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none h-32"
                     />
                 </div>
            </div>

            <div className="space-y-6">
                {/* Images */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">方案封面圖</label>
                    <div 
                        className={`aspect-video rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden group cursor-pointer ${dragActive.id === 'package' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}
                        onDragEnter={(e) => handleDrag(e, 'package')}
                        onDragLeave={(e) => handleDrag(e, 'package')}
                        onDragOver={(e) => handleDrag(e, 'package')}
                        onDrop={(e) => handleDrop(e, 'package')}
                        onClick={() => packageImageInputRef.current?.click()}
                    >
                        {editingPackage.imageUrls && editingPackage.imageUrls[0] ? (
                            <img src={editingPackage.imageUrls[0]} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-500 font-bold">點擊或拖曳上傳圖片</span>
                        )}
                        <input type="file" ref={packageImageInputRef} onChange={handlePackageImageChange} className="hidden" accept="image/*" />
                    </div>
                </div>

                {/* Included Items */}
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">包含項目</label>
                        <button onClick={handleAddPackageItem} className="text-[10px] bg-white/10 px-3 py-1 rounded text-white hover:bg-primary transition-colors font-bold">+ 新增項目</button>
                     </div>
                     <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {editingPackage.includedItems?.map((item, idx) => (
                             <div key={item.id} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                 <div 
                                    className="w-12 h-12 rounded-lg bg-black shrink-0 overflow-hidden relative group cursor-pointer"
                                    onClick={() => itemImageInputRefs.current[item.id]?.click()}
                                 >
                                     <img src={item.imageUrl} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <span className="text-[8px] text-white">更換</span>
                                     </div>
                                     <input 
                                        type="file" 
                                        ref={(el) => { itemImageInputRefs.current[item.id] = el; }}
                                        onChange={(e) => handleItemImageChange(e, item.id)}
                                        className="hidden" 
                                        accept="image/*"
                                     />
                                 </div>
                                 <div className="flex-1 space-y-2">
                                     <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={(e) => updatePackageItem(item.id, 'name', e.target.value)}
                                        placeholder="項目名稱"
                                        className="w-full bg-transparent border-b border-white/10 text-sm text-white focus:border-primary outline-none pb-1"
                                     />
                                     <div className="flex items-center gap-2">
                                         <span className="text-[10px] text-slate-500">數量</span>
                                         <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => updatePackageItem(item.id, 'quantity', parseInt(e.target.value))}
                                            className="w-16 bg-transparent border-b border-white/10 text-sm text-white focus:border-primary outline-none text-center pb-1"
                                         />
                                     </div>
                                 </div>
                                 <button onClick={() => removePackageItem(item.id)} className="text-slate-500 hover:text-red-500">✕</button>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex justify-end gap-4">
            <button onClick={() => setIsEditingPackage(false)} className="px-8 py-3 rounded-xl border border-white/10 text-slate-400 font-bold hover:text-white transition-all">取消</button>
            <button onClick={savePackage} className="px-8 py-3 rounded-xl bg-primary text-white font-black shadow-lg hover:shadow-primary/30 transition-all">儲存方案</button>
        </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
            {/* Batch Settings */}
            <div className="md:w-1/3 space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-lg font-black text-white mb-6 flex items-center">
                        <span className="w-1.5 h-6 bg-primary mr-3 rounded-full"></span>
                        批次設定檔期
                    </h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">每日可接單時段</label>
                            <div className="flex gap-4 items-center">
                                <input type="time" value={batchStart} onChange={(e) => setBatchStart(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary flex-1" />
                                <span className="text-slate-500">to</span>
                                <input type="time" value={batchEnd} onChange={(e) => setBatchEnd(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary flex-1" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">套用星期</label>
                            <div className="flex justify-between">
                                {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => toggleBatchDay(i)}
                                        className={`w-8 h-8 rounded-full text-xs font-black transition-all ${batchDays.includes(i) ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button onClick={() => applyBatchSchedule('MONTH')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
                                套用到本月
                            </button>
                            <button onClick={() => applyBatchSchedule('YEAR')} className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
                                套用到未來一年
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-lg font-black text-white mb-6 flex items-center">
                        <span className="w-1.5 h-6 bg-green-500 mr-3 rounded-full"></span>
                        服務縣市設定
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {Object.keys(TAIWAN_LOCATIONS).map(city => (
                            <button 
                                key={city}
                                onClick={() => toggleServiceArea(city)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${vendorData?.serviceAreas.includes(city) ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Preview */}
            <div className="flex-1 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-black text-white">{currentMonth.getFullYear()}年 {currentMonth.getMonth()+1}月</h4>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white">←</button>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white">→</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                        <div key={d} className="text-center text-slate-500 text-xs font-bold py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()}).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0).getDate()}).map((_, i) => {
                        const d = i + 1;
                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const hours = vendorData?.availableHours[dateStr] || [];
                        const isFullDay = hours.length >= 8;
                        const isPartial = hours.length > 0 && hours.length < 8;
                        
                        return (
                            <div 
                                key={d} 
                                onClick={() => setEditingDate(dateStr)}
                                className={`aspect-square rounded-xl border border-white/5 p-1 cursor-pointer hover:border-primary/50 transition-all flex flex-col justify-between ${editingDate === dateStr ? 'ring-2 ring-primary bg-primary/20' : 'bg-black/20'}`}
                            >
                                <span className="text-xs font-bold text-slate-400 ml-1">{d}</span>
                                <div className="flex justify-end pr-1 pb-1">
                                    {isFullDay && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    {isPartial && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                    {!isFullDay && !isPartial && <div className="w-2 h-2 rounded-full bg-red-500/30"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Day Detail Modal/Panel */}
        {editingDate && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setEditingDate(null)}></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black text-white">{editingDate} 檔期設定</h4>
                        <button onClick={() => setEditingDate(null)} className="text-slate-500 hover:text-white">✕</button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {Array.from({length: 24}).map((_, i) => {
                            const h = `${i}:00`;
                            const isSelected = vendorData?.availableHours[editingDate]?.includes(h);
                            return (
                                <button 
                                    key={i}
                                    onClick={() => toggleDayHour(h)}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    {h}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={() => setDayHours([])} className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500/20">
                            全天休假
                        </button>
                        <button onClick={() => setDayHours(generateHourRange('09:00', '21:00'))} className="flex-1 py-3 bg-green-500/10 text-green-500 rounded-xl font-bold uppercase tracking-widest hover:bg-green-500/20">
                            全天開放
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderFeesTab = () => {
    if (!vendorData) return null;
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <h4 className="text-xl font-black text-white mb-8 flex items-center">
                     <span className="w-2 h-8 bg-[#f46011] mr-4 rounded-full"></span>
                     {vendorData.category === ServiceCategory.DECOR ? '場地佈置計費規則' : '基本計費規則'}
                </h4>

                {vendorData.category === ServiceCategory.DECOR && vendorData.decoratorSettings && (
                    <div className="space-y-10">
                        {/* Location Fees */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-sm font-bold text-slate-400 uppercase tracking-widest">地區車馬費與低消</h5>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs text-slate-500 uppercase">
                                            <th className="py-3 px-4">縣市</th>
                                            <th className="py-3 px-4">區域</th>
                                            <th className="py-3 px-4">低消</th>
                                            <th className="py-3 px-4">佈置費</th>
                                            <th className="py-3 px-4">撤場費</th>
                                            <th className="py-3 px-4">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {vendorData.decoratorSettings.locationFeeRules.map((rule, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-white font-bold">{rule.city}</td>
                                                <td className="py-3 px-4 text-slate-300">{rule.district === 'all' ? '全區' : rule.district}</td>
                                                <td className="py-3 px-4 text-slate-300">${rule.minSpend}</td>
                                                <td className="py-3 px-4 text-slate-300">${rule.setupFee}</td>
                                                <td className="py-3 px-4 text-slate-300">${rule.teardownFee}</td>
                                                <td className="py-3 px-4">
                                                    <button onClick={() => removeLocationRule(idx)} className="text-red-500 hover:text-white">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Add New Row */}
                                        <tr className="bg-white/5">
                                            <td className="p-2">
                                                <select 
                                                    value={newLocationRule.city}
                                                    onChange={e => setNewLocationRule({...newLocationRule, city: e.target.value})}
                                                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white w-full"
                                                >
                                                    {Object.keys(TAIWAN_LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input type="text" disabled value="all" className="bg-transparent text-slate-500 w-full text-center" />
                                            </td>
                                            <td className="p-2"><input type="number" value={newLocationRule.minSpend} onChange={e => setNewLocationRule({...newLocationRule, minSpend: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white w-20" /></td>
                                            <td className="p-2"><input type="number" value={newLocationRule.setupFee} onChange={e => setNewLocationRule({...newLocationRule, setupFee: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white w-20" /></td>
                                            <td className="p-2"><input type="number" value={newLocationRule.teardownFee} onChange={e => setNewLocationRule({...newLocationRule, teardownFee: parseInt(e.target.value)})} className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white w-20" /></td>
                                            <td className="p-2"><button onClick={addLocationRule} className="text-green-500 font-bold hover:text-white">＋</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Special Dates */}
                        <div>
                             <h5 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">特殊節日加成</h5>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                     {vendorData.decoratorSettings.specialDateModifiers?.map((rule, idx) => (
                                         <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                             <div>
                                                 <span className="text-primary font-bold mr-2">每年 {rule.date.slice(5)}</span>
                                                 <span className="text-white text-sm">{rule.note}</span>
                                             </div>
                                             <div className="flex items-center gap-4">
                                                 <span className="text-slate-300 font-bold">x{rule.multiplier}</span>
                                                 <button onClick={() => removeSpecialDateRule(idx)} className="text-slate-600 hover:text-red-500">✕</button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                                     <div className="flex gap-2">
                                        <input type="date" value={newSpecialDate.date} onChange={e => setNewSpecialDate({...newSpecialDate, date: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white flex-1" />
                                        <input type="number" step="0.1" value={newSpecialDate.multiplier} onChange={e => setNewSpecialDate({...newSpecialDate, multiplier: parseFloat(e.target.value)})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white w-20" placeholder="倍率" />
                                     </div>
                                     <div className="flex gap-2">
                                        <input type="text" value={newSpecialDate.note} onChange={e => setNewSpecialDate({...newSpecialDate, note: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white flex-1" placeholder="節日備註 (例: 情人節)" />
                                        <button onClick={addSpecialDateRule} className="bg-primary text-white px-4 rounded font-bold">新增</button>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Other Fees */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">無電梯上樓費 (每層)</label>
                                 <input 
                                    type="number" 
                                    value={vendorData.decoratorSettings.upstairsFee} 
                                    onChange={e => setVendorData({...vendorData!, decoratorSettings: {...vendorData!.decoratorSettings!, upstairsFee: parseInt(e.target.value)}})}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">急件處理費 (48h內)</label>
                                 <input 
                                    type="number" 
                                    value={vendorData.decoratorSettings.urgentOrderFee} 
                                    onChange={e => setVendorData({...vendorData!, decoratorSettings: {...vendorData!.decoratorSettings!, urgentOrderFee: parseInt(e.target.value)}})}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold"
                                 />
                             </div>
                             <div className="flex items-end pb-3">
                                 <label className="flex items-center gap-3 cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        checked={vendorData.decoratorSettings.urgentOrderEnabled} 
                                        onChange={e => setVendorData({...vendorData!, decoratorSettings: {...vendorData!.decoratorSettings!, urgentOrderEnabled: e.target.checked}})}
                                        className="w-5 h-5 accent-primary"
                                     />
                                     <span className="text-white font-bold">啟用急件接單功能</span>
                                 </label>
                             </div>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
  };

  const renderProfileTab = () => {
    if (!vendorData) return null;
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-white/5 p-8 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">品牌/服務名稱</label>
                         <input 
                            type="text" 
                            value={vendorData.name} 
                            onChange={e => setVendorData({...vendorData!, name: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-primary outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">服務類別</label>
                         <input type="text" disabled value={vendorData.category} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-slate-500 font-bold" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">品牌簡介</label>
                         <textarea 
                            value={vendorData.description} 
                            onChange={e => setVendorData({...vendorData!, description: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none h-40"
                         />
                     </div>
                 </div>
                 <div className="space-y-6">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">官方網站 / 社群連結</label>
                         <input 
                            type="text" 
                            value={vendorData.websiteUrl || ''} 
                            onChange={e => setVendorData({...vendorData!, websiteUrl: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-primary outline-none"
                            placeholder="https://..."
                         />
                     </div>
                     
                     {/* Portfolio Images Manager (Simplified) */}
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">作品集圖片 ({vendorData.portfolio.length})</label>
                         <div className="grid grid-cols-3 gap-2">
                             {vendorData.portfolio.map((img, idx) => (
                                 <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                                     <img src={img} className="w-full h-full object-cover" />
                                     <button 
                                        onClick={() => {
                                            const newPortfolio = vendorData!.portfolio.filter((_, i) => i !== idx);
                                            setVendorData({...vendorData!, portfolio: newPortfolio});
                                        }}
                                        className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                                     >
                                         移除
                                     </button>
                                 </div>
                             ))}
                             <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all">
                                 + 上傳
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto pt-20 px-6 animate-fade-in relative z-10 pb-48">
      {showSaveToast && <Toast message="已儲存變更" onClose={() => setShowSaveToast(false)} />}
      {selectedOrderForDetail && renderOrderDetailModal()}
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 glass-card p-10 rounded-[56px] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-8 w-full md:w-auto">
           <div className="relative group w-24 h-24 shrink-0">
               <div 
                   onClick={() => profileImageInputRef.current?.click()}
                   className="w-full h-full rounded-3xl overflow-hidden border-2 border-primary cursor-pointer shadow-2xl relative"
               >
                   <img src={vendorData!.imageUrl} className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest text-center leading-tight">更換<br/>照片</span>
                   </div>
               </div>
               <input type="file" ref={profileImageInputRef} onChange={handleProfileImageChange} accept="image/*" className="hidden" />
           </div>
           
           <div className="flex-1">
             <input 
               type="text" 
               value={vendorData!.name} 
               onChange={(e) => setVendorData({ ...vendorData!, name: e.target.value })}
               className="text-3xl font-black text-white mb-1 bg-transparent border-b border-transparent hover:border-white/30 focus:border-primary outline-none w-full transition-all"
             />
             
             <div className="flex items-center gap-4 mt-2">
               <div className="relative group">
                   <select
                       value={vendorData!.category}
                       onChange={(e) => setVendorData({ ...vendorData!, category: e.target.value as ServiceCategory })}
                       className="appearance-none bg-transparent border-b border-primary/30 text-[10px] font-black text-primary uppercase tracking-widest outline-none focus:border-primary py-1 pr-6 cursor-pointer hover:border-primary transition-colors"
                   >
                       {Object.values(ServiceCategory).map((cat) => (
                           <option key={cat} value={cat} className="bg-zinc-900 text-white font-bold">
                               {cat}
                           </option>
                       ))}
                   </select>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary">▼</div>
               </div>
               
               <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
               
               <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">營運中</span>
               </div>
             </div>
           </div>
        </div>
        
        <div className="flex gap-4">
             <button 
                 onClick={handleSave}
                 className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-[#d9520e] transition-all"
             >
                 儲存變更
             </button>
             <button 
                 onClick={() => { setVendorData(null); setCurrentStep('LOGIN'); }}
                 className="px-8 py-4 border border-white/10 text-slate-500 hover:text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
             >
                 登出
             </button>
        </div>
      </div>

      <div className="flex space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
        {VENDOR_TABS.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 md:px-8 py-4 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black shadow-xl scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      <div className="min-h-[500px]">
          {activeTab === 'ORDERS' && (
              <div className="space-y-6 animate-fade-in">
                  {MOCK_ORDERS.filter(o => o.selections.some(s => s.vendorId === vendorData!.id)).length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
                          <p className="text-slate-500 font-bold">目前沒有訂單</p>
                      </div>
                  ) : (
                      MOCK_ORDERS.filter(o => o.selections.some(s => s.vendorId === vendorData!.id)).map(order => {
                          const selection = order.selections.find(s => s.vendorId === vendorData!.id);
                          return (
                              <div key={order.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex justify-between items-center group">
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${selection?.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                              {selection?.status === 'ACCEPTED' ? '已接單' : '待確認'}
                                          </span>
                                          <span className="text-slate-500 text-xs font-bold">{order.id}</span>
                                          <span className="text-slate-500 text-xs font-bold">• {order.createdAt.split('T')[0]}</span>
                                      </div>
                                      <div className="text-white font-bold text-lg">{order.userRequest.name} - {order.userRequest.eventType}</div>
                                      <div className="text-slate-400 text-sm mt-1">{order.userRequest.date} ({order.userRequest.startTime}-{order.userRequest.endTime}) @ {order.userRequest.city}</div>
                                  </div>
                                  <button 
                                      onClick={() => setSelectedOrderForDetail(order)}
                                      className="px-6 py-3 bg-white/5 group-hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                  >
                                      查看詳情
                                  </button>
                              </div>
                          );
                      })
                  )}
              </div>
          )}

          {activeTab === 'PACKAGES' && (
              <div className="animate-fade-in">
                  {isEditingPackage ? (
                      renderPackageEditor()
                  ) : (
                      <div className="space-y-8">
                          <div className="flex justify-between items-center">
                              <h3 className="text-xl font-black text-white">方案列表</h3>
                              <button 
                                  onClick={() => {
                                      setEditingPackage({
                                          name: '',
                                          price: 0,
                                          soldCount: 0,
                                          description: '',
                                          imageUrls: ['https://picsum.photos/id/1025/800/600'],
                                          includedItems: [],
                                          eventTypes: []
                                      });
                                      setIsEditingPackage(true);
                                  }}
                                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d9520e]"
                              >
                                  + 新增方案
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {vendorData!.packages.map(pkg => (
                                  <div key={pkg.id} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden group hover:border-white/20 transition-all">
                                      <div className="h-48 overflow-hidden relative">
                                          <img src={pkg.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-xs text-white font-bold backdrop-blur-md">
                                              ${pkg.price.toLocaleString()}
                                          </div>
                                      </div>
                                      <div className="p-6">
                                          <div className="flex justify-between items-start mb-4">
                                              <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                                              <span className="text-xs text-slate-500 font-bold">售出 {pkg.soldCount || 0}</span>
                                          </div>
                                          <p className="text-slate-400 text-sm line-clamp-2 mb-6">{pkg.description}</p>
                                          <button 
                                              onClick={() => {
                                                  setEditingPackage(pkg);
                                                  setIsEditingPackage(true);
                                              }}
                                              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                          >
                                              編輯方案
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'SCHEDULE' && renderScheduleTab()}
          
          {activeTab === 'FEES' && renderFeesTab()}
          
          {activeTab === 'PROFILE' && renderProfileTab()}
      </div>
    </div>
  );

  if (currentStep === 'CATEGORY_SELECT') return renderCategorySelect();
  if (currentStep === 'LOGIN') return renderLogin();
  
  return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-white pb-20">
          <button 
              onClick={onBack} 
              className="fixed bottom-10 left-10 text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 z-50 bg-black/50 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md hover:border-white/20"
          >
              <span>←</span> 回首頁
          </button>
          
          {renderDashboard()}
      </div>
  );
};

export default VendorPortal;
