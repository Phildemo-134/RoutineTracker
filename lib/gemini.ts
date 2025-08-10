// Minimal Gemini 1.5 Flash client using fetch.
// Expect env var EXPO_PUBLIC_GEMINI_API_KEY set.

export type GeminiMessage = {
  role: 'user' | 'model' | 'system';
  content: string;
};

export type GeminiResponse = {
  text: string;
};

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'models/gemini-1.5-flash-latest';

function ensureKey() {
  if (!GEMINI_API_KEY) {
    throw new Error('Clé API Gemini manquante. Définissez EXPO_PUBLIC_GEMINI_API_KEY.');
  }
}

export async function geminiChat(messages: GeminiMessage[]): Promise<GeminiResponse> {
  ensureKey();
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  // Transform to Google text parts format
  const contents = messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { text };
}

