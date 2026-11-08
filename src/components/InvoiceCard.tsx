import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ShoppingBag, 
  Download, 
  MoreVertical, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/helpers';

interface InvoiceCardProps {
  invoice: InvoiceData;
  onDelete: (id: string) => void;
  onEdit: (invoice: InvoiceData) => void;
  onExport: (invoice: InvoiceData) => void;
  isDark: boolean;
  isNotionMode?: boolean;
}

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isPaid = status === 'paid' || status === 'Lunas';
  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border uppercase select-none ${
      isPaid 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800' 
        : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/80 dark:text-orange-400 dark:border-orange-800'
    }`}>
      {isPaid ? 'LUNAS' : 'PENDING'}
    </div>
  );
};

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  onDelete, 
  onEdit, 
  onExport, 
  isDark, 
  isNotionMode = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const cardBase = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100');
  const textPrimary = isNotionMode ? 'text-black font-extrabold' : (isDark ? 'text-white' : 'text-slate-800');
  const textSecondary = isNotionMode ? 'text-neutral-500 font-bold' : (isDark ? 'text-slate-400' : 'text-slate-400');
  const textMuted = isNotionMode ? 'text-neutral-600 font-medium' : (isDark ? 'text-slate-500' : 'text-slate-500');
  const divider = isNotionMode ? 'border-black' : (isDark ? 'border-slate-800' : 'border-slate-100');
  const iconBg = isNotionMode ? 'hover:bg-neutral-100 text-black border border-black rounded-none' : (isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700');

  const clientName = invoice.buyer?.name || (invoice as any).client || 'Pelanggan';
  const invoiceId = invoice.invoiceNumber || invoice.id;
  const amount = invoice.totalAmount || (invoice as any).amount || 0;

  const itemsCount = Array.isArray(invoice.items) ? invoice.items.length : ((invoice as any).items || 1);
  const primaryItemName = Array.isArray(invoice.items) && invoice.items[0]?.name 
    ? invoice.items[0].name 
    : ((invoice as any).primaryItem || 'Item Transaksi');

  const itemDisplayText = itemsCount > 1 
    ? `${primaryItemName} + ${itemsCount - 1} item lainnya` 
    : primaryItemName;

  const menuBg = isNotionMode 
    ? 'bg-white border-2 border-black rounded-none shadow-none text-black' 
    : (isDark ? 'bg-slate-800 border-slate-700 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { 
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${cardBase} rounded-xl p-5 shadow-xs border hover:shadow-md transition-all duration-300 flex flex-col gap-3 relative group`}>
      <div className="flex justify-between items-center">
        <h3 className={`font-bold ${textPrimary} text-base truncate pr-2`}>{clientName}</h3>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="flex justify-between items-center">
        <p className={`text-xs ${textSecondary} font-medium font-mono`}>{invoiceId}</p>
        <p className={`text-[10px] font-bold ${textSecondary} uppercase tracking-widest`}>TOTAL TAGIHAN</p>
      </div>
      <div className="flex justify-between items-center mb-1">
        <div className={`flex items-center gap-1.5 ${textMuted}`}>
          <Calendar size={14} />
          <p className="text-xs font-medium font-sans">{formatDate(invoice.date)}</p>
        </div>
        <p className={`text-lg font-semibold ${textPrimary} tracking-tight font-sans tabular-nums`} style={{ fontWeight: 600 }}>{formatCurrency(amount)}</p>
      </div>
      <div className={`${divider} border-t pt-3 mt-1 flex justify-between items-center gap-2`}>
        <div className={`flex items-center gap-2 overflow-hidden flex-1 ${textMuted}`}>
          <ShoppingBag size={14} className="shrink-0 opacity-70" />
          <p className="text-xs font-medium truncate">{itemDisplayText}</p>
        </div>
        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); onExport(invoice); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${iconBg}`} title="Download / Preview Struk"><Download size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${iconBg}`} title="More Options"><MoreVertical size={16} /></button>
          {showMenu && (
            <div className={`absolute right-0 bottom-full mb-2 w-32 rounded-xl border py-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 ${menuBg}`}>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(invoice); }} className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors cursor-pointer ${isNotionMode ? 'text-black hover:bg-neutral-100' : (isDark ? 'text-slate-300' : 'text-slate-600')}`}><Pencil size={14} /> Edit</button>
              <div className={`border-t my-1 ${isNotionMode ? 'border-black' : (isDark ? 'border-slate-700' : 'border-slate-100')}`}></div>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(invoice.id); }} className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer`}><Trash2 size={14} /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
