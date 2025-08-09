export type HabitFrequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; daysOfWeek: number[] } // 0=Sun..6=Sat
  | { kind: 'custom'; intervalDays: number };

export type HabitQuantity =
  | { kind: 'boolean' } // done/not done
  | { kind: 'count'; target: number };

export type Habit = {
  id: string;
  name: string;
  categoryId?: string | null;
  frequency: HabitFrequency;
  quantity: HabitQuantity;
  createdAt: number; // ms since epoch
  archived?: boolean;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  count?: number; // for count habits
  completed: boolean; // for boolean habits or derived from count >= target
  createdAt: number;
};

export type Category = {
  id: string;
  name: string;
  createdAt: number;
};

export type Streak = {
  current: number;
  best: number;
};