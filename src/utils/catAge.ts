import { CatProfile } from '../types';

/**
 * Calculates cat age in months based on birth date.
 * Every time the month rolls over (e.g. 2026-09 to 2026-10),
 * the calculated age automatically increments by 1 month.
 */
export function calculateAgeMonths(birthDateStr?: string, targetDate: Date = new Date()): number {
  if (!birthDateStr) return 6;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 6;

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth();

  const diffMonths = (targetYear - birthYear) * 12 + (targetMonth - birthMonth);
  return Math.max(1, diffMonths);
}

/**
 * Derives an estimated birth date (YYYY-MM-DD) from a given age in months.
 */
export function calculateBirthDateFromAge(ageMonths: number, asOfDate: Date = new Date()): string {
  const d = new Date(asOfDate);
  d.setMonth(d.getMonth() - ageMonths);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  // Default to day 15
  return `${y}-${m}-15`;
}

/**
 * Formats a cat's age into human readable Indonesian text:
 * e.g. "6 Bulan (Kitten)", "1 Tahun 2 Bulan (Dewasa)"
 */
export function formatCatAge(ageMonths: number): {
  shortText: string;
  fullText: string;
  stageLabel: string;
  isKitten: boolean;
} {
  const isKitten = ageMonths < 12;
  const stageLabel = isKitten ? 'Kitten' : 'Kucing Dewasa';
  const shortText = `${ageMonths} bln`;

  let fullText = `${ageMonths} Bulan`;
  if (ageMonths >= 12) {
    const years = Math.floor(ageMonths / 12);
    const remMonths = ageMonths % 12;
    fullText = remMonths > 0 ? `${years} Tahun ${remMonths} Bulan` : `${years} Tahun`;
  }

  return {
    shortText,
    fullText,
    stageLabel,
    isKitten,
  };
}

/**
 * Returns a profile with dynamically computed ageMonths based on birthDate.
 */
export function getDynamicProfile(profile: CatProfile, asOfDate: Date = new Date()): CatProfile {
  const birthDate = profile.birthDate || '2026-03-15';
  const dynamicAge = calculateAgeMonths(birthDate, asOfDate);

  return {
    ...profile,
    birthDate,
    ageMonths: dynamicAge,
  };
}
