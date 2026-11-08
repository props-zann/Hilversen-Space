import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { BuyerItem, InvoiceData } from '../types/invoice';
import { useEscKey, getInitials } from '../utils/helpers';

interface BuyerManagerProps {
  buyers: BuyerItem[];
  invoices: InvoiceData[];
  onUpdate: (buyer: BuyerItem) => void;
  onAdd: (buyer: BuyerItem) => void;
  onDelete?: (id: string) => void;
  isDark: boolean;
  isNotionMode?: boolean;
}

export const BuyerManager: React.FC<BuyerManagerProps> = ({ 
  buyers, 
  invoices, 
  onUpdate, 
  onAdd, 
  onDelete, 
  isDark, 
  isNotionMode = false 
}) => {
  const [editingBuyer, setEditingBuyer] = useState<BuyerItem | null>(null);
  const [confirmDeleteBuyer, setConfirmDeleteBuyer] = useState<BuyerItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBuyerData, setNewBuyerData] = useState({ name: '', phone: '', email: '', address: '' });
  const [showBuyerSuggestions, setShowBuyerSuggestions] = useState(false);
  const [highlightedBuyerIndex, setHighlightedBuyerIndex] = useState(-1);
  
  const buyerSuggestions = useMemo(() => {
    if (!newBuyerData.name.trim()) return [];
    return (buyers || []).filter(b => b && b.name && b.name.toLowerCase().includes(newBuyerData.name.toLowerCase()));
  }, [newBuyerData.name, buyers]);

  useEscKey(() => { 
    if (confirmDeleteBuyer) setConfirmDeleteBuyer(null);
    else if (showAddModal) setShowAddModal(false); 
    else if (editingBuyer) setEditingBuyer(null); 
  });
  
  const modalBg = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200');
  const inputBase = isNotionMode ? 'bg-white border-2 border-black rounded-none text-black placeholder:text-neutral-500' : (isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900');
  
  const handleSaveNewBuyer = () => { 
    if (!newBuyerData.name.trim()) { 
      return; 
    } 
    onAdd({ 
      id: `BYR-${Date.now()}`, 
      name: newBuyerData.name.trim(), 
      phone: newBuyerData.phone.trim() || undefined, 
      email: newBuyerData.email.trim() || undefined, 
      address: newBuyerData.address.trim() || undefined, 
      joinedAt: new Date().toISOString().split('T')[0] 
    }); 
    setNewBuyerData({ name: '', phone: '', email: '', address: '' }); 
    setShowBuyerSuggestions(false);
    setShowAddModal(false); 
  };

  const handleStartEdit = (buyer: BuyerItem) => {
    setEditingBuyer(buyer);
    setEditName(buyer.name || '');
    setEditPhone(buyer.phone || '');
    setEditEmail(buyer.email || '');
    setEditAddress(buyer.address || '');
  };

  const handleSaveEdit = () => { 
    if (editingBuyer && editName) { 
      onUpdate({ 
        ...editingBuyer, 
        name: editName,
        phone: editPhone,
        email: editEmail,
        address: editAddress
      }); 
      setEditingBuyer(null); 
    } 
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Daftar Pelanggan</h1>
          <p className={`${isNotionMode ? 'text-neutral-500 font-medium' : 'text-slate-400 font-medium'} text-sm`}>Database pelanggan & riwayat transaksi</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)} 
            className={isNotionMode ? "px-4 py-2 bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-none font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer" : "px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"}
          >
            <Plus size={16} /> Add Customer
          </button>
          <div className={`w-10 h-10 flex items-center justify-center ${isNotionMode ? 'bg-white text-black border-2 border-black rounded-none' : (isDark ? 'bg-blue-900/30 text-blue-400 rounded-full' : 'bg-blue-50 text-blue-600 rounded-full')}`}>
            <Users size={20} />
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {buyers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Users className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>Belum ada pelanggan tersimpan.</p>
          </div>
        ) : (
          buyers.map((buyer) => (
            <div 
              key={buyer.id} 
              onClick={() => handleStartEdit(buyer)} 
              className={`${isNotionMode ? 'bg-white border-2 border-black rounded-xl hover:bg-neutral-50 text-black shadow-none' : (isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 rounded-xl hover:shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 rounded-xl hover:shadow-md')} p-4 border flex justify-between items-center gap-3 group transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                <div className={`w-11 h-11 flex items-center justify-center shrink-0 text-sm font-bold ${isNotionMode ? 'bg-black text-white border-2 border-black rounded-full' : 'rounded-full bg-indigo-600 text-white mt-0.5'}`}>
                  {getInitials(buyer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm sm:text-base leading-snug break-words ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-slate-100' : 'text-slate-800')}`}>{buyer.name}</h4>
                  <p className={`text-xs font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 break-all ${isNotionMode ? 'text-neutral-500 font-semibold' : 'text-slate-500'}`}>
                    <span>{buyer.id}</span>
                    {buyer.phone && <span>• {buyer.phone}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${isNotionMode ? 'bg-neutral-100 border-2 border-black rounded-lg text-black font-extrabold' : (isDark ? 'bg-blue-900/30 text-blue-400 border-blue-900 rounded-md' : 'bg-blue-50 text-blue-600 border-blue-100 rounded-md')}`}>
                  {(invoices || []).filter(inv => ((inv?.buyer?.name || inv?.client || '').toLowerCase() === (buyer?.name || '').toLowerCase())).length} Transaksi
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POP-UP ADD PELANGGAN MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 360 }}
              className={`${modalBg} w-full max-w-sm p-6 relative z-10 border ${isNotionMode ? 'rounded-2xl border-2 border-black shadow-none' : 'rounded-2xl shadow-2xl'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Tambah Pelanggan</h3>
                <button onClick={() => setShowAddModal(false)} className={isNotionMode ? "p-2 border border-black text-black hover:bg-neutral-100 rounded-full bg-white" : `p-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <X size={20} className={isNotionMode ? 'text-black' : (isDark ? 'text-slate-400' : 'text-slate-400')}/>
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-bold uppercase tracking-wider ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>
                      Nama Lengkap *
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      (Wajib - Minimal nama terisi)
                    </span>
                  </div>
                  <input 
                    value={newBuyerData.name} 
                    onFocus={() => { setShowBuyerSuggestions(true); setHighlightedBuyerIndex(-1); }}
                    onBlur={() => setTimeout(() => setShowBuyerSuggestions(false), 200)}
                    onChange={(e) => { setNewBuyerData({...newBuyerData, name: e.target.value}); setShowBuyerSuggestions(true); setHighlightedBuyerIndex(-1); }} 
                    onKeyDown={(e) => {
                      if (showBuyerSuggestions && buyerSuggestions.length > 0 && highlightedBuyerIndex >= 0) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedBuyerIndex(prev => (prev < buyerSuggestions.length - 1 ? prev + 1 : 0));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedBuyerIndex(prev => (prev > 0 ? prev - 1 : buyerSuggestions.length - 1));
                        } else if (e.key === 'Enter') {
                          if (highlightedBuyerIndex >= 0 && highlightedBuyerIndex < buyerSuggestions.length) {
                            e.preventDefault();
                            const selected = buyerSuggestions[highlightedBuyerIndex];
                            setNewBuyerData({
                              name: selected.name || '',
                              phone: selected.phone || '',
                              email: selected.email || '',
                              address: selected.address || ''
                            });
                            setShowBuyerSuggestions(false);
                            setHighlightedBuyerIndex(-1);
                          }
                        } else if (e.key === 'Escape') {
                          setShowBuyerSuggestions(false);
                          setHighlightedBuyerIndex(-1);
                        }
                      } else if (e.key === 'Enter' && newBuyerData.name.trim()) {
                        e.preventDefault();
                        handleSaveNewBuyer();
                      }
                    }} 
                    className={`w-full px-4 py-3 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none bg-white text-black font-semibold' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} 
                    placeholder="Nama Pelanggan (Contoh: Alex Albon)..." 
                  />
                  {showBuyerSuggestions && buyerSuggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${isNotionMode ? 'bg-white border-2 border-black rounded-xl shadow-none text-black' : (isDark ? 'bg-slate-900 border-slate-700 rounded-xl shadow-2xl' : 'bg-white border-slate-200 rounded-xl shadow-2xl')}`}>
                      <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isNotionMode ? 'bg-neutral-100 text-black border-b-2 border-black' : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400')}`}>
                        Rekomendasi Pelanggan (Gunakan ↑ ↓ dan Enter)
                      </div>
                      {buyerSuggestions.map((s, idx) => {
                        const isSelected = idx === highlightedBuyerIndex;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            ref={(el) => { if (isSelected && el) el.scrollIntoView({ block: 'nearest' }); }}
                            onMouseEnter={() => setHighlightedBuyerIndex(idx)}
                            onMouseDown={() => {
                              setNewBuyerData({
                                name: s.name,
                                phone: s.phone || '',
                                email: s.email || '',
                                address: s.address || ''
                              });
                              setShowBuyerSuggestions(false);
                              setHighlightedBuyerIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs flex flex-col transition-colors border-b last:border-0 ${
                              isNotionMode
                                ? isSelected ? 'bg-neutral-200 text-black font-extrabold border-neutral-300' : 'hover:bg-neutral-50 text-black border-neutral-100'
                                : isSelected
                                  ? isDark ? 'bg-blue-900/70 text-white font-bold' : 'bg-blue-100/90 text-blue-900 font-bold'
                                  : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-200' : 'border-slate-100 hover:bg-blue-50/70 text-slate-800'
                            }`}
                          >
                            <span className="font-bold text-sm">{s.name}</span>
                            <span className={`text-[11px] font-mono ${isNotionMode ? 'text-neutral-500 font-semibold' : 'text-slate-400'}`}>{s.phone ? `HP: ${s.phone}` : s.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>No. Handphone (Opsional)</label>
                  <input value={newBuyerData.phone} onChange={(e) => setNewBuyerData({...newBuyerData, phone: e.target.value})} className={`w-full px-4 py-3 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none bg-white text-black font-mono font-bold' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} placeholder="0812..." type="tel"/>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>Email (Opsional)</label>
                  <input value={newBuyerData.email} onChange={(e) => setNewBuyerData({...newBuyerData, email: e.target.value})} className={`w-full px-4 py-3 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none bg-white text-black font-semibold' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} placeholder="email@example.com" type="email"/>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>Alamat (Opsional)</label>
                  <textarea value={newBuyerData.address} onChange={(e) => setNewBuyerData({...newBuyerData, address: e.target.value})} className={`w-full px-4 py-3 border outline-none resize-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none bg-white text-black font-medium' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} placeholder="Alamat lengkap..." rows={2}/>
                </div>
              </div>
              <button 
                type="button"
                disabled={!newBuyerData.name.trim()}
                onClick={handleSaveNewBuyer} 
                className={`w-full py-3 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isNotionMode ? 'bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 active:scale-98'}`}
              >
                Simpan Pelanggan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP EDIT PELANGGAN MODAL */}
      <AnimatePresence>
        {editingBuyer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
              onClick={() => setEditingBuyer(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 360 }}
              className={`${modalBg} w-full max-w-sm p-6 relative z-10 border ${isNotionMode ? 'rounded-2xl border-2 border-black shadow-none' : 'rounded-2xl shadow-2xl'}`}
            >
              <button onClick={() => setEditingBuyer(null)} className={`absolute right-4 top-4 p-2 ${isNotionMode ? 'text-black hover:bg-neutral-100 border border-black rounded-full bg-white' : (isDark ? 'bg-slate-800 text-slate-400 hover:text-white rounded-full' : 'bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full')}`}>
                <X size={18} />
              </button>
              <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 flex items-center justify-center text-white text-xl font-bold mb-2 ${isNotionMode ? 'bg-black text-white border-2 border-black rounded-full shadow-none' : 'rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/30'}`}>
                  {getInitials(editingBuyer.name)}
                </div>
                <h3 className={`text-xl font-bold ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Edit Pelanggan</h3>
                <p className={`text-xs font-mono ${isNotionMode ? 'text-neutral-500 font-extrabold' : 'text-slate-500'}`}>ID: {editingBuyer.id}</p>
              </div>
              <div className="mb-6 space-y-3.5 text-left max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>Nama Pelanggan *</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className={`w-full px-4 py-2.5 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none text-black font-semibold bg-white' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>No. Handphone</label>
                  <input 
                    type="tel" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)} 
                    className={`w-full px-4 py-2.5 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none text-black font-mono font-bold bg-white' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>Email</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)} 
                    className={`w-full px-4 py-2.5 border outline-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none text-black font-semibold bg-white' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isNotionMode ? 'text-black font-extrabold' : 'text-slate-400'}`}>Alamat</label>
                  <textarea 
                    rows={2} 
                    value={editAddress} 
                    onChange={(e) => setEditAddress(e.target.value)} 
                    className={`w-full px-4 py-2.5 border outline-none resize-none ${isNotionMode ? 'rounded-xl border-2 border-black focus:outline-none text-black font-medium bg-white' : `rounded-xl focus:ring-2 focus:ring-blue-500 ${inputBase}`}`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setConfirmDeleteBuyer(editingBuyer)} 
                  className={`py-3 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${isNotionMode ? 'bg-white hover:bg-neutral-100 border-2 border-red-600 text-red-600 rounded-xl font-bold' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200 dark:border-red-900/40 rounded-xl'}`}
                >
                  <Trash2 size={16} /> Hapus
                </button>
                <button 
                  onClick={() => setEditingBuyer(null)} 
                  className={`py-3 font-semibold text-xs transition-colors ${isNotionMode ? 'bg-white hover:bg-neutral-100 border-2 border-black text-black rounded-xl font-bold' : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl')}`}
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className={`py-3 font-semibold text-xs transition-colors ${isNotionMode ? 'bg-black hover:bg-neutral-800 border-2 border-black text-white rounded-xl font-bold' : 'bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20'}`}
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP CONFIRM DELETE PELANGGAN MODAL */}
      <AnimatePresence>
        {confirmDeleteBuyer && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" 
              onClick={() => setConfirmDeleteBuyer(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 380 }}
              className={`${modalBg} w-full max-w-sm p-6 relative z-10 border ${isNotionMode ? 'rounded-2xl border-2 border-black shadow-none text-black' : 'rounded-2xl shadow-2xl border-red-500/30'}`}
            >
              <button onClick={() => setConfirmDeleteBuyer(null)} className={`absolute right-4 top-4 p-2 ${isNotionMode ? 'text-black hover:bg-neutral-100 border border-black rounded-full bg-white' : (isDark ? 'bg-slate-800 text-slate-400 hover:text-white rounded-full' : 'bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full')}`}>
                <X size={18} />
              </button>
              <div className="flex flex-col items-center text-center mb-5">
                <div className={`w-14 h-14 flex items-center justify-center mb-3 ${isNotionMode ? 'bg-white border-2 border-black text-black rounded-2xl shadow-none' : 'rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10'}`}>
                  <Trash2 size={28} />
                </div>
                <h3 className={`text-lg font-bold ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Hapus Pelanggan?</h3>
                <p className={`text-sm font-semibold mt-1 ${isNotionMode ? 'text-red-600 font-extrabold' : 'text-slate-400'}`}>"{confirmDeleteBuyer.name}"</p>
              </div>

              {(() => {
                const relatedCount = (invoices || []).filter(
                  inv => ((inv?.buyer?.name || inv?.client || '').toLowerCase() === (confirmDeleteBuyer.name || '').toLowerCase())
                ).length;
                return (
                  <div className={`p-3.5 border text-xs mb-6 ${
                    isNotionMode 
                      ? 'bg-neutral-50 border border-black rounded-xl text-black font-semibold' 
                      : (isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300 rounded-xl' : 'bg-slate-50 border-slate-200 text-slate-600 rounded-xl')
                  }`}>
                    {relatedCount > 0 ? (
                      <div className="flex items-start gap-2 text-left">
                        <AlertTriangle size={16} className={isNotionMode ? "text-black shrink-0 mt-0.5" : "text-amber-500 shrink-0 mt-0.5"} />
                        <span>
                          Pelanggan ini memiliki <strong className={isNotionMode ? "text-black font-black underline" : "text-amber-500"}>{relatedCount} riwayat transaksi</strong>. Menghapus data dari master tidak akan menghapus riwayat faktur yang sudah terbit.
                        </span>
                      </div>
                    ) : (
                      <p className={`${isNotionMode ? 'text-black font-medium' : 'text-slate-400'} text-center`}>
                        Tindakan ini tidak dapat dibatalkan. Pelanggan akan dihapus secara permanen dari daftar master.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmDeleteBuyer(null)} 
                  className={`py-3 font-bold text-xs transition-colors ${isNotionMode ? 'bg-white hover:bg-neutral-100 border-2 border-black text-black rounded-xl' : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl')}`}
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (onDelete && confirmDeleteBuyer?.id) {
                      onDelete(confirmDeleteBuyer.id);
                    }
                    setConfirmDeleteBuyer(null);
                    setEditingBuyer(null);
                  }} 
                  className={`py-3 font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${isNotionMode ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-xl shadow-none' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 rounded-xl'}`}
                >
                  <Trash2 size={16} /> Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyerManager;
