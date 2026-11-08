import { CityPrayerConfig, PrayerTimeSchedule } from '../types';

/**
 * Calculates prayer times for a given city and date using astronomical calculation
 * aligned with Indonesian Ministry of Religious Affairs (Kemenag standard).
 */
export function calculatePrayerTimes(city: CityPrayerConfig, date: Date = new Date()): PrayerTimeSchedule {
  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Approximate Solar Declination (delta) in radians
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const declination = Math.asin(Math.sin((23.45 * Math.PI) / 180) * Math.sin(b));

  // Equation of Time (EoT) in minutes
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Solar Noon (transit time) in local standard time hours
  // Standard meridian for timezone: timezoneOffset * 15 degrees
  const standardMeridian = city.timezoneOffset * 15;
  const solarNoon = 12 + (standardMeridian - city.lng) / 15 - eot / 60;

  const latRad = (city.lat * Math.PI) / 180;

  // Helper to compute hour angle (in hours) for a given altitude angle (in degrees)
  function getHourAngle(altitudeDeg: number): number {
    const altRad = (altitudeDeg * Math.PI) / 180;
    const cosHA = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declination)) /
                  (Math.cos(latRad) * Math.cos(declination));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 12;
    return (Math.acos(cosHA) * 180) / Math.PI / 15;
  }

  // Fajr: Sun is 20 degrees below horizon (-20°)
  const fajrHA = getHourAngle(-20);
  const fajrDecimal = solarNoon - fajrHA;

  // Sunrise: Sun is 0.833 degrees below horizon
  const sunriseHA = getHourAngle(-0.833);
  const sunriseDecimal = solarNoon - sunriseHA;

  // Dhuhr: solar noon + 2-3 minutes safety buffer (ihtiyat)
  const dhuhrDecimal = solarNoon + 4 / 60;

  // Asr: Standard Shafi'i: shadow length = object + noon shadow
  // arccot(1 + tan|lat - declination|)
  const noonZenith = Math.abs(latRad - declination);
  const asrAltRad = Math.atan(1 / (1 + Math.tan(noonZenith)));
  const asrAltDeg = (asrAltRad * 180) / Math.PI;
  const asrHA = getHourAngle(asrAltDeg);
  const asrDecimal = solarNoon + asrHA;

  // Maghrib: Sun is 0.833 degrees below horizon + 2 min buffer
  const maghribHA = getHourAngle(-0.833);
  const maghribDecimal = solarNoon + maghribHA + 3 / 60;

  // Isha: Sun is 18 degrees below horizon
  const ishaHA = getHourAngle(-18);
  const ishaDecimal = solarNoon + ishaHA + 2 / 60;

  // Imsak: 10 minutes before Fajr
  const imsakDecimal = fajrDecimal - 10 / 60;

  function formatTime(decimalHour: number): string {
    let normalized = decimalHour;
    while (normalized < 0) normalized += 24;
    while (normalized >= 24) normalized -= 24;

    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return {
    imsak: formatTime(imsakDecimal),
    fajr: formatTime(fajrDecimal),
    sunrise: formatTime(sunriseDecimal),
    dhuhr: formatTime(dhuhrDecimal),
    asr: formatTime(asrDecimal),
    maghrib: formatTime(maghribDecimal),
    isha: formatTime(ishaDecimal)
  };
}

export interface NextPrayerInfo {
  name: string;
  timeString: string;
  remainingSeconds: number;
  formattedCountdown: string;
  isUpcoming: boolean;
}

export function getNextPrayer(schedule: PrayerTimeSchedule, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayers = [
    { name: 'Shubuh', time: schedule.fajr },
    { name: 'Terbit', time: schedule.sunrise },
    { name: 'Dzuhur', time: schedule.dhuhr },
    { name: 'Ashar', time: schedule.asr },
    { name: 'Maghrib', time: schedule.maghrib },
    { name: 'Isya', time: schedule.isha }
  ];

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      const diffMinutes = prayerMinutes - currentMinutes;
      const totalSec = Math.floor(diffMinutes * 60);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      const countdown = hours > 0
        ? `${hours}j ${mins}m ${secs}d`
        : `${mins}m ${secs}d`;

      return {
        name: prayer.name,
        timeString: prayer.time,
        remainingSeconds: totalSec,
        formattedCountdown: countdown,
        isUpcoming: true
      };
    }
  }

  // If passed Isha, next is tomorrow's Subuh
  const [fajrH, fajrM] = schedule.fajr.split(':').map(Number);
  const fajrTomorrowMinutes = 24 * 60 + (fajrH * 60 + fajrM);
  const diffMinutes = fajrTomorrowMinutes - currentMinutes;
  const totalSec = Math.floor(diffMinutes * 60);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return {
    name: 'Shubuh (Besok)',
    timeString: schedule.fajr,
    remainingSeconds: totalSec,
    formattedCountdown: `${hours}j ${mins}m ${secs}d`,
    isUpcoming: true
  };
}
