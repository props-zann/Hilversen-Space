import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';

interface CustomDatePickerProps {
  value?: string; // Expects ISO 'YYYY-MM-DD' or formatted date string
  onChange: (dateStr: string) => void; // Emits 'YYYY-MM-DD'
  placeholder?: string;
  className?: string;
  isDark?: boolean;
  align?: 'left' | 'right';
  direction?: 'up' | 'down';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'Pilih Tanggal...',
  className = '',
  isDark = true,
  align = 'left',
  direction = 'up'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parse initial selected date or default to current date
  const parseDate = (str: string): Date => {
    if (!str) return new Date();
    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // Try parsing Date.parse
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewYear, setViewYear] = useState<number>(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate ? selectedDate.getMonth() : new Date().getMonth());

  // Close calendar popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format YYYY-MM-DD
  const formatYMD = (year: number, monthZeroIndexed: number, day: number): string => {
    const mm = String(monthZeroIndexed + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Format readable Indo Date string for trigger display e.g. "05 Okt 2026"
  const formatReadableIndo = (d: Date | null): string => {
    if (!d) return placeholder;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Calendar Math: Generate 42 grid cells (6 rows x 7 days)
  const generateGridCells = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dayNum: number;
      monthOffset: -1 | 0 | 1; // -1: prev month, 0: current, 1: next month
      dateObj: Date;
      ymdStr: string;
    }> = [];

    // 1. Previous Month Trail
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateObj = new Date(prevYear, prevMonthIdx, dayNum);
      cells.push({
        dayNum,
        monthOffset: -1,
        dateObj,
        ymdStr: formatYMD(prevYear, prevMonthIdx, dayNum)
      });
    }

    // 2. Current Month Days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateObj = new Date(viewYear, viewMonth, dayNum);
      cells.push({
        dayNum,
        monthOffset: 0,
        dateObj,
        ymdStr: formatYMD(viewYear, viewMonth, dayNum)
      });
    }

    // 3. Next Month Lead-in to complete 42 cells
    const remaining = 42 - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateObj = new Date(nextYear, nextMonthIdx, dayNum);
      cells.push({
        dayNum,
        monthOffset: 1,
        dateObj,
        ymdStr: formatYMD(nextYear, nextMonthIdx, dayNum)
      });
    }

    return cells;
  };

  const handleSelectDay = (ymdStr: string, dateObj: Date) => {
    onChange(ymdStr);
    setViewYear(dateObj.getFullYear());
    setViewMonth(dateObj.getMonth());
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    const ymd = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(ymd);
    setIsOpen(false);
  };

  const isToday = (dateObj: Date): boolean => {
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (ymdStr: string): boolean => {
    if (!selectedDate) return false;
    const curYMD = formatYMD(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return curYMD === ymdStr;
  };

  const gridCells = generateGridCells();

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 text-xs font-sans font-semibold bg-[#FAF6EE] dark:bg-black border border-[#E2D8C3] dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-xs select-none tabular-nums"
        style={{ fontWeight: 600 }}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">
            {value ? formatReadableIndo(selectedDate) : placeholder}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-sans font-semibold shrink-0 tabular-nums">
          {value || 'YYYY-MM-DD'}
        </span>
      </button>

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`absolute w-72 bg-[#FAF6EE] dark:bg-black border border-[#E2D8C3] dark:border-neutral-800 text-slate-900 dark:text-white rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in font-sans ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${
              direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2D8C3] dark:border-neutral-800 mb-2.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="text-center font-bold text-xs text-slate-900 dark:text-white tracking-wide font-sans" style={{ fontWeight: 600 }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day Headers (Ahd - Sab) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans font-bold text-blue-600 dark:text-blue-400 uppercase pb-1.5" style={{ fontWeight: 600 }}>
              {DAY_NAMES.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* 42 Calendar Cells */}
            <div className="grid grid-cols-7 gap-1 text-xs font-sans">
              {gridCells.map((cell, idx) => {
                const selected = isSelected(cell.ymdStr);
                const today = isToday(cell.dateObj);
                const isCurrentMonth = cell.monthOffset === 0;

                return (
                  <button
                    key={`${cell.ymdStr}-${idx}`}
                    type="button"
                    onClick={() => handleSelectDay(cell.ymdStr, cell.dateObj)}
                    style={{ fontWeight: 600 }}
                    className={`h-8 w-full rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer relative tabular-nums ${
                      selected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 scale-105 z-10'
                        : today
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold border border-blue-400 dark:border-blue-600'
                          : isCurrentMonth
                            ? 'hover:bg-[#EBE3D3] dark:hover:bg-neutral-800 text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
                            : 'text-slate-400 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400 hover:bg-[#EBE3D3]/50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span>{cell.dayNum}</span>
                    {selected && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full ring-2 ring-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-3 pt-2.5 border-t border-[#E2D8C3] dark:border-neutral-800 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                style={{ fontWeight: 600 }}
              >
                <RotateCcw size={11} />
                <span>Hari Ini</span>
              </button>

              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-sans font-medium">
                Hilversen Calendar
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
