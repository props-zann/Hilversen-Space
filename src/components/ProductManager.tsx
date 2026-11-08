import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Edit3, 
  Upload, 
  Check, 
  Star, 
  Tag, 
  Layers, 
  Crop,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';
import { ProductItem, ProductVariant } from '../types/invoice';
import { useEscKey, formatCurrency as defaultFormatCurrency } from '../utils/helpers';
import { ImageCropModal } from './ImageCropModal';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';

interface ProductManagerProps {
  products: ProductItem[];
  onAdd: (product: ProductItem) => void;
  onUpdate: (product: ProductItem) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
  isNotionMode?: boolean;
  onCreateInvoiceItem?: (item: any) => void;
  showToast?: (msg: string) => void;
  formatCurrency?: (amount: number) => string;
}

const SAMPLE_PRODUCT_IMAGES = [
  { label: 'Helm F1 Carbon', url: '/src/assets/images/f1_keychain_helmet_1791067184655.jpg' },
  { label: 'Monaco Track', url: '/src/assets/images/f1_keychain_track_1791067194914.jpg' },
  { label: 'Ban Pirelli', url: '/src/assets/images/f1_keychain_tire_1791067206215.jpg' },
  { label: 'Steering Telemetry', url: '/src/assets/images/f1_keychain_hero_1791067169824.jpg' }
];

