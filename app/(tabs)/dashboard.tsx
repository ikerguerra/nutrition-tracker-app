import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Utensils } from 'lucide-react-native';
import useDailyLog from '../../hooks/useDailyLog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutritionCharts } from '../../components/dashboard/NutritionCharts';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const { dailyLog, loading } = useDailyLog();
    const router = useRouter();

    const renderRecentMeals = () => {
        if (!dailyLog || !dailyLog.meals) return null;

        const allEntries = Object.values(dailyLog.meals).flat();

        if (allEntries.length === 0) {
            return (
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-4 mb-4">No hay comidas registradas hoy.</Text>
            );
        }

        // Show up to 3 most recent entries
        return allEntries.slice(0, 3).map((entry) => (
            <View key={entry.id.toString()} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 mb-2">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <View className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-3">
                            <Utensils size={20} color="#3b82f6" />
                        </View>
                        <View className="flex-1 pr-2">
                            <Text className="font-semibold text-black dark:text-white text-base capitalize">{entry.mealType.replace('_', ' ').toLowerCase()}</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>{entry.foodName}</Text>
                        </View>
                    </View>
                    <Text className="font-bold text-black dark:text-white">{Math.round(entry.calories || 0)} kcal</Text>
                </View>
            </View>
        ));
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-zinc-950">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="p-6 pt-4">
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium capitalize">
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            </Text>
                            <Text className="text-2xl font-bold text-black dark:text-white mt-1">
                                {t('dashboard.greeting', { name: user?.firstName || 'User' }) || `Hello, ${user?.firstName || 'User'}`} 👋
                            </Text>
                        </View>
                        <View className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-full items-center justify-center">
                            <Text className="text-green-700 dark:text-green-400 font-bold">
                                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>

                    {/* Quick Add Section */}
                    <View className="bg-green-600 rounded-2xl p-5 mb-6 shadow-sm">
                        <Text className="text-lg font-bold text-white mb-4">
                            {t('dashboard.addFoodTitle') || '¿Qué has comido hoy?'}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/foods')} className="flex-row items-center bg-white/20 rounded-xl p-3">
                            <Search size={20} color="#ffffff" className="mr-3" />
                            <Text className="text-green-50 font-medium">
                                {t('dashboard.searchFoodBtn') || 'Buscar alimentos...'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Summary Cards */}
                    {loading && !dailyLog ? (
                        <ActivityIndicator size="small" color="#16a34a" className="mb-8" />
                    ) : (
                        <View className="flex-row space-x-4 mb-8">
                            <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 mr-2">
                                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Calorías</Text>
                                <Text className="text-xl font-bold text-black dark:text-white">
                                    {Math.round(dailyLog?.totals?.calories || 0)}
                                    <Text className="text-sm font-normal text-gray-500"> / {dailyLog?.goals?.calorieGoal || 2000}</Text>
                                </Text>
                            </View>
                            <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 ml-2">
                                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Proteínas</Text>
                                <Text className="text-xl font-bold text-black dark:text-white">
                                    {Math.round(dailyLog?.totals?.protein || 0)}g
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Recent Entries */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-black dark:text-white">Añadidos recientes</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/daily-log')}>
                                <Text className="text-green-600 font-medium">Ver Todo</Text>
                            </TouchableOpacity>
                        </View>

                        {loading && !dailyLog ? <ActivityIndicator size="small" color="#16a34a" /> : renderRecentMeals()}

                        <TouchableOpacity onPress={() => router.push('/(tabs)/daily-log')} className="bg-dashed border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-4 flex-row justify-center items-center mt-4">
                            <Plus size={20} color="#6b7280" className="mr-2" />
                            <Text className="text-gray-500 dark:text-gray-400 font-medium">Registrar nueva comida</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Charts Overview */}
                    <View className="mb-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-black dark:text-white">Resumen Nutricional</Text>
                        </View>
                        {loading && !dailyLog ? (
                            <ActivityIndicator size="small" color="#16a34a" />
                        ) : (
                            <NutritionCharts dailyLog={dailyLog} />
                        )}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
