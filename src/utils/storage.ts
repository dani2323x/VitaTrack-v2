import { DayLog, CustomRecurrentHabit } from '../types';
import { INITIAL_SEED_LOGS } from '../data/mockSeed';

const STORAGE_KEY = 'vitatrack_logs_v1';
const RECURRENT_HABITS_KEY = 'vitatrack_recurrent_habits_v1';

const DEFAULT_CUSTOM_HABITS: CustomRecurrentHabit[] = [
  {
    id: 'habit_creatine',
    name: 'Tomar creatina monohidrato (5g)',
    category: 'healthy',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'habit_reading',
    name: 'Lectura sin pantallas (15 min)',
    category: 'healthy',
    createdAt: Date.now() - 5 * 86400000,
  },
];

export function getStoredLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_LOGS));
      return INITIAL_SEED_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_LOGS;
  } catch (e) {
    console.error('Error loading logs from localStorage:', e);
    return INITIAL_SEED_LOGS;
  }
}

export function saveStoredLogs(logs: DayLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs to localStorage:', e);
  }
}

export function addDayLog(newLog: DayLog): DayLog[] {
  const current = getStoredLogs();
  const existingIdx = current.findIndex((l) => l.date === newLog.date);
  let updated: DayLog[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newLog;
  } else {
    updated = [newLog, ...current];
  }
  saveStoredLogs(updated);
  return updated;
}

export function updateDayLog(updatedLog: DayLog): DayLog[] {
  const current = getStoredLogs();
  const idx = current.findIndex((l) => l.id === updatedLog.id);
  let updated: DayLog[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = updatedLog;
  } else {
    updated = [updatedLog, ...current];
  }
  saveStoredLogs(updated);
  return updated;
}

export function toggleMicroAction(logId: string): DayLog[] {
  const current = getStoredLogs();
  const updated = current.map((item) => {
    if (item.id === logId) {
      return { ...item, microActionCompleted: !item.microActionCompleted };
    }
    return item;
  });
  saveStoredLogs(updated);
  return updated;
}

// Custom Recurrent Habits Storage
export function getCustomHabits(): CustomRecurrentHabit[] {
  try {
    const raw = localStorage.getItem(RECURRENT_HABITS_KEY);
    if (!raw) {
      localStorage.setItem(RECURRENT_HABITS_KEY, JSON.stringify(DEFAULT_CUSTOM_HABITS));
      return DEFAULT_CUSTOM_HABITS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CUSTOM_HABITS;
  } catch (e) {
    console.error('Error loading recurrent habits:', e);
    return DEFAULT_CUSTOM_HABITS;
  }
}

export function saveCustomHabits(habits: CustomRecurrentHabit[]): void {
  try {
    localStorage.setItem(RECURRENT_HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving recurrent habits:', e);
  }
}

export function addCustomHabit(name: string, category: 'healthy' | 'unhealthy' = 'healthy'): CustomRecurrentHabit[] {
  const current = getCustomHabits();
  const newHabit: CustomRecurrentHabit = {
    id: `custom_${Date.now()}`,
    name: name.trim(),
    category,
    createdAt: Date.now(),
  };
  const updated = [...current, newHabit];
  saveCustomHabits(updated);
  return updated;
}

export function removeCustomHabit(id: string): CustomRecurrentHabit[] {
  const current = getCustomHabits();
  const updated = current.filter((h) => h.id !== id);
  saveCustomHabits(updated);
  return updated;
}
