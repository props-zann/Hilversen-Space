export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  inStock?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  description?: string;
  materials?: string;
  category?: string;
  variants?: ProductVariant[];
  shopeeLink?: string;
}

export interface BuyerItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  joinedAt?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  widthCm?: number;
  heightCm?: number;
}

export interface Buyer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

export interface BusinessSettings {
  business: {
    name: string;
    tagline?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    bankDetails?: string;
  };
  taxRate: number;
  owner?: {
    name?: string;
    avatar?: string;
    avatarStyle?: string;
  };
}

export type InvoiceStatus = 'Lunas' | 'Pending' | 'Dibatalkan' | 'paid' | 'pending';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  buyer: Buyer;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  amount?: number;
  client?: string;
}
