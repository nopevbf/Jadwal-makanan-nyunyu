export interface CatProfile {
  name: string;
  ageMonths: number;
  weightKg: number;
  gender: 'jantan' | 'betina';
  breed: string;
  birthDate?: string;
  targetDailyDryG: number;
  targetDailyWetG: number;
  foodPreference: 'more_dry' | 'balanced' | 'more_wet';
  specialNotes?: string;
  avatarUrl?: string;
}

export type MealTimeId = 'pagi' | 'siang' | 'malam';

export interface MealScheduleItem {
  id: MealTimeId;
  title: string;
  time: string; // HH:mm
  iconType: 'sun' | 'sun-afternoon' | 'moon';
  dryFoodG: number;
  dryFoodRange: string;
  wetFoodG: number;
  wetFoodRange: string;
  reminderEnabled: boolean;
}

export interface DailyFeedingRecord {
  mealId: MealTimeId;
  isDone: boolean;
  doneTime?: string;
  fedBy?: string;
  actualDryG?: number;
  actualWetG?: number;
  mood?: 'lahap' | 'biasa' | 'sisa_sedikit' | 'mogok';
  note?: string;
}

export interface FeedingLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealId: MealTimeId | 'ekstra';
  mealTitle: string;
  dryFoodG: number;
  wetFoodG: number;
  fedBy: string;
  catMood: 'lahap' | 'biasa' | 'sisa_sedikit' | 'mogok';
  note?: string;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  ageMonthsAtRecord: number;
  note?: string;
}

export type MedicationType = 'cacing' | 'kutu' | 'vaksin' | 'vitamin' | 'lainnya';

export interface MedicationScheduleItem {
  id: string;
  name: string;
  type: MedicationType;
  dosage: string;
  frequencyLabel: string;
  frequencyMonths: number;
  lastGivenDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  status: 'aman' | 'mendekati' | 'jatuh_tempo' | 'selesai';
  administeredBy: string;
  notes?: string;
  history: Array<{
    id: string;
    date: string;
    givenBy: string;
    notes?: string;
  }>;
}

export interface HealthRecordEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'vaksin' | 'klinik' | 'sakit' | 'grooming' | 'kontrol_rutin';
  clinicOrDoctor?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weightAtTimeKg?: number;
  costRp?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}
