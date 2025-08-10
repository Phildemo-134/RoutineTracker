import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HabitCard } from '@/components/ui/HabitCard';
import { useAuth } from '@/hooks/useAuth';
import { subscribeHabitLogsForDate, subscribeHabits } from '@/lib/habits';
import type { Habit } from '@/types/habit';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const [todayStatusById, setTodayStatusById] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { user } = useAuth();

  function todayYMD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeHabits(setHabits);
    return () => unsub();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The subscription will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const todayHabits = useMemo(() => {
    if (!habits) return [];
    // Sort habits by completion status and then by name
    return [...habits].sort((a, b) => {
      const aCompleted = todayStatusById[a.id] === true;
      const bCompleted = todayStatusById[b.id] === true;
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1; // Incomplete habits first
      }
      return a.name.localeCompare(b.name);
    });
  }, [habits, todayStatusById]);

  const stats = useMemo(() => {
    if (!habits) return { completed: 0, total: 0, percentage: 0 };
    const completed = habits.filter(h => todayStatusById[h.id] === true).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [habits, todayStatusById]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  useEffect(() => {
    if (!user || !habits) return;
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
  }, [user, habits]);

  if (!habits) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="body" color="secondary">Chargement de vos habitudes…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      variant="secondary"
      style={[
        styles.container,
        isNative ? { paddingTop: insets.top + 20 } : null,
      ]}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <ThemedText type="heading2">{getGreeting()}</ThemedText>
          <ThemedText type="body" color="secondary">
            Continuons à construire vos bonnes habitudes
          </ThemedText>
        </View>

        <Button
          title="Coach IA"
          variant="primary"
          size="medium"
          onPress={() => router.push('/(tabs)/coach')}
          style={styles.coachButton}
        />
      </View>

      {/* Stats Card */}
      {habits.length > 0 && (
        <Card elevation="low" style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statsTextSection}>
              <ThemedText type="heading3">{stats.percentage}%</ThemedText>
              <ThemedText type="caption" color="secondary">
                {stats.completed} sur {stats.total} habitudes complétées aujourd'hui
              </ThemedText>
            </View>
            <View style={styles.progressRing}>
              <ThemedText type="title" color="primary">
                {stats.completed}/{stats.total}
              </ThemedText>
            </View>
          </View>
        </Card>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card elevation="medium" style={styles.emptyStateCard}>
          <View style={styles.emptyState}>
            <ThemedText type="heading3" style={styles.emptyTitle}>
              Commencez votre parcours
            </ThemedText>
            <ThemedText type="body" color="secondary" style={styles.emptyDescription}>
              Créez votre première habitude pour commencer à transformer votre quotidien.
            </ThemedText>
            <Button
              title="Créer une habitude"
              variant="primary"
              size="large"
              onPress={() => router.push('/habit/create')}
              style={styles.createFirstButton}
            />
          </View>
        </Card>
      ) : (
        <FlatList
          data={todayHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              isCompleted={todayStatusById[item.id] === true}
              onPress={() => router.push({ pathname: '/(tabs)/habit/[id]', params: { id: item.id } })}
              onToggle={() => router.push({ pathname: '/(tabs)/habit/[id]', params: { id: item.id } })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.habitsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 10,
  },
  greetingSection: {
    flex: 1,
    marginRight: 16,
  },
  coachButton: {
    minWidth: 100,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  statsTextSection: {
    flex: 1,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  emptyStateCard: {
    marginTop: 40,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  createFirstButton: {
    minWidth: 200,
  },
  habitsList: {
    paddingBottom: 20,
  },
});
