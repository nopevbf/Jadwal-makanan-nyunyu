import {
  CatProfile,
  MealScheduleItem,
  FeedingLogEntry,
  WeightRecord,
  MedicationScheduleItem,
  HealthRecordEntry,
  FamilyMember,
} from '../types';

export const initialCatProfile: CatProfile = {
  name: 'Nyunyu',
  ageMonths: 6,
  weightKg: 2.0,
  gender: 'betina',
  breed: 'Kitten Mix (Tabby)',
  birthDate: '2026-03-15',
  targetDailyDryG: 48,
  targetDailyWetG: 55,
  foodPreference: 'more_dry',
  specialNotes: 'Makanan formulasi kitten/growth. Suka dry food dicampur kuah kaldu/wet food tuna.',
  avatarUrl: '',
};

export const initialMealSchedules: MealScheduleItem[] = [
  {
    id: 'pagi',
    title: 'Pagi',
    time: '07:00',
    iconType: 'sun',
    dryFoodG: 16,
    dryFoodRange: '15–17 g',
    wetFoodG: 18,
    wetFoodRange: '17–20 g',
    reminderEnabled: true,
  },
  {
    id: 'siang',
    title: 'Siang',
    time: '13:00',
    iconType: 'sun-afternoon',
    dryFoodG: 16,
    dryFoodRange: '15–17 g',
    wetFoodG: 18,
    wetFoodRange: '17–20 g',
    reminderEnabled: true,
  },
  {
    id: 'malam',
    title: 'Malam',
    time: '19:00',
    iconType: 'moon',
    dryFoodG: 16,
    dryFoodRange: '15–17 g',
    wetFoodG: 18,
    wetFoodRange: '17–20 g',
    reminderEnabled: true,
  },
];

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'ka-aji', name: 'Ka Aji', role: 'Pemilik Utama', avatarColor: 'bg-red-500' },
];

export const initialWeightLogs: WeightRecord[] = [
  { id: 'w1', date: '2026-05-15', weightKg: 0.85, ageMonthsAtRecord: 2, note: 'Pemeriksaan pertama kitten, kondisi aktif' },
  { id: 'w2', date: '2026-06-16', weightKg: 1.15, ageMonthsAtRecord: 3, note: 'Nafsu makan sangat bagus, mulai kenal dry kitten' },
  { id: 'w3', date: '2026-07-16', weightKg: 1.45, ageMonthsAtRecord: 4, note: 'Vaksin tahap 2, pertumbuhan proporsional' },
  { id: 'w4', date: '2026-08-16', weightKg: 1.75, ageMonthsAtRecord: 5, note: 'Tubuh padat berisi, lincah bermain' },
  { id: 'w5', date: '2026-09-15', weightKg: 2.05, ageMonthsAtRecord: 6, note: 'Target 2 kg tercapai! Dokter puas dengan perkembangannya' },
];

export const initialFeedingLogs: FeedingLogEntry[] = [];

export const initialMedications: MedicationScheduleItem[] = [
  {
    id: 'med-1',
    name: 'Obat Cacing (Drontal Cat)',
    type: 'cacing',
    dosage: '1/2 tablet (sesuai BB 2 kg)',
    frequencyLabel: 'Setiap 3 Bulan',
    frequencyMonths: 3,
    lastGivenDate: '2026-07-20',
    nextDueDate: '2026-10-20',
    status: 'aman',
    administeredBy: 'Ka Aji & Dokter Hewan',
    notes: 'Diminumkan bersama camilan creamy lickable treat agar mudah ditelan.',
    history: [
      { id: 'h-1', date: '2026-07-20', givenBy: 'Ka Aji', notes: 'Dosis 1/2 tablet saat BB 1.5 kg' },
      { id: 'h-2', date: '2026-04-20', givenBy: 'Drh. Sarah', notes: 'Dosis pertama saat usia 1 bulan lebih' },
    ],
  },
  {
    id: 'med-2',
    name: 'Obat Kutu & Tungau (Revolution Plus / Advocate)',
    type: 'kutu',
    dosage: '1 tube tetes tengkuk (< 2.5 kg)',
    frequencyLabel: 'Setiap 1 Bulan (Rutin)',
    frequencyMonths: 1,
    lastGivenDate: '2026-08-22',
    nextDueDate: '2026-09-22',
    status: 'mendekati',
    administeredBy: 'Ka Aji',
    notes: 'Teteskan langsung di kulit pangkal leher/tengkuk. Jangan mandikan 48 jam sesudahnya.',
    history: [
      { id: 'h-3', date: '2026-08-22', givenBy: 'Ka Aji', notes: 'Bebas kutu, bulu halus terawat' },
      { id: 'h-4', date: '2026-07-22', givenBy: 'Ka Aji', notes: 'Pencegahan kutu & pinworm bulanan' },
    ],
  },
  {
    id: 'med-3',
    name: 'Vitamin Bulu & Imun (Lysine + Omega 3)',
    type: 'vitamin',
    dosage: '1 pump gel per hari',
    frequencyLabel: 'Harian / 2 Hari Sekali',
    frequencyMonths: 0,
    lastGivenDate: '2026-09-15',
    nextDueDate: '2026-09-16',
    status: 'aman',
    administeredBy: 'Mama',
    notes: 'Dicampur di wet food malam hari untuk kilau bulu & imunitas.',
    history: [],
  },
];

export const initialHealthRecords: HealthRecordEntry[] = [
  {
    id: 'hr-1',
    date: '2026-08-16',
    title: 'Vaksinasi Feline Panleukopenia & Tricat Booster',
    category: 'vaksin',
    clinicOrDoctor: 'Klinik Sahabat Satwa (Drh. Sarah)',
    diagnosis: 'Kitten sehat prima, suhu tubuh 38.4°C normal, tidak ada demam',
    treatment: 'Suntik Vaksin Tricat Dosis ke-2 + Vitamin Booster',
    weightAtTimeKg: 1.75,
    costRp: 220000,
    notes: 'Jadwal vaksin Rabies direncanakan saat usia 7-8 bulan.',
  },
  {
    id: 'hr-2',
    date: '2026-07-16',
    title: 'Vaksinasi Tricat Dosis 1 & Cek Feses',
    category: 'vaksin',
    clinicOrDoctor: 'Klinik Sahabat Satwa (Drh. Sarah)',
    diagnosis: 'Kondisi bebas parasit, mata bersih, telinga bersih dari earmites',
    treatment: 'Vaksin Tricat Dosis ke-1 & Pemberian Obat Cacing',
    weightAtTimeKg: 1.45,
    costRp: 250000,
    notes: 'Nyunyu sempat tidur lebih banyak 1 hari setelah vaksin, respon normal.',
  },
  {
    id: 'hr-3',
    date: '2026-05-15',
    title: 'First Vet Checkup & Microchip Consultation',
    category: 'kontrol_rutin',
    clinicOrDoctor: 'Pusat Kesehatan Hewan Terpadu',
    diagnosis: 'Kitten adopsi sehat, gigi susu mulai tumbuh rapi',
    treatment: 'Pemeriksaan fisik menyeluruh, pembersihan telinga, edukasi porsi nutrisi',
    weightAtTimeKg: 0.85,
    costRp: 150000,
    notes: 'Disarankan diet kombinasi Dry Food (Kitten) dan Wet Food agar ginjal tetap terhidrasi.',
  },
];
