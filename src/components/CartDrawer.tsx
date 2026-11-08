import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah } from '../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cod'>('transfer');
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 500000 ? 0 : 25000;
  const total = subtotal + (items.length > 0 ? shippingFee : 0);

  const handleStartCheckout = () => {
    if (items.length === 0) return;
    setCheckoutStep('shipping');
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrder = `HLV-F1-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);
    setCheckoutStep('success');
  };

  const handleDone = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#131C31] shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
          
          {/* Top Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Hilversen F1 Bag
              </span>
              <h2 className="font-serif text-2xl font-normal text-slate-900 dark:text-white">
                {checkoutStep === 'cart' && `Keranjang Belanja (${items.length})`}
                {checkoutStep === 'shipping' && 'Pengiriman & Pembayaran'}
                {checkoutStep === 'success' && 'Pesanan Terkonfirmasi'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {checkoutStep === 'cart' && (
              <>
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-serif text-xl text-slate-900 dark:text-white">Keranjang Masih Kosong</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                        Pilih keychain F1 dari katalog kami untuk melengkapi koleksi Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3.5 bg-[#FAFAFA] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={resolveProductImageUrl(item.product.image)}
                          alt={item.product.name}
                          onError={handleImageError}
                          className="w-20 h-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                aria-label="Hapus Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-0.5">
                              {item.product.categoryLabel}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                              {formatRupiah(item.product.price)}
                            </span>

                            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {checkoutStep === 'shipping' && (
              <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Penerima
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Raden Fauzayyn"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAFAFA] dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-XXXX-XXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAFAFA] dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Pengiriman Lengkap
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAFAFA] dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        paymentMethod === 'transfer'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Transfer Bank</div>
                      <div className={`text-[10px] mt-0.5 ${paymentMethod === 'transfer' ? 'text-blue-100' : 'text-slate-500'}`}>
                        BCA / Mandiri / BSI
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Cash On Delivery</div>
                      <div className={`text-[10px] mt-0.5 ${paymentMethod === 'cod' ? 'text-blue-100' : 'text-slate-500'}`}>
                        Bayar saat kurir tiba
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="py-6 space-y-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                    No. Pemesanan: {orderNumber}
                  </span>
                  <h3 className="font-serif text-2xl text-slate-900 dark:text-white font-normal mt-1">
                    Terima Kasih Atas Pemesanan Anda
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                    Keychain F1 untuk <strong>{customerName || 'Pelanggan Terhormat'}</strong> sedang dikemas dalam box edisi khusus Hilversen F1.
                  </p>
                </div>

                <div className="bg-[#FAFAFA] dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Metode:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {paymentMethod === 'transfer' ? 'Transfer Bank Rekening Atelier' : 'Cash On Delivery (COD)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total Pembayaran:</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatRupiah(total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Alamat:</span>
                    <span className="text-right text-slate-900 dark:text-white max-w-[200px] truncate">{customerAddress || 'Jakarta'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-[#FAFAFA] dark:bg-[#0E1626] space-y-3">
            {checkoutStep === 'cart' && (
              <>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-slate-900 dark:text-white">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Pengiriman Berasuransi</span>
                    <span className="tabular-nums font-medium text-slate-900 dark:text-white">
                      {shippingFee === 0 ? 'Gratis' : formatRupiah(shippingFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span className="tabular-nums font-serif text-lg">{formatRupiah(total)}</span>
                  </div>
                </div>

                <button
                  disabled={items.length === 0}
                  onClick={handleStartCheckout}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {checkoutStep === 'shipping' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="w-1/3 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Konfirmasi Pesanan
                </button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <button
                onClick={handleDone}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali Berbelanja
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
