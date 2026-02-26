import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import apiClient from './apiClient';

// Configure how notifications should be handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return;
        }

        // Note: projectID is required for EAS Build and Expo Go.
        // It must be a valid UUID, obtained from EAS configuration.
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            // Validate that projectId is a valid UUID before calling Expo's API
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!projectId || !uuidRegex.test(projectId)) {
                console.warn('Push notifications: no valid EAS projectId configured. Skipping token registration.');
                return;
            }

            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            token = tokenResponse.data;
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

const pushNotificationService = {
    subscribe: async (token: string) => {
        try {
            await apiClient.post('/push-notifications/subscribe', {
                token,
                platform: Platform.OS,
                deviceModel: Device.modelName
            });
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    },

    unsubscribe: async (token: string) => {
        try {
            await apiClient.post('/push-notifications/unsubscribe', { token });
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
        }
    },

    sendLocalNotification: async (title: string, body: string, data = {}) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
            },
            trigger: null, // send immediately
        });
    }
};

export default pushNotificationService;
