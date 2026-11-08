import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, TabType } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { CollectionPage } from './components/CollectionPage';
import { PersonalPortfolioPage } from './components/PersonalPortfolioPage';
import { CreatorDumpPage } from './components/CreatorDumpPage';
import { DonateMePage } from './components/DonateMePage';
import { InvoiceView } from './components/InvoiceView';
import { PrayerSchedulePage } from './components/PrayerSchedulePage';
import { AboutPage } from './components/AboutPage';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InvoiceForm } from './components/InvoiceForm';
import { ExportModal } from './components/ExportModal';
import { Footer } from './components/Footer';

import { Product, CartItem, PortfolioContributor, CityPrayerConfig } from './types';
import { InvoiceData, BusinessSettings, ProductItem, BuyerItem } from './types/invoice';
import { INITIAL_PORTFOLIO_MEMBERS, CITIES, PRODUCTS } from './data/mockData';
import { INITIAL_INVOICES, INITIAL_BUSINESS_SETTINGS } from './data/initialInvoices';
import { calculatePrayerTimes, getNextPrayer } from './utils/prayerTimes';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Language } from './utils/i18n';
import { resolveProductImageUrl } from './utils/resolveImage';

// Firebase & Firestore Sync
import { auth, checkIsAdmin, logOutUser } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  DEFAULT_CMS_SETTINGS,
  subscribeCmsSettings,
  saveCmsSettingsToFirestore,
  subscribeProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribePortfolioMembers,
  savePortfolioMemberToFirestore,
  deletePortfolioMemberFromFirestore,
  subscribeInvoices,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore,
  subscribeBuyers,
  saveBuyerToFirestore,
  deleteBuyerFromFirestore
} from './lib/firestoreSync';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('hilversen_language');
    return (saved === 'en' ? 'en' : 'id') as Language;
  });

  useEffect(() => {
    localStorage.setItem('hilversen_language', lang);
  }, [lang]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // User Role & Authentication State (Real Google Sign-In with Firebase)
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: 'owner' | 'customer' } | null>(null);

  // Synchronous cache reader for CMS Settings to prevent Flash of Default Content (FOUC) on refresh
  const [initialCms] = useState(() => {
    const cached = localStorage.getItem('hilversen_cms_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return { ...DEFAULT_CMS_SETTINGS, ...parsed };
      } catch (e) {}
    }
    return DEFAULT_CMS_SETTINGS;
  });

  // CMS custom home & about content states
  const [heroTitle, setHeroTitleState] = useState(initialCms.heroTitle);
  const [heroSubtitle, setHeroSubtitleState] = useState(initialCms.heroSubtitle || '');
  const [heroSuffix, setHeroSuffixState] = useState(initialCms.heroSuffix || '');
  const [heroDescription, setHeroDescriptionState] = useState(initialCms.heroDescription);
  const [heroCtaText, setHeroCtaTextState] = useState(initialCms.heroCtaText);
  const [heroImageUrl, setHeroImageUrlState] = useState(initialCms.heroImageUrl || '');

  const [aboutHeroTag, setAboutHeroTagState] = useState(initialCms.aboutHeroTag);
  const [aboutTitle, setAboutTitleState] = useState(initialCms.aboutTitle);
  const [aboutDescription, setAboutDescriptionState] = useState(initialCms.aboutDescription);
  const [aboutConciergeTag, setAboutConciergeTagState] = useState(initialCms.aboutConciergeTag);
  const [aboutConciergeTitle, setAboutConciergeTitleState] = useState(initialCms.aboutConciergeTitle);
  const [aboutConciergeDesc, setAboutConciergeDescState] = useState(initialCms.aboutConciergeDesc);
  const [aboutInstagram, setAboutInstagramState] = useState(initialCms.aboutInstagram);
  const [aboutEmail, setAboutEmailState] = useState(initialCms.aboutEmail);
  const [aboutPhone, setAboutPhoneState] = useState(initialCms.aboutPhone);

  // Donate Me CMS states
  const [qrisImageUrl, setQrisImageUrlState] = useState(initialCms.qrisImageUrl || '');
  const [qrisString, setQrisStringState] = useState(initialCms.qrisString || '');
  const [bankName, setBankNameState] = useState(initialCms.bankName || 'Bank BCA');
  const [bankAccountNo, setBankAccountNoState] = useState(initialCms.bankAccountNo !== undefined ? initialCms.bankAccountNo : '8820918244');
  const [bankAccountName, setBankAccountNameState] = useState(initialCms.bankAccountName || 'a.n. Fauzayyn Rachman');
  const [ewalletName, setEwalletNameState] = useState(initialCms.ewalletName || 'GoPay / OVO / DANA');
  const [ewalletAccountNo, setEwalletAccountNoState] = useState(initialCms.ewalletAccountNo !== undefined ? initialCms.ewalletAccountNo : '089675916774');
  const [ewalletAccountName, setEwalletAccountNameState] = useState(initialCms.ewalletAccountName || 'a.n. Hilversen Creator');

  const [ecosystemPartners, setEcosystemPartnersState] = useState(initialCms.ecosystemPartners);
  const [portfolioUniqueCode, setPortfolioUniqueCodeState] = useState(initialCms.portfolioUniqueCode || 'HILVERSEN2026');

  // Master products list synced with Firestore
  const [storeProducts, setStoreProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hilversen_products_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return PRODUCTS;
  });

  // Portfolio Members synced with Firestore
  const [members, setMembers] = useState<PortfolioContributor[]>(() => {
    const saved = localStorage.getItem('hilversen_members_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_PORTFOLIO_MEMBERS;
  });

  // Invoices & Buyers synced with Firestore
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('hilversen_invoices_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_INVOICES;
  });
  const [buyers, setBuyers] = useState<BuyerItem[]>(() => {
    const saved = localStorage.getItem('hilversen_buyers_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [currentCity, setCurrentCity] = useState<CityPrayerConfig>(CITIES[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [businessSettings] = useState<BusinessSettings>(INITIAL_BUSINESS_SETTINGS);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [exportInvoice, setExportInvoice] = useState<InvoiceData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // 1. Firebase Auth State Listener (Real Google Accounts)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || email.split('@')[0] || 'User';
        const isOwner = checkIsAdmin(email);
        setCurrentUser({ email, name, role: isOwner ? 'owner' : 'customer' });
      } else {
        // If not logged in with Firebase, check if session is stored
        const stored = localStorage.getItem('hilversen_user_session');
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch (e) {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Firestore Cloud Realtime Synchronization
  useEffect(() => {
    // Subscribe to CMS Settings from Cloud Firestore
    const unsubCms = subscribeCmsSettings((data) => {
      setHeroTitleState(data.heroTitle);
      setHeroSubtitleState(data.heroSubtitle);
      setHeroSuffixState(data.heroSuffix);
      setHeroDescriptionState(data.heroDescription);
      setHeroCtaTextState(data.heroCtaText);
      setHeroImageUrlState(data.heroImageUrl || '');

      setAboutHeroTagState(data.aboutHeroTag);
      setAboutTitleState(data.aboutTitle);
      setAboutDescriptionState(data.aboutDescription);
      setAboutConciergeTagState(data.aboutConciergeTag);
      setAboutConciergeTitleState(data.aboutConciergeTitle);
      setAboutConciergeDescState(data.aboutConciergeDesc);
      setAboutInstagramState(data.aboutInstagram);
      setAboutEmailState(data.aboutEmail);
      setAboutPhoneState(data.aboutPhone);

      setQrisImageUrlState(data.qrisImageUrl || '');
      setQrisStringState(data.qrisString || '');
      setBankNameState(data.bankName || 'Bank BCA');
      setBankAccountNoState(data.bankAccountNo !== undefined ? data.bankAccountNo : '8820918244');
      setBankAccountNameState(data.bankAccountName || 'a.n. Fauzayyn Rachman');
      setEwalletNameState(data.ewalletName || 'GoPay / OVO / DANA');
      setEwalletAccountNoState(data.ewalletAccountNo !== undefined ? data.ewalletAccountNo : '089675916774');
      setEwalletAccountNameState(data.ewalletAccountName || 'a.n. Hilversen Creator');

      setEcosystemPartnersState(data.ecosystemPartners);
      setPortfolioUniqueCodeState(data.portfolioUniqueCode !== undefined ? data.portfolioUniqueCode : 'HILVERSEN2026');
    });

    // Subscribe to Products catalog
    const unsubProducts = subscribeProducts((productList) => {
      if (productList && productList.length > 0) {
        setStoreProducts(productList);
        localStorage.setItem('hilversen_products_cache', JSON.stringify(productList));
      }
    });

    // Subscribe to Portfolio Members (always sync exact array from Firestore)
    const unsubMembers = subscribePortfolioMembers((memberList) => {
      if (memberList) {
        setMembers(memberList);
        localStorage.setItem('hilversen_members_cache', JSON.stringify(memberList));
      }
    });

    return () => {
      unsubCms();
      unsubProducts();
      unsubMembers();
    };
  }, []);

  // Subscribe to Invoices and Buyers when Admin is active and authenticated via Firebase Auth
  useEffect(() => {
    let unsubInvoices: (() => void) | null = null;
    let unsubBuyers: (() => void) | null = null;

    if (currentUser?.role === 'owner' && auth.currentUser) {
      try {
        unsubInvoices = subscribeInvoices((list) => {
          if (list) {
            setInvoices(list);
            localStorage.setItem('hilversen_invoices_cache', JSON.stringify(list));
          }
        });
        unsubBuyers = subscribeBuyers((list) => {
          if (list) {
            setBuyers(list);
            localStorage.setItem('hilversen_buyers_cache', JSON.stringify(list));
          }
        });
      } catch (e) {}
    } else {
      // Fallback: If local session is owner but not yet logged in with Firebase, 
      // load from cache to prevent blank screens, but do not subscribe to Firestore
      const cachedInvoices = localStorage.getItem('hilversen_invoices_cache');
      if (cachedInvoices) {
        try {
          setInvoices(JSON.parse(cachedInvoices));
        } catch (e) {}
      }
      const cachedBuyers = localStorage.getItem('hilversen_buyers_cache');
      if (cachedBuyers) {
        try {
          setBuyers(JSON.parse(cachedBuyers));
        } catch (e) {}
      }
    }

    return () => {
      if (unsubInvoices) unsubInvoices();
      if (unsubBuyers) unsubBuyers();
    };
  }, [currentUser]);

  // CMS Auto-Save Wrappers (Saves both locally and to Cloud Firestore)
  const setHeroTitle = (val: string) => {
    setHeroTitleState(val);
    saveCmsSettingsToFirestore({ heroTitle: val }, currentUser?.email);
  };
  const setHeroSubtitle = (val: string) => {
    setHeroSubtitleState(val);
    saveCmsSettingsToFirestore({ heroSubtitle: val }, currentUser?.email);
  };
  const setHeroSuffix = (val: string) => {
    setHeroSuffixState(val);
    saveCmsSettingsToFirestore({ heroSuffix: val }, currentUser?.email);
  };
  const setHeroDescription = (val: string) => {
    setHeroDescriptionState(val);
    saveCmsSettingsToFirestore({ heroDescription: val }, currentUser?.email);
  };
  const setHeroCtaText = (val: string) => {
    setHeroCtaTextState(val);
    saveCmsSettingsToFirestore({ heroCtaText: val }, currentUser?.email);
  };
  const setHeroImageUrl = (val: string) => {
    setHeroImageUrlState(val);
    saveCmsSettingsToFirestore({ heroImageUrl: val }, currentUser?.email);
  };

  const setAboutHeroTag = (val: string) => {
    setAboutHeroTagState(val);
    saveCmsSettingsToFirestore({ aboutHeroTag: val }, currentUser?.email);
  };
  const setAboutTitle = (val: string) => {
    setAboutTitleState(val);
    saveCmsSettingsToFirestore({ aboutTitle: val }, currentUser?.email);
  };
  const setAboutDescription = (val: string) => {
    setAboutDescriptionState(val);
    saveCmsSettingsToFirestore({ aboutDescription: val }, currentUser?.email);
  };
  const setAboutConciergeTag = (val: string) => {
    setAboutConciergeTagState(val);
    saveCmsSettingsToFirestore({ aboutConciergeTag: val }, currentUser?.email);
  };
  const setAboutConciergeTitle = (val: string) => {
    setAboutConciergeTitleState(val);
    saveCmsSettingsToFirestore({ aboutConciergeTitle: val }, currentUser?.email);
  };
  const setAboutConciergeDesc = (val: string) => {
    setAboutConciergeDescState(val);
    saveCmsSettingsToFirestore({ aboutConciergeDesc: val }, currentUser?.email);
  };
  const setAboutInstagram = (val: string) => {
    setAboutInstagramState(val);
    saveCmsSettingsToFirestore({ aboutInstagram: val }, currentUser?.email);
  };
  const setAboutEmail = (val: string) => {
    setAboutEmailState(val);
    saveCmsSettingsToFirestore({ aboutEmail: val }, currentUser?.email);
  };
  const setAboutPhone = (val: string) => {
    setAboutPhoneState(val);
    saveCmsSettingsToFirestore({ aboutPhone: val }, currentUser?.email);
  };

  const setQrisImageUrl = (val: string) => {
    setQrisImageUrlState(val);
    saveCmsSettingsToFirestore({ qrisImageUrl: val }, currentUser?.email);
  };
  const setQrisString = (val: string) => {
    setQrisStringState(val);
    saveCmsSettingsToFirestore({ qrisString: val }, currentUser?.email);
  };
  const setBankName = (val: string) => {
    setBankNameState(val);
    saveCmsSettingsToFirestore({ bankName: val }, currentUser?.email);
  };
  const setBankAccountNo = (val: string) => {
    setBankAccountNoState(val);
    saveCmsSettingsToFirestore({ bankAccountNo: val }, currentUser?.email);
  };
  const setBankAccountName = (val: string) => {
    setBankAccountNameState(val);
    saveCmsSettingsToFirestore({ bankAccountName: val }, currentUser?.email);
  };
  const setEwalletName = (val: string) => {
    setEwalletNameState(val);
    saveCmsSettingsToFirestore({ ewalletName: val }, currentUser?.email);
  };
  const setEwalletAccountNo = (val: string) => {
    setEwalletAccountNoState(val);
    saveCmsSettingsToFirestore({ ewalletAccountNo: val }, currentUser?.email);
  };
  const setEwalletAccountName = (val: string) => {
    setEwalletAccountNameState(val);
    saveCmsSettingsToFirestore({ ewalletAccountName: val }, currentUser?.email);
  };

  const setEcosystemPartners: React.Dispatch<React.SetStateAction<any>> = (action) => {
    setEcosystemPartnersState((prev: any) => {
      const nextVal = typeof action === 'function' ? action(prev) : action;
      saveCmsSettingsToFirestore({ ecosystemPartners: nextVal }, currentUser?.email);
      return nextVal;
    });
  };

  const setPortfolioUniqueCode = (val: string) => {
    setPortfolioUniqueCodeState(val);
    saveCmsSettingsToFirestore({ portfolioUniqueCode: val }, currentUser?.email);
  };

  // Master Product Handlers (Firestore Cloud Persistence)
  const handleAddMasterProduct = async (item: ProductItem) => {
    const mainImg = resolveProductImageUrl(item.image || (item.images && item.images[0]) || '');
    const newProduct: Product = {
      id: item.id || `PRD-${Date.now()}`,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      category: (item.category as any) || 'timepiece',
      categoryLabel: item.category ? (item.category === 'timepiece' ? 'Helm & Driver' : item.category === 'leather' ? 'Circuit Layout' : 'Pitstop & Tires') : 'F1 Keychain',
      image: mainImg,
      images: item.images && item.images.length > 0 ? item.images : [mainImg],
      description: item.description || 'Barang / Jasa koleksi Hilversen F1.',
      materials: item.materials || 'Serat Karbon 3K & Titanium Grade 5',
      inStock: true,
      featured: true,
      variants: item.variants,
      shopeeLink: item.shopeeLink
    };

    setStoreProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
    try {
      await saveProductToFirestore(newProduct);
      showToast(`Produk "${newProduct.name}" berhasil disimpan permanen ke Cloud!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMasterProduct = async (item: ProductItem) => {
    const existing = storeProducts.find(p => p.id === item.id);
    const mainImg = item.image || (item.images && item.images[0]) || existing?.image || '';
    const updatedImages = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : (existing?.images || [mainImg]));
    
    const updatedProduct: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice !== undefined ? item.originalPrice : existing?.originalPrice,
      category: (item.category as any) || existing?.category || 'timepiece',
      categoryLabel: existing?.categoryLabel || 'F1 Keychain',
      image: mainImg,
      images: updatedImages,
      description: item.description !== undefined ? item.description : (existing?.description || ''),
      materials: item.materials !== undefined ? item.materials : (existing?.materials || ''),
      inStock: true,
      featured: existing?.featured ?? true,
      variants: item.variants !== undefined ? item.variants : existing?.variants,
      shopeeLink: item.shopeeLink !== undefined ? item.shopeeLink : existing?.shopeeLink
    };

    setStoreProducts(prev => prev.map(p => p.id === item.id ? updatedProduct : p));
    try {
      await saveProductToFirestore(updatedProduct);
      showToast(`Perubahan produk "${updatedProduct.name}" tersimpan di Cloud.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMasterProduct = async (id: string) => {
    setStoreProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteProductFromFirestore(id);
      showToast('Produk berhasil dihapus dari Cloud.');
    } catch (e) {
      console.error(e);
    }
  };

  // Deposit and Member Handlers (Firestore Cloud Persistence)
  const handleAddMember = async (newMember: PortfolioContributor) => {
    setMembers(prev => {
      const updated = [newMember, ...prev.filter(m => m.id !== newMember.id)];
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await savePortfolioMemberToFirestore(newMember);
      showToast(`Anggota "${newMember.name}" tersimpan ke Cloud!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    setMembers(prev => {
      const updated = prev.filter(m => m.id !== memberId);
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await deletePortfolioMemberFromFirestore(memberId);
      showToast('Anggota berhasil dihapus dari Cloud.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDeposit = async (memberId: string, amount: number, note: string, customDate?: string) => {
    const todayStr = customDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const isExpense = amount < 0;
    const newBalance = targetMember.balance + amount;
    const newDepositItem = {
      id: `dh-${Date.now()}`,
      date: todayStr,
      amount: amount,
      type: (isExpense ? 'pengeluaran' : 'setoran') as 'setoran' | 'pengeluaran',
      note: note !== undefined ? note : '',
      totalAfter: newBalance
    };

    const defaultHistory = [
      { id: `dh-${targetMember.id}-1`, date: targetMember.lastDeposit || todayStr, amount: targetMember.balance, note: '', totalAfter: targetMember.balance }
    ];
    const existingHistory = (targetMember.depositHistory && targetMember.depositHistory.length > 0)
      ? targetMember.depositHistory
      : defaultHistory;

    const updatedHistory = [newDepositItem, ...existingHistory];
    const updatedChart = [...(targetMember.chartHistory || [])];
    updatedChart.push({
      label: todayStr.split(' ').slice(1, 2).join(' ') || 'Baru',
      fullDate: todayStr,
      totalBalance: newBalance,
      depositAccumulated: newBalance,
      yieldReturn: 0
    });

    const updatedMember: PortfolioContributor = {
      ...targetMember,
      balance: newBalance,
      lastDeposit: todayStr,
      tier: (newBalance >= 300000000 ? 'Patron' : newBalance >= 150000000 ? 'Private Collector' : 'Atelier Member') as any,
      depositHistory: updatedHistory,
      chartHistory: updatedChart
    };

    setMembers(prev => {
      const updated = prev.map(m => m.id === memberId ? updatedMember : m);
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await savePortfolioMemberToFirestore(updatedMember);
      const actionLabel = isExpense ? 'Pengeluaran/Penarikan' : 'Setoran';
      showToast(`${actionLabel} Rp ${Math.abs(amount).toLocaleString('id-ID')} tersimpan permanen di Cloud!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDeposit = async (memberId: string, depositId: string, updatedData: { amount: number; date: string; note: string }) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const defaultHistory = [
      { id: `dh-${targetMember.id}-1`, date: targetMember.lastDeposit || 'Setoran Awal', amount: targetMember.balance, note: '', totalAfter: targetMember.balance }
    ];
    const history = (targetMember.depositHistory && targetMember.depositHistory.length > 0)
      ? targetMember.depositHistory
      : defaultHistory;

    const updatedHistory = history.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          amount: updatedData.amount,
          date: updatedData.date,
          note: updatedData.note !== undefined ? updatedData.note : ''
        };
      }
      return d;
    });

    const newTotalBalance = updatedHistory.reduce((acc, cur) => acc + (cur.amount || 0), 0) || updatedData.amount;
    const updatedMember: PortfolioContributor = {
      ...targetMember,
      balance: newTotalBalance,
      lastDeposit: updatedData.date || targetMember.lastDeposit,
      tier: (newTotalBalance >= 300000000 ? 'Patron' : newTotalBalance >= 150000000 ? 'Private Collector' : 'Atelier Member') as any,
      depositHistory: updatedHistory
    };

    setMembers(prev => {
      const updated = prev.map(m => m.id === memberId ? updatedMember : m);
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await savePortfolioMemberToFirestore(updatedMember);
      showToast('Riwayat setoran tersimpan ke Cloud!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDeposit = async (memberId: string, depositId: string) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const defaultHistory = [
      { id: `dh-${targetMember.id}-1`, date: targetMember.lastDeposit || 'Setoran Awal', amount: targetMember.balance, note: '', totalAfter: targetMember.balance }
    ];
    const history = (targetMember.depositHistory && targetMember.depositHistory.length > 0)
      ? targetMember.depositHistory
      : defaultHistory;

    const updatedHistory = history.filter(d => d.id !== depositId);
    const newTotalBalance = updatedHistory.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const updatedMember: PortfolioContributor = {
      ...targetMember,
      balance: newTotalBalance,
      depositHistory: updatedHistory,
      tier: (newTotalBalance >= 300000000 ? 'Patron' : newTotalBalance >= 150000000 ? 'Private Collector' : 'Atelier Member') as any
    };

    setMembers(prev => {
      const updated = prev.map(m => m.id === memberId ? updatedMember : m);
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await savePortfolioMemberToFirestore(updatedMember);
      showToast('Baris riwayat setoran dihapus dari Cloud.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMember = async (updatedMember: PortfolioContributor) => {
    setMembers(prev => {
      const updated = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
      localStorage.setItem('hilversen_members_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await savePortfolioMemberToFirestore(updatedMember);
      showToast(`Data anggota "${updatedMember.name}" tersimpan permanen di Cloud!`);
    } catch (e) {
      console.error(e);
    }
  };

  // Buyer Handlers
  const handleAddBuyer = async (buyer: BuyerItem) => {
    setBuyers(prev => [buyer, ...prev.filter(b => b.id !== buyer.id)]);
    try {
      await saveBuyerToFirestore(buyer);
    } catch (e) {}
  };

  const handleUpdateBuyer = async (buyer: BuyerItem) => {
    setBuyers(prev => prev.map(b => b.id === buyer.id ? buyer : b));
    try {
      await saveBuyerToFirestore(buyer);
    } catch (e) {}
  };

  const handleDeleteBuyer = async (id: string) => {
    setBuyers(prev => prev.filter(b => b.id !== id));
    try {
      await deleteBuyerFromFirestore(id);
    } catch (e) {}
  };

  // Theme State (Default to Warm Paper Light Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hilversen_theme_mode');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false; // Default is Warm Paper Light Mode
  });

  // Apply dark mode class to html and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('hilversen_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('hilversen_theme_mode', 'light');
    }
  }, [darkMode]);

  // Body Scroll-Lock when modal or drawer is active
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      exportInvoice ||
      isInvoiceFormOpen ||
      editingInvoice ||
      selectedProduct ||
      isCartOpen
    );
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [exportInvoice, isInvoiceFormOpen, editingInvoice, selectedProduct, isCartOpen]);

  // Keyboard Shortcuts (Ctrl + Shift + O, Esc dismisses modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        showToast('Gunakan tombol Sign In di Menu Navigasi.');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (currentUser?.role === 'owner') {
          setEditingInvoice(null);
          setIsInvoiceFormOpen(true);
        } else {
          showToast('Hanya Owner yang diizinkan mengedit invoice.');
        }
      }
      if (e.key === 'Escape') {
        if (exportInvoice) setExportInvoice(null);
        else if (isInvoiceFormOpen || editingInvoice) {
          setIsInvoiceFormOpen(false);
          setEditingInvoice(null);
        } else if (selectedProduct) {
          setSelectedProduct(null);
        } else if (isCartOpen) {
          setIsCartOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exportInvoice, isInvoiceFormOpen, editingInvoice, selectedProduct, isCartOpen, currentUser, showToast]);

  // Real-time tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule = calculatePrayerTimes(currentCity, currentTime);
  const nextPrayer = getNextPrayer(schedule, currentTime);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`"${product.name}" berhasil ditambahkan ke keranjang.`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Invoice Handlers
  const handleSaveInvoice = async (savedInvoice: any) => {
    setInvoices(prev => {
      const exists = prev.find(i => i.id === savedInvoice.id);
      const updated = exists ? prev.map(i => i.id === savedInvoice.id ? savedInvoice : i) : [savedInvoice, ...prev];
      localStorage.setItem('hilversen_invoices_cache', JSON.stringify(updated));
      return updated;
    });
    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
    try {
      await saveInvoiceToFirestore(savedInvoice);
      showToast(`Invoice #${savedInvoice.invoiceNumber || savedInvoice.id} tersimpan ke Cloud!`);
    } catch (e) {
      showToast(`Invoice disimpan lokal.`);
    }
  };

  const handleEditInvoice = (inv: InvoiceData) => {
    setEditingInvoice(inv);
    setIsInvoiceFormOpen(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    setInvoices(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('hilversen_invoices_cache', JSON.stringify(updated));
      return updated;
    });
    try {
      await deleteInvoiceFromFirestore(id);
      showToast('Dokumen invoice dihapus secara permanen dari Cloud.');
    } catch (e) {
      showToast('Dokumen invoice berhasil dihapus.');
    }
  };

  const handleExportInvoiceAction = (ref: any, type: 'jpg' | 'pdf') => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      if (type === 'pdf') {
        window.print();
        showToast('Dokumen PDF siap dicetak / diunduh.');
      } else {
        showToast('Dokumen invoice JPG berhasil diekspor.');
      }
    }, 800);
  };

  // Local list of saved accounts on this device for rapid swapping
  const [savedAccounts, setSavedAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('hilversen_saved_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSwitchAccount = (email: string) => {
    const target = savedAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('hilversen_user_session', JSON.stringify(target));
      showToast(`Beralih ke akun ${target.name}.`);
      if (target.role === 'owner') {
        setActiveTab('invoice');
      } else {
        setActiveTab('landing');
      }
    }
  };

  const handleRemoveSavedAccount = (email: string) => {
    setSavedAccounts(prev => {
      const updated = prev.filter(acc => acc.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('hilversen_saved_accounts', JSON.stringify(updated));
      return updated;
    });
    showToast('Akun berhasil dihapus dari device ini.');
  };

  // Google Login callbacks
  const handleLoginSuccess = (email: string, name: string, role: 'owner' | 'customer') => {
    const userSession = { email, name, role };
    setCurrentUser(userSession);
    localStorage.setItem('hilversen_user_session', JSON.stringify(userSession));

    setSavedAccounts(prev => {
      const filtered = prev.filter(acc => acc.email.toLowerCase() !== email.toLowerCase());
      const updated = [...filtered, userSession];
      localStorage.setItem('hilversen_saved_accounts', JSON.stringify(updated));
      return updated;
    });

    if (role === 'owner') {
      showToast(`Selamat datang Owner (${email})! Cloud Database tersinkronisasi.`);
      setActiveTab('invoice'); // Auto redirect to CMS dashboard
    } else {
      showToast(`Berhasil masuk sebagai ${name}.`);
    }
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('hilversen_user_session');
    setActiveTab('landing');
    showToast('Berhasil keluar (Signed Out).');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] dark:bg-black text-[#1C1A17] dark:text-slate-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        savedAccounts={savedAccounts}
        onSwitchAccount={handleSwitchAccount}
        onRemoveSavedAccount={handleRemoveSavedAccount}
      />

      {/* Main Content View with Page Transition Animations */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <LandingPage
                onNavigateTab={setActiveTab}
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
                products={storeProducts}
                heroTitle={heroTitle}
                heroSubtitle={heroSubtitle}
                heroSuffix={heroSuffix}
                heroDescription={heroDescription}
                heroCtaText={heroCtaText}
                heroImageUrl={heroImageUrl}
                isDarkMode={darkMode}
                ecosystemPartners={ecosystemPartners}
              />
            </motion.div>
          )}

          {activeTab === 'collection' && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <CollectionPage
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
                products={storeProducts}
              />
            </motion.div>
          )}

          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <PersonalPortfolioPage
                members={members}
                portfolioUniqueCode={portfolioUniqueCode}
                onAddMember={handleAddMember}
                onDeleteMember={handleDeleteMember}
                onAddDeposit={handleAddDeposit}
                onUpdateDeposit={handleUpdateDeposit}
                onDeleteDeposit={handleDeleteDeposit}
                onUpdateMember={handleUpdateMember}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {activeTab === 'creator-dump' && (
            <motion.div
              key="creator-dump"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <CreatorDumpPage
                currentUser={currentUser}
                onOpenLogin={() => {}}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === 'donate-me' && (
            <motion.div
              key="donate-me"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <DonateMePage
                qrisImageUrl={qrisImageUrl}
                qrisString={qrisString}
                bankName={bankName}
                bankAccountNo={bankAccountNo}
                bankAccountName={bankAccountName}
                ewalletName={ewalletName}
                ewalletAccountNo={ewalletAccountNo}
                ewalletAccountName={ewalletAccountName}
              />
            </motion.div>
          )}

          {activeTab === 'invoice' && (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <InvoiceView
                invoices={invoices}
                settings={businessSettings}
                onOpenCreate={() => { 
                  if (currentUser?.role === 'owner') {
                    setEditingInvoice(null); 
                    setIsInvoiceFormOpen(true); 
                  } else {
                    showToast('Hanya Owner yang diizinkan membuat invoice.');
                  }
                }}
                onEditInvoice={handleEditInvoice}
                onExportInvoice={(inv) => setExportInvoice(inv)}
                onDeleteInvoice={handleDeleteInvoice}
                isDarkMode={darkMode}
                showToast={showToast}
                currentUser={currentUser}
                onOpenLogin={() => {}}
                onNavigateTab={setActiveTab}
                masterProducts={storeProducts}
                onAddProduct={handleAddMasterProduct}
                onUpdateProduct={handleUpdateMasterProduct}
                onDeleteMasterProduct={handleDeleteMasterProduct}
                masterBuyers={buyers}
                onAddBuyer={handleAddBuyer}
                onUpdateBuyer={handleUpdateBuyer}
                onDeleteBuyer={handleDeleteBuyer}
                heroTitle={heroTitle}
                setHeroTitle={setHeroTitle}
                heroSubtitle={heroSubtitle}
                setHeroSubtitle={setHeroSubtitle}
                heroSuffix={heroSuffix}
                setHeroSuffix={setHeroSuffix}
                heroDescription={heroDescription}
                setHeroDescription={setHeroDescription}
                heroCtaText={heroCtaText}
                setHeroCtaText={setHeroCtaText}
                heroImageUrl={heroImageUrl}
                setHeroImageUrl={setHeroImageUrl}
                ecosystemPartners={ecosystemPartners}
                setEcosystemPartners={setEcosystemPartners}
                members={members}
                setMembers={setMembers}
                onAddMember={handleAddMember}
                onDeleteMember={handleDeleteMember}
                onAddDeposit={handleAddDeposit}
                onUpdateDeposit={handleUpdateDeposit}
                onDeleteDeposit={handleDeleteDeposit}
                onUpdateMember={handleUpdateMember}
                aboutHeroTag={aboutHeroTag}
                setAboutHeroTag={setAboutHeroTag}
                aboutTitle={aboutTitle}
                setAboutTitle={setAboutTitle}
                aboutDescription={aboutDescription}
                setAboutDescription={setAboutDescription}
                aboutConciergeTag={aboutConciergeTag}
                setAboutConciergeTag={setAboutConciergeTag}
                aboutConciergeTitle={aboutConciergeTitle}
                setAboutConciergeTitle={setAboutConciergeTitle}
                aboutConciergeDesc={aboutConciergeDesc}
                setAboutConciergeDesc={setAboutConciergeDesc}
                aboutInstagram={aboutInstagram}
                setAboutInstagram={setAboutInstagram}
                aboutEmail={aboutEmail}
                setAboutEmail={setAboutEmail}
                aboutPhone={aboutPhone}
                setAboutPhone={setAboutPhone}
                qrisImageUrl={qrisImageUrl}
                setQrisImageUrl={setQrisImageUrl}
                qrisString={qrisString}
                setQrisString={setQrisString}
                bankName={bankName}
                setBankName={setBankName}
                bankAccountNo={bankAccountNo}
                setBankAccountNo={setBankAccountNo}
                bankAccountName={bankAccountName}
                setBankAccountName={setBankAccountName}
                ewalletName={ewalletName}
                setEwalletName={setEwalletName}
                ewalletAccountNo={ewalletAccountNo}
                setEwalletAccountNo={setEwalletAccountNo}
                ewalletAccountName={ewalletAccountName}
                setEwalletAccountName={setEwalletAccountName}
                portfolioUniqueCode={portfolioUniqueCode}
                setPortfolioUniqueCode={setPortfolioUniqueCode}
              />
            </motion.div>
          )}

          {activeTab === 'jadwal-sholat' && (
            <motion.div
              key="jadwal-sholat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <PrayerSchedulePage
                currentCity={currentCity}
                onSelectCity={setCurrentCity}
              />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <AboutPage
                onExploreCollection={() => setActiveTab('collection')}
                heroTag={aboutHeroTag}
                title={aboutTitle}
                description={aboutDescription}
                conciergeTag={aboutConciergeTag}
                conciergeTitle={aboutConciergeTitle}
                conciergeDescription={aboutConciergeDesc}
                instagram={aboutInstagram}
                email={aboutEmail}
                phone={aboutPhone}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInvoiceFormOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-3xl my-auto">
              <InvoiceForm
                initialData={editingInvoice}
                settings={businessSettings}
                productMaster={storeProducts.map(p => ({ id: p.id, name: p.name, price: p.price }))}
                isDark={darkMode}
                onSave={handleSaveInvoice}
                onBack={() => { setIsInvoiceFormOpen(false); setEditingInvoice(null); }}
                masterBuyers={buyers}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportInvoice && (
          <ExportModal
            isOpen={Boolean(exportInvoice)}
            onClose={() => setExportInvoice(null)}
            onExport={handleExportInvoiceAction}
            invoice={exportInvoice}
            businessSettings={businessSettings}
            isDark={darkMode}
            isDownloading={isDownloading}
          />
        )}
      </AnimatePresence>

      {/* Global Animated Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border border-slate-800 dark:border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer onNavigateTab={setActiveTab} />
    </div>
  );
}
