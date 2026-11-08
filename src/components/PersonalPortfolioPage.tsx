import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  History,
  TrendingUp,
  Plus,
  Coins,
  Edit3,
  Trash2,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { PortfolioContributor } from '../types';
import { formatRupiah } from '../data/mockData';
import { SmoothLineChart } from './SmoothLineChart';
import { CustomDatePicker } from './CustomDatePicker';

interface PersonalPortfolioPageProps {
  members: PortfolioContributor[];
  portfolioUniqueCode?: string;
  onAddDeposit?: (memberId: string, amount: number, note: string, customDate?: string) => void;
  onUpdateDeposit?: (memberId: string, depositId: string, updatedData: { amount: number; date: string; note: string }) => void;
  onDeleteDeposit?: (memberId: string, depositId: string) => void;
  onUpdateMember?: (updatedMember: PortfolioContributor) => void;
  onAddMember?: (newMember: PortfolioContributor) => void;
  onDeleteMember?: (memberId: string) => void;
  currentUser?: any;
}

export const PersonalPortfolioPage: React.FC<PersonalPortfolioPageProps> = ({
  members,
  portfolioUniqueCode = 'HILVERSEN2026',
  onAddDeposit,
  onUpdateDeposit,
  onDeleteDeposit,
  onUpdateMember,
  onAddMember,
  onDeleteMember,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole] = useState<string>('all');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const isOwner = currentUser?.role === 'owner';
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return isOwner || sessionStorage.getItem('hilversen_portfolio_unlocked') === 'true';
  });
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  useEffect(() => {
    if (isOwner) {
      setIsUnlocked(true);
    }
  }, [isOwner]);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = (portfolioUniqueCode || 'HILVERSEN2026').trim();
    if (unlockInput.trim() === correctCode) {
      setIsUnlocked(true);
      sessionStorage.setItem('hilversen_portfolio_unlocked', 'true');
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  // Active Deposit / Expense Form State
  const [addingDepositForId, setAddingDepositForId] = useState<string | null>(null);
  const [txType, setTxType] = useState<'setoran' | 'pengeluaran'>('setoran');
  const [depAmount, setDepAmount] = useState('');
  const [depNote, setDepNote] = useState('');
  const [depDateRaw, setDepDateRaw] = useState(() => new Date().toISOString().split('T')[0]);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<PortfolioContributor | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberTier, setEditMemberTier] = useState<string>('Atelier Member');
  const [editMemberStatus, setEditMemberStatus] = useState<string>('Aktif');
  const [editMemberEmoji, setEditMemberEmoji] = useState('🌤️');

  // Edit Deposit Row Modal State
  const [editingDeposit, setEditingDeposit] = useState<{ memberId: string; depositId: string; amount: string; date: string; note: string } | null>(null);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (editingMember || editingDeposit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingMember, editingDeposit]);

  const totalMembers = members.length;

  const formatDateToIndo = (rawDateStr: string) => {
    if (!rawDateStr) return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const dateObj = new Date(rawDateStr);
    if (isNaN(dateObj.getTime())) return rawDateStr;
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || m.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleExpandMember = (id: string) => {
    setExpandedMemberId(prev => (prev === id ? null : id));
  };

  const handleOpenEditMember = (member: PortfolioContributor) => {
    setEditingMember(member);
    setEditMemberName(member.name);
    setEditMemberRole(member.role || '');
    setEditMemberEmoji(member.iconEmoji || '🌤️');
  };

  const handleSaveEditMember = () => {
    if (!editingMember || !onUpdateMember) return;
    const updated: PortfolioContributor = {
      ...editingMember,
      name: editMemberName.trim() || editingMember.name,
      role: editMemberRole.trim(),
      iconEmoji: editMemberEmoji || editingMember.iconEmoji
    };
    onUpdateMember(updated);
    setEditingMember(null);
  };

  const handleOpenEditDeposit = (memberId: string, item: { id: string; amount: number; date: string; note: string }) => {
    setEditingDeposit({
      memberId,
      depositId: item.id,
      amount: item.amount.toString(),
      date: item.date,
      note: item.note
    });
  };

  const handleSaveEditDeposit = () => {
    if (!editingDeposit || !onUpdateDeposit) return;
    const amt = parseFloat(editingDeposit.amount) || 0;
    if (amt <= 0) return;
    onUpdateDeposit(editingDeposit.memberId, editingDeposit.depositId, {
      amount: amt,
      date: editingDeposit.date,
      note: (editingDeposit.note || '').trim()
    });
    setEditingDeposit(null);
  };

  const handleDeleteDepositItem = (memberId: string, depositId: string) => {
    if (onDeleteDeposit) {
      onDeleteDeposit(memberId, depositId);
    }
  };

  // Helper to split array into N columns for true Masonry layout
  const getMasonryColumns = <T,>(items: T[], columnCount: number): T[][] => {
    const columns: T[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  // Render Notion Gallery Card with Integrated Single Frame
  const renderCard = (m: PortfolioContributor) => {
    const isExpanded = expandedMemberId === m.id;
    const emoji = m.iconEmoji || '🌤️';

    // Build fallback chart history if none provided
    const chartData = m.chartHistory || [
      { label: 'Awal', fullDate: 'Setoran Awal', totalBalance: m.balance * 0.6, depositAccumulated: m.balance * 0.6, yieldReturn: 0 },
      { label: 'Kini', fullDate: 'Oktober 2026', totalBalance: m.balance, depositAccumulated: m.balance, yieldReturn: 0 }
    ];

    // Build fallback deposit history if none provided
    const depositHistoryList = m.depositHistory || [
      { id: `dh-${m.id}-1`, date: m.lastDeposit, amount: m.balance, note: 'Pencatatan Setoran Tabungan', totalAfter: m.balance }
    ];

    return (
      <div
        key={m.id}
        className={`bg-[#FCFAF4] dark:bg-neutral-900 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between w-full ${
          isExpanded
            ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 overflow-visible'
            : 'border-[#E2D8C3] dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-700 overflow-hidden'
        }`}
      >
        {/* Notion Card Header & Summary (Always Visible) */}
        <div
          onClick={() => toggleExpandMember(m.id)}
          className="p-6 cursor-pointer space-y-4 select-none"
        >
          {/* Top Header: Emoji + Name */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none">{emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-lg font-semibold text-slate-900 dark:text-white leading-tight" style={{ fontWeight: 600 }}>
                    {m.name}
                  </h3>
                  {isOwner && onUpdateMember && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditMember(m);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Anggota"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                </div>
                {m.role && m.role.trim() !== '' && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
                    {m.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Big Balance Row */}
          <div className="pt-2 border-t border-[#E2D8C3]/60 dark:border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold font-sans tracking-wider text-slate-400 block mb-1" style={{ fontWeight: 600 }}>
              Nominal Tabungan
            </span>
            <div className="text-2xl sm:text-3xl font-sans font-semibold text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>
              {formatRupiah(m.balance)}
            </div>
          </div>

          {/* Metadata Info Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px]" style={{ fontWeight: 600 }}>
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Terakhir: {m.lastDeposit}</span>
            </div>

            <button
              type="button"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Sembunyikan Detail' : 'Grafik & Riwayat'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Integrated Continuous Expanded Section (Single Unified Card Frame) */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'visible' }}
              className="border-t border-[#E2D8C3] dark:border-neutral-800 bg-[#F5F0E6] dark:bg-black/40"
            >
              <div className="p-4 sm:p-5 space-y-4">
                {/* Panel Header */}
                <div className="pb-2 border-b border-[#E2D8C3] dark:border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <h4 className="font-sans text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Perkembangan Tabungan
                    </h4>
                  </div>
                </div>

                {/* Individual Smooth Curve Chart */}
                <div className="bg-white dark:bg-[#131C31] p-3 rounded-xl border border-[#E2D8C3] dark:border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
                    <span>Kurva Pertumbuhan Saldo</span>
                  </div>
                  <div className="w-full">
                    <SmoothLineChart data={chartData} height={180} />
                  </div>
                </div>

                {/* Savings Deposit History List */}
                <div className="bg-white dark:bg-[#131C31] p-3.5 rounded-xl border border-[#E2D8C3] dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2D8C3] dark:border-neutral-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-sans text-xs font-bold text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                        History
                      </h5>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingDepositForId(addingDepositForId === m.id ? null : m.id);
                          setDepAmount('');
                          setDepNote('');
                          setTxType('setoran');
                        }}
                        className="px-2.5 py-1 text-xs font-sans font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {addingDepositForId === m.id ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{addingDepositForId === m.id ? 'Batal' : '+ Tambah Transaksi'}</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Add Transaction Form (Pemasukan / Pengeluaran) */}
                  {addingDepositForId === m.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2 text-xs"
                    >
                      {/* Segmented Control for Transaction Type */}
                      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setTxType('setoran')}
                          className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            txType === 'setoran'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          + Pemasukan
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxType('pengeluaran')}
                          className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            txType === 'pengeluaran'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          - Pengeluaran
                        </button>
                      </div>

                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        Form Input {txType === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan Baru'} untuk {m.name}:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                            {txType === 'pengeluaran' ? 'Nominal Pengeluaran (Rp) *' : 'Nominal Pemasukan (Rp) *'}
                          </label>
                          <input
                            type="number"
                            placeholder="Contoh: 500000"
                            value={depAmount}
                            onChange={(e) => setDepAmount(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none font-mono font-bold"
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                            <Calendar size={11} className="text-blue-500" />
                            <span>Tanggal Transaksi *</span>
                          </label>
                          <CustomDatePicker
                            value={depDateRaw}
                            onChange={(val) => setDepDateRaw(val)}
                            placeholder="Pilih Tanggal Transaksi..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Keterangan / Catatan Transaksi (Opsional)</label>
                        <input
                          type="text"
                          placeholder={txType === 'pengeluaran' ? 'Contoh: Penarikan Hasil / Pembayaran Tagihan' : 'Contoh: Pemasukan Hasil Proyek / Kas Komunitas'}
                          value={depNote}
                          onChange={(e) => setDepNote(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={!depAmount || parseFloat(depAmount) <= 0}
                        onClick={() => {
                          const rawAmt = parseFloat(depAmount) || 0;
                          if (rawAmt > 0 && onAddDeposit) {
                            const finalAmt = txType === 'pengeluaran' ? -Math.abs(rawAmt) : Math.abs(rawAmt);
                            const formatted = formatDateToIndo(depDateRaw);
                            onAddDeposit(m.id, finalAmt, depNote.trim(), formatted);
                            setAddingDepositForId(null);
                            setDepAmount('');
                            setDepNote('');
                          }
                        }}
                        className={`w-full py-2 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 mt-1 shadow-xs ${
                          txType === 'pengeluaran' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{txType === 'pengeluaran' ? 'Simpan Pengeluaran & Update Saldo' : 'Simpan Pemasukan & Update Saldo'}</span>
                      </button>
                    </motion.div>
                  )}

                  <div className="space-y-2 divide-y divide-[#E2D8C3]/50 dark:divide-neutral-800">
                    {depositHistoryList.map((dh) => {
                      const isExpense = dh.amount < 0 || (dh as any).type === 'pengeluaran';
                      const absAmount = Math.abs(dh.amount);
                      return (
                        <div key={dh.id} className="pt-2 flex flex-col gap-1 text-xs group">
                          {/* Top Row: Nominal Amount on Top */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-sans font-bold text-xs tabular-nums px-2 py-0.5 rounded-md ${isExpense ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'}`} style={{ fontWeight: 700 }}>
                              {isExpense ? `- ${formatRupiah(absAmount)}` : `+ ${formatRupiah(absAmount)}`}
                            </span>
                            {isOwner && (
                              <div className="flex items-center gap-1">
                                {onUpdateDeposit && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDeposit(m.id, dh)}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                                    title="Edit Baris Ini"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                )}
                                {onDeleteDeposit && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDepositItem(m.id, dh.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                                    title="Hapus Baris Ini"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Bottom Row: Date & Note & Total Balance */}
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0" style={{ fontWeight: 600 }}>{dh.date}</span>
                              {dh.note && dh.note.trim() !== '' && (
                                <span className="truncate text-slate-600 dark:text-slate-300">
                                  • {dh.note}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-auto" style={{ fontWeight: 600 }}>Total: {formatRupiah(dh.totalAfter)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Close Detail Action Button at Bottom */}
                <button
                  onClick={() => toggleExpandMember(m.id)}
                  className="w-full py-2 bg-slate-200/80 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center block"
                >
                  Tutup Detail ▲
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="border-b border-[#E2D8C3] dark:border-slate-800 pb-8">
          <h1 className="text-3xl sm:5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Portofolio tabungan komunitas
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Tempat pencatatan tabungan yang dipercayakan kepada kreator oleh teman untuk disimpan atau dikelola sesuai perjanjian yang telah disepakati.
          </p>
        </div>

        {/* Section Title & Description */}
        <div className="bg-[#FCFAF4] dark:bg-[#131C31] p-6 sm:p-8 rounded-2xl border border-[#E2D8C3] dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>
              Disclaimer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Daftar saldo yang terakumulasi, Halaman ini dibuat sebagai dokumentasi dan transparansi pribadi, bukan sebagai penawaran jasa pengelolaan dana, produk investasi, atau ajakan kepada masyarakat untuk menyerahkan dana. Kreator tidak menjanjikan keuntungan atau imbal hasil tertentu. Setiap hubungan pengelolaan dana dilakukan secara pribadi berdasarkan akad dan kesepakatan masing-masing pihak.
            </p>
          </div>

          {/* Controls: Search & Filters */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2D8C3] dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama teman atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#E2D8C3] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
              <span>Menampilkan: <strong>{filteredMembers.length}</strong> dari <strong>{totalMembers}</strong> teman</span>
            </div>
          </div>
        </div>

        {/* Unlock Barrier Card if not unlocked */}
        {!isUnlocked && !isOwner && (
          <div className="bg-[#FCFAF4] dark:bg-[#131C31] border-2 border-blue-500/40 dark:border-blue-500/50 rounded-3xl p-8 sm:p-12 shadow-xl max-w-2xl mx-auto text-center space-y-6 my-6">
            <div className="w-16 h-16 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Portofolio Anggota Dikunci (Eksklusif)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                Untuk menjaga privasi dan transparansi komunitas, nama anggota dan nominal tabungan disembunyikan. Masukkan kode unik akses yang valid dari kreator untuk membuka seluruh data.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-3 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Masukkan Kode Unik Akses..."
                  value={unlockInput}
                  onChange={(e) => {
                    setUnlockInput(e.target.value);
                    setUnlockError(false);
                  }}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center outline-none focus:border-blue-600 shadow-inner"
                />
              </div>
              {unlockError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 animate-bounce">
                  Kode unik salah! Silakan coba lagi atau minta kode ke admin.
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer tracking-wide uppercase"
              >
                Buka Akses Portofolio
              </button>
            </form>
          </div>
        )}

        {/* Notion Gallery Grid with True Column Masonry Layout */}
        <div className={`transition-all duration-300 ${!isUnlocked && !isOwner ? 'filter blur-[12px] opacity-35 select-none pointer-events-none' : ''}`}>
          {/* Desktop Layout (3 Masonry Columns) */}
          <div className="hidden lg:flex gap-6 items-start">
            {getMasonryColumns(filteredMembers, 3).map((colItems, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-6">
                {colItems.map((m) => renderCard(m))}
              </div>
            ))}
          </div>

          {/* Tablet Layout (2 Masonry Columns) */}
          <div className="hidden md:flex lg:hidden gap-6 items-start">
            {getMasonryColumns(filteredMembers, 2).map((colItems, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-6">
                {colItems.map((m) => renderCard(m))}
              </div>
            ))}
          </div>

          {/* Mobile Layout (1 Column Stack) */}
          <div className="flex md:hidden flex-col gap-6">
            {filteredMembers.map((m) => renderCard(m))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Tidak ada catatan tabungan yang cocok dengan pencarian Anda.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL EDIT ANGGOTA */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2D8C3] dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans" style={{ fontWeight: 600 }}>
                    Edit Data Anggota: {editingMember.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Nama Lengkap</label>
                    <input
                      type="text"
                      value={editMemberName}
                      onChange={(e) => setEditMemberName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                      style={{ fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Emoji Icon</label>
                    <input
                      type="text"
                      value={editMemberEmoji}
                      onChange={(e) => setEditMemberEmoji(e.target.value)}
                      placeholder="🌤️"
                      className="w-full px-3 py-2 text-center text-base bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl outline-none focus:border-blue-600 font-sans font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Peran / Jabatan Anggota (Opsional)</label>
                  <input
                    type="text"
                    value={editMemberRole}
                    onChange={(e) => setEditMemberRole(e.target.value)}
                    placeholder="Boleh dikosongkan..."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E2D8C3] dark:border-neutral-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditMember}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 font-sans"
                  style={{ fontWeight: 600 }}
                >
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDIT BARIS RIWAYAT SETORAN */}
      <AnimatePresence>
        {editingDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2D8C3] dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans" style={{ fontWeight: 600 }}>
                    Edit Riwayat Transaksi
                  </h3>
                </div>
                <button
                  onClick={() => setEditingDeposit(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>
                    Nominal Transaksi (Rp) * (Gunakan tanda - untuk pengeluaran, misal -500000)
                  </label>
                  <input
                    type="number"
                    value={editingDeposit.amount}
                    onChange={(e) => setEditingDeposit({ ...editingDeposit, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white font-sans font-semibold tabular-nums outline-none focus:border-blue-600"
                    style={{ fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1 font-sans" style={{ fontWeight: 600 }}>
                    <Calendar size={12} className="text-blue-500" />
                    <span>Tanggal Transaksi *</span>
                  </label>
                  <CustomDatePicker
                    value={editingDeposit.date.includes('-') ? editingDeposit.date : ''}
                    onChange={(val) => {
                      const formatted = val ? formatDateToIndo(val) : editingDeposit.date;
                      setEditingDeposit({ ...editingDeposit, date: formatted });
                    }}
                    placeholder="Pilih Tanggal Transaksi..."
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 font-sans tabular-nums font-semibold" style={{ fontWeight: 600 }}>Terformat: {editingDeposit.date}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Keterangan / Catatan Transaksi</label>
                  <input
                    type="text"
                    value={editingDeposit.note || ''}
                    onChange={(e) => setEditingDeposit({ ...editingDeposit, note: e.target.value })}
                    placeholder="Boleh dikosongkan..."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E2D8C3] dark:border-neutral-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDeposit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditDeposit}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 font-sans"
                  style={{ fontWeight: 600 }}
                >
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
