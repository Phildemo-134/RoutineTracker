import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { deleteHabit, subscribeHabits } from '@/lib/habits';
import type { Habit } from '@/types/habit';

export default function SettingsScreen() {
  const [habits, setHabits] = useState<Habit[] | null>(null);

  useEffect(() => {
    const unsub = subscribeHabits(setHabits);
    return () => unsub();
  }, []);

  function onDelete(habit: Habit) {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm(`Supprimer "${habit.name}" ?`);
      if (ok) {
        deleteHabit(habit.id).catch((e: any) => {
          if (typeof window !== 'undefined') {
            window.alert(e?.message ?? 'Erreur de suppression');
          }
        });
      }
      return;
    }
    Alert.alert('Supprimer', `Supprimer "${habit.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprime', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);
  }

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
        <ThemedText type="title">Réglages</ThemedText>
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
        <View>
          {habits.map((h) => (
            <View key={h.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <ThemedText>{h.name}</ThemedText>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(h)}>
                <ThemedText style={{ color: 'white' }}>Supprime</ThemedText>
              </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000012',
  },
  deleteBtn: {
    backgroundColor: '#c0392b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
