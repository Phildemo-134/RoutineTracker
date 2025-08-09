import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { subscribeHabits } from '@/lib/habits';
import type { Habit } from '@/types/habit';

type Section = { title: string; data: Habit[] };

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[] | null>(null);

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

  if (!habits) {
    return (
      <ThemedView style={styles.center}> 
        <ThemedText>Chargement…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Mes habitudes</ThemedText>
        <Link href="/habit/create" asChild>
          <Pressable style={styles.addBtn}>
            <ThemedText style={{ color: 'white' }}>Ajouter</ThemedText>
          </Pressable>
        </Link>
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
          renderItem={({ item }) => (
            <Link href={{ pathname: '/habit/[id]', params: { id: item.id } }} asChild>
              <Pressable style={styles.row}>
                <View style={{ flex: 1 }}>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText style={styles.muted}>
                    {item.quantity.kind === 'boolean' ? 'Booléen' : `Objectif: ${item.quantity.target}`}
                  </ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </Pressable>
            </Link>
          )}
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
    justifyContent: 'space-between',
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
  muted: {
    opacity: 0.6,
  },
  separator: {
    height: 1,
    backgroundColor: '#00000012',
  },
});
