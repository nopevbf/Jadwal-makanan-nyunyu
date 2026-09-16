import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  Bug,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download,
  Share2,
  FileText,
  UserCheck
} from 'lucide-react';
import { MedicationScheduleItem, FamilyMember } from '../types';
import { generateGoogleCalendarUrl, downloadICSFile } from '../utils/calendar';
import { playCatBellChime } from '../utils/audio';

interface MedicationCalendarProps {
  medications: MedicationScheduleItem[];
  onUpdateMedication: (med: MedicationScheduleItem) => void;
  onAddMedication: (med: Omit<MedicationScheduleItem, 'id' | 'history'>) => void;
  activeMember: FamilyMember;
  darkMode: boolean;
}

export const MedicationCalendar: React.FC<MedicationCalendarProps> = ({
  medications,
  onUpdateMedication,
  onAddMedication,
  activeMember,
  darkMode,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedForAction, setSelectedMedForAction] = useState<MedicationScheduleItem | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Form states for new medication
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('cacing');
  const [dosage, setDosage] = useState('');
  const [frequencyMonths, setFrequencyMonths] = useState(3);
  const [lastGivenDate, setLastGivenDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const calculateNextDue = (lastDateStr: string, months: number) => {
    const d = new Date(lastDateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleMarkAdministered = (med: MedicationScheduleItem) => {
    setSelectedMedForAction(med);
    setActionNotes('');
  };

  const handleConfirmAdministered = () => {
    if (!selectedMedForAction) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDue = calculateNextDue(todayStr, selectedMedForAction.frequencyMonths || 1);

    const updated: MedicationScheduleItem = {
      ...selectedMedForAction,
      lastGivenDate: todayStr,
      nextDueDate: nextDue,
      status: 'aman',
      administeredBy: activeMember.name,
      history: [
        {
          id: `h-${Date.now()}`,
          date: todayStr,
          givenBy: activeMember.name,
          notes: actionNotes.trim() || undefined,
        },
        ...selectedMedForAction.history,
      ],
    };

    onUpdateMedication(updated);
    playCatBellChime();
    setSelectedMedForAction(null);
  };

  const handleExportMedicationICS = (med: MedicationScheduleItem) => {
    const [year, month, day] = med.nextDueDate.split('-').map(Number);
    const d = new Date(year, month - 1, day, 9, 0, 0);

    downloadICSFile(`Jadwal_${med.name.replace(/\s+/g, '_')}`, [
      {
        title: `💊 Jadwal ${med.name} Nyunyu`,
        description: `Waktunya pemberian ${med.name} untuk Nyunyu.\n• Dosis: ${med.dosage}\n• Frekuensi: ${med.frequencyLabel}\n• Catatan: ${med.notes || '-'}`,
        startDate: d,
        durationMinutes: 30,
        recurrenceRule: med.frequencyMonths === 1 ? 'RRULE:FREQ=MONTHLY' : med.frequencyMonths === 3 ? 'RRULE:FREQ=MONTHLY;INTERVAL=3' : undefined,
      },
    ]);
  };

  const handleCreateNewMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const nextDueDate = calculateNextDue(lastGivenDate, frequencyMonths);
    const frequencyLabel = frequencyMonths === 1 ? 'Setiap 1 Bulan' : frequencyMonths === 3 ? 'Setiap 3 Bulan' : `Setiap ${frequencyMonths} Bulan`;

    onAddMedication({
      name: name.trim(),
      type,
      dosage: dosage.trim() || 'Sesuai petunjuk dokter',
      frequencyLabel,
      frequencyMonths,
      lastGivenDate,
      nextDueDate,
      status: 'aman',
      administeredBy: activeMember.name,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setName('');
    setDosage('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl flex-shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Jadwal Obat Cacing & Obat Kutu</h3>
              <p className="text-xs opacity-60">
                Pencegahan parasit rutin untuk kesehatan saluran pencernaan & bulu Nyunyu
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            id="btn-add-med-schedule"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Obat</span>
          </button>
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => {
          const daysLeft = getDaysDiff(med.nextDueDate);
          const isOverdue = daysLeft < 0;
          const isDueSoon = daysLeft >= 0 && daysLeft <= 7;

          const gcalUrl = generateGoogleCalendarUrl({
            title: `💊 Jadwal ${med.name} Nyunyu`,
            details: `Waktunya memberikan ${med.name} untuk Nyunyu.\n• Dosis: ${med.dosage}\n• Frekuensi: ${med.frequencyLabel}\n• Catatan: ${med.notes || '-'}`,
            timeString: '09:00',
            specificDate: med.nextDueDate,
          });

          return (
            <div
              key={med.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                darkMode ? 'bg-neutral-850 border-neutral-850' : 'bg-white border-neutral-200'
              } ${
                isOverdue
                  ? 'ring-2 ring-rose-500/50'
                  : isDueSoon
                    ? 'ring-2 ring-amber-500/50'
                    : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="text-2xl">
                      {med.type === 'cacing' ? '🪱' : med.type === 'kutu' ? '🐜' : '💊'}
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-base leading-snug">{med.name}</h4>
                      <span className="text-[11px] opacity-60 font-medium">{med.frequencyLabel}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isOverdue
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : isDueSoon
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isOverdue
                      ? `Lewat ${Math.abs(daysLeft)} hari!`
                      : isDueSoon
                        ? daysLeft === 0 ? 'Jatuh Tempo Hari Ini!' : `${daysLeft} hari lagi`
                        : 'Terjadwal Aman'}
                  </span>
                </div>

                {/* Details box */}
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="opacity-60">Dosis Dianjurkan:</span>
                    <strong className="font-semibold">{med.dosage}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Terakhir Diberikan:</span>
                    <span>{med.lastGivenDate || '-'}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-600 dark:text-amber-400">Jadwal Berikutnya:</span>
                    <span className="text-amber-600 dark:text-amber-400">{med.nextDueDate}</span>
                  </div>
                  {med.notes && (
                    <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-700/60 text-[11px] opacity-75 italic">
                      💡 {med.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAdministered(med)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Sudah Diberikan</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border border-neutral-200 dark:border-neutral-700 font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>+ Google Calendar</span>
                  </a>

                  <button
                    onClick={() => handleExportMedicationICS(med)}
                    className="py-1.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="Unduh pengingat .ICS"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ICS</span>
                  </button>
                </div>

                {/* History Drawer */}
                {med.history.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 text-[11px]">
                    <span className="opacity-50 font-semibold block mb-1">Riwayat Pemberian:</span>
                    <div className="space-y-1">
                      {med.history.slice(0, 2).map((h) => (
                        <div key={h.id} className="flex justify-between opacity-75">
                          <span>{h.date} (Oleh: {h.givenBy})</span>
                          {h.notes && <span className="italic truncate max-w-[140px]">{h.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vet Medication Guidance Card */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🩺</span>
          <h4 className="font-bold font-display text-sm">Panduan Dokter Hewan: Obat Cacing & Kutu Kitten</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs opacity-80 leading-relaxed">
          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <strong className="text-amber-600 dark:text-amber-400 block mb-1">
              Aturan Obat Cacing:
            </strong>
            Kitten usia 2, 4, 6, dan 8 minggu biasanya sudah menerima obat cacing rutin. Setelah usia 6 bulan seperti Nyunyu, pemberian obat cacing cukup diulang <strong>setiap 3 bulan sekali</strong> untuk pencegahan cacing pita & gelang.
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">
              Aturan Obat Kutu Tetes (Spot-on):
            </strong>
            Diberikan <strong>setiap 1 bulan sekali</strong> di area tengkuk (kulit yang tidak bisa dijilat). Pastikan berat badan kitten sudah memenuhi syarat minimal produk (biasanya &gt; 1.5 - 2.0 kg).
          </div>
        </div>
      </div>

      {/* Modal Mark Administered */}
      {selectedMedForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold font-display text-lg">Konfirmasi Pemberian Obat</h3>
              </div>
              <button
                onClick={() => setSelectedMedForAction(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <p className="opacity-80">
                Anda akan mencatat bahwa <strong>{selectedMedForAction.name}</strong> telah berhasil diberikan hari ini.
              </p>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <div>Dosis: <strong>{selectedMedForAction.dosage}</strong></div>
                <div>Diberikan oleh: <strong className="text-amber-500">{activeMember.name}</strong></div>
                <div>Jadwal berikutnya otomatis dihitung: <strong>+{selectedMedForAction.frequencyMonths} Bulan ke depan</strong></div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Contoh: Diminumkan bersama snack creamy, tidak muntah"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedMedForAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAdministered}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
              >
                Simpan & Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Medication Schedule */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold font-display text-lg">Tambah Jadwal Obat / Perawatan</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewMedication} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="font-semibold opacity-80 block mb-1">Nama Obat / Tindakan:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Obat Cacing Drontal / Advocate Spot-on"
                  required
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold opacity-80 block mb-1">Kategori:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value="cacing">Obat Cacing</option>
                    <option value="kutu">Obat Kutu / Tetes</option>
                    <option value="vitamin">Vitamin / Suplemen</option>
                    <option value="vaksin">Vaksinasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold opacity-80 block mb-1">Frekuensi Pengulangan:</label>
                  <select
                    value={frequencyMonths}
                    onChange={(e) => setFrequencyMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value={1}>Setiap 1 Bulan</option>
                    <option value={2}>Setiap 2 Bulan</option>
                    <option value={3}>Setiap 3 Bulan (Standar Cacing)</option>
                    <option value={6}>Setiap 6 Bulan</option>
                    <option value={12}>Setiap 1 Tahun (Vaksin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold opacity-80 block mb-1">Dosis / Aturan Pakai:</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Contoh: 1/2 tablet sesudah makan / 1 tube tetes tengkuk"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold opacity-80 block mb-1">Tanggal Terakhir Diberikan:</label>
                <input
                  type="date"
                  value={lastGivenDate}
                  onChange={(e) => setLastGivenDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold opacity-80 block mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jangan mandikan kucing 2 hari sesudah pemakaian"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
