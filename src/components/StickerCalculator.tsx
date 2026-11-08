import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  RotateCw, 
  Sparkles, 
  Layers, 
  Save, 
  Plus, 
  Copy, 
  Check, 
  FileText, 
  Percent, 
  HelpCircle, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  Package,
  Scissors,
  Truck,
  Box,
  Coins,
  Grid3X3,
  Maximize2
} from 'lucide-react';

interface StickerCalculatorProps {
  onSaveProduct?: (product: { id: string; name: string; price: number }) => void;
  onCreateInvoice?: (item: { description: string; qty: number; unitPrice: number; total: number }) => void;
  isDark: boolean;
  isNotionMode?: boolean;
  formatCurrency: (amount: number) => string;
  showToast?: (message: string) => void;
}

export interface PlacedSticker {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isRotated: boolean;
  section: 'main' | 'bottom' | 'side';
}

interface LayoutEvaluation {
  id: string;
  name: string;
  totalPcs: number;
  isHybrid: boolean;
  cutPattern: 'horizontal' | 'vertical' | 'pure';
  mainOrientation: 'normal' | 'rotated';
  mainGrid: { cols: number; rows: number; w: number; h: number; pcs: number; isRotated: boolean; usedW: number; usedH: number };
  bottomGrid: { cols: number; rows: number; w: number; h: number; pcs: number; isRotated: boolean };
  sideGrid: { cols: number; rows: number; w: number; h: number; pcs: number; isRotated: boolean };
  rects: PlacedSticker[];
  description: string;
}

