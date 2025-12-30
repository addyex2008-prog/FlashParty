
import { Vendor, ServiceCategory, EventType, Review, UserRequest, Order, Discount, DeveloperPartner, DevRank, VendorPackage } from '../types';

// 全局模擬訂單資料庫
export const MOCK_ORDERS: Order[] = [];

// 模擬折扣碼資料庫 - 預設為 95 折
export const MOCK_DISCOUNTS: Discount[] = [
  { code: 'EZ95', multiplier: 0.95, expiry: '2026-12-31', used: false },
  { code: '7979', multiplier: 0.8, expiry: '2026-07-07', used: false }
];

// 模擬開發夥伴資料庫
export const MOCK_DEVELOPERS: DeveloperPartner[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const ranks = [DevRank.BRONZE, DevRank.SILVER, DevRank.GOLD, DevRank.DIAMOND, DevRank.METEORITE, DevRank.COSMIC_GEM];
  return {
    id: `dev-${num}`,
    account: `${num}`,
    name: `開發夥伴 ${num} 號`,
    nickname: `拓荒者 ${num} 號`,
    email: `dev${num}@ezparty.com`,
    phone: `0988${String(num).padStart(6, '0')}`,
    address: `台北市信義區開發路 ${num} 號`,
    birthday: `1990-01-${String(num).padStart(2, '0')}`,
    avatarUrl: `https://picsum.photos/id/${num + 100}/200/200`,
    rank: ranks[i % ranks.length],
    referralCode: `${num}${num}${num}${num}`,
    performance: {
      totalVendors: 10 + i * 5,
      monthlyVendors: 2 + i,
      nextRankThreshold: 5,
      monthlyMatchBonus: 1000 * num,
      monthlyDevBonus: 500 * num,
      monthlyReferralBonus: 200 * num
    },
    developedVendors: [
      { vendorId: 'v1', joinDate: '2023-01-15' },
      { vendorId: 'v3', joinDate: '2023-05-20' },
      { vendorId: 'v10', joinDate: '2023-11-08' }
    ]
  };
});

// --- Geographic Data ---
export const TAIWAN_LOCATIONS: Record<string, string[]> = {
  '台北市': ['信義區', '大安區', '中山區', '松山區', '中正區', '內湖區', '南港區', '士林區', '北投區', '文山區', '萬華區', '大同區'],
  '新北市': ['板橋區', '新莊區', '中和區', '永和區', '三重區', '蘆洲區', '新店區', '淡水區', '林口區', '汐止區', '土城區', '樹林區', '鶯歌區', '三峽區', '五股區', '泰山區', '八里區', '深坑區', '瑞芳區', '萬里區', '金山區'],
  '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖嫩區', '七堵區'],
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

const getFirstDayOfNextMonths = (count: number) => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const createDefaultAvailability = () => {
    const dates = getFirstDayOfNextMonths(13);
    const availability: Record<string, string[]> = {};
    dates.forEach(date => {
        availability[date] = [...ALL_HOURS];
    });
    return availability;
};

// 隨機選取一半供應商開啟特定日期與城市的服務
export const randomlyEnableVendors = (date: string, city: string) => {
    const shuffled = [...MOCK_VENDORS].sort(() => 0.5 - Math.random());
    const half = shuffled.slice(0, Math.ceil(MOCK_VENDORS.length / 2));
    
    MOCK_VENDORS.forEach(v => {
        if (half.find(h => h.id === v.id)) {
            v.isPaused = false;
            if (!v.serviceAreas.includes(city)) v.serviceAreas.push(city);
            v.availableHours[date] = [...ALL_HOURS];
        } else {
            v.availableHours[date] = [];
        }
    });
};

export const resetVendorsForTesting = () => {
    MOCK_VENDORS.forEach(vendor => {
        vendor.isPaused = false;
        vendor.serviceAreas = [...ALL_CITIES];
        vendor.availableHours = createDefaultAvailability();
    });
};

