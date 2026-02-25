import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Moon, Sun, Monitor } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const { theme, setTheme, isDark } = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun size={20} color="#f59e0b" />;
        if (theme === 'dark') return <Moon size={20} color="#a855f7" />;
        return <Monitor size={20} color="#64748b" />;
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            <View className="flex-1 items-center justify-center p-6">
                <View className="h-24 w-24 bg-green-100 dark:bg-green-900/40 rounded-full items-center justify-center mb-6">
                    <Text className="text-4xl text-green-700 dark:text-green-400 font-bold">
                        {user?.firstName?.[0] || 'U'}
                    </Text>
                </View>
                <Text className="text-2xl font-bold text-black dark:text-white">{user?.firstName} {user?.lastName}</Text>
                <Text className="text-gray-500 mt-1 mb-10">{user?.email}</Text>

                <View className="w-full space-y-4">
                    <TouchableOpacity
                        onPress={cycleTheme}
                        className="w-full h-14 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex-row items-center justify-between px-5 mb-4"
                    >
                        <View className="flex-row items-center">
                            {getThemeIcon()}
                            <Text className="text-black dark:text-white font-medium ml-3 text-base">
                                Appearance: <Text className="capitalize">{theme}</Text>
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="w-full h-14 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex-row items-center justify-center"
                    >
                        <LogOut size={20} color="#ef4444" className="mr-2" />
                        <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
