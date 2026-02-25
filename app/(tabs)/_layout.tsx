import { Tabs } from 'expo-router';
import { Home, ClipboardList, ScanBarcode, User, CalendarDays, UtensilsCrossed } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: isDark ? '#4ade80' : '#16a34a',
            tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
            tabBarStyle: {
                backgroundColor: isDark ? '#09090b' : '#ffffff',
                borderTopWidth: 1,
                borderTopColor: isDark ? '#27272a' : '#f3f4f6',
            },
            tabBarLabelStyle: {
                fontSize: 10,
            }
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="daily-log"
                options={{
                    title: 'Diario',
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
                    title: 'Alimentos',
                    tabBarIcon: ({ color, size }) => <UtensilsCrossed size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Historial',
                    tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
