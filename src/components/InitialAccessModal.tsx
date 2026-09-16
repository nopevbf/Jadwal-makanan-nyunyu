import React, { useState } from 'react';
import { User, Users, UserPlus, Heart, Sparkles, Check } from 'lucide-react';
import { FamilyMember } from '../types';

interface InitialAccessModalProps {
  isOpen: boolean;
  familyMembers: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember;
  darkMode: boolean;
}

export const InitialAccessModal: React.FC<InitialAccessModalProps> = ({
  isOpen,
  familyMembers,
  onSelectMember,
  onAddMember,
  darkMode,
}) => {
  if (!isOpen) return null;

  // Exclude "Pemilik Utama" / "Ka Aji" completely from initial access modal
  const eligibleMembers = familyMembers.filter(
    (m) => m.role !== 'Pemilik Utama' && m.name !== 'Ka Aji' && m.id !== 'ka-aji'
  );

  const [isAddingNew, setIsAddingNew] = useState<boolean>(eligibleMembers.length === 0);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Keluarga' | 'Tamu'>('Keluarga');
  const [avatarColor, setAvatarColor] = useState('bg-amber-500');

  const avatarColors = [
    { label: 'Amber', val: 'bg-amber-500' },
    { label: 'Emerald', val: 'bg-emerald-500' },
    { label: 'Indigo', val: 'bg-indigo-500' },
    { label: 'Sky', val: 'bg-sky-500' },
    { label: 'Rose', val: 'bg-rose-500' },
    { label: 'Purple', val: 'bg-purple-500' },
  ];

  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember = onAddMember({
      name: name.trim(),
      role,
      avatarColor,
    });

    onSelectMember(newMember);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl transition-all ${
          darkMode
            ? 'bg-neutral-900 border-neutral-750 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Heart className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <h2 className="font-bold font-display text-xl sm:text-2xl tracking-tight">
            {isAddingNew || eligibleMembers.length === 0
              ? 'Daftar Akses Anggota'
              : 'Siapa yang Sedang Mengakses?'}
          </h2>
          <p className="text-xs sm:text-sm opacity-65 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {isAddingNew || eligibleMembers.length === 0
              ? 'Masukkan nama Anda untuk mulai mencatat jadwal dan perawatan Nyunyu bersama keluarga'
              : 'Pilih nama profil Anda sebelum membuka jadwal makan dan obat Nyunyu'}
          </p>
        </div>

        {/* Form Add Member (Shown if no members exist or user clicked add) */}
        {isAddingNew || eligibleMembers.length === 0 ? (
          <form onSubmit={handleAddNewMemberSubmit} className="space-y-4 text-xs sm:text-sm">
            {eligibleMembers.length === 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Belum ada anggota terdaftar. Silakan tambahkan nama Anda terlebih dahulu.</span>
              </div>
            )}

            <div>
              <label htmlFor="init-member-name" className="font-bold block mb-1.5 text-neutral-700 dark:text-neutral-300">
                Nama Panggilan Anda:
              </label>
              <input
                id="init-member-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mama / Nenek / Sitter Budi"
                required
                autoFocus
                className="w-full p-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="init-member-role" className="font-bold block mb-1.5 text-neutral-700 dark:text-neutral-300">
                Peran / Hubungan:
              </label>
              <select
                id="init-member-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Keluarga' | 'Tamu')}
                className="w-full p-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer"
              >
                <option value="Keluarga">Keluarga</option>
                <option value="Tamu">Tamu</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1.5 text-neutral-700 dark:text-neutral-300">
                Warna Avatar:
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {avatarColors.map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => setAvatarColor(c.val)}
                    className={`w-8 h-8 rounded-full ${c.val} transition-transform flex items-center justify-center text-white ${
                      avatarColor === c.val ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {avatarColor === c.val && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Simpan & Masuk
              </button>

              {eligibleMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="w-full py-2.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold"
                >
                  ← Kembali ke Pilihan Nama
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* List of eligible members */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-0.5">
              {eligibleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                    darkMode
                      ? 'bg-neutral-800/80 border-neutral-700 hover:border-amber-500/60 hover:bg-neutral-800'
                      : 'bg-neutral-50 border-neutral-200/90 hover:border-amber-500/60 hover:bg-amber-50/50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl ${member.avatarColor} text-white font-bold flex items-center justify-center text-base shadow-sm`}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="text-center min-w-0 w-full">
                    <div className="font-bold text-sm truncate">{member.name}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 opacity-80">
                      {member.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Option if user name is not yet in the list */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Nama Saya Belum Ada / Tambah Anggota
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
