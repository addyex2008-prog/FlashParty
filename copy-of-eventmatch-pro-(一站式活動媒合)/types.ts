
export enum ServiceCategory {
  VENUE_RENTAL = '場地租借',
  CAKE = '客製化蛋糕',
  CATERING = '餐點外燴',
  HOST = '主持人',
  PHOTOGRAPHER = '攝影師',
  PERFORMER = '表演者',
  STAFF = '服務人員',
  DECOR = '場地佈置',
  // Merged Category: Lighting + Audio + Truss
  STAGE_HARDWARE = '舞台/音響/燈光',
  FLORIST = '花藝',
  // Merged Category: Print + Backdrop
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
  PT = '鐘點PT人員'
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

export interface Review {
  id: string;
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  images?: string[]; // Optional images for review
}

// --- New Interfaces for Complex Pricing ---

export interface VendorPackage {
  id: string;
  name: string; // e.g. "Birthday Plan A"
  description: string;
  price: number;
  imageUrls: string[];
  videoUrl?: string;
  eventTypes?: EventType[];
}

export interface LocationFeeRule {
    city: string;
    district: string; // 'all' or specific district name
    setupFee: number;
    teardownFee: number;
    deliveryFee: number; // New: Delivery fee per location
}

export interface DecoratorSettings {
  locationFeeRules: LocationFeeRule[]; 
  upstairsFee: number; // New: Surcharge for floors other than 1F
  
  // Time Surcharges
  hourlySurcharges: Record<number, number>; // Key: 0-23, Value: Fee
  
  // Holiday Surcharges
  holidaySurchargePercent: number; // e.g. 10 for 10%
  holidays: string[]; // "MM-DD" format (Solar)
  lunarHolidays: string[]; // Enum keys: 'CNY', 'CNY_EVE', 'CHINESE_VALENTINES'
  
  urgentOrderEnabled: boolean; // 20% surcharge cap 1500
}

export interface HostSettings {
  baseDuration: number; // e.g. 4 hours
  overtimeRate: number; // Fee per hour after baseDuration
  eventTypeAddons: Record<string, number>; // Key: EventType, Value: Surcharge amount
}

export interface Vendor {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  imageUrl: string; // Avatar
  portfolio: string[]; // List of image URLs
  portfolioVideos?: string[]; // List of video URLs
  websiteUrl?: string;
  
  // Pricing
  rate: number; // Base rate (Hourly for Band, Fixed for Venue, Session for Host if hostSettings exist)
  rateType: 'hourly' | 'fixed' | 'package'; 
  overtimeRate?: number;
  
  // For Host/Photographer/Band: Travel Fees by location
  travelFees: Record<string, number>; // Key: City, Value: Add-on Cost

  // For Decorators: Packages and Complex Rules
  packages: VendorPackage[];
  decoratorSettings?: DecoratorSettings;
  
  // For Hosts: Specific Pricing Rules
  hostSettings?: HostSettings;
  
  // Locations
  serviceAreas: string[]; // List of Cities (e.g., "台北市", "台中市")

  // Availability: Key = "YYYY-MM-DD", Value = array of hour strings "14:00"
  availableHours: Record<string, string[]>; 
  
  // Status
  isPaused: boolean; // Global pause for availability

  // Ratings
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface UserRequest {
  name: string;
  phone: string;
  
  // Date & Time
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  
  // Location Breakdown
  isLocationUndecided: boolean; // New: "Recommendation" mode
  city: string;
  district: string;
  address: string; // Added: Specific address
  
  // Type
  eventType: EventType | '';
}

export interface SelectedService {
  category: ServiceCategory;
  vendorId: string | null;
  packageId?: string; // If selected a package
  options?: {
    needSetup?: boolean; // Deprecated in favor of deliveryMethod but kept for compatibility
    needTeardown?: boolean;
    setupStartTime?: string;
    setupEndTime?: string;
    duration?: number; // Override duration
    serviceStartTime?: string;
    serviceEndTime?: string;
    floor?: string; // e.g. "1F", "2F", "B1"
    deliveryMethod?: 'pickup' | 'delivery' | 'setup'; // New: Mutually exclusive modes
  };
}

export interface BookingSummary {
  userRequest: UserRequest;
  selections: SelectedService[];
  totalCost: number;
  durationHours: number;
}
