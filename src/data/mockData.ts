import { Product, PortfolioContributor, ChartDataPoint, CityPrayerConfig } from '../types';
import { resolveProductImageUrl } from '../utils/resolveImage';

export const PRODUCTS: Product[] = [
  {
    id: 'f1-kc-01',
    name: 'Hilversen Carbon Helmet F1 Keychain',
    category: 'timepiece', // mapped to Helmets & Driver Merch
    categoryLabel: 'Driver Helmet Series',
    price: 185000,
    description: 'Miniatur helm balap Formula 1 berskala 1:12 terbuat dari resin serat karbon asli dengan visor reflektif bergerak dan pengait stainless steel titanium grade.',
    materials: 'Real 3K Carbon Fiber Shell, Acrylic Visor, Grade 5 Titanium Keyring',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_helmet_1791067184655.jpg'),
    inStock: true,
    featured: true,
    edition: 'Official F1 Merchandise'
  },
  {
    id: 'f1-kc-02',
    name: 'Monaco GP Circuit Layout Keychain',
    category: 'leather', // mapped to Circuit Layouts
    categoryLabel: 'Grand Prix Circuit',
    price: 145000,
    description: 'Gantungan kunci logam aluminium anodized biru elektrik presisi laser-cut berbentuk sirkuit legendaris Circuit de Monaco lengkap dengan ukiran nama tikungan.',
    materials: 'CNC Anodized Aircraft Aluminum, Laser Engraved Track Data',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_track_1791067194914.jpg'),
    inStock: true,
    featured: true,
    edition: 'Collector Series'
  },
  {
    id: 'f1-kc-03',
    name: 'F1 Red Soft Compound Tire Keychain',
    category: 'outerwear', // mapped to Pitstop & Tires
    categoryLabel: 'Pirelli Compound',
    price: 125000,
    description: 'Gantungan kunci ban slick F1 compound Soft strip merah dengan velg alloy miniatur yang dapat berputar nyata. Tekstur karet kompon asli.',
    materials: 'Vulcanized Rubber, Miniature Alloy Wheel Rim, Stainless Chain',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_tire_1791067206215.jpg'),
    inStock: true,
    featured: true,
    edition: 'Pitstop Essential'
  },
  {
    id: 'f1-kc-04',
    name: 'Silverstone Wing Track Keychain',
    category: 'leather',
    categoryLabel: 'Grand Prix Circuit',
    price: 155000,
    description: 'Gantungan kunci sirkuit Silverstone Inggris berpendar biru malam dengan pelapis krome tahan gores dan carabiner racing quick-release.',
    materials: 'Zinc Alloy Chrome Plated, Laser Cut Circuit Outlines',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_track_1791067194914.jpg'),
    inStock: true,
    featured: false,
    edition: 'UK Heritage Run'
  },
  {
    id: 'f1-kc-05',
    name: 'Scuderia Steering Wheel Telemetry Keychain',
    category: 'timepiece',
    categoryLabel: 'Telemetry Steering',
    price: 210000,
    description: 'Miniatur setir kemudi F1 modern dengan tombol push-button mikro, kenop rotari, dan display LCD akrilik. Hadir dalam aksen biru kobalt Hilversen.',
    materials: 'Composite Polymer, Miniature Rotary Knobs, Stainless Key Chain',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_hero_1791067169824.jpg'),
    inStock: true,
    featured: false,
    edition: 'Pro Telemetry Edition'
  },
  {
    id: 'f1-kc-06',
    name: 'Monza Temple of Speed Metal Keychain',
    category: 'leather',
    categoryLabel: 'Grand Prix Circuit',
    price: 145000,
    description: 'Gantungan kunci sirkuit Monza Italia dengan siluet Parabolica dan Variante del Rettifilo. Selesai dengan pelapis matte navy anti karat.',
    materials: 'Laser-Cut Stainless Steel, Matte Blue PVD Coating',
    image: resolveProductImageUrl('/src/assets/images/f1_keychain_track_1791067194914.jpg'),
    inStock: true,
    featured: false,
    edition: 'Special Edition'
  }
];

