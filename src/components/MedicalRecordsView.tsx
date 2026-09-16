import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Shield,
  Stethoscope,
  Syringe,
  Scissors,
  AlertCircle,
  Calendar,
  Building,
  DollarSign,
  Scale,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { HealthRecordEntry, CatProfile } from '../types';

interface MedicalRecordsViewProps {
  records: HealthRecordEntry[];
  onAddRecord: (record: Omit<HealthRecordEntry, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onOpenExportModal: () => void;
  profile: CatProfile;
  darkMode: boolean;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onOpenExportModal,
  profile,
  darkMode,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('kontrol_rutin');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicOrDoctor, setClinicOrDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [weightAtTimeKg, setWeightAtTimeKg] = useState<string>(profile.weightKg.toString());
  const [costRp, setCostRp] = useState<string>('');
  const [notes, setNotes] = useState('');

  const filteredRecords = selectedCategory === 'all'
    ? records
    : records.filter((r) => r.category === selectedCategory);

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddRecord({
      title: title.trim(),
      category,
      date,
      clinicOrDoctor: clinicOrDoctor.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      treatment: treatment.trim() || undefined,
      weightAtTimeKg: weightAtTimeKg ? Number(weightAtTimeKg) : undefined,
      costRp: costRp ? Number(costRp) : undefined,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setTitle('');
    setClinicOrDoctor('');
    setDiagnosis('');
    setTreatment('');
    setCostRp('');
    setNotes('');
  };

  const getCategoryBadge = (cat: HealthRecordEntry['category']) => {
    switch (cat) {
      case 'vaksin':
        return { label: 'Vaksinasi', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Syringe };
      case 'klinik':
      case 'kontrol_rutin':
        return { label: 'Pemeriksaan Klinik', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Stethoscope };
      case 'sakit':
        return { label: 'Kondisi Sakit', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: AlertCircle };
      case 'grooming':
        return { label: 'Grooming & Sanitasi', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: Scissors };
      default:
        return { label: 'Catatan Medis', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: FileText };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
              🩺
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Pencatatan Riwayat Kesehatan & Rekam Medis</h3>
              <p className="text-xs opacity-60">
                Lacak riwayat vaksinasi, kunjungan klinik, resep obat, dan ekspor ringkasan untuk dokter hewan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={onOpenExportModal}
              id="btn-export-vet-report"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Ekspor Laporan Dokter</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              id="btn-add-health-record"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekam Medis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'all', label: 'Semua Catatan' },
          { id: 'vaksin', label: '💉 Vaksinasi' },
          { id: 'kontrol_rutin', label: '🩺 Pemeriksaan Rutin' },
          { id: 'sakit', label: '⚠️ Sakit / Gejala' },
          { id: 'grooming', label: '✂️ Grooming' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold border transition-all ${
              selectedCategory === c.id
                ? 'bg-amber-500 text-white border-amber-600'
                : darkMode
                  ? 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Health Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className={`p-8 rounded-3xl border text-center text-xs opacity-60 ${
            darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            Tidak ada catatan medis dalam kategori ini.
          </div>
        ) : (
          filteredRecords.map((item) => {
            const badge = getCategoryBadge(item.category);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all ${
                  darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-2xl border ${badge.color} flex-shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold font-display text-base">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-60 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                        {item.clinicOrDoctor && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" />
                            {item.clinicOrDoctor}
                          </span>
                        )}
                        {item.weightAtTimeKg && (
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Scale className="w-3.5 h-3.5" />
                            {item.weightAtTimeKg} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {item.costRp && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        Rp {item.costRp.toLocaleString('id-ID')}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      className="opacity-40 hover:opacity-100 hover:text-red-500 p-1"
                      title="Hapus riwayat medis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details box */}
                {(item.diagnosis || item.treatment || item.notes) && (
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5 text-xs">
                    {item.diagnosis && (
                      <div>
                        <strong className="opacity-60 text-[11px] block">Hasil Pemeriksaan / Diagnosa:</strong>
                        <span>{item.diagnosis}</span>
                      </div>
                    )}
                    {item.treatment && (
                      <div>
                        <strong className="opacity-60 text-[11px] block">Tindakan & Obat yang Diberikan:</strong>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{item.treatment}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div>
                        <strong className="opacity-60 text-[11px] block">Catatan Tambahan:</strong>
                        <span className="italic opacity-80">{item.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Health Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold font-display text-lg">Tambah Riwayat Medis Nyunyu</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="font-semibold opacity-80 block mb-1">Judul Tindakan / Kunjungan:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Vaksin Tricat Dosis 2 / Cek Gigi & Telinga"
                  required
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold opacity-80 block mb-1">Kategori:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value="kontrol_rutin">Pemeriksaan Rutin</option>
                    <option value="vaksin">Vaksinasi</option>
                    <option value="sakit">Sakit / Keluhan</option>
                    <option value="grooming">Grooming / Bersih Telinga</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold opacity-80 block mb-1">Tanggal Kunjungan:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold opacity-80 block mb-1">Klinik / Nama Dokter:</label>
                  <input
                    type="text"
                    value={clinicOrDoctor}
                    onChange={(e) => setClinicOrDoctor(e.target.value)}
                    placeholder="Contoh: Klinik Sahabat Satwa / Drh. Sarah"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="font-semibold opacity-80 block mb-1">Berat Badan Saat Itu (kg):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightAtTimeKg}
                    onChange={(e) => setWeightAtTimeKg(e.target.value)}
                    placeholder="2.0"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold opacity-80 block mb-1">Diagnosa / Hasil Pemeriksaan:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Contoh: Suhu 38.5C, paru-paru bersih, tidak ada kutu"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold opacity-80 block mb-1">Tindakan / Resep Obat:</label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Contoh: Suntik antibiotik, salep mata 2x sehari"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold opacity-80 block mb-1">Biaya Medis (Rp):</label>
                  <input
                    type="number"
                    value={costRp}
                    onChange={(e) => setCostRp(e.target.value)}
                    placeholder="Contoh: 200000"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="font-semibold opacity-80 block mb-1">Catatan Tambahan:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kontrol kembali dalam 1 bulan"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
                >
                  Simpan Rekam Medis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
