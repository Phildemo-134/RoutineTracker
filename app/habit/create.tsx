import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ToggleGroup } from '@/components/ui/ToggleGroup';
import { createHabit } from '@/lib/habits';
import { scheduleDailyReminder } from '@/lib/notifications';
import type { Habit } from '@/types/habit';

export default function NewHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantityType, setQuantityType] = useState('boolean');
  const [target, setTarget] = useState('1');
  const [notifyTime, setNotifyTime] = useState(''); // HH:MM 24h
  const [frequencyKind, setFrequencyKind] = useState('daily');
  const [weeklyDays, setWeeklyDays] = useState(''); // comma-separated days
  const [intervalDays, setIntervalDays] = useState('2');
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.alert('Le nom est requis');
      } else {
        Alert.alert('Le nom est requis');
      }
      return;
    }
    setBusy(true);
    try {
      let frequency: Habit['frequency'];
      if (frequencyKind === 'daily') frequency = { kind: 'daily' };
      else if (frequencyKind === 'weekly') {
        const days = weeklyDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
        frequency = { kind: 'weekly', daysOfWeek: days.sort() };
      }
      else frequency = { kind: 'custom', intervalDays: Math.max(1, Number(intervalDays) || 1) };
      const quantity: Habit['quantity'] = quantityType === 'count'
        ? { kind: 'count', target: Math.max(1, Number(target) || 1) }
        : { kind: 'boolean' };

      await createHabit({
        name: name.trim(),
        categoryId: category.trim() || null,
        frequency,
        quantity,
        archived: false,
      } as Omit<Habit, 'id' | 'createdAt'>);

      // Try to schedule a reminder but do not block if it fails (especially on web)
      if (notifyTime) {
        try {
          const [h, m] = notifyTime.split(':').map((v) => Number(v));
          if (!Number.isNaN(h) && !Number.isNaN(m)) {
            await scheduleDailyReminder(h, m);
          }
        } catch {
          // ignore notification scheduling errors
        }
      }

      if (Platform.OS === 'web') {
        router.replace('/(tabs)/explore');
      } else {
        router.replace('/explore');
      }
    } catch (e: any) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.alert(e?.message ?? 'Impossible de créer');
      } else {
        Alert.alert('Erreur', e?.message ?? 'Impossible de créer');
      }
    } finally {
      setBusy(false);
    }
  }

  const quantityOptions = [
    { value: 'boolean', label: 'Oui/Non' },
    { value: 'count', label: 'Quantité' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  const weekDayOptions = [
    { value: '0', label: 'Dim' },
    { value: '1', label: 'Lun' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Mer' },
    { value: '4', label: 'Jeu' },
    { value: '5', label: 'Ven' },
    { value: '6', label: 'Sam' },
  ];

  return (
    <ThemedView variant="secondary" style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Nouvelle habitude',
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'web' && styles.webScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, Platform.OS === 'web' && styles.webHeader]}>
          <ThemedText type="heading2">Créer une habitude</ThemedText>
          <ThemedText type="body" color="secondary" style={styles.subtitle}>
            Définissez les détails de votre nouvelle habitude
          </ThemedText>
        </View>

        {/* Basic Information */}
        <Card elevation="low" style={[styles.section, Platform.OS === 'web' && styles.webSection]}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Informations de base
            </ThemedText>
            
            <Input
              label="Nom de l'habitude"
              value={name}
              onChangeText={setName}
              placeholder="ex: Méditer 10 minutes"
              size="large"
            />

            <Input
              label="Catégorie (optionnel)"
              value={category}
              onChangeText={setCategory}
              placeholder="ex: Bien-être, Sport, Travail"
              helperText="Organisez vos habitudes par catégorie"
            />
          </View>
        </Card>

        {/* Quantity Type */}
        <Card elevation="low" style={[styles.section, Platform.OS === 'web' && styles.webSection]}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Type de suivi
            </ThemedText>
            <ThemedText type="caption" color="secondary" style={styles.sectionDescription}>
              Comment voulez-vous mesurer cette habitude ?
            </ThemedText>
            
            <ToggleGroup
              options={quantityOptions}
              value={quantityType}
              onValueChange={setQuantityType}
              size="large"
            />

            {quantityType === 'count' && (
              <Input
                label="Objectif quotidien"
                value={target}
                onChangeText={setTarget}
                keyboardType="number-pad"
                placeholder="1"
                helperText="Nombre à atteindre chaque jour"
              />
            )}
          </View>
        </Card>

        {/* Frequency */}
        <Card elevation="low" style={[styles.section, Platform.OS === 'web' && styles.webSection]}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Fréquence
            </ThemedText>
            <ThemedText type="caption" color="secondary" style={styles.sectionDescription}>
              À quelle fréquence voulez-vous pratiquer cette habitude ?
            </ThemedText>
            
            <ToggleGroup
              options={frequencyOptions}
              value={frequencyKind}
              onValueChange={setFrequencyKind}
              size="large"
            />

            {frequencyKind === 'weekly' && (
              <View style={styles.weeklySection}>
                <ThemedText type="body" style={styles.weeklyTitle}>
                  Jours de la semaine
                </ThemedText>
                <ToggleGroup
                  options={weekDayOptions}
                  value={weeklyDays}
                  onValueChange={setWeeklyDays}
                  multiple
                />
              </View>
            )}

            {frequencyKind === 'custom' && (
              <Input
                label="Intervalle en jours"
                value={intervalDays}
                onChangeText={setIntervalDays}
                keyboardType="number-pad"
                placeholder="2"
                helperText="Répéter tous les X jours"
              />
            )}
          </View>
        </Card>

        {/* Notifications */}
        <Card elevation="low" style={[styles.section, Platform.OS === 'web' && styles.webSection]}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Rappel (optionnel)
            </ThemedText>
            <ThemedText type="caption" color="secondary" style={styles.sectionDescription}>
              Recevez une notification quotidienne
            </ThemedText>
            
            <Input
              label="Heure du rappel"
              value={notifyTime}
              onChangeText={setNotifyTime}
              placeholder="20:30"
              autoCapitalize="none"
              helperText="Format: HH:MM (24h)"
            />
          </View>
        </Card>

        {/* Save Button */}
        <View style={[styles.saveSection, Platform.OS === 'web' && styles.webSaveSection]}>
          <Button
            title={busy ? 'Création en cours...' : 'Créer l\'habitude'}
            variant="primary"
            size="large"
            loading={busy}
            onPress={onSave}
            disabled={busy || !name.trim()}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  webScrollContent: {
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 32,
    paddingTop: 20,
  },
  webHeader: {
    paddingTop: 0,
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  webSection: {
    marginBottom: 0,
  },
  sectionContent: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 20,
    lineHeight: 20,
  },
  weeklySection: {
    marginTop: 20,
  },
  weeklyTitle: {
    marginBottom: 12,
    fontWeight: '500',
  },
  saveSection: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  webSaveSection: {
    paddingHorizontal: 0,
  },
  saveButton: {
    width: '100%',
  },
});