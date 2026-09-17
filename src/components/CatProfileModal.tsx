import React, { useState } from 'react';
import { CatProfile, MealScheduleItem } from '../types';
import { calculateCatPortions } from '../utils/nutritionCalc';
import { Sliders, Sparkles, Scale, Calendar, Info, Heart } from 'lucide-react';

interface CatProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CatProfile;
  onSaveProfile: (profile: CatProfile) => void;
  schedules: MealScheduleItem[];
  onUpdateSchedules: (schedules: MealScheduleItem[]) => void;
  darkMode: boolean;
}

export const CatProfileModal: React.FC<CatProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  schedules,
  onUpdateSchedules,
  darkMode,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [ageMonths, setAgeMonths] = useState<number | string>(profile.ageMonths);
  const [weightKg, setWeightKg] = useState<number | string>(profile.weightKg);
  const [breed, setBreed] = useState(profile.breed);
  const [foodPreference, setFoodPreference] = useState(profile.foodPreference);
  const [dryG, setDryG] = useState<number | string>(profile.targetDailyDryG);
  const [wetG, setWetG] = useState<number | string>(profile.targetDailyWetG);
  const [specialNotes, setSpecialNotes] = useState(profile.specialNotes || '');

  const numericWeight = typeof weightKg === 'number' ? weightKg : parseFloat(weightKg) || 0;
  const numericAge = typeof ageMonths === 'number' ? ageMonths : parseInt(ageMonths as string, 10) || 1;

  // Calculate recommendation preview based on current input values
  const recommendation = calculateCatPortions(numericAge, numericWeight, foodPreference);

  const handleApplyRecommendation = () => {
    setDryG(recommendation.dailyDryG);
    setWetG(recommendation.dailyWetG);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: CatProfile = {
      ...profile,
      name: name.trim() || 'Nyunyu',
      ageMonths: Number(ageMonths),
      weightKg: Number(weightKg),
      breed: breed.trim(),
      foodPreference,
      targetDailyDryG: Number(dryG),
      targetDailyWetG: Number(wetG),
      specialNotes: specialNotes.trim(),
    };

    // Also update the 3 meal schedule ranges accordingly
    const perMealDry = Math.round(Number(dryG) / 3);
    const perMealWet = Math.round(Number(wetG) / 3);

    const updatedSchedules = schedules.map((s) => ({
      ...s,
      dryFoodG: perMealDry,
      dryFoodRange: `${perMealDry - 1}–${perMealDry + 1} g`,
      wetFoodG: perMealWet,
      wetFoodRange: `${perMealWet - 1}–${perMealWet + 2} g`,
    }));

    onSaveProfile(updatedProfile);
    onUpdateSchedules(updatedSchedules);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm overflow-hidden animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-neutral-200 dark:border-neutral-700 shadow-2xl transition-all max-h-[92vh] sm:max-h-[90vh] flex flex-col ${
        darkMode ? 'bg-neutral-850 text-neutral-100' : 'bg-white text-neutral-800'
      }`}>
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <span className="text-2xl shrink-0" role="img" aria-label="Cat Paw">🐾</span>
            <div className="min-w-0">
              <h3 className="font-bold font-display text-base sm:text-lg leading-tight truncate">
                Profil & Target Nutrisi {profile.name}
              </h3>
              <p className="text-[11px] sm:text-xs opacity-60 truncate">
                Sesuaikan umur, berat badan, dan target gram harian
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100 active:scale-95 shrink-0 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3.5 text-xs overscroll-contain">
            
            {/* Name & Breed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="font-semibold block mb-1 text-[11px] sm:text-xs">Nama Kucing:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Nyunyu"
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-[11px] sm:text-xs">Ras / Ciri:</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Contoh: Domestik / Mix"
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
              </div>
            </div>

            {/* Age & Weight Inputs */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1 text-[11px] sm:text-xs">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Umur (Bulan):</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
                <span className="text-[10px] opacity-70 mt-1 block truncate">
                  {numericAge < 12 ? 'Kitten (Tumbuh aktif)' : 'Kucing Dewasa'}
                </span>
              </div>

              <div>
                <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1 text-[11px] sm:text-xs">
                  <Scale className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Berat (kg):</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.3"
                  max="15"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
                <span className="text-[10px] opacity-70 mt-1 block truncate">
                  Ref: ~{numericWeight.toFixed(1)} kg
                </span>
              </div>
            </div>

            {/* Food Preference Selection */}
            <div>
              <label className="font-semibold block mb-1.5 text-[11px] sm:text-xs">
                Preferensi Komposisi Makanan:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { id: 'more_dry', label: 'Dry > Wet', desc: 'Fokus Dry Food' },
                  { id: 'balanced', label: 'Seimbang', desc: 'Rasio 50:50' },
                  { id: 'more_wet', label: 'Wet > Dry', desc: 'Hidrasi Tinggi' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFoodPreference(p.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                      foodPreference === p.id
                        ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-bold leading-tight">{p.label}</div>
                    <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 truncate">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Portion Recommendation Box & Auto-fill */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold flex items-center gap-1.5 text-xs text-neutral-900 dark:text-neutral-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Rekomendasi Takaran Otomatis:</span>
                </span>
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  Terapkan Angka Ini ➔
                </button>
              </div>
              <div className="text-[11px] opacity-80 leading-relaxed">
                Berdasarkan umur {numericAge} bulan & {numericWeight} kg:
                <strong className="block text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  Dry: {recommendation.dailyDryRange} • Wet: {recommendation.dailyWetRange} ({recommendation.totalDailyG})
                </strong>
              </div>
            </div>

            {/* Manual Fine-tune Inputs for Target Portions */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="font-semibold block mb-1 text-[11px] sm:text-xs truncate">Target Dry (g/hari):</label>
                <input
                  type="number"
                  min="10"
                  max="150"
                  value={dryG}
                  onChange={(e) => setDryG(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
                <span className="text-[10px] opacity-60 mt-0.5 block">~{Math.round((Number(dryG) || 0) / 3)}g / makan</span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[11px] sm:text-xs truncate">Target Wet (g/hari):</label>
                <input
                  type="number"
                  min="10"
                  max="250"
                  value={wetG}
                  onChange={(e) => setWetG(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
                <span className="text-[10px] opacity-60 mt-0.5 block">~{Math.round((Number(wetG) || 0) / 3)}g / makan</span>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="font-semibold block mb-1 text-[11px] sm:text-xs">Catatan Khusus Makanan / Alergi:</label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Contoh: Formulasi kitten growth, suka dicampur kaldu hangat"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/30 outline-none resize-none"
              />
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-3 sm:px-6 sm:py-3.5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm flex gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