export const EVENT_TYPE_RECOMMENDATIONS: Record<EventType, ServiceCategory[]> = {
  [EventType.BIRTHDAY]: [ServiceCategory.VENUE_RENTAL, ServiceCategory.CAKE, ServiceCategory.STATIC_PHOTO, ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DECOR, ServiceCategory.CATERING, ServiceCategory.MAGICIAN, ServiceCategory.BALLOON],
  [EventType.WEDDING]: [ServiceCategory.VENUE_RENTAL, ServiceCategory.HOST, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.STATIC_PHOTO, ServiceCategory.FLORIST, ServiceCategory.DESIGN_PRINT, ServiceCategory.STAGE_HARDWARE, ServiceCategory.BAND, ServiceCategory.PLANNER, ServiceCategory.CATERING],
  [EventType.PROPOSAL]: [ServiceCategory.FLORIST, ServiceCategory.STATIC_PHOTO, ServiceCategory.BAND, ServiceCategory.STAGE_HARDWARE],
  [EventType.YEAR_END_PARTY]: [ServiceCategory.HOST, ServiceCategory.BAND, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.PLANNER, ServiceCategory.CATERING, ServiceCategory.MAGICIAN],
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
  [EventType.HALLOWEEN]: [ServiceCategory.STAGE_HARDWARE, ServiceCategory.ACTOR, ServiceCategory.MAGICIAN],
  [EventType.CHRISTMAS]: [ServiceCategory.STAGE_HARDWARE, ServiceCategory.BAND, ServiceCategory.CATERING, ServiceCategory.MAGICIAN],
  [EventType.RETIREMENT]: [ServiceCategory.HOST, ServiceCategory.STATIC_PHOTO, ServiceCategory.CATERING],
  [EventType.OFFICE_WARMING]: [ServiceCategory.CAKE, ServiceCategory.FLORIST, ServiceCategory.CATERING],
  [EventType.PRESS_CONFERENCE]: [ServiceCategory.HOST, ServiceCategory.STAGE_HARDWARE, ServiceCategory.DYNAMIC_PHOTO, ServiceCategory.DESIGN_PRINT, ServiceCategory.CATERING],
};

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', user: '陳小姐', rating: 5, comment: '非常專業，氣氛帶動得很好！', date: '2023-10-01', images: [] },
  { id: 'r2', user: '林先生', rating: 4, comment: '溝通順利，CP值高。', date: '2023-09-15', images: [] },
  { id: 'r3', user: 'Jessica', rating: 5, comment: '完美的體驗，大力推薦。', date: '2023-11-20', images: [] },
];

