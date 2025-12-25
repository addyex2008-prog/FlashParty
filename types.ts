
export enum ServiceCategory {
  VENUE_RENTAL = '場地租借',
  CAKE = '客製化蛋糕',
  CATERING = '餐點外燴',
  HOST = '主持人',
  PHOTOGRAPHER = '攝影師',
  PERFORMER = '表演者',
  STAFF = '服務人員',
  DECOR = '場地佈置',
  STAGE_HARDWARE = '舞台/音響/燈光',
  FLORIST = '花藝',
  DESIGN_PRINT = '設計/背板輸出',
  LION_DANCE = '舞龍舞獅',
  OTHER = '其他周邊',
  ACTOR = '演員',
  BAND = '樂團',
  BALLOON = '互動折氣球',
  DJ = 'DJ',
  SINGER = '歌手',
  ACROBATICS = '雜技',
  DANCE = '舞蹈',
  DYNAMIC_PHOTO = '動態攝影',
  STATIC_PHOTO = '靜態攝影',
  VIDEOGRAPHY = '影片製做',
  PLANNER = '活動統籌師',
  PT = 'PT人員',
  MAGICIAN = '魔術師'
}

export enum EventType {
  BIRTHDAY = '慶生/周歲',
  GENDER_REVEAL = '性別揭曉',
  PROPOSAL = '求婚',
  WEDDING = '婚禮',
  TRUNK_DECOR = '後車廂佈置',
  OPENING = '開幕',
  ANNIVERSARY = '周年慶',
  YEAR_END_PARTY = '尾牙',
  SPRING_WINE = '春酒',
  CELEBRATION = '慶功宴',
  CAR_DELIVERY = '交車儀式',
  GRADUATION = '畢業典禮',
  SCHOOL_ANNIVERSARY = '校慶',
  VALENTINES = '情人節',
  MOTHERS_DAY = '母親節',
  FATHERS_DAY = '父親節',
  HALLOWEEN = '萬聖節',
  CHRISTMAS = '聖誕節',
  RETIREMENT = '退休會',
  OFFICE_WARMING = '辦公室喬遷',
  PRESS_CONFERENCE = '記者會'
}

export enum DevRank {
  BRONZE = '銅',
  SILVER = '銀',
  GOLD = '金',
  DIAMOND = '鑽石',
  METEORITE = '隕石',
  COSMIC_GEM = '宇宙寶石'
}

export interface DevelopedVendorInfo {
  vendorId: string;
  joinDate: string;
}

export interface DeveloperPartner {
  id: string;
  account: string;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  avatarUrl: string;
  rank: DevRank;
  referralCode: string;
  performance: {
    totalVendors: number;
    monthlyVendors: number;
    nextRankThreshold: number;
    monthlyMatchBonus: number;
    monthlyDevBonus: number;
    monthlyReferralBonus: number;
  };
  developedVendors: DevelopedVendorInfo[]; 
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface PackageItem {
  id: string;
  name: string;
  quantity: number;
  imageUrl: string;
}

export interface VendorPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  soldCount?: number;
  imageUrls: string[];
  videoUrl?: string;
  eventTypes?: EventType[];
  includedItems?: PackageItem[];
}

export interface LocationFeeRule {
    city: string;
    district: string;
    minSpend: number; // 低消
    setupFee: number; // 佈置費
    teardownFee: number; // 撤場費
    deliveryFee: number; // 外送費
}

export interface SpecialDateRule {
    date: string; // YYYY-MM-DD
    multiplier: number; // e.g. 1.2 for 20% surcharge
    note?: string;
}

export interface DecoratorSettings {
  locationFeeRules: LocationFeeRule[]; 
  upstairsFee: number;
  urgentOrderFee: number;
  urgentOrderEnabled: boolean;
  hourlySurcharges: Record<number, number>; // Hour (0-23) -> Extra Fee
  specialDateModifiers: SpecialDateRule[];
}

export interface HostSettings {
  baseDuration: number;
  overtimeRate: number;
  eventTypeAddons: Record<string, number>;
}

export interface Vendor {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  imageUrl: string;
  portfolio: string[];
  portfolioVideos?: string[];
  websiteUrl?: string;
  rate: number;
  rateType: 'hourly' | 'fixed' | 'package'; 
  overtimeRate?: number;
  travelFees: Record<string, number>;
  packages: VendorPackage[];
  decoratorSettings?: DecoratorSettings;
  hostSettings?: HostSettings;
  serviceAreas: string[];
  availableHours: Record<string, string[]>; 
  isPaused: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface UserRequest {
  name: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  isLocationUndecided: boolean;
  city: string;
  district: string;
  venueName: string;
  address: string;
  eventType: EventType | '';
}

export interface SelectedService {
  category: ServiceCategory;
  vendorId: string | null;
  packageId?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'; 
  options?: {
    // General
    duration?: number;
    serviceStartTime?: string;
    serviceEndTime?: string;
    
    // Decorator Specific
    deliveryMethod?: 'pickup' | 'delivery' | 'setup';
    pickupTime?: string; // HH:mm
    needTeardown?: boolean;
    needUpstairs?: boolean;
    
    // Setup logic
    setupStartTime?: string;
    setupEndTime?: string;
    floor?: string;
  };
}

export interface Discount {
  code: string;
  multiplier: number; // e.g. 0.8 for 20% off
  expiry: string;
  used: boolean;
}

export interface BookingSummary {
  userRequest: UserRequest;
  selections: SelectedService[];
  totalCost: number;
  discountApplied?: number;
  discountCode?: string;
  durationHours: number;
}

export interface Order extends BookingSummary {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  aiPlan?: string;
}
