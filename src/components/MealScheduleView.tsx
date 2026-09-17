import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Volume2,
  Sparkles,
  Info,
  Heart,
  ChevronRight,
  User,
  Sliders,
  Check
} from 'lucide-react';
import {
  CatProfile,
  MealScheduleItem,
  DailyFeedingRecord,
  FeedingLogEntry,
  FamilyMember,
} from '../types';
import { playCatBellChime, playPurrSound } from '../utils/audio';
import { generateGoogleCalendarUrl, downloadICSFile } from '../utils/calendar';
import { DailyFoodIntakeCard } from './DailyFoodIntakeCard';

interface MealScheduleViewProps {
  profile: CatProfile;
  schedules: MealScheduleItem[];
  onUpdateSchedules: (schedules: MealScheduleItem[]) => void;
  todayRecords: Record<string, DailyFeedingRecord>;
  onToggleMealStatus: (mealId: string, customDetails?: { actualDry?: number; actualWet?: number; mood?: any; note?: string }) => void;
  feedingLogs: FeedingLogEntry[];
  onAddFeedingLog: (entry: Omit<FeedingLogEntry, 'id'>) => void;
  onDeleteFeedingLog: (id: string) => void;
  activeMember: FamilyMember;
  darkMode: boolean;
  onOpenProfileModal: () => void;
  currentDateStr?: string;
}

