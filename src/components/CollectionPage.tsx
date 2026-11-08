import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowUpDown, Check, Eye, Flag, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, formatRupiah } from '../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';

interface CollectionPageProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  onAddToCart,
  onSelectProduct,
  products = PRODUCTS
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);
  const sortContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'Semua Merchandise' },
    { id: 'timepiece', label: 'Helm & Driver Series' },
    { id: 'leather', label: 'Circuit Layouts' },
    { id: 'outerwear', label: 'Pitstop & Tires' }
  ];

  const sortOptions = [
    { id: 'featured', label: 'Pilihan Kurator' },
    { id: 'price-asc', label: 'Harga: Rendah ke Tinggi' },
    { id: 'price-desc', label: 'Harga: Tinggi ke Rendah' },
    { id: 'name', label: 'Nama (A-Z)' }
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortContainerRef.current && !sortContainerRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.materials.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleQuickAdd = (product: Product) => {
    onAddToCart(product);
    setAddedNoticeId(product.id);
    setTimeout(() => setAddedNoticeId(null), 1800);
  };

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2">
            <Flag className="w-3.5 h-3.5" />
            <span>Katalog Keychain & Merchandise</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Koleksi Produk
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 relative">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors duration-200 z-10 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari item, bahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAFAFA] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Custom Modern Drawdown Sorting Menu */}
            <div className="relative shrink-0" ref={sortContainerRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="py-1.5 px-3 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
                style={{ fontWeight: 600 }}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{sortOptions.find(o => o.id === sortBy)?.label || 'Pilihan Kurator'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-52 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl shadow-xl py-1.5 z-30 overflow-hidden font-sans"
                  >
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#E2D8C3]/60 dark:border-neutral-800/80 mb-1">
                      Urutkan Katalog
                    </div>
                    {sortOptions.map((option) => {
                      const isSelected = sortBy === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSortBy(option.id as any);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-xs text-left font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800'
                          }`}
                          style={{ fontWeight: 600 }}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check size={14} className="shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product Cards Grid with Smooth Motion Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + '-' + sortBy + '-' + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-[#FAF6EE] dark:bg-neutral-900 rounded-xl border border-[#E2D8C3] dark:border-neutral-800 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-200"
              >
                <div className="relative aspect-square bg-[#FAF6EE] dark:bg-slate-800 overflow-hidden">
                  <img
                    src={resolveProductImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  <button
                    onClick={() => onSelectProduct(product)}
                    className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white p-2 rounded-lg shadow-sm border border-[#E2D8C3] dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    aria-label="Rincian Produk"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-sans font-semibold mb-1.5" style={{ fontWeight: 600 }}>
                      <span>{product.categoryLabel}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Ready</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-sans text-xs sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                      style={{ fontWeight: 600 }}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-[#E2D8C3] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-semibold" style={{ fontWeight: 600 }}>Harga</span>
                      <span className="font-sans font-semibold text-xs sm:text-base text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white active:scale-98"
                      style={{ fontWeight: 600 }}
                    >
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <p className="text-base font-medium text-slate-900 dark:text-white">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau kategori filter.</p>
          </div>
        )}

      </div>
    </div>
  );
};
