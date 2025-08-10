import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { computeStreak, getHabit, listHabitLogsByDate, logHabit } from '@/lib/habits';
import type { Habit, HabitLog } from '@/types/habit';

function todayYMD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [increment, setIncrement] = useState('1');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const h = await getHabit(id);
      setHabit(h);
      const l = await listHabitLogsByDate(id);
      setLogs(l);
    })();
  }, [id]);

  const streak = useMemo(() => (logs ? computeStreak(logs) : { current: 0, best: 0 }), [logs]);
  const today = useMemo(() => todayYMD(), []);
  const hasDoneToday = useMemo(() => logs?.some((l) => l.date === today && l.completed) ?? false, [logs, today]);
  const todayCount = useMemo(() => {
    if (!logs) return 0;
    return logs.filter((l) => l.date === today).reduce((acc, l) => acc + (l.count ?? 0), 0);
  }, [logs, today]);

  const history = useMemo(() => {
    if (!logs) return [] as { date: string; completed: boolean; totalCount?: number }[];
    const byDate = new Map<string, { completed: boolean; totalCount: number }>();
    for (const l of logs) {
      const entry = byDate.get(l.date) ?? { completed: false, totalCount: 0 };
      entry.completed = entry.completed || l.completed;
      entry.totalCount += l.count ?? 0;
      byDate.set(l.date, entry);
    }
    const rows = Array.from(byDate.entries()).map(([date, v]) => ({ date, completed: v.completed, totalCount: v.totalCount }));
    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows;
  }, [logs]);

  async function onCompleteToday() {
    if (!habit || busy || hasDoneToday) return;
    setBusy(true);
    try {
      await logHabit(habit.id, today, { completed: true });
      const l = await listHabitLogsByDate(habit.id);
      setLogs(l);
    } catch (e: any) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.alert(e?.message ?? 'Action impossible');
        }
      } else {
        Alert.alert('Erreur', e?.message ?? 'Action impossible');
      }
    } finally {
      setBusy(false);
    }
  }

  async function onIncrementCount() {
    if (!habit) return;
    const step = Math.max(1, Number(increment) || 1);
    setBusy(true);
    try {
      await logHabit(habit.id, today, { count: step, completed: false });
      let l = await listHabitLogsByDate(habit.id);
      // If target reached and not marked completed yet, create a completed log for today
      if (habit.quantity.kind === 'count') {
        const total = l.filter((x) => x.date === today).reduce((acc, x) => acc + (x.count ?? 0), 0);
        const hasCompleted = l.some((x) => x.date === today && x.completed);
        if (total >= habit.quantity.target && !hasCompleted) {
          await logHabit(habit.id, today, { completed: true });
          l = await listHabitLogsByDate(habit.id);
        }
      }
      setLogs(l);
    } catch (e: any) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.alert(e?.message ?? 'Action impossible');
        }
      } else {
        Alert.alert('Erreur', e?.message ?? 'Action impossible');
      }
    } finally {
      setBusy(false);
    }
  }

  if (!habit || !logs) {
    return (
      <ThemedView style={[styles.center, Platform.OS === 'web' && styles.webCenter]}>
        <ThemedText>Chargement…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <Stack.Screen options={{ title: habit.name }} />

      <View style={[styles.row, Platform.OS === 'web' && styles.webRow]}>
        <ThemedText>Streak actuel: {streak.current}</ThemedText>
        <ThemedText>Meilleur: {streak.best}</ThemedText>
      </View>

      {habit.quantity.kind === 'boolean' ? (
        <Pressable style={[styles.doneBtn, (hasDoneToday || busy) && { opacity: 0.6 }]} onPress={onCompleteToday}>
          <ThemedText style={{ color: 'white' }}>
            {hasDoneToday ? 'Déjà fait aujourd\'hui' : (busy ? 'En cours...' : 'Marquer comme fait')}
          </ThemedText>
        </Pressable>
      ) : (
        <View style={{ marginTop: 12 }}>
          <ThemedText type="subtitle">Progression du jour</ThemedText>
          <ThemedText style={{ marginTop: 4 }}>{todayCount}/{habit.quantity.target}</ThemedText>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TextInput
              value={increment}
              onChangeText={setIncrement}
              keyboardType="number-pad"
              style={[styles.input, { flex: 1 }]}
              placeholder="+1"
            />
            <Pressable style={[styles.doneBtn, { flex: 1, marginTop: 0 }]} onPress={onIncrementCount} disabled={busy}>
              <ThemedText style={{ color: 'white' }}>{busy ? 'En cours…' : `Ajouter +${Math.max(1, Number(increment) || 1)}`}</ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      <ThemedText type="subtitle" style={{ marginTop: 16 }}>Historique</ThemedText>
      {history.length === 0 ? (
        <ThemedText>Aucun historique.</ThemedText>
      ) : (
        <View style={[styles.historyContainer, Platform.OS === 'web' && styles.webHistoryContainer]}>
          {history.map((row) => (
            <View key={row.date} style={[styles.logItem, Platform.OS === 'web' && styles.webLogItem]}>
              <ThemedText>{row.date}</ThemedText>
              {habit.quantity.kind === 'count' ? (
                <ThemedText>
                  {row.completed ? '✅' : '—'} {row.totalCount}/{habit.quantity.target}
                </ThemedText>
              ) : (
                <ThemedText>{row.completed ? '✅' : '—'}</ThemedText>
              )}
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  doneBtn: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00000022',
    borderRadius: 8,
    padding: 10,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00000012',
  },
  historyContainer: {
    marginTop: 8,
  },
  webContainer: {
    padding: 20,
  },
  webCenter: {
    padding: 20,
  },
  webRow: {
    marginTop: 12,
  },
  webHistoryContainer: {
    marginTop: 12,
  },
  webLogItem: {
    paddingVertical: 10,
  },
});