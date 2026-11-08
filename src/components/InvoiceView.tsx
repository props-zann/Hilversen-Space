import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Package, Calculator, Users, ShieldAlert, KeyRound, ArrowLeft, Sliders, Plus, Trash2, Check, UserPlus, Upload, Image as ImageIcon, Edit3, Calendar, History, ChevronDown, ChevronUp, Info, HelpCircle, X, Sparkles, BookOpen, Compass, ExternalLink, RotateCcw } from 'lucide-react';
import { InvoiceData, BusinessSettings, ProductItem, BuyerItem } from '../types/invoice';
import { PRODUCTS, formatRupiah } from '../data/mockData';
import { DashboardView } from './DashboardView';
import { ProductManager } from './ProductManager';
import StickerCalculator from './StickerCalculator';
import { BuyerManager } from './BuyerManager';
import { PortfolioContributor } from '../types';
import { ImageCropModal } from './ImageCropModal';
import { CustomDatePicker } from './CustomDatePicker';

interface InvoiceViewProps {
  invoices: InvoiceData[];
  settings: BusinessSettings;
  onOpenCreate: () => void;
  onEditInvoice: (inv: InvoiceData) => void;
  onExportInvoice: (inv: InvoiceData) => void;
  onDeleteInvoice: (id: string) => void;
  isDarkMode: boolean;
  showToast?: (msg: string) => void;
  currentUser: any;
  onOpenLogin: () => void;
  onNavigateTab: (tab: 'landing' | 'collection' | 'personal' | 'jadwal-sholat' | 'about') => void;
  masterProducts?: any[];
  onAddProduct?: (product: ProductItem) => void;
  onUpdateProduct?: (product: ProductItem) => void;
  onDeleteMasterProduct?: (id: string) => void;

  masterBuyers?: BuyerItem[];
  onAddBuyer?: (buyer: BuyerItem) => void;
  onUpdateBuyer?: (buyer: BuyerItem) => void;
  onDeleteBuyer?: (id: string) => void;

  // Custom CMS configurations from App.tsx
  heroTitle?: string;
  setHeroTitle?: (title: string) => void;
  heroSubtitle?: string;
  setHeroSubtitle?: (sub: string) => void;
  heroSuffix?: string;
  setHeroSuffix?: (suffix: string) => void;
  heroDescription?: string;
  setHeroDescription?: (desc: string) => void;
  heroCtaText?: string;
  setHeroCtaText?: (cta: string) => void;
  heroImageUrl?: string;
  setHeroImageUrl?: (val: string) => void;
  ecosystemPartners?: Array<{ name: string; badge?: string; logo?: string; displayMode?: 'logo_and_text' | 'logo_only' }>;
  setEcosystemPartners?: React.Dispatch<React.SetStateAction<Array<{ name: string; badge?: string; logo?: string; displayMode?: 'logo_and_text' | 'logo_only' }>>>;
  members?: PortfolioContributor[];
  setMembers?: React.Dispatch<React.SetStateAction<PortfolioContributor[]>>;
  onAddDeposit?: (memberId: string, amount: number, note: string, customDate?: string) => void;
  onUpdateDeposit?: (memberId: string, depositId: string, updatedData: { amount: number; date: string; note: string }) => void;
  onDeleteDeposit?: (memberId: string, depositId: string) => void;
  onUpdateMember?: (updatedMember: PortfolioContributor) => void;
  onAddMember?: (newMember: PortfolioContributor) => void;
  onDeleteMember?: (memberId: string) => void;

  // About CMS configurations
  aboutHeroTag?: string;
  setAboutHeroTag?: (val: string) => void;
  aboutTitle?: string;
  setAboutTitle?: (val: string) => void;
  aboutDescription?: string;
  setAboutDescription?: (val: string) => void;
  aboutConciergeTag?: string;
  setAboutConciergeTag?: (val: string) => void;
  aboutConciergeTitle?: string;
  setAboutConciergeTitle?: (val: string) => void;
  aboutConciergeDesc?: string;
  setAboutConciergeDesc?: (val: string) => void;
  aboutInstagram?: string;
  setAboutInstagram?: (val: string) => void;
  aboutEmail?: string;
  setAboutEmail?: (val: string) => void;
  aboutPhone?: string;
  setAboutPhone?: (val: string) => void;
  qrisImageUrl?: string;
  setQrisImageUrl?: (val: string) => void;
  qrisString?: string;
  setQrisString?: (val: string) => void;
  bankName?: string;
  setBankName?: (val: string) => void;
  bankAccountNo?: string;
  setBankAccountNo?: (val: string) => void;
  bankAccountName?: string;
  setBankAccountName?: (val: string) => void;
  ewalletName?: string;
  setEwalletName?: (val: string) => void;
  ewalletAccountNo?: string;
  setEwalletAccountNo?: (val: string) => void;
  ewalletAccountName?: string;
  setEwalletAccountName?: (val: string) => void;
  portfolioUniqueCode?: string;
  setPortfolioUniqueCode?: (code: string) => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoices,
  settings,
  onOpenCreate,
  onEditInvoice,
  onExportInvoice,
  onDeleteInvoice,
  isDarkMode,
  showToast,
  currentUser,
  onOpenLogin,
  onNavigateTab,
  masterProducts,
  onAddProduct,
  onUpdateProduct,
  onDeleteMasterProduct,

  masterBuyers,
  onAddBuyer,
  onUpdateBuyer,
  onDeleteBuyer,

  heroTitle = 'Simbol Kecepatan',
  setHeroTitle,
  heroSubtitle = 'Dalam Genggaman',
  setHeroSubtitle,
  heroSuffix = 'Jemari Anda.',
  setHeroSuffix,
  heroDescription = 'Koleksi aksesoris, keychain balap, dan rilisan kreatif edisi terbatas yang dirancang dengan presisi titanium dan material serat karbon.',
  setHeroDescription,
  heroCtaText = 'Jelajahi Koleksi Merchandise',
  setHeroCtaText,
  heroImageUrl = '',
  setHeroImageUrl,
  ecosystemPartners = [],
  setEcosystemPartners,
  members = [],
  setMembers,
  onAddDeposit,
  onUpdateDeposit,
  onDeleteDeposit,
  onUpdateMember,
  onAddMember,
  onDeleteMember,