export const INITIAL_PORTFOLIO_MEMBERS: PortfolioContributor[] = [
  {
    id: 'mem-1',
    name: 'Fauzayyn Rachman',
    role: 'Teman Dekat Kreator',
    avatarBg: '#2563EB',
    iconEmoji: '🌤️',
    balance: 485000000,
    sharePercentage: 32.6,
    lastDeposit: '28 Sep 2026',
    monthlyReturn: 8.4,
    tier: 'Patron',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-101', date: '28 Sep 2026', amount: 35000000, note: 'Setoran Tambahan Tabungan', totalAfter: 485000000 },
      { id: 'dh-102', date: '12 Jun 2026', amount: 50000000, note: 'Titip Simpan Hasil Proyek', totalAfter: 450000000 },
      { id: 'dh-103', date: '04 Jan 2026', amount: 100000000, note: 'Setoran Awal Tahun 2026', totalAfter: 400000000 },
      { id: 'dh-104', date: '10 Jul 2025', amount: 300000000, note: 'Pembukaan Catatan Tabungan', totalAfter: 300000000 }
    ],
    chartHistory: [
      { label: 'Jul 25', fullDate: 'Juli 2025', totalBalance: 300000000, depositAccumulated: 300000000, yieldReturn: 0 },
      { label: 'Jan 26', fullDate: 'Januari 2026', totalBalance: 400000000, depositAccumulated: 400000000, yieldReturn: 0 },
      { label: 'Jun 26', fullDate: 'Juni 2026', totalBalance: 450000000, depositAccumulated: 450000000, yieldReturn: 0 },
      { label: 'Sep 26', fullDate: '28 September 2026', totalBalance: 485000000, depositAccumulated: 485000000, yieldReturn: 0 }
    ]
  },
  {
    id: 'mem-2',
    name: 'Raden Arya W.',
    role: 'Anggota Komunitas',
    avatarBg: '#1D4ED8',
    iconEmoji: '🏎️',
    balance: 340000000,
    sharePercentage: 22.9,
    lastDeposit: '15 Sep 2026',
    monthlyReturn: 7.9,
    tier: 'Patron',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-201', date: '15 Sep 2026', amount: 40000000, note: 'Setoran Kuartal III', totalAfter: 340000000 },
      { id: 'dh-202', date: '08 Mar 2026', amount: 100000000, note: 'Titip Kas Komunitas', totalAfter: 300000000 },
      { id: 'dh-203', date: '18 Nov 2025', amount: 200000000, note: 'Pembukaan Tabungan Arya', totalAfter: 200000000 }
    ],
    chartHistory: [
      { label: 'Nov 25', fullDate: 'November 2025', totalBalance: 200000000, depositAccumulated: 200000000, yieldReturn: 0 },
      { label: 'Mar 26', fullDate: 'Maret 2026', totalBalance: 300000000, depositAccumulated: 300000000, yieldReturn: 0 },
      { label: 'Sep 26', fullDate: 'September 2026', totalBalance: 340000000, depositAccumulated: 340000000, yieldReturn: 0 }
    ]
  },
  {
    id: 'mem-3',
    name: 'Sarah N. Wibowo',
    role: 'Kolektor F1',
    avatarBg: '#3B82F6',
    iconEmoji: '💎',
    balance: 265000000,
    sharePercentage: 17.8,
    lastDeposit: '02 Okt 2026',
    monthlyReturn: 9.1,
    tier: 'Private Collector',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-301', date: '02 Okt 2026', amount: 25000000, note: 'Setoran Awal Oktober', totalAfter: 265000000 },
      { id: 'dh-302', date: '14 Mei 2026', amount: 90000000, note: 'Titip Saldo Merchandise', totalAfter: 240000000 },
      { id: 'dh-303', date: '01 Feb 2026', amount: 150000000, note: 'Pembukaan Tabungan Sarah', totalAfter: 150000000 }
    ],
    chartHistory: [
      { label: 'Feb 26', fullDate: 'Februari 2026', totalBalance: 150000000, depositAccumulated: 150000000, yieldReturn: 0 },
      { label: 'Mei 26', fullDate: 'Mei 2026', totalBalance: 240000000, depositAccumulated: 240000000, yieldReturn: 0 },
      { label: 'Okt 26', fullDate: 'Oktober 2026', totalBalance: 265000000, depositAccumulated: 265000000, yieldReturn: 0 }
    ]
  },
  {
    id: 'mem-4',
    name: 'Dimas Pratama',
    role: 'Teman Dekat Kreator',
    avatarBg: '#60A5FA',
    iconEmoji: '⚡',
    balance: 195000000,
    sharePercentage: 13.1,
    lastDeposit: '22 Agu 2026',
    monthlyReturn: 7.2,
    tier: 'Private Collector',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-401', date: '22 Agu 2026', amount: 45000000, note: 'Setoran Tambahan Dimas', totalAfter: 195000000 },
      { id: 'dh-402', date: '10 Jan 2026', amount: 150000000, note: 'Titip Modal Awal', totalAfter: 150000000 }
    ],
    chartHistory: [
      { label: 'Jan 26', fullDate: 'Januari 2026', totalBalance: 150000000, depositAccumulated: 150000000, yieldReturn: 0 },
      { label: 'Agu 26', fullDate: 'Agustus 2026', totalBalance: 195000000, depositAccumulated: 195000000, yieldReturn: 0 }
    ]
  },
  {
    id: 'mem-5',
    name: 'Elena Kusuma Wardhani',
    role: 'Anggota Komunitas',
    avatarBg: '#1E3A8A',
    iconEmoji: '🌟',
    balance: 125000000,
    sharePercentage: 8.4,
    lastDeposit: '19 Sep 2026',
    monthlyReturn: 8.0,
    tier: 'Atelier Member',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-501', date: '19 Sep 2026', amount: 25000000, note: 'Setoran Rutin September', totalAfter: 125000000 },
      { id: 'dh-502', date: '05 Apr 2026', amount: 100000000, note: 'Pembukaan Tabungan Elena', totalAfter: 100000000 }
    ],
    chartHistory: [
      { label: 'Apr 26', fullDate: 'April 2026', totalBalance: 100000000, depositAccumulated: 100000000, yieldReturn: 0 },
      { label: 'Sep 26', fullDate: 'September 2026', totalBalance: 125000000, depositAccumulated: 125000000, yieldReturn: 0 }
    ]
  },
  {
    id: 'mem-6',
    name: 'Hendra Tanujaya',
    role: 'Mitra Terpercaya',
    avatarBg: '#0F1C3F',
    iconEmoji: '☕',
    balance: 75600000,
    sharePercentage: 5.2,
    lastDeposit: '01 Okt 2026',
    monthlyReturn: 6.8,
    tier: 'Atelier Member',
    status: 'Aktif',
    depositHistory: [
      { id: 'dh-601', date: '01 Okt 2026', amount: 15600000, note: 'Setoran Tambahan Oktober', totalAfter: 75600000 },
      { id: 'dh-602', date: '12 Mei 2026', amount: 60000000, note: 'Pembukaan Tabungan Hendra', totalAfter: 60000000 }
    ],
    chartHistory: [
      { label: 'Mei 26', fullDate: 'Mei 2026', totalBalance: 60000000, depositAccumulated: 60000000, yieldReturn: 0 },
      { label: 'Okt 26', fullDate: 'Oktober 2026', totalBalance: 75600000, depositAccumulated: 75600000, yieldReturn: 0 }
    ]
  }
];

