import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, PortfolioContributor } from '../types';
import { InvoiceData, BuyerItem } from '../types/invoice';
import { PRODUCTS, INITIAL_PORTFOLIO_MEMBERS } from '../data/mockData';

export interface CmsSettingsState {
  heroTitle: string;
  heroSubtitle: string;
  heroSuffix: string;
  heroDescription: string;
  heroCtaText: string;
  heroImageUrl?: string;
  aboutHeroTag: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutConciergeTag: string;
  aboutConciergeTitle: string;
  aboutConciergeDesc: string;
  aboutInstagram: string;
  aboutEmail: string;
  aboutPhone: string;
  ecosystemPartners: { name: string; badge?: string; logo?: string; displayMode?: 'logo_and_text' | 'logo_only' }[];
  qrisImageUrl?: string;
  qrisString?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  ewalletName?: string;
  ewalletAccountNo?: string;
  ewalletAccountName?: string;
  portfolioUniqueCode?: string;
}

export const DEFAULT_CMS_SETTINGS: CmsSettingsState = {
  heroTitle: 'The freedom is In Our Hand Nowdays',
  heroSubtitle: '',
  heroSuffix: '',
  heroDescription: 'Koleksi aksesoris, keychain balap, dan rilisan kreatif edisi terbatas yang dirancang dengan presisi titanium dan material serat karbon.',
  heroCtaText: 'Jelajahi Koleksi Merchandise',
  heroImageUrl: '',
  aboutHeroTag: 'Creative Atelier - est 2024',
  aboutTitle: 'Destinasi Merchandise F1 & Koleksi Kreatif.',
  aboutDescription: 'Hilversen adalah toko online (online shop) yang berfokus menyediakan merchandise Formula 1 sebagai produk utamanya, sekaligus menghadirkan beragam rilisan merchandise unik lainnya. Selain koleksi produk, kami juga menyediakan halaman Personal khusus yang didedikasikan untuk membagikan portofolio, rilisan proyek, dan kegiatan dari creator.',
  aboutConciergeTag: 'Pitstop Concierge',
  aboutConciergeTitle: 'Kontak & Komunitas',
  aboutConciergeDesc: 'Hubungi kami atau ikuti kanal resmi Hilversen untuk informasi rincian produk, pertanyaan pesanan, dan pembaruan kegiatan creator.',
  aboutInstagram: '@hilversen',
  aboutEmail: 'marcauzed@gmail.com',
  aboutPhone: '+6289675916774',
  ecosystemPartners: [
    { name: 'Unakara', badge: 'Creative Hub' },
    { name: 'LifGrow', badge: 'Performance Tech' },
    { name: 'Laforia', badge: 'Luxury Atelier' },
    { name: 'Stant Capital', badge: 'Motorsport Venture' }
  ],
  qrisImageUrl: '',
  qrisString: '00020101021126580016ID.GOPAY.WWW01189360091400000000005204581253033605802ID5918HILVERSEN ATELIER6007JAKARTA61051219062070703A016304E8A2',
  bankName: 'Bank BCA',
  bankAccountNo: '8820918244',
  bankAccountName: 'a.n. Fauzayyn Rachman',
  ewalletName: 'GoPay / OVO / DANA',
  ewalletAccountNo: '089675916774',
  ewalletAccountName: 'a.n. Hilversen Creator',
  portfolioUniqueCode: 'HILVERSEN2026'
};

// Recursive function to deeply strip undefined values from any payload
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item)) as any;
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    Object.keys(obj).forEach(key => {
      const val = (obj as any)[key];
      if (val !== undefined) {
        clean[key] = sanitizePayload(val);
      }
    });
    return clean as T;
  }
  return obj;
}

