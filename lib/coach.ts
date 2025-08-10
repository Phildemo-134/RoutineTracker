import type { Habit, HabitLog } from '@/types/habit';
import { computeStreak, listHabitLogsByDate, listHabits } from './habits';
import { getUserProfile, type UserProfile } from './userProfile';

function formatFrequency(habit: Habit): string {
  const f = habit.frequency;
  if (f.kind === 'daily') return 'quotidienne';
  if (f.kind === 'weekly') {
    const days = f.daysOfWeek
      .slice()
      .sort((a, b) => a - b)
      .map((d) => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d])
      .join(', ');
    return `hebdomadaire (${days})`;
  }
  return `tous les ${f.intervalDays} jours`;
}

function formatQuantity(habit: Habit): string {
  const q = habit.quantity;
  if (q.kind === 'boolean') return 'binaire (fait/pas fait)';
  return `quantitatif (objectif: ${q.target})`;
}

function countRecentCompletions(logs: HabitLog[], days: number): number {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  const cutoffKey = toYMD(cutoff);
  return logs.filter((l) => l.completed && l.date >= cutoffKey).length;
}

function toYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type CoachContext = {
  summary: string;
  userProfile: UserProfile | null;
};

export async function buildCoachContext(): Promise<CoachContext> {
  const habits = await listHabits();
  const userProfile = await getUserProfile();
  
  if (habits.length === 0) {
    return {
      summary: 'Aucune habitude configurée.',
      userProfile,
    };
  }

  const lines: string[] = [];
  
  if (userProfile) {
    lines.push(`Bonjour ${userProfile.name} ! Tu as ${userProfile.age} ans.`);
    lines.push('');
  }
  
  lines.push(`Tu as ${habits.length} habitude${habits.length > 1 ? 's' : ''} configurée${habits.length > 1 ? 's' : ''} :`);
  lines.push('');
  
  for (const habit of habits) {
    const logs = await listHabitLogsByDate(habit.id);
    const streak = computeStreak(logs);
    const recent7 = countRecentCompletions(logs, 7);
    const recent30 = countRecentCompletions(logs, 30);
    
    // Ajouter des détails sur les 7 derniers jours
    const last7Days = getLast7DaysCompletion(habit, logs);
    
    lines.push(
      `- ${habit.name} | ${formatFrequency(habit)} | ${formatQuantity(habit)} | série actuelle: ${streak.current}, meilleure série: ${streak.best}, faits sur 7j: ${recent7}, sur 30j: ${recent30}${habit.archived ? ' (archivée)' : ''}`
    );
    
    // Ajouter le détail des 7 derniers jours
    if (last7Days.length > 0) {
      lines.push(`  Derniers 7 jours: ${last7Days.join(', ')}`);
    }
  }

  return {
    summary: lines.join('\n'),
    userProfile,
  };
}

function getLast7DaysCompletion(habit: Habit, logs: HabitLog[]): string[] {
  const result: string[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);
    const dateKey = toYMD(date);
    
    const dayLogs = logs.filter(l => l.date === dateKey);
    if (dayLogs.length === 0) {
      result.push('❌');
    } else {
      const completed = dayLogs.some(l => l.completed);
      if (completed) {
        if (habit.quantity.kind === 'count') {
          const total = dayLogs.reduce((acc, l) => acc + (l.count ?? 0), 0);
          result.push(`✅(${total}/${habit.quantity.target})`);
        } else {
          result.push('✅');
        }
      } else {
        result.push('❌');
      }
    }
  }
  
  return result;
}

