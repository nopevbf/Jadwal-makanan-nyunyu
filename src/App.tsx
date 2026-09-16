import React, { useState, useEffect, useRef } from 'react';
import {
  initialCatProfile,
  initialMealSchedules,
  initialFeedingLogs,
  initialWeightLogs,
  initialMedications,
  initialHealthRecords,
  initialFamilyMembers,
} from './data/defaultData';
import {
  CatProfile,
  MealScheduleItem,
  DailyFeedingRecord,
  FeedingLogEntry,
  WeightRecord,
  MedicationScheduleItem,
  HealthRecordEntry,
  FamilyMember,
} from './types';
import { Navbar } from './components/Navbar';
import { MealScheduleView } from './components/MealScheduleView';
import { WeightNutritionStats } from './components/WeightNutritionStats';
import { MedicationCalendar } from './components/MedicationCalendar';
import { MedicalRecordsView } from './components/MedicalRecordsView';
import { FamilyShareModal } from './components/FamilyShareModal';
import { CatProfileModal } from './components/CatProfileModal';
import { MedicalExportModal } from './components/MedicalExportModal';
import { playCatBellChime } from './utils/audio';

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nyunyu_dark_mode');
    return saved !== null ? saved === 'true' : true; // Default dark mode to match user's card aesthetic
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'schedule' | 'stats' | 'medication' | 'medical' | 'family'>('schedule');

  // Cat Profile
  const [profile, setProfile] = useState<CatProfile>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_cat_profile');
      return saved ? JSON.parse(saved) : initialCatProfile;
    } catch {
      return initialCatProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_cat_profile', JSON.stringify(profile));
  }, [profile]);

  // Meal Schedules
  const [schedules, setSchedules] = useState<MealScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_meal_schedules');
      return saved ? JSON.parse(saved) : initialMealSchedules;
    } catch {
      return initialMealSchedules;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_meal_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Today's feeding record (keyed by date string YYYY-MM-DD)
  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const [todayRecords, setTodayRecords] = useState<Record<string, DailyFeedingRecord>>(() => {
    try {
      const key = `nyunyu_feeding_${getTodayKey()}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      // Default: check if initialFeedingLogs has any for today
      const todayDate = getTodayKey();
      const logsToday = initialFeedingLogs.filter((l) => l.date === todayDate);
      const initialMap: Record<string, DailyFeedingRecord> = {};
      logsToday.forEach((l) => {
        initialMap[l.mealId] = {
          mealId: l.mealId as any,
          isDone: true,
          doneTime: l.time,
          fedBy: l.fedBy,
          actualDryG: l.dryFoodG,
          actualWetG: l.wetFoodG,
          mood: l.catMood,
          note: l.note,
        };
      });
      return initialMap;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const key = `nyunyu_feeding_${getTodayKey()}`;
    localStorage.setItem(key, JSON.stringify(todayRecords));
  }, [todayRecords]);

  // Feeding logs history
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_feeding_logs');
      return saved ? JSON.parse(saved) : initialFeedingLogs;
    } catch {
      return initialFeedingLogs;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_feeding_logs', JSON.stringify(feedingLogs));
  }, [feedingLogs]);

  // Monthly weight logs
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_weight_logs');
      return saved ? JSON.parse(saved) : initialWeightLogs;
    } catch {
      return initialWeightLogs;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_weight_logs', JSON.stringify(weightLogs));
    // update current weight on profile
    if (weightLogs.length > 0) {
      const latest = weightLogs[weightLogs.length - 1];
      if (latest && latest.weightKg !== profile.weightKg) {
        setProfile((prev) => ({ ...prev, weightKg: latest.weightKg }));
      }
    }
  }, [weightLogs]);

  // Medications
  const [medications, setMedications] = useState<MedicationScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_medications');
      return saved ? JSON.parse(saved) : initialMedications;
    } catch {
      return initialMedications;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_medications', JSON.stringify(medications));
  }, [medications]);

  // Medical & Clinic Records
  const [healthRecords, setHealthRecords] = useState<HealthRecordEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_health_records');
      return saved ? JSON.parse(saved) : initialHealthRecords;
    } catch {
      return initialHealthRecords;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_health_records', JSON.stringify(healthRecords));
  }, [healthRecords]);

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('nyunyu_family_members');
      return saved ? JSON.parse(saved) : initialFamilyMembers;
    } catch {
      return initialFamilyMembers;
    }
  });

  useEffect(() => {
    localStorage.setItem('nyunyu_family_members', JSON.stringify(familyMembers));
  }, [familyMembers]);

  const [activeMember, setActiveMember] = useState<FamilyMember>(() => {
    return familyMembers[0] || initialFamilyMembers[0];
  });

  // Sound and notification settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          playCatBellChime();
          new Notification('🔔 Notifikasi Nyunyu Diaktifkan!', {
            body: 'Pengingat otomatis akan muncul setiap jadwal makan, obat cacing, & obat kutu tiba.',
          });
        }
      } catch (err) {
        console.warn('Could not request notification permission', err);
      }
    }
  };

  // Automated background reminder checker
  const lastAlertMinuteRef = useRef<string>('');
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (lastAlertMinuteRef.current === currentTimeStr) return;

      schedules.forEach((meal) => {
        if (meal.time === currentTimeStr && meal.reminderEnabled) {
          const isDone = todayRecords[meal.id]?.isDone;
          if (!isDone) {
            lastAlertMinuteRef.current = currentTimeStr;
            if (soundEnabled) {
              playCatBellChime();
            }
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`🐾 Waktunya Makan ${meal.title}, Nyunyu!`, {
                body: `Porsi: Dry ${meal.dryFoodRange} + Wet ${meal.wetFoodRange}. Buka aplikasi untuk mencatat.`,
                icon: '/favicon.ico',
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkSchedule, 20000); // Check every 20s
    return () => clearInterval(interval);
  }, [schedules, todayRecords, soundEnabled]);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Meal toggle handler
  const handleToggleMealStatus = (
    mealId: string,
    customDetails?: { actualDry?: number; actualWet?: number; mood?: any; note?: string }
  ) => {
    const isCurrentlyDone = todayRecords[mealId]?.isDone;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayStr = getTodayKey();

    const meal = schedules.find((s) => s.id === mealId);
    const mealTitle = meal ? meal.title : mealId;

    if (isCurrentlyDone) {
      // Uncheck
      const updated = { ...todayRecords };
      delete updated[mealId];
      setTodayRecords(updated);
    } else {
      // Mark done
      const actualDry = customDetails?.actualDry ?? meal?.dryFoodG ?? 16;
      const actualWet = customDetails?.actualWet ?? meal?.wetFoodG ?? 18;
      const mood = customDetails?.mood ?? 'lahap';

      setTodayRecords((prev) => ({
        ...prev,
        [mealId]: {
          mealId: mealId as any,
          isDone: true,
          doneTime: timeStr,
          fedBy: activeMember.name,
          actualDryG: actualDry,
          actualWetG: actualWet,
          mood,
          note: customDetails?.note,
        },
      }));

      // Add to persistent feeding history log
      const newEntry: FeedingLogEntry = {
        id: `fl-${Date.now()}`,
        date: todayStr,
        time: timeStr,
        mealId: mealId as any,
        mealTitle,
        dryFoodG: actualDry,
        wetFoodG: actualWet,
        fedBy: activeMember.name,
        catMood: mood,
        note: customDetails?.note,
      };

      setFeedingLogs((prev) => [newEntry, ...prev]);
    }
  };

  const handleAddFeedingLog = (entry: Omit<FeedingLogEntry, 'id'>) => {
    const newLog: FeedingLogEntry = {
      ...entry,
      id: `fl-${Date.now()}`,
    };
    setFeedingLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteFeedingLog = (id: string) => {
    setFeedingLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddWeightLog = (record: Omit<WeightRecord, 'id'>) => {
    const newRecord: WeightRecord = {
      ...record,
      id: `w-${Date.now()}`,
    };
    setWeightLogs((prev) => [...prev, newRecord]);
  };

  const handleDeleteWeightLog = (id: string) => {
    setWeightLogs((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdateMedication = (updated: MedicationScheduleItem) => {
    setMedications((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddMedication = (newMed: Omit<MedicationScheduleItem, 'id' | 'history'>) => {
    const item: MedicationScheduleItem = {
      ...newMed,
      id: `med-${Date.now()}`,
      history: [],
    };
    setMedications((prev) => [...prev, item]);
  };

  const handleAddHealthRecord = (record: Omit<HealthRecordEntry, 'id'>) => {
    const newRec: HealthRecordEntry = {
      ...record,
      id: `hr-${Date.now()}`,
    };
    setHealthRecords((prev) => [newRec, ...prev]);
  };

  const handleDeleteHealthRecord = (id: string) => {
    setHealthRecords((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddFamilyMember = (newMem: Omit<FamilyMember, 'id'>) => {
    const item: FamilyMember = {
      ...newMem,
      id: `fam-${Date.now()}`,
    };
    setFamilyMembers((prev) => [...prev, item]);
  };

  const handleDeleteFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) return;
    const remaining = familyMembers.filter((m) => m.id !== id);
    setFamilyMembers(remaining);
    if (activeMember.id === id && remaining.length > 0) {
      setActiveMember(remaining[0]);
    }
  };

  // Full app data backup exporter & importer
  const handleExportAllData = () => {
    const data = {
      profile,
      schedules,
      todayRecords,
      feedingLogs,
      weightLogs,
      medications,
      healthRecords,
      familyMembers,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cadangan_Data_Kucing_Nyunyu_${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (parsed.profile) setProfile(parsed.profile);
    if (parsed.schedules) setSchedules(parsed.schedules);
    if (parsed.todayRecords) setTodayRecords(parsed.todayRecords);
    if (parsed.feedingLogs) setFeedingLogs(parsed.feedingLogs);
    if (parsed.weightLogs) setWeightLogs(parsed.weightLogs);
    if (parsed.medications) setMedications(parsed.medications);
    if (parsed.healthRecords) setHealthRecords(parsed.healthRecords);
    if (parsed.familyMembers) setFamilyMembers(parsed.familyMembers);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-[#121214] text-neutral-100' : 'bg-[#faf9f6] text-neutral-900'
    }`}>
      
      {/* Primary Navigation Bar */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeMember={activeMember}
        familyMembers={familyMembers}
        setActiveMember={setActiveMember}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={requestNotificationPermission}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main App Content Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        
        {/* Tab 1: Jadwal & Pemberian Makan Interaktif */}
        {activeTab === 'schedule' && (
          <MealScheduleView
            profile={profile}
            schedules={schedules}
            onUpdateSchedules={setSchedules}
            todayRecords={todayRecords}
            onToggleMealStatus={handleToggleMealStatus}
            feedingLogs={feedingLogs}
            onAddFeedingLog={handleAddFeedingLog}
            onDeleteFeedingLog={handleDeleteFeedingLog}
            activeMember={activeMember}
            darkMode={darkMode}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* Tab 2: Dasbor Statistik Berat Badan & Nutrisi */}
        {activeTab === 'stats' && (
          <WeightNutritionStats
            profile={profile}
            weightLogs={weightLogs}
            onAddWeightLog={handleAddWeightLog}
            onDeleteWeightLog={handleDeleteWeightLog}
            feedingLogs={feedingLogs}
            darkMode={darkMode}
          />
        )}

        {/* Tab 3: Jadwal Obat Cacing, Obat Kutu & Kalender */}
        {activeTab === 'medication' && (
          <MedicationCalendar
            medications={medications}
            onUpdateMedication={handleUpdateMedication}
            onAddMedication={handleAddMedication}
            activeMember={activeMember}
            darkMode={darkMode}
          />
        )}

        {/* Tab 4: Pencatatan Rekam Medis & Laporan Dokter Hewan */}
        {activeTab === 'medical' && (
          <MedicalRecordsView
            records={healthRecords}
            onAddRecord={handleAddHealthRecord}
            onDeleteRecord={handleDeleteHealthRecord}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            profile={profile}
            darkMode={darkMode}
          />
        )}

        {/* Tab 5: Berbagi Akses Anggota Keluarga */}
        {activeTab === 'family' && (
          <FamilyShareModal
            familyMembers={familyMembers}
            activeMember={activeMember}
            onSelectMember={setActiveMember}
            onAddMember={handleAddFamilyMember}
            onDeleteMember={handleDeleteFamilyMember}
            recentLogs={feedingLogs}
            darkMode={darkMode}
            onExportAllData={handleExportAllData}
            onImportData={handleImportData}
          />
        )}

      </main>

      {/* Global Modals */}
      <CatProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        schedules={schedules}
        onUpdateSchedules={setSchedules}
        darkMode={darkMode}
      />

      <MedicalExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        healthRecords={healthRecords}
        medications={medications}
        weightLogs={weightLogs}
        feedingLogs={feedingLogs}
        darkMode={darkMode}
      />

    </div>
  );
}
