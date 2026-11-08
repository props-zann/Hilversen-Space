import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  QrCode, 
  Copy, 
  Check, 
  CreditCard, 
  Sparkles, 
  Send, 
  Award,
  Gift,
  UserCheck
} from 'lucide-react';
import { formatRupiah } from '../data/mockData';

export interface Supporter {
  id: string;
  name: string;
  amount: number;
  message: string;
  createdAt: string;
  targetType?: 'creator' | 'charity';
}

const INITIAL_SUPPORTERS: Supporter[] = [];

interface DonateMePageProps {
  qrisImageUrl?: string;
  qrisString?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  ewalletName?: string;
  ewalletAccountNo?: string;
  ewalletAccountName?: string;
}

export const DonateMePage: React.FC<DonateMePageProps> = ({
  qrisImageUrl = '',
  qrisString = '00020101021126580016ID.GOPAY.WWW01189360091400000000005204581253033605802ID5918HILVERSEN ATELIER6007JAKARTA61051219062070703A016304E8A2',
  bankName = 'Bank BCA',
  bankAccountNo = '8820918244',
  bankAccountName = 'a.n. Fauzayyn Rachman',
  ewalletName = 'GoPay / OVO / DANA',
  ewalletAccountNo = '089675916774',
  ewalletAccountName = 'a.n. Hilversen Creator'
}) => {
  const [supporters, setSupporters] = useState<Supporter[]>(() => {
    const saved = localStorage.getItem('hilversen_supporters_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_SUPPORTERS;
  });

  useEffect(() => {
    localStorage.setItem('hilversen_supporters_list', JSON.stringify(supporters));
  }, [supporters]);

  // Form State
  const [supporterName, setSupporterName] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [targetType, setTargetType] = useState<'creator' | 'charity'>('creator');
  
  // Copy feedback states
  const [copiedQris, setCopiedQris] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedEwallet, setCopiedEwallet] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleCopyText = (text: string, setCopiedFn: (val: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!supporterName.trim() || isNaN(finalAmount) || finalAmount <= 0) return;

    const newSupporter: Supporter = {
      id: `SUP-${Date.now()}`,
      name: supporterName.trim(),
      amount: finalAmount,
      message: supporterMessage.trim() || 'Terima kasih atas karya terbaik Hilversen!',
      createdAt: 'Baru saja',
      targetType: targetType
    };

    setSupporters(prev => [newSupporter, ...prev]);
    setSupporterName('');
    setCustomAmount('');
    setSupporterMessage('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const hasBankDetails = Boolean(bankAccountNo && bankAccountNo.trim() !== '');
  const hasEwalletDetails = Boolean(ewalletAccountNo && ewalletAccountNo.trim() !== '');
  const showBankSection = hasBankDetails || hasEwalletDetails;

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Terima kasih! Dukungan & apresiasi Anda berhasil dicatat di Wall of Supporters!</span>
          </div>
        )}

        {/* Page Header (Total Apresiasi Terkumpul tab deleted per user request) */}
        <div className="border-b border-slate-200 dark:border-neutral-800 pb-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-rose-600 dark:text-rose-400 uppercase mb-2">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Apresiasi & Dukungan Creator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-slate-900 dark:text-white font-normal tracking-tight">
            Donate & Support Hilversen
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
            Dukungan Anda sangat berarti untuk membiayai eksperimen material, prototipe koleksi F1, dan keberlangsungan kreasi independen Hilversen.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Payment Methods (QRIS & Bank) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* QRIS Card */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>QRIS All Payment (Gopay, OVO, ShopeePay, Mobile Banking)</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded">Instant</span>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-black rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 text-center space-y-3">
                {qrisImageUrl && qrisImageUrl.trim() !== '' ? (
                  <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={qrisImageUrl} alt="QRIS Code" className="w-full h-full object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center relative">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,40 h10 v10 h-10 z M20,40 h20 v10 h-20 z M70,50 h20 v20 h-20 z M40,70 h20 v20 h-20 z M80,80 h20 v20 h-20 z M50,80 h10 v10 h-10 z M10,50 h10 v10 h-10 z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="px-2 py-1 bg-blue-600 text-white font-extrabold text-[10px] rounded shadow-md uppercase tracking-wider">
                        HILVERSEN QRIS
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan kode QRIS menggunakan kamera M-Banking / E-Wallet favorit Anda.
                </p>

                {qrisString && qrisString.trim() !== '' && (
                  <button
                    onClick={() => handleCopyText(qrisString, setCopiedQris)}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg hover:border-blue-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedQris ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQris ? 'String QRIS Tersalin!' : 'Salin String QRIS'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bank Transfer Details (Only shown if at least one account number is entered) */}
            {showBankSection && (
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Transfer Bank & E-Wallet</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Bank Transfer */}
                  {hasBankDetails && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{bankName || 'Bank BCA'}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{bankAccountNo}</span>
                        {bankAccountName && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{bankAccountName}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyText(bankAccountNo, setCopiedBank)}
                        className="p-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 rounded-lg hover:border-blue-500 transition-all cursor-pointer"
                        title="Salin No Rekening"
                      >
                        {copiedBank ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* E-Wallet */}
                  {hasEwalletDetails && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{ewalletName || 'E-Wallet'}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{ewalletAccountNo}</span>
                        {ewalletAccountName && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{ewalletAccountName}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyText(ewalletAccountNo, setCopiedEwallet)}
                        className="p-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 rounded-lg hover:border-blue-500 transition-all cursor-pointer"
                        title="Salin No E-Wallet"
                      >
                        {copiedEwallet ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Support Form & Wall of Supporters */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Support Form */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-neutral-800">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                <span>Kirim Dukungan & Pesan Semangat</span>
              </div>

              <form onSubmit={handleSubmitDonation} className="space-y-4">
                {/* Target Selection Option: Kirim ke Kreator vs Kirim sebagai Charity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pilih Tujuan Dukungan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('creator')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        targetType === 'creator'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:border-slate-400'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Kirim ke Kreator</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('charity')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        targetType === 'charity'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:border-slate-400'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Kirim sebagai Charity</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Donatur / Kolektor
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Raden Arya"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pilih Nominal Dukungan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {[10000, 25000, 50000, 100000].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedAmount === amt && !customAmount
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:border-slate-400'
                        }`}
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Atau masukkan nominal kustom (Rp)..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pesan Semangat / Pesanan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tulis ucapan semangat atau pesan khusus untuk creator..."
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!supporterName.trim()}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{targetType === 'charity' ? 'Kirim Apresiasi Charity' : 'Kirim Apresiasi ke Creator'}</span>
                </button>
              </form>
            </div>

            {/* Wall of Supporters */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Wall of Supporters ({supporters.length})</span>
                </div>
              </div>

              {supporters.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs italic bg-slate-50 dark:bg-neutral-950 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800">
                  Belum ada donasi tercatat. Jadilah pendukung pertama Hilversen!
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-none">
                  {supporters.map(supporter => (
                    <div
                      key={supporter.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{supporter.name}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            supporter.targetType === 'charity' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {supporter.targetType === 'charity' ? 'Charity' : 'Creator'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(supporter.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{supporter.message}"
                      </p>
                      <span className="text-[10px] text-slate-400 block text-right font-mono">{supporter.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