  aboutHeroTag = 'Creative Atelier - est 2024',
  setAboutHeroTag,
  aboutTitle = 'Destinasi Merchandise F1 & Koleksi Kreatif.',
  setAboutTitle,
  aboutDescription = 'Hilversen adalah toko online...',
  setAboutDescription,
  aboutConciergeTag = 'Pitstop Concierge',
  setAboutConciergeTag,
  aboutConciergeTitle = 'Kontak & Komunitas',
  setAboutConciergeTitle,
  aboutConciergeDesc = 'Hubungi kami atau ikuti kanal resmi Hilversen...',
  setAboutConciergeDesc,
  aboutInstagram = '@hilversen',
  setAboutInstagram,
  aboutEmail = 'marcauzed@gmail.com',
  setAboutEmail,
  aboutPhone = '+6289675916774',
  setAboutPhone,
  portfolioUniqueCode = 'HILVERSEN2026',
  setPortfolioUniqueCode
}) => {
  const isOwner = currentUser?.role === 'owner';

  // Master Products State mapped from masterProducts
  const products: ProductItem[] = useMemo(() => {
    if (masterProducts && masterProducts.length > 0) {
      return masterProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description,
        materials: p.materials,
        category: p.category
      }));
    }
    return PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      materials: p.materials,
      category: p.category
    }));
  }, [masterProducts]);

  // Master Buyers State
  const defaultBuyers: BuyerItem[] = useMemo(() => [
    { id: 'BYR-1001', name: 'Raden Arya Wibowo', phone: '0812-9843-1102', email: 'arya.wibowo@motorsport.co.id', address: 'Kebayoran Baru, Jakarta Selatan', joinedAt: '2026-01-15' },
    { id: 'BYR-1002', name: 'Sarah N. Wibowo', phone: '0811-2233-4455', email: 'sarah.wibowo@gmail.com', address: 'Dago, Bandung', joinedAt: '2026-02-20' },
    { id: 'BYR-1003', name: 'Fauzayyn Rachman', phone: '0812-8821-9900', email: 'fauzayyn@gmail.com', address: 'Senopati, Jakarta Selatan', joinedAt: '2026-03-01' },
    { id: 'BYR-1004', name: 'Dimas Pratama', phone: '0813-7766-5544', email: 'dimas.pratama@gmail.com', address: 'Surabaya, Jawa Timur', joinedAt: '2026-04-10' },
    { id: 'BYR-1005', name: 'Elena Kusuma Wardhani', phone: '0815-4433-2211', email: 'elena.kusuma@gmail.com', address: 'Yogyakarta', joinedAt: '2026-05-12' }
  ], []);

  const buyers = masterBuyers !== undefined ? masterBuyers : defaultBuyers;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'calculator' | 'buyers' | 'cms'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'client',
    direction: 'asc'
  });
  const [isNotionMode] = useState(false);

  // Undo / Redo mock stack
  const [history] = useState<InvoiceData[][]>([invoices]);
  const [historyIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {};
  const handleRedo = () => {};

  const toggleDirection = () => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Product Master handlers
  const handleAddProduct = (product: ProductItem) => {
    if (onAddProduct) onAddProduct(product);
    if (showToast) showToast(`Produk "${product.name}" berhasil ditambahkan & ditampilkan di Katalog.`);
  };

  const handleUpdateProduct = (product: ProductItem) => {
    if (onUpdateProduct) onUpdateProduct(product);
    if (showToast) showToast(`Produk "${product.name}" berhasil diperbarui.`);
  };

  const handleDeleteProduct = (id: string) => {
    if (onDeleteMasterProduct) onDeleteMasterProduct(id);
    if (showToast) showToast('Produk berhasil dihapus dari Master.');
  };

  // Buyer Master handlers
  const handleAddBuyer = (buyer: BuyerItem) => {
    if (onAddBuyer) onAddBuyer(buyer);
    if (showToast) showToast(`Pelanggan "${buyer.name}" berhasil ditambahkan.`);
  };

  const handleUpdateBuyer = (buyer: BuyerItem) => {
    if (onUpdateBuyer) onUpdateBuyer(buyer);
    if (showToast) showToast(`Data pelanggan "${buyer.name}" berhasil diperbarui.`);
  };

  const handleDeleteBuyer = (id: string) => {
    if (onDeleteBuyer) onDeleteBuyer(id);
    if (showToast) showToast('Data pelanggan berhasil dihapus.');
  };

  // Partner Form & Logo Crop State
  const [isHeroCmsOpen, setIsHeroCmsOpen] = useState(false);
  const [isAboutCmsOpen, setIsAboutCmsOpen] = useState(false);
  const [isPartnersCmsOpen, setIsPartnersCmsOpen] = useState(false);
  const [isFinancialCmsOpen, setIsFinancialCmsOpen] = useState(false);

  // Hero Image custom upload & crop states
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const [rawHeroImage, setRawHeroImage] = useState<string | null>(null);

  const handleHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRawHeroImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleHeroCropComplete = (croppedUrl: string) => {
    if (setHeroImageUrl) {
      setHeroImageUrl(croppedUrl);
      if (showToast) showToast('Gambar hero berhasil diperbarui & disimpan!');
    }
    setRawHeroImage(null);
  };

  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerBadge, setNewPartnerBadge] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState<string | null>(null);
  const [newPartnerDisplayMode, setNewPartnerDisplayMode] = useState<'logo_and_text' | 'logo_only'>('logo_and_text');
  
  const partnerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [rawPartnerLogo, setRawPartnerLogo] = useState<string | null>(null);

  // Edit Partner Modal State
  const [editingPartnerIndex, setEditingPartnerIndex] = useState<number | null>(null);
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editPartnerBadge, setEditPartnerBadge] = useState('');
  const [editPartnerLogo, setEditPartnerLogo] = useState<string | null>(null);
  const [editPartnerDisplayMode, setEditPartnerDisplayMode] = useState<'logo_and_text' | 'logo_only'>('logo_and_text');
  const editPartnerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [rawEditPartnerLogo, setRawEditPartnerLogo] = useState<string | null>(null);

  const handleOpenEditPartner = (idx: number, partner: { name: string; badge?: string; logo?: string; displayMode?: 'logo_and_text' | 'logo_only' }) => {
    setEditingPartnerIndex(idx);
    setEditPartnerName(partner.name || '');
    setEditPartnerBadge(partner.badge || '');
    setEditPartnerLogo(partner.logo || null);
    setEditPartnerDisplayMode(partner.displayMode || 'logo_and_text');
  };

  const handleSaveEditPartner = () => {
    if (editingPartnerIndex === null || !setEcosystemPartners) return;
    setEcosystemPartners(prev => prev.map((p, i) => {
      if (i === editingPartnerIndex) {
        return {
          name: editPartnerName.trim() || 'Partner Logo',
          badge: editPartnerBadge.trim() || undefined,
          logo: editPartnerLogo || undefined,
          displayMode: editPartnerDisplayMode
        };
      }
      return p;
    }));
    setEditingPartnerIndex(null);
    if (showToast) showToast('Data mitra ekosistem berhasil diperbarui!');
  };

  const handlePartnerLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRawPartnerLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleEditPartnerLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRawEditPartnerLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handlePartnerCropComplete = (croppedUrl: string) => {
    setNewPartnerLogo(croppedUrl);
    setRawPartnerLogo(null);
    if (showToast) showToast('Logo mitra berhasil dicrop!');
  };

  const handleEditPartnerCropComplete = (croppedUrl: string) => {
    setEditPartnerLogo(croppedUrl);
    setRawEditPartnerLogo(null);
    if (showToast) showToast('Logo mitra yang diedit berhasil dicrop!');
  };

  // Member Form & Expand State
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [depAmounts, setDepAmounts] = useState<Record<string, string>>({});
  const [depNotes, setDepNotes] = useState<Record<string, string>>({});
  const [depDates, setDepDates] = useState<Record<string, string>>({});

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberBalance, setNewMemberBalance] = useState('');

  const formatDateToIndo = (rawDateStr: string) => {
    if (!rawDateStr) {
      return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const dateObj = new Date(rawDateStr);
    if (isNaN(dateObj.getTime())) return rawDateStr;
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleMemberAddDeposit = (memberId: string) => {
    const amtStr = depAmounts[memberId] || '';
    const amt = parseFloat(amtStr) || 0;
    if (amt <= 0) {
      if (showToast) showToast('Silakan masukkan nominal setoran yang valid (lebih dari 0).');
      return;
    }
    const rawDate = depDates[memberId] || new Date().toISOString().split('T')[0];
    const formattedDate = formatDateToIndo(rawDate);
    const note = (depNotes[memberId] || '').trim() || 'Setoran Tabungan Kolektor';

    if (onAddDeposit) {
      onAddDeposit(memberId, amt, note, formattedDate);
    } else if (setMembers) {
      setMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          const newBal = m.balance + amt;
          const newHist = [
            { id: `dh-${Date.now()}`, date: formattedDate, amount: amt, note, totalAfter: newBal },
            ...(m.depositHistory || [])
          ];
          return {
            ...m,
            balance: newBal,
            lastDeposit: formattedDate,
            tier: (newBal >= 300000000 ? 'Patron' : newBal >= 150000000 ? 'Private Collector' : 'Atelier Member') as any,
            depositHistory: newHist
          };
        }
        return m;
      }));
    }

    setDepAmounts(prev => ({ ...prev, [memberId]: '' }));
    setDepNotes(prev => ({ ...prev, [memberId]: '' }));
  };

  const handleAddPartner = () => {
    if ((!newPartnerName.trim() && !newPartnerLogo) || !setEcosystemPartners) return;
    setEcosystemPartners(prev => [
      ...prev,
      {
        name: newPartnerName.trim() || 'Partner Logo',
        badge: newPartnerBadge.trim() || undefined,
        logo: newPartnerLogo || undefined,
        displayMode: newPartnerDisplayMode
      }
    ]);
    setNewPartnerName('');
    setNewPartnerBadge('');
    setNewPartnerLogo(null);
    setNewPartnerDisplayMode('logo_and_text');
    if (showToast) showToast('Mitra Ekosistem berhasil ditambahkan!');
  };

  const handleRemovePartner = (idxToRemove: number) => {
    if (!setEcosystemPartners) return;
    setEcosystemPartners(prev => prev.filter((_, idx) => idx !== idxToRemove));
    if (showToast) showToast('Ecosystem partner berhasil dihapus!');
  };

  // Member Edit Modal & Deposit Row Edit States
  const [editingMember, setEditingMember] = useState<PortfolioContributor | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberTier, setEditMemberTier] = useState<string>('Atelier Member');
  const [editMemberStatus, setEditMemberStatus] = useState<string>('Aktif');
  const [editMemberEmoji, setEditMemberEmoji] = useState('🌤️');

  const [editingDeposit, setEditingDeposit] = useState<{ memberId: string; depositId: string; amount: string; date: string; note: string } | null>(null);

  // Lock body scroll when any modal in InvoiceView is active
  useEffect(() => {
    if (editingMember || editingDeposit || editingPartnerIndex !== null || rawPartnerLogo || rawEditPartnerLogo || rawHeroImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingMember, editingDeposit, editingPartnerIndex, rawPartnerLogo, rawEditPartnerLogo, rawHeroImage]);

  const handleOpenEditMember = (member: PortfolioContributor) => {
    setEditingMember(member);
    setEditMemberName(member.name);
    setEditMemberRole(member.role || '');
    setEditMemberEmoji(member.iconEmoji || '🌤️');
  };

  const handleSaveEditMember = () => {
    if (!editingMember) return;
    const updated: PortfolioContributor = {
      ...editingMember,
      name: editMemberName.trim() || editingMember.name,
      role: editMemberRole.trim(),
      iconEmoji: editMemberEmoji || editingMember.iconEmoji
    };
    if (onUpdateMember) {
      onUpdateMember(updated);
    } else if (setMembers) {
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
      if (showToast) showToast(`Data anggota "${updated.name}" berhasil diperbarui!`);
    }
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
    if (!editingDeposit) return;
    const amt = parseFloat(editingDeposit.amount) || 0;
    if (amt <= 0) {
      if (showToast) showToast('Nominal setoran harus lebih besar dari 0.');
      return;
    }
    const dateFormatted = editingDeposit.date;
    const note = editingDeposit.note.trim() || 'Setoran Tabungan';

    if (onUpdateDeposit) {
      onUpdateDeposit(editingDeposit.memberId, editingDeposit.depositId, {
        amount: amt,
        date: dateFormatted,
        note
      });
    } else if (setMembers) {
      setMembers(prev => prev.map(m => {
        if (m.id === editingDeposit.memberId) {
          const history = (m.depositHistory || []).map(d => {
            if (d.id === editingDeposit.depositId) {
              return { ...d, amount: amt, date: dateFormatted, note };
            }
            return d;
          });
          const newBal = history.reduce((acc, cur) => acc + (cur.amount || 0), 0) || amt;
          return {
            ...m,
            balance: newBal,
            lastDeposit: dateFormatted,
            depositHistory: history
          };
        }
        return m;
      }));
      if (showToast) showToast('Riwayat setoran berhasil diperbarui!');
    }
    setEditingDeposit(null);
  };

  const handleDeleteDepositItem = (memberId: string, depositId: string) => {
    if (onDeleteDeposit) {
      onDeleteDeposit(memberId, depositId);
    } else if (setMembers) {
      setMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          const history = (m.depositHistory || []).filter(d => d.id !== depositId);
          const newBal = history.reduce((acc, cur) => acc + (cur.amount || 0), 0);
          return {
            ...m,
            balance: newBal,
            depositHistory: history
          };
        }
        return m;
      }));
      if (showToast) showToast('Baris setoran berhasil dihapus!');
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const balanceNum = parseFloat(newMemberBalance) || 0;
    const colors = ['#2563EB', '#1D4ED8', '#3B82F6', '#1E3A8A', '#0F1C3F'];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const newMem: PortfolioContributor = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      avatarBg: randomBg,
      balance: balanceNum,
      sharePercentage: 0,
      lastDeposit: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      monthlyReturn: parseFloat((6.5 + Math.random() * 2.5).toFixed(1))
    };

    if (onAddMember) {
      onAddMember(newMem);
    } else if (setMembers) {
      setMembers(prev => [newMem, ...prev]);
    }
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberBalance('');
  };

  const handleRemoveMember = (id: string) => {
    if (onDeleteMember) {
      onDeleteMember(id);
    } else if (setMembers) {
      setMembers(prev => prev.filter(m => m.id !== id));
      if (showToast) showToast('Anggota Portofolio berhasil dihapus!');
    }
  };

  const handleUpdateMemberField = (id: string, field: keyof PortfolioContributor, value: any) => {
    if (!setMembers) return;
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        // Re-calculate tier if balance changed
        if (field === 'balance') {
          const bal = parseFloat(value) || 0;
          updated.balance = bal;
          updated.tier = bal >= 300000000 ? 'Patron' : bal >= 150000000 ? 'Private Collector' : 'Atelier Member';
        }
        return updated;
      }
      return m;
    }));
  };

  // Filter and sort invoices
  const processedInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv =>
        (inv.buyer?.name || '').toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.buyer?.company || '').toLowerCase().includes(q) ||
        (inv.totalAmount || 0).toString().includes(q) ||
        inv.date.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'client') {
        const nameA = (a.buyer?.name || '').toLowerCase();
        const nameB = (b.buyer?.name || '').toLowerCase();
        return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortConfig.key === 'amount') {
        const amtA = a.totalAmount || 0;
        const amtB = b.totalAmount || 0;
        return sortConfig.direction === 'asc' ? amtA - amtB : amtB - amtA;
      }
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      return 0;
    });

    return result;
  }, [invoices, searchQuery, sortConfig]);

  // --- DUAL-LAYER SECURITY VIEW (If user is not whitelisted owner) ---
  if (!isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300">
        <div className="w-full max-w-lg p-8 rounded-[2rem] border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Not Authorized
            </h2>
            
            {currentUser ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold text-red-500">{currentUser.email}</span> is signed in but isn't an admin.
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in with Google to sync your bookmarks across devices, or to access the admin dashboard.
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-left text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound size={13} className="text-blue-500" />
              Developer Audit Log Note:
            </p>
            <p>
              Halaman ini dilindungi oleh otorisasi berbasis peran (RBAC) dua lapis. Pengguna biasa dilarang mengakses metrik omzet, laba kotor, HPP stiker, dan database transaksi Hilversen F1.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('collection')}
              className="flex-1 py-3 px-4 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to the library</span>
            </button>

            {!currentUser && (
              <button
                onClick={onOpenLogin}
                className="flex-1 py-3 px-4 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.111 4.113-3.42 0-6.2-2.78-6.2-6.2 0-3.42 2.78-6.2 6.2-6.2 1.54 0 2.93.56 4 1.48l3.1-3.1C19.16 2.41 15.93 1 12.24 1 5.956 1 12.24 5.956 1 12.24s4.956 11.24 11.24 11.24c6.33 0 11.24-4.51 11.24-11.24 0-.78-.08-1.54-.24-2.24H12.24z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER NORMAL EXCLUSIVE ADMIN CONTENT IF AUTHENTICATED & WHITELISTED OWNER ---
  return (
    <div className="w-full pt-4">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar Navigation (Navigasi Samping) */}
        <div className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs lg:sticky lg:top-24 space-y-2">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2">
            Panel Navigasi Creator
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} />
              <span>Dashboard Invoice</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package size={16} />
              <span>Product Management</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${activeTab === 'products' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calculator size={16} />
              <span>Kalkulator Layout & HPP</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              <span>Pelanggan (Buyer)</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${activeTab === 'buyers' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
              {buyers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-[#10B981] text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders size={16} />
              <span>Atelier CMS & Portfolio</span>
            </span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  settings={settings}
                  invoices={invoices}
                  processedInvoices={processedInvoices}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  toggleDirection={toggleDirection}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  handleUndo={handleUndo}
                  handleRedo={handleRedo}
                  handleDeleteInvoice={onDeleteInvoice}
                  onEditInvoice={onEditInvoice}
                  onExportInvoice={onExportInvoice}
                  onOpenCreate={onOpenCreate}
                  isDarkMode={isDarkMode}
                  isNotionMode={isNotionMode}
                />
              )}

              {activeTab === 'products' && (
                <ProductManager
                  products={products}
                  onAdd={handleAddProduct}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                  isDark={isDarkMode}
                  isNotionMode={isNotionMode}
                  showToast={showToast}
                  formatCurrency={formatRupiah}
                />
              )}

              {activeTab === 'calculator' && (
                <StickerCalculator
                  onSaveProduct={handleAddProduct}
                  isDark={isDarkMode}
                  isNotionMode={isNotionMode}
                  formatCurrency={formatRupiah}
                  showToast={showToast}
                />
              )}

              {activeTab === 'buyers' && (
                <BuyerManager
                  buyers={buyers}
                  invoices={invoices}
                  onAdd={handleAddBuyer}
                  onUpdate={handleUpdateBuyer}
                  onDelete={handleDeleteBuyer}
                  isDark={isDarkMode}
                  isNotionMode={isNotionMode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Hidden File Input for Partner Logo Crop */}
      <input
        type="file"
        ref={partnerLogoInputRef}
        onChange={handlePartnerLogoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden File Input for Edit Partner Logo Crop */}
      <input
        type="file"
        ref={editPartnerLogoInputRef}
        onChange={handleEditPartnerLogoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Partner Logo Crop Modal (New Partner) */}
      {rawPartnerLogo && (
        <ImageCropModal
          imageSrc={rawPartnerLogo}
          onClose={() => setRawPartnerLogo(null)}
          onCropComplete={handlePartnerCropComplete}
        />
      )}

      {/* Partner Logo Crop Modal (Editing Partner) */}
      {rawEditPartnerLogo && (
        <ImageCropModal
          imageSrc={rawEditPartnerLogo}
          onClose={() => setRawEditPartnerLogo(null)}
          onCropComplete={handleEditPartnerCropComplete}
        />
      )}

      {/* Hidden File Input for Hero Image Crop */}
      <input
        type="file"
        ref={heroImageInputRef}
        onChange={handleHeroImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Hero Image Crop Modal */}
      {rawHeroImage && (
        <ImageCropModal
          imageSrc={rawHeroImage}
          onClose={() => setRawHeroImage(null)}
          onCropComplete={handleHeroCropComplete}
          aspectRatio={1}
        />
      )}

      {/* Modal Edit Mitra Ekosistem (Dibuka via Double-Click atau Tombol Edit) */}
      <AnimatePresence>
        {editingPartnerIndex !== null && (
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
                    Edit Mitra Ekosistem #{editingPartnerIndex + 1}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingPartnerIndex(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Nama Mitra</label>
                  <input
                    type="text"
                    value={editPartnerName}
                    onChange={(e) => setEditPartnerName(e.target.value)}
                    placeholder="Contoh: Petronas Atelier, Unakara, dll."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                    style={{ fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Badge Status / Sektor (Opsional)</label>
                  <input
                    type="text"
                    value={editPartnerBadge}
                    onChange={(e) => setEditPartnerBadge(e.target.value)}
                    placeholder="Contoh: Creative Hub, Motorsport, dll."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Logo Mitra (Upload & Crop PNG / Gambar)</label>
                  <div className="flex items-center gap-3">
                    {editPartnerLogo ? (
                      <div className="relative w-14 h-14 bg-white/80 dark:bg-neutral-800 border border-[#E2D8C3] dark:border-neutral-700 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                        <img src={editPartnerLogo} alt="Logo" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setEditPartnerLogo(null)}
                          className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl text-[9px] cursor-pointer"
                          title="Hapus Logo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-[#EBE3D3]/50 dark:bg-neutral-800 border border-dashed border-[#E2D8C3] dark:border-neutral-700 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-sans">
                        No Logo
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => editPartnerLogoInputRef.current?.click()}
                      className="px-3 py-2 text-xs font-semibold bg-white dark:bg-neutral-800 border border-[#E2D8C3] dark:border-neutral-700 hover:border-blue-500 rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                    >
                      <Upload size={14} />
                      <span>{editPartnerLogo ? 'Ganti & Crop Logo' : 'Upload & Crop Logo'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-sans" style={{ fontWeight: 600 }}>Opsi Tampilan Marquee</label>
                  <div className="flex items-center gap-4 font-sans text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editDisplayMode"
                        checked={editPartnerDisplayMode === 'logo_and_text'}
                        onChange={() => setEditPartnerDisplayMode('logo_and_text')}
                        className="accent-blue-600"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">Logo + Nama Mitra</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editDisplayMode"
                        checked={editPartnerDisplayMode === 'logo_only'}
                        onChange={() => setEditPartnerDisplayMode('logo_only')}
                        className="accent-blue-600"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">Hanya Logo (Only Gambar)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2D8C3] dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPartnerIndex(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditPartner}
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

      {/* MODAL EDIT ANGGOTA PORTOFOLIO */}
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
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
                  <span>Simpan Perubahan Anggota</span>
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
                    Edit Riwayat Setoran
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Nominal Setoran (Rp) *</label>
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
                    <span>Tanggal Setoran (Custom DatePicker) *</span>
                  </label>
                  <CustomDatePicker
                    value={editingDeposit.date.includes('-') ? editingDeposit.date : ''}
                    onChange={(val) => {
                      const formatted = val ? formatDateToIndo(val) : editingDeposit.date;
                      setEditingDeposit({ ...editingDeposit, date: formatted });
                    }}
                    placeholder="Pilih Tanggal Setoran..."
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 font-sans tabular-nums font-semibold" style={{ fontWeight: 600 }}>Terformat: {editingDeposit.date}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans" style={{ fontWeight: 600 }}>Keterangan / Catatan Transaksi</label>
                  <input
                    type="text"
                    value={editingDeposit.note}
                    onChange={(e) => setEditingDeposit({ ...editingDeposit, note: e.target.value })}
                    placeholder="Contoh: Setoran Kas Tambahan, etc."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E2D8C3] dark:border-neutral-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDeposit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
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
                  <span>Simpan Perubahan Setoran</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'cms' && (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
          
          {/* SEC 1: EDIT HERO & BERANDA SETTINGS (COLLAPSIBLE ACCORDION) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsHeroCmsOpen(!isHeroCmsOpen)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Pengaturan Teks & Konten Hero Beranda
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {isHeroCmsOpen ? 'Buka' : 'Tutup'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Kustomisasi headline, deskripsi pengantar, dan tombol CTA halaman beranda
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {isHeroCmsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isHeroCmsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="p-6 space-y-4">
                    {/* Row 1: Headline 3 Parts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teks Utama (Regular)</label>
                        <input
                          type="text"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle && setHeroTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Contoh: Simbol Kecepatan"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teks Sorotan (Serif Italic)</label>
                        <input
                          type="text"
                          value={heroSubtitle}
                          onChange={(e) => setHeroSubtitle && setHeroSubtitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Contoh: Dalam Genggaman"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teks Akhiran (Suffix)</label>
                        <input
                          type="text"
                          value={heroSuffix}
                          onChange={(e) => setHeroSuffix && setHeroSuffix(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Contoh: Jemari Anda."
                        />
                      </div>
                    </div>

                    {/* Row 2: Hero Description & CTA Button Text */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deskripsi Pengantar Beranda</label>
                        <textarea
                          rows={2}
                          value={heroDescription}
                          onChange={(e) => setHeroDescription && setHeroDescription(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 leading-relaxed"
                          placeholder="Contoh: Koleksi aksesoris, keychain balap, dan rilisan kreatif edisi terbatas..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teks Tombol Call to Action (CTA)</label>
                        <input
                          type="text"
                          value={heroCtaText}
                          onChange={(e) => setHeroCtaText && setHeroCtaText(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Contoh: Jelajahi Koleksi Merchandise"
                        />
                        <span className="text-[10px] text-slate-400 block mt-1">Mengarahkan user ke tab Koleksi Merchandise</span>
                      </div>
                    </div>

                    {/* Row 3: Hero Image Upload & Crop */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload & Crop Gambar Hero Beranda</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        {/* Thumbnail Preview */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                          {heroImageUrl ? (
                            <img src={heroImageUrl} alt="Custom Hero" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-1">
                              <ImageIcon size={24} className="opacity-70 mb-0.5" />
                              <span className="text-[9px] font-bold">Default 3D</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-1 space-y-2">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Ganti gambar 3D default beranda dengan gambar buatan Anda sendiri. File yang diunggah akan dapat dicrop dengan rasio 1:1 square.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => heroImageInputRef.current?.click()}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Upload size={14} />
                              <span>Pilih & Crop Gambar</span>
                            </button>
                            {heroImageUrl && (
                              <button
                                type="button"
                                onClick={() => setHeroImageUrl && setHeroImageUrl('')}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw size={14} />
                                <span>Reset ke Default</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                      <div className="space-y-0.5">
                        <span className="font-bold block text-[11px]">Live Preview Beranda:</span>
                        <div className="font-mono text-xs">
                          {heroTitle} <span className="font-serif italic font-extrabold text-blue-600 dark:text-blue-400" style={{ fontWeight: 800 }}>{heroSubtitle}</span> {heroSuffix}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-md">
                          {heroDescription}
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] shrink-0 self-start sm:self-auto">
                        {heroCtaText} →
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEC 2: EDIT ABOUT PAGE CONTENT (COLLAPSIBLE ACCORDION) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsAboutCmsOpen(!isAboutCmsOpen)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Pengaturan Teks Halaman About (Tentang Kami)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {isAboutCmsOpen ? 'Buka' : 'Tutup'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Ubah narasi profil brand, filosofi atelier, serta informasi kontak resmi
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {isAboutCmsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isAboutCmsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="p-6 space-y-4">
                    {/* Row 1: Hero Tag & Main Title */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Label / Tag Atelier</label>
                        <input
                          type="text"
                          value={aboutHeroTag}
                          onChange={(e) => setAboutHeroTag && setAboutHeroTag(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Creative Atelier - est 2024"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Judul Utama Halaman About</label>
                        <input
                          type="text"
                          value={aboutTitle}
                          onChange={(e) => setAboutTitle && setAboutTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Destinasi Merchandise F1 & Koleksi Kreatif."
                        />
                      </div>
                    </div>

                    {/* Row 2: Main Story / Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Narasi Profil & Filosofi Atelier</label>
                      <textarea
                        rows={3}
                        value={aboutDescription}
                        onChange={(e) => setAboutDescription && setAboutDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600 leading-relaxed"
                        placeholder="Tuliskan deskripsi toko, misi, dan koleksi karya..."
                      />
                    </div>

                    {/* Row 3: Concierge / Contact Section */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Badge Concierge</label>
                        <input
                          type="text"
                          value={aboutConciergeTag}
                          onChange={(e) => setAboutConciergeTag && setAboutConciergeTag(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Pitstop Concierge"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Judul Bagian Kontak</label>
                        <input
                          type="text"
                          value={aboutConciergeTitle}
                          onChange={(e) => setAboutConciergeTitle && setAboutConciergeTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="Kontak & Komunitas"
                        />
                      </div>
                    </div>

                    {/* Row 4: Contacts Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Instagram (@)</label>
                        <input
                          type="text"
                          value={aboutInstagram}
                          onChange={(e) => setAboutInstagram && setAboutInstagram(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="@hilversen"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Resmi</label>
                        <input
                          type="text"
                          value={aboutEmail}
                          onChange={(e) => setAboutEmail && setAboutEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="marcauzed@gmail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telepon / WhatsApp</label>
                        <input
                          type="text"
                          value={aboutPhone}
                          onChange={(e) => setAboutPhone && setAboutPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          placeholder="+6289675916774"
                        />
                      </div>
                    </div>

                    {/* Live Preview About */}
                    <div className="mt-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Live Preview Konten Halaman About</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('about')}
                          className="underline hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buka Page About</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                      <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-blue-100 dark:border-neutral-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-sans" style={{ fontWeight: 600 }}>{aboutHeroTag}</span>
                        <h4 className="font-sans text-sm font-semibold text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{aboutTitle}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 font-sans">{aboutDescription}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEC 3: EDIT ECOSYSTEM PARTNERS (COLLAPSIBLE ACCORDION + TRANSPARENT PNG SUPPORT) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsPartnersCmsOpen(!isPartnersCmsOpen)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Manajemen Mitra Ekosistem
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {ecosystemPartners.length} Mitra ({isPartnersCmsOpen ? 'Buka' : 'Tutup'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Kelola logo brand, sponsor, dan mitra ekosistem yang bergerak otomatis di running text
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {isPartnersCmsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isPartnersCmsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="p-6">
                    {/* Partner list */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                      <div className="md:col-span-6 space-y-2 max-h-80 overflow-y-auto pr-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Mitra Aktif ({ecosystemPartners.length} Partner) - Double Click untuk Edit
                        </span>
                        {ecosystemPartners.map((item, idx) => (
                          <div
                            key={`partner-item-${idx}`}
                            onDoubleClick={() => handleOpenEditPartner(idx, item)}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl text-xs cursor-pointer transition-all hover:shadow-xs group"
                            title="Klik 2 kali untuk mengedit mitra ini"
                          >
                            <div className="flex items-center gap-3">
                              {item.logo ? (
                                <div className="w-9 h-9 rounded-lg border border-slate-200/80 dark:border-slate-700/80 p-1 flex items-center justify-center bg-transparent shrink-0" style={{ backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}>
                                  <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                              ) : (
                                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Tampilan: {item.displayMode === 'logo_only' ? 'Logo Saja (Only Gambar)' : 'Logo + Teks'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditPartner(idx, item);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Mitra"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePartner(idx);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Mitra"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Partner Form */}
                      <div className="md:col-span-6 bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Tambah Mitra / Sponsor Baru</span>
                        
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1">NAMA MITRA</label>
                          <input
                            type="text"
                            value={newPartnerName}
                            onChange={(e) => setNewPartnerName(e.target.value)}
                            placeholder="Contoh: Petronas Atelier, dll."
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1">BADGE LABEL / SEKTOR (Opsional)</label>
                          <input
                            type="text"
                            value={newPartnerBadge}
                            onChange={(e) => setNewPartnerBadge(e.target.value)}
                            placeholder="Contoh: Motorsport, Creative, dll."
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-600"
                          />
                        </div>

                        {/* Logo Upload & Crop option */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1">LOGO PARTNER (Support PNG Transparan)</label>
                          <div className="flex items-center gap-3">
                            {newPartnerLogo ? (
                              <div className="relative w-12 h-12 border border-slate-200 rounded-lg overflow-hidden p-1 flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}>
                                <img src={newPartnerLogo} alt="Logo" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => setNewPartnerLogo(null)}
                                  className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-bl text-[8px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => partnerLogoInputRef.current?.click()}
                              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload size={14} />
                              <span>{newPartnerLogo ? 'Ganti Logo PNG' : 'Upload Logo PNG Transparan'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Display Mode Selection */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1">OPSI TAMPILAN PADA CONTINUOUS MARQUEE</label>
                          <div className="flex items-center gap-3 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="partnerDisplayMode"
                                checked={newPartnerDisplayMode === 'logo_and_text'}
                                onChange={() => setNewPartnerDisplayMode('logo_and_text')}
                                className="accent-blue-600"
                              />
                              <span className="text-slate-800 dark:text-slate-200 font-medium">Logo + Nama Mitra</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="partnerDisplayMode"
                                checked={newPartnerDisplayMode === 'logo_only'}
                                onChange={() => setNewPartnerDisplayMode('logo_only')}
                                className="accent-blue-600"
                              />
                              <span className="text-slate-800 dark:text-slate-200 font-medium">Gambar / Logo Saja (No Text)</span>
                            </label>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPartner}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Plus size={14} />
                          <span>Tambahkan Mitra Ekosistem</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEC 4: PORTFOLIO FINANCIAL MEMBERS CMS (WITH EXPANDABLE CARDS & DATE PICKER DEPOSIT) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Opsi Keuangan & Portofolio Anggota
              </h3>
            </div>

            <div className="space-y-6">
              
              {/* Portfolio Unique Code Configuration Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Kode Unik Akses Portofolio Anggota (Eksklusif)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Kode rahasia yang wajib dimasukkan pengunjung umum untuk membuka blur & melihat portofolio tabungan komunitas secara transparan.
                  </p>
                </div>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={portfolioUniqueCode}
                    onChange={(e) => setPortfolioUniqueCode && setPortfolioUniqueCode(e.target.value)}
                    placeholder="Contoh: HILVERSEN2026"
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => showToast && showToast('Kode unik portofolio berhasil disimpan ke Cloud!')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Simpan Kode
                  </button>
                </div>
              </div>

              {/* Member Expandable List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Daftar Anggota & Saldo ({members.length} Anggota)
                </span>
                
                {members.map((member) => {
                  const isExpanded = expandedMemberId === member.id;
                  const currentDepositHistory = member.depositHistory || [
                    { id: `dh-${member.id}-init`, date: member.lastDeposit, amount: member.balance, note: 'Setoran Awal Tabungan', totalAfter: member.balance }
                  ];

                  return (
                    <div
                      key={member.id}
                      className={`bg-slate-50 dark:bg-slate-950/80 border rounded-2xl transition-all overflow-hidden ${
                        isExpanded
                          ? 'border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top Header Card (Clickable to Toggle Expand) */}
                      <div
                        onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                        className="p-4 cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-3 items-center select-none"
                      >
                        {/* ID & Color Circle */}
                        <div className="md:col-span-4 flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                            style={{ backgroundColor: member.avatarBg }}
                          >
                            {member.name[0]?.toUpperCase() || 'M'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-sans font-semibold text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                                {member.name}
                              </span>
                              <span className="text-[9px] font-sans font-semibold text-slate-400 tabular-nums" style={{ fontWeight: 600 }}>({member.id})</span>
                            </div>
                            {member.role && member.role.trim() !== '' && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
                                {member.role}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Deposit Balance */}
                        <div className="md:col-span-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans" style={{ fontWeight: 600 }}>Nominal Tabungan</span>
                          <span className="text-sm font-sans font-semibold text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 600 }}>
                            {formatRupiah(member.balance)}
                          </span>
                        </div>

                        {/* Expand Toggle Button */}
                        <div className="md:col-span-5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                              Terakhir: {member.lastDeposit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditMember(member);
                              }}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 hover:border-blue-500 hover:text-blue-600 cursor-pointer shadow-xs"
                              title="Edit Detail Anggota & Status"
                            >
                              <Edit3 size={13} />
                              <span>Edit Anggota</span>
                            </button>

                            <button
                              type="button"
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1 hover:border-blue-500 cursor-pointer shadow-xs"
                            >
                              <span>{isExpanded ? 'Tutup' : 'Detail & Setoran'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(member.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Panel: History & Tambah Setoran */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 space-y-4"
                          >
                            {/* Summary Stats Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans" style={{ fontWeight: 600 }}>Total Akumulasi Saldo</span>
                                <span className="text-base font-sans font-semibold text-blue-600 dark:text-blue-400 tabular-nums" style={{ fontWeight: 600 }}>
                                  {formatRupiah(member.balance)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Tanggal Setor Terakhir</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold" style={{ fontWeight: 600 }}>
                                  {member.lastDeposit}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Status Kategori Anggota</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {member.tier} ({member.role}) • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{member.status || 'Aktif'}</span>
                                </span>
                              </div>
                            </div>

                            {/* History Setoran Tabungan List */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-1.5">
                                  <History className="w-3.5 h-3.5 text-blue-600" />
                                  <span>History / Riwayat Setoran Tabungan ({currentDepositHistory.length} Catatan)</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-normal">Tiap baris dapat diedit nominal & tanggalnya</span>
                              </div>

                              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                                {currentDepositHistory.map((h, hIdx) => (
                                  <div
                                    key={h.id || `hist-${hIdx}`}
                                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400/50 rounded-lg text-xs transition-colors group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[10px] font-mono font-semibold shrink-0" style={{ fontWeight: 600 }}>
                                        {h.date}
                                      </span>
                                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                                        {h.note || 'Setoran Tabungan'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right">
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums" style={{ fontWeight: 600 }}>
                                          + {formatRupiah(h.amount)}
                                        </span>
                                        {h.totalAfter ? (
                                          <span className="text-[9px] text-slate-400 block font-mono">
                                            Saldo: {formatRupiah(h.totalAfter)}
                                          </span>
                                        ) : null}
                                      </div>

                                      {/* Action buttons per history row */}
                                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditDeposit(member.id, h)}
                                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded cursor-pointer transition-colors"
                                          title="Edit Baris Setoran Ini"
                                        >
                                          <Edit3 size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDepositItem(member.id, h.id)}
                                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded cursor-pointer transition-colors"
                                          title="Hapus Baris Setoran Ini"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Form Input Tambah Setoran Baru with Date Picker */}
                            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>Input Tambah Setoran Baru untuk {member.name}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                    Nominal Setoran (Rp) *
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Contoh: 5000000"
                                    value={depAmounts[member.id] || ''}
                                    onChange={(e) => setDepAmounts(prev => ({ ...prev, [member.id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none font-mono font-bold"
                                    style={{ fontWeight: 600 }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                    <span>Tanggal Setoran (Custom DatePicker) *</span>
                                  </label>
                                  <CustomDatePicker
                                    value={depDates[member.id] || new Date().toISOString().split('T')[0]}
                                    onChange={(val) => setDepDates(prev => ({ ...prev, [member.id]: val }))}
                                    placeholder="Pilih Tanggal Setoran..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                    Keterangan / Catatan
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Contoh: Setoran Kas Proyek"
                                    value={depNotes[member.id] || ''}
                                    onChange={(e) => setDepNotes(prev => ({ ...prev, [member.id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  disabled={!depAmounts[member.id] || parseFloat(depAmounts[member.id]) <= 0}
                                  onClick={() => handleMemberAddDeposit(member.id)}
                                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                >
                                  <Check size={14} />
                                  <span>Simpan Setoran Tabungan</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Add Member Form */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <UserPlus size={14} className="text-blue-500" />
                  <span>Tambah Anggota Portofolio Baru</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">NAMA LENGKAP</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Contoh: Raden Arya, dll."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">PERAN / JABATAN</label>
                    <input
                      type="text"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="Contoh: Lead Designer, etc."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">TABUNGAN PERDANA (RP)</label>
                    <input
                      type="number"
                      value={newMemberBalance}
                      onChange={(e) => setNewMemberBalance(e.target.value)}
                      placeholder="Contoh: 150000000"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none font-mono font-bold focus:border-blue-600"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check size={14} />
                    <span>Simpan Anggota Baru</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
