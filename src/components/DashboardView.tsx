import React from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Cloud, 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Search, 
  ChevronDown, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  ArrowDown01, 
  ArrowUp10, 
  ShoppingBag 
} from 'lucide-react';
import { InvoiceData, BusinessSettings } from '../types/invoice';
import { AVATAR_STYLES } from '../constants';
import { formatCurrency, getAvatarUrl } from '../utils/helpers';
import { InvoiceCard } from './InvoiceCard';

interface DashboardViewProps {
  settings: BusinessSettings | null;
  invoices: InvoiceData[];
  processedInvoices: InvoiceData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  setSortConfig: (config: any) => void;
  toggleDirection: () => void;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
  handleDeleteInvoice: (id: string) => void;
  onEditInvoice: (inv: InvoiceData) => void;
  onExportInvoice: (inv: InvoiceData) => void;
  onOpenCreate?: () => void;
  isDarkMode: boolean;
  isNotionMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  invoices,
  processedInvoices,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  toggleDirection,
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  handleDeleteInvoice,
  onEditInvoice,
  onExportInvoice,
  onOpenCreate,
  isDarkMode,
  isNotionMode
}) => {
  const totalRevenue = invoices.reduce((sum, inv) => {
    const isPaid = inv.status === 'paid' || inv.status === 'Lunas';
    const amount = inv.totalAmount || (inv as any).amount || 0;
    return sum + (isPaid ? amount : 0);
  }, 0);

  const stats = { 
    total: invoices.length, 
    paid: invoices.filter(i => i.status === 'paid' || i.status === 'Lunas').length, 
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'Pending').length 
  };
  
  const textMain = isNotionMode ? 'text-black' : (isDarkMode ? 'text-white' : 'text-slate-900');
  const textSub = isNotionMode ? 'text-neutral-600' : (isDarkMode ? 'text-slate-400' : 'text-slate-400');
  const searchBg = isNotionMode 
    ? 'bg-white border-2 border-black text-black placeholder:text-neutral-500 shadow-none' 
    : (isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-100 text-slate-800 placeholder:text-slate-400');
  
  const ownerName = (settings as any)?.owner?.name || settings?.business?.name || 'Hilversen Owner';
  const ownerAvatar = (settings as any)?.owner?.avatar;
  const avatarStyle = (settings as any)?.owner?.avatarStyle || AVATAR_STYLES.HAPPY_HUMAN;

  const avatarUrl = ownerAvatar 
    ? ownerAvatar 
    : getAvatarUrl(ownerName, avatarStyle);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          {/* Header title removed per user request */}
        </div>
        <div className="flex items-center gap-3">
          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>+ Buat Invoice Baru</span>
            </button>
          )}

          <div className={`flex items-center gap-1 p-1 rounded-full border shadow-sm ${isNotionMode ? 'bg-white border-2 border-black shadow-none' : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}`}>
             <button onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className={`p-2 rounded-full transition-all ${!canUndo ? 'opacity-30 cursor-not-allowed' : (isNotionMode ? 'hover:bg-neutral-100 text-black' : (isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'))}`}>
               <RotateCcw size={18} />
             </button>
             <div className={`w-px h-4 mx-1 ${isNotionMode ? 'bg-black' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')}`} />
             <button onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className={`p-2 rounded-full transition-all ${!canRedo ? 'opacity-30 cursor-not-allowed' : (isNotionMode ? 'hover:bg-neutral-100 text-black' : (isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'))}`}>
               <RotateCw size={18} />
             </button>
           </div>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isNotionMode ? 'bg-black text-white' : (isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
             <Cloud size={20} />
           </div>
           <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ${isNotionMode ? 'bg-white border-2 border-black shadow-none' : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-white')}`}>
             <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
           </div>
        </div>
      </header>
      
      {/* STATS BANNER */}
      {isNotionMode ? (
        <div className="bg-black text-white rounded-2xl p-6 mb-8 border-2 border-black">
          <p className="text-neutral-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">Total Pendapatan (Lunas)</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">{formatCurrency(totalRevenue)}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-center">
              <p className="text-xs text-neutral-400 uppercase font-mono mb-1">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-center">
              <p className="text-xs text-neutral-400 uppercase font-mono mb-1">Paid</p>
              <p className="text-xl font-bold">{stats.paid}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-center">
              <p className="text-xs text-neutral-400 uppercase font-mono mb-1">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white shadow-xl shadow-blue-600/20 mb-6 sm:mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl"><CreditCard className="text-white w-5 h-5 sm:w-6 sm:h-6" /></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse border border-white/10 text-white"><Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} /></div>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Pendapatan (Lunas)</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 sm:mb-8">{formatCurrency(totalRevenue)}</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 ring-1 ring-white/10 flex flex-col items-center justify-center text-center"><FileText className="text-blue-100 mb-1 w-4 h-4 sm:w-[18px] sm:h-[18px]" /><span className="text-base sm:text-xl font-bold">{stats.total}</span><span className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider">Total</span></div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 ring-1 ring-white/10 flex flex-col items-center justify-center text-center"><CheckCircle2 className="text-emerald-300 mb-1 w-4 h-4 sm:w-[18px] sm:h-[18px]" /><span className="text-base sm:text-xl font-bold">{stats.paid}</span><span className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider">Paid</span></div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 ring-1 ring-white/10 flex flex-col items-center justify-center text-center"><Clock className="text-orange-300 mb-1 w-4 h-4 sm:w-[18px] sm:h-[18px]" /><span className="text-base sm:text-xl font-bold">{stats.pending}</span><span className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider">Pending</span></div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND SORT BAR */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 z-20 relative">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Cari nama, harga, atau tanggal..." className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-colors ${searchBg}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className={`flex items-center p-1 rounded-2xl border ${isNotionMode ? 'bg-white border-2 border-black shadow-none' : (isDarkMode ? 'bg-slate-900 border-slate-700 shadow-sm' : 'bg-white border-slate-100 shadow-sm')}`}>
          <div className="relative h-full flex items-center">
            <select value={sortConfig.key} onChange={(e) => setSortConfig((prev: any) => ({ ...prev, key: e.target.value }))} className={`appearance-none h-12 pl-4 pr-10 bg-transparent text-sm font-semibold outline-none cursor-pointer ${isNotionMode ? 'text-black' : (isDarkMode ? 'text-slate-300' : 'text-slate-600')}`}>
              <option value="client">Nama Buyer</option>
              <option value="amount">Total Tagihan</option>
              <option value="date">Tanggal</option>
            </select>
            <ChevronDown size={14} className={`absolute right-3 pointer-events-none ${isNotionMode ? 'text-black' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`} />
          </div>
          <div className={`w-px h-6 mx-1 ${isNotionMode ? 'bg-black' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')}`} />
          <button onClick={toggleDirection} className={`h-12 px-4 rounded-xl flex items-center gap-2 font-medium text-sm transition-all active:scale-95 ${isNotionMode ? 'hover:bg-neutral-100 text-black' : (isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-blue-50 text-blue-600')}`}>
            {sortConfig.direction === 'asc' ? (sortConfig.key === 'client' ? <ArrowDownAZ size={18} /> : <ArrowDown01 size={18} />) : (sortConfig.key === 'client' ? <ArrowUpAZ size={18} /> : <ArrowUp10 size={18} />)}
            <span className="hidden md:inline">Sort</span>
          </button>
        </div>
      </div>

      {/* INVOICE LIST */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className={`font-bold text-lg ${textMain}`}>Daftar Invoice</h3>
          <span className={`text-xs font-medium ${textSub}`}>{processedInvoices.length} ditemukan</span>
        </div>
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>+ Tambah Invoice</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedInvoices.length > 0 ? (
          processedInvoices.map(invoice => (
            <InvoiceCard 
              key={invoice.id} 
              invoice={invoice} 
              onDelete={handleDeleteInvoice} 
              onEdit={onEditInvoice} 
              onExport={onExportInvoice} 
              isDark={isDarkMode} 
              isNotionMode={isNotionMode} 
            />
          ))
        ) : (
          <div className={`col-span-full py-12 text-center ${textSub}`}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Tidak ada invoice yang cocok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