export const PORTFOLIO_HISTORY_DATA: Record<string, ChartDataPoint[]> = {
  '1Y': [
    { label: 'Nov 25', fullDate: 'November 2025', totalBalance: 780000000, depositAccumulated: 720000000, yieldReturn: 60000000 },
    { label: 'Des 25', fullDate: 'Desember 2025', totalBalance: 860000000, depositAccumulated: 780000000, yieldReturn: 80000000 },
    { label: 'Jan 26', fullDate: 'Januari 2026', totalBalance: 935000000, depositAccumulated: 840000000, yieldReturn: 95000000 },
    { label: 'Feb 26', fullDate: 'Februari 2026', totalBalance: 1010000000, depositAccumulated: 900000000, yieldReturn: 110000000 },
    { label: 'Mar 26', fullDate: 'Maret 2026', totalBalance: 1095000000, depositAccumulated: 960000000, yieldReturn: 135000000 },
    { label: 'Apr 26', fullDate: 'April 2026', totalBalance: 1180000000, depositAccumulated: 1020000000, yieldReturn: 160000000 },
    { label: 'Mei 26', fullDate: 'Mei 2026', totalBalance: 1250000000, depositAccumulated: 1070000000, yieldReturn: 180000000 },
    { label: 'Jun 26', fullDate: 'Juni 2026', totalBalance: 1315000000, depositAccumulated: 1120000000, yieldReturn: 195000000 },
    { label: 'Jul 26', fullDate: 'Juli 2026', totalBalance: 1380000000, depositAccumulated: 1165000000, yieldReturn: 215000000 },
    { label: 'Agu 26', fullDate: 'Agustus 2026', totalBalance: 1425000000, depositAccumulated: 1200000000, yieldReturn: 225000000 },
    { label: 'Sep 26', fullDate: 'September 2026', totalBalance: 1468000000, depositAccumulated: 1230000000, yieldReturn: 238000000 },
    { label: 'Okt 26', fullDate: 'Oktober 2026 (Kini)', totalBalance: 1485600000, depositAccumulated: 1242000000, yieldReturn: 243600000 }
  ]
};

