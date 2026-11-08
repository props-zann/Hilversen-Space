import React from 'react';
import { Flag, Mail, Phone, Instagram, ExternalLink, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onExploreCollection: () => void;
  heroTag?: string;
  title?: string;
  description?: string;
  conciergeTag?: string;
  conciergeTitle?: string;
  conciergeDescription?: string;
  instagram?: string;
  email?: string;
  phone?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onExploreCollection,
  heroTag = 'Creative Atelier - est 2024',
  title = 'Destinasi Merchandise F1 & Koleksi Kreatif.',
  description = 'Hilversen adalah toko online (online shop) yang berfokus menyediakan merchandise Formula 1 sebagai produk utamanya, sekaligus menghadirkan beragam rilisan merchandise unik lainnya. Selain koleksi produk, kami juga menyediakan halaman Personal khusus yang didedikasikan untuk membagikan portofolio, rilisan proyek, dan kegiatan dari creator.',
  conciergeTag = 'Pitstop Concierge',
  conciergeTitle = 'Kontak & Komunitas',
  conciergeDescription = 'Hubungi kami atau ikuti kanal resmi Hilversen untuk informasi rincian produk, pertanyaan pesanan, dan pembaruan kegiatan creator.',
  instagram = '@hilversen',
  email = 'marcauzed@gmail.com',
  phone = '+6289675916774'
}) => {
  const cleanInstagram = instagram.replace('@', '');

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <div className="border-b border-[#E2D8C3] dark:border-neutral-800 pb-12 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-3">
            <Flag className="w-3.5 h-3.5" />
            <span>{heroTag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white font-normal tracking-tight leading-[1.15]">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-6 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <div className="pt-6">
            <button
              onClick={onExploreCollection}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Jelajahi Koleksi Merchandise</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Concierge & Contact Fields */}
        <div className="max-w-3xl bg-[#FAF6EE] dark:bg-neutral-900 text-[#201C16] dark:text-white p-8 sm:p-10 rounded-2xl border border-[#E2D8C3] dark:border-neutral-800 shadow-xl space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold mb-1">
              {conciergeTag}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal">
              {conciergeTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2 whitespace-pre-line">
              {conciergeDescription}
            </p>
          </div>

          {/* Clickable Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
            
            {/* Instagram Field */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F3EDE0] dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 hover:border-blue-500 transition-colors">
              <Instagram className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold font-sans">Instagram</span>
                <a
                  href={`https://instagram.com/${cleanInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-sans font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  <span>{instagram.startsWith('@') ? instagram : `@${instagram}`}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F3EDE0] dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 hover:border-blue-500 transition-colors">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold font-sans">Email</span>
                <a
                  href={`mailto:${email}`}
                  title={email}
                  className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-sans font-semibold text-[11px] sm:text-xs truncate block transition-colors cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F3EDE0] dark:bg-neutral-950 border border-[#E2D8C3] dark:border-neutral-800 hover:border-blue-500 transition-colors">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold font-sans">Telepon</span>
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer tabular-nums"
                  style={{ fontWeight: 600 }}
                >
                  {phone}
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