// 1. CMS Settings Sync
export function subscribeCmsSettings(onUpdate: (data: CmsSettingsState) => void) {
  const docRef = doc(db, 'cms_settings', 'global');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<CmsSettingsState>;
        const cmsData: CmsSettingsState = {
          heroTitle: data.heroTitle || DEFAULT_CMS_SETTINGS.heroTitle,
          heroSubtitle: data.heroSubtitle !== undefined ? data.heroSubtitle : DEFAULT_CMS_SETTINGS.heroSubtitle,
          heroSuffix: data.heroSuffix !== undefined ? data.heroSuffix : DEFAULT_CMS_SETTINGS.heroSuffix,
          heroDescription: data.heroDescription || DEFAULT_CMS_SETTINGS.heroDescription,
          heroCtaText: data.heroCtaText || DEFAULT_CMS_SETTINGS.heroCtaText,
          heroImageUrl: data.heroImageUrl || DEFAULT_CMS_SETTINGS.heroImageUrl,
          aboutHeroTag: data.aboutHeroTag || DEFAULT_CMS_SETTINGS.aboutHeroTag,
          aboutTitle: data.aboutTitle || DEFAULT_CMS_SETTINGS.aboutTitle,
          aboutDescription: data.aboutDescription || DEFAULT_CMS_SETTINGS.aboutDescription,
          aboutConciergeTag: data.aboutConciergeTag || DEFAULT_CMS_SETTINGS.aboutConciergeTag,
          aboutConciergeTitle: data.aboutConciergeTitle || DEFAULT_CMS_SETTINGS.aboutConciergeTitle,
          aboutConciergeDesc: data.aboutConciergeDesc || DEFAULT_CMS_SETTINGS.aboutConciergeDesc,
          aboutInstagram: data.aboutInstagram || DEFAULT_CMS_SETTINGS.aboutInstagram,
          aboutEmail: data.aboutEmail || DEFAULT_CMS_SETTINGS.aboutEmail,
          aboutPhone: data.aboutPhone || DEFAULT_CMS_SETTINGS.aboutPhone,
          ecosystemPartners: Array.isArray(data.ecosystemPartners)
            ? data.ecosystemPartners
            : DEFAULT_CMS_SETTINGS.ecosystemPartners,
          qrisImageUrl: data.qrisImageUrl !== undefined ? data.qrisImageUrl : DEFAULT_CMS_SETTINGS.qrisImageUrl,
          qrisString: data.qrisString !== undefined ? data.qrisString : DEFAULT_CMS_SETTINGS.qrisString,
          bankName: data.bankName !== undefined ? data.bankName : DEFAULT_CMS_SETTINGS.bankName,
          bankAccountNo: data.bankAccountNo !== undefined ? data.bankAccountNo : DEFAULT_CMS_SETTINGS.bankAccountNo,
          bankAccountName: data.bankAccountName !== undefined ? data.bankAccountName : DEFAULT_CMS_SETTINGS.bankAccountName,
          ewalletName: data.ewalletName !== undefined ? data.ewalletName : DEFAULT_CMS_SETTINGS.ewalletName,
          ewalletAccountNo: data.ewalletAccountNo !== undefined ? data.ewalletAccountNo : DEFAULT_CMS_SETTINGS.ewalletAccountNo,
          ewalletAccountName: data.ewalletAccountName !== undefined ? data.ewalletAccountName : DEFAULT_CMS_SETTINGS.ewalletAccountName,
          portfolioUniqueCode: data.portfolioUniqueCode !== undefined ? data.portfolioUniqueCode : DEFAULT_CMS_SETTINGS.portfolioUniqueCode
        };
        try {
          localStorage.setItem('hilversen_cms_cache', JSON.stringify(cmsData));
        } catch (e) {}
        onUpdate(cmsData);
      } else {
        onUpdate(DEFAULT_CMS_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'cms_settings/global');
    }
  );
}

export async function saveCmsSettingsToFirestore(settings: Partial<CmsSettingsState>, updatedBy?: string) {
  try {
    const docRef = doc(db, 'cms_settings', 'global');
    const sanitizedSettings = sanitizePayload(settings);
    
    await setDoc(docRef, {
      ...sanitizedSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'admin'
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'cms_settings/global');
    throw error;
  }
}

// 2. Products Sync
export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Product);
      });
      // If Firestore is empty and no products were ever saved, return initial products
      if (snapshot.empty && localStorage.getItem('hilversen_products_initialized') !== 'true') {
        onUpdate(PRODUCTS);
      } else {
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  );
}

