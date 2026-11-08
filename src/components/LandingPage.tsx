import React from 'react';
import { ArrowRight, Flag } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, formatRupiah } from '../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';
import { StoneSlabsHero3D } from './StoneSlabsHero3D';

interface LandingPageProps {
  onNavigateTab: (tab: 'landing' | 'collection' | 'personal' | 'jadwal-sholat' | 'about') => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
  heroTitle?: string;
  heroSubtitle?: string;
  heroSuffix?: string;
  heroDescription?: string;
  heroCtaText?: string;
  heroImageUrl?: string;
  isDarkMode?: boolean;
  ecosystemPartners?: Array<{ name: string; badge?: string; logo?: string; displayMode?: 'logo_and_text' | 'logo_only' }>;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateTab,
  onAddToCart,
  onSelectProduct,
  products = PRODUCTS,
  heroTitle = 'Simbol Kecepatan',
  heroSubtitle = 'Dalam Genggaman',
  heroSuffix = 'Jemari Anda.',
  heroDescription = 'Koleksi aksesoris, keychain balap, dan rilisan kreatif edisi terbatas yang dirancang dengan presisi titanium dan material serat karbon.',
  heroCtaText = 'Jelajahi Koleksi Merchandise',
  heroImageUrl,
  isDarkMode = false,
  ecosystemPartners = [
    { name: 'Unakara', badge: 'Creative Hub' },
    { name: 'LifGrow', badge: 'Performance Tech' },
    { name: 'Laforia', badge: 'Luxury Atelier' },
    { name: 'Stant Capital', badge: 'Motorsport Venture' }
  ]
}) => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FAF7F0] dark:bg-black border-b border-[#EAE3D2] dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: F1 Merchandise Catchy Typography */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white font-normal leading-[1.12] tracking-tight">
                {heroTitle} <span className="font-serif italic font-extrabold text-blue-600 dark:text-blue-400" style={{ fontWeight: 800 }}>{heroSubtitle}</span> {heroSuffix}
              </h1>

              {heroDescription && (
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                  {heroDescription}
                </p>
              )}

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigateTab('collection')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{heroCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Floating 3D Stacked Slabs (100% Vector Transparent, No Box) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <StoneSlabsHero3D heroImageUrl={heroImageUrl} />
            </div>

          </div>
        </div>
      </section>

      {/* Featured Keychain Collection Section */}
      <section className="py-20 bg-[#FAF7F0] dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                Koleksi Item Favorit
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('collection')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Semua Keychain F1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-[#FFFDF9] dark:bg-neutral-900 border border-[#EAE3D2] dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Product Image Frame (1:1 Square) */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-square bg-[#F2EDE1] dark:bg-slate-800 overflow-hidden cursor-pointer"
                >
                  <img
                    src={resolveProductImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Content Box */}
                <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1 font-sans" style={{ fontWeight: 600 }}>
                      {product.categoryLabel}
                    </div>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-sans text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                      style={{ fontWeight: 600 }}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-[#EAE3D2] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-sans font-semibold text-xs sm:text-base text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>
                      {formatRupiah(product.price)}
                    </span>
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-sans font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer active:scale-98 text-center"
                      style={{ fontWeight: 600 }}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trusted by the Ecosystem Section (Dipercaya oleh Ekosistem) */}
          <div className="mt-20 pt-12 border-t border-[#EAE3D2] dark:border-neutral-800">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 dark:text-white tracking-tight" style={{ fontWeight: 600 }}>
                Dipercaya oleh Ekosistem
              </h3>
            </div>

            {/* Continuous Looping Marquee Animation */}
            <div className="relative overflow-hidden w-full py-4">
              {/* Left & Right Subtle Fade Overlays with stacked transition-opacity to bypass browser gradient transition limits */}
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none">
                {/* Light Mask */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(243, 237, 224, 1) 0%, rgba(243, 237, 224, 0.8) 40%, rgba(243, 237, 224, 0) 100%)',
                    opacity: isDarkMode ? 0 : 1,
                    transition: 'opacity 250ms ease-out'
                  }}
                />
                {/* Dark Mask */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0) 100%)',
                    opacity: isDarkMode ? 1 : 0,
                    transition: 'opacity 250ms ease-out'
                  }}
                />
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none">
                {/* Light Mask */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to left, rgba(243, 237, 224, 1) 0%, rgba(243, 237, 224, 0.8) 40%, rgba(243, 237, 224, 0) 100%)',
                    opacity: isDarkMode ? 0 : 1,
                    transition: 'opacity 250ms ease-out'
                  }}
                />
                {/* Dark Mask */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to left, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0) 100%)',
                    opacity: isDarkMode ? 1 : 0,
                    transition: 'opacity 250ms ease-out'
                  }}
                />
              </div>

              <div className="animate-marquee flex items-center gap-10 sm:gap-16">
                {/* Looping partners seamlessly */}
                {ecosystemPartners.concat(ecosystemPartners).concat(ecosystemPartners).map((item, idx) => {
                  const isLogoOnly = item.displayMode === 'logo_only' && item.logo;
                  return (
                    <div
                      key={`brand-set-${idx}`}
                      className="flex items-center gap-3 shrink-0"
                    >
                      {item.logo && (
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="h-8 w-auto object-contain max-w-[130px] rounded-sm bg-transparent"
                        />
                      )}

                      {!isLogoOnly && (
                        <>
                          <span className="text-lg sm:text-xl font-sans font-semibold text-slate-800 dark:text-slate-100 tracking-tight transition-colors whitespace-nowrap" style={{ fontWeight: 600 }}>
                            {item.name}
                          </span>
                          {item.badge && item.badge.trim() !== '' && (
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F3EDE0] dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
