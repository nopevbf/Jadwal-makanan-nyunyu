import React, { useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Volume2,
  Users,
  Calendar,
  Activity,
  FileText,
  Clock,
  ChevronDown,
  Cloud,
  Check,
  LogIn
} from 'lucide-react';
import { CatProfile, FamilyMember } from '../types';
import { playCatBellChime } from '../utils/audio';
import { User } from '../firebase';

interface NavbarProps {
  profile: CatProfile;
  activeTab: 'schedule' | 'stats' | 'medication' | 'medical' | 'family';
  setActiveTab: (tab: 'schedule' | 'stats' | 'medication' | 'medical' | 'family') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeMember: FamilyMember;
  familyMembers: FamilyMember[];
  setActiveMember: (m: FamilyMember) => void;
  onOpenProfileModal: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  currentUser?: User | null;
  isCloudConnected: boolean;
  onLoginWithGoogle: () => void;
  onLogoutUser: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  activeMember,
  familyMembers,
  setActiveMember,
  onOpenProfileModal,
  notificationPermission,
  onRequestNotificationPermission,
  soundEnabled,
  setSoundEnabled,
  currentUser,
  isCloudConnected,
  onLoginWithGoogle,
  onLogoutUser,
}) => {
  const [memberDropdownOpen, setMemberDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMemberDropdownOpen(false);
      }
    };
    if (memberDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [memberDropdownOpen]);

  const handleTestChime = () => {
    playCatBellChime();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Waktunya Makan, Nyunyu!', {
        body: 'Porsi seimbang dry food & wet food telah siap disajikan.',
        icon: '/favicon.ico',
      });
    }
  };

  const navItems = [
    { id: 'schedule' as const, label: 'Jadwal Makan', shortLabel: 'Makan', icon: Clock },
    { id: 'stats' as const, label: 'Berat & Nutrisi', shortLabel: 'Nutrisi', icon: Activity },
    { id: 'medication' as const, label: 'Obat Cacing & Kutu', shortLabel: 'Obat', icon: Calendar },
    { id: 'medical' as const, label: 'Rekam Medis Dokter', shortLabel: 'Medis', icon: FileText },
    { id: 'family' as const, label: 'Akses Keluarga', shortLabel: 'Keluarga', icon: Users },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode 
          ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100' 
          : 'bg-white/95 border-amber-100 text-neutral-800'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            
            {/* Brand & Cat Profile Pill (Mobile Compact) */}
            <button
              onClick={onOpenProfileModal}
              id="btn-cat-profile-header"
              className={`flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-2xl transition-all cursor-pointer text-left border shrink-0 max-w-[55%] sm:max-w-none ${
                darkMode
                  ? 'bg-neutral-800/90 hover:bg-neutral-750 border-neutral-700/80'
                  : 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-200/80'
              }`}
              title="Klik untuk edit profil & target nutrisi Nyunyu"
            >
              <div className="relative shrink-0">
                <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Cat">🐱</span>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-bold text-xs sm:text-sm tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
                    {profile.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-300 whitespace-nowrap">
                    {profile.ageMonths} bln
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] opacity-70 flex items-center gap-1 whitespace-nowrap overflow-hidden">
                  <span>±{profile.weightKg.toFixed(1)} kg</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{profile.foodPreference === 'more_dry' ? 'Dry > Wet' : 'Seimbang'}</span>
                </div>
              </div>
            </button>

            {/* Controls: Family Member Switcher, Sound/Notification, Dark Mode */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Active Family Member Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="btn-family-member-dropdown"
                  onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    darkMode
                      ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                  }`}
                  title="Pilih siapa yang sedang memberi makan saat ini"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeMember.avatarColor}`} />
                  <span className="hidden md:inline opacity-70 text-[11px]">Pemberi:</span>
                  <span className="font-semibold whitespace-nowrap" title={activeMember.name}>
                    {activeMember.name.slice(0, 6)}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 shrink-0" />
                </button>

                {memberDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-1.5 w-44 rounded-xl border shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 ${
                      darkMode
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                        : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider opacity-60">
                      Anggota Keluarga
                    </div>
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setActiveMember(member);
                          setMemberDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-amber-500/10 ${
                          activeMember.id === member.id ? 'font-bold text-amber-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${member.avatarColor}`} />
                          <span className="truncate">{member.name}</span>
                        </div>
                        <span className="text-[10px] opacity-60 shrink-0">{member.role}</span>
                      </button>
                    ))}
                    <div className="border-t my-1 opacity-20" />
                    <button
                      onClick={() => {
                        setMemberDropdownOpen(false);
                        setActiveTab('family');
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 hover:bg-amber-500/10"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Kelola Anggota...
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Permission & Bell */}
              <button
                id="btn-notification-toggle"
                onClick={() => {
                  if (notificationPermission !== 'granted') {
                    onRequestNotificationPermission();
                  } else {
                    handleTestChime();
                  }
                }}
                className={`w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-xs flex items-center justify-center gap-1.5 ${
                  notificationPermission === 'granted'
                    ? darkMode
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/40'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : darkMode
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-neutral-800'
                }`}
                title={
                  notificationPermission === 'granted'
                    ? 'Pengingat Aktif. Klik untuk tes bunyi lonceng.'
                    : 'Aktifkan notifikasi otomatis'
                }
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden md:inline text-xs font-medium">
                  {notificationPermission === 'granted' ? 'Tes Notif' : 'Aktifkan Notif'}
                </span>
              </button>

              {/* Audio sound toggle */}
              <button
                id="btn-sound-toggle"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center ${
                  soundEnabled
                    ? darkMode
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-750'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}
                title={soundEnabled ? 'Suara Lonceng Aktif' : 'Suara Dimatikan'}
              >
                <Volume2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!soundEnabled ? 'opacity-40' : ''}`} />
              </button>

              {/* Cloud Sync Button (Click to login, or click to logout) */}
              <button
                id="btn-cloud-sync-toggle"
                onClick={currentUser ? onLogoutUser : onLoginWithGoogle}
                className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                  currentUser
                    ? darkMode
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                    : darkMode
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
                title={
                  currentUser
                    ? 'Cloud Real-time Aktif (Tersambung). Klik untuk opsi keluar.'
                    : 'Hubungkan akun Google agar data tersinkron otomatis antar HP'
                }
              >
                {currentUser ? (
                  <Cloud className="w-4 h-4 shrink-0" />
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="hidden sm:inline">Sinkron Cloud</span>
                  </>
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                id="btn-dark-mode-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center ${
                  darkMode
                    ? 'bg-neutral-800 border-neutral-700 text-amber-300 hover:bg-neutral-750'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
                title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Header Tab Strip - Hidden on mobile, visible on tablet/desktop) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 pb-0.5 text-xs sm:text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-sm'
                      : darkMode
                        ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for smartphone screens) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t backdrop-blur-xl shadow-lg transition-colors pb-[env(safe-area-inset-bottom)] ${
        darkMode
          ? 'bg-neutral-900/95 border-neutral-800 text-neutral-300'
          : 'bg-white/95 border-neutral-200 text-neutral-700'
      }`}>
        <div className="grid grid-cols-5 px-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-500 font-bold'
                    : 'opacity-60 hover:opacity-100 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-500/10' : ''
                }`}>
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
