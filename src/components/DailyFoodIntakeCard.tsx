import React, { useState } from 'react';
import {
  Scale,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Heart,
} from 'lucide-react';
import {
  CatProfile,
  MealScheduleItem,
  DailyFeedingRecord,
  FeedingLogEntry,
  FamilyMember,
} from '../types';

interface DailyFoodIntakeCardProps {
  profile: CatProfile;
  schedules: MealScheduleItem[];
  todayRecords: Record<string, DailyFeedingRecord>;
  feedingLogs: FeedingLogEntry[];
  currentDateStr: string;
  activeMember: FamilyMember;
  onAddFeedingLog: (entry: Omit<FeedingLogEntry, 'id'>) => void;
  darkMode: boolean;
}

export const DailyFoodIntakeCard: React.FC<DailyFoodIntakeCardProps> = ({
  profile,
  schedules,
  todayRecords,
  feedingLogs,
  currentDateStr,
  activeMember,
  onAddFeedingLog,
  darkMode,
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);
  const [showExtraModal, setShowExtraModal] = useState<boolean>(false);
  const [extraType, setExtraType] = useState<'dry' | 'wet' | 'both'>('wet');
  const [extraDryG, setExtraDryG] = useState<number>(10);
  const [extraWetG, setExtraWetG] = useState<number>(15);
  const [extraTitle, setExtraTitle] = useState<string>('Snack & Wet Treat');
  const [extraNote, setExtraNote] = useState<string>('');
  const [extraMood, setExtraMood] = useState<'lahap' | 'biasa' | 'sisa_sedikit' | 'mogok'>('lahap');

  // Format today's date in Indonesian
  const formattedToday = (() => {
    try {
      const parts = currentDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return currentDateStr;
    } catch {
      return currentDateStr;
    }
  })();

  // Filter all feeding logs for today from "Riwayat Pemberian Makan"
  const todayLogs = feedingLogs.filter(
    (l) => l.date === currentDateStr && l.mealId !== 'security'
  );

  // Sort today's logs by time descending (newest log first)
  const sortedTodayLogs = [...todayLogs].sort((a, b) => {
    if (a.time && b.time && a.time !== b.time) {
      return b.time.localeCompare(a.time);
    }
    return 0;
  });

  // Calculate intake from scheduled meals (Pagi, Siang, Malam)
  // When another family member feeds, use the latest data
  let givenDryG = 0;
  let givenWetG = 0;

  const sessionStatuses = schedules.map((meal) => {
    // Check logs from Riwayat Pemberian Makan for this specific meal
    const matchingLogs = sortedTodayLogs.filter(
      (l) =>
        l.mealId === meal.id ||
        (l.mealTitle && l.mealTitle.toLowerCase().includes(meal.title.toLowerCase()))
    );

    if (matchingLogs.length > 0) {
      // Use the latest log (data yang terbaru)
      const latestLog = matchingLogs[0];
      const previousLog = matchingLogs.length > 1 ? matchingLogs[1] : null;

      givenDryG += latestLog.dryFoodG;
      givenWetG += latestLog.wetFoodG;

      return {
        id: meal.id,
        title: meal.title,
        scheduledTime: meal.time,
        isDone: true,
        dryG: latestLog.dryFoodG,
        wetG: latestLog.wetFoodG,
        plannedDry: meal.dryFoodRange,
        plannedWet: meal.wetFoodRange,
        totalG: latestLog.dryFoodG + latestLog.wetFoodG,
        fedBy: latestLog.fedBy,
        doneTime: latestLog.time,
        mood: latestLog.catMood,
        note: latestLog.note,
        isExtra: false,
        totalLogsForSession: matchingLogs.length,
        previousFeeder: previousLog ? `${previousLog.fedBy} (${previousLog.time})` : null,
      };
    }

    // Fallback if recorded in todayRecords
    const rec = todayRecords[meal.id];
    if (rec?.isDone) {
      const dry = rec?.actualDryG ?? meal.dryFoodG;
      const wet = rec?.actualWetG ?? meal.wetFoodG;
      givenDryG += dry;
      givenWetG += wet;

      return {
        id: meal.id,
        title: meal.title,
        scheduledTime: meal.time,
        isDone: true,
        dryG: dry,
        wetG: wet,
        plannedDry: meal.dryFoodRange,
        plannedWet: meal.wetFoodRange,
        totalG: dry + wet,
        fedBy: rec?.fedBy,
        doneTime: rec?.doneTime,
        mood: rec?.mood,
        note: rec?.note,
        isExtra: false,
        totalLogsForSession: 1,
        previousFeeder: null,
      };
    }

    // Meal not yet given today
    return {
      id: meal.id,
      title: meal.title,
      scheduledTime: meal.time,
      isDone: false,
      dryG: 0,
      wetG: 0,
      plannedDry: meal.dryFoodRange,
      plannedWet: meal.wetFoodRange,
      totalG: 0,
      fedBy: undefined,
      doneTime: undefined,
      mood: undefined,
      note: undefined,
      isExtra: false,
      totalLogsForSession: 0,
      previousFeeder: null,
    };
  });

  // Extra snacks / feedings logged today (outside main schedule or explicit ekstra)
  const extraLogsToday = sortedTodayLogs.filter(
    (l) =>
      l.mealId === 'ekstra' ||
      !schedules.some(
        (s) => s.id === l.mealId || (l.mealTitle && l.mealTitle.toLowerCase().includes(s.title.toLowerCase()))
      )
  );

  extraLogsToday.forEach((log) => {
    givenDryG += log.dryFoodG;
    givenWetG += log.wetFoodG;
  });

  const totalGivenG = givenDryG + givenWetG;

  // Target values from profile or kitten growth benchmarks
  const targetDryG = profile.targetDailyDryG || 48;
  const targetWetG = profile.targetDailyWetG || 55;
  const targetTotalG = targetDryG + targetWetG;

  const progressPercent = Math.min(100, Math.round((totalGivenG / targetTotalG) * 100));
  const dryPercent = Math.min(100, Math.round((givenDryG / targetDryG) * 100));
  const wetPercent = Math.min(100, Math.round((givenWetG / targetWetG) * 100));

  const remainingTotalG = Math.max(0, targetTotalG - totalGivenG);
  const remainingDryG = Math.max(0, targetDryG - givenDryG);
  const remainingWetG = Math.max(0, targetWetG - givenWetG);

  const handleSaveExtraFeeding = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const dryToSave = extraType === 'wet' ? 0 : extraDryG;
    const wetToSave = extraType === 'dry' ? 0 : extraWetG;

    onAddFeedingLog({
      date: currentDateStr,
      time: timeStr,
      mealId: 'ekstra',
      mealTitle: extraTitle.trim() || 'Snack / Porsi Ekstra',
      dryFoodG: dryToSave,
      wetFoodG: wetToSave,
      fedBy: activeMember.name,
      catMood: extraMood,
      note: extraNote.trim() || undefined,
    });

    setShowExtraModal(false);
    setExtraNote('');
    setExtraDryG(10);
    setExtraWetG(15);
  };

  return (
    <div
      id="section-daily-food-intake"
      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100 shadow-xl'
          : 'bg-white border-amber-200/90 text-neutral-800 shadow-lg'
      }`}
    >
      {/* Header Section with Live Reset Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg">
              ⚖️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold font-display tracking-tight flex items-center gap-2">
                Asupan Makanan Hari Berjalan
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  Hari Ini
                </span>
              </h2>
              <p className="text-xs opacity-65 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{formattedToday}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reset Indicator Badge & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            title="Sistem otomatis mereset hitungan porsi ke 0 g setiap pukul 00:00 tengah malam"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
            <span>Reset otomatis tiap 00:00</span>
          </div>

          <button
            type="button"
            onClick={() => setShowExtraModal(true)}
            id="btn-add-extra-snack"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Ekstra/Snack</span>
          </button>
        </div>
      </div>

      {/* Main Stats Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* Card 1: Total Makanan Hari Ini */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            totalGivenG >= targetTotalG
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : totalGivenG > 0
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
              <span>🍽️</span> Total Makanan Masuk
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                totalGivenG >= targetTotalG
                  ? 'bg-emerald-500 text-white'
                  : totalGivenG > 0
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
              {totalGivenG}
            </span>
            <span className="text-sm font-bold opacity-60">
              / target {targetTotalG} g
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700/80 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                totalGivenG >= targetTotalG
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] mt-2 opacity-75">
            <span>
              {totalGivenG === 0
                ? 'Belum ada porsi tercatat'
                : totalGivenG >= targetTotalG
                ? '🎉 Target harian terpenuhi'
                : `Sisa ${remainingTotalG} g lagi`}
            </span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              Target ~100–110 g
            </span>
          </div>
        </div>

        {/* Card 2: Dry Food Hari Ini */}
        <div className="p-4 rounded-2xl border bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/25">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <span>🥣</span> Dry Food (Kering)
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
              {dryPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-display tracking-tight text-blue-900 dark:text-blue-100">
              {givenDryG}
            </span>
            <span className="text-sm font-bold text-blue-700/70 dark:text-blue-300/70">
              / target {targetDryG} g
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-blue-200/60 dark:bg-blue-900/40 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${dryPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] mt-2 text-blue-800/80 dark:text-blue-300/80">
            <span>
              {givenDryG >= targetDryG
                ? 'Porsi dry tercapai'
                : `Sisa ${remainingDryG} g dry`}
            </span>
            <span className="font-medium">Target ~45–50 g</span>
          </div>
        </div>

        {/* Card 3: Wet Food Hari Ini */}
        <div className="p-4 rounded-2xl border bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/25">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <span>🥫</span> Wet Food (Basah)
            </span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
              {wetPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-display tracking-tight text-rose-900 dark:text-rose-100">
              {givenWetG}
            </span>
            <span className="text-sm font-bold text-rose-700/70 dark:text-rose-300/70">
              / target {targetWetG} g
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-rose-200/60 dark:bg-rose-900/40 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-rose-500 transition-all duration-500 rounded-full"
              style={{ width: `${wetPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] mt-2 text-rose-800/80 dark:text-rose-300/80">
            <span>
              {givenWetG >= targetWetG
                ? 'Porsi wet tercapai'
                : `Sisa ${remainingWetG} g wet`}
            </span>
            <span className="font-medium">Target ~50–60 g</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Sesi Makan Hari Ini (Collapsible) */}
      <div className="mt-4 pt-3 border-t border-neutral-200/80 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setShowBreakdown((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold opacity-80 hover:opacity-100 transition-opacity py-1"
        >
          <span className="flex items-center gap-1.5">
            <span>📋</span> Rincian Porsi yang Sudah Diberikan Hari Ini (
            {sessionStatuses.filter((s) => s.isDone).length + extraLogsToday.length} sesi)
          </span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBreakdown && (
          <div className="mt-2.5 space-y-2">
            {/* Scheduled Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sessionStatuses.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    s.isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{s.id === 'pagi' ? '🌅' : s.id === 'siang' ? '☀️' : '🌙'}</span>
                      <span>{s.title}</span>
                      <span className="text-[10px] opacity-60">({s.scheduledTime})</span>
                    </div>
                    {s.isDone ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-medium">
                        Belum
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                    {s.isDone ? (
                      <div className="space-y-1">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>Total: {s.totalG} g</span>
                          <span className="text-[10px] font-normal opacity-70">
                            {s.doneTime}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-75 flex gap-2">
                          <span className="text-blue-600 dark:text-blue-400">Dry: {s.dryG}g</span>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400">Wet: {s.wetG}g</span>
                        </div>
                        {s.fedBy && (
                          <div className="text-[10px] opacity-75 truncate flex items-center justify-between gap-1">
                            <span>
                              Oleh: <span className="font-semibold text-neutral-900 dark:text-white">{s.fedBy}</span>
                            </span>
                            {s.totalLogsForSession > 1 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                                Terbaru
                              </span>
                            )}
                          </div>
                        )}
                        {s.previousFeeder && (
                          <div className="text-[9px] text-neutral-400 dark:text-neutral-500 italic truncate">
                            Sebelumnya: {s.previousFeeder}
                          </div>
                        )}
                        {s.mood && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {s.mood === 'lahap' ? 'Lahap' : s.mood === 'sisa_sedikit' ? 'Sisa Sedikit' : s.mood}
                          </div>
                        )}
                        {s.note && (
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 italic truncate">
                            "{s.note}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] opacity-60">
                        Rencana: {s.plannedDry} dry, {s.plannedWet} wet
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Extra Snacks/Feedings logged today */}
            {extraLogsToday.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pemberian Ekstra / Snack Hari Ini:</span>
                </div>
                {extraLogsToday.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">✨</span>
                      <div>
                        <span className="font-bold">{log.mealTitle}</span>
                        <span className="opacity-60 text-[11px] ml-2">({log.time})</span>
                        <div className="text-[11px] opacity-75">
                          {log.dryFoodG > 0 && <span className="text-blue-600 dark:text-blue-400">Dry: {log.dryFoodG}g </span>}
                          {log.wetFoodG > 0 && <span className="text-rose-600 dark:text-rose-400">Wet: {log.wetFoodG}g </span>}
                          <span>• Oleh: <strong>{log.fedBy}</strong></span>
                          {log.note && <span className="italic"> — "{log.note}"</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      +{log.dryFoodG + log.wetFoodG} g
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Footnote */}
      <div className="mt-3.5 flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/40 text-[11px] opacity-70">
        <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        <span>
          Penghitung gram makanan ini menghitung asupan Nyunyu khusus untuk hari ini (hari berjalan) dan otomatis kembali ke 0 g setiap pukul 00:00 tengah malam.
        </span>
      </div>

      {/* Modal: Catat Snack / Porsi Ekstra */}
      {showExtraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
              darkMode
                ? 'bg-neutral-850 border-neutral-700 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-bold font-display text-lg">Catat Porsi Ekstra / Snack</h3>
                  <p className="text-xs opacity-60">Tambahkan camilan atau porsi di luar jadwal 3 waktu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExtraModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExtraFeeding} className="space-y-4 my-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Pemberian / Snack:</label>
                <input
                  type="text"
                  value={extraTitle}
                  onChange={(e) => setExtraTitle(e.target.value)}
                  placeholder="Contoh: Snack Sore, Creamy Treat, Kaldu Ekstra"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Jenis Makanan:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraType('wet')}
                    className={`p-2 rounded-xl border font-semibold ${
                      extraType === 'wet'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🥫 Wet Food
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraType('dry')}
                    className={`p-2 rounded-xl border font-semibold ${
                      extraType === 'dry'
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🥣 Dry Food
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraType('both')}
                    className={`p-2 rounded-xl border font-semibold ${
                      extraType === 'both'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    Keduanya
                  </button>
                </div>
              </div>

              {/* Sliders for grams */}
              <div className="space-y-2.5">
                {(extraType === 'dry' || extraType === 'both') && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex justify-between items-center font-bold text-blue-600 dark:text-blue-400 mb-1">
                      <span>Dry Food</span>
                      <span>{extraDryG} g</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      value={extraDryG}
                      onChange={(e) => setExtraDryG(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                )}

                {(extraType === 'wet' || extraType === 'both') && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="flex justify-between items-center font-bold text-rose-600 dark:text-rose-400 mb-1">
                      <span>Wet Food / Treat</span>
                      <span>{extraWetG} g</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={extraWetG}
                      onChange={(e) => setExtraWetG(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold block mb-1">Diberikan Oleh:</label>
                <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${activeMember.avatarColor}`} />
                  <span className="font-bold">{activeMember.name}</span>
                  <span className="opacity-60">({activeMember.role})</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Nafsu Makan Nyunyu:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'lahap', label: 'Lahap 😋' },
                    { id: 'biasa', label: 'Biasa 🙂' },
                    { id: 'sisa_sedikit', label: 'Sisa Sedikit 🐱' },
                    { id: 'mogok', label: 'Kurang Mau 😿' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setExtraMood(m.id as any)}
                      className={`p-1.5 rounded-lg border text-center font-medium ${
                        extraMood === m.id
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  placeholder="Contoh: Diberi snack setelah potong kuku"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtraModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md"
                >
                  Simpan & Tambah ke Hari Ini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
