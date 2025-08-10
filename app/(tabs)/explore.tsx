import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
    try {
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

      await updateUserProfile({ name, age });
      setProfile({ name, age, updatedAt: Date.now() });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Link href="/habit/create" asChild>
            <Pressable style={styles.addBtn}>
              <ThemedText style={{ color: 'white' }}>Ajouter</ThemedText>
            </Pressable>
          </Link>
          <Pressable style={styles.signOutBtn} onPress={() => signOutUser()}>
            <ThemedText style={{ color: 'white' }}>Déconnexion</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Section Profil */}
      <View style={styles.profileSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Profil</ThemedText>
        
        {!isEditing ? (
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileLabel}>Nom:</ThemedText>
              <ThemedText>{profile?.name || 'Non défini'}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileLabel}>Âge:</ThemedText>
              <ThemedText>{profile?.age || 'Non défini'}</ThemedText>
            </View>
            <Pressable style={styles.editBtn} onPress={startEditing}>
              <ThemedText style={{ color: 'white' }}>Modifier</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.profileEditRow}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.profileLabel}>Nom:</ThemedText>
              <TextInput
                style={styles.input}
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Ton nom"
                autoFocus
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.profileLabel}>Âge:</ThemedText>
              <TextInput
                style={styles.input}
                value={editingAge}
                onChangeText={setEditingAge}
                placeholder="Ton âge"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.editActions}>
              <Pressable style={styles.saveBtn} onPress={saveProfile}>
                <ThemedText style={{ color: 'white' }}>Sauvegarder</ThemedText>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={cancelEditing}>
                <ThemedText style={{ color: 'white' }}>Annuler</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Section Habitudes */}
      <View style={styles.habitsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Habitudes</ThemedText>

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
      </View>
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
  signOutBtn: {
    backgroundColor: '#6b7280',
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
  editBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  profileSection: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
    marginRight: 10,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEditRow: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000012',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  habitsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
});
