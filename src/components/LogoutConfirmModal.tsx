import React from 'react';
import { CloudOff, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  darkMode: boolean;
  userEmailOrName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  darkMode,
  userEmailOrName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm overflow-hidden animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-neutral-200 dark:border-neutral-700 shadow-2xl transition-all flex flex-col p-5 sm:p-6 ${
          darkMode ? 'bg-neutral-850 text-neutral-100' : 'bg-white text-neutral-800'
        }`}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto -mt-1 mb-3 sm:hidden" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <CloudOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base sm:text-lg leading-tight">
                Putuskan Sinkronisasi Cloud?
              </h3>
              {userEmailOrName && (
                <p className="text-xs opacity-60 truncate max-w-[220px]">
                  Akun: {userEmailOrName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100 active:scale-95 shrink-0 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Warning Card */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border mb-5 text-xs space-y-2.5 leading-relaxed ${
            darkMode
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-200/90'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Pemberitahuan Sinkronisasi Keluarga</span>
          </div>
          <p>
            Jika Anda keluar, <strong>data di HP ini tidak akan tersinkron lagi dengan anggota keluarga lain</strong> secara otomatis.
          </p>
          <ul className="list-disc pl-4 space-y-1 opacity-90">
            <li>Jadwal makan yang Anda centang tidak akan langsung terupdate di HP anggota keluarga lainnya.</li>
            <li>Catatan timbangan berat badan atau obat baru tidak akan saling terhubung.</li>
            <li>Data yang sudah pernah tersimpan sebelumnya tetap aman di cloud dan bisa dihubungkan kembali kapan saja.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs border transition-all ${
              darkMode
                ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200'
                : 'border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            Batal (Tetap Terhubung)
          </button>
          <button
            type="button"
            id="btn-confirm-logout-cloud"
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 active:scale-98 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>Ya, Putuskan Sinkron</span>
          </button>
        </div>
      </div>
    </div>
  );
};
