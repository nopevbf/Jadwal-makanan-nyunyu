import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Plus,
  Calendar,
  Sparkles,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Trash2
} from 'lucide-react';
import { CatProfile, WeightRecord, FeedingLogEntry } from '../types';

interface WeightNutritionStatsProps {
  profile: CatProfile;
  weightLogs: WeightRecord[];
  onAddWeightLog: (record: Omit<WeightRecord, 'id'>) => void;
  onDeleteWeightLog: (id: string) => void;
  feedingLogs: FeedingLogEntry[];
  darkMode: boolean;
}

export const WeightNutritionStats: React.FC<WeightNutritionStatsProps> = ({
  profile,
  weightLogs,
  onAddWeightLog,
  onDeleteWeightLog,
  feedingLogs,
  darkMode,
}) => {
  const [showAddWeightModal, setShowAddWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(profile.weightKg);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState<string>('');

  // Sort logs by date ascending for chart
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recent gain calculation
  const latestWeight = sortedLogs[sortedLogs.length - 1]?.weightKg || profile.weightKg;
  const previousWeight = sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 2]?.weightKg : latestWeight;
  const weightChange = latestWeight - previousWeight;

  // Kitten reference ideal weight milestones (general domestic shorthair kitten average)
  const kittenMilestones = [
    { age: '2 bulan', range: '0.8 – 1.0 kg', status: 'Fase weaning' },
    { age: '3 bulan', range: '1.1 – 1.4 kg', status: 'Tumbuh cepat' },
    { age: '4 bulan', range: '1.4 – 1.8 kg', status: 'Gigi permanen tumbuh' },
    { age: '5 bulan', range: '1.7 – 2.2 kg', status: 'Otot & tulang padat' },
    { age: '6 bulan', range: '2.0 – 2.7 kg', status: 'Nyunyu Saat Ini ✨' },
    { age: '9-12 bulan', range: '2.8 – 4.2 kg', status: 'Dewasa muda' },
  ];

  // SVG Chart dimensions & coordinates
  const svgWidth = 640;
  const svgHeight = 240;
  const padding = { top: 30, right: 35, bottom: 40, left: 45 };

  const minWeight = 0.5;
  const maxWeight = 3.0;

  const getX = (index: number, total: number) => {
    if (total <= 1) return svgWidth / 2;
    return padding.left + (index / (total - 1)) * (svgWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minWeight, Math.min(maxWeight, val));
    return (
      svgHeight -
      padding.bottom -
      ((clamped - minWeight) / (maxWeight - minWeight)) * (svgHeight - padding.top - padding.bottom)
    );
  };

  const chartPoints = sortedLogs.map((log, idx) => ({
    x: getX(idx, sortedLogs.length),
    y: getY(log.weightKg),
    log,
  }));

  const pathD = chartPoints.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  // Fill gradient area under curve
  const areaD = chartPoints.length > 0
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - padding.bottom} L ${chartPoints[0].x} ${svgHeight - padding.bottom} Z`
    : '';

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight)) return;

    onAddWeightLog({
      date: newDate,
      weightKg: Number(newWeight),
      ageMonthsAtRecord: profile.ageMonths,
      note: newNote.trim() || undefined,
    });

    setShowAddWeightModal(false);
    setNewNote('');
  };

  // Nutrition calculations for Nyunyu
  const totalDryTarget = profile.targetDailyDryG;
  const totalWetTarget = profile.targetDailyWetG;
  const totalFoodTarget = totalDryTarget + totalWetTarget;
  const dryPercent = Math.round((totalDryTarget / totalFoodTarget) * 100);
  const wetPercent = 100 - dryPercent;

  // Approximate water intake contributed by wet food (wet food is ~78% moisture, dry food is ~10%)
  const estimatedMoistureFromWet = Math.round(totalWetTarget * 0.78);
  const estimatedCaloriesKcal = Math.round(totalDryTarget * 3.8 + totalWetTarget * 0.9);

  return (
    <div className="space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Current Weight Card */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Berat Badan Terkini</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display">{latestWeight.toFixed(2)}</span>
            <span className="text-sm font-semibold opacity-60">kg</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 font-medium">
            {weightChange >= 0 ? (
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="w-4 h-4" /> +{weightChange.toFixed(2)} kg
              </span>
            ) : (
              <span className="text-rose-500 flex items-center">
                <ArrowDownRight className="w-4 h-4" /> {weightChange.toFixed(2)} kg
              </span>
            )}
            <span className="opacity-60">sejak timbangan terakhir</span>
          </div>
        </div>

        {/* Nutritional Target Card */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Asupan Nutrisi Harian</span>
            <PieIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display">~{estimatedCaloriesKcal}</span>
            <span className="text-sm font-semibold opacity-60">kkal/hari</span>
          </div>
          <div className="mt-2 text-xs opacity-75 flex items-center gap-2">
            <span>Dry: {totalDryTarget}g ({dryPercent}%)</span>
            <span>•</span>
            <span>Wet: {totalWetTarget}g ({wetPercent}%)</span>
          </div>
        </div>

        {/* Hydration Benefit Card */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Cairan Dari Wet Food</span>
            <span className="text-base">💧</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display">+{estimatedMoistureFromWet}</span>
            <span className="text-sm font-semibold opacity-60">ml air</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
            Mencegah dehidrasi & menjaga kesehatan ginjal
          </div>
        </div>

      </div>

      {/* Monthly Weight Graph Section */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold font-display text-lg">Grafik Perkembangan Berat Badan Bulanan</h3>
            </div>
            <p className="text-xs opacity-60 mt-0.5">
              Pantau kurva pertumbuhan bobot Nyunyu dari kitten menuju kucing dewasa ideal
            </p>
          </div>

          <button
            onClick={() => setShowAddWeightModal(true)}
            id="btn-add-weight-entry"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Timbangan Baru</span>
          </button>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[560px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none">
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[1.0, 1.5, 2.0, 2.5].map((w) => {
                const y = getY(w);
                return (
                  <g key={w}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke={darkMode ? '#333333' : '#f1f1f4'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill={darkMode ? '#888888' : '#999999'}
                    >
                      {w.toFixed(1)} kg
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaD && <path d={areaD} fill="url(#weightGrad)" />}

              {/* Main Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points & labels */}
              {chartPoints.map((pt, i) => (
                <g key={pt.log.id}>
                  {/* Point shadow & circle */}
                  <circle cx={pt.x} cy={pt.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                  
                  {/* Value tag */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={darkMode ? '#ffffff' : '#1e293b'}
                  >
                    {pt.log.weightKg.toFixed(2)} kg
                  </text>

                  {/* X Axis Date / Age label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 14}
                    textAnchor="middle"
                    fontSize="10"
                    fill={darkMode ? '#9ca3af' : '#64748b'}
                  >
                    {pt.log.ageMonthsAtRecord ? `${pt.log.ageMonthsAtRecord} bln` : pt.log.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Weight Log History Table */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
          <h4 className="text-xs uppercase font-bold tracking-wider opacity-60 mb-3">
            Daftar Catatan Timbangan
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-amber-500 font-display text-sm">{log.weightKg.toFixed(2)} kg</span>
                    {log.ageMonthsAtRecord && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                        {log.ageMonthsAtRecord} bln
                      </span>
                    )}
                  </div>
                  <div className="opacity-50 text-[11px] mt-0.5">{log.date}</div>
                  {log.note && <div className="opacity-70 text-[11px] italic mt-0.5 line-clamp-1">{log.note}</div>}
                </div>

                {weightLogs.length > 1 && (
                  <button
                    onClick={() => onDeleteWeightLog(log.id)}
                    className="opacity-40 hover:opacity-100 hover:text-red-500 p-1"
                    title="Hapus timbangan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kitten Growth Milestones & Nutrition Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Milestones Guidance */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📈</span>
            <h4 className="font-bold font-display text-sm">Standar Bobot Kitten Sehat</h4>
          </div>
          <p className="text-xs opacity-75 mb-3">
            Rata-rata kenaikan berat badan kitten sehat berkisar 100–150 gram per minggu atau ~400–500 gram per bulan.
          </p>
          <div className="space-y-2 text-xs">
            {kittenMilestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl flex items-center justify-between border ${
                  m.age.includes('6 bulan')
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/40'
                }`}
              >
                <div>
                  <span className="font-bold mr-2">{m.age}</span>
                  <span className="opacity-75">{m.range}</span>
                </div>
                <span className="text-[11px] opacity-70">{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Tips for Dry + Wet Diet */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h4 className="font-bold font-display text-sm">Tips Nutrisi Nyunyu (Dry &gt; Wet)</h4>
          </div>
          <div className="space-y-2.5 text-xs opacity-80 leading-relaxed">
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <strong className="text-amber-600 dark:text-amber-400 block mb-1">
                Kombinasi Dry Food Lebih Banyak:
              </strong>
              Dry food (kibble) membantu mengikis karang gigi kitten dan memiliki kepadatan kalori tinggi untuk energi bermain.
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <strong className="text-rose-600 dark:text-rose-400 block mb-1">
                Wet Food Sebagai Penjaga Ginjal:
              </strong>
              Kucing memiliki rasa haus alami yang rendah. Porsi wet food 50-60g harian menjamin saluran kemih Nyunyu terhindar dari FLUTD / batu kandung kemih.
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <strong className="text-blue-600 dark:text-blue-400 block mb-1">
                Suhu Penyajian:
              </strong>
              Wet food yang baru dikeluarkan dari kulkas sebaiknya dicampur sedikit air hangat suam-suam kuku agar aromanya semakin harum dan memikat selera makannya.
            </div>
          </div>
        </div>

      </div>

      {/* Modal Add Weight Log */}
      {showAddWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold font-display text-lg">Catat Timbangan Nyunyu</h3>
              </div>
              <button
                onClick={() => setShowAddWeightModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4 my-4">
              <div>
                <label className="text-xs font-semibold opacity-75 mb-1.5 block">
                  Berat Badan (Kilogram):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.3"
                    max="15"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    required
                    className="w-full text-base font-bold p-2.5 pl-3 pr-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold opacity-60">kg</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-75 mb-1.5 block">
                  Tanggal Pengukuran:
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold opacity-75 mb-1.5 block">
                  Catatan Timbangan (Kondisi/Makanan):
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Contoh: Ditimbang sebelum makan pagi, lincah"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWeightModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
                >
                  Simpan Timbangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
