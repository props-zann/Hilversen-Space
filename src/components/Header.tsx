import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  Sun, 
  Moon, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  ChevronDown,
  Wallet,
  Clock,
  Sparkles,
  Heart,
  MessageSquare,
  Globe,
  Check,
  Loader2,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { Language, translations } from '../utils/i18n';
import { signInWithGoogleReal, checkIsAdmin } from '../lib/firebase';

export type TabType = 
  | 'landing' 
  | 'collection' 
  | 'personal' 
  | 'creator-dump' 
  | 'donate-me' 
  | 'invoice' 
  | 'jadwal-sholat' 
  | 'about';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
  openCart: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: any;
  onLoginSuccess: (email: string, name: string, role: 'owner' | 'customer') => void;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  savedAccounts: any[];
  onSwitchAccount: (email: string) => void;
  onRemoveSavedAccount: (email: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  darkMode,
  setDarkMode,
  currentUser,
  onLoginSuccess,
  onLogout,
  lang,
  setLang,
  savedAccounts = [],
  onSwitchAccount,
  onRemoveSavedAccount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [personalDropdownOpen, setPersonalDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  
  // Login form states for fallback
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const personalDropdownRef = useRef<HTMLDivElement | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const signInDropdownRef = useRef<HTMLDivElement | null>(null);

  const t = translations[lang]?.nav || translations['id'].nav;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (personalDropdownRef.current && !personalDropdownRef.current.contains(event.target as Node)) {
        setPersonalDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (signInDropdownRef.current && !signInDropdownRef.current.contains(event.target as Node)) {
        setSignInDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOwner = currentUser?.role === 'owner';

  const personalSubItems = [
    { 
      id: 'personal' as const, 
      label: t.vault, 
      desc: t.vaultDesc,
      icon: Wallet 
    },
    { 
      id: 'creator-dump' as const, 
      label: t.creatorDump, 
      desc: t.creatorDumpDesc,
      icon: MessageSquare 
    },
    { 
      id: 'jadwal-sholat' as const, 
      label: t.prayer, 
      desc: t.prayerDesc,
      icon: Clock 
    },
    { 
      id: 'donate-me' as const, 
      label: t.donateMe, 
      desc: t.donateMeDesc,
      icon: Heart 
    }
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setPersonalDropdownOpen(false);
    setLangDropdownOpen(false);
    setSignInDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real Google Sign-In Action inside drawdown
  const handleRealGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { user, isAdmin } = await signInWithGoogleReal();
      const email = user.email || 'guest@gmail.com';
      const name = user.displayName || email.split('@')[0];
      onLoginSuccess(email, name, isAdmin ? 'owner' : 'customer');
      setSignInDropdownOpen(false);
    } catch (error: any) {
      console.error("Firebase Sign-In failed:", error);
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login ditutup sebelum selesai.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Permintaan login dibatalkan.');
      } else {
        setErrorMsg(error?.message || 'Gagal masuk dengan Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback Manual Email Submit inside drawdown
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Masukkan alamat email.');
      return;
    }
    if (!emailInput.includes('@')) {
      setErrorMsg('Format email tidak valid.');
      return;
    }

    const email = emailInput.trim().toLowerCase();
    const name = nameInput.trim() || email.split('@')[0];
    const isOwnerUser = checkIsAdmin(email);

    onLoginSuccess(email, name, isOwnerUser ? 'owner' : 'customer');
    setSignInDropdownOpen(false);
  };

  const isPersonalActive = ['personal', 'creator-dump', 'donate-me', 'jadwal-sholat'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3E9]/85 dark:bg-black/85 backdrop-blur-md transition-all duration-200 border-b border-black/[0.03] dark:border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('landing')}
          className="text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <span 
              className="text-lg sm:text-xl tracking-[0.18em] uppercase bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent"
              style={{ fontFamily: '"TT Turns", "Turns", "Plus Jakarta Sans", "Montserrat", sans-serif', fontWeight: 800 }}
            >
              Hilversen
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300" style={{ fontWeight: 600 }}>
          
          {/* Beranda */}
          <button
            onClick={() => handleNavClick('landing')}
            style={{ fontWeight: 600 }}
            className={`relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer font-semibold ${
              activeTab === 'landing' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.home}</span>
            {activeTab === 'landing' && (
              <motion.span
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Collection */}
          <button
            onClick={() => handleNavClick('collection')}
            style={{ fontWeight: 600 }}
            className={`relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer font-semibold ${
              activeTab === 'collection' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.collection}</span>
            {activeTab === 'collection' && (
              <motion.span
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Personal Dropdown (Click-to-Open) */}
          <div 
            className="relative py-2" 
            ref={personalDropdownRef}
          >
            <button
              onClick={() => {
                setPersonalDropdownOpen(!personalDropdownOpen);
                setLangDropdownOpen(false);
                setSignInDropdownOpen(false);
              }}
              style={{ fontWeight: 600 }}
              className={`relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1 font-semibold ${
                isPersonalActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t.personal}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${personalDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              {isPersonalActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Dropdown Menu Box */}
            <AnimatePresence>
              {personalDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1 w-72 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                >
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 mb-1 font-sans">
                    Ruang Personal & Creator
                  </div>

                  {personalSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                          isSubActive
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isSubActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-neutral-950 text-blue-600 dark:text-blue-400 border border-[#E2D8C3] dark:border-neutral-800'
                        }`}>
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-tight font-sans" style={{ fontWeight: 600 }}>{sub.label}</div>
                          <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSubActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {sub.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* About */}
          <button
            onClick={() => handleNavClick('about')}
            style={{ fontWeight: 600 }}
            className={`relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer font-semibold ${
              activeTab === 'about' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.about}</span>
            {activeTab === 'about' && (
              <motion.span
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Language Dropdown Nav Item (Click-to-Open) */}
          <div 
            className="relative py-2" 
            ref={langDropdownRef}
          >
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setPersonalDropdownOpen(false);
                setSignInDropdownOpen(false);
              }}
              style={{ fontWeight: 600 }}
              className="relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>{t.language}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {/* Language Dropdown Menu */}
            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1 w-48 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                >
                  <button
                    onClick={() => { setLang('id'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer font-sans ${
                      lang === 'id' ? 'bg-blue-600 text-white' : 'hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <span>Bahasa Indonesia</span>
                    {lang === 'id' && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>

                  <button
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer font-sans ${
                      lang === 'en' ? 'bg-blue-600 text-white' : 'hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <span>English (US)</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Creator View */}
          {isOwner && (
            <button
              onClick={() => handleNavClick('invoice')}
              style={{ fontWeight: 600 }}
              className={`relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center font-semibold ${
                activeTab === 'invoice' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Creator</span>
              {activeTab === 'invoice' && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )}

        </nav>

        {/* Zone 3: Dark Mode Toggle, Desktop Sign In & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Mode Gelap/Terang"
            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-lg border border-[#E2D8C3] dark:border-neutral-800 transition-colors cursor-pointer"
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Desktop Sign In / User Profile as Clean Text */}
          <div className="hidden lg:block">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setSignInDropdownOpen(false);
                  }}
                  style={{ fontWeight: 600 }}
                  className="relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                    {currentUser.name[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  {isOwner && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      className="absolute right-0 mt-2 w-72 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in"
                    >
                      <div className="flex flex-col items-center text-center pb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mb-2 ${isOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                          {currentUser.name[0]?.toUpperCase()}
                        </div>
                        <h4 className="font-bold text-sm flex items-center gap-1 justify-center font-sans" style={{ fontWeight: 600 }}>
                          <span>{currentUser.name}</span>
                          {isOwner && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                        </h4>
                        <p className="text-[10px] font-sans font-semibold text-slate-400 break-all tabular-nums" style={{ fontWeight: 600 }}>{currentUser.email}</p>
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans ${isOwner ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500'}`} style={{ fontWeight: 600 }}>
                          {isOwner ? 'Owner Whitelist' : 'Pelanggan / Guest'}
                        </span>
                      </div>

                      {/* Multi-account quick switching inside active profile dropdown */}
                      {savedAccounts && savedAccounts.filter(acc => acc.email.toLowerCase() !== currentUser.email.toLowerCase()).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.05] mb-2">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 font-sans">
                            Akun Lain di Device Ini
                          </span>
                          <div className="space-y-1">
                            {savedAccounts
                              .filter(acc => acc.email.toLowerCase() !== currentUser.email.toLowerCase())
                              .map(acc => {
                                const isAccOwner = acc.role === 'owner';
                                return (
                                  <div 
                                    key={acc.email}
                                    className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                                  >
                                    <button
                                      onClick={() => {
                                        onSwitchAccount(acc.email);
                                        setProfileDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                                    >
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isAccOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                                        {acc.name[0]?.toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold leading-none truncate flex items-center gap-1 font-sans text-slate-800 dark:text-slate-100">
                                          <span>{acc.name}</span>
                                          {isAccOwner && <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono leading-none truncate mt-0.5">{acc.email}</p>
                                      </div>
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveSavedAccount(acc.email);
                                      }}
                                      className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                      title="Hapus Akun"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] space-y-1">
                        {isOwner && (
                          <button
                            onClick={() => {
                              handleNavClick('invoice');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer font-sans"
                            style={{ fontWeight: 600 }}
                          >
                            <FileText size={14} />
                            <span>Owner Dashboard</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer font-sans"
                          style={{ fontWeight: 600 }}
                        >
                          <LogOut size={14} />
                          <span>Keluar (Sign Out)</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative" ref={signInDropdownRef}>
                <button
                  onClick={() => {
                    setSignInDropdownOpen(!signInDropdownOpen);
                    setProfileDropdownOpen(false);
                    setPersonalDropdownOpen(false);
                    setLangDropdownOpen(false);
                  }}
                  style={{ fontWeight: 600 }}
                  className="relative py-1 whitespace-nowrap transition-colors duration-150 cursor-pointer font-semibold text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-sans flex items-center gap-1"
                >
                  <span>Sign In</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${signInDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* PREMIUM DRAWDOWN SIGN-IN MODULE */}
                <AnimatePresence>
                  {signInDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 6 }}
                      className="absolute right-0 mt-2 w-72 bg-[#FAF6EE] dark:bg-neutral-900 border border-[#E2D8C3] dark:border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in"
                    >
                      <div className="text-center pb-3 border-b border-black/[0.05] dark:border-white/[0.05] mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans block mb-1">
                          Masuk Ke Sistem
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Gunakan Akun Google Resmi untuk sinkronisasi data cloud.
                        </p>
                      </div>

                      {/* Premium saved accounts list for instant one-tap login */}
                      {savedAccounts && savedAccounts.length > 0 && (
                        <div className="space-y-1.5 mb-4 max-h-[140px] overflow-y-auto">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1 font-sans">
                            Masuk Cepat (Akun Tersimpan)
                          </span>
                          {savedAccounts.map(acc => {
                            const isAccOwner = acc.role === 'owner';
                            return (
                              <div key={acc.email} className="flex items-center justify-between p-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.07] border border-black/[0.03] dark:border-white/[0.03] transition-colors">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onLoginSuccess(acc.email, acc.name, acc.role);
                                    setSignInDropdownOpen(false);
                                  }}
                                  className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isAccOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                                    {acc.name[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold leading-none truncate text-slate-800 dark:text-slate-100 font-sans flex items-center gap-1">
                                      <span>{acc.name}</span>
                                      {isAccOwner && <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono leading-none truncate mt-0.5">{acc.email}</p>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRemoveSavedAccount(acc.email)}
                                  className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Clean Official Google Sign-In Button */}
                      <button
                        type="button"
                        onClick={handleRealGoogleSignIn}
                        disabled={isLoading}
                        className="w-full py-2.5 px-3 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:shadow-md dark:bg-white dark:text-slate-900 dark:border-transparent font-bold text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-blue-600" />
                            <span>Menghubungkan...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Masuk dengan Google</span>
                          </>
                        )}
                      </button>

                      {/* Subtle divider */}
                      <div className="relative my-3 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-black/[0.05] dark:border-white/[0.05]" />
                        </div>
                        <span className="relative px-2 bg-[#FAF6EE] dark:bg-neutral-900 text-[9px] font-bold text-slate-400 uppercase">
                          Atau Email
                        </span>
                      </div>

                      {/* Secondary Manual Email input */}
                      <form onSubmit={handleManualSubmit} className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input
                            type="text"
                            placeholder="nama@gmail.com"
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setErrorMsg('');
                            }}
                            className="w-full pl-8 pr-2 py-1.5 text-[10px] outline-none border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>

                        {errorMsg && (
                          <p className="text-[9px] text-red-500 font-medium flex items-center gap-1">
                            <ShieldAlert size={10} />
                            <span>{errorMsg}</span>
                          </p>
                        )}

                        <button
                          type="submit"
                          className="w-full py-1.5 font-bold text-[10px] bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Masuk dengan Email
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigasi mobile"
            className="lg:hidden p-2 text-slate-900 dark:text-white hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-800 px-6 py-5 shadow-lg overflow-hidden space-y-2"
          >
            {/* Language Toggle for Mobile */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800 text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Pilih Bahasa / Language</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs font-bold">
                <button
                  onClick={() => setLang('id')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    lang === 'id' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('landing')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                activeTab === 'landing' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span>{t.home}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleNavClick('collection')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                activeTab === 'collection' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span>{t.collection}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </button>

            {/* Mobile Personal Section Accordion */}
            <div className="pt-2 pb-1 space-y-1">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 block px-3 py-1" style={{ fontWeight: 600 }}>
                Ruang Personal & Creator
              </span>

              {personalSubItems.map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleNavClick(sub.id)}
                    className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-2.5 ${
                      isSubActive ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-900'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <SubIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleNavClick('about')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-sans font-semibold transition-colors flex items-center justify-between ${
                activeTab === 'about' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-900'
              }`}
              style={{ fontWeight: 600 }}
            >
              <span>{t.about}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </button>

            {isOwner && (
              <button
                onClick={() => handleNavClick('invoice')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-sans font-semibold transition-colors flex items-center justify-between ${
                  activeTab === 'invoice' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-900'
                }`}
                style={{ fontWeight: 600 }}
              >
                <div className="flex items-center gap-2">
                  <span>Creator</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </button>
            )}

            {/* Mobile Sign In / Profile Link */}
            {currentUser ? (
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in" style={{ fontWeight: 600 }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                    {currentUser.name[0]?.toUpperCase()}
                  </div>
                  <span className="truncate">{currentUser.name}</span>
                  {isOwner && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </div>

                {/* Mobile saved accounts */}
                {savedAccounts && savedAccounts.filter(acc => acc.email.toLowerCase() !== currentUser.email.toLowerCase()).length > 0 && (
                  <div className="px-3 py-1.5 space-y-1.5 border-t border-slate-100 dark:border-neutral-800 mt-1 pt-2">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                      Akun Lain di Device Ini
                    </span>
                    {savedAccounts
                      .filter(acc => acc.email.toLowerCase() !== currentUser.email.toLowerCase())
                      .map(acc => {
                        const isAccOwner = acc.role === 'owner';
                        return (
                          <div key={acc.email} className="flex items-center justify-between py-1 bg-black/[0.01] dark:bg-white/[0.01] rounded-lg p-1.5">
                            <button
                              onClick={() => {
                                onSwitchAccount(acc.email);
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${isAccOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                                {acc.name[0]?.toUpperCase()}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-[10px] font-bold leading-none truncate text-slate-800 dark:text-slate-200 font-sans flex items-center gap-1">
                                  <span>{acc.name}</span>
                                  {isAccOwner && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                                </p>
                                <p className="text-[8px] text-slate-400 font-mono truncate leading-none mt-0.5">{acc.email}</p>
                              </div>
                            </button>
                            <button
                              onClick={() => onRemoveSavedAccount(acc.email)}
                              className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-sans font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  Keluar (Sign Out)
                </button>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 block px-3 py-1" style={{ fontWeight: 600 }}>
                  Sign In
                </span>
                
                {/* Mobile saved accounts for logged out */}
                {savedAccounts && savedAccounts.length > 0 && (
                  <div className="px-3 py-1.5 space-y-1.5 border-t border-slate-100 dark:border-neutral-800 mt-1 pt-2">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                      Masuk Cepat dengan Akun Tersimpan
                    </span>
                    {savedAccounts.map(acc => {
                      const isAccOwner = acc.role === 'owner';
                      return (
                        <div key={acc.email} className="flex items-center justify-between py-1 bg-black/[0.01] dark:bg-white/[0.01] p-1.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              onLoginSuccess(acc.email, acc.name, acc.role);
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${isAccOwner ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                              {acc.name[0]?.toUpperCase()}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-[10px] font-bold leading-none truncate text-slate-800 dark:text-slate-200 font-sans flex items-center gap-1">
                                <span>{acc.name}</span>
                                {isAccOwner && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                              </p>
                              <p className="text-[8px] text-slate-400 font-mono truncate leading-none mt-0.5">{acc.email}</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveSavedAccount(acc.email)}
                            className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Official Google button in mobile list */}
                <button
                  type="button"
                  onClick={handleRealGoogleSignIn}
                  disabled={isLoading}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-xs font-sans font-semibold flex items-center gap-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-98"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Lanjutkan dengan Akun Google Resmi</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
