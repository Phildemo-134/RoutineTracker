import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const res = await Notifications.requestPermissionsAsync();
  return res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  const ok = await ensureNotificationPermission();
  if (!ok) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Routine Tracker',
      body: 'N’oublie pas de compléter tes habitudes aujourd’hui.',
    },
    trigger: {
      channelId: Platform.OS === 'android' ? 'daily' : undefined,
      hour,
      minute,
      repeats: true,
    },
  });
  return id;
}