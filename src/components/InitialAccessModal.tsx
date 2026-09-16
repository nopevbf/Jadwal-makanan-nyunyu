import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  UserPlus,
  Heart,
  Sparkles,
  Check,
  Cloud,
  CloudOff,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { FamilyMember } from '../types';

interface InitialAccessModalProps {
  isOpen: boolean;
  familyMembers: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember;
  darkMode: boolean;
  currentUser?: any;
  onLoginWithGoogle: () => Promise<boolean>;
  onAssignImpostor: () => void;
}

export const InitialAccessModal: React.FC<InitialAccessModalProps> = ({
  isOpen,
  familyMembers,
  onSelectMember,
  onAddMember,
  darkMode,
  currentUser,
  onLoginWithGoogle,
  onAssignImpostor,
}) => {
  if (!isOpen) return null;

  // Exclude "Pemilik Utama" / "Ka Aji" completely from initial access modal
  const eligibleMembers = familyMembers.filter(
    (m) => m.role !== 'Pemilik Utama' && m.name !== 'Ka Aji' && m.id !== 'ka-aji'
  );

  const [step, setStep] = useState<'select' | 'require_login' | 'impostor_notice'>('select');
  const [pendingSelection, setPendingSelection] = useState<
    | { type: 'select'; member: FamilyMember }
    | { type: 'add'; name: string; role: 'Keluarga' | 'Tamu'; avatarColor: string }
    | null
  >(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [hasManuallySwitchedToAdd, setHasManuallySwitchedToAdd] = useState<boolean>(false);
  const isAddingNew = eligibleMembers.length === 0 || hasManuallySwitchedToAdd;
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Keluarga' | 'Tamu'>('Keluarga');
  const [avatarColor, setAvatarColor] = useState('bg-amber-500');

  // Automatically show the member list whenever members are detected from cloud or local storage,
  // unless user is actively typing a new name into the form
  useEffect(() => {
    if (eligibleMembers.length > 0 && !name.trim()) {
      setHasManuallySwitchedToAdd(false);
    }
  }, [eligibleMembers.length, isOpen]);

  const avatarColors = [
    { label: 'Amber', val: 'bg-amber-500' },
    { label: 'Emerald', val: 'bg-emerald-500' },
    { label: 'Indigo', val: 'bg-indigo-500' },
    { label: 'Sky', val: 'bg-sky-500' },
    { label: 'Rose', val: 'bg-rose-500' },
    { label: 'Purple', val: 'bg-purple-500' },
  ];

  // If user signs in externally while modal is on require_login step, proceed automatically
  useEffect(() => {
    if (currentUser && step === 'require_login' && pendingSelection) {
      if (pendingSelection.type === 'select') {
        onSelectMember(pendingSelection.member);
      } else if (pendingSelection.type === 'add') {
        const newMember = onAddMember({
          name: pendingSelection.name,
          role: pendingSelection.role,
          avatarColor: pendingSelection.avatarColor,
        });
        onSelectMember(newMember);
      }
    }
  }, [currentUser, step, pendingSelection, onSelectMember, onAddMember]);

  // When user clicks an existing member
  const handleMemberClick = (member: FamilyMember) => {
    if (!currentUser) {
      setPendingSelection({ type: 'select', member });
      setStep('require_login');
      return;
    }
    onSelectMember(member);
  };

  // When user submits new member creation form
  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!currentUser) {
      setPendingSelection({
        type: 'add',
        name: name.trim(),
        role,
        avatarColor,
      });
      setStep('require_login');
      return;
    }

    const newMember = onAddMember({
      name: name.trim(),
      role,
      avatarColor,
    });
    onSelectMember(newMember);
  };

  // Handle Google Login attempt
  const handleDoLogin = async () => {
    setIsLoggingIn(true);
    try {
      const success = await onLoginWithGoogle();
      if (success) {
        if (pendingSelection?.type === 'select') {
          onSelectMember(pendingSelection.member);
        } else if (pendingSelection?.type === 'add') {
          const newMember = onAddMember({
            name: pendingSelection.name,
            role: pendingSelection.role,
            avatarColor: pendingSelection.avatarColor,
          });
          onSelectMember(newMember);
        }
      } else {
        // User cancelled popup or login failed -> show Impostor notice modal
        setStep('impostor_notice');
      }
    } catch {
      setStep('impostor_notice');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle user deliberately canceling login requirement
  const handleCancelLogin = () => {
    setStep('impostor_notice');
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
        {/* Step 1: Default Member Selection or Add Member Form */}
        {step === 'select' && (
          <>
            {/* Cloud Sync Warning Banner if Not Logged In */}
            {!currentUser && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-left text-xs">
                <CloudOff className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-700 dark:text-amber-300">
                    Sinkronisasi Cloud Belum Terhubung
                  </div>
                  <div className="opacity-80 text-[11px] mt-0.5">
                    Saat memilih atau membuat anggota, Anda wajib login terlebih dahulu agar data tersimpan aman.
                  </div>
                </div>
              </div>
            )}

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
                  ? 'Silakan isi nama panggilan, peran / hubungan, dan warna avatar terlebih dahulu.'
                  : 'Pilih nama profil Anda sebelum membuka jadwal makan dan obat Nyunyu'}
              </p>
            </div>

            {/* Form Add Member (Shown if no members exist or user clicked add) */}
            {isAddingNew || eligibleMembers.length === 0 ? (
              <form onSubmit={handleAddNewMemberSubmit} className="space-y-4 text-xs sm:text-sm">
                {eligibleMembers.length === 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Belum ada anggota terdaftar. Silakan isi nama panggilan, peran / hubungan, dan warna terlebih dahulu.</span>
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
                      onClick={() => setHasManuallySwitchedToAdd(false)}
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
                      onClick={() => handleMemberClick(member)}
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
                    onClick={() => setHasManuallySwitchedToAdd(true)}
                    className="w-full py-3 px-4 rounded-2xl border border-dashed border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Nama Saya Belum Ada / Tambah Anggota
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Mandatory Cloud Login Requirement */}
        {step === 'require_login' && (
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
              <Cloud className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>

            <div>
              <h3 className="font-bold font-display text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                Wajib Masuk Akun Google
              </h3>
              <p className="text-xs opacity-75 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Sistem mendeteksi Anda belum melakukan sinkronisasi cloud. Untuk memilih atau menambahkan anggota keluarga, Anda <strong>wajib login</strong> terlebih dahulu.
              </p>
            </div>

            {pendingSelection?.type === 'select' && (
              <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center justify-center gap-2">
                <span className="opacity-60">Akses yang dipilih:</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {pendingSelection.member.name} ({pendingSelection.member.role})
                </span>
              </div>
            )}

            {pendingSelection?.type === 'add' && (
              <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center justify-center gap-2">
                <span className="opacity-60">Anggota baru:</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {pendingSelection.name} ({pendingSelection.role})
                </span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDoLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isLoggingIn ? 'Menghubungkan Akun...' : 'Masuk dengan Akun Google'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelLogin}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Batal / Tidak Mau Login
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Informative Modal when User Cancels Cloud Login */}
        {step === 'impostor_notice' && (
          <div className="text-center py-2 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>

            <div>
              <h3 className="font-bold font-display text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                Akses Dialihkan ke Tamu
              </h3>
              <p className="text-xs opacity-75 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Anda membatalkan sinkronisasi cloud. Sebagai gantinya, akses Anda disetel sebagai <strong>Tamu</strong> dengan profil <strong>Impostor</strong>.
              </p>
            </div>

            {/* Profile Card Preview for Impostor */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-left space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
                  I
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Impostor
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      Peran: Tamu
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      Warna: Biru
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-blue-700 dark:text-blue-300 pt-2 border-t border-blue-500/20 leading-relaxed">
                ⚠️ Pengalihan akses ini otomatis dicatat ke dalam riwayat <em>"Aktivitas Terkini Keluarga untuk Nyunyu"</em>.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onAssignImpostor}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                Mengerti & Masuk Sebagai Impostor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