const BASE_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: '金牌主持人 Alice',
    category: ServiceCategory.HOST,
    description: '擁有 500 場以上婚禮與尾牙主持經驗，氣氛帶動高手。擅長中英雙語主持，風格大氣端莊或活潑熱鬧皆可駕馭。',
    imageUrl: 'https://picsum.photos/id/1011/200/200',
    portfolio: ['https://picsum.photos/id/1011/400/300', 'https://picsum.photos/id/1027/400/300'],
    portfolioVideos: ['https://www.w3schools.com/html/mov_bbb.mp4'], // Added mock video
    rate: 3000,
    rateType: 'package',
    hostSettings: { baseDuration: 2, overtimeRate: 3000, eventTypeAddons: {} },
    travelFees: { '桃園市': 500, '新竹市': 1000, '台中市': 2500 },
    packages: [
        { id: 'hp_basic', name: '基礎主持方案 (1-1.5hr)', description: '適合小型聚會、流程簡單的活動，輕鬆帶氣氛。包含流程順稿一次。', price: 3000, soldCount: 342, imageUrls: ['https://picsum.photos/id/1011/400/300'], eventTypes: [EventType.BIRTHDAY, EventType.GENDER_REVEAL, EventType.CELEBRATION], includedItems: [{id:'i1', name:'主持人', quantity: 1, imageUrl:'https://picsum.photos/id/1011/200/200'}] },
        { id: 'hp_std', name: '標準主持方案 (2hr)', description: '最熱門方案，適合生日、企業小型活動、一般派對。包含流程規劃建議與彩排。', price: 6000, soldCount: 856, imageUrls: ['https://picsum.photos/id/1027/400/300'], eventTypes: [EventType.YEAR_END_PARTY, EventType.SPRING_WINE, EventType.OPENING], includedItems: [{id:'i1', name:'主持人', quantity: 1, imageUrl:'https://picsum.photos/id/1011/200/200'}, {id:'i2', name:'流程企劃', quantity: 1, imageUrl:'https://picsum.photos/id/1/200/200'}] },
        { id: 'hp_adv', name: '高階主持方案 (2-3hr)', description: '婚禮、尾牙、重要企業形象活動的專業選擇。雙語主持、詳細場控與音樂建議。', price: 12000, soldCount: 120, imageUrls: ['https://picsum.photos/id/342/400/300'], eventTypes: [EventType.WEDDING, EventType.PRESS_CONFERENCE, EventType.YEAR_END_PARTY], includedItems: [{id:'i1', name:'雙語主持人', quantity: 1, imageUrl:'https://picsum.photos/id/1011/200/200'}, {id:'i2', name:'場控小幫手', quantity: 1, imageUrl:'https://picsum.photos/id/5/200/200'}] },
    ],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.9,
    reviewCount: 128,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v_magic_1',
    name: '魔幻大師 Kevin',
    category: ServiceCategory.MAGICIAN,
    description: '近距離魔術、大型幻術表演，各大品牌尾牙指定魔術師。曾獲國際魔術大賽金獎。',
    imageUrl: 'https://picsum.photos/id/653/200/200',
    portfolio: ['https://picsum.photos/id/653/400/300'],
    portfolioVideos: ['https://www.w3schools.com/html/mov_bbb.mp4'], // Added mock video
    rate: 8000,
    rateType: 'fixed',
    travelFees: { '台中市': 1500 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 42,
    reviews: []
  },
  {
    id: 'v3',
    name: '光影魔術師 - 小陳',
    category: ServiceCategory.STATIC_PHOTO,
    description: '專精人像攝影與活動紀錄，提供當日快剪快播。使用全片幅相機與專業燈光設備。',
    imageUrl: 'https://picsum.photos/id/250/200/200',
    portfolio: ['https://picsum.photos/id/250/400/300', 'https://picsum.photos/id/237/400/300', 'https://picsum.photos/id/238/400/300'],
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
    id: 'v10',
    name: '迪爾氣球設計 (D.Design)',
    category: ServiceCategory.DECOR,
    description: '質感氣球佈置、派對主題規劃。為您打造獨一無二的夢幻場景。從小型生日派對到大型企業活動皆可客製。',
    imageUrl: 'https://i.duk.tw/u0BpfL.png', 
    portfolio: ['https://picsum.photos/id/10/300/200', 'https://picsum.photos/id/11/300/200', 'https://picsum.photos/id/12/300/200'],
    portfolioVideos: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    websiteUrl: 'https://www.dear79.shop/',
    rate: 8000, 
    rateType: 'package',
    travelFees: {},
    packages: [
      { 
        id: 'p1', 
        name: '純粹之境生日方案', 
        description: '適合想要打造獨特藝術品味的客戶，獨特的氣球雲團意境\n讓你的空間瞬間變的超夢幻，此方案不適合天花板超過350公分的挑高空間\n雲團氣球的飄浮時效為8小時請留意', 
        price: 27999, 
        soldCount: 69, 
        imageUrls: ['https://duk.tw/DlBRv1.jpg'], 
        eventTypes: [EventType.BIRTHDAY], 
        includedItems: [
            {id:'b1', name:'圓形銀色鏡面立體球空飄', quantity: 7, imageUrl:'https://duk.tw/JNTYjT.jpg'}, 
            {id:'b2', name:'18吋銀色五角星空飄', quantity: 7, imageUrl:'https://i.duk.tw/XG7uiY.jpg'},
            {id:'b3', name:'天花板仿雲團空飄球', quantity: 8, imageUrl:'https://duk.tw/HvUERK.jpg'},
            {id:'b4', name:'精緻立體黑灰雙色大愛心', quantity: 1, imageUrl:'https://duk.tw/BLhdlg.jpg'}
        ] 
      },
      { id: 'p2', name: '奢華求婚佈置 B 方案', description: '包含 MARRY ME 燈飾、鮮花花瓣、電子蠟燭 50 個、氣球束 6 組。營造最浪漫的氛圍。', price: 15800, soldCount: 420, imageUrls: ['https://picsum.photos/id/20/300/200'], eventTypes: [EventType.PROPOSAL], includedItems: [{id:'m1', name:'MARRY ME 燈飾', quantity: 1, imageUrl:'https://picsum.photos/id/20/300/200'}, {id:'m2', name:'電子蠟燭', quantity: 50, imageUrl:'https://picsum.photos/id/30/300/200'}] },
      { id: 'p3', name: '後車廂驚喜佈置', description: '適合告白、週年紀念、生日驚喜。包含燈串、造型氣球、掛旗。', price: 5500, soldCount: 2800, imageUrls: ['https://picsum.photos/id/30/300/200'], eventTypes: [EventType.TRUNK_DECOR, EventType.BIRTHDAY, EventType.ANNIVERSARY], includedItems: [] }
    ],
    decoratorSettings: {
      locationFeeRules: [
          { city: '台北市', district: 'all', minSpend: 5000, setupFee: 2000, teardownFee: 2000, deliveryFee: 500 },
          { city: '新北市', district: 'all', minSpend: 6000, setupFee: 2500, teardownFee: 2500, deliveryFee: 800 },
          { city: '桃園市', district: 'all', minSpend: 10000, setupFee: 4000, teardownFee: 4000, deliveryFee: 1500 }
      ],
      upstairsFee: 500,
      urgentOrderFee: 3000,
      urgentOrderEnabled: true,
      hourlySurcharges: { 22: 2000, 23: 3000, 0: 5000, 1: 5000 },
      specialDateModifiers: [
          { date: '2024-02-14', multiplier: 1.5, note: '西洋情人節' },
          { date: '2024-12-25', multiplier: 1.2, note: '聖誕節' },
          { date: '2024-12-31', multiplier: 1.5, note: '跨年夜' }
      ]
    },
    serviceAreas: [...ALL_CITIES], 
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 188,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'v18',
    name: '五星級外燴服務',
    category: ServiceCategory.CATERING,
    description: '提供精緻自助餐、雞尾酒會小點、茶歇服務。食材新鮮，衛生第一。',
    imageUrl: 'https://picsum.photos/id/429/200/200',
    portfolio: ['https://picsum.photos/id/429/400/300'],
    portfolioVideos: [],
    rate: 15000,
    rateType: 'package',
    decoratorSettings: {
        locationFeeRules: [
            { city: '台北市', district: 'all', minSpend: 10000, setupFee: 2000, teardownFee: 1000, deliveryFee: 800 }
        ],
        upstairsFee: 500, 
        urgentOrderFee: 0,
        hourlySurcharges: {}, 
        urgentOrderEnabled: true,
        specialDateModifiers: []
    },
    packages: [
        { id: 'cat1', name: '精緻茶歇 (50人份)', description: '手工餅乾、小蛋糕、咖啡茶飲。適合會議中場休息。', price: 15000, soldCount: 88, imageUrls: ['https://picsum.photos/id/425/400/300'], eventTypes: [EventType.PRESS_CONFERENCE, EventType.OPENING], includedItems: [] },
        { id: 'cat2', name: '歐式自助餐 (30人份)', description: '冷盤、熱食、主餐、甜點共12道。包含餐具與保溫設備。', price: 28000, soldCount: 45, imageUrls: ['https://picsum.photos/id/429/400/300'], eventTypes: [EventType.WEDDING, EventType.YEAR_END_PARTY, EventType.CELEBRATION], includedItems: [] }
    ],
    travelFees: { '桃園市': 2000 },
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 4.8,
    reviewCount: 56,
    reviews: []
  },
  {
    id: 'v17',
    name: '完美時刻活動統籌',
    category: ServiceCategory.PLANNER,
    description: '專屬活動管家，從主題發想到現場執行，為您打造無憂的完美時刻。',
    imageUrl: 'https://picsum.photos/id/331/200/200',
    portfolio: ['https://picsum.photos/id/331/400/300'],
    portfolioVideos: [],
    rate: 25000,
    rateType: 'fixed',
    travelFees: { '台北市': 0 },
    packages: [],
    serviceAreas: [...ALL_CITIES],
    availableHours: createDefaultAvailability(),
    isPaused: false,
    rating: 5.0,
    reviewCount: 36,
    reviews: []
  }
];

