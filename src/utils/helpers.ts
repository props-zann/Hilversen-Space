import { useEffect } from 'react';
import { formatRupiah } from '../data/mockData';

export function formatCurrency(amount: number): string {
  return formatRupiah(amount);
}

export function getAvatarUrl(name: string, style: string = 'happy-human'): string {
  const seed = encodeURIComponent(name || 'Hilversen');
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
}

export function getInitials(name: string): string {
  if (!name) return 'HL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateString: string, format: string = 'DD-MM-YYYY'): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function useEscKey(handler: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handler]);
}
