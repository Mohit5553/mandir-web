import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { api } from '../services/api';

export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // Only works on real mobile devices or if properly configured in Web
    if (Capacitor.isNativePlatform()) {
      registerPush();
    }
  }, []);

  const registerPush = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('User denied push notification permissions');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        setFcmToken(token.value);
        
        // Register token with our backend
        try {
          await api.registerDeviceToken(token.value, Capacitor.getPlatform());
        } catch (error) {
          console.error('Failed to register device token with backend:', error);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on push registration:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
        // Optional: show a local toast if app is in foreground
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed:', notification);
      });

    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  return { fcmToken, registerPush };
};
