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
  const [ageMonths, setAgeMonths] = useState(profile.ageMonths);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [breed, setBreed] = useState(profile.breed);
  const [foodPreference, setFoodPreference] = useState(profile.foodPreference);
  const [dryG, setDryG] = useState(profile.targetDailyDryG);
  const [wetG, setWetG] = useState(profile.targetDailyWetG);
  const [specialNotes, setSpecialNotes] = useState(profile.specialNotes || '');

  // Calculate recommendation preview based on current input values
  const recommendation = calculateCatPortions(ageMonths, weightKg, foodPreference);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all my-8 ${
        darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐾</span>
            <div>
              <h3 className="font-bold font-display text-lg">Profil & Target Porsi Makan Nyunyu</h3>
              <p className="text-xs opacity-60">Sesuaikan umur, berat badan, dan target gram harian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 my-4 text-xs">
          
          {/* Name & Breed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Nama Kucing:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Ras / Ciri:</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          {/* Age & Weight Inputs (explicitly requested) */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div>
              <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Umur (Bulan):</span>
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={ageMonths}
                onChange={(e) => setAgeMonths(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-bold text-base"
              />
              <span className="text-[10px] opacity-70 mt-1 block">
                {ageMonths < 12 ? 'Fase Kitten (Pertumbuhan aktif)' : 'Kucing Dewasa'}
              </span>
            </div>

            <div>
              <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Berat Badan (kg):</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.3"
                max="15"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-bold text-base"
              />
              <span className="text-[10px] opacity-70 mt-1 block">
                Standar kitten 6 bln: ~2.0 kg
              </span>
            </div>
          </div>

          {/* Food Preference */}
          <div>
            <label className="font-semibold block mb-1.5">Preferensi Komposisi Makanan:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'more_dry', label: 'Dry > Wet', desc: 'Sesuai request screenshot' },
                { id: 'balanced', label: 'Seimbang 50:50', desc: 'Rasio moderat' },
                { id: 'more_wet', label: 'Wet > Dry', desc: 'Hidrasi ekstra tinggi' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFoodPreference(p.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    foodPreference === p.id
                      ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-xs'
                  }`}
                >
                  <div className="text-xs font-semibold">{p.label}</div>
                  <div className="text-[10px] opacity-75">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Portion Recommendation Box & Auto-fill */}
          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Rekomendasi Takaran Otomatis:
              </span>
              <button
                type="button"
                onClick={handleApplyRecommendation}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Gunakan Angka Ini ➔
              </button>
            </div>
            <div className="text-[11px] opacity-80">
              Berdasarkan umur {ageMonths} bulan & {weightKg} kg:
              <strong className="block text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                Dry: {recommendation.dailyDryRange} • Wet: {recommendation.dailyWetRange} ({recommendation.totalDailyG})
              </strong>
            </div>
          </div>

          {/* Manual Fine-tune Inputs for Target Portions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Target Dry Food (Gram/Hari):</label>
              <input
                type="number"
                min="10"
                max="150"
                value={dryG}
                onChange={(e) => setDryG(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold"
              />
              <span className="text-[10px] opacity-60">~{Math.round(dryG / 3)}g per kali makan</span>
            </div>

            <div>
              <label className="font-semibold block mb-1">Target Wet Food (Gram/Hari):</label>
              <input
                type="number"
                min="10"
                max="250"
                value={wetG}
                onChange={(e) => setWetG(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold"
              />
              <span className="text-[10px] opacity-60">~{Math.round(wetG / 3)}g per kali makan</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold block mb-1">Catatan Khusus Makanan / Alergi:</label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Contoh: Formulasi kitten growth, suka dicampur kaldu hangat"
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