export const MealScheduleView: React.FC<MealScheduleViewProps> = ({
  profile,
  schedules,
  todayRecords,
  onToggleMealStatus,
  feedingLogs,
  onAddFeedingLog,
  onDeleteFeedingLog,
  activeMember,
  darkMode,
  onOpenProfileModal,
  currentDateStr,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const effectiveDateStr = currentDateStr || (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [actualDry, setActualDry] = useState<number>(16);
  const [actualWet, setActualWet] = useState<number>(18);
  const [catMood, setCatMood] = useState<'lahap' | 'biasa' | 'sisa_sedikit' | 'mogok'>('lahap');
  const [mealNote, setMealNote] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Update live clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Calculate next meal countdown
  const getNextMealInfo = () => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Sort schedules by time
    const sorted = [...schedules].sort((a, b) => {
      const [ha, ma] = a.time.split(':').map(Number);
      const [hb, mb] = b.time.split(':').map(Number);
      return (ha * 60 + ma) - (hb * 60 + mb);
    });

    for (const meal of sorted) {
      const [h, m] = meal.time.split(':').map(Number);
      const mealMinutes = h * 60 + m;
      const isDone = todayRecords[meal.id]?.isDone;

      if (!isDone) {
        if (mealMinutes > nowMinutes) {
          const diffMinutes = mealMinutes - nowMinutes;
          const diffHours = Math.floor(diffMinutes / 60);
          const remMin = diffMinutes % 60;
          return {
            meal,
            status: 'upcoming',
            text: diffHours > 0 ? `${diffHours} jam ${remMin} mnt lagi` : `${remMin} menit lagi`,
            diffMinutes,
          };
        } else if (nowMinutes - mealMinutes < 90) {
          // Within 90 minutes past scheduled time and not marked done
          return {
            meal,
            status: 'now',
            text: 'Waktunya makan sekarang!',
            diffMinutes: 0,
          };
        }
      }
    }

    // If all completed or late
    const allDone = schedules.every((s) => todayRecords[s.id]?.isDone);
    if (allDone) {
      return {
        meal: sorted[0],
        status: 'all_done',
        text: 'Semua porsi hari ini telah terpenuhi! ✨',
        diffMinutes: 9999,
      };
    }

    return {
      meal: sorted[0],
      status: 'tomorrow',
      text: 'Jadwal berikutnya besok pagi',
      diffMinutes: 9999,
    };
  };

  const nextMealInfo = getNextMealInfo();

  const triggerFeedingCelebration = () => {
    playCatBellChime();
    setTimeout(() => playPurrSound(), 400);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });
  };

  const handleOpenQuickLog = (meal: MealScheduleItem) => {
    setLoggingMealId(meal.id);
    setActualDry(meal.dryFoodG);
    setActualWet(meal.wetFoodG);
    setCatMood('lahap');
    setMealNote('');
  };

  const handleConfirmQuickLog = () => {
    if (!loggingMealId) return;
    const meal = schedules.find((s) => s.id === loggingMealId);
    if (!meal) return;

    onToggleMealStatus(loggingMealId, {
      actualDry,
      actualWet,
      mood: catMood,
      note: mealNote.trim() || undefined,
    });

    triggerFeedingCelebration();
    setLoggingMealId(null);
  };

  const handleDirectToggle = (mealId: string) => {
    const isCurrentlyDone = todayRecords[mealId]?.isDone;
    if (!isCurrentlyDone) {
      triggerFeedingCelebration();
    }
    onToggleMealStatus(mealId);
  };

  // Export full feeding schedule to ICS
  const handleDownloadAllMealsICS = () => {
    const events = schedules.map((s) => {
      const [h, m] = s.time.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);

      return {
        title: `🐾 Jadwal Makan ${s.title} Nyunyu`,
        description: `Waktunya makan ${s.title} untuk Nyunyu.\n• Dry food: ${s.dryFoodRange}\n• Wet food: ${s.wetFoodRange}\nFormulasi Kitten Growth.`,
        startDate: d,
        durationMinutes: 20,
        recurrenceRule: 'RRULE:FREQ=DAILY',
      };
    });

    downloadICSFile('Jadwal_Makan_Nyunyu_Harian', events);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner Alert / Countdown Card */}
      <div className={`order-1 p-4 sm:p-5 rounded-3xl border transition-all ${
        darkMode 
          ? 'bg-neutral-850 border-neutral-800 text-neutral-100 shadow-lg' 
          : 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-200/80 text-neutral-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl flex-shrink-0 ${
              nextMealInfo.status === 'now' 
                ? 'bg-rose-500 text-white animate-bounce' 
                : nextMealInfo.status === 'all_done'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider opacity-60 flex items-center gap-1.5">
                <span>Pengingat Jadwal Makan</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-base sm:text-lg font-bold font-display mt-0.5">
                {nextMealInfo.status === 'now' ? (
                  <span className="text-rose-600 dark:text-rose-400">
                    Waktunya Nyunyu makan {nextMealInfo.meal?.title} sekarang! ({nextMealInfo.meal?.time})
                  </span>
                ) : nextMealInfo.status === 'all_done' ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Hebat! Nyunyu sudah makan lengkap 3 porsi hari ini 🎉
                  </span>
                ) : (
                  <span>
                    Makan {nextMealInfo.meal?.title} ({nextMealInfo.meal?.time}) : <strong className="text-amber-600 dark:text-amber-400">{nextMealInfo.text}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                Target harian: Dry {profile.targetDailyDryG}g • Wet {profile.targetDailyWetG}g • Formulasi Kitten/Growth
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setShowCalendarModal(true)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                darkMode
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white border-amber-200 hover:bg-amber-50 text-amber-900 shadow-sm'
              }`}
              title="Sinkronkan jadwal ke Google Calendar atau Apple Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Sinkron Kalender</span>
            </button>
            <button
              onClick={onOpenProfileModal}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                darkMode
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white border-amber-200 hover:bg-amber-50 text-amber-900 shadow-sm'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Atur Porsi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seksi Total Asupan Makanan Hari Berjalan (Khusus mobile: urutan di bawah Jadwal Makan Nyunyu; Desktop: di atas) */}
      <div className="order-3 md:order-2">
        <DailyFoodIntakeCard
          profile={profile}
          schedules={schedules}
          todayRecords={todayRecords}
          feedingLogs={feedingLogs}
          currentDateStr={effectiveDateStr}
          activeMember={activeMember}
          onAddFeedingLog={onAddFeedingLog}
          darkMode={darkMode}
        />
      </div>

      {/* The Adorable Nyunyu Board (Faithful to the user's reference image!) (Mobile: order-2, Desktop: order-3) */}
      <div className={`order-2 md:order-3 p-5 sm:p-7 rounded-3xl border transition-all ${
        darkMode 
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl' 
          : 'bg-[#18181b] border-neutral-800 text-neutral-100 shadow-xl'
      }`}>
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl select-none shrink-0">✨</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                Jadwal Makan <span className="text-[#f5d0a9]">Nyunyu</span>
              </h1>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0" />
            </div>

            {/* Profile Info Badge (Badge 1) */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 mt-2.5 px-3.5 py-2.5 sm:py-1 rounded-2xl sm:rounded-full bg-neutral-800/90 border border-neutral-700 text-xs text-neutral-300">
              <span className="font-medium">Kitten {profile.ageMonths} bulan</span>
              <span className="text-neutral-500">•</span>
              <span className="font-medium">±{profile.weightKg.toFixed(1)} kg</span>
              <span className="text-neutral-500">•</span>
              <span className="text-amber-300 font-semibold">
                {profile.foodPreference === 'more_dry' ? 'Dry food lebih banyak' : profile.foodPreference === 'more_wet' ? 'Wet food lebih banyak' : 'Porsi seimbang'}
              </span>
            </div>
          </div>

          {/* Cute Kitten illustration badge (Badge 2) */}
          <div className="w-full sm:w-auto flex items-center self-stretch sm:self-center">
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-neutral-800/80 px-3.5 py-2.5 sm:py-2 rounded-2xl border border-neutral-700">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl select-none">🐾</span>
                <div className="text-[12px] sm:text-[11px] text-[#f5d0a9] font-bold">Tumbuh Aktif & Sehat</div>
              </div>
              <div className="text-[11px] sm:text-[10px] text-neutral-400 text-right">Happy Kitten Life ♡</div>
            </div>
          </div>
        </div>

        {/* 3 Main Feeding Cards: Pagi, Siang, Malam */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map((meal) => {
            const isDone = todayRecords[meal.id]?.isDone;
            const record = todayRecords[meal.id];

            return (
              <div
                key={meal.id}
                className={`relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 border transition-all ${
                  isDone
                    ? 'bg-neutral-800/60 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-[#222226] hover:bg-[#27272c] border-neutral-700/80'
                }`}
              >
                {/* Header with meal name, icon, time and checkbox */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDirectToggle(meal.id)}
                        id={`btn-check-${meal.id}`}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-neutral-500 hover:border-amber-400 bg-neutral-800/60'
                        }`}
                        title={isDone ? 'Klik untuk batal centang' : 'Tandai sudah diberi makan'}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                      </button>
                      <h2 className="text-lg font-bold font-display text-white">
                        {meal.title}
                      </h2>
                      {meal.iconType === 'sun' && <Sun className="w-5 h-5 text-amber-400" />}
                      {meal.iconType === 'sun-afternoon' && <Sun className="w-5 h-5 text-orange-400" />}
                      {meal.iconType === 'moon' && <Moon className="w-5 h-5 text-amber-300" />}
                    </div>

                    {/* Time badge */}
                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      meal.id === 'pagi'
                        ? 'bg-[#fed7aa] text-neutral-900'
                        : meal.id === 'siang'
                          ? 'bg-[#fef08a] text-neutral-900'
                          : 'bg-[#bae6fd] text-neutral-900'
                    }`}>
                      {meal.time}
                    </div>
                  </div>

                  {/* Dry Food Portion Row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                        🥣
                      </div>
                      <span className="text-xs text-neutral-300 font-medium">Dry food:</span>
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">
                      {meal.dryFoodRange}
                    </span>
                  </div>

                  {/* Wet Food Portion Row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm">
                        🥫
                      </div>
                      <span className="text-xs text-neutral-300 font-medium">Wet food:</span>
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">
                      {meal.wetFoodRange}
                    </span>
                  </div>
                </div>

                {/* Status / Feeder Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-700/60">
                  {isDone ? (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai ({record?.doneTime || 'Hari ini'})</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        Oleh: <strong className="text-neutral-200">{record?.fedBy || activeMember.name}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenQuickLog(meal)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 text-center transition-all"
                      >
                        Catat Porsi Rinci
                      </button>
                      <button
                        onClick={() => handleDirectToggle(meal.id)}
                        className="py-1.5 px-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs font-medium transition-colors"
                      >
                        Beri Makan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Target Card (Faithful to image: "Target per hari 🐾") */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#222226] border border-neutral-700/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Target Label Bubble */}
            <div className="md:col-span-4 bg-[#f8edd6] text-neutral-900 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
              <div className="text-xl font-extrabold font-display leading-tight flex items-center gap-1.5">
                Target per hari <span className="text-neutral-700">🐾</span>
              </div>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 mt-1" />
            </div>

            {/* Target Metrics */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥣</span>
                  <span className="text-xs text-neutral-300">Dry food:</span>
                  <strong className="text-sm text-white">45–50 g</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🥫</span>
                  <span className="text-xs text-neutral-300">Wet food:</span>
                  <strong className="text-sm text-white">50–60 g</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span className="text-neutral-300">Total:</span>
                  <strong className="text-amber-400 font-bold text-sm">
                    sekitar 100–110 g makanan/hari
                  </strong>
                </div>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  3 porsi terbagi rata
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Advice Footer Card with Cat Silhouette */}
        <div className="mt-4 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/60 flex items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🐱</span>
            <span>
              Pastikan makanannya formulasi kitten/growth dan sesuaikan bila ada anjuran dokter hewan.
            </span>
          </div>
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 flex-shrink-0" />
        </div>

      </div>

      {/* Quick Meal Feeder Modal */}
      {loggingMealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥣</span>
                <div>
                  <h3 className="font-bold font-display text-lg">
                    Beri Makan {schedules.find((s) => s.id === loggingMealId)?.title}
                  </h3>
                  <p className="text-xs opacity-60">Catat takaran porsi & respon makan Nyunyu</p>
                </div>
              </div>
              <button
                onClick={() => setLoggingMealId(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="text-xs font-semibold opacity-75 mb-1.5 block">
                  Diberi makan oleh:
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                  <div className={`w-3 h-3 rounded-full ${activeMember.avatarColor}`} />
                  <span className="text-xs font-bold">{activeMember.name}</span>
                  <span className="text-[11px] opacity-60">({activeMember.role})</span>
                </div>
              </div>

              {/* Sliders for actual grams */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <span>Dry Food</span>
                    <span>{actualDry} g</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={actualDry}
                    onChange={(e) => setActualDry(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-[10px] opacity-60 flex justify-between mt-0.5">
                    <span>10g</span>
                    <span>Target: 16g</span>
                    <span>30g</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex justify-between items-center text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    <span>Wet Food</span>
                    <span>{actualWet} g</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    value={actualWet}
                    onChange={(e) => setActualWet(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="text-[10px] opacity-60 flex justify-between mt-0.5">
                    <span>10g</span>
                    <span>Target: 18g</span>
                    <span>35g</span>
                  </div>
                </div>
              </div>

              {/* Cat eating mood / appetite */}
              <div>
                <label className="text-xs font-semibold opacity-75 mb-1.5 block">
                  Nafsu Makan Nyunyu:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'lahap', label: 'Lahap 😋', desc: 'Habis bersih' },
                    { id: 'biasa', label: 'Biasa 🙂', desc: 'Normal' },
                    { id: 'sisa_sedikit', label: 'Sisa Sedikit 🐱', desc: 'Sisa 10%' },
                    { id: 'mogok', label: 'Kurang Mau 😿', desc: 'Mogok makan' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCatMood(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        catMood === m.id
                          ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-sm'
                          : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-xs'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold opacity-75 mb-1 block">
                  Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  value={mealNote}
                  onChange={(e) => setMealNote(e.target.value)}
                  placeholder="Contoh: Ditambah air hangat, aktif mengeong"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLoggingMealId(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickLog}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Simpan & Beri Makan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Sync Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="font-bold font-display text-lg">Sinkronisasi Kalender Digital</h3>
                  <p className="text-xs opacity-60">Tambahkan alarm makan harian Nyunyu ke kalender Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs">
              <p className="opacity-80">
                Pilih opsi di bawah untuk memasukkan pengingat waktu makan rutin (Pagi 07:00, Siang 13:00, Malam 19:00) langsung ke perangkat Anda:
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Google Calendar (Buka Langsung per Jadwal)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {schedules.map((s) => {
                    const gcalUrl = generateGoogleCalendarUrl({
                      title: `🐾 Jadwal Makan ${s.title} Nyunyu`,
                      details: `Waktunya makan ${s.title} untuk Nyunyu.\n• Dry food: ${s.dryFoodRange}\n• Wet food: ${s.wetFoodRange}\nFormulasi Kitten Growth.`,
                      timeString: s.time,
                      recurrence: 'DAILY',
                    });

                    return (
                      <a
                        key={s.id}
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>+ {s.title} ({s.time})</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>Apple Calendar / Outlook / Universal (.ICS)</span>
                </div>
                <p className="opacity-75">
                  Unduh 1 file kalender berisi ketiga jadwal makan harian sekaligus yang dapat dibuka langsung di iPhone, Mac, Windows, atau Android.
                </p>
                <button
                  onClick={handleDownloadAllMealsICS}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm"
                >
                  <span>Unduh File Kalender (.ICS)</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-750 text-xs font-semibold hover:opacity-90"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feeding History Section */}
      <div className={`order-4 p-5 rounded-3xl border transition-all ${
        darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="font-bold font-display text-base">Riwayat Pemberian Makan</h3>
              <p className="text-xs opacity-60">Log pemantauan asupan makan dan nafsu makan Nyunyu</p>
            </div>
          </div>
          {(() => {
            const mealLogs = feedingLogs.filter((l) => l.mealId !== 'security');
            return (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {mealLogs.length} Catatan
              </span>
            );
          })()}
        </div>

        {(() => {
          const mealLogs = feedingLogs.filter((l) => l.mealId !== 'security');
          if (mealLogs.length === 0) {
            return (
              <div className="p-6 text-center text-xs opacity-60">
                Belum ada log pemberian makan. Beri centang pada jadwal di atas untuk mulai mencatat.
              </div>
            );
          }
          return (
            <div className="space-y-2.5">
              {mealLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs">
                      {log.mealTitle[0] || 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{log.mealTitle}</span>
                        <span className="opacity-50 text-[11px]">({log.date} {log.time})</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {log.catMood === 'lahap' ? 'Lahap' : log.catMood === 'sisa_sedikit' ? 'Sisa Sedikit' : log.catMood}
                        </span>
                      </div>
                      <div className="opacity-75 text-[11px] mt-0.5">
                        Dry: {log.dryFoodG}g • Wet: {log.wetFoodG}g • Diberi oleh: <span className="font-semibold">{log.fedBy}</span>
                        {log.note && <span className="italic"> — "{log.note}"</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteFeedingLog(log.id)}
                    className="opacity-40 hover:opacity-100 hover:text-red-500 text-xs p-1"
                    title="Hapus catatan"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

    </div>
  );
};
