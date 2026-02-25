import { Tabs } from 'expo-router';
import { Home, ClipboardList, ScanBarcode, User, CalendarDays } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: isDark ? '#4ade80' : '#16a34a', // green-400 : green-600
            tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
            tabBarStyle: {
                backgroundColor: isDark ? '#09090b' : '#ffffff', // zinc-950 : white
                borderTopWidth: 1,
                borderTopColor: isDark ? '#27272a' : '#f3f4f6', // zinc-800 : gray-100
            }
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="daily-log"
                options={{
                    title: 'Log',
                    tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size }) => <ScanBarcode size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="foods"
                options={{
                    title: 'Foods',
                    tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