export const StickerCalculator: React.FC<StickerCalculatorProps> = ({
  onSaveProduct,
  onCreateInvoice,
  isDark,
  isNotionMode = false,
  formatCurrency,
  showToast
}) => {
  // --- STATE PARAMETERS ---
  // Sticker Dimensions (cm)
  const [stickerWidth, setStickerWidth] = useState<number>(7);
  const [stickerHeight, setStickerHeight] = useState<number>(12);
  const [gapMm, setGapMm] = useState<number>(0); // Gap / bleeding between stickers in mm

  // Sheet Dimensions (cm)
  const [sheetWidth, setSheetWidth] = useState<number>(30); // e.g. 30 cm
  const [sheetHeight, setSheetHeight] = useState<number>(45); // e.g. 45 cm
  const [sheetName, setSheetName] = useState<string>('A3+ Efektif (30x45)');

  // Costs & Margins
  const [materialCostSheet, setMaterialCostSheet] = useState<number>(10000); // Biaya bahan per lembar A3
  const [cuttingCostSheet, setCuttingCostSheet] = useState<number>(5000); // Biaya cutting/effort per lembar
  const [operationalCost, setOperationalCost] = useState<number>(0); // Biaya operasional
  const [targetSheets, setTargetSheets] = useState<number>(1); // Jumlah lembar cetak
  const [targetMargin, setTargetMargin] = useState<number>(200); // Margin % default 200%
  const [lastActiveInput, setLastActiveInput] = useState<'percentage' | 'nominal'>('percentage');
  const [nominalProfitInput, setNominalProfitInput] = useState<number>(30000); // Target profit nominal Rp / lembar

  // Custom sticker name for saving
  const [customProductName, setCustomProductName] = useState<string>('');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);
  const [selectedPackaging, setSelectedPackaging] = useState<'pcs' | 'sheet'>('pcs');
  const [customPriceOverride, setCustomPriceOverride] = useState<string>('');

  // --- CALCULATION LOGIC (GUILLOTINE HYBRID PACKING) ---
  const calculation = useMemo(() => {
    const sW = Math.max(0.1, Number(stickerWidth) || 0.1);
    const sH = Math.max(0.1, Number(stickerHeight) || 0.1);
    const gCm = Math.max(0, (Number(gapMm) || 0) / 10); // convert mm to cm

    const shW = Math.max(1, Number(sheetWidth) || 1);
    const shH = Math.max(1, Number(sheetHeight) || 1);

    const effAreaW = shW + gCm;
    const effAreaH = shH + gCm;

    // Helper: Evaluator for Pure Uniform Grid
    const evaluatePure = (
      id: string,
      name: string,
      itemW: number,
      itemH: number,
      isRot: boolean
    ): LayoutEvaluation => {
      const stepW = itemW + gCm;
      const stepH = itemH + gCm;
      const cols = Math.floor(effAreaW / stepW);
      const rows = Math.floor(effAreaH / stepH);
      const pcs = cols * rows;
      const rects: PlacedSticker[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({
            id: `pure-${r}-${c}`,
            x: c * stepW,
            y: r * stepH,
            w: itemW,
            h: itemH,
            isRotated: isRot,
            section: 'main'
          });
        }
      }

      return {
        id,
        name,
        totalPcs: pcs,
        isHybrid: false,
        cutPattern: 'pure',
        mainOrientation: isRot ? 'rotated' : 'normal',
        mainGrid: { cols, rows, w: itemW, h: itemH, pcs, isRotated: isRot, usedW: cols * stepW, usedH: rows * stepH },
        bottomGrid: { cols: 0, rows: 0, w: 0, h: 0, pcs: 0, isRotated: !isRot },
        sideGrid: { cols: 0, rows: 0, w: 0, h: 0, pcs: 0, isRotated: !isRot },
        rects,
        description: `${cols} kol × ${rows} baris (${pcs} pcs)`
      };
    };

    // Helper: Evaluator for Guillotine Hybrid Packing (Horizontal Cut)
    const evaluateHorizontalCut = (
      id: string,
      name: string,
      mainItemW: number,
      mainItemH: number,
      isMainRot: boolean
    ): LayoutEvaluation => {
      const mainStepW = mainItemW + gCm;
      const mainStepH = mainItemH + gCm;
      const rotItemW = mainItemH;
      const rotItemH = mainItemW;
      const rotStepW = rotItemW + gCm;
      const rotStepH = rotItemH + gCm;

      // 1. Main Grid
      const cols = Math.floor(effAreaW / mainStepW);
      const rows = Math.floor(effAreaH / mainStepH);
      const mainPcs = cols * rows;
      const usedW = cols * mainStepW;
      const usedH = rows * mainStepH;

      const rects: PlacedSticker[] = [];

      // Place Main Grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({
            id: `main-${r}-${c}`,
            x: c * mainStepW,
            y: r * mainStepH,
            w: mainItemW,
            h: mainItemH,
            isRotated: isMainRot,
            section: 'main'
          });
        }
      }

      // 2. Bottom Remainder Area: Width = effAreaW, Height = effAreaH - usedH
      const remBottomH = Math.max(0, effAreaH - usedH);
      const bottomCols = Math.floor(effAreaW / rotStepW);
      const bottomRows = Math.floor(remBottomH / rotStepH);
      const bottomPcs = bottomCols * bottomRows;

      for (let r = 0; r < bottomRows; r++) {
        for (let c = 0; c < bottomCols; c++) {
          rects.push({
            id: `bottom-${r}-${c}`,
            x: c * rotStepW,
            y: usedH + r * rotStepH,
            w: rotItemW,
            h: rotItemH,
            isRotated: !isMainRot,
            section: 'bottom'
          });
        }
      }

      // 3. Side Remainder Area: Width = effAreaW - usedW, Height = usedH
      const remSideW = Math.max(0, effAreaW - usedW);
      const sideCols = Math.floor(remSideW / rotStepW);
      const sideRows = Math.floor(usedH / rotStepH);
      const sidePcs = sideCols * sideRows;

      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          rects.push({
            id: `side-${r}-${c}`,
            x: usedW + c * rotStepW,
            y: r * rotStepH,
            w: rotItemW,
            h: rotItemH,
            isRotated: !isMainRot,
            section: 'side'
          });
        }
      }

      const totalPcs = mainPcs + bottomPcs + sidePcs;
      const isHybrid = bottomPcs > 0 || sidePcs > 0;

      let desc = `${mainPcs} pcs Utama`;
      if (bottomPcs > 0) desc += ` + ${bottomPcs} pcs Rotasi Bawah`;
      if (sidePcs > 0) desc += ` + ${sidePcs} pcs Rotasi Samping`;

      return {
        id,
        name,
        totalPcs,
        isHybrid,
        cutPattern: 'horizontal',
        mainOrientation: isMainRot ? 'rotated' : 'normal',
        mainGrid: { cols, rows, w: mainItemW, h: mainItemH, pcs: mainPcs, isRotated: isMainRot, usedW, usedH },
        bottomGrid: { cols: bottomCols, rows: bottomRows, w: rotItemW, h: rotItemH, pcs: bottomPcs, isRotated: !isMainRot },
        sideGrid: { cols: sideCols, rows: sideRows, w: rotItemW, h: rotItemH, pcs: sidePcs, isRotated: !isMainRot },
        rects,
        description: desc
      };
    };

    // Helper: Evaluator for Guillotine Hybrid Packing (Vertical Cut)
    const evaluateVerticalCut = (
      id: string,
      name: string,
      mainItemW: number,
      mainItemH: number,
      isMainRot: boolean
    ): LayoutEvaluation => {
      const mainStepW = mainItemW + gCm;
      const mainStepH = mainItemH + gCm;
      const rotItemW = mainItemH;
      const rotItemH = mainItemW;
      const rotStepW = rotItemW + gCm;
      const rotStepH = rotItemH + gCm;

      // 1. Main Grid
      const cols = Math.floor(effAreaW / mainStepW);
      const rows = Math.floor(effAreaH / mainStepH);
      const mainPcs = cols * rows;
      const usedW = cols * mainStepW;
      const usedH = rows * mainStepH;

      const rects: PlacedSticker[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({
            id: `v-main-${r}-${c}`,
            x: c * mainStepW,
            y: r * mainStepH,
            w: mainItemW,
            h: mainItemH,
            isRotated: isMainRot,
            section: 'main'
          });
        }
      }

      // 2. Side Remainder Area (Full Height): Width = effAreaW - usedW, Height = effAreaH
      const remSideW = Math.max(0, effAreaW - usedW);
      const sideCols = Math.floor(remSideW / rotStepW);
      const sideRows = Math.floor(effAreaH / rotStepH);
      const sidePcs = sideCols * sideRows;

      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          rects.push({
            id: `v-side-${r}-${c}`,
            x: usedW + c * rotStepW,
            y: r * rotStepH,
            w: rotItemW,
            h: rotItemH,
            isRotated: !isMainRot,
            section: 'side'
          });
        }
      }

      // 3. Bottom Remainder Area (Under Main only): Width = usedW, Height = effAreaH - usedH
      const remBottomH = Math.max(0, effAreaH - usedH);
      const bottomCols = Math.floor(usedW / rotStepW);
      const bottomRows = Math.floor(remBottomH / rotStepH);
      const bottomPcs = bottomCols * bottomRows;

      for (let r = 0; r < bottomRows; r++) {
        for (let c = 0; c < bottomCols; c++) {
          rects.push({
            id: `v-bottom-${r}-${c}`,
            x: c * rotStepW,
            y: usedH + r * rotStepH,
            w: rotItemW,
            h: rotItemH,
            isRotated: !isMainRot,
            section: 'bottom'
          });
        }
      }

      const totalPcs = mainPcs + bottomPcs + sidePcs;
      const isHybrid = bottomPcs > 0 || sidePcs > 0;

      let desc = `${mainPcs} pcs Utama`;
      if (sidePcs > 0) desc += ` + ${sidePcs} pcs Rotasi Samping`;
      if (bottomPcs > 0) desc += ` + ${bottomPcs} pcs Rotasi Bawah`;

      return {
        id,
        name,
        totalPcs,
        isHybrid,
        cutPattern: 'vertical',
        mainOrientation: isMainRot ? 'rotated' : 'normal',
        mainGrid: { cols, rows, w: mainItemW, h: mainItemH, pcs: mainPcs, isRotated: isMainRot, usedW, usedH },
        bottomGrid: { cols: bottomCols, rows: bottomRows, w: rotItemW, h: rotItemH, pcs: bottomPcs, isRotated: !isMainRot },
        sideGrid: { cols: sideCols, rows: sideRows, w: rotItemW, h: rotItemH, pcs: sidePcs, isRotated: !isMainRot },
        rects,
        description: desc
      };
    };

    // Calculate all options
    const optPureNormal = evaluatePure('pure_normal', 'Seragam Normal (Tegak)', sW, sH, false);
    const optPureRotated = evaluatePure('pure_rotated', 'Seragam Rotasi (Tidur)', sH, sW, true);
    const maxPurePcs = Math.max(optPureNormal.totalPcs, optPureRotated.totalPcs);

    const optHNormal = evaluateHorizontalCut('hybrid_h_normal', 'Hybrid Tegak Utama (Potong Horisontal)', sW, sH, false);
    const optHRotated = evaluateHorizontalCut('hybrid_h_rotated', 'Hybrid Tidur Utama (Potong Horisontal)', sH, sW, true);
    const optVNormal = evaluateVerticalCut('hybrid_v_normal', 'Hybrid Tegak Utama (Potong Vertikal)', sW, sH, false);
    const optVRotated = evaluateVerticalCut('hybrid_v_rotated', 'Hybrid Tidur Utama (Potong Vertikal)', sH, sW, true);

    const allHybridOptions = [optHNormal, optHRotated, optVNormal, optVRotated];
    allHybridOptions.sort((a, b) => b.totalPcs - a.totalPcs);

    const bestHybrid = allHybridOptions[0];

    // Determine chosen evaluation based on packingMode
    // Automatically select the optimal packing layout with maximum yield
    const chosen: LayoutEvaluation = bestHybrid.totalPcs >= maxPurePcs 
      ? bestHybrid 
      : (optPureNormal.totalPcs >= optPureRotated.totalPcs ? optPureNormal : optPureRotated);

    const totalPcsPerSheet = chosen.totalPcs;
    const gainVsPure = Math.max(0, totalPcsPerSheet - maxPurePcs);

    // Area calculations
    const sheetArea = shW * shH;
    const usedStickerArea = totalPcsPerSheet * (sW * sH);
    const areaEfficiency = sheetArea > 0 ? Math.min(100, (usedStickerArea / sheetArea) * 100) : 0;
    const wasteArea = Math.max(0, sheetArea - usedStickerArea);
    const wastePercent = Math.max(0, 100 - areaEfficiency);

    // Cost Breakdown
    const numSheets = Math.max(1, Number(targetSheets) || 1);
    const totalMaterialCost = (Number(materialCostSheet) || 0) * numSheets;
    const totalCuttingCost = (Number(cuttingCostSheet) || 0) * numSheets;
    const totalOpCost = Number(operationalCost) || 0;
    const totalCostOrder = totalMaterialCost + totalCuttingCost + totalOpCost;

    const totalPcsOrder = Math.max(1, totalPcsPerSheet * numSheets);
    const hppPerPcs = totalCostOrder / totalPcsOrder;
    const hppPerSheet = totalCostOrder / numSheets;

    // Selling Price & Margin
    const margin = Number(targetMargin) || 0;
    const recommendedPricePerPcs = Math.round(hppPerPcs * (1 + margin / 100));
    const recommendedPricePerSheet = recommendedPricePerPcs * totalPcsPerSheet;

    const totalRevenueSheet = recommendedPricePerSheet;
    const profitPerSheet = Math.round(totalRevenueSheet - hppPerSheet);
    const totalProfitOrder = profitPerSheet * numSheets;
    const totalOmzetOrder = totalRevenueSheet * numSheets;

    return {
      sW,
      sH,
      gCm,
      shW,
      shH,
      optPureNormal,
      optPureRotated,
      maxPurePcs,
      bestHybrid,
      chosen,
      totalPcsPerSheet,
      gainVsPure,
      isHybridActive: chosen.isHybrid,
      rects: chosen.rects,
      sheetArea,
      usedStickerArea,
      areaEfficiency,
      wasteArea,
      wastePercent,
      hppPerPcs: Math.round(hppPerPcs),
      hppPerSheet: Math.round(hppPerSheet),
      recommendedPricePerPcs,
      recommendedPricePerSheet,
      totalRevenueSheet,
      profitPerSheet,
      totalProfitOrder,
      totalOmzetOrder,
      totalPcsOrder,
      modalSheet: Number(materialCostSheet) + Number(cuttingCostSheet)
    };
  }, [
    stickerWidth,
    stickerHeight,
    gapMm,
    sheetWidth,
    sheetHeight,
    materialCostSheet,
    cuttingCostSheet,
    operationalCost,
    targetSheets,
    targetMargin
  ]);

  // Quick preset sizes
  const STICKER_PRESETS = [
    { label: '3 × 3 cm', w: 3, h: 3 },
    { label: '4 × 4 cm', w: 4, h: 4 },
    { label: '5 × 5 cm', w: 5, h: 5 },
    { label: '6 × 6 cm', w: 6, h: 6 },
    { label: '7 × 7 cm', w: 7, h: 7 },
    { label: '7 × 12 cm', w: 7, h: 12 },
    { label: '8 × 5 cm', w: 8, h: 5 },
    { label: '9 × 5.4 cm (Kartu)', w: 9, h: 5.4 },
    { label: '10 × 10 cm', w: 10, h: 10 }
  ];

  const SHEET_PRESETS = [
    { name: 'A3+ Efektif (30x45)', w: 30, h: 45 },
    { name: 'A3+ Standar (31x47)', w: 31, h: 47 },
    { name: 'A3 Standar (29.7x42)', w: 29.7, h: 42 },
    { name: 'A4 Standar (20x29)', w: 20, h: 29 }
  ];

  // Handle Save to Master Produk
  const handleSaveToCatalog = () => {
    const finalPrice = customPriceOverride ? parseFloat(customPriceOverride) : (
      selectedPackaging === 'sheet' ? calculation.recommendedPricePerSheet : calculation.recommendedPricePerPcs
    );

    const defaultName = customProductName.trim() || `Stiker Custom ${stickerWidth}x${stickerHeight}cm (${calculation.totalPcsPerSheet} pcs/lembar)`;
    const newProduct = {
      id: `PRD-STK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: defaultName,
      price: finalPrice || calculation.recommendedPricePerPcs
    };

    if (onSaveProduct) {
      onSaveProduct(newProduct);
      if (showToast) showToast(`Produk "${newProduct.name}" berhasil disimpan ke Master Produk!`);
    }
  };

  // Handle create direct invoice
  const handleDirectInvoice = () => {
    const finalPrice = customPriceOverride ? parseFloat(customPriceOverride) : (
      selectedPackaging === 'sheet' ? calculation.recommendedPricePerSheet : calculation.recommendedPricePerPcs
    );
    const defaultName = customProductName.trim() || `Cetak Stiker ${stickerWidth}x${stickerHeight}cm (${calculation.totalPcsPerSheet} pcs/lembar)`;
    
    if (onCreateInvoice) {
      onCreateInvoice({
        description: defaultName,
        qty: selectedPackaging === 'sheet' ? targetSheets : (targetSheets * calculation.totalPcsPerSheet),
        unitPrice: finalPrice,
        total: (selectedPackaging === 'sheet' ? targetSheets : (targetSheets * calculation.totalPcsPerSheet)) * finalPrice
      });
      if (showToast) showToast(`Berhasil menambahkan stiker ke draft Invoice.`);
    }
  };

  // Handle copy quotation summary
  const handleCopyQuote = () => {
    const quoteText = `*ESTIMASI CETAK & POTONG STIKER*
📐 Ukuran Stiker: ${stickerWidth} x ${stickerHeight} cm (Gap: ${gapMm} mm)
📄 Bahan / Lembar: ${sheetName} (${sheetWidth} x ${sheetHeight} cm)
📦 Hasil per Lembar: ${calculation.totalPcsPerSheet} pcs ${calculation.isHybridActive ? `(Hybrid: ${calculation.chosen.description})` : `(Grid: ${calculation.chosen.description})`}
💡 Efisiensi Area: ${calculation.areaEfficiency.toFixed(1)}% (Waste: ${calculation.wastePercent.toFixed(1)}%)

💰 *Rincian Harga Jual:*
• HPP Modal: ${formatCurrency(calculation.hppPerPcs)} / pcs
• Rekomendasi Jual: ${formatCurrency(calculation.recommendedPricePerPcs)} / pcs
• Paket per Lembar A3 (isi ${calculation.totalPcsPerSheet} pcs): ${formatCurrency(calculation.recommendedPricePerSheet)}
• Target Margin: ${targetMargin}%`;

    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    if (showToast) showToast('Rincian kalkulasi berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  // Theme Helpers
  const cardBg = isNotionMode 
    ? 'bg-white border-2 border-black rounded-none shadow-none text-black' 
    : (isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900');
  
  const inputClass = isNotionMode 
    ? 'bg-white border-2 border-black rounded-none text-black font-semibold placeholder:text-neutral-500' 
    : (isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER EXPLANATION */}
      <div className="flex justify-end items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyQuote}
            className={`px-3 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              isNotionMode
                ? 'bg-white text-black border-2 border-black hover:bg-neutral-100 rounded-none'
                : (isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl')
            }`}
          >
            {copiedQuote ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copiedQuote ? 'Tersalin' : 'Salin Quote'}</span>
          </button>

          <button
            onClick={handleSaveToCatalog}
            className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              isNotionMode
                ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-none shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl active:scale-95'
            }`}
          >
            <Save size={14} />
            <span>Simpan ke Master</span>
          </button>
        </div>
      </div>

      {/* 4 TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* CARD 1: TOTAL STIKER / LEMBAR */}
        <div className={`${cardBg} p-3 xs:p-4 sm:p-5 border rounded-xl sm:rounded-2xl relative overflow-hidden transition-all ${
          isNotionMode ? 'rounded-none border-2' : 'hover:border-blue-500/50 shadow-sm'
        }`}>
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className={`text-[10px] xs:text-xs font-semibold uppercase tracking-wider ${isNotionMode ? 'text-black' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
              <span className="block sm:hidden">Stiker / Lbr</span>
              <span className="hidden sm:block">Total Stiker / Lembar</span>
            </span>
            <span className={`hidden md:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md items-center gap-1 ${
              isNotionMode 
                ? 'bg-black text-white' 
                : (calculation.isHybridActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-500')
            }`}>
              {calculation.isHybridActive ? (
                <>
                  <Sparkles size={10} />
                  <span>Hybrid (+{calculation.gainVsPure} pcs)</span>
                </>
              ) : (
                <span>Grid Murni</span>
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black ${isNotionMode ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>
              {calculation.totalPcsPerSheet}
            </h3>
            <span className={`text-xs sm:text-sm font-bold ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>pcs</span>
          </div>
          <p className={`text-[9px] sm:text-xs font-medium ${isNotionMode ? 'text-neutral-700 font-semibold' : 'text-slate-400'} truncate`}>
            <span>Efisiensi: </span>
            <span className="font-bold text-blue-500">{calculation.areaEfficiency.toFixed(1)}%</span>
            {calculation.gainVsPure > 0 && <span className="text-emerald-500 text-[9px] sm:text-[11px] ml-1.5 font-bold">(+{calculation.gainVsPure})</span>}
          </p>
        </div>

        {/* CARD 2: HPP / STIKER */}
        <div className={`${cardBg} p-3 xs:p-4 sm:p-5 border rounded-xl sm:rounded-2xl relative overflow-hidden transition-all ${
          isNotionMode ? 'rounded-none border-2' : 'hover:border-blue-500/50 shadow-sm'
        }`}>
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className={`text-[10px] xs:text-xs font-semibold uppercase tracking-wider ${isNotionMode ? 'text-black' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
              <span>HPP / Stiker</span>
            </span>
            <span className={`hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
              isNotionMode ? 'bg-black text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              Bahan + Effort
            </span>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black ${isNotionMode ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>
              {formatCurrency(calculation.hppPerPcs)}
            </h3>
          </div>
          <p className={`text-[9px] sm:text-xs font-medium ${isNotionMode ? 'text-neutral-700 font-semibold' : 'text-slate-400'} truncate`}>
            <span>Modal: </span>
            <span className="font-bold">{formatCurrency(calculation.modalSheet)}</span>
          </p>
        </div>

        {/* CARD 3: REKOMENDASI HARGA JUAL */}
        <div className={`${cardBg} p-3 xs:p-4 sm:p-5 border rounded-xl sm:rounded-2xl relative overflow-hidden transition-all ${
          isNotionMode ? 'rounded-none border-2' : 'hover:border-blue-500/50 shadow-sm bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className={`text-[10px] xs:text-xs font-semibold uppercase tracking-wider ${isNotionMode ? 'text-black' : 'text-blue-500 dark:text-blue-400 font-bold'}`}>
              <span className="block sm:hidden">Harga Jual</span>
              <span className="hidden sm:block">Rekomendasi Harga Jual</span>
            </span>
            <span className={`hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
              isNotionMode ? 'bg-black text-white' : 'bg-blue-600 text-white'
            }`}>
              Margin: {targetMargin}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black ${isNotionMode ? 'text-black' : 'text-blue-600 dark:text-blue-400'}`}>
              {formatCurrency(calculation.recommendedPricePerPcs)}
            </h3>
            <span className={`text-[10px] sm:text-xs font-bold ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>/ pcs</span>
          </div>
          <p className={`text-[9px] sm:text-xs font-medium ${isNotionMode ? 'text-neutral-700 font-semibold' : 'text-slate-400'} truncate`}>
            <span>Paket: </span>
            <span className="font-bold text-emerald-500">{formatCurrency(calculation.recommendedPricePerSheet)}</span>
          </p>
        </div>

        {/* CARD 4: PROFIT / LEMBAR A3 */}
        <div className={`${cardBg} p-3 xs:p-4 sm:p-5 border rounded-xl sm:rounded-2xl relative overflow-hidden transition-all ${
          isNotionMode ? 'rounded-none border-2' : 'hover:border-emerald-500/50 shadow-sm'
        }`}>
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className={`text-[10px] xs:text-xs font-semibold uppercase tracking-wider ${isNotionMode ? 'text-black' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
              <span className="block sm:hidden">Profit / Lbr</span>
              <span className="hidden sm:block">Profit / Lembar A3</span>
            </span>
            <span className={`hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
              isNotionMode ? 'bg-black text-white' : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20'
            }`}>
              Net Profit
            </span>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black ${isNotionMode ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatCurrency(calculation.profitPerSheet)}
            </h3>
          </div>
          <p className={`text-[9px] sm:text-xs font-medium ${isNotionMode ? 'text-neutral-700 font-semibold' : 'text-slate-400'} truncate`}>
            <span>Omzet: </span>
            <span className="font-bold">{formatCurrency(calculation.totalRevenueSheet)}</span>
          </p>
        </div>
      </div>

      {/* MAIN CONTENT: PARAMETER INPUT & VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PARAMETER INPUT ONLY (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* PARAMETER INPUT FORM */}
          <div className={`${cardBg} p-6 border rounded-2xl ${isNotionMode ? 'rounded-none border-2' : 'shadow-sm'}`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${
              isNotionMode ? 'text-black font-black' : (isDark ? 'text-slate-300' : 'text-slate-800')
            }`}>
              <Sliders size={16} className="text-blue-500" />
              Parameter Input Stiker & Bahan
            </h3>

            <div className="space-y-4">
              
              {/* STICKER SIZE PRESETS & INPUTS */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                  Preset Ukuran Stiker Populer
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {STICKER_PRESETS.map((p) => {
                    const isSelected = stickerWidth === p.w && stickerHeight === p.h;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setStickerWidth(p.w);
                          setStickerHeight(p.h);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold transition-all ${
                          isSelected
                            ? (isNotionMode ? 'bg-black text-white rounded-none' : 'bg-blue-600 text-white rounded-lg shadow-sm')
                            : (isNotionMode ? 'bg-white border border-black text-black hover:bg-neutral-100 rounded-none' : (isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg'))
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Lebar (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={stickerWidth}
                      onChange={(e) => setStickerWidth(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Tinggi (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={stickerHeight}
                      onChange={(e) => setStickerHeight(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Bleed (mm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={gapMm}
                      onChange={(e) => setGapMm(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* SHEET PRESETS & INPUTS */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className={`block text-xs font-bold mb-1.5 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                  Ukuran Bahan Cetak
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {SHEET_PRESETS.map((p) => {
                    const isSelected = sheetWidth === p.w && sheetHeight === p.h;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setSheetName(p.name);
                          setSheetWidth(p.w);
                          setSheetHeight(p.h);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold transition-all truncate text-left ${
                          isSelected
                             ? (isNotionMode ? 'bg-black text-white rounded-none' : 'bg-blue-600 text-white rounded-lg shadow-sm')
                             : (isNotionMode ? 'bg-white border border-black text-black hover:bg-neutral-100 rounded-none' : (isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg'))
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Lebar Cetak (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={sheetWidth}
                      onChange={(e) => setSheetWidth(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Panjang Cetak (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={sheetHeight}
                      onChange={(e) => setSheetHeight(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* COST AND MARGIN STRUCTURE */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className={`block text-xs font-bold mb-2 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                  Struktur Biaya Modal (HPP) & Margin
                </label>
                
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Biaya Bahan A3 (Rp/Lembar)
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={materialCostSheet}
                      onChange={(e) => setMaterialCostSheet(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Biaya Cutting / Jasa (Rp/Lembar)
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={cuttingCostSheet}
                      onChange={(e) => setCuttingCostSheet(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-sm border font-mono font-bold outline-none ${
                        isNotionMode ? 'rounded-none' : 'rounded-xl'
                      } ${inputClass}`}
                      placeholder="5000"
                    />
                  </div>
                </div>

                {/* TARGET KEUNTUNGAN & MARGIN INTEGRATED DUAL-INPUT CONTROL */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-bold uppercase tracking-wide ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                      Target Keuntungan & Margin
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      Mode Active:{' '}
                      <strong className={lastActiveInput === 'percentage' ? 'text-blue-500' : 'text-emerald-500'}>
                        {lastActiveInput === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)'}
                      </strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. INPUT BAR PERSENTASE MARGIN (%) & SLIDER */}
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      lastActiveInput === 'percentage'
                        ? (isNotionMode ? 'border-2 border-black bg-neutral-50' : 'border-blue-500/80 bg-blue-500/5 shadow-sm ring-1 ring-blue-500/30')
                        : (isNotionMode ? 'border-slate-300 bg-white' : (isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'))
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Percent size={12} className="text-blue-500" />
                          Margin (%)
                        </label>
                        
                        {lastActiveInput === 'nominal' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            {targetMargin}% Nyala
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-blue-500 font-bold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">Input Utama</span>
                        )}
                      </div>

                      <div className="flex gap-1.5 items-center mb-1.5">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            step="1"
                            value={targetMargin}
                            onChange={(e) => {
                              const val = Math.max(0, parseFloat(e.target.value) || 0);
                              setTargetMargin(val);
                              setLastActiveInput('percentage');
                            }}
                            className={`w-full px-2.5 py-1 text-xs border font-mono font-bold outline-none ${
                              isNotionMode ? 'rounded-none border-black' : 'rounded-lg'
                            } ${inputClass}`}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="10"
                        max="400"
                        step="5"
                        value={targetMargin}
                        onChange={(e) => {
                          setTargetMargin(parseInt(e.target.value) || 0);
                          setLastActiveInput('percentage');
                        }}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      
                      <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
                        <span>30%</span>
                        <span>100%</span>
                        <span>200%</span>
                        <span>400%+</span>
                      </div>
                    </div>

                    {/* 2. INPUT BAR NOMINAL KEUNTUNGAN (RP) */}
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      lastActiveInput === 'nominal'
                        ? (isNotionMode ? 'border-2 border-black bg-neutral-50' : 'border-emerald-500/80 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500/30')
                        : (isNotionMode ? 'border-slate-300 bg-white' : (isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'))
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Coins size={12} className="text-emerald-500" />
                          Nominal Profit (Rp)
                        </label>

                        {lastActiveInput === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            {formatCurrency(calculation.profitPerSheet)} Nyala
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Input Utama</span>
                        )}
                      </div>

                      <div className="relative mb-1.5">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={
                            lastActiveInput === 'nominal' 
                              ? nominalProfitInput 
                              : calculation.profitPerSheet
                          }
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            setNominalProfitInput(val);
                            setLastActiveInput('nominal');
                            const hpp = calculation.hppPerSheet || 1;
                            const computedMargin = Math.round((val / hpp) * 100);
                            setTargetMargin(computedMargin);
                          }}
                          className={`w-full pl-7 pr-2 py-1 text-xs border font-mono font-bold outline-none ${
                            isNotionMode ? 'rounded-none border-black' : 'rounded-lg'
                          } ${inputClass}`}
                          placeholder="30000"
                        />
                      </div>

                      <div className="flex gap-1 overflow-x-auto">
                        {[10000, 20000, 30000, 50000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setNominalProfitInput(preset);
                              setLastActiveInput('nominal');
                              const hpp = calculation.hppPerSheet || 1;
                              const computedMargin = Math.round((preset / hpp) * 100);
                              setTargetMargin(computedMargin);
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded transition-colors ${
                              lastActiveInput === 'nominal' && nominalProfitInput === preset
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            +{preset / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                    isNotionMode
                      ? 'border-black bg-neutral-100'
                      : (isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50')
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                        Total Profit ({targetSheets} lembar / {calculation.totalPcsOrder} pcs):
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatCurrency(calculation.totalProfitOrder)}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: VISUALIZATION (TOP) & INVOICE CONNECTION (BOTTOM) (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* VISUALISASI TATA LETAK KERTAS A3 (TOP OF RIGHT COLUMN) */}
          <div className={`${cardBg} p-6 border rounded-2xl ${isNotionMode ? 'rounded-none border-2' : 'shadow-sm'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isNotionMode ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                Visualisasi Tata Letak Kertas A3
              </h3>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden ${
              isNotionMode 
                ? 'bg-white border-2 border-black rounded-none' 
                : (isDark ? 'bg-[#0b1120]/90 border-slate-800' : 'bg-slate-100/90 border-slate-200')
            }`}>
              
              <div className="text-[11px] font-mono font-bold mb-2 flex items-center gap-1 text-slate-400">
                <span>{calculation.shW} cm</span>
              </div>

              <div className="flex items-center gap-2 w-full justify-center">
                <div className="text-[11px] font-mono font-bold text-slate-400 [writing-mode:vertical-lr] rotate-180">
                  <span>{calculation.shH} cm</span>
                </div>

                <div 
                  className={`relative border-2 border-dashed transition-all flex flex-col justify-center items-center p-2 rounded-lg ${
                    isNotionMode
                      ? 'border-black bg-neutral-100'
                      : (isDark ? 'border-blue-500/40 bg-slate-950/90 shadow-inner' : 'border-blue-400/50 bg-white shadow-sm')
                  }`}
                  style={{
                    width: calculation.shW >= calculation.shH ? '100%' : 'auto',
                    height: calculation.shW >= calculation.shH ? 'auto' : '380px',
                    maxWidth: '100%',
                    maxHeight: '400px',
                    aspectRatio: `${calculation.shW} / ${calculation.shH}`
                  }}
                >
                  <svg
                    viewBox={`0 0 ${calculation.shW} ${calculation.shH}`}
                    className="w-full h-full block"
                    style={{
                      aspectRatio: `${calculation.shW} / ${calculation.shH}`,
                      maxHeight: '100%',
                      maxWidth: '100%'
                    }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <rect
                      x="0"
                      y="0"
                      width={calculation.shW}
                      height={calculation.shH}
                      fill={isDark ? '#090d16' : '#f8fafc'}
                      rx="0.3"
                    />

                    {calculation.rects.map((stk) => {
                      const isExtra = stk.section !== 'main';
                      let fillColor = isNotionMode 
                        ? (isExtra ? '#404040' : '#000000') 
                        : (isDark 
                            ? (isExtra ? '#0284c7' : '#1e3a8a') 
                            : (isExtra ? '#0284c7' : '#2563eb'));
                      
                      let strokeColor = isNotionMode 
                        ? '#ffffff' 
                        : (isExtra ? '#38bdf8' : '#60a5fa');

                      return (
                        <g key={stk.id} className="transition-all hover:opacity-90 cursor-pointer">
                          <rect
                            x={stk.x}
                            y={stk.y}
                            width={stk.w}
                            height={stk.h}
                            rx={Math.min(0.2, Math.min(stk.w, stk.h) * 0.08)}
                            fill={fillColor}
                            fillOpacity={isDark ? '0.88' : '0.92'}
                            stroke={strokeColor}
                            strokeWidth="0.05"
                            strokeDasharray={isExtra ? '0.2,0.1' : undefined}
                          />
                          {stk.isRotated && stk.w >= 1.5 && stk.h >= 1.5 && (
                            <text
                              x={stk.x + stk.w / 2}
                              y={stk.y + stk.h / 2 + 0.3}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize={Math.min(1.2, Math.min(stk.w, stk.h) * 0.35)}
                              fontWeight="bold"
                              opacity="0.9"
                            >
                              90°
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="mt-4 text-center w-full space-y-2">
                <p className={`text-xs font-mono font-bold ${isNotionMode ? 'text-black font-extrabold' : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                  Layout: {calculation.chosen.description} ({calculation.totalPcsPerSheet} pcs total)
                </p>

                <div className="flex items-center justify-center gap-3 text-[11px] font-semibold flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 inline-block rounded-sm ${isNotionMode ? 'bg-black' : 'bg-blue-600'}`}></span>
                    <span>Utama: {calculation.chosen.mainGrid.pcs} pcs ({calculation.chosen.mainGrid.w}×{calculation.chosen.mainGrid.h}cm)</span>
                  </span>

                  {calculation.chosen.bottomGrid.pcs > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 inline-block rounded-sm ${isNotionMode ? 'bg-neutral-600' : 'bg-sky-600'}`}></span>
                      <span>Sisa Bawah: {calculation.chosen.bottomGrid.pcs} pcs (90°)</span>
                    </span>
                  )}

                  {calculation.chosen.sideGrid.pcs > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 inline-block rounded-sm ${isNotionMode ? 'bg-neutral-500' : 'bg-cyan-600'}`}></span>
                      <span>Sisa Samping: {calculation.chosen.sideGrid.pcs} pcs (90°)</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>Terpakai: <b className="text-emerald-500">{calculation.areaEfficiency.toFixed(1)}%</b></span>
                  <span>•</span>
                  <span>Waste/Sisa: <b className="text-amber-500">{calculation.wastePercent.toFixed(1)}%</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* SIMPAN & HUBUNGKAN KE INVOICE (BOTTOM OF RIGHT COLUMN) */}
          <div className={`${cardBg} p-6 border rounded-2xl ${isNotionMode ? 'rounded-none border-2' : 'shadow-sm'}`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${
              isNotionMode ? 'text-black font-black' : (isDark ? 'text-slate-300' : 'text-slate-800')
            }`}>
              <Package size={16} className="text-blue-500" />
              Simpan & Hubungkan ke Invoice
            </h3>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isNotionMode ? 'text-black' : 'text-slate-400'}`}>
                  Nama Produk Stiker di Master
                </label>
                <input
                  type="text"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  placeholder={`Stiker Custom ${stickerWidth}x${stickerHeight}cm (${calculation.totalPcsPerSheet} pcs/lbr)`}
                  className={`w-full px-3 py-2 text-xs border outline-none ${
                    isNotionMode ? 'rounded-none' : 'rounded-xl'
                  } ${inputClass}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPackaging('pcs')}
                  className={`py-2 px-3 text-xs font-bold border transition-all text-left ${
                    selectedPackaging === 'pcs'
                      ? (isNotionMode ? 'bg-black text-white border-black rounded-none' : 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl')
                      : (isNotionMode ? 'bg-white text-black border-black rounded-none' : (isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400 rounded-xl' : 'bg-slate-50 border-slate-200 text-slate-600 rounded-xl'))
                  }`}
                >
                  <div>Harga Jual / Pcs</div>
                  <div className="font-mono text-sm font-black">{formatCurrency(calculation.recommendedPricePerPcs)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPackaging('sheet')}
                  className={`py-2 px-3 text-xs font-bold border transition-all text-left ${
                    selectedPackaging === 'sheet'
                      ? (isNotionMode ? 'bg-black text-white border-black rounded-none' : 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl')
                      : (isNotionMode ? 'bg-white text-black border-black rounded-none' : (isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400 rounded-xl' : 'bg-slate-50 border-slate-200 text-slate-600 rounded-xl'))
                  }`}
                >
                  <div>Harga Paket / Lembar</div>
                  <div className="font-mono text-sm font-black">{formatCurrency(calculation.recommendedPricePerSheet)}</div>
                </button>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveToCatalog}
                  className={`w-full py-3 px-4 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isNotionMode
                      ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-none shadow-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20'
                  }`}
                >
                  <Save size={16} />
                  <span>Simpan ke Master Produk</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectInvoice}
                  className={`w-full py-3 px-4 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isNotionMode
                      ? 'bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-none'
                      : (isDark ? 'bg-slate-800 hover:bg-slate-700 text-white rounded-xl' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl')
                  }`}
                >
                  <FileText size={16} />
                  <span>Gunakan di Invoice Baru</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default StickerCalculator;
