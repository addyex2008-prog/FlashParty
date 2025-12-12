
import { Vendor, ServiceCategory, EventType, Review, UserRequest } from '../types';

// Helper to generate a future date string
const getFutureDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

// --- Geographic Data ---
export const TAIWAN_LOCATIONS: Record<string, string[]> = {
  '台北市': ['信義區', '大安區', '中山區', '松山區', '中正區', '內湖區', '南港區', '士林區', '北投區', '文山區', '萬華區', '大同區'],
  '新北市': ['板橋區', '新莊區', '中和區', '永和區', '三重區', '蘆洲區', '新店區', '淡水區', '林口區', '汐止區', '土城區', '樹林區', '鶯歌區', '三峽區', '五股區', '泰山區', '八里區', '深坑區', '瑞芳區', '萬里區', '金山區'],
  '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
  '桃園市': ['桃園區', '中壢區', '平鎮區', '八德區', '龜山區', '蘆竹區', '楊梅區', '龍潭區', '大溪區', '大園區', '觀音區', '新屋區'],
  '新竹市': ['東區', '北區', '香山區'],
  '新竹縣': ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉'],
  '苗栗縣': ['苗栗市', '頭份市', '竹南鎮', '後龍鎮', '通霄鎮', '苑裡鎮', '卓蘭鎮'],
  '台中市': ['西屯區', '南屯區', '北屯區', '西區', '北區', '南區', '中區', '東區', '豐原區', '大里區', '太平區', '清水區', '沙鹿區', '大甲區', '梧棲區', '烏日區', '神岡區', '大雅區', '潭子區', '后里區'],
  '彰化縣': ['彰化市', '員林市', '鹿港鎮', '和美鎮', '北斗鎮', '溪湖鎮', '田中鎮', '二林鎮'],
  '南投縣': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮'],
  '雲林縣': ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮'],
  '嘉義市': ['東區', '西區'],
  '嘉義縣': ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '水上鄉', '中埔鄉'],
  '台南市': ['東區', '中西區', '安平區', '永康區', '北區', '南區', '安南區', '新營區', '仁德區', '歸仁區', '佳里區', '麻豆區', '善化區', '新化區'],
  '高雄市': ['左營區', '鼓山區', '三民區', '苓雅區', '前鎮區', '新興區', '前金區', '鹽埕區', '楠梓區', '小港區', '鳳山區', '岡山區', '旗山區', '美濃區', '大寮區', '林園區', '仁武區', '鳥松區'],
  '屏東縣': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮'],
  '宜蘭縣': ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉'],
  '花蓮縣': ['花蓮市', '鳳林鎮', '玉里鎮', '吉安鄉', '新城鄉'],
  '台東縣': ['台東市', '成功鎮', '關山鎮'],
  '澎湖縣': ['馬公市'],
  '金門縣': ['金城鎮', '金湖鎮', '金沙鎮'],
  '連江縣': ['南竿鄉', '北竿鄉']
};

const ALL_CITIES = Object.keys(TAIWAN_LOCATIONS);
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

// Helper to get 1st of months for next year
const getFirstDayOfNextMonths = (count: number) => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = '01';
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
};

const createDefaultAvailability = () => {
    const dates = getFirstDayOfNextMonths(13); // Current month + Next 12
    const availability: Record<string, string[]> = {};
    dates.forEach(date => {
        availability[date] = [...ALL_HOURS];
    });
    return availability;
};

// Helper for Testing Mode: Reset all vendors to full availability
export const resetVendorsForTesting = () => {
    const today = new Date().toISOString().split('T')[0];
    MOCK_VENDORS.forEach(vendor => {
        // 1. Unpause
        vendor.isPaused = false;
        
        // 2. Add all locations
        vendor.serviceAreas = [...ALL_CITIES];
        
        // 3. Reset schedule to 24 hours for all generated dates
        const dates = Object.keys(vendor.availableHours);
        dates.forEach(date => {
            vendor.availableHours[date] = [...ALL_HOURS];
        });

        // 4. Force add "Today" to availability so the Quick Test works immediately
        vendor.availableHours[today] = [...ALL_HOURS];
    });
    console.log("Mock Data Reset: All vendors are now fully available (All Regions, All Hours).");
};

// --- Event Type Recommendations ---
export const EVENT_TYPE_RECOMMENDATIONS: Record<EventType, ServiceCategory[]> = {
  [EventType.BIRTHDAY]: [ServiceCategory.VENUE_RENTAL, ServiceCategory.CAKE, ServiceCategory.STATIC_PHOTO, ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DECOR, ServiceCategory.CATERING],
  [EventType.WEDDING]: [ServiceCategory.VENUE_RENTAL, ServiceCategory.HOST, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.STATIC_PHOTO, ServiceCategory.FLORIST, ServiceCategory.DESIGN_PRINT, ServiceCategory.STAGE_HARDWARE, ServiceCategory.BAND, ServiceCategory.PLANNER, ServiceCategory.CATERING],
  [EventType.PROPOSAL]: [ServiceCategory.FLORIST, ServiceCategory.STATIC_PHOTO, ServiceCategory.BAND, ServiceCategory.STAGE_HARDWARE],
  [EventType.YEAR_END_PARTY]: [ServiceCategory.HOST, ServiceCategory.BAND, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.PLANNER, ServiceCategory.CATERING],
  [EventType.OPENING]: [ServiceCategory.LION_DANCE, ServiceCategory.STATIC_PHOTO, ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.FLORIST, ServiceCategory.CATERING], 
  [EventType.GENDER_REVEAL]: [ServiceCategory.CAKE, ServiceCategory.STATIC_PHOTO, ServiceCategory.DESIGN_PRINT, ServiceCategory.BALLOON],
  [EventType.TRUNK_DECOR]: [ServiceCategory.FLORIST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.BALLOON],
  [EventType.ANNIVERSARY]: [ServiceCategory.STATIC_PHOTO, ServiceCategory.CAKE, ServiceCategory.CATERING],
  [EventType.SPRING_WINE]: [ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.CATERING],
  [EventType.CELEBRATION]: [ServiceCategory.STAGE_HARDWARE, ServiceCategory.HOST, ServiceCategory.CATERING],
  [EventType.CAR_DELIVERY]: [ServiceCategory.STATIC_PHOTO, ServiceCategory.FLORIST],
  [EventType.GRADUATION]: [ServiceCategory.STATIC_PHOTO, ServiceCategory.FLORIST],
  [EventType.SCHOOL_ANNIVERSARY]: [ServiceCategory.STAGE_HARDWARE],
  [EventType.VALENTINES]: [ServiceCategory.FLORIST, ServiceCategory.CAKE, ServiceCategory.BAND],
  [EventType.MOTHERS_DAY]: [ServiceCategory.CAKE, ServiceCategory.FLORIST],
  [EventType.FATHERS_DAY]: [ServiceCategory.CAKE],
  [EventType.HALLOWEEN]: [ServiceCategory.STAGE_HARDWARE, ServiceCategory.ACTOR],
  [EventType.CHRISTMAS]: [ServiceCategory.STAGE_HARDWARE, ServiceCategory.BAND, ServiceCategory.CATERING],
  [EventType.RETIREMENT]: [ServiceCategory.HOST, ServiceCategory.STATIC_PHOTO, ServiceCategory.CATERING],
  [EventType.OFFICE_WARMING]: [ServiceCategory.CAKE, ServiceCategory.FLORIST, ServiceCategory.CATERING],
  [EventType.PRESS_CONFERENCE]: [ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.DESIGN_PRINT, ServiceCategory.CATERING],
};

