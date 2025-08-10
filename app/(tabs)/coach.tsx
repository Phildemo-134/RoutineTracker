import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { buildCoachContext } from '@/lib/coach';
import { geminiChat, type GeminiMessage } from '@/lib/gemini';
import Markdown from 'react-native-markdown-display';

type ChatItem = { id: string; role: 'user' | 'model'; text: string };

export default function CoachScreen() {
  const { user } = useAuth();
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!user) return;
      setError(null);
      setLoading(true);
      try {
        const ctx = await buildCoachContext();
        if (!mounted) return;
        const systemPrompt =
          'Tu es un ami proche et bienveillant qui aide l\'utilisateur à tenir ses habitudes. Parle-lui comme à un ami, utilise "tu" et "toi", sois chaleureux et encourageant. Partage tes expériences personnelles si c\'est pertinent, sois authentique et empathique. Utilise le contexte fourni pour personnaliser tes conseils. Sois bref mais chaleureux. Réponds exclusivement en Markdown.';
        let contextMessage = `Contexte détaillé:\n${ctx.summary}`;
        if (ctx.userProfile) {
          contextMessage += `\n\nInformations personnelles: ${ctx.userProfile.name}, ${ctx.userProfile.age} ans.`;
        }
        const initMessages: GeminiMessage[] = [
          { role: 'user', content: `${systemPrompt}\n\n${contextMessage}` },
          { role: 'user', content: 'Salut ! Dis bonjour comme un ami et pose-lui une question personnelle et encourageante pour commencer la conversation. Sois naturel et chaleureux.' },
        ];
        const response = await geminiChat(initMessages);
        setChat([{ id: 'init', role: 'model', text: response.text }]);
        scrollToBottom();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [user]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatItem = { id: `u-${Date.now()}`, role: 'user', text: input.trim() };
    setChat((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const ctx = await buildCoachContext();
      
      // Construire l'historique complet de la conversation
      const conversationHistory = chat.map<GeminiMessage>((c) => ({ role: c.role, content: c.text }));
      let contextMessage = `Contexte actualisé (réponds en Markdown):\n${ctx.summary}`;
      if (ctx.userProfile) {
        contextMessage += `\n\nInformations personnelles: ${ctx.userProfile.name}, ${ctx.userProfile.age} ans.`;
      }
      
      const history: GeminiMessage[] = [
        { role: 'user', content: `${contextMessage}\n\nHistorique de la conversation:\n${conversationHistory.map((msg, i) => `${msg.role === 'user' ? 'Utilisateur' : 'Coach'}: ${msg.content}`).join('\n')}` },
        ...conversationHistory,
        { role: 'user', content: userMsg.text },
      ];
      
      const res = await geminiChat(history);
      setChat((prev) => [...prev, { id: `m-${Date.now()}`, role: 'model', text: res.text }]);
      setInput('');
      setLoading(false);
      scrollToBottom();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 8 }]}> 
        <View style={styles.headerRow}>
          <ThemedText type="title">Coach</ThemedText>
          <Pressable style={styles.clearBtn} onPress={() => setChat([])}>
            <ThemedText style={{ color: 'white', fontSize: 14 }}>Effacer</ThemedText>
          </Pressable>
        </View>

        <View style={styles.chatArea}>
          {chat.length === 0 && !loading ? (
            <ThemedText style={{ opacity: 0.6 }}>Initialisation du coach…</ThemedText>
          ) : null}
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {chat.map((item) => (
              <View key={item.id} style={[styles.bubble, item.role === 'user' ? styles.user : styles.model]}>
                <Markdown style={item.role === 'user' ? markdownUserStyles : markdownStyles}>{item.text}</Markdown>
              </View>
            ))}
            {loading ? (
              <ThemedText style={{ opacity: 0.6, marginTop: 8 }}>Le coach écrit…</ThemedText>
            ) : null}
            {error ? (
              <ThemedText style={{ color: '#e74c3c', marginTop: 8 }}>{error}</ThemedText>
            ) : null}
          </ScrollView>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Écris ton message…"
            value={input}
            onChangeText={setInput}
            editable={!loading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable style={[styles.sendBtn, !input.trim() || loading ? { opacity: 0.5 } : null]} onPress={sendMessage}>
            <ThemedText style={{ color: 'white' }}>Envoyer</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for clear button
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  chatArea: {
    flex: 1,
    marginBottom: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    maxWidth: '85%',
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#0a7ea4',
  },
  model: {
    alignSelf: 'flex-start',
    backgroundColor: '#00000012',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0000000A',
  },
  sendBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding at the bottom to prevent content from being hidden behind the keyboard
  },
});

const markdownStyles = {
  body: {
    color: undefined,
  },
  heading1: { fontSize: 20, marginBottom: 6 },
  heading2: { fontSize: 18, marginBottom: 6 },
  paragraph: { marginBottom: 6 },
  list_item: { marginBottom: 4 },
  code_inline: {
    backgroundColor: '#00000012',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: '#00000012',
    padding: 8,
    borderRadius: 6,
  },
} as const;

const markdownUserStyles = {
  ...markdownStyles,
  body: { color: 'white' },
  code_inline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 6,
  },
} as const;