// Helper to generate consistent additional vendors
const generateMockVendors = (): Vendor[] => {
    const categories = Object.values(ServiceCategory);
    const vendors: Vendor[] = [...BASE_VENDORS];
    const TARGET_COUNT = 4; // Target per category (3-5 requested, aiming for 4)

    // Specific names pool for realism
    const NAME_POOL: Record<string, string[]> = {
        [ServiceCategory.VENUE_RENTAL]: ['星光會議中心', '海景度假酒店', '森林系戶外場地', '市中心展演空間', '皇家宴會廳'],
        [ServiceCategory.CAKE]: ['甜心手作烘焙', '夢幻翻糖蛋糕', '天使之翼甜點', '幸福滋味工坊', '法式藍帶甜點'],
        [ServiceCategory.CATERING]: ['主廚私房菜', '饗宴外燴', '健康輕食外送', '派對手指食物', '異國料理Buffet'],
        [ServiceCategory.HOST]: ['熱情阿傑', '知性美女 Sandy', '雙語主持 Mark', '活動帶動跳跳', '氣質名媛 Grace'],
        [ServiceCategory.PHOTOGRAPHER]: ['光影捕捉者', '瞬間永恆攝影', '專業人像阿偉', '自然風小清新', '底片感工作室'],
        [ServiceCategory.BAND]: ['爵士藍調樂團', 'High翻天搖滾團', '清新民謠二重唱', '古典弦樂四重奏', '流行樂隊 Live'],
        [ServiceCategory.DECOR]: ['花樣年華佈置', '現代極簡設計', '復古風情道具', '奢華金場景', '森林系婚禮'],
        [ServiceCategory.FLORIST]: ['愛麗絲花坊', '城市花園', '永生花藝設計', '浪漫滿屋花店'],
        [ServiceCategory.MAGICIAN]: ['魔術師 David', '幻術大師 Leo', '街頭魔術 Sam', '心靈魔術師'],
        [ServiceCategory.SINGER]: ['深情歌手 Joy', '爆發力唱將', '甜美女聲', '抒情王子'],
        [ServiceCategory.DJ]: ['DJ Cool', 'DJ Remix', '派對電音王', 'Lounge Bar DJ'],
        [ServiceCategory.LION_DANCE]: ['震天戰鼓團', '祥獅獻瑞', '龍騰虎躍', '民俗技藝團'],
        [ServiceCategory.BALLOON]: ['歡樂氣球屋', '造型氣球達人', '小丑折氣球', '繽紛氣球館'],
    };

    categories.forEach(cat => {
        const existingCount = vendors.filter(v => v.category === cat).length;
        const needed = Math.max(0, TARGET_COUNT - existingCount);

        for (let i = 0; i < needed; i++) {
            const seed = categories.indexOf(cat) * 100 + i;
            const names = NAME_POOL[cat] || [`專業${cat}服務 A`, `優質${cat}團隊 B`, `精選${cat} C`, `人氣${cat} D`];
            const name = names[i % names.length] || `${cat} 供應商 ${i+1}`;
            
            // Generate basic package to make them usable
            const basePrice = 3000 + (seed % 10) * 1000;
            const mockPackage: VendorPackage = {
                id: `pkg_${seed}`,
                name: `${cat} 標準方案`,
                description: `提供專業的 ${cat} 服務，包含基本設備與人員。`,
                price: basePrice,
                soldCount: 10 + (seed % 200),
                imageUrls: [`https://picsum.photos/seed/${seed + 500}/400/300`],
                eventTypes: [EventType.BIRTHDAY, EventType.WEDDING, EventType.YEAR_END_PARTY], // Broad applicability
                includedItems: []
            };

            vendors.push({
                id: `gen_${cat}_${i}`,
                name: name,
                category: cat,
                description: `我們致力於提供最好的 ${cat} 體驗，擁有豐富的經驗與專業團隊。`,
                imageUrl: `https://picsum.photos/seed/${seed}/200/200`,
                portfolio: [`https://picsum.photos/seed/${seed + 100}/400/300`, `https://picsum.photos/seed/${seed + 101}/400/300`],
                portfolioVideos: [],
                rate: basePrice,
                rateType: (cat === ServiceCategory.DECOR || cat === ServiceCategory.CATERING || cat === ServiceCategory.CAKE) ? 'package' : 'fixed',
                travelFees: { '台北市': 300, '新北市': 500 },
                packages: [mockPackage],
                serviceAreas: [...ALL_CITIES],
                availableHours: createDefaultAvailability(),
                isPaused: false,
                rating: 4.0 + (seed % 10) / 10, // 4.0 - 4.9
                reviewCount: 5 + (seed % 50),
                reviews: []
            });
        }
    });

    return vendors;
};

