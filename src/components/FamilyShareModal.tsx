import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Clock,
  Shield,
  Heart,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { FamilyMember, FeedingLogEntry } from '../types';

interface FamilyShareModalProps {
  familyMembers: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (m: FamilyMember) => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  recentLogs: FeedingLogEntry[];
  darkMode: boolean;
  onExportAllData: () => void;
  onImportData: (jsonStr: string) => void;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  familyMembers,
  activeMember,
  onSelectMember,
  onAddMember,
  onDeleteMember,
  recentLogs,
  darkMode,
  onExportAllData,
  onImportData,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Keluarga');
  const [avatarColor, setAvatarColor] = useState('bg-teal-500');
  const [copiedLink, setCopiedLink] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const colors = [
    { label: 'Rose', val: 'bg-rose-500' },
    { label: 'Amber', val: 'bg-amber-500' },
    { label: 'Emerald', val: 'bg-emerald-500' },
    { label: 'Indigo', val: 'bg-indigo-500' },
    { label: 'Purple', val: 'bg-purple-500' },
    { label: 'Teal', val: 'bg-teal-500' },
  ];

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      role,
      avatarColor,
    });

    setName('');
    setShowAddMember(false);
  };

  const handleCopyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) return;
    try {
      onImportData(importJsonText.trim());
      setShowImportBox(false);
      setImportJsonText('');
      alert('Data jadwal & rekam medis Nyunyu berhasil disinkronkan!');
    } catch (e) {
      alert('Format file JSON tidak valid. Pastikan menyalin file cadangan yang sesuai.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl flex-shrink-0">
              👨‍👩‍👧
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Berbagi Akses Anggota Keluarga</h3>
              <p className="text-xs opacity-60">
                Pantau kondisi makan dan kesehatan Nyunyu bersama seluruh anggota keluarga tanpa tumpang tindih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCopyShareLink}
              id="btn-copy-family-invite"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan Tautan App'}</span>
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Member Selection Grid */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold font-display text-sm">Pilih Siapa yang Sedang Mengakses</h4>
            <p className="text-xs opacity-60">
              Aktivitas pemberian makan & catatan obat akan otomatis diatribusikan ke anggota yang dipilih
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Aktif: {activeMember.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {familyMembers.map((member) => {
            const isSelected = activeMember.id === member.id;
            const canDelete = familyMembers.length > 1;

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`group relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 font-bold'
                    : darkMode
                      ? 'bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                      {member.name[0]}
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Sedang Aktif" />
                    )}
                  </div>

                  {canDelete ? (
                    <button
                      type="button"
                      id={`btn-delete-member-${member.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberToDelete(member);
                      }}
                      className="opacity-40 hover:opacity-100 hover:bg-rose-500/15 hover:text-rose-500 p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 transition-all"
                      title={`Hapus ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] opacity-40 px-1.5 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-700/50" title="Minimal 1 anggota">
                      Utama
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-sm font-bold truncate pr-1">{member.name}</div>
                  <div className="text-[11px] opacity-60 font-normal truncate">{member.role}</div>
                  <div className="mt-2 text-[10px]">
                    {isSelected ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">✓ Sedang Aktif</span>
                    ) : (
                      <span className="opacity-40 group-hover:opacity-80 transition-opacity">Klik untuk aktifkan</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync & Backup Tools for Multi-Device Collaboration */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔄</span>
          <div>
            <h4 className="font-bold font-display text-sm">Sinkronisasi & Cadangan Antar Perangkat</h4>
            <p className="text-xs opacity-60">
              Ekspor seluruh data Nyunyu untuk dipindahkan ke HP anggota keluarga lain dengan 1 klik
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <span className="font-bold text-xs block">Cadangkan Data (JSON)</span>
            <p className="text-[11px] opacity-75">
              Unduh salinan riwayat makan, bobot bulanan, dan jadwal obat Nyunyu.
            </p>
            <button
              onClick={onExportAllData}
              className="py-1.5 px-3 rounded-xl bg-neutral-900 dark:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-90"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Cadangan Lengkap</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <span className="font-bold text-xs block">Pulihkan / Impor Data</span>
            <p className="text-[11px] opacity-75">
              Muat data yang dikirimkan oleh anggota keluarga lain.
            </p>
            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="py-1.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-600 font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showImportBox ? 'Tutup Kolom Impor' : 'Tempel Data Impor'}</span>
            </button>
          </div>
        </div>

        {showImportBox && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-in fade-in">
            <label className="text-xs font-bold block text-amber-700 dark:text-amber-300">
              Tempel Kode JSON Cadangan:
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Tempel teks JSON di sini..."
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs"
              >
                Terapkan & Pulihkan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline Feed across Family */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-neutral-850 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold font-display text-sm">Aktivitas Terkini Keluarga untuk Nyunyu</h4>
        </div>

        <div className="space-y-2.5">
          {recentLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-bold">{log.fedBy}</span> telah memberi makan{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{log.mealTitle}</span>
                  <span className="opacity-50 text-[11px] ml-2">({log.date} pukul {log.time})</span>
                </div>
              </div>
              <span className="text-[11px] opacity-60">Dry {log.dryFoodG}g + Wet {log.wetFoodG}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Member */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold font-display text-lg">Tambah Anggota Keluarga</h3>
              </div>
              <button
                onClick={() => setShowAddMember(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 my-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Adik / Nenek / Cat Sitter Budi"
                  required
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Peran / Hubungan:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Keluarga / Pengasuh Sementara"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Warna Avatar:</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setAvatarColor(c.val)}
                      className={`w-7 h-7 rounded-full ${c.val} transition-transform ${
                        avatarColor === c.val ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-display text-base">Hapus Anggota Keluarga?</h4>
                <p className="text-xs opacity-60">Tindakan ini akan menghapus akses anggota</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed mb-4 opacity-80">
              Yakin ingin menghapus <strong className="text-rose-500 font-bold">{memberToDelete.name}</strong> ({memberToDelete.role}) dari daftar keluarga Nyunyu?
              <span className="block mt-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-[11px] opacity-90 border border-neutral-200/60 dark:border-neutral-700/60">
                💡 <em>Catatan: Riwayat pemberian makan & rekam medis yang pernah dicatat oleh {memberToDelete.name} tetap tersimpan aman di riwayat.</em>
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-member"
                onClick={() => {
                  onDeleteMember(memberToDelete.id);
                  setMemberToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
