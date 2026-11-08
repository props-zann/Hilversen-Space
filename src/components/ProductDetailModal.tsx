import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, Plus, Minus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Dynamic zoom interactive state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const touchStartScale = useRef(1);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  // Zoom Controllers
  const zoomIn = () => {
    setScale(prev => Math.min(4, prev + 0.3));
  };

  const zoomOut = () => {
    setScale(prev => {
      const next = Math.max(1, prev - 0.3);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel scroll zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.15;
    setScale(prev => {
      let next = prev + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
      next = Math.max(1, Math.min(4, next));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse Drag / Panning handler
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Gestures (Pinch to zoom + drag pan)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Initialize pinch tracking
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartScale.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single finger dragging
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDist.current;
      let nextScale = touchStartScale.current * ratio;
      nextScale = Math.max(1, Math.min(4, nextScale));
      setScale(nextScale);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 230 }}
        className="bg-white dark:bg-[#131C31] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col md:flex-row max-h-[90vh]"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white/95 dark:bg-slate-900/95 shadow-sm rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          aria-label="Tutup Detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Frame - 1:1 Square, Uncropped, and Zoomable */}
        <div 
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="md:w-1/2 aspect-square bg-[#FBF9F5] dark:bg-slate-950 flex items-center justify-center p-4 relative border-r border-slate-100 dark:border-slate-800 overflow-hidden select-none cursor-grab active:cursor-grabbing"
        >
          <img
            src={resolveProductImageUrl(product.image)}
            alt={product.name}
            onError={handleImageError}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pointerEvents: scale > 1 ? 'none' : 'auto'
            }}
            className="w-full h-full object-contain max-h-[380px] md:max-h-none rounded-xl origin-center"
            referrerPolicy="no-referrer"
          />

          {/* Interactive Floating Zoom Guidance & Controls */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
            {/* Gesture Helper Text badge */}
            <span className="px-2 py-1 text-[9px] font-medium bg-slate-900/80 dark:bg-slate-900/90 text-white rounded-md tracking-wider backdrop-blur-xs transition-opacity duration-300">
              {scale > 1 ? 'Geser gambar untuk navigasi' : 'Scroll / pinch untuk zoom'}
            </span>

            {/* Float Controller Buttons */}
            <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md pointer-events-auto">
              <button
                type="button"
                onClick={zoomIn}
                className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={zoomOut}
                className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              {scale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Purchasing Module */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-sans font-semibold mb-2" style={{ fontWeight: 600 }}>
              <span className="uppercase tracking-wider">{product.categoryLabel}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-emerald-600 dark:text-emerald-400">Stok Ready</span>
            </div>

            <h2 className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-semibold leading-tight mb-3" style={{ fontWeight: 600 }}>
              {product.name}
            </h2>

            <div className="text-2xl font-sans font-semibold text-slate-900 dark:text-white tabular-nums mb-4" style={{ fontWeight: 600 }}>
              {formatRupiah(product.price)}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
              {product.description}
            </p>
          </div>

          <div>
            {/* Purchase CTA via Direct Shopee or WhatsApp / Order */}
            <a
              href={product.shopeeLink ? product.shopeeLink : `https://wa.me/6289675916774?text=${encodeURIComponent(`Halo Hilversen, saya ingin memesan: ${product.name} - Total: ${formatRupiah(product.price)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white active:scale-98"
              style={{ fontWeight: 600 }}
            >
              <span>{product.shopeeLink ? `Beli di Shopee — ${formatRupiah(product.price)}` : `Pesan Sekarang — ${formatRupiah(product.price)}`}</span>
            </a>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};
