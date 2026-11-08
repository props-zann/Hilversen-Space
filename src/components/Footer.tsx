import React from 'react';

interface FooterProps {
  onNavigateTab: (tab: 'landing' | 'collection' | 'personal' | 'jadwal-sholat' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-[#FAF7F0] dark:bg-black text-slate-800 dark:text-white border-t border-[#E2D8C3] dark:border-neutral-800 transition-colors pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E2D8C3] dark:border-neutral-800">
          
          {/* Re-laid out Navigation Links */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigasi Halaman
            </div>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <button
                onClick={() => onNavigateTab('landing')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => onNavigateTab('collection')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Koleksi Produk
              </button>
              <button
                onClick={() => onNavigateTab('personal')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Keuangan & Dana Counterparty
              </button>
              <button
                onClick={() => onNavigateTab('about')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Tentang
              </button>
            </nav>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} Hilversen F1 Merchandise. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer">Privasi & Transparansi</span>
            <span>·</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer">Ketentuan Layanan</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
