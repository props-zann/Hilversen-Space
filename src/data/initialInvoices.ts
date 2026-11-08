import { InvoiceData, Buyer, BusinessSettings } from '../types/invoice';

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  business: {
    name: 'Hilversen F1 Merchandise Atelier',
    tagline: 'Official F1 Keychains & Motorsport Invoice System',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190',
    phone: '+62 21 5790 8821',
    email: 'billing@hilversen-atelier.com',
    bankDetails: 'Bank BCA: 882-0192-301 a/n Hilversen Atelier PT'
  },
  taxRate: 11
};

export const INITIAL_INVOICES: InvoiceData[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV/2026/10/001',
    date: '02 Okt 2026',
    dueDate: '16 Okt 2026',
    buyer: {
      id: 'b-1',
      name: 'Raden Arya Wibowo',
      email: 'arya.wibowo@motorsport.co.id',
      phone: '0812-9843-1102',
      address: 'Kebayoran Baru, Jakarta Selatan',
      company: 'Jakarta GP Racing Club'
    },
    items: [
      {
        id: 'item-1',
        name: 'Hilversen Carbon Helmet F1 Keychain',
        quantity: 2,
        unitPrice: 185000,
        totalPrice: 370000
      },
      {
        id: 'item-2',
        name: 'Monaco GP Circuit Layout Keychain',
        quantity: 1,
        unitPrice: 145000,
        totalPrice: 145000
      }
    ],
    subtotal: 515000,
    taxAmount: 56650,
    discountAmount: 0,
    totalAmount: 571650,
    status: 'Lunas',
    notes: 'Terima kasih atas pesanan edisi kolektor F1!'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV/2026/10/002',
    date: '03 Okt 2026',
    dueDate: '17 Okt 2026',
    buyer: {
      id: 'b-2',
      name: 'Sarah N. Wibowo',
      email: 'sarah.wibowo@gmail.com',
      phone: '0811-2233-4455',
      address: 'Dago, Bandung',
      company: 'Private Collector'
    },
    items: [
      {
        id: 'item-3',
        name: 'F1 Red Soft Compound Tire Keychain Set',
        quantity: 3,
        unitPrice: 125000,
        totalPrice: 375000
      }
    ],
    subtotal: 375000,
    taxAmount: 41250,
    discountAmount: 25000,
    totalAmount: 391250,
    status: 'Pending',
    notes: 'Menunggu verifikasi transfer Bank BCA.'
  }
];
