import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const { signUp, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  async function onSubmit() {
    if (!email || !password) return;
    setBusy(true);
    try {
      await signUp(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const message = e?.message ?? 'Inscription impossible';
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.alert(message);
      } else {
        Alert.alert('Erreur', message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Inscription' }} />
      <ThemedText type="title">Créer un compte</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        inputMode="email"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        secureTextEntry
        style={styles.input}
      />
      <Pressable style={[styles.primaryBtn, busy && { opacity: 0.7 }]} onPress={onSubmit} disabled={busy}>
        <ThemedText style={{ color: 'white' }}>{busy ? 'Création…' : 'S\'inscrire'}</ThemedText>
      </Pressable>
      <View style={{ height: 12 }} />
      <Link href="/(auth)/sign-in" asChild>
        <Pressable style={styles.secondaryBtn}>
          <ThemedText>J'ai déjà un compte</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#00000022',
    borderRadius: 8,
    padding: 10,
  },
  primaryBtn: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
});