export async function seedProductsIfEmpty() {
  try {
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    if (snap.empty && localStorage.getItem('hilversen_products_initialized') !== 'true') {
      for (const prod of PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), sanitizePayload({
          ...prod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      }
      localStorage.setItem('hilversen_products_initialized', 'true');
    }
  } catch (error) {
    console.warn("Could not seed products:", error);
  }
}

export async function saveProductToFirestore(product: Product) {
  try {
    const docRef = doc(db, 'products', product.id);
    const sanitized = sanitizePayload(product);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    localStorage.setItem('hilversen_products_initialized', 'true');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    throw error;
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    localStorage.setItem('hilversen_products_initialized', 'true');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    throw error;
  }
}

// 3. Portfolio Members Sync
export function subscribePortfolioMembers(onUpdate: (members: PortfolioContributor[]) => void) {
  const colRef = collection(db, 'portfolio_members');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: PortfolioContributor[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PortfolioContributor);
      });
      if (snapshot.empty && localStorage.getItem('hilversen_members_initialized') !== 'true') {
        seedPortfolioMembersIfEmpty();
        onUpdate(INITIAL_PORTFOLIO_MEMBERS);
      } else {
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'portfolio_members');
    }
  );
}

export async function seedPortfolioMembersIfEmpty() {
  try {
    const colRef = collection(db, 'portfolio_members');
    const snap = await getDocs(colRef);
    if (snap.empty && localStorage.getItem('hilversen_members_initialized') !== 'true') {
      for (const mem of INITIAL_PORTFOLIO_MEMBERS) {
        await setDoc(doc(db, 'portfolio_members', mem.id), sanitizePayload({
          ...mem,
          updatedAt: new Date().toISOString()
        }));
      }
      localStorage.setItem('hilversen_members_initialized', 'true');
    }
  } catch (error) {
    console.warn("Could not seed portfolio members:", error);
  }
}

export async function savePortfolioMemberToFirestore(member: PortfolioContributor) {
  try {
    const docRef = doc(db, 'portfolio_members', member.id);
    const sanitized = sanitizePayload(member);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `portfolio_members/${member.id}`);
    throw error;
  }
}

export async function deletePortfolioMemberFromFirestore(memberId: string) {
  try {
    const docRef = doc(db, 'portfolio_members', memberId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `portfolio_members/${memberId}`);
    throw error;
  }
}

// 4. Invoices Sync (Strict Firestore mapping with zero mock fallback)
export function subscribeInvoices(onUpdate: (invoices: InvoiceData[]) => void) {
  const colRef = collection(db, 'invoices');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: InvoiceData[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as InvoiceData);
      });
      // Return exact cloud state (deleted invoices stay permanently deleted)
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    }
  );
}

export async function saveInvoiceToFirestore(invoice: InvoiceData) {
  try {
    const docRef = doc(db, 'invoices', invoice.id);
    const sanitized = sanitizePayload(invoice);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `invoices/${invoice.id}`);
    throw error;
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string) {
  try {
    const docRef = doc(db, 'invoices', invoiceId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `invoices/${invoiceId}`);
    throw error;
  }
}

// 5. Buyers Sync
export function subscribeBuyers(onUpdate: (buyers: BuyerItem[]) => void) {
  const colRef = collection(db, 'buyers');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: BuyerItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as BuyerItem);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'buyers');
    }
  );
}

export async function saveBuyerToFirestore(buyer: BuyerItem) {
  try {
    const docRef = doc(db, 'buyers', buyer.id);
    const sanitized = sanitizePayload(buyer);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `buyers/${buyer.id}`);
    throw error;
  }
}

export async function deleteBuyerFromFirestore(buyerId: string) {
  try {
    const docRef = doc(db, 'buyers', buyerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `buyers/${buyerId}`);
    throw error;
  }
}
