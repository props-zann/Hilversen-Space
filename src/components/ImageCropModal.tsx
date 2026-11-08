import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, Crop } from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: number; // 1 for 1:1 square
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Reset position and zoom on image change
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [imageSrc]);

  if (!imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
  };

  const handleCropAndSave = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const size = 600; // Output 600x600 px high quality
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas to preserve transparency (PNG)
    ctx.clearRect(0, 0, size, size);

    // Calculate source and destination draw bounds
    const containerSize = 300; // Size of UI viewport box
    const scaleFactor = size / containerSize;

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(position.x * scaleFactor / zoom, position.y * scaleFactor / zoom);

    // Draw image centered
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = size;
    let drawH = size;
    if (imgAspect > 1) {
      drawH = size / imgAspect;
    } else {
      drawW = size * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/png');
    onCropComplete(croppedDataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Crop Foto Produk</h3>
              <p className="text-[11px] text-slate-400">Atur posisi & rasio foto 1:1 square</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Box (300x300 Square) with Transparent PNG Checkerboard pattern */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/80 cursor-grab active:cursor-grabbing flex items-center justify-center select-none shadow-inner [background-image:linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] bg-slate-900"
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source for Crop"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className="max-w-none max-h-none w-full h-full object-contain pointer-events-none origin-center"
            crossOrigin="anonymous"
          />

          {/* Grid Overlay Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-white/10" />
            <div className="border-r border-white/10" />
            <div />
          </div>

          <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 text-white/90 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
            <Move size={10} /> Geser untuk posisi
          </span>
        </div>

        {/* Controls: Zoom slider & reset */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <ZoomIn size={16} className="text-slate-400 shrink-0" />
            
            <button
              onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
              className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleCropAndSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} />
            <span>Crop & Simpan Foto</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