export const CITIES: CityPrayerConfig[] = [
  { name: 'DKI Jakarta', province: 'DKI Jakarta', qiblaDegree: 295, lat: -6.2088, lng: 106.8456, timezoneOffset: 7 },
  { name: 'Bandung', province: 'Jawa Barat', qiblaDegree: 295, lat: -6.9175, lng: 107.6191, timezoneOffset: 7 },
  { name: 'Surabaya', province: 'Jawa Timur', qiblaDegree: 294, lat: -7.2575, lng: 112.7521, timezoneOffset: 7 },
  { name: 'Yogyakarta', province: 'D.I. Yogyakarta', qiblaDegree: 294, lat: -7.7956, lng: 110.3695, timezoneOffset: 7 },
  { name: 'Semarang', province: 'Jawa Tengah', qiblaDegree: 294, lat: -6.9667, lng: 110.4167, timezoneOffset: 7 },
  { name: 'Medan', province: 'Sumatera Utara', qiblaDegree: 292, lat: 3.5952, lng: 98.6722, timezoneOffset: 7 },
  { name: 'Makassar', province: 'Sulawesi Selatan', qiblaDegree: 291, lat: -5.1477, lng: 119.4327, timezoneOffset: 8 },
  { name: 'Denpasar', province: 'Bali', qiblaDegree: 293, lat: -8.6705, lng: 115.2126, timezoneOffset: 8 },
  { name: 'Banda Aceh', province: 'Aceh', qiblaDegree: 292, lat: 5.5483, lng: 95.3238, timezoneOffset: 7 },
  { name: 'Balikpapan', province: 'Kalimantan Timur', qiblaDegree: 292, lat: -1.2379, lng: 116.8289, timezoneOffset: 8 }
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}
