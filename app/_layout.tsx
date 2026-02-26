import React, { useEffect, useRef } from 'react';
import { Slot } from "expo-router";
import * as Notifications from 'expo-notifications';
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { FoodsProvider } from "../context/FoodsContext";
import { registerForPushNotificationsAsync } from '../services/pushNotificationService';
import pushNotificationService from '../services/pushNotificationService';
import "../global.css";
import "../i18n";

export default function RootLayout() {
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                pushNotificationService.subscribe(token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <FoodsProvider>
                    <Slot />
                </FoodsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
