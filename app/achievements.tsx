import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trophy, Award } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementCard } from '../components/achievements/AchievementCard';

export default function AchievementsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { achievements, summary, loading, error, refresh } = useAchievements();

    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 mr-3"
                >
                    <ChevronLeft size={24} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full items-center justify-center">
                        <Trophy size={20} color="#eab308" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-black dark:text-white">Logros</Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Recompensas por tu constancia</Text>
                    </View>
                </View>
            </View>

            {loading && achievements.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#eab308" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                    <TouchableOpacity onPress={refresh} className="bg-red-50 dark:bg-red-900/30 px-6 py-3 rounded-xl">
                        <Text className="text-red-600 dark:text-red-400 font-bold">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

                    {/* Summary Cards */}
                    {summary && (
                        <View className="flex-row gap-3 mb-8">
                            <View className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 items-center">
                                <Text className="text-3xl font-black text-yellow-500">{summary.unlockedCount}</Text>
                                <Text className="text-xs font-semibold text-gray-500 mt-1 uppercase">Desbloqueados</Text>
                            </View>
                            <View className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 items-center">
                                <Text className="text-3xl font-black text-gray-800 dark:text-gray-200">{summary.totalCount}</Text>
                                <Text className="text-xs font-semibold text-gray-500 mt-1 uppercase">Total</Text>
                            </View>
                            <View className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 items-center">
                                <Text className="text-3xl font-black text-green-500">{summary.completionPercentage}%</Text>
                                <Text className="text-xs font-semibold text-gray-500 mt-1 uppercase">Completado</Text>
                            </View>
                        </View>
                    )}

                    {/* Unlocked Achievements */}
                    {unlocked.length > 0 && (
                        <View className="mb-6">
                            <View className="flex-row items-center gap-2 mb-4 px-2">
                                <Award size={18} color={isDark ? '#fbbf24' : '#d97706'} />
                                <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    Conseguidos ({unlocked.length})
                                </Text>
                            </View>
                            {unlocked.map(achievement => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </View>
                    )}

                    {/* Locked Achievements */}
                    {locked.length > 0 && (
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4 px-2">
                                <Trophy size={18} color={isDark ? '#52525b' : '#9ca3af'} />
                                <Text className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                    Por desbloquear ({locked.length})
                                </Text>
                            </View>
                            {locked.map(achievement => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </View>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