// --- Mock Reviews ---
const MOCK_REVIEWS: Review[] = [
  { id: 'r1', user: '陳小姐', rating: 5, comment: '非常專業，氣氛帶動得很好！', date: '2023-10-01', images: [] },
  { id: 'r2', user: '林先生', rating: 4, comment: '溝通順利，CP值高。', date: '2023-09-15', images: [] },
  { id: 'r3', user: 'Jessica', rating: 5, comment: '完美的體驗，大力推薦。', date: '2023-11-20', images: [] },
];

// Helper to get helper Lunar Date
const getHolidayDates = (year: number) => {
    // Simplified fixed dates for demo purposes
    // 2024
    if (year === 2024) return { 
        cny: '2024-02-10', 
        cnyEve: '2024-02-09', 
        chineseValentines: '2024-08-10',
        newYear: '2024-01-01',
        newYearEve: '2024-12-31' 
    };
    // 2025
    return { 
        cny: '2025-01-29', 
        cnyEve: '2025-01-28', 
        chineseValentines: '2025-08-29',
        newYear: '2025-01-01',
        newYearEve: '2025-12-31'
    };
};

export const MOCK_VENDORS: Vendor[] = [
  // --- HOSTS (3) ---
  {
    id: 'v1',
    name: '金牌主持人 Alice',
    category: ServiceCategory.HOST,
    description: '擁有 500 場以上婚禮與尾牙主持經驗，氣氛帶動高手。',
    imageUrl: 'https://picsum.photos/id/1011/200/200',
    portfolio: ['https://picsum.photos/id/1011/400/300', 'https://picsum.photos/id/1027/400/300'],
    portfolioVideos: [],
    rate: 3000, // Base package start price
    rateType: 'package',
    hostSettings: { baseDuration: 2, overtimeRate: 3000, eventTypeAddons: {} }, // Keep for reference if needed
    travelFees: { '桃園市': 500, '新竹市': 1000, '台中市': 2500 },
    packages: [
        { id: 'hp_basic', name: '基礎主持方案 (1-1.5hr)', description: '適合小型聚會、流程簡單的活動，輕鬆帶氣氛。\n• 主持人 1 位\n• 基礎開場與流程控場\n• 1-2 個簡單互動遊戲\n• 活動前 10 分鐘流程對接', price: 3000, imageUrls: [] },
        { id: 'hp_std', name: '標準主持方案 (2hr)', description: '最熱門方案，適合生日、企業小型活動、一般派對。\n• 主持人 1 位\n• 完整開場、互動、中場串場\n• 多款遊戲可擇一或搭配\n• 客製化流程建議\n• 活動前 20 分鐘流程對接', price: 6000, imageUrls: [] },
        { id: 'hp_adv', name: '高階主持方案 (2-3hr)', description: '婚禮、尾牙、重要企業形象活動的專業選擇。\n• 主持人 1 位 (資深)\n• 深度客製流程與腳本架構\n• 企業形象導入 / 品牌口條\n• 活動前 1 小時彩排\n• 多段互動與抽獎流程串接', price: 12000, imageUrls: [] },
        { id: 'hp_vip', name: '旗艦 VIP 客製方案 (4hr內)', description: '品牌發表會、大型年度活動，全面量身打造。\n• 主持人 1 位 (頂級資歷)\n• 全客製腳本與分鏡討論\n• 可搭配助理 / 第二主持 (視實際報價)\n• 事前會議 1-2 次\n• 可搭配社群曝光合作', price: 25000, imageUrls: [] },
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 128,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v2',
    name: '幽默主持肯尼',
    category: ServiceCategory.HOST,
    description: '擅長脫口秀風格，適合輕鬆派對與各類活動。',
    imageUrl: 'https://picsum.photos/id/338/200/200',
    portfolio: ['https://picsum.photos/id/338/400/300'],
    portfolioVideos: [],
    rate: 3000,
    rateType: 'hourly', // Stays hourly for comparison
    travelFees: { '新北市': 300, '台中市': 2000 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.5,
    reviewCount: 45,
    reviews: [MOCK_REVIEWS[1]]
  },
  {
    id: 'v_h3',
    name: '雙語主持 Vivian',
    category: ServiceCategory.HOST,
    description: '中英日三語流利，專精國際論壇與外商尾牙。',
    imageUrl: 'https://picsum.photos/id/342/200/200',
    portfolio: [],
    portfolioVideos: [],
    rate: 20000,
    rateType: 'fixed',
    hostSettings: { baseDuration: 3, overtimeRate: 5000, eventTypeAddons: {} },
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 22,
    reviews: []
  },

  // --- PHOTOGRAPHERS (3) ---
  {
    id: 'v3',
    name: '光影魔術師 - 小陳',
    category: ServiceCategory.STATIC_PHOTO,
    description: '專精人像攝影與活動紀錄，提供當日快剪快播。',
    imageUrl: 'https://picsum.photos/id/250/200/200',
    portfolio: ['https://picsum.photos/id/250/400/300', 'https://picsum.photos/id/237/400/300'],
    portfolioVideos: [],
    rate: 15000,
    rateType: 'fixed',
    travelFees: { '基隆市': 500, '桃園市': 800 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 210,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_ph2',
    name: '日系清新影像',
    category: ServiceCategory.STATIC_PHOTO,
    description: '捕捉自然光影，適合親子、周歲、溫馨婚禮。',
    imageUrl: 'https://picsum.photos/id/64/200/200',
    portfolio: [],
    rate: 2500,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 45,
    reviews: []
  },
  {
    id: 'v_ph3',
    name: '商業活動紀錄團隊',
    category: ServiceCategory.STATIC_PHOTO,
    description: '多機位拍攝，適合大型記者會、產品發表。',
    imageUrl: 'https://picsum.photos/id/91/200/200',
    portfolio: [],
    rate: 4000,
    rateType: 'hourly',
    travelFees: { '台北市': 0, '新北市': 0, '桃園市': 1200 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 15,
    reviews: []
  },

  // --- VIDEOGRAPHY (3) ---
  {
    id: 'v4',
    name: '回憶製造所',
    category: ServiceCategory.VIDEOGRAPHY,
    description: '溫馨風格，捕捉最自然的瞬間。',
    imageUrl: 'https://picsum.photos/id/433/200/200',
    portfolio: ['https://picsum.photos/id/433/400/300'],
    portfolioVideos: [],
    rate: 2000,
    rateType: 'hourly',
    travelFees: { '台南市': 500, '高雄市': 0, '屏東縣': 800 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.2,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'v_vid2',
    name: '電影質感工作室',
    category: ServiceCategory.VIDEOGRAPHY,
    description: '4K 電影規格拍攝，專業調色與剪輯。',
    imageUrl: 'https://picsum.photos/id/452/200/200',
    portfolio: [],
    rate: 25000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 33,
    reviews: []
  },
  {
    id: 'v_vid3',
    name: '快剪快播 SDE 團隊',
    category: ServiceCategory.VIDEOGRAPHY,
    description: '早上拍攝，中午宴客立即播放。',
    imageUrl: 'https://picsum.photos/id/531/200/200',
    portfolio: [],
    rate: 18000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 12,
    reviews: []
  },

  // --- BAND (3) ---
  {
    id: 'v5',
    name: 'Skyline 爵士樂團',
    category: ServiceCategory.BAND,
    description: '質感爵士三重奏，薩克斯風+鍵盤+低音提琴，提升活動格調。',
    imageUrl: 'https://picsum.photos/id/453/200/200',
    portfolio: ['https://picsum.photos/id/453/400/300'],
    portfolioVideos: [],
    rate: 12000,
    rateType: 'hourly',
    travelFees: { '桃園市': 1500, '新竹縣': 2000 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 50,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v12',
    name: '搖滾熱血樂團',
    category: ServiceCategory.BAND,
    description: '炒熱氣氛首選，流行搖滾曲風。',
    imageUrl: 'https://picsum.photos/id/145/200/200',
    portfolio: ['https://picsum.photos/id/145/400/300'],
    portfolioVideos: [],
    rate: 15000,
    rateType: 'hourly',
    travelFees: { '台中市': 0, '高雄市': 500, '台南市': 500 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 28,
    reviews: []
  },
  {
    id: 'v_band3',
    name: '古典弦樂四重奏',
    category: ServiceCategory.BAND,
    description: '氣質首選，兩把小提琴+中提琴+大提琴。',
    imageUrl: 'https://picsum.photos/id/1023/200/200',
    portfolio: [],
    rate: 20000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 18,
    reviews: []
  },

  // --- STAGE/HARDWARE (3) ---
  {
    id: 'v6',
    name: '極致音響工程',
    category: ServiceCategory.STAGE_HARDWARE, // Merged
    description: '專業演唱會等級音響租賃與控台。',
    imageUrl: 'https://picsum.photos/id/1/200/200',
    portfolio: ['https://picsum.photos/id/1/400/300'],
    portfolioVideos: [],
    rate: 20000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 88,
    reviews: []
  },
  {
    id: 'v9',
    name: '硬漢舞台 Truss',
    category: ServiceCategory.STAGE_HARDWARE, // Merged
    description: '舞台結構搭建、背板架設。安全第一。',
    imageUrl: 'https://picsum.photos/id/192/200/200',
    portfolio: ['https://picsum.photos/id/192/400/300'],
    portfolioVideos: [],
    rate: 12000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 22,
    reviews: []
  },
  {
    id: 'v_hw3',
    name: '炫彩燈光設計',
    category: ServiceCategory.STAGE_HARDWARE,
    description: '電腦燈、染色燈、追蹤燈，打造舞台視覺效果。',
    imageUrl: 'https://picsum.photos/id/214/200/200',
    portfolio: [],
    rate: 15000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.5,
    reviewCount: 10,
    reviews: []
  },

  // --- FLORIST (3) ---
  {
    id: 'v7',
    name: '花花世界佈置',
    category: ServiceCategory.FLORIST,
    description: '客製化鮮花拱門與桌面擺設。',
    imageUrl: 'https://picsum.photos/id/306/200/200',
    portfolio: ['https://picsum.photos/id/306/400/300'],
    portfolioVideos: [],
    rate: 35000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 32,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_fl2',
    name: '乾燥花藝實驗室',
    category: ServiceCategory.FLORIST,
    description: '永生花、乾燥花藝設計，適合文青風格活動。',
    imageUrl: 'https://picsum.photos/id/360/200/200',
    portfolio: [],
    rate: 28000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'v_fl3',
    name: '奢華花藝宮殿',
    category: ServiceCategory.FLORIST,
    description: '進口花材，大型花牆製作，氣勢滂薄。',
    imageUrl: 'https://picsum.photos/id/512/200/200',
    portfolio: [],
    rate: 60000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 5,
    reviews: []
  },

  // --- CAKE (3 - Package Based) ---
  {
    id: 'v8',
    name: '甜心烘焙坊',
    category: ServiceCategory.CAKE,
    description: '專注於翻糖蛋糕與派對小點心，可完全客製化。',
    imageUrl: 'https://picsum.photos/id/292/200/200',
    portfolio: ['https://picsum.photos/id/292/400/300'],
    portfolioVideos: [],
    rate: 2000, // Starting Price
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [
            { city: '台北市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 300 }, // Delivery Only
            { city: '新北市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 500 }
        ],
        upstairsFee: 0, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: false 
    },
    packages: [
        { id: 'c1', name: '6吋 鮮奶油水果蛋糕', description: '當季新鮮水果，減糖配方。', price: 1200, imageUrls: [] },
        { id: 'c2', name: '8吋 經典巧克力蛋糕', description: '70% 比利時黑巧克力，濃郁不膩。', price: 1800, imageUrls: [] },
        { id: 'c3', name: '雙層 派對翻糖蛋糕', description: '6+8吋，可指定主題公仔。', price: 4500, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 60,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_cake2',
    name: '法式甜點工作室',
    category: ServiceCategory.CAKE,
    description: '精緻法式塔派、馬卡龍塔，提升派對質感。',
    imageUrl: 'https://picsum.photos/id/488/200/200',
    portfolio: [],
    rate: 1500,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [
            { city: '台北市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 200 },
            { city: '新北市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 400 }
        ],
        upstairsFee: 0, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: true
    },
    packages: [
        { id: 'c2_1', name: '迷你塔派組合 (20入)', description: '檸檬塔、生巧塔、水果塔綜合。', price: 1600, imageUrls: [] },
        { id: 'c2_2', name: '馬卡龍金字塔 (30顆)', description: '繽紛色彩，拍照首選。', price: 3000, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 25,
    reviews: []
  },
  {
    id: 'v_cake3',
    name: '古早味蛋糕專賣',
    category: ServiceCategory.CAKE,
    description: '懷舊風味，適合長輩壽宴或傳統慶典。',
    imageUrl: 'https://picsum.photos/id/835/200/200',
    portfolio: [],
    rate: 500,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [
            { city: '高雄市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 150 },
            { city: '台南市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 300 }
        ],
        upstairsFee: 0, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: false
    },
    packages: [
        { id: 'c3_1', name: '12吋 傳統鮮奶油芋頭蛋糕', description: '厚實芋泥餡，傳統美味。', price: 900, imageUrls: [] },
        { id: 'c3_2', name: '壽桃塔組合', description: '18顆小壽桃 + 1顆大壽桃。', price: 1200, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.5,
    reviewCount: 40,
    reviews: []
  },

  // --- DECOR (3) ---
  {
    id: 'v10',
    name: '迪爾氣球設計 (D.Design)',
    category: ServiceCategory.DECOR,
    description: '質感氣球佈置、派對主題規劃。為您打造獨一無二的夢幻場景。',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/9384/9384168.png', 
    portfolio: ['https://www.dear79.shop/'],
    portfolioVideos: [],
    websiteUrl: 'https://www.dear79.shop/',
    rate: 8000, 
    rateType: 'package',
    travelFees: {},
    packages: [
      { id: 'p1', name: '夢幻生日派對 A 方案', description: '包含 2 米氣球拱門、空飄氣球 20 顆、壽星名牌', price: 8800, imageUrls: ['https://picsum.photos/id/10/300/200'], eventTypes: [EventType.BIRTHDAY] },
      { id: 'p2', name: '奢華求婚佈置 B 方案', description: '包含 MARRY ME 燈飾、鮮花花瓣、電子蠟燭 50 個、氣球束 6 組', price: 15800, imageUrls: ['https://picsum.photos/id/20/300/200'], eventTypes: [EventType.PROPOSAL] },
      { id: 'p3', name: '商業開幕 C 方案', description: '包含大型迎賓拱門、剪綵道具、開幕紅布條', price: 12000, imageUrls: ['https://picsum.photos/id/30/300/200'], eventTypes: [EventType.OPENING] }
    ],
    decoratorSettings: {
      locationFeeRules: [
          { city: '台北市', district: 'all', setupFee: 2000, teardownFee: 2000, deliveryFee: 500 },
          { city: '新北市', district: 'all', setupFee: 2000, teardownFee: 2000, deliveryFee: 800 },
          { city: '新北市', district: '淡水區', setupFee: 3500, teardownFee: 3500, deliveryFee: 1200 }, 
          { city: '桃園市', district: 'all', setupFee: 3000, teardownFee: 3000, deliveryFee: 1500 },
          { city: '台中市', district: 'all', setupFee: 5000, teardownFee: 5000, deliveryFee: 2500 },
          { city: '高雄市', district: 'all', setupFee: 6000, teardownFee: 6000, deliveryFee: 3000 },
          { city: '台南市', district: 'all', setupFee: 6000, teardownFee: 6000, deliveryFee: 3000 }
      ],
      upstairsFee: 500, // Fee for non-1F delivery
      hourlySurcharges: { 22: 2000, 23: 2000, 0: 3000, 1: 3000, 2: 3000, 3: 3000, 4: 3000, 5: 3000, 6: 3000 },
      holidaySurchargePercent: 20,
      urgentOrderEnabled: true,
      holidays: ['02-14', '05-20', '12-31', '01-01'],
      lunarHolidays: ['CNY', 'CNY_EVE', 'CHINESE_VALENTINES']
    },
    serviceAreas: [...ALL_CITIES], 
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 188,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_dec2',
    name: '森林系佈置',
    category: ServiceCategory.DECOR,
    description: '大量使用植栽與木作，打造自然風格。',
    imageUrl: 'https://picsum.photos/id/1047/200/200',
    portfolio: [],
    rate: 15000,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [],
        upstairsFee: 1000, hourlySurcharges: {}, holidaySurchargePercent: 10, holidays: [], lunarHolidays: [], urgentOrderEnabled: false
    },
    packages: [
        { id: 'dp1', name: '野餐風佈置', description: '地毯、木棧板桌、靠枕組合。', price: 12000, imageUrls: [] },
        { id: 'dp2', name: '婚禮背板區', description: '3米寬木作背板 + 仿真花藝。', price: 25000, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 22,
    reviews: []
  },
  {
    id: 'v_dec3',
    name: '霓虹派對',
    category: ServiceCategory.DECOR,
    description: '擅長使用霓虹燈管與雷射效果，適合夜店風派對。',
    imageUrl: 'https://picsum.photos/id/400/200/200',
    portfolio: [],
    rate: 10000,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [],
        upstairsFee: 0, hourlySurcharges: { 23: 1000 }, holidaySurchargePercent: 20, holidays: ['12-31'], lunarHolidays: [], urgentOrderEnabled: true
    },
    packages: [
        { id: 'np1', name: '螢光派對包', description: 'UV燈管 + 螢光氣球。', price: 9000, imageUrls: [] },
        { id: 'np2', name: 'Cyberpunk 風格', description: '大量 LED 燈條與科技感裝飾。', price: 20000, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 8,
    reviews: []
  },

  // --- ACTOR/MAGICIAN (3) ---
  {
    id: 'v11',
    name: '魔術師大衛',
    category: ServiceCategory.ACTOR,
    description: '擅長近距離魔術與舞台大型幻術，適合各類晚宴。',
    imageUrl: 'https://picsum.photos/id/158/200/200',
    portfolio: ['https://picsum.photos/id/158/400/300'],
    portfolioVideos: [],
    rate: 10000,
    rateType: 'hourly',
    travelFees: { '台中市': 1500, '高雄市': 2000 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 42,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_act2',
    name: '小丑泡泡秀',
    category: ServiceCategory.ACTOR,
    description: '互動性極強，孩子們的最愛。',
    imageUrl: 'https://picsum.photos/id/88/200/200',
    portfolio: [],
    rate: 6000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 55,
    reviews: []
  },
  {
    id: 'v_act3',
    name: '川劇變臉大師',
    category: ServiceCategory.ACTOR,
    description: '震撼全場的傳統技藝，適合尾牙春酒開場。',
    imageUrl: 'https://picsum.photos/id/211/200/200',
    portfolio: [],
    rate: 12000,
    rateType: 'fixed', // Per show
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 30,
    reviews: []
  },

  // --- VENUE (3) ---
  {
    id: 'v13',
    name: '優雅場地租借',
    category: ServiceCategory.VENUE_RENTAL,
    description: '挑高無柱宴會廳，附設新娘房。',
    imageUrl: 'https://picsum.photos/id/269/200/200',
    portfolio: ['https://picsum.photos/id/269/400/300'],
    portfolioVideos: [],
    rate: 50000,
    rateType: 'fixed',
    overtimeRate: 15000,
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 200,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_ven2',
    name: '工業風攝影棚',
    category: ServiceCategory.VENUE_RENTAL,
    description: '適合小型派對、求婚、拍攝。',
    imageUrl: 'https://picsum.photos/id/350/200/200',
    portfolio: [],
    rate: 3000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: ['台北市', '新北市'],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.5,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'v_ven3',
    name: '戶外草地婚禮莊園',
    category: ServiceCategory.VENUE_RENTAL,
    description: '千坪草地，夢幻戶外證婚首選。',
    imageUrl: 'https://picsum.photos/id/10/200/200',
    portfolio: [],
    rate: 80000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: ['桃園市', '新竹縣', '苗栗縣'],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 60,
    reviews: []
  },

  // --- DESIGN/PRINT (3) ---
  {
    id: 'v14',
    name: '視覺設計工作室',
    category: ServiceCategory.DESIGN_PRINT, // Merged
    description: '活動海報、邀請函、識別證設計與輸出。',
    imageUrl: 'https://picsum.photos/id/366/200/200',
    portfolio: ['https://picsum.photos/id/366/400/300'],
    portfolioVideos: [],
    rate: 3000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'v_dp2',
    name: '快速輸出中心',
    category: ServiceCategory.DESIGN_PRINT,
    description: '大型背板輸出、人形立牌，當日可取件。',
    imageUrl: 'https://picsum.photos/id/160/200/200',
    portfolio: [],
    rate: 5000,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: { locationFeeRules: [], upstairsFee: 0, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: false },
    packages: [
        { id: 'dp_p1', name: '300x240cm 背板含架', description: '帆布輸出 + 簡易腳架。', price: 4500, imageUrls: [] },
        { id: 'dp_p2', name: '人形立牌 (等身)', description: '珍珠板裁型。', price: 1500, imageUrls: [] }
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.4,
    reviewCount: 100,
    reviews: []
  },
  {
    id: 'v_dp3',
    name: '客製化禮品設計',
    category: ServiceCategory.DESIGN_PRINT,
    description: '活動伴手禮包裝設計、貼紙印刷。',
    imageUrl: 'https://picsum.photos/id/201/200/200',
    portfolio: [],
    rate: 2000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 8,
    reviews: []
  },

  // --- BALLOON (3) ---
  {
    id: 'v15',
    name: '快樂氣球人',
    category: ServiceCategory.BALLOON,
    description: '互動式氣球魔術，小朋友的最愛。',
    imageUrl: 'https://picsum.photos/id/100/200/200',
    portfolio: [],
    portfolioVideos: [],
    rate: 2000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 12,
    reviews: []
  },
  {
    id: 'v_bal2',
    name: '氣球小丑哥哥',
    category: ServiceCategory.BALLOON,
    description: '現場折氣球發送，種類多樣。',
    imageUrl: 'https://picsum.photos/id/102/200/200',
    portfolio: [],
    rate: 2500,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 20,
    reviews: []
  },
  {
    id: 'v_bal3',
    name: '造型氣球達人',
    category: ServiceCategory.BALLOON,
    description: '可折出大型卡通人物、複雜造型。',
    imageUrl: 'https://picsum.photos/id/103/200/200',
    portfolio: [],
    rate: 3500,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 5,
    reviews: []
  },

  // --- DJ (3) ---
  {
    id: 'v16',
    name: 'DJ Ray',
    category: ServiceCategory.DJ,
    description: '專業派對 DJ，EDM/HipHop/House 多曲風。',
    imageUrl: 'https://picsum.photos/id/399/200/200',
    portfolio: [],
    portfolioVideos: [],
    rate: 5000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 22,
    reviews: []
  },
  {
    id: 'v_dj2',
    name: 'Wedding DJ Eva',
    category: ServiceCategory.DJ,
    description: '專為婚禮打造的溫馨與熱鬧兼具歌單。',
    imageUrl: 'https://picsum.photos/id/349/200/200',
    portfolio: [],
    rate: 4000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'v_dj3',
    name: 'Party Rocker Max',
    category: ServiceCategory.DJ,
    description: '擅長嘻哈與流行音樂混音。',
    imageUrl: 'https://picsum.photos/id/450/200/200',
    portfolio: [],
    rate: 6000,
    rateType: 'hourly',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.5,
    reviewCount: 8,
    reviews: []
  },

  // --- PLANNER (3) ---
  {
    id: 'v17',
    name: '完美時刻活動統籌',
    category: ServiceCategory.PLANNER,
    description: '專屬活動管家，從主題發想到現場執行，為您打造無憂的完美時刻。婚禮、派對、企業活動皆擅長。',
    imageUrl: 'https://picsum.photos/id/331/200/200',
    portfolio: ['https://picsum.photos/id/331/400/300', 'https://picsum.photos/id/325/400/300'],
    portfolioVideos: [],
    rate: 25000,
    rateType: 'fixed',
    travelFees: { '台北市': 0, '新北市': 500, '桃園市': 1500, '台中市': 3000 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 36,
    reviews: [
        { id: 'r_p1', user: '張經理', rating: 5, comment: '細心負責，讓我們的尾牙非常順利！', date: '2024-01-15', images: [] },
        { id: 'r_p2', user: 'Vicky', rating: 5, comment: '把我的求婚規劃得超浪漫，大推！', date: '2023-12-20', images: [] }
    ]
  },
  {
    id: 'v_pl2',
    name: '幸福起點婚顧',
    category: ServiceCategory.PLANNER,
    description: '專注於婚禮流程企劃與場控，讓新人輕鬆享受婚禮。',
    imageUrl: 'https://picsum.photos/id/1060/200/200',
    portfolio: [],
    rate: 18000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 50,
    reviews: []
  },
  {
    id: 'v_pl3',
    name: '創意活動工作室',
    category: ServiceCategory.PLANNER,
    description: '擅長兒童派對、抓周儀式規劃。',
    imageUrl: 'https://picsum.photos/id/1059/200/200',
    portfolio: [],
    rate: 12000,
    rateType: 'fixed',
    travelFees: {},
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 18,
    reviews: []
  },

  // --- CATERING (3 - Package Based) ---
  {
    id: 'v18',
    name: '五星級外燴服務',
    category: ServiceCategory.CATERING,
    description: '提供精緻自助餐、雞尾酒會小點、茶歇服務。食材新鮮，衛生第一。',
    imageUrl: 'https://picsum.photos/id/429/200/200',
    portfolio: ['https://picsum.photos/id/429/400/300', 'https://picsum.photos/id/425/400/300'],
    portfolioVideos: [],
    rate: 15000, // Starting price
    rateType: 'package',
    decoratorSettings: {
        locationFeeRules: [
            { city: '台北市', district: 'all', setupFee: 2000, teardownFee: 1000, deliveryFee: 800 },
            { city: '新北市', district: 'all', setupFee: 2500, teardownFee: 1200, deliveryFee: 1200 }
        ],
        upstairsFee: 500, hourlySurcharges: {}, holidaySurchargePercent: 10, holidays: [], lunarHolidays: [], urgentOrderEnabled: true
    },
    packages: [
        { id: 'cat1', name: '精緻茶歇 (50人份)', description: '手工餅乾、小蛋糕、咖啡茶飲。', price: 15000, imageUrls: [] },
        { id: 'cat2', name: '歐式自助餐 (30人份)', description: '冷盤、熱食、主餐、甜點共12道。', price: 28000, imageUrls: [] },
        { id: 'cat3', name: '雞尾酒會小點 (Finger Food)', description: '精緻一口食，適合時尚派對。', price: 20000, imageUrls: [] }
    ],
    travelFees: { '桃園市': 2000, '新竹縣': 3500 },
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 56,
    reviews: []
  },
  {
    id: 'v_cat2',
    name: '在地風味辦桌',
    category: ServiceCategory.CATERING,
    description: '傳統台式料理，現煮熱食。',
    imageUrl: 'https://picsum.photos/id/493/200/200',
    portfolio: [],
    rate: 10000,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [],
        upstairsFee: 500, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: false
    },
    packages: [
        { id: 'cat2_1', name: '經典辦桌 (每桌)', description: '10人份，十道經典菜色。', price: 8000, imageUrls: [] }
    ],
    serviceAreas: ['台中市', '彰化縣', '南投縣'],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.7,
    reviewCount: 88,
    reviews: []
  },
  {
    id: 'v_cat3',
    name: '健康輕食餐盒',
    category: ServiceCategory.CATERING,
    description: '適合研討會、會議午餐。',
    imageUrl: 'https://picsum.photos/id/488/200/200',
    portfolio: [],
    rate: 3000,
    rateType: 'package',
    travelFees: {},
    decoratorSettings: {
        locationFeeRules: [
            { city: '台北市', district: 'all', setupFee: 0, teardownFee: 0, deliveryFee: 300 }
        ],
        upstairsFee: 0, hourlySurcharges: {}, holidaySurchargePercent: 0, holidays: [], lunarHolidays: [], urgentOrderEnabled: true
    },
    packages: [
        { id: 'cat3_1', name: '會議餐盒組合 (20個)', description: '主餐+水果+飲料。', price: 4000, imageUrls: [] }
    ],
    serviceAreas: ['台北市', '新北市'],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.6,
    reviewCount: 12,
    reviews: []
  },

  // --- FILLERS to ensure minimal coverage for other categories ---
  {
    id: 'v_pt1', name: '活動機動小隊', category: ServiceCategory.PT, description: '搬運、場控、引導。', imageUrl: 'https://picsum.photos/id/1005/200/200',
    rate: 200, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 5, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  {
    id: 'v_pt2', name: '專業禮儀接待', category: ServiceCategory.PT, description: '剪綵、頒獎接待人員。', imageUrl: 'https://picsum.photos/id/1006/200/200',
    rate: 500, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.8, reviewCount: 10, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  {
    id: 'v_pt3', name: '撤場清潔工讀', category: ServiceCategory.PT, description: '活動結束快速復原場地。', imageUrl: 'https://picsum.photos/id/1008/200/200',
    rate: 250, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.6, reviewCount: 8, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  {
    id: 'v_oth1', name: '拍貼機租賃', category: ServiceCategory.OTHER, description: '韓式拍貼機，立即列印。', imageUrl: 'https://picsum.photos/id/250/200/200',
    rate: 8000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.9, reviewCount: 20, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  {
    id: 'v_oth2', name: '流動廁所租賃', category: ServiceCategory.OTHER, description: '戶外活動必備。', imageUrl: 'https://picsum.photos/id/251/200/200',
    rate: 5000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 5, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  {
    id: 'v_oth3', name: '發電機車租賃', category: ServiceCategory.OTHER, description: '確保戶外活動電力充足。', imageUrl: 'https://picsum.photos/id/252/200/200',
    rate: 6000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.8, reviewCount: 12, reviews: [], portfolio: [], packages: [], travelFees: {}
  },
  // Add generic ones for Singer, Dance, Lion Dance, Acrobatics to satisfy "3 per category" rule broadly
  { id: 'v_sin1', name: '抒情歌手 A', category: ServiceCategory.SINGER, description: '流行歌曲翻唱。', imageUrl: 'https://picsum.photos/id/301/200/200', rate: 5000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_sin2', name: '搖滾歌手 B', category: ServiceCategory.SINGER, description: '爆發力十足。', imageUrl: 'https://picsum.photos/id/302/200/200', rate: 6000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_sin3', name: '爵士女伶 C', category: ServiceCategory.SINGER, description: '慵懶嗓音。', imageUrl: 'https://picsum.photos/id/304/200/200', rate: 8000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  
  { id: 'v_dan1', name: '熱舞團體 A', category: ServiceCategory.DANCE, description: '街舞表演。', imageUrl: 'https://picsum.photos/id/305/200/200', rate: 8000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_dan2', name: '現代舞團 B', category: ServiceCategory.DANCE, description: '藝術氣息。', imageUrl: 'https://picsum.photos/id/306/200/200', rate: 12000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_dan3', name: '啦啦隊 C', category: ServiceCategory.DANCE, description: '活力應援。', imageUrl: 'https://picsum.photos/id/307/200/200', rate: 10000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },

  { id: 'v_ld1', name: '醒獅團 A', category: ServiceCategory.LION_DANCE, description: '開幕旺場。', imageUrl: 'https://picsum.photos/id/308/200/200', rate: 12000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_ld2', name: '戰鼓團 B', category: ServiceCategory.LION_DANCE, description: '氣勢磅礡。', imageUrl: 'https://picsum.photos/id/309/200/200', rate: 15000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_ld3', name: '龍獅隊 C', category: ServiceCategory.LION_DANCE, description: '傳統技藝。', imageUrl: 'https://picsum.photos/id/310/200/200', rate: 18000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },

  { id: 'v_acr1', name: '特技團 A', category: ServiceCategory.ACROBATICS, description: '空中環。', imageUrl: 'https://picsum.photos/id/311/200/200', rate: 15000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_acr2', name: '雜耍藝人 B', category: ServiceCategory.ACROBATICS, description: '丟球、獨輪車。', imageUrl: 'https://picsum.photos/id/312/200/200', rate: 8000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_acr3', name: '火舞團 C', category: ServiceCategory.ACROBATICS, description: '夜間視覺饗宴。', imageUrl: 'https://picsum.photos/id/313/200/200', rate: 20000, rateType: 'fixed', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  
  { id: 'v_pf1', name: '行動雕像 A', category: ServiceCategory.PERFORMER, description: '定點互動。', imageUrl: 'https://picsum.photos/id/314/200/200', rate: 5000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_pf2', name: '街頭藝人 B', category: ServiceCategory.PERFORMER, description: '吉他彈唱。', imageUrl: 'https://picsum.photos/id/315/200/200', rate: 3000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_pf3', name: '默劇演員 C', category: ServiceCategory.PERFORMER, description: '幽默互動。', imageUrl: 'https://picsum.photos/id/316/200/200', rate: 4000, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  
  { id: 'v_staff1', name: '活動工讀生 A', category: ServiceCategory.STAFF, description: '報到櫃台。', imageUrl: 'https://picsum.photos/id/317/200/200', rate: 200, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_staff2', name: '場控人員 B', category: ServiceCategory.STAFF, description: '流程控制。', imageUrl: 'https://picsum.photos/id/318/200/200', rate: 500, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
  { id: 'v_staff3', name: '主持人助理 C', category: ServiceCategory.STAFF, description: '協助道具遞送。', imageUrl: 'https://picsum.photos/id/319/200/200', rate: 300, rateType: 'hourly', serviceAreas: [...ALL_CITIES], availableHours: createDefaultAvailability(), isPaused: false, rating: 4.5, reviewCount: 0, reviews: [], portfolio: [], packages: [], travelFees: {} },
];

// Determine availability
export const isVendorAvailable = (vendor: Vendor, date: string, startHour: number, endHour: number, city: string, isLocationUndecided: boolean): boolean => {
  if (vendor.isPaused) return false;
  
  // Update logic:
  // If user selected a city, we MUST filter by it.
  // We no longer skip this check just because isLocationUndecided is true.
  // If city is empty (user really doesn't know), then we show all.
  if (city && !vendor.serviceAreas.includes(city)) return false;

  const dayHours = vendor.availableHours[date];
  if (!dayHours) return false;

  const neededHours: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    neededHours.push(`${h}:00`);
  }
  
  return neededHours.every(h => dayHours.includes(h));
};

export interface CostItem {
    label: string;
    amount: number;
}

// --- Complex Cost Calculation with Breakdown ---
export const calculateVendorCostBreakdown = (
    vendor: Vendor, 
    request: UserRequest, 
    defaultDurationHours: number,
    selectedPackageId?: string,
    options?: { 
        needSetup?: boolean; 
        needTeardown?: boolean; 
        setupStartTime?: string;
        setupEndTime?: string;
        duration?: number;
        serviceStartTime?: string;
        serviceEndTime?: string;
        floor?: string;
        deliveryMethod?: 'pickup' | 'delivery' | 'setup';
    }
  ): { total: number; items: CostItem[] } => {
  
  let total = 0;
  const items: CostItem[] = [];

  // Determine duration
  let durationHours = defaultDurationHours;
  if (options?.duration) {
      durationHours = options.duration;
  } else if (options?.serviceStartTime && options?.serviceEndTime) {
      const [startH, startM] = options.serviceStartTime.split(':').map(Number);
      const [endH, endM] = options.serviceEndTime.split(':').map(Number);
      const startTotal = startH + startM / 60;
      const endTotal = endH + endM / 60;
      const diff = endTotal - startTotal;
      durationHours = diff > 0 ? diff : 0;
  }

  // 1. Host with Special Settings (Hourly/Session)
  // Skip if rateType is 'package'
  if (vendor.category === ServiceCategory.HOST && vendor.hostSettings && vendor.rateType !== 'package') {
      const settings = vendor.hostSettings;
      const baseRate = vendor.rate;
      total += baseRate;
      items.push({ label: '基本主持費', amount: baseRate });

      // Overtime
      if (durationHours > settings.baseDuration) {
          const extraTime = Math.ceil(durationHours - settings.baseDuration);
          const fee = extraTime * settings.overtimeRate;
          total += fee;
          items.push({ label: `超時費 (${extraTime}hr)`, amount: fee });
      }

      // Event Type Surcharge
      if (request.eventType && settings.eventTypeAddons[request.eventType]) {
          const fee = settings.eventTypeAddons[request.eventType];
          total += fee;
          items.push({ label: `特殊活動加成 (${request.eventType})`, amount: fee });
      }

      // Travel Fee
      if (request.city && vendor.travelFees[request.city]) {
          const fee = vendor.travelFees[request.city];
          total += fee;
          items.push({ label: `車馬費 (${request.city})`, amount: fee });
      }

      return { total, items };
  }

  // 2. Standard Vendors (Hourly or Fixed)
  if (vendor.rateType !== 'package') {
    let baseCost = 0;
    
    if (vendor.category === ServiceCategory.VENUE_RENTAL && vendor.rateType === 'fixed') {
        baseCost = vendor.rate;
        items.push({ label: '場地租借費', amount: baseCost });
        if (durationHours > 3 && vendor.overtimeRate) {
            const extraHours = Math.ceil(durationHours - 3);
            const fee = extraHours * vendor.overtimeRate;
            baseCost += fee;
            items.push({ label: `超時費 (${extraHours}hr)`, amount: fee });
        }
    } else {
        baseCost = vendor.rateType === 'hourly' 
          ? vendor.rate * durationHours 
          : vendor.rate;
        items.push({ label: vendor.rateType === 'hourly' ? `服務費 (${durationHours.toFixed(1)}hr)` : '服務費用', amount: baseCost });
    }
    total += baseCost;
    
    if (vendor.category !== ServiceCategory.VENUE_RENTAL && request.city && vendor.travelFees[request.city]) {
      const fee = vendor.travelFees[request.city];
      total += fee;
      items.push({ label: `車馬費 (${request.city})`, amount: fee });
    }
    
    return { total, items };
  }

  // 3. Package Based Services (Decorator / Cake / Catering / Host)
  if (vendor.rateType === 'package' && vendor.packages) {
    const pkg = vendor.packages.find(p => p.id === selectedPackageId);
    let pkgPrice = vendor.rate;
    let pkgName = '基本方案';
        
    if (pkg) {
        pkgPrice = pkg.price;
        pkgName = pkg.name;
    } else if (vendor.packages.length > 0) {
         pkgPrice = Math.min(...vendor.packages.map(p => p.price));
         pkgName = '方案起價';
    }

    const isCake = vendor.category === ServiceCategory.CAKE;
    const isHost = vendor.category === ServiceCategory.HOST;
    
    total += pkgPrice;
    items.push({ label: isCake ? `商品金額 (${pkgName})` : (pkgName === '方案起價' ? '方案起價' : `方案金額 (${pkgName})`), amount: pkgPrice });

    // Host Travel Fee Logic (for Package Hosts)
    if (isHost && request.city && vendor.travelFees[request.city]) {
        const fee = vendor.travelFees[request.city];
        total += fee;
        items.push({ label: `車馬費 (${request.city})`, amount: fee });
    }

    // Decorator/Catering/Cake Settings Logic
    const settings = vendor.decoratorSettings;
    if (settings) {
        const deliveryMethod = options?.deliveryMethod || 'pickup';

        // A. Location Fees (Setup vs Delivery vs Pickup)
        if (deliveryMethod !== 'pickup' && request.city) {
            let rule = settings.locationFeeRules.find(r => r.city === request.city && r.district === request.district);
            if (!rule) {
                rule = settings.locationFeeRules.find(r => r.city === request.city && r.district === 'all');
            }

            if (rule) {
                if (deliveryMethod === 'setup') {
                    total += rule.setupFee;
                    items.push({ label: vendor.category === ServiceCategory.CATERING ? '外送含擺盤費' : '專人到府佈置費', amount: rule.setupFee });
                } else if (deliveryMethod === 'delivery') {
                    total += rule.deliveryFee;
                    items.push({ label: '外送費', amount: rule.deliveryFee });
                    
                    if (options?.floor && options.floor !== '1F' && settings.upstairsFee) {
                        total += settings.upstairsFee;
                        items.push({ label: '搬運/上樓費', amount: settings.upstairsFee });
                    }
                }

                if (options?.needTeardown && vendor.category !== ServiceCategory.CAKE) {
                    total += rule.teardownFee;
                    items.push({ label: '撤場費', amount: rule.teardownFee });
                }
            }
        }

        // C. Special Time Surcharge
        const timeCheckStr = options?.setupStartTime || request.startTime;
        const startH = parseInt(timeCheckStr.split(':')[0]);
        if (settings.hourlySurcharges && settings.hourlySurcharges[startH]) {
            const fee = settings.hourlySurcharges[startH];
            total += fee;
            items.push({ label: '特殊時段加成', amount: fee });
        }

        // D. Holiday Surcharge
        let isHoliday = false;
        const mmdd = request.date.substring(5);
        if (settings.holidays?.includes(mmdd)) isHoliday = true;

        if (!isHoliday && settings.lunarHolidays && settings.lunarHolidays.length > 0) {
            const year = parseInt(request.date.substring(0, 4));
            const lunarDates = getHolidayDates(year);
            if (settings.lunarHolidays.includes('CNY') && request.date === lunarDates.cny) isHoliday = true;
            if (settings.lunarHolidays.includes('CNY_EVE') && request.date === lunarDates.cnyEve) isHoliday = true;
            if (settings.lunarHolidays.includes('CHINESE_VALENTINES') && request.date === lunarDates.chineseValentines) isHoliday = true;
        }

        if (isHoliday) {
          const fee = Math.round(pkgPrice * (settings.holidaySurchargePercent / 100));
          total += fee;
          items.push({ label: `特殊節日加成 (${settings.holidaySurchargePercent}%)`, amount: fee });
        }

        // E. Urgent Order Fee
        if (settings.urgentOrderEnabled) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(request.date);
            eventDate.setHours(0, 0, 0, 0);
            
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= 2) {
                let urgentFee = 0;
                if (pkgPrice < 5000) urgentFee = 500;
                else if (pkgPrice <= 10000) urgentFee = 1000;
                else if (pkgPrice <= 20000) urgentFee = 1500;
                else urgentFee = 2000;
                
                total += urgentFee;
                items.push({ label: '急件費', amount: urgentFee });
            }
        }
    }

    return { total, items };
  }

  return { total: vendor.rate, items: [{ label: '基本費用', amount: vendor.rate }] };
};

export const calculateVendorCost = (
    vendor: Vendor, 
    request: UserRequest, 
    defaultDurationHours: number,
    selectedPackageId?: string,
    options?: any
): number => {
    return calculateVendorCostBreakdown(vendor, request, defaultDurationHours, selectedPackageId, options).total;
};
