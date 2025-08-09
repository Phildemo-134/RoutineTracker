import type { Habit, HabitLog, Streak } from '@/types/habit';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

const USERS = 'users';
const HABITS = 'habits';
const LOGS = 'habitLogs';

function requireUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Utilisateur non authentifié');
  return uid;
}

function userCollection(path: string) {
  const uid = requireUserId();
  return collection(db, `${USERS}/${uid}/${path}`);
}

function userDoc(path: string, id: string) {
  const uid = requireUserId();
  return doc(db, `${USERS}/${uid}/${path}/${id}`);
}

export async function createHabit(input: Omit<Habit, 'id' | 'createdAt'>): Promise<string> {
  const colRef = userCollection(HABITS);
  const docRef = await addDoc(colRef, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateHabit(id: string, data: Partial<Habit>): Promise<void> {
  const docRef = userDoc(HABITS, id);
  await setDoc(docRef, data, { merge: true });
}

export async function getHabit(id: string): Promise<Habit | null> {
  const snap = await getDoc(userDoc(HABITS, id));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return normalizeHabit(snap.id, data);
}

export async function listHabits(): Promise<Habit[]> {
  const qy = query(userCollection(HABITS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => normalizeHabit(d.id, d.data()));
}

export async function deleteHabit(id: string): Promise<void> {
  const ref = userDoc(HABITS, id);
  await deleteDoc(ref);
}

export function subscribeHabits(onChange: (habits: Habit[]) => void): () => void {
  const qy = query(userCollection(HABITS), orderBy('createdAt', 'desc'));
  return onSnapshot(qy, (snap) => {
    onChange(snap.docs.map((d) => normalizeHabit(d.id, d.data())));
  });
}

export async function logHabit(
  habitId: string,
  date: string,
  params: { completed?: boolean; count?: number }
): Promise<string> {
  const colRef = userCollection(LOGS);
  const payload: any = {
    habitId,
    date,
    completed: params.completed ?? false,
    createdAt: serverTimestamp(),
  };
  if (typeof params.count === 'number') {
    payload.count = params.count;
  }
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function listHabitLogsByDate(habitId: string): Promise<HabitLog[]> {
  const qy = query(userCollection(LOGS), where('habitId', '==', habitId));
  const snap = await getDocs(qy);
  const items = snap.docs.map((d) => normalizeLog(d.id, d.data()));
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function subscribeHabitLogsForDate(date: string, onChange: (logs: HabitLog[]) => void): () => void {
  const qy = query(userCollection(LOGS), where('date', '==', date));
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => normalizeLog(d.id, d.data()));
    onChange(items);
  });
}

export function computeStreak(logs: HabitLog[]): Streak {
  // Expect logs sorted desc by date (YYYY-MM-DD)
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  const today = new Date();
  let current = 0;
  let best = 0;
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const doneSet = new Set(sorted.filter((l) => l.completed).map((l) => l.date));
  while (true) {
    const key = toYMD(cursor);
    if (doneSet.has(key)) {
      current += 1;
      best = Math.max(best, current);
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // compute best overall (approximate)
  let run = 0;
  let prev: Date | null = null;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const d = fromYMD(sorted[i].date);
    if (!sorted[i].completed) {
      run = 0;
      prev = null;
      continue;
    }
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    prev = d;
    best = Math.max(best, run);
  }

  return { current, best };
}

function normalizeHabit(id: string, data: any): Habit {
  return {
    id,
    name: data.name,
    categoryId: data.categoryId ?? null,
    frequency: data.frequency,
    quantity: data.quantity,
    createdAt: toMillis(data.createdAt),
    archived: data.archived ?? false,
  } as Habit;
}

function normalizeLog(id: string, data: any): HabitLog {
  return {
    id,
    habitId: data.habitId,
    date: data.date,
    count: data.count,
    completed: data.completed ?? false,
    createdAt: toMillis(data.createdAt),
  } as HabitLog;
}

function toMillis(ts: any): number {
  if (!ts) return Date.now();
  if (typeof ts === 'number') return ts;
  if (ts instanceof Date) return ts.getTime();
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  return Date.now();
}

function toYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromYMD(s: string): Date {
  const [y, m, d] = s.split('-').map((v) => Number(v));
  return new Date(Date.UTC(y, m - 1, d));
}