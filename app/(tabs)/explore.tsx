import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HabitListItem } from '@/components/ui/HabitListItem';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { deleteHabit, subscribeHabits } from '@/lib/habits';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/userProfile';
import type { Habit } from '@/types/habit';

export default function SettingsScreen() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingAge, setEditingAge] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { signOutUser, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeHabits(setHabits);
    loadUserProfile();
    return () => unsub();
  }, [user]);

  async function loadUserProfile() {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      if (userProfile) {
        setEditingName(userProfile.name);
        setEditingAge(userProfile.age.toString());
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  async function saveProfile() {
    const name = editingName.trim();
    const age = parseInt(editingAge, 10);
    
    if (!name) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    
    if (isNaN(age) || age < 1 || age > 120) {
      Alert.alert('Erreur', 'L\'âge doit être un nombre entre 1 et 120');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({ name, age });
      setProfile({ name, age, updatedAt: Date.now() });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing() {
    if (profile) {
      setEditingName(profile.name);
      setEditingAge(profile.age.toString());
    }
    setIsEditing(true);
  }

  function cancelEditing() {
    if (profile) {
      setEditingName(profile.name);
      setEditingAge(profile.age.toString());
    }
    setIsEditing(false);
  }

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

  const stats = {
    totalHabits: habits?.length || 0,
    categories: habits ? [...new Set(habits.map(h => h.categoryId).filter(Boolean))].length : 0,
  };

  if (!habits) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="body" color="secondary">Chargement de vos paramètres…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      variant="secondary"
      style={[
        styles.container,
        { paddingTop: insets.top + 20 }
      ]}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <ThemedText type="heading2">Paramètres</ThemedText>
            <ThemedText type="body" color="secondary">
              Gérez votre profil et vos habitudes
            </ThemedText>
          </View>

          <View style={styles.headerActions}>
            <Link href="/habit/create" asChild>
              <Button
                title="Nouvelle habitude"
                variant="primary"
                size="medium"
              />
            </Link>
          </View>
        </View>

        {/* Stats Card */}
        <Card elevation="low" style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <ThemedText type="heading3">{stats.totalHabits}</ThemedText>
              <ThemedText type="caption" color="secondary">
                Habitudes créées
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="heading3">{stats.categories}</ThemedText>
              <ThemedText type="caption" color="secondary">
                Catégories
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Profile Section */}
        <Card elevation="low" style={styles.section}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Profil utilisateur
            </ThemedText>
            
            {!isEditing ? (
              <View style={styles.profileDisplay}>
                <View style={styles.profileRow}>
                  <View style={styles.profileField}>
                    <ThemedText type="caption" color="secondary">
                      Nom
                    </ThemedText>
                    <ThemedText type="body" style={styles.profileValue}>
                      {profile?.name || 'Non défini'}
                    </ThemedText>
                  </View>
                  <View style={styles.profileField}>
                    <ThemedText type="caption" color="secondary">
                      Âge
                    </ThemedText>
                    <ThemedText type="body" style={styles.profileValue}>
                      {profile?.age ? `${profile.age} ans` : 'Non défini'}
                    </ThemedText>
                  </View>
                </View>
                <Button
                  title="Modifier le profil"
                  variant="secondary"
                  size="medium"
                  onPress={startEditing}
                  style={styles.editButton}
                />
              </View>
            ) : (
              <View style={styles.profileEdit}>
                <Input
                  label="Nom"
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Votre nom"
                />
                
                <Input
                  label="Âge"
                  value={editingAge}
                  onChangeText={setEditingAge}
                  placeholder="Votre âge"
                  keyboardType="numeric"
                />

                <View style={styles.editActions}>
                  <Button
                    title="Annuler"
                    variant="ghost"
                    size="medium"
                    onPress={cancelEditing}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Sauvegarder"
                    variant="primary"
                    size="medium"
                    loading={isSaving}
                    onPress={saveProfile}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Habits Management Section */}
        <Card elevation="low" style={styles.section}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <ThemedText type="title" style={styles.sectionTitle}>
                Gestion des habitudes
              </ThemedText>
              <Badge variant="default" size="small">
                {habits.length.toString()}
              </Badge>
            </View>

            {habits.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="body" color="secondary" style={styles.emptyText}>
                  Aucune habitude créée pour le moment
                </ThemedText>
                <Link href="/habit/create" asChild>
                  <Button
                    title="Créer ma première habitude"
                    variant="primary"
                    size="medium"
                    style={styles.createFirstButton}
                  />
                </Link>
              </View>
            ) : (
              <View style={styles.habitsList}>
                {habits.map((habit) => (
                  <HabitListItem
                    key={habit.id}
                    habit={habit}
                    onDelete={() => onDelete(habit)}
                  />
                ))}
              </View>
            )}
          </View>
        </Card>

        {/* Account Section */}
        <Card elevation="low" style={styles.section}>
          <View style={styles.sectionContent}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Compte
            </ThemedText>
            
            <View style={styles.accountActions}>
              <Button
                title="Se déconnecter"
                variant="error"
                size="large"
                onPress={() => signOutUser()}
                style={styles.signOutButton}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 10,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    // Button styles are handled by the Button component
  },
  statsCard: {
    marginBottom: 24,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileDisplay: {
    // Container for profile display mode
  },
  profileRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  profileField: {
    flex: 1,
  },
  profileValue: {
    marginTop: 6,
    fontWeight: '500',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  profileEdit: {
    // Container for profile edit mode
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    minWidth: 100,
  },
  saveButton: {
    minWidth: 120,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  createFirstButton: {
    minWidth: 200,
  },
  habitsList: {
    // Container for habits list
  },
  accountActions: {
    alignItems: 'center',
    paddingTop: 8,
  },
  signOutButton: {
    minWidth: 200,
  },
});
