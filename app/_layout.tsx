import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

// Web layout wrapper component
function WebLayout({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webLayout}>
      <View style={styles.webContent}>
        {children}
      </View>
    </View>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, initializing } = useAuth();

  if (initializing) return null;

  if (!user) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WebLayout>
          <Redirect href="/(auth)/sign-in" />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </WebLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WebLayout>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="habit/create" options={{ title: 'Nouvelle habitude' }} />
          {/* keep a fallback route, but primary detail lives under (tabs)/habit/[id] */}
          <Stack.Screen name="habit/[id]" options={{ title: 'Habitude' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </WebLayout>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webLayout: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  webContent: {
    width: '100%',
    maxWidth: 1400,
    backgroundColor: 'white',
    minHeight: '100vh',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});