export const MOCK_VENDORS: Vendor[] = generateMockVendors();

export const isVendorAvailable = (vendor: Vendor, date: string, startHour: number, endHour: number, city: string, isLocationUndecided: boolean): boolean => {
  if (vendor.isPaused) return false;
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

export const calculateVendorCostBreakdown = (
    vendor: Vendor, 
    request: UserRequest, 
    defaultDurationHours: number,
    selectedPackageId?: string,
    options?: any
  ): { total: number; items: CostItem[] } => {
  
  let total = 0;
  const items: CostItem[] = [];
  let durationHours = options?.duration || defaultDurationHours;

  // 1. Host Logic
  if (vendor.category === ServiceCategory.HOST && vendor.hostSettings && vendor.rateType !== 'package') {
      const settings = vendor.hostSettings;
      total += vendor.rate;
      items.push({ label: '基本主持費', amount: vendor.rate });
      if (durationHours > settings.baseDuration) {
          const extraTime = Math.ceil(durationHours - settings.baseDuration);
          const fee = extraTime * settings.overtimeRate;
          total += fee;
          items.push({ label: `超時費 (${extraTime}hr)`, amount: fee });
      }
      if (request.city && vendor.travelFees[request.city]) {
          const fee = vendor.travelFees[request.city];
          total += fee;
          items.push({ label: `車馬費 (${request.city})`, amount: fee });
      }
      return { total, items };
  }

  // 2. Standard Hourly/Fixed Vendors
  if (vendor.rateType !== 'package') {
    let baseCost = vendor.rateType === 'hourly' ? vendor.rate * durationHours : vendor.rate;
    items.push({ label: vendor.rateType === 'hourly' ? `服務費 (${durationHours.toFixed(1)}hr)` : '服務費用', amount: baseCost });
    total += baseCost;
    if (request.city && vendor.travelFees[request.city]) {
      const fee = vendor.travelFees[request.city];
      total += fee;
      items.push({ label: `車馬費 (${request.city})`, amount: fee });
    }
    return { total, items };
  }

  // 3. Package Based Vendors (Decor, Catering, etc.)
  if (vendor.rateType === 'package' && vendor.packages) {
    const pkg = vendor.packages.find(p => p.id === selectedPackageId) || vendor.packages[0];
    let pkgPrice = pkg?.price || vendor.rate;
    let basePkgPrice = pkgPrice;
    
    const settings = vendor.decoratorSettings;
    
    // Apply special date surcharge to base package price (if logic requires) - currently just calculating surcharge separately below
    if (settings && settings.specialDateModifiers) {
        // Compare Month-Day only (recur annually)
        const specialRule = settings.specialDateModifiers.find(r => r.date.slice(5) === request.date.slice(5));
        if (specialRule) {
            // Logic handled in items push below
        }
    }
    
    total += basePkgPrice;
    items.push({ label: `方案金額 (${pkg?.name || '基本'})`, amount: basePkgPrice });

    // Apply special date surcharge item
    if (settings && settings.specialDateModifiers) {
       // Compare Month-Day only (recur annually)
       const specialRule = settings.specialDateModifiers.find(r => r.date.slice(5) === request.date.slice(5));
       if (specialRule) {
           const surcharge = Math.round(basePkgPrice * (specialRule.multiplier - 1));
           total += surcharge;
           items.push({ label: `特殊節日加成 (${specialRule.note || '節日'})`, amount: surcharge });
       }
    }

    // Decorator Specific Logic
    if (vendor.category === ServiceCategory.DECOR && settings) {
        const deliveryMethod = options?.deliveryMethod || 'setup'; // Default to setup if undefined for legacy compatibility, but strictly should come from options
        
        // Delivery / Setup Fee
        if (deliveryMethod === 'pickup') {
            items.push({ label: '自取免運費', amount: 0 });
        } else if (request.city) {
            let rule = settings.locationFeeRules.find(r => r.city === request.city && r.district === request.district) || settings.locationFeeRules.find(r => r.city === request.city && r.district === 'all');
            
            if (rule) {
                if (deliveryMethod === 'setup') {
                    // Min spend check logic is handled in UI, here we just calculate
                    total += rule.setupFee;
                    items.push({ label: '專人佈置費', amount: rule.setupFee });
                } else if (deliveryMethod === 'delivery') {
                    total += rule.deliveryFee;
                    items.push({ label: '外送費', amount: rule.deliveryFee });
                }
                
                // Teardown Fee
                if (options?.needTeardown && deliveryMethod !== 'pickup') {
                    total += rule.teardownFee;
                    items.push({ label: '撤場費用', amount: rule.teardownFee });
                }
            }
        }

        // Upstairs Fee (Only if delivery/setup and explicitly checked)
        if (deliveryMethod === 'delivery' && options?.needUpstairs) {
             total += settings.upstairsFee;
             items.push({ label: '上樓搬運費', amount: settings.upstairsFee });
        }

        // Hourly Surcharge (Late night fee)
        const timeToCheck = options?.pickupTime || request.startTime;
        if (timeToCheck) {
            const hour = parseInt(timeToCheck.split(':')[0]);
            if (settings.hourlySurcharges && settings.hourlySurcharges[hour]) {
                total += settings.hourlySurcharges[hour];
                items.push({ label: '特殊時段加成', amount: settings.hourlySurcharges[hour] });
            }
        }

        // Urgent Order Fee (If < 48 hours)
        if (settings.urgentOrderEnabled) {
            const eventDate = new Date(request.date);
            const today = new Date();
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 2 && diffDays >= 0) {
                total += settings.urgentOrderFee;
                items.push({ label: '急件處理費 (48h內)', amount: settings.urgentOrderFee });
            }
        }

    } else {
        // Fallback for non-decor package vendors (like Catering basic logic)
        if (request.city && vendor.travelFees[request.city]) {
            const fee = vendor.travelFees[request.city];
            total += fee;
            items.push({ label: `車馬費 (${request.city})`, amount: fee });
        }
    }

    return { total, items };
  }

  return { total: vendor.rate, items: [{ label: '基本費用', amount: vendor.rate }] };
};

export const calculateVendorCost = (vendor: Vendor, request: UserRequest, duration: number, pkgId?: string, opt?: any): number => {
    return calculateVendorCostBreakdown(vendor, request, duration, pkgId, opt).total;
};
