import React from 'react';
import { Printer, Copy, Check, X, Heart, Shield, FileText } from 'lucide-react';
import { CatProfile, HealthRecordEntry, MedicationScheduleItem, WeightRecord, FeedingLogEntry } from '../types';

interface MedicalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CatProfile;
  healthRecords: HealthRecordEntry[];
  medications: MedicationScheduleItem[];
  weightLogs: WeightRecord[];
  feedingLogs: FeedingLogEntry[];
  darkMode: boolean;
}

export const MedicalExportModal: React.FC<MedicalExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  healthRecords,
  medications,
  weightLogs,
  feedingLogs,
  darkMode,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const latestWeight = weightLogs[weightLogs.length - 1]?.weightKg || profile.weightKg;

  // Build plain-text summary for copying to WhatsApp/Email
  const generateTextSummary = () => {
    let txt = `📋 LAPORAN MEDIS & KESEHATAN KUCING: ${profile.name.toUpperCase()}\n`;
    txt += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n`;
    txt += `------------------------------------\n`;
    txt += `🐾 PROFIL PASIEN:\n`;
    txt += `• Nama: ${profile.name}\n`;
    txt += `• Usia: ${profile.ageMonths} Bulan (Kitten)\n`;
    txt += `• Berat Badan Terkini: ${latestWeight.toFixed(2)} kg\n`;
    txt += `• Jenis Kelamin: ${profile.gender === 'betina' ? 'Betina' : 'Jantan'}\n`;
    txt += `• Ras/Ciri: ${profile.breed}\n\n`;

    txt += `🥣 DIET & NUTRISI HARIAN:\n`;
    txt += `• Pola: Dry food lebih banyak (${profile.targetDailyDryG}g dry + ${profile.targetDailyWetG}g wet)\n`;
    txt += `• Jadwal: 3x sehari (Pagi, Siang, Malam)\n`;
    txt += `• Nafsu Makan: Umumnya lahap & aktif\n\n`;

    txt += `🛡️ PENCEGAHAN PARASIT & RUTIN:\n`;
    medications.forEach((m) => {
      txt += `• ${m.name}: Terakhir ${m.lastGivenDate || '-'} (Jatuh tempo: ${m.nextDueDate})\n`;
    });

    txt += `\n🩺 RIWAYAT REKAM MEDIS & KLINIK TERAKHIR:\n`;
    healthRecords.slice(0, 5).forEach((h, i) => {
      txt += `${i + 1}. [${h.date}] ${h.title}\n`;
      if (h.clinicOrDoctor) txt += `   Klinik/Drh: ${h.clinicOrDoctor}\n`;
      if (h.diagnosis) txt += `   Diagnosa: ${h.diagnosis}\n`;
      if (h.treatment) txt += `   Tindakan: ${h.treatment}\n`;
      if (h.weightAtTimeKg) txt += `   BB saat itu: ${h.weightAtTimeKg} kg\n`;
    });

    return txt;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateTextSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl transition-all my-8 overflow-hidden ${
        darkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-800'
      }`}>
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-850">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold font-display text-base">Laporan Medis untuk Dokter Hewan</h3>
              <p className="text-xs opacity-60">Format resmi rekam medis konsultasi klinik</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Salin ringkasan teks untuk WA / Chat Dokter"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks WA'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="veterinary-report-print" className="p-6 sm:p-8 space-y-6 text-neutral-900 bg-white dark:bg-white dark:text-neutral-900">
          
          {/* Document Header */}
          <div className="border-b-2 border-neutral-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐾</span>
                <div>
                  <h1 className="text-2xl font-black tracking-tight font-display text-neutral-900 uppercase">
                    REKAM MEDIS PASIEN HEWAN (FELINE)
                  </h1>
                  <p className="text-xs text-neutral-600">
                    Dokumentasi Riwayat Kesehatan, Diet, & Pertumbuhan Pasien Kucing
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-600">
              <div className="font-bold text-neutral-900">NAMA PASIEN: {profile.name.toUpperCase()}</div>
              <div>Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}</div>
            </div>
          </div>

          {/* Patient Bio Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Nama Pasien</span>
              <strong className="text-sm font-bold">{profile.name}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Usia & Status</span>
              <strong className="text-sm font-bold">{profile.ageMonths} Bulan (Kitten)</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Berat Terkini</span>
              <strong className="text-sm font-bold text-amber-700">{latestWeight.toFixed(2)} kg</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Jenis / Ras</span>
              <strong className="text-sm font-bold">{profile.breed}</strong>
            </div>
          </div>

          {/* Regimen Diet / Feeding Section */}
          <div className="border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 text-neutral-800 flex items-center gap-1.5">
              <span>🥣</span> Pola Makan & Takaran Harian Saat Ini
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-neutral-500 block text-[11px]">Komposisi Makanan:</span>
                <strong>Dry Food: {profile.targetDailyDryG}g / hari</strong>
                <div className="text-neutral-500 text-[10px] mt-0.5">Formulasi Kitten Growth</div>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Asupan Basah:</span>
                <strong>Wet Food: {profile.targetDailyWetG}g / hari</strong>
                <div className="text-neutral-500 text-[10px] mt-0.5">Membantu hidrasi ginjal</div>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Frekuensi Makan:</span>
                <strong>3 kali sehari (Pagi, Siang, Malam)</strong>
                <div className="text-neutral-500 text-[10px] mt-0.5">Total: ~{profile.targetDailyDryG + profile.targetDailyWetG}g/hari</div>
              </div>
            </div>
          </div>

          {/* Parasite Prevention Status (Deworming & Flea) */}
          <div className="border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 text-neutral-800 flex items-center gap-1.5">
              <span>🛡️</span> Status Obat Cacing & Obat Kutu
            </h2>
            <div className="divide-y divide-neutral-100">
              {medications.map((m) => (
                <div key={m.id} className="py-2 flex items-center justify-between">
                  <div>
                    <strong className="text-neutral-900">{m.name}</strong>
                    <span className="text-neutral-500 ml-2">({m.dosage})</span>
                    <div className="text-neutral-500 text-[11px]">Frekuensi: {m.frequencyLabel}</div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div>Terakhir: <strong>{m.lastGivenDate || '-'}</strong></div>
                    <div className="text-amber-700 font-semibold">Jatuh Tempo: {m.nextDueDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Weight History */}
          <div className="border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 text-neutral-800 flex items-center gap-1.5">
              <span>📈</span> Riwayat Kurva Berat Badan Bulanan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {weightLogs.map((w) => (
                <div key={w.id} className="p-2 rounded bg-neutral-50 border border-neutral-200 text-center">
                  <div className="font-bold text-amber-800">{w.weightKg.toFixed(2)} kg</div>
                  <div className="text-[10px] text-neutral-500">{w.date}</div>
                  {w.ageMonthsAtRecord && <div className="text-[10px] text-neutral-400">({w.ageMonthsAtRecord} bln)</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Medical Visit & Vaccine History */}
          <div className="border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 text-neutral-800 flex items-center gap-1.5">
              <span>🩺</span> Riwayat Tindakan Klinik & Vaksinasi
            </h2>
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 uppercase">
                  <th className="py-1.5">Tanggal</th>
                  <th className="py-1.5">Kategori / Tindakan</th>
                  <th className="py-1.5">Klinik / Dokter</th>
                  <th className="py-1.5">Diagnosa & Catatan</th>
                  <th className="py-1.5 text-right">BB (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px]">
                {healthRecords.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 whitespace-nowrap font-medium">{h.date}</td>
                    <td className="py-2">
                      <span className="font-bold">{h.title}</span>
                      {h.treatment && <div className="text-neutral-500">{h.treatment}</div>}
                    </td>
                    <td className="py-2">{h.clinicOrDoctor || '-'}</td>
                    <td className="py-2 text-neutral-700">
                      <div>{h.diagnosis || '-'}</div>
                      {h.notes && <div className="text-neutral-500 italic text-[10px]">{h.notes}</div>}
                    </td>
                    <td className="py-2 text-right font-semibold">{h.weightAtTimeKg ? `${h.weightAtTimeKg} kg` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Doctor Signature / Stamp line */}
          <div className="pt-6 border-t border-neutral-200 flex justify-between items-end text-xs text-neutral-600">
            <div>
              <p>Laporan dicetak otomatis oleh Sistem Perawatan Kucing Nyunyu.</p>
              <p className="text-[10px] text-neutral-400">Verifikasi data dianjurkan melalui pemeriksaan fisik langsung di klinik.</p>
            </div>
            <div className="text-center w-48">
              <div className="h-14 border-b border-neutral-400"></div>
              <p className="mt-1 font-semibold text-[11px]">Tanda Tangan / Stempel Dokter Hewan</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
