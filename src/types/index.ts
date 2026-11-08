export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'timepiece' | 'leather' | 'outerwear' | 'essentials';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  description: string;
  materials: string;
  image: string;
  images?: string[];
  inStock: boolean;
  featured?: boolean;
  edition?: string;
  variants?: ProductVariant[];
  shopeeLink?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface DepositHistoryItem {
  id: string;
  date: string;
  amount: number;
  note: string;
  totalAfter: number;
  type?: 'setoran' | 'pengeluaran';
}

export interface PortfolioContributor {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  iconEmoji?: string;
  balance: number;
  sharePercentage: number;
  lastDeposit: string;
  monthlyReturn: number;
  tier?: 'Patron' | 'Private Collector' | 'Atelier Member' | string;
  status?: 'Aktif' | 'Pending' | 'VIP' | 'Selesai' | string;
  depositHistory?: DepositHistoryItem[];
  chartHistory?: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  fullDate: string;
  totalBalance: number;
  depositAccumulated: number;
  yieldReturn: number;
}

export interface PrayerTimeSchedule {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
}

export interface CityPrayerConfig {
  name: string;
  province: string;
  qiblaDegree: number;
  lat: number;
  lng: number;
  timezoneOffset: number; // UTC+7, UTC+8, etc.
}
