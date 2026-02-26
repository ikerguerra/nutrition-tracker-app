import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, TrendingUp, Target, Award } from 'lucide-react-native';
import { useStats } from '../hooks/useStats';
import { useColorScheme } from 'nativewind';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { format, subDays, startOfWeek } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const StatsScreen = () => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const screenWidth = Dimensions.get('window').width;

    const dateLocale = i18n.language === 'es' ? es : enUS;

    const {
        loading, error, weightHistory, macroTrends, goalAchievement, weeklySummary,
        loadWeightHistory, loadMacroTrends, loadGoalAchievement, loadWeeklySummary
    } = useStats();

    const [period, setPeriod] = useState(7); // 7, 30, 90 days

    useEffect(() => {
        const end = format(new Date(), 'yyyy-MM-dd');
        const start = format(subDays(new Date(), period), 'yyyy-MM-dd');
        const startOfCurWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

        loadWeightHistory(start, end);
        loadMacroTrends(start, end);
        loadGoalAchievement(start, end);
        loadWeeklySummary(startOfCurWeek);
    }, [period]);

    const chartConfig = {
        backgroundGradientFrom: isDark ? '#18181b' : '#ffffff',
        backgroundGradientTo: isDark ? '#18181b' : '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#16a34a"
        }
    };

    const renderWeightChart = () => {
        if (weightHistory.length < 2) return (
            <View className="h-40 items-center justify-center bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                <Text className="text-gray-400 italic">{t('stats.noWeight')}</Text>
            </View>
        );

        const data = {
            labels: weightHistory.map(d => format(new Date(d.date), 'dd/MM')),
            datasets: [{
                data: weightHistory.map(d => d.weight),
                color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                strokeWidth: 3
            }]
        };

        return (
            <LineChart
                data={data}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 24, marginVertical: 8 }}
            />
        );
    };

    const renderMacroChart = () => {
        if (macroTrends.length === 0) return null;

        const data = {
            labels: macroTrends.slice(-7).map(d => format(new Date(d.date), 'EE', { locale: dateLocale })),
            datasets: [{
                data: macroTrends.slice(-7).map(d => d.calories),
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            }]
        };

        return (
            <BarChart
                data={data}
                width={screenWidth - 32}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" kcal"
                chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                }}
                fromZero
                style={{ borderRadius: 24, marginVertical: 8 }}
            />
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-zinc-900">
                <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                    <ChevronLeft size={24} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-black dark:text-white">{t('stats.title')}</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                {/* Period Selector */}
                <View className="flex-row bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl mb-6">
                    {[7, 30, 90].map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p)}
                            className={`flex-1 py-2 rounded-xl items-center ${period === p ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
                        >
                            <Text className={`font-bold ${period === p ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                {p === 7 ? t('stats.periods.week') : p === 30 ? t('stats.periods.month') : t('stats.periods.threeMonths')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading && !weeklySummary ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <>
                        {/* Weekly Summary Cards */}
                        {weeklySummary && (
                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1 bg-green-50 dark:bg-green-900 p-4 rounded-3xl border border-green-100 dark:border-green-950">
                                    <View className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-2xl items-center justify-center mb-3">
                                        <TrendingUp size={20} color="#16a34a" />
                                    </View>
                                    <Text className="text-2xl font-bold text-green-700 dark:text-green-400">{weeklySummary.currentWeek.avgCalories}</Text>
                                    <Text className="text-xs text-green-600 dark:text-green-500 font-medium">{t('stats.avgCalories')}</Text>
                                </View>
                                <View className="flex-1 bg-blue-50 dark:bg-blue-900 p-4 rounded-3xl border border-blue-100 dark:border-blue-950">
                                    <View className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-2xl items-center justify-center mb-3">
                                        <Calendar size={20} color="#3b82f6" />
                                    </View>
                                    <Text className="text-2xl font-bold text-blue-700 dark:text-blue-400">{weeklySummary.currentWeek.daysLogged}</Text>
                                    <Text className="text-xs text-blue-600 dark:text-blue-500 font-medium">{t('stats.daysLogged')}</Text>
                                </View>
                            </View>
                        )}

                        {/* Weight Trend */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <Target size={20} color={isDark ? 'white' : 'black'} />
                                <Text className="text-lg font-bold text-black dark:text-white">{t('stats.weightTrend')}</Text>
                            </View>
                            {renderWeightChart()}
                        </View>

                        {/* Macro Trend */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <TrendingUp size={20} color={isDark ? 'white' : 'black'} />
                                <Text className="text-lg font-bold text-black dark:text-white">{t('stats.dailyCalories')}</Text>
                            </View>
                            {renderMacroChart()}
                        </View>

                        {/* Goal Achievement */}
                        {goalAchievement && (
                            <View className="bg-orange-50 dark:bg-zinc-900 p-6 rounded-3xl border border-orange-100 dark:border-zinc-800 mb-10">
                                <View className="flex-row items-center gap-3 mb-4">
                                    <Award size={24} color="#f97316" />
                                    <Text className="text-lg font-bold text-black dark:text-white">{t('stats.currentStreak')}</Text>
                                </View>
                                <View className="flex-row items-baseline gap-2">
                                    <Text className="text-4xl font-bold text-orange-600">{goalAchievement.currentStreak}</Text>
                                    <Text className="text-lg font-bold text-orange-500">{t('stats.days')}</Text>
                                </View>
                                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {t('stats.streakDesc', { achieved: goalAchievement.achievedDays, total: goalAchievement.totalDays })}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default StatsScreen;
