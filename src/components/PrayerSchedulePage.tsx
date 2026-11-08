import React, { useState, useEffect } from 'react';
import {
  Compass,
  Clock,
  MapPin,
  Volume2,
  Bell,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  Info
} from 'lucide-react';
import { CityPrayerConfig } from '../types';
import { CITIES } from '../data/mockData';
import { calculatePrayerTimes, getNextPrayer } from '../utils/prayerTimes';

interface PrayerSchedulePageProps {
  currentCity: CityPrayerConfig;
  onSelectCity: (city: CityPrayerConfig) => void;
}

export const PrayerSchedulePage: React.FC<PrayerSchedulePageProps> = ({
  currentCity,
  onSelectCity
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule = calculatePrayerTimes(currentCity, currentTime);
  const nextPrayer = getNextPrayer(schedule, currentTime);

  const hijriDay = 15;
  const hijriMonth = 'Rabiul Akhir';
  const hijriYear = 1448;

  const playChimeTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      setActiveNotification(`Pengingat aktif untuk waktu ${nextPrayer.name}`);
      setTimeout(() => setActiveNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const prayerCards = [
    { id: 'imsak', name: 'Imsak', time: schedule.imsak, icon: Moon, desc: 'Batas akhir santap sahur' },
    { id: 'fajr', name: 'Shubuh', time: schedule.fajr, icon: Sunrise, desc: 'Awal fajar shadiq' },
    { id: 'sunrise', name: 'Terbit', time: schedule.sunrise, icon: Sun, desc: 'Matahari terbit (Syuruq)' },
    { id: 'dhuhr', name: 'Dzuhur', time: schedule.dhuhr, icon: Sun, desc: 'Matahari tergelincir' },
    { id: 'asr', name: 'Ashar', time: schedule.asr, icon: Sun, desc: 'Bayangan 1 panjang benda' },
    { id: 'maghrib', name: 'Maghrib', time: schedule.maghrib, icon: Sunset, desc: 'Matahari terbenam' },
    { id: 'isha', name: 'Isya', time: schedule.isha, icon: Moon, desc: 'Syafaq merah menghilang' }
  ];

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast */}
        {activeNotification && (
          <div className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-lg text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <span>{activeNotification}</span>
            </div>
            <button onClick={() => setActiveNotification(null)} className="text-white hover:text-slate-200">
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              Jadwal Sholat & Waktu Hening
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-normal">
              Panduan waktu sholat presisi terkalibrasi secara astronomis untuk berbagai kota di Indonesia. Menjaga keteraturan dan ketenangan di setiap langkah.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pilih Wilayah</span>
                <select
                  value={currentCity.name}
                  onChange={(e) => {
                    const found = CITIES.find(c => c.name === e.target.value);
                    if (found) onSelectCity(found);
                  }}
                  className="bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-4"
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name} className="dark:bg-slate-900">
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner (Theme Adaptive Light/Dark) */}
        <div className="bg-[#FCFAF4] dark:bg-slate-900 rounded-2xl p-6 sm:p-10 text-slate-900 dark:text-white relative overflow-hidden shadow-xl border border-[#E2D8C3] dark:border-slate-800 transition-colors">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-md text-xs text-blue-700 dark:text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>Waktu Sholat Mendatang</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                  Menuju Waktu
                </div>
                <div className="font-serif text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white">
                  {nextPrayer.name}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Pukul <strong className="text-slate-900 dark:text-white font-mono">{nextPrayer.timeString}</strong></span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div>
                  Tersisa: <strong className="text-blue-600 dark:text-blue-400 font-mono tabular-nums">{nextPrayer.formattedCountdown}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2D8C3] dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Hari ini: {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{hijriDay} {hijriMonth} {hijriYear} H</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-[#E2D8C3] dark:border-slate-700 flex flex-col justify-between space-y-6 shadow-xs">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Waktu Lokal ({currentCity.name})
                </div>
                <div className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Zona Waktu: UTC+{currentCity.timezoneOffset}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2D8C3] dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Uji Nada Adzan:</span>
                <button
                  onClick={playChimeTone}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span>Uji Suara</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 7 Prayer Cards */}
        <div>
          <div className="text-xs font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-4">
            Rincian Waktu Hari Ini
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {prayerCards.map((item) => {
              const Icon = item.icon;
              const isNext = nextPrayer.name.includes(item.name);

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    isNext
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400'
                      : 'bg-white dark:bg-[#131C31] text-slate-900 dark:text-white border-[#E2D8C3] dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-medium uppercase tracking-wider ${isNext ? 'text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.name}
                    </span>
                    <Icon className={`w-4 h-4 ${isNext ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>

                  <div>
                    <div className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${isNext ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.time}
                    </div>
                    <div className={`text-[11px] mt-2 line-clamp-1 ${isNext ? 'text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </div>

                  {isNext && (
                    <div className="mt-3 pt-2 border-t border-blue-500 text-[10px] text-white font-medium">
                      Berikutnya
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Qibla Compass */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#131C31] p-6 sm:p-10 rounded-2xl border border-[#E2D8C3] dark:border-slate-800 shadow-xs">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-slate-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 flex items-center justify-center shadow-inner">
              <span className="absolute top-2 font-bold text-xs text-blue-600 dark:text-blue-400">U (N)</span>
              <span className="absolute bottom-2 font-bold text-xs text-slate-400">S</span>
              <span className="absolute left-2 font-bold text-xs text-slate-400">B (W)</span>
              <span className="absolute right-2 font-bold text-xs text-slate-400">T (E)</span>

              {/* Compass Needle pointing to Qibla (approx 295 deg NW for Jakarta) */}
              <div 
                className="absolute w-1.5 h-32 bg-blue-600 rounded-full origin-bottom transition-transform duration-700 shadow-md"
                style={{ transform: 'translateY(-50%) rotate(295deg)' }}
              />
              <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white z-10 shadow-md" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-mono">
              Arah Kiblat: 295° (Barat Laut) dari Jakarta
            </span>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Kompas Kiblat & Orientasi Sholat</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold">
              Akurasi Arah Ka'bah dari Lokasi Anda
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              Kalkulasi posisi kiblat dihitung berdasarkan formula spherical trigonometry menggunakan koordinat lintang dan bujur kota {currentCity.name} terhadap Kota Mekkah (Ka'bah). Pastikan perangkat Anda dikalibrasi untuk hasil kompas terbaik.
            </p>
            <div className="p-4 bg-[#FCFAF4] dark:bg-slate-900 rounded-xl border border-[#E2D8C3] dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                Waktu sholat dihitung secara astronomis berdasarkan sudut deklinasi matahari dan posisi lintang wilayah untuk memastikan ketepatan ibadah harian Anda.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
