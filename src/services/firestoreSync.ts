import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  CatProfile,
  MealScheduleItem,
  DailyFeedingRecord,
  FeedingLogEntry,
  WeightRecord,
  MedicationScheduleItem,
  HealthRecordEntry,
  FamilyMember,
} from '../types';

// Sync Profile
export function subscribeCatProfile(
  onUpdate: (profile: CatProfile) => void,
  onError?: (err: any) => void
) {
  const path = 'nyunyu_data/profile';
  return onSnapshot(
    doc(db, 'nyunyu_data', 'profile'),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as CatProfile);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveCatProfileToCloud(profile: CatProfile): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'nyunyu_data/profile';
  try {
    await setDoc(doc(db, 'nyunyu_data', 'profile'), {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Schedules
export function subscribeMealSchedules(
  onUpdate: (schedules: MealScheduleItem[]) => void,
  onError?: (err: any) => void
) {
  const path = 'nyunyu_data/schedules';
  return onSnapshot(
    doc(db, 'nyunyu_data', 'schedules'),
    (snap) => {
      if (snap.exists() && snap.data()?.items) {
        onUpdate(snap.data().items as MealScheduleItem[]);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveMealSchedulesToCloud(schedules: MealScheduleItem[]): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'nyunyu_data/schedules';
  try {
    await setDoc(doc(db, 'nyunyu_data', 'schedules'), {
      items: schedules,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Today Feeding
export function subscribeTodayFeeding(
  dateKey: string,
  onUpdate: (records: Record<string, DailyFeedingRecord>) => void,
  onError?: (err: any) => void
) {
  const path = `nyunyu_data/today_${dateKey}`;
  return onSnapshot(
    doc(db, 'nyunyu_data', `today_${dateKey}`),
    (snap) => {
      if (snap.exists() && snap.data()?.records) {
        onUpdate(snap.data().records as Record<string, DailyFeedingRecord>);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveTodayFeedingToCloud(
  dateKey: string,
  records: Record<string, DailyFeedingRecord>
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `nyunyu_data/today_${dateKey}`;
  try {
    await setDoc(doc(db, 'nyunyu_data', `today_${dateKey}`), {
      dateKey,
      records,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Feeding Logs
export function subscribeFeedingLogs(
  onUpdate: (logs: FeedingLogEntry[]) => void,
  onError?: (err: any) => void
) {
  const path = 'feeding_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const logs: FeedingLogEntry[] = [];
      snapshot.forEach((d) => {
        logs.push(d.data() as FeedingLogEntry);
      });
      // Sort newest date & time first
      logs.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
      onUpdate(logs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addFeedingLogToCloud(log: FeedingLogEntry): Promise<void> {
  if (!auth.currentUser) return;
  const path = `feeding_logs/${log.id}`;
  try {
    await setDoc(doc(db, 'feeding_logs', log.id), {
      ...log,
      createdAt: log.date + 'T' + log.time,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Weight Logs
export function subscribeWeightLogs(
  onUpdate: (logs: WeightRecord[]) => void,
  onError?: (err: any) => void
) {
  const path = 'weight_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const records: WeightRecord[] = [];
      snapshot.forEach((d) => {
        records.push(d.data() as WeightRecord);
      });
      records.sort((a, b) => a.date.localeCompare(b.date));
      onUpdate(records);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addWeightLogToCloud(log: WeightRecord): Promise<void> {
  if (!auth.currentUser) return;
  const path = `weight_logs/${log.id}`;
  try {
    await setDoc(doc(db, 'weight_logs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWeightLogFromCloud(id: string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `weight_logs/${id}`;
  try {
    await deleteDoc(doc(db, 'weight_logs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync Medications
export function subscribeMedications(
  onUpdate: (meds: MedicationScheduleItem[]) => void,
  onError?: (err: any) => void
) {
  const path = 'medication_items';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MedicationScheduleItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as MedicationScheduleItem);
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveMedicationToCloud(med: MedicationScheduleItem): Promise<void> {
  if (!auth.currentUser) return;
  const path = `medication_items/${med.id}`;
  try {
    await setDoc(doc(db, 'medication_items', med.id), med);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Health Records
export function subscribeHealthRecords(
  onUpdate: (records: HealthRecordEntry[]) => void,
  onError?: (err: any) => void
) {
  const path = 'medical_records';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: HealthRecordEntry[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as HealthRecordEntry);
      });
      items.sort((a, b) => b.date.localeCompare(a.date));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveHealthRecordToCloud(record: HealthRecordEntry): Promise<void> {
  if (!auth.currentUser) return;
  const path = `medical_records/${record.id}`;
  try {
    await setDoc(doc(db, 'medical_records', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHealthRecordFromCloud(id: string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `medical_records/${id}`;
  try {
    await deleteDoc(doc(db, 'medical_records', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync Family Members
export function subscribeFamilyMembers(
  onUpdate: (members: FamilyMember[]) => void,
  onError?: (err: any) => void
) {
  const path = 'family_members';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: FamilyMember[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as FamilyMember);
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveFamilyMemberToCloud(member: FamilyMember): Promise<void> {
  if (!auth.currentUser) {
    // Wait briefly if auth is currently initializing
    await new Promise((res) => setTimeout(res, 300));
    if (!auth.currentUser) return;
  }
  const path = `family_members/${member.id}`;
  try {
    await setDoc(doc(db, 'family_members', member.id), member);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFamilyMemberFromCloud(id: string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `family_members/${id}`;
  try {
    await deleteDoc(doc(db, 'family_members', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed initial default data into Firestore if empty
export async function seedInitialFirestoreDataIfEmpty(defaults: {
  profile: CatProfile;
  schedules: MealScheduleItem[];
  feedingLogs: FeedingLogEntry[];
  weightLogs: WeightRecord[];
  medications: MedicationScheduleItem[];
  healthRecords: HealthRecordEntry[];
  familyMembers: FamilyMember[];
}): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const membersSnap = await getDocs(collection(db, 'family_members'));
    if (membersSnap.empty) {
      // Seed initial data
      console.log('Seeding initial data to Firestore...');
      await saveCatProfileToCloud(defaults.profile);
      await saveMealSchedulesToCloud(defaults.schedules);

      for (const m of defaults.familyMembers) {
        await saveFamilyMemberToCloud(m);
      }
      for (const log of defaults.feedingLogs) {
        await addFeedingLogToCloud(log);
      }
      for (const w of defaults.weightLogs) {
        await addWeightLogToCloud(w);
      }
      for (const med of defaults.medications) {
        await saveMedicationToCloud(med);
      }
      for (const h of defaults.healthRecords) {
        await saveHealthRecordToCloud(h);
      }
    }
  } catch (err) {
    console.warn('Seeding check skipped or not authenticated yet:', err);
  }
}

// Clean old Firestore data is no longer active to prevent data loss on refresh
export async function cleanOldFirestoreData(): Promise<void> {
  // No-op: Data persistence is preserved across page refreshes
}

