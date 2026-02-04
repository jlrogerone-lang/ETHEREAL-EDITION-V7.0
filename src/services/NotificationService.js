/**
 * ETHEREAL v8.0 OMNI — NOTIFICATION SERVICE
 * =============================================
 * Recordatorios diarios de fragancia + notificaciones del sistema.
 * Usa expo-notifications para programar push locales.
 *
 * CAPA: GLOBAL v2
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEYS = {
  REMINDER_ENABLED: '@ethereal/reminder_enabled',
  REMINDER_HOUR: '@ethereal/reminder_hour',
  REMINDER_MINUTE: '@ethereal/reminder_minute',
};

let Notifications = null;

async function loadNotificationsModule() {
  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
    } catch (e) {
      console.warn('expo-notifications no disponible:', e.message);
    }
  }
  return Notifications;
}

// ── Permisos ──

async function requestPermissions() {
  const mod = await loadNotificationsModule();
  if (!mod) return { granted: false };

  const { status: existingStatus } = await mod.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await mod.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await mod.setNotificationChannelAsync('ethereal-daily', {
      name: 'Recordatorio Diario',
      importance: mod.AndroidImportance?.HIGH || 4,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });
  }

  return { granted: finalStatus === 'granted' };
}

// ── Recordatorio Diario ──

async function scheduleDailyReminder(hour = 8, minute = 0) {
  const mod = await loadNotificationsModule();
  if (!mod) return null;

  const { granted } = await requestPermissions();
  if (!granted) return null;

  await cancelAllReminders();

  const messages = [
    'Monsieur, su fragancia del día le espera.',
    'L\'Oracle ha preparado una recomendación para usted.',
    'Buenos días. ¿Qué aroma definirá su jornada?',
    'Su colección merece ser disfrutada hoy.',
    'Le Nez detecta un día perfecto para Oud & Rose.',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  const id = await mod.scheduleNotificationAsync({
    content: {
      title: "L'Essence du Luxe",
      body: message,
      data: { type: 'daily_reminder' },
      sound: true,
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      repeats: true,
    },
  });

  await AsyncStorage.setItem(KEYS.REMINDER_ENABLED, 'true');
  await AsyncStorage.setItem(KEYS.REMINDER_HOUR, String(hour));
  await AsyncStorage.setItem(KEYS.REMINDER_MINUTE, String(minute));

  return id;
}

async function cancelAllReminders() {
  const mod = await loadNotificationsModule();
  if (!mod) return;
  await mod.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(KEYS.REMINDER_ENABLED, 'false');
}

async function getReminderSettings() {
  const enabled = (await AsyncStorage.getItem(KEYS.REMINDER_ENABLED)) === 'true';
  const hour = parseInt(await AsyncStorage.getItem(KEYS.REMINDER_HOUR) || '8', 10);
  const minute = parseInt(await AsyncStorage.getItem(KEYS.REMINDER_MINUTE) || '0', 10);
  return { enabled, hour, minute };
}

// ── Notificación instantánea ──

async function sendLocalNotification(title, body, data = {}) {
  const mod = await loadNotificationsModule();
  if (!mod) return null;

  return mod.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}

export {
  requestPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
  getReminderSettings,
  sendLocalNotification,
};
