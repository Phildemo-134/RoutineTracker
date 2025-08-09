import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createHabit } from '@/lib/habits';
import { scheduleDailyReminder } from '@/lib/notifications';
import type { Habit } from '@/types/habit';

export default function NewHabitScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [isCount, setIsCount] = useState(false);
  const [target, setTarget] = useState('1');
  const [notifyTime, setNotifyTime] = useState(''); // HH:MM 24h
  const [frequencyKind, setFrequencyKind] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]); // 0..6
  const [intervalDays, setIntervalDays] = useState('2');
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (!name.trim()) {
      Alert.alert('Le nom est requis');
      return;
    }
    setBusy(true);
    try {
      let frequency: Habit['frequency'];
      if (frequencyKind === 'daily') frequency = { kind: 'daily' };
      else if (frequencyKind === 'weekly') frequency = { kind: 'weekly', daysOfWeek: weeklyDays.sort() };
      else frequency = { kind: 'custom', intervalDays: Math.max(1, Number(intervalDays) || 1) };
      const quantity: Habit['quantity'] = isCount
        ? { kind: 'count', target: Math.max(1, Number(target) || 1) }
        : { kind: 'boolean' };

      await createHabit({
        name: name.trim(),
        categoryId: category.trim() || null,
        frequency,
        quantity,
        archived: false,
      } as Omit<Habit, 'id' | 'createdAt'>);

      if (notifyTime) {
        const [h, m] = notifyTime.split(':').map((v) => Number(v));
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          await scheduleDailyReminder(h, m);
        }
      }

      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Impossible de créer');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Nouvelle habitude' }} />
      <ThemedText>Nom</ThemedText>
      <TextInput value={name} onChangeText={setName} placeholder="ex: Méditer" style={styles.input} />

      <ThemedText>Catégorie (optionnel)</ThemedText>
      <TextInput value={category} onChangeText={setCategory} placeholder="ex: Bien-être" style={styles.input} />

      <ThemedText>Type</ThemedText>
      <View style={styles.row}>
        <Pressable style={[styles.toggle, !isCount && styles.toggleActive]} onPress={() => setIsCount(false)}>
          <ThemedText>Booléen</ThemedText>
        </Pressable>
        <Pressable style={[styles.toggle, isCount && styles.toggleActive]} onPress={() => setIsCount(true)}>
          <ThemedText>Quantité</ThemedText>
        </Pressable>
      </View>

      <ThemedText>Fréquence</ThemedText>
      <View style={styles.row}>
        <Pressable style={[styles.toggle, frequencyKind === 'daily' && styles.toggleActive]} onPress={() => setFrequencyKind('daily')}>
          <ThemedText>Quotidienne</ThemedText>
        </Pressable>
        <Pressable style={[styles.toggle, frequencyKind === 'weekly' && styles.toggleActive]} onPress={() => setFrequencyKind('weekly')}>
          <ThemedText>Hebdo</ThemedText>
        </Pressable>
        <Pressable style={[styles.toggle, frequencyKind === 'custom' && styles.toggleActive]} onPress={() => setFrequencyKind('custom')}>
          <ThemedText>Intervalle</ThemedText>
        </Pressable>
      </View>

      {frequencyKind === 'weekly' && (
        <View>
          <ThemedText>Jours de la semaine</ThemedText>
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((label, idx) => {
              const active = weeklyDays.includes(idx);
              return (
                <Pressable
                  key={idx}
                  style={[styles.toggle, active && styles.toggleActive]}
                  onPress={() => {
                    setWeeklyDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]));
                  }}
                >
                  <ThemedText>{label}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {frequencyKind === 'custom' && (
        <View>
          <ThemedText>Intervalle en jours</ThemedText>
          <TextInput value={intervalDays} onChangeText={setIntervalDays} keyboardType="number-pad" style={styles.input} />
        </View>
      )}

      {isCount && (
        <>
          <ThemedText>Objectif</ThemedText>
          <TextInput value={target} onChangeText={setTarget} keyboardType="number-pad" style={styles.input} />
        </>
      )}

      <ThemedText>Rappel quotidien (HH:MM, optionnel)</ThemedText>
      <TextInput
        value={notifyTime}
        onChangeText={setNotifyTime}
        placeholder="20:30"
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable style={[styles.saveBtn, busy && { opacity: 0.7 }]} onPress={onSave} disabled={busy}>
        <ThemedText style={{ color: 'white' }}>{busy ? 'Enregistrement…' : 'Enregistrer'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00000022',
    borderRadius: 8,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#00000022',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#e6f4f8',
    borderColor: '#0a7ea4',
  },
  saveBtn: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 12,
  },
});