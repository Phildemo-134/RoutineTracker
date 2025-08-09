import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { subscribeHabitLogsForDate, subscribeHabits } from '@/lib/habits';
import type { Habit } from '@/types/habit';

type Section = { title: string; data: Habit[] };

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const insets = useSafeAreaInsets();
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const [todayStatusById, setTodayStatusById] = useState<Record<string, boolean>>({});
  const router = useRouter();

  function todayYMD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  useEffect(() => {
    const unsub = subscribeHabits(setHabits);
    return () => unsub();
  }, []);

  const sections = useMemo<Section[]>(() => {
    if (!habits) return [];
    const byCat = new Map<string, Habit[]>();
    for (const h of habits) {
      const key = (h.categoryId && h.categoryId.trim()) || 'Sans catégorie';
      const arr = byCat.get(key) ?? [];
      arr.push(h);
      byCat.set(key, arr);
    }
    return Array.from(byCat.entries()).map(([title, data]) => ({ title, data }));
  }, [habits]);

  useEffect(() => {
    const today = todayYMD();
    const unsub = subscribeHabitLogsForDate(today, (logs) => {
      if (!habits) return;
      const map: Record<string, boolean> = {};
      for (const h of habits) {
        const perHabit = logs.filter((l) => l.habitId === h.id);
        const completed = perHabit.some((l) => l.completed);
        let reached = completed;
        if (!reached && h.quantity.kind === 'count') {
          const total = perHabit.reduce((acc, l) => acc + (l.count ?? 0), 0);
          reached = total >= h.quantity.target;
        }
        map[h.id] = reached;
      }
      setTodayStatusById(map);
    });
    return () => unsub();
  }, [habits]);

  if (!habits) {
    return (
      <ThemedView style={styles.center}> 
        <ThemedText>Chargement…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        isNative ? { paddingTop: 16 + insets.top + 32 } : null,
      ]}
    >
      <View style={styles.headerRow}>
        <ThemedText type="title">Mes habitudes</ThemedText>
      </View>

      {habits.length === 0 ? (
        <View style={[styles.center, { paddingTop: 40 }]}> 
          <ThemedText>Aucune habitude.</ThemedText>
          <ThemedText style={{ marginTop: 6 }}>Appuie sur "Ajouter" pour commencer.</ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <ThemedText type="subtitle" style={styles.sectionTitle}>{section.title}</ThemedText>
          )}
          renderItem={({ item }) => {
            const reached = todayStatusById[item.id] === true;
            return (
              <View style={styles.row}>
                <Pressable
                  style={{ flex: 1, paddingRight: 12 }}
                  onPress={() => router.push({ pathname: '/(tabs)/habit/[id]', params: { id: item.id } })}
                >
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText style={styles.muted}>
                    {item.quantity.kind === 'boolean' ? 'Booléen' : `Objectif: ${item.quantity.target}`}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.statusBtn, reached ? styles.statusBtnDone : styles.statusBtnTodo]}
                  onPress={() => router.push({ pathname: '/(tabs)/habit/[id]', params: { id: item.id } })}
                >
                  <ThemedText style={{ color: 'white' }}>{reached ? 'complété' : 'compléter'}</ThemedText>
                </Pressable>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          stickySectionHeadersEnabled={false}
        />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  chevron: {
    fontSize: 24,
    opacity: 0.4,
  },
  statusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  statusBtnDone: {
    backgroundColor: '#2ecc71',
  },
  statusBtnTodo: {
    backgroundColor: '#0a7ea4',
  },
  muted: {
    opacity: 0.6,
  },
  separator: {
    height: 1,
    backgroundColor: '#00000012',
  },
});
