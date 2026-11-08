import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Maximize2, 
  X, 
  Monitor, 
  ScrollText, 
  Info, 
  ImageIcon, 
  Download, 
  Loader2, 
  Building2, 
  Mail, 
  Phone 
} from 'lucide-react';
import { InvoiceData, BusinessSettings } from '../types/invoice';
import { formatCurrency, formatDate, useEscKey } from '../utils/helpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (ref: any, type: 'jpg' | 'pdf') => void;
  invoice: InvoiceData;
  businessSettings: BusinessSettings | null;
  isDark: boolean;
  isDownloading: boolean;
  isNotionMode?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  onExport, 
  invoice, 
  businessSettings, 
  isDark, 
  isDownloading, 
  isNotionMode = false 
}) => {
  useEscKey(onClose);
  if (!isOpen || !invoice) return null;
  
  const [template, setTemplate] = useState<'modern' | 'thermal'>('modern');
  const printRef = useRef<HTMLDivElement | null>(null);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [unscaledHeight, setUnscaledHeight] = useState(842);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const startPanOffset = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [isOpen, template]);

  useEffect(() => {
    setShowZoomIndicator(true);
    const timer = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [zoomFactor]);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const [cursorStyle, setCursorStyle] = useState('grab');

  const touchStartDistance = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(1);
  
  const items = useMemo(() => {
    const fullItems = (invoice as any).fullItems;
    const rawItems = fullItems || (Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items.map((it: any, i: number) => ({
      id: it.id || i,
      name: it.name,
      qty: it.quantity || it.qty || 1,
      price: it.unitPrice || it.price || 0
    })) : Array.from({ length: 1 }).map((_, i) => ({ 
      id: i,
      name: (invoice as any).primaryItem || 'Item Jasa/Barang', 
      qty: 1, 
      price: invoice.totalAmount || (invoice as any).amount || 0 
    })));
    
    return rawItems.filter((item: any) => item.name && item.name.trim() !== '' && (item.price > 0 || item.qty > 0));
  }, [invoice]);

  const subTotal = items.reduce((acc: number, curr: any) => acc + (curr.price * curr.qty), 0);
  const discountVal = invoice.discountAmount || (invoice as any).discount || 0;
  const showTax = (invoice as any).hasTax !== undefined ? (invoice as any).hasTax : ((invoice.taxAmount || 0) > 0);
  const tax = invoice.taxAmount !== undefined ? invoice.taxAmount : Math.max(0, (invoice.totalAmount || (invoice as any).amount || 0) - (subTotal - discountVal));
  const amount = invoice.totalAmount || (invoice as any).amount || 0;
  const clientName = invoice.buyer?.name || (invoice as any).client || 'Pelanggan Setia';
  const invoiceId = invoice.invoiceNumber || invoice.id;

  const bizName = businessSettings?.business?.name || "Hilversen F1 Merchandise Atelier";
  const bizAddress = businessSettings?.business?.address || "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan";
  const bizEmail = businessSettings?.business?.email || "billing@hilversen-atelier.com";
  const bizPhone = businessSettings?.business?.phone || "+62 21 5790 8821";
  const bizLogo = (businessSettings as any)?.business?.logo || null;
  const qrisImage = (businessSettings as any)?.config?.qrisImage || null;

  const options = (businessSettings as any)?.invoiceOptions || { 
    fontSize: 'medium', 
    dateFormat: 'DD-MM-YYYY', 
    showBusinessName: true, 
    showBusinessAddress: true, 
    showBusinessLogo: true, 
    showBusinessEmail: true, 
    showBusinessPhone: true, 
    showSignature: false, 
    signatureImage: '' 
  };

  useEffect(() => {
    if (!isOpen) return;
    const updateScaleAndHeight = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const targetWidth = template === 'modern' ? 595 : 320;
      const currentScale = containerWidth < targetWidth ? (containerWidth / targetWidth) : 1;
      setScale(currentScale);

      const tempElement = printRef.current;
      if (tempElement) {
        setUnscaledHeight(tempElement.scrollHeight);
      }
    };
    
    updateScaleAndHeight();
    window.addEventListener('resize', updateScaleAndHeight);
    
    const timer1 = setTimeout(updateScaleAndHeight, 50);
    const timer2 = setTimeout(updateScaleAndHeight, 150);
    const timer3 = setTimeout(updateScaleAndHeight, 350);
    
    return () => {
      window.removeEventListener('resize', updateScaleAndHeight);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, template, invoice, items]);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = 0.08;
      setZoomFactor(prev => {
        const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
        return Math.max(0.4, Math.min(4.0, prev + delta));
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    isDragging.current = true;
    setIsPanning(true);
    setCursorStyle('grabbing');
    startX.current = e.clientX;
    startY.current = e.clientY;
    startPanOffset.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    setPanOffset({
      x: startPanOffset.current.x + dx,
      y: startPanOffset.current.y + dy
    });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsPanning(false);
    setCursorStyle('grab');
    setPanOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistance.current = dist;
      touchStartZoom.current = zoomFactor;
    } else if (e.touches.length === 1) {
      isDragging.current = true;
      setIsPanning(true);
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startPanOffset.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistance.current;
      setZoomFactor(Math.max(0.4, Math.min(4.0, touchStartZoom.current * ratio)));
    } else if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;
      setPanOffset({
        x: startPanOffset.current.x + dx,
        y: startPanOffset.current.y + dy
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistance.current = null;
    isDragging.current = false;
    setIsPanning(false);
    setPanOffset({ x: 0, y: 0 });
  };

  const ModernTemplate = () => {
    const fontSizeClass = options.fontSize === 'small' ? 'text-xs' : options.fontSize === 'large' ? 'text-base' : 'text-sm';
    const headerTitleSize = options.fontSize === 'small' ? 'text-lg' : options.fontSize === 'large' ? 'text-2xl' : 'text-xl';
    return (
      <div className={`bg-white text-slate-800 p-8 w-[595px] min-h-[842px] relative shadow-lg mx-auto font-sans flex flex-col ${fontSizeClass}`}>
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-4">
            {options.showBusinessLogo && (bizLogo ? <img src={bizLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg" /> : <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Building2 size={32} /></div>)}
            <div>
              {options.showBusinessName && <h1 className={`${headerTitleSize} font-bold text-slate-900`}>{bizName}</h1>}
              {options.showBusinessAddress && <p className="text-slate-500 text-xs mt-1 max-w-[200px]">{bizAddress}</p>}
              <div className="flex gap-3 mt-2 text-xs text-slate-400">
                {options.showBusinessEmail && <span className="flex items-center gap-1"><Mail size={12} /> {bizEmail}</span>}
                {options.showBusinessPhone && <span className="flex items-center gap-1"><Phone size={12} /> {bizPhone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-extrabold text-slate-200 tracking-tight">INVOICE</h2>
            <p className="text-blue-600 font-bold font-mono text-lg mt-1">{invoiceId}</p>
            <div className="mt-4 text-xs text-slate-500">
              <p>Tanggal: <span className="text-slate-800 font-bold">{formatDate(invoice.date, options.dateFormat)}</span></p>
              <p className="mt-1">Status: <span className={`font-bold uppercase ${invoice.status === 'paid' || invoice.status === 'Lunas' ? 'text-emerald-600' : 'text-orange-500'}`}>{invoice.status}</span></p>
            </div>
          </div>
        </div>
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Tagihan Kepada</p>
            <h3 className="text-lg font-bold text-slate-800">{clientName}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Metode Pembayaran</p>
            <p className="font-bold text-slate-700">{(invoice as any).paymentMethod || 'Cash'}</p>
          </div>
        </div>
        <div className="flex-1">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-100 text-left">
                <th className="py-3 text-xs font-bold uppercase text-slate-400">Deskripsi Item</th>
                <th className="py-3 text-xs font-bold uppercase text-slate-400 text-center w-20">Qty</th>
                <th className="py-3 text-xs font-bold uppercase text-slate-400 text-right w-32">Harga</th>
                <th className="py-3 text-xs font-bold uppercase text-slate-400 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-50 group">
                  <td className="py-4 font-medium text-slate-700">{item.name}</td>
                  <td className="py-4 text-center text-slate-500">{item.qty}</td>
                  <td className="py-4 text-right text-slate-500">{formatCurrency(item.price).replace('Rp', '')}</td>
                  <td className="py-4 text-right font-bold text-slate-700">{formatCurrency(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-end mb-12">
          <div>
            {qrisImage && (
              <div className="p-2 border border-slate-200 rounded-lg inline-block">
                <p className="text-[10px] text-center mb-1 font-bold text-slate-400">SCAN TO PAY</p>
                <img src={qrisImage} alt="QRIS" className="w-24 h-24 object-contain" />
              </div>
            )}
          </div>
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span className="font-medium text-slate-800">{formatCurrency(subTotal)}</span></div>
            {discountVal > 0 && (<div className="flex justify-between text-slate-500 text-sm"><span>Discount</span><span className="font-medium text-red-500">-{formatCurrency(discountVal)}</span></div>)}
            {showTax && (<div className="flex justify-between text-slate-500 text-sm"><span>Pajak (10%)</span><span className="font-medium text-slate-800">{formatCurrency(tax)}</span></div>)}
            <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-100">
              <span className="font-bold text-lg text-slate-900">Total</span>
              <span className="font-bold text-2xl text-blue-600">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          {options.showSignature && (
            <div className="flex justify-end mb-8 px-8">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 mb-2">Hormat Kami,</p>
                {options.signatureImage ? (
                  <img src={options.signatureImage} alt="Signature" className="h-20 mx-auto object-contain mb-2" />
                ) : (
                  <div className="h-20 w-32 border border-dashed border-slate-300 mx-auto mb-2 flex items-center justify-center text-xs text-slate-300">(No Signature)</div>
                )}
                <div className="border-b border-slate-300 w-40 mb-2 mx-auto"></div>
                <p className="font-bold text-slate-800">{bizName}</p>
              </div>
            </div>
          )}
          <div className="text-center text-xs text-slate-400 pt-8 border-t border-dashed border-slate-200">
            <p className="font-medium text-slate-600 mb-1">Terima Kasih atas kepercayaan Anda!</p>
            <p>Harap melakukan pembayaran sebelum tanggal jatuh tempo.</p>
          </div>
        </div>
      </div>
    );
  };

  const ThermalTemplate = () => (
    <div className="bg-white text-black font-mono p-4 w-[320px] mx-auto min-h-[400px] text-xs leading-tight relative shadow-lg border border-slate-200">
       <div className="text-center mb-4">
        {options.showBusinessName && <h1 className="text-base font-bold uppercase tracking-wider mb-2">{bizName}</h1>}
        {options.showBusinessAddress && <p className="text-[10px] opacity-70 mb-1">{bizAddress}</p>}
        {options.showBusinessPhone && <p className="text-[10px] opacity-70">{bizPhone}</p>}
      </div>
      <div className="border-b-2 border-dashed border-black/20 my-3"></div>
      <div className="flex flex-col gap-1 mb-3 text-[10px] uppercase">
        <div className="flex justify-between"><span>{formatDate(invoice.date)}</span><span>{new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span></div>
        <div>NO: {invoiceId}</div>
        <div>KEPADA: {clientName}</div>
        <div>PAY VIA: {(invoice as any).paymentMethod || 'Cash'}</div>
      </div>
      <div className="border-b-2 border-dashed border-black/20 my-3"></div>
      <div className="space-y-3 mb-3">
        {items.map((item: any, idx: number) => (
          <div key={idx}>
            <div className="font-bold uppercase mb-1">{item.name}</div>
            <div className="flex justify-between pl-2 opacity-80">
              <span>{item.qty} x {formatCurrency(item.price).replace('Rp', '')}</span>
              <span>{formatCurrency(item.qty * item.price).replace('Rp', '')}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b-2 border-dashed border-black/20 my-3"></div>
      <div className="flex justify-between mb-1"><span className="opacity-70">SUBTOTAL</span><span>{formatCurrency(subTotal)}</span></div>
      {discountVal > 0 && (<div className="flex justify-between mb-1"><span className="opacity-70">DISCOUNT</span><span>-{formatCurrency(discountVal)}</span></div>)}
      {showTax && (<div className="flex justify-between mb-1"><span className="opacity-70">PAJAK</span><span>{formatCurrency(tax)}</span></div>)}
      <div className="flex justify-between font-bold text-sm mt-3 mb-2"><span>TOTAL</span><span className="text-base">{formatCurrency(amount)}</span></div>
      <div className="border-b-2 border-dashed border-black/20 my-3"></div>
      {qrisImage && (
        <div className="flex flex-col items-center justify-center my-4">
          <img src={qrisImage} alt="QRIS" className="w-24 h-24 object-contain" />
          <span className="text-[10px] font-bold mt-1">SCAN TO PAY</span>
        </div>
      )}
      <div className="text-center mt-4 mb-4">
        <div className={`inline-block px-3 py-1 border-2 border-black font-bold uppercase mb-2 text-[10px]`}>{invoice.status === 'paid' || invoice.status === 'Lunas' ? 'LUNAS' : 'BELUM LUNAS'}</div>
        <p className="font-bold mt-2">TERIMA KASIH</p>
      </div>
      <div className="absolute -bottom-1 left-0 right-0 h-4 bg-white" style={{background: 'linear-gradient(45deg, transparent 33.333%, #f1f5f9 33.333%, #f1f5f9 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #f1f5f9 33.333%, #f1f5f9 66.667%, transparent 66.667%)', backgroundSize: '10px 20px', backgroundPosition: '0 10px'}}></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      {!isFullScreen && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>}
      <div className={`${isFullScreen ? 'fixed inset-0 w-screen h-screen rounded-none border-none z-[105] bg-[#525659] p-0' : `${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-white'} border rounded-3xl w-full max-w-4xl h-[90vh] shadow-2xl relative z-10`} flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}>
        {!isFullScreen && (
          <div className={`flex justify-between items-center p-5 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><FileText size={20} /></div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Invoice Preview</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{invoiceId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFullScreen(true)} 
                className={`p-2 rounded-full transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Tampilan Penuh (Fullscreen)"
              >
                <Maximize2 size={20} />
              </button>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-full transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
        
        {!isFullScreen && (
          <div className={`px-5 py-3 border-b flex justify-center ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`flex p-1 rounded-xl ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
              <button onClick={() => setTemplate('modern')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${template === 'modern' ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}><Monitor size={16} /> Modern (A4)</button>
              <button onClick={() => setTemplate('thermal')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${template === 'thermal' ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}><ScrollText size={16} /> Thermal (POS)</button>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: cursorStyle }}
          className="flex-1 overflow-hidden bg-[#525659] p-4 sm:p-8 flex items-center justify-center relative shadow-inner select-none touch-none"
        >
          {isFullScreen && (
            <button 
              onClick={() => setIsFullScreen(false)}
              className="fixed top-4 right-4 text-slate-300 hover:text-white z-[110] p-1.5 transition-colors active:scale-90 flex items-center justify-center cursor-pointer"
              title="Keluar dari Layar Penuh"
            >
              <X size={18} />
            </button>
          )}

          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-white text-xs font-bold shadow-lg transition-all duration-300 ${showZoomIndicator ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`}>
            <span>Zoom: {Math.round(zoomFactor * 100)}%</span>
            {zoomFactor !== 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomFactor(1); setPanOffset({ x: 0, y: 0 }); }} 
                className="ml-1 px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[10px] uppercase transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div 
            className="transition-shadow duration-300 shadow-2xl rounded-lg overflow-hidden shrink-0"
            style={{
              width: (template === 'modern' ? 595 : 320) * scale * zoomFactor,
              height: unscaledHeight * scale * zoomFactor,
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isPanning ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div 
              ref={printRef}
              style={{
                transform: `scale(${scale * zoomFactor})`,
                transformOrigin: 'top left',
                width: template === 'modern' ? 595 : 320,
              }}
            >
              {template === 'modern' ? <ModernTemplate /> : <ThermalTemplate />}
            </div>
          </div>
        </div>
        
        {!isFullScreen && (
          <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 sm:mr-auto mb-1 sm:mb-0">
              <Info className="shrink-0" size={14} />
              <span>Pastikan layout sudah sesuai sebelum download</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => onExport(printRef.current, 'jpg')} 
                disabled={isDownloading} 
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />} 
                Save as JPG
              </button>
              <button 
                onClick={() => onExport(printRef.current, 'pdf')} 
                disabled={isDownloading} 
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} 
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
