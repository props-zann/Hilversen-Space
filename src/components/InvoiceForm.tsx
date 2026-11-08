import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronDown, 
  User, 
  Calendar, 
  CheckSquare,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { InvoiceData, ProductItem, BusinessSettings } from '../types/invoice';
import { formatCurrency, useEscKey } from '../utils/helpers';
import { CustomDatePicker } from './CustomDatePicker';

interface InvoiceFormProps {
  onBack: () => void;
  onSave: (data: any) => void;
  isSaving?: boolean;
  initialData?: InvoiceData | null;
  productMaster: ProductItem[];
  isDark: boolean;
  settings: BusinessSettings | null;
  isNotionMode?: boolean;
  masterBuyers?: any[];
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  onBack, 
  onSave, 
  isSaving = false, 
  initialData, 
  productMaster, 
  isDark, 
  settings, 
  isNotionMode = false,
  masterBuyers = []
}) => {
  const [items, setItems] = useState<any[]>([{ id: Date.now(), name: '', qty: 1, price: 0 }]);
  const [client, setClient] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [useTax, setUseTax] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSearchRow, setActiveSearchRow] = useState<any>(null);
  const [useDiscount, setUseDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState('pending');

  const cardBase = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black' : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-[#FAF6EE] border-[#E2D8C3]');
  const inputBase = isNotionMode ? 'bg-white border-2 border-black rounded-none text-black placeholder:text-neutral-500' : (isDark ? 'bg-black text-white placeholder:text-neutral-500 border border-neutral-800' : 'bg-white text-slate-800 placeholder:text-slate-400 border border-[#E2D8C3]');
  const tableInput = isNotionMode ? 'text-black border-black focus:border-black' : (isDark ? 'text-white border-neutral-700 focus:border-blue-500' : 'text-slate-800 border-[#E2D8C3] focus:border-blue-500');

  useEscKey(onBack);

  useEffect(() => {
    if (initialData) {
      setClient(initialData.buyer?.name || initialData.client || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      
      const fullItems = (initialData as any).fullItems;
      if (Array.isArray(fullItems) && fullItems.length > 0) {
        setItems(fullItems);
      } else if (Array.isArray(initialData.items) && initialData.items.length > 0) {
        setItems(initialData.items.map((it: any) => ({
          id: it.id || Date.now(),
          name: it.name,
          qty: it.quantity || it.qty || 1,
          price: it.unitPrice || it.price || 0
        })));
      } else {
        setItems([{ id: Date.now(), name: (initialData as any).primaryItem || 'Jasa Layanan', qty: 1, price: initialData.totalAmount || initialData.amount || 0 }]);
      }

      setStatus(initialData.status || 'pending');
      setPaymentMethod((initialData as any).paymentMethod || 'Cash');
      
      const disc = initialData.discountAmount || (initialData as any).discount || 0;
      if (disc > 0) { 
        setUseDiscount(true); 
        setDiscount(disc); 
      }
      
      if ((initialData as any).hasTax !== undefined) {
        setUseTax((initialData as any).hasTax);
      } else if (initialData.taxAmount && initialData.taxAmount > 0) {
        setUseTax(true);
      }
    }
  }, [initialData]);
  
  const subTotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.qty || 0)), 0);
  const discountAmount = useDiscount ? discount : 0;
  const taxableAmount = Math.max(0, subTotal - discountAmount);
  const taxAmount = useTax ? taxableAmount * 0.1 : 0;
  const grandTotal = taxableAmount + taxAmount;
  const getSafeVal = (val: any, def = '') => val === null || val === undefined ? def : val;
  
  const handleAddItem = () => setItems([...items, { id: Date.now(), name: '', qty: 1, price: 0 }]);
  const handleRemoveItem = (id: any) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };
  const handleItemChange = (id: any, field: string, value: any) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleSelectProduct = (itemId: any, product: ProductItem) => { 
    setItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, name: product.name, price: product.price } : item)); 
    setActiveSearchRow(null); 
  };
  
  const handleSave = () => { 
    if (!client || items.length === 0) { 
      alert("Data tidak lengkap (Nama Klien dan Item wajib diisi)"); 
      return; 
    } 
    onSave({ 
      id: initialData ? initialData.id : `INV-${Math.floor(Math.random() * 10000)}`, 
      invoiceNumber: initialData?.invoiceNumber || `INV/2026/10/${Math.floor(100 + Math.random() * 900)}`,
      buyer: {
        id: initialData?.buyer?.id || `BYR-${Date.now()}`,
        name: client,
        phone: initialData?.buyer?.phone || '',
        email: initialData?.buyer?.email || '',
        address: initialData?.buyer?.address || ''
      },
      client, 
      date, 
      dueDate: initialData?.dueDate || '17 Okt 2026',
      totalAmount: grandTotal,
      amount: grandTotal, 
      subtotal: subTotal,
      taxAmount,
      discountAmount,
      status: status === 'paid' ? 'Lunas' : status === 'pending' ? 'Pending' : status, 
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        quantity: it.qty,
        unitPrice: it.price,
        totalPrice: it.qty * it.price
      })), 
      primaryItem: items[0]?.name || "Item Tanpa Nama", 
      fullItems: items, 
      discount: discountAmount, 
      paymentMethod, 
      tax: taxAmount, 
      hasTax: useTax 
    }); 
  };

  const getSuggestions = (query: string) => !query ? [] : (productMaster || []).filter(p => p && p.name && p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const getClientSuggestions = (query: string) => !query ? [] : (masterBuyers || []).filter(b => b && b.name && b.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const clientSuggestions = getClientSuggestions(client);
  const showClientSuggestionsBox = showClientSuggestions && clientSuggestions.length > 0;

  const paymentOptions = useMemo(() => ((settings as any)?.paymentMethods && (settings as any).paymentMethods.length > 0) ? (settings as any).paymentMethods : ['Cash', 'QRIS', 'Transfer BCA', 'Transfer Mandiri', 'Transfer BNI', 'Transfer BRI'], [settings]);

  return (
    <div className={`w-full ${cardBase} rounded-2xl border border-[#E2D8C3] dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors`}>
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-[#E2D8C3] dark:border-slate-800 flex items-center justify-between bg-[#F3EDE0]/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-[#E2D8C3] dark:border-slate-800 flex items-center justify-center shadow-xs hover:bg-[#FAF6EE] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white leading-tight" style={{ fontWeight: 600 }}>
              {initialData ? 'Edit Invoice' : 'Buat Invoice Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Lengkapi rincian invoice, pelanggan, dan daftar item transaksi
            </p>
          </div>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Section 1: Metadata & Customer */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400 font-sans" style={{ fontWeight: 600 }}>Status Pembayaran</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer font-sans font-semibold text-xs ${inputBase}`} style={{ fontWeight: 600 }}>
                  <option value="pending">Pending</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400 font-sans" style={{ fontWeight: 600 }}>Metode Pembayaran</label>
              <div className="relative">
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer font-sans font-semibold text-xs ${inputBase}`} style={{ fontWeight: 600 }}>
                  {paymentOptions.map((opt: any) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400 font-sans" style={{ fontWeight: 600 }}>Data Pelanggan (Nama Klien)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Nama Klien / Perusahaan..." 
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-sans font-semibold ${inputBase}`} 
                  value={client} 
                  onFocus={() => setShowClientSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                  onChange={(e) => {
                    setClient(e.target.value);
                    setShowClientSuggestions(true);
                  }}
                  style={{ fontWeight: 600 }} 
                />

                {showClientSuggestionsBox && (
                  <div className="absolute left-0 top-12 z-30 w-full rounded-xl shadow-2xl border border-[#E2D8C3] dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold font-sans uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Saran Data Pelanggan (Klien)</div>
                    {clientSuggestions.map((b: any) => (
                      <button 
                        key={b.id} 
                        type="button"
                        onClick={() => {
                          setClient(b.name);
                          setShowClientSuggestions(false);
                        }} 
                        className="w-full text-left px-3.5 py-2 transition-colors flex justify-between items-center hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <span className="text-xs font-sans font-semibold truncate">{b.name}</span>
                        <span className="text-[11px] font-sans text-slate-400">{b.phone || b.email || ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400 font-sans" style={{ fontWeight: 600 }}>Tanggal Invoice</label>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                isDark={isDark}
                placeholder="Pilih Tanggal Invoice..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="pt-4 border-t border-[#E2D8C3] dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-sans text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Daftar Item Belanja</h3>
            <button type="button" onClick={handleAddItem} className="text-xs font-bold font-sans px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-1 shadow-xs" style={{ fontWeight: 600 }}>
              <Plus size={14} />
              <span>Tambah Item</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => { 
              const suggestions = getSuggestions(item.name); 
              const showSuggestions = activeSearchRow === item.id && suggestions.length > 0; 
              return (
                <div key={item.id} className="relative">
                  <div className="p-3 bg-white/80 dark:bg-slate-950 border border-[#E2D8C3] dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs font-sans shrink-0" style={{ fontWeight: 600 }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-6 relative">
                          <input type="text" placeholder="Nama Produk / Barang..." className={`w-full bg-transparent border-b outline-none text-xs font-sans font-semibold pb-1 ${tableInput}`} value={getSafeVal(item.name)} onFocus={() => setActiveSearchRow(item.id)} onBlur={() => setTimeout(() => setActiveSearchRow(null), 200)} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} style={{ fontWeight: 600 }} />
                        </div>
                        <div className="col-span-3">
                          <input type="number" placeholder="Qty" min="1" className={`w-full bg-transparent border-b outline-none text-xs pb-1 font-sans font-semibold tabular-nums ${tableInput}`} value={getSafeVal(item.qty)} onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)} style={{ fontWeight: 600 }} />
                        </div>
                        <div className="col-span-3">
                          <input type="number" placeholder="Harga (Rp)" min="0" className={`w-full bg-transparent border-b outline-none text-xs pb-1 font-sans font-semibold tabular-nums ${tableInput}`} value={getSafeVal(item.price)} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} style={{ fontWeight: 600 }} />
                        </div>
                      </div>
                    </div>

                    <div className="text-right min-w-[90px] shrink-0">
                      <p className="font-sans font-semibold text-xs text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency((item.qty || 0) * (item.price || 0))}</p>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded cursor-pointer transition-colors shrink-0"
                        title="Hapus Item Ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {showSuggestions && (
                    <div className="absolute left-10 top-12 z-20 w-64 rounded-xl shadow-2xl border border-[#E2D8C3] dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold font-sans uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Saran Katalog Produk</div>
                      {suggestions.map(s => (
                        <button key={s.id} onClick={() => handleSelectProduct(item.id, s)} className="w-full text-left px-3.5 py-2 transition-colors flex justify-between items-center hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer">
                          <span className="text-xs font-sans font-semibold truncate">{s.name}</span>
                          <span className="text-xs font-sans font-semibold text-blue-600 dark:text-blue-400 tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency(s.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ); 
            })}
          </div>
        </div>

        {/* Section 3: Summary Totals */}
        <div className="pt-4 border-t border-[#E2D8C3] dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-sans">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase" style={{ fontWeight: 600 }}>Subtotal</span>
            <span className="font-sans font-semibold text-sm text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency(subTotal)}</span>
          </div>

          <div className="py-2 border-t border-dashed border-[#E2D8C3] dark:border-slate-800 flex justify-between items-center">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useDiscount ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`} onClick={() => setUseDiscount(!useDiscount)}>
                {useDiscount && <CheckSquare size={12} />}
              </div>
              <span className="text-xs font-bold font-sans text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>Diskon / Potongan</span>
            </label>
            {useDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-sans">Rp</span>
                <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-28 text-right bg-transparent border-b border-pink-300 dark:border-pink-500 outline-none text-xs font-sans font-semibold text-pink-600 dark:text-pink-400 tabular-nums" style={{ fontWeight: 600 }} />
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-sans">-</span>
            )}
          </div>

          <div className="flex justify-between items-center py-2 border-y border-dashed border-[#E2D8C3] dark:border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useTax ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`} onClick={() => setUseTax(!useTax)}>
                {useTax && <CheckSquare size={12} />}
              </div>
              <span className="text-xs font-bold font-sans text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>Pajak PPN (10%)</span>
            </label>
            <span className="font-sans font-semibold text-xs tabular-nums text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>{formatCurrency(taxAmount)}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold font-sans text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Total Akhir</span>
            <span className="text-xl font-sans font-semibold text-blue-600 dark:text-blue-400 tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-[#E2D8C3] dark:border-slate-800 bg-[#F3EDE0]/50 dark:bg-slate-950/50 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!client || isSaving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-sans font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          style={{ fontWeight: 600 }}
        >
          <Check size={16} />
          <span>{isSaving ? 'Menyimpan Invoice...' : initialData ? 'Simpan Perubahan Invoice' : 'Terbitkan Invoice Baru'}</span>
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