export const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  onAdd, 
  onUpdate, 
  onDelete, 
  isDark, 
  isNotionMode = false,
  onCreateInvoiceItem,
  showToast,
  formatCurrency: formatCurrencyProp
}) => {
  // Crop Modal States
  const [cropRawImage, setCropRawImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{
    type: 'new_product' | 'edit_product' | 'edit_variant';
    variantIndex?: number;
  } | null>(null);

  // Hidden File Inputs
  const newProductFileInputRef = useRef<HTMLInputElement | null>(null);
  const editProductFileInputRef = useRef<HTMLInputElement | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeVariantIndexForUpload, setActiveVariantIndexForUpload] = useState<number | null>(null);

  // New Product Form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newVariants, setNewVariants] = useState<ProductVariant[]>([]);
  const [newShopeeLink, setNewShopeeLink] = useState('');

  // Image Reorder Helpers
  const handleMoveNewImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= newImages.length) return;
    const updated = [...newImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setNewImages(updated);
    setNewImageUrl(updated[0] || '');
  };

  const handleMakeNewImageCover = (idx: number) => {
    if (idx === 0) return;
    handleMoveNewImage(idx, 0);
    if (showToast) showToast('Foto terpilih dijadikan Sampul Utama.');
  };

  const handleMoveEditImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= editImages.length) return;
    const updated = [...editImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setEditImages(updated);
    setEditImageUrl(updated[0] || '');
  };

  const handleMakeEditImageCover = (idx: number) => {
    if (idx === 0) return;
    handleMoveEditImage(idx, 0);
    if (showToast) showToast('Foto terpilih dijadikan Sampul Utama.');
  };

  // Modal Edit Product State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<ProductItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);
  const [editShopeeLink, setEditShopeeLink] = useState('');

  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const formatCurrency = formatCurrencyProp || defaultFormatCurrency;

  const productSuggestions = useMemo(() => {
    if (!newName.trim()) return [];
    return (products || []).filter(p => p && p.name && p.name.toLowerCase().includes(newName.toLowerCase()));
  }, [newName, products]);

  useEscKey(() => { 
    if (confirmDeleteProduct) setConfirmDeleteProduct(null);
    else if (editingProduct) setEditingProduct(null); 
  });

  const cardBase = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200');
  const inputBase = isNotionMode ? 'bg-white border-2 border-black rounded-none text-black placeholder:text-neutral-500' : (isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/40' : 'bg-slate-50 border-slate-200 text-slate-900');
  const itemBase = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black hover:bg-neutral-50' : (isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300');
  const modalBg = isNotionMode ? 'bg-white border-2 border-black rounded-none shadow-none text-black' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200');

  // File Picker Trigger -> Open Crop Modal
  const handleTriggerFilePicker = (type: 'new_product' | 'edit_product' | 'edit_variant', variantIdx?: number) => {
    setCropTarget({ type, variantIndex: variantIdx });
    if (type === 'new_product') newProductFileInputRef.current?.click();
    else if (type === 'edit_product') editProductFileInputRef.current?.click();
    else if (type === 'edit_variant') {
      setActiveVariantIndexForUpload(variantIdx ?? null);
      variantFileInputRef.current?.click();
    }
  };

  // Generic File Change -> Read to DataURL and launch Crop Modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCropRawImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      // Reset input value so same file can be chosen again
      e.target.value = '';
    }
  };

  // Crop Complete -> Push to appropriate state
  const handleCropComplete = (croppedUrl: string) => {
    if (!cropTarget) return;

    if (cropTarget.type === 'new_product') {
      if (newImages.length >= 9) {
        if (showToast) showToast('Maksimal 9 foto per produk!');
        setCropRawImage(null);
        return;
      }
      const updated = [...newImages, croppedUrl];
      setNewImages(updated);
      setNewImageUrl(updated[0]);
      if (showToast) showToast('Foto produk berhasil diringkas & dicrop!');
    } else if (cropTarget.type === 'edit_product') {
      if (editImages.length >= 9) {
        if (showToast) showToast('Maksimal 9 foto per produk!');
        setCropRawImage(null);
        return;
      }
      const updated = [...editImages, croppedUrl];
      setEditImages(updated);
      setEditImageUrl(updated[0]);
      if (showToast) showToast('Foto produk berhasil diringkas & dicrop!');
    } else if (cropTarget.type === 'edit_variant' && cropTarget.variantIndex !== undefined) {
      setEditVariants(prev => prev.map((v, i) => i === cropTarget.variantIndex ? { ...v, image: croppedUrl } : v));
      if (showToast) showToast('Foto variasi berhasil dicrop!');
    }

    setCropRawImage(null);
    setCropTarget(null);
  };

  // Add Product
  const handleAdd = () => { 
    if (!newName || !newPrice) return; 
    const priceNum = parseFloat(newPrice) || 0;
    const origPriceNum = parseFloat(newOriginalPrice) || undefined;
    const primaryImg = newImages[0] || newImageUrl || '/src/assets/images/f1_keychain_hero_1791067169824.jpg';

    onAdd({ 
      id: `PRD-${Math.floor(Math.random() * 9000 + 1000)}`, 
      name: newName, 
      price: priceNum,
      originalPrice: origPriceNum,
      description: newDescription.trim() || undefined,
      image: primaryImg,
      images: newImages.length > 0 ? newImages : [primaryImg],
      variants: newVariants.length > 0 ? newVariants : undefined,
      shopeeLink: newShopeeLink.trim() || undefined
    }); 

    // Reset Form
    setNewName(''); 
    setNewPrice(''); 
    setNewOriginalPrice('');
    setNewDescription('');
    setNewImageUrl('');
    setNewImages([]);
    setNewVariants([]);
    setNewShopeeLink('');
    setShowProductSuggestions(false); 
    if (showToast) showToast(`Produk "${newName}" berhasil disimpan!`);
  };
  
  // Open Edit Modal
  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setEditDescription(product.description || '');
    setEditShopeeLink(product.shopeeLink || '');
    
    const existingImgs = product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
      
    setEditImages(existingImgs);
    setEditImageUrl(existingImgs[0] || product.image || '');
    setEditVariants(product.variants ? [...product.variants] : []);
  };

  // Save Edit Modal
  const handleSaveEdit = () => {
    if (editingProduct && editName) {
      const priceNum = parseFloat(editPrice) || 0;
      const origPriceNum = parseFloat(editOriginalPrice) || undefined;
      const primaryImg = editImages[0] || editImageUrl || editingProduct.image || '';

      onUpdate({
        ...editingProduct,
        name: editName,
        price: priceNum,
        originalPrice: origPriceNum,
        description: editDescription.trim() || undefined,
        image: primaryImg,
        images: editImages.length > 0 ? editImages : [primaryImg],
        variants: editVariants.length > 0 ? editVariants : undefined,
        shopeeLink: editShopeeLink.trim() || undefined
      });

      setEditingProduct(null);
      if (showToast) showToast(`Produk "${editName}" berhasil diperbarui & disimpan!`);
    }
  };

  // Remove individual photo from edit array
  const handleRemovePhotoAt = (idx: number) => {
    const updated = editImages.filter((_, i) => i !== idx);
    setEditImages(updated);
    setEditImageUrl(updated[0] || '');
  };

  // Add new blank variant to editVariants
  const handleAddBlankVariant = () => {
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      name: `Variasi ${editVariants.length + 1}`,
      price: parseFloat(editPrice) || 0,
      originalPrice: parseFloat(editOriginalPrice) || undefined,
      inStock: true
    };
    setEditVariants(prev => [...prev, newVar]);
  };

  // Lock body scroll when modal is active
  useEffect(() => {
    if (editingProduct || confirmDeleteProduct || cropRawImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingProduct, confirmDeleteProduct, cropRawImage]);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      
      {/* Hidden File Inputs for Local Device Explorer */}
      <input
        type="file"
        ref={newProductFileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={editProductFileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={variantFileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Interactive Image Crop Modal */}
      <AnimatePresence>
        {cropRawImage && (
          <ImageCropModal
            imageSrc={cropRawImage}
            onClose={() => setCropRawImage(null)}
            onCropComplete={handleCropComplete}
          />
        )}
      </AnimatePresence>

      <header className="mb-6">
        <h1 className={`text-2xl font-bold ${isNotionMode ? 'text-black font-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Master Produk Seller</h1>
      </header>

      {/* TAMBAH PRODUK SELLER FORM ACCORDION */}
      <div className={`${cardBase} shadow-xs border mb-8 transition-colors duration-300 relative ${isNotionMode ? 'rounded-none' : 'rounded-2xl'} overflow-hidden`}>
        {/* Accordion Toggle Header */}
        <button
          type="button"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Plus size={16} />
            </div>
            <div>
              <h3 className={`font-bold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 ${isNotionMode ? 'text-black font-extrabold' : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                <span>Tambah Produk Seller Baru</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {isAddFormOpen ? 'Klik untuk menutup formulir input produk' : 'Klik untuk membuka formulir input produk baru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hidden xs:inline-block">
              {isAddFormOpen ? 'Tutup Form' : '+ Buka Form Input'}
            </span>
            <div className="p-1 rounded-lg text-slate-400 bg-slate-100 dark:bg-slate-800">
              {isAddFormOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isAddFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="relative md:col-span-6">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nama Produk / Barang</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: F1 Carbon Helmet Keychain..." 
                      value={newName} 
                      onFocus={() => { setShowProductSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)}
                      onChange={(e) => { setNewName(e.target.value); setShowProductSuggestions(true); }} 
                      className={`w-full ${inputBase} border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isNotionMode ? 'rounded-none' : 'rounded-xl focus:ring-2 focus:border-indigo-500'}`} 
                    />
                    {showProductSuggestions && productSuggestions.length > 0 && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${isNotionMode ? 'bg-white border-2 border-black rounded-none text-black' : (isDark ? 'bg-slate-900 border-slate-700 rounded-xl shadow-2xl' : 'bg-white border-slate-200 rounded-xl shadow-2xl')}`}>
                        {productSuggestions.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onMouseDown={() => {
                              setNewName(s.name);
                              setNewPrice(s.price ? s.price.toString() : '');
                              setNewOriginalPrice(s.originalPrice ? s.originalPrice.toString() : '');
                              if (s.description) setNewDescription(s.description);
                              if (s.image) {
                                setNewImageUrl(s.image);
                                setNewImages([s.image]);
                              }
                              setShowProductSuggestions(false);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs flex justify-between items-center hover:bg-indigo-50 dark:hover:bg-slate-800"
                          >
                            <span className="font-semibold">{s.name}</span>
                            <span className="font-bold font-mono text-blue-600">{formatCurrency(s.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Harga Jual (Rp)</label>
                    <input 
                      type="number" 
                      placeholder="185000" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      className={`w-full ${inputBase} border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isNotionMode ? 'rounded-none' : 'rounded-xl focus:ring-2 focus:border-indigo-500'}`} 
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 text-red-500">Harga Coret (Rp) / Coret</label>
                    <input 
                      type="number" 
                      placeholder="250000 (opsional)" 
                      value={newOriginalPrice} 
                      onChange={(e) => setNewOriginalPrice(e.target.value)} 
                      className={`w-full ${inputBase} border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isNotionMode ? 'rounded-none' : 'rounded-xl focus:ring-2 focus:border-indigo-500'}`} 
                    />
                  </div>
                </div>

                {/* Deskripsi Area */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Deskripsi Lengkap Produk</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis deskripsi detail produk, bahan, spesifikasi, dan keunggulan untuk pembeli..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className={`w-full ${inputBase} border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isNotionMode ? 'rounded-none' : 'rounded-xl focus:ring-2 focus:border-indigo-500'}`}
                  />
                </div>

                {/* Link Shopee Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 mb-1">Link Shopee Produk (Opsional)</label>
                  <input 
                    type="url" 
                    placeholder="https://shopee.co.id/..." 
                    value={newShopeeLink} 
                    onChange={(e) => setNewShopeeLink(e.target.value)} 
                    className={`w-full ${inputBase} border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isNotionMode ? 'rounded-none' : 'rounded-xl focus:ring-2 focus:border-indigo-500'}`} 
                  />
                </div>

                {/* Multiple Images Upload Gallery with Reordering (Max 9) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">
                      Galeri Foto Produk ({newImages.length}/9 Foto)
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      *Urutan #1 adalah Sampul Utama. Gunakan tombol ◀ ▶ atau ★ untuk mengatur urutan.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Image Thumbnails with Reorder Controls */}
                    {newImages.map((imgUrl, idx) => (
                      <div 
                        key={`new-img-${idx}`}
                        className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 group flex flex-col justify-between"
                      >
                        <img src={imgUrl} alt={`Foto ${idx+1}`} className="w-full h-full object-cover absolute inset-0" />
                        
                        {/* Top Bar Badges & Remove */}
                        <div className="relative z-10 p-1 flex items-center justify-between">
                          {idx === 0 ? (
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded shadow-xs">
                              ★ Sampul
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMakeNewImageCover(idx)}
                              className="px-1.5 py-0.5 bg-black/75 hover:bg-amber-500 text-white text-[8px] font-bold rounded transition-colors cursor-pointer flex items-center gap-0.5 shadow-xs"
                              title="Jadikan sebagai foto sampul utama"
                            >
                              <Star size={8} className="fill-current" />
                              <span>Sampul</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const updated = newImages.filter((_, i) => i !== idx);
                              setNewImages(updated);
                              setNewImageUrl(updated[0] || '');
                            }}
                            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md text-xs cursor-pointer"
                            title="Hapus foto ini"
                          >
                            <X size={11} />
                          </button>
                        </div>

                        {/* Bottom Bar: Position Badge & Move Left / Right Controls */}
                        <div className="relative z-10 p-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
                          <span className="text-[9px] font-mono font-bold px-1 rounded bg-black/50">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveNewImage(idx, idx - 1)}
                                className="w-5 h-5 bg-black/60 hover:bg-blue-600 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
                                title="Geser ke kiri (Urutan sebelumnya)"
                              >
                                <ChevronLeft size={12} />
                              </button>
                            )}

                            {idx < newImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveNewImage(idx, idx + 1)}
                                className="w-5 h-5 bg-black/60 hover:bg-blue-600 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
                                title="Geser ke kanan (Urutan berikutnya)"
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Image Box button if < 9 */}
                    {newImages.length < 9 && (
                      <button
                        type="button"
                        onClick={() => handleTriggerFilePicker('new_product')}
                        className="w-24 h-24 bg-[#FFFDF9]/60 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/20 text-slate-400 hover:text-blue-600 shrink-0"
                        title="Upload foto dari komputer / HP"
                      >
                        <Plus size={18} className="stroke-[2.5]" />
                        <span className="text-[9px] mt-1 font-semibold text-center leading-tight">Upload & Crop</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleAdd} 
                    disabled={!newName || !newPrice} 
                    className={`font-bold px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs ${isNotionMode ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-none' : 'bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-xs'}`}
                  >
                    <Plus size={16} />
                    <span>Simpan Produk Baru</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

          {/* CARDS GALLERY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Belum ada produk seller tersimpan.</p>
              </div>
            ) : (
              products.map((product) => {
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                const discountPercent = hasDiscount 
                  ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
                  : 0;

                return (
                  <div 
                    key={product.id} 
                    className={`${itemBase} overflow-hidden flex flex-col justify-between group transition-all duration-200 border ${isNotionMode ? 'rounded-none border-2 shadow-none' : 'rounded-2xl hover:shadow-lg'}`}
                  >
                    {/* Aspect-Square 1:1 Image Header */}
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      {product.image ? (
                        <>
                          <img 
                            src={resolveProductImageUrl(product.image)} 
                            alt={product.name} 
                            onError={handleImageError}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        </>
                      ) : (
                        <div 
                          onClick={() => handleOpenEdit(product)}
                          className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-4 text-center group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800/80 transition-colors"
                        >
                          <Upload size={24} className="mb-1 text-slate-400" />
                          <span className="text-xs font-semibold">+ Tambah Foto Produk</span>
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-mono font-bold rounded">
                        {product.id}
                      </div>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded-md shadow-xs">
                          -{discountPercent}%
                        </div>
                      )}

                      {/* Multiple Photos Indicator Badge */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1">
                          <ImageIcon size={10} />
                          <span>{product.images.length} Foto</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 
                          className={`font-sans font-semibold text-base leading-snug line-clamp-2 ${isNotionMode ? 'text-black' : (isDark ? 'text-slate-100' : 'text-slate-900')}`}
                          style={{ fontWeight: 600 }}
                        >
                          {product.name}
                        </h4>

                        {/* Variants Count pill */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <Layers size={11} />
                            <span>{product.variants.length} Pilihan Variasi</span>
                          </div>
                        )}

                        {product.description ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {product.description}
                          </p>
                        ) : (
                          <p className="text-[11px] italic text-slate-400 mt-1">
                            Belum ada deskripsi produk.
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans" style={{ fontWeight: 600 }}>Harga Seller</span>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`font-sans font-semibold text-base tabular-nums ${isNotionMode ? 'text-black font-mono' : (isDark ? 'text-blue-400' : 'text-blue-600')}`} style={{ fontWeight: 600 }}>
                              {formatCurrency(product.price)}
                            </span>

                            {hasDiscount && (
                              <span className="line-through text-slate-400 text-xs tabular-nums font-sans font-semibold" style={{ fontWeight: 600 }}>
                                {formatCurrency(product.originalPrice!)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setConfirmDeleteProduct(product)} 
                            className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

      {/* POP-UP EDIT PRODUK SELLER MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" 
              onClick={() => setEditingProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`${modalBg} w-full max-w-2xl p-6 relative z-10 border max-h-[90vh] overflow-y-auto ${isNotionMode ? 'rounded-none border-2 border-black shadow-none' : 'rounded-2xl shadow-2xl'}`}
            >
              <button 
                onClick={() => setEditingProduct(null)} 
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isNotionMode ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                    Edit Produk Seller
                  </h3>
                  <span className="text-xs font-mono text-slate-400">ID: {editingProduct.id}</span>
                </div>
              </div>

              <div className="space-y-5 text-left mb-6">
                
                {/* Multi-Image Gallery Manager (Max 9 Photos) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-400">
                      Galeri Foto Produk ({editImages.length}/9 Foto)
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      *Foto pertama menjadi Sampul Utama
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Uploaded Photos Grid with Reorder Controls */}
                      {editImages.map((imgUrl, idx) => (
                        <div 
                          key={`edit-img-${idx}`}
                          className="relative w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 group flex flex-col justify-between"
                        >
                          <img src={imgUrl} alt={`Foto ${idx+1}`} className="w-full h-full object-cover absolute inset-0" />
                          
                          {/* Top Bar: Sampul badge or Jadikan Sampul button + Remove */}
                          <div className="relative z-10 p-1 flex items-center justify-between">
                            {idx === 0 ? (
                              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded shadow-xs">
                                ★ Sampul
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMakeEditImageCover(idx)}
                                className="px-1.5 py-0.5 bg-black/75 hover:bg-amber-500 text-white text-[8px] font-bold rounded transition-colors cursor-pointer flex items-center gap-0.5 shadow-xs"
                                title="Jadikan sebagai foto sampul utama"
                              >
                                <Star size={8} className="fill-current" />
                                <span>Sampul</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemovePhotoAt(idx)}
                              className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md text-xs cursor-pointer"
                              title="Hapus foto ini"
                            >
                              <X size={11} />
                            </button>
                          </div>

                          {/* Bottom Bar: Position Index and Left/Right Shift buttons */}
                          <div className="relative z-10 p-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
                            <span className="text-[9px] font-mono font-bold px-1 rounded bg-black/50">
                              #{idx + 1}
                            </span>

                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveEditImage(idx, idx - 1)}
                                  className="w-5 h-5 bg-black/60 hover:bg-blue-600 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
                                  title="Geser ke kiri"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                              )}

                              {idx < editImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveEditImage(idx, idx + 1)}
                                  className="w-5 h-5 bg-black/60 hover:bg-blue-600 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
                                  title="Geser ke kanan"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Image Box (if under 9) */}
                      {editImages.length < 9 && (
                        <button
                          type="button"
                          onClick={() => handleTriggerFilePicker('edit_product')}
                          className="w-24 h-24 bg-[#FFFDF9]/60 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/20 text-slate-400 hover:text-blue-600 shrink-0"
                          title="Upload foto baru dari komputer / HP"
                        >
                          <Plus size={18} className="stroke-[2.5]" />
                          <span className="text-[9px] mt-1 font-semibold text-center leading-tight">Upload & Crop</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name, Price & Harga Coret Inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Nama Produk</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className={`w-full px-3.5 py-2.5 text-xs border outline-none ${isNotionMode ? 'rounded-none border-2 border-black font-semibold bg-white' : `rounded-xl ${inputBase}`}`} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Harga Jual (Rp)</label>
                    <input 
                      type="number" 
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)} 
                      className={`w-full px-3.5 py-2.5 text-xs border outline-none ${isNotionMode ? 'rounded-none border-2 border-black font-mono bg-white' : `rounded-xl ${inputBase}`}`} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 text-red-500">Harga Coret (Rp) / Diskon</label>
                    <input 
                      type="number" 
                      value={editOriginalPrice} 
                      onChange={(e) => setEditOriginalPrice(e.target.value)} 
                      placeholder="Contoh: 250000"
                      className={`w-full px-3.5 py-2.5 text-xs border outline-none ${isNotionMode ? 'rounded-none border-2 border-black font-mono bg-white' : `rounded-xl ${inputBase}`}`} 
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Deskripsi Produk Seller</label>
                  <textarea 
                    rows={3}
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    className={`w-full px-3.5 py-2.5 text-xs border outline-none ${isNotionMode ? 'rounded-none border-2 border-black bg-white' : `rounded-xl ${inputBase}`}`} 
                    placeholder="Tulis deskripsi rinci barang..."
                  />
                </div>

                {/* Edit Shopee Link */}
                <div>
                  <label className="block text-xs font-bold uppercase text-orange-600 dark:text-orange-400 mb-1.5">Link Shopee (Opsional)</label>
                  <input 
                    type="url" 
                    placeholder="https://shopee.co.id/..." 
                    value={editShopeeLink} 
                    onChange={(e) => setEditShopeeLink(e.target.value)} 
                    className={`w-full px-3.5 py-2.5 text-xs border outline-none ${isNotionMode ? 'rounded-none border-2 border-black bg-white' : `rounded-xl ${inputBase}`}`} 
                  />
                </div>

                {/* VARIASI PRODUK SECTION */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-500" />
                      <span>Variasi Produk ({editVariants.length})</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddBlankVariant}
                      className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Tambah Variasi</span>
                    </button>
                  </div>

                  {editVariants.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                      Belum ada opsi variasi diset (Contoh: Warna, Tipe, Seri Driver). Klik "+ Tambah Variasi" di atas.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editVariants.map((variant, vIdx) => (
                        <div 
                          key={variant.id || `v-${vIdx}`}
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                              Opsi Variasi #{vIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditVariants(prev => prev.filter((_, i) => i !== vIdx))}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="Hapus variasi"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-start">
                            {/* Variant Photo Box */}
                            <div className="shrink-0 flex flex-col items-center">
                              <span className="text-[9px] text-slate-400 font-bold mb-1">FOTO VARIASI</span>
                              <div className="relative w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                {variant.image ? (
                                  <>
                                    <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setEditVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, image: undefined } : v))}
                                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer"
                                    >
                                      <X size={10} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleTriggerFilePicker('edit_variant', vIdx)}
                                    className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 cursor-pointer p-1 text-center"
                                  >
                                    <Plus size={16} />
                                    <span className="text-[8px] font-bold mt-0.5">Upload</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Variant Fields */}
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 mb-1">NAMA VARIASI</label>
                                <input
                                  type="text"
                                  value={variant.name}
                                  onChange={(e) => setEditVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, name: e.target.value } : v))}
                                  placeholder="Contoh: Red Bull Blue"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 mb-1">HARGA VARIASI (RP)</label>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => setEditVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, price: parseFloat(e.target.value) || 0 } : v))}
                                  placeholder="185000"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-red-500 mb-1">HARGA CORET (RP)</label>
                                <input
                                  type="number"
                                  value={variant.originalPrice || ''}
                                  onChange={(e) => setEditVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, originalPrice: parseFloat(e.target.value) || undefined } : v))}
                                  placeholder="250000"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-end gap-2.5 border-t pt-4 border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setConfirmDeleteProduct(editingProduct)} 
                  className="px-3.5 py-2 font-semibold text-xs text-red-600 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={14} /> Hapus
                </button>
                <button 
                  onClick={() => setEditingProduct(null)} 
                  className="px-4 py-2 font-semibold text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="px-5 py-2 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP CONFIRM DELETE PRODUK MODAL */}
      <AnimatePresence>
        {confirmDeleteProduct && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" 
              onClick={() => setConfirmDeleteProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 380 }}
              className={`${modalBg} w-full max-w-sm p-6 relative z-10 border ${isNotionMode ? 'rounded-none border-2 border-black text-black' : 'rounded-2xl shadow-2xl border-red-500/30'}`}
            >
              <button onClick={() => setConfirmDeleteProduct(null)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                  <Trash2 size={24} />
                </div>
                <h3 className={`text-base font-bold ${isNotionMode ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>Hapus Produk Seller?</h3>
                <p className="text-xs font-semibold mt-1 text-slate-500">"{confirmDeleteProduct.name}"</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmDeleteProduct(null)} 
                  className={`py-3 font-bold text-xs transition-colors ${isNotionMode ? 'bg-white hover:bg-neutral-100 border-2 border-black text-black rounded-xl' : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl')}`}
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (onDelete && confirmDeleteProduct?.id) {
                      onDelete(confirmDeleteProduct.id);
                    }
                    setConfirmDeleteProduct(null);
                    setEditingProduct(null);
                  }} 
                  className="py-3 font-bold text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManager;
