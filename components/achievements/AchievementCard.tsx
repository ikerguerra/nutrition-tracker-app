import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Star, Target, CalendarDays, Flame, Check, Scale } from 'lucide-react-native';
import { AchievementDto, AchievementType } from '../../types/achievement';
import { useColorScheme } from 'nativewind';

interface AchievementCardProps {
    achievement: AchievementDto;
}

const getAchievementIcon = (type: AchievementType, isDark: boolean, unlocked: boolean) => {
    const color = unlocked ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#52525b' : '#9ca3af');
    const size = 32;

    switch (type) {
        case 'STREAK_3':
        case 'STREAK_7':
        case 'STREAK_30':
        case 'STREAK_100':
            return <Flame size={size} color={color} />;
        case 'FIRST_LOG':
        case 'FIRST_RECIPE':
        case 'FIRST_TEMPLATE':
        case 'FIRST_RECOMMENDATION':
            return <Star size={size} color={color} />;
        case 'FIRST_GOAL':
            return <Target size={size} color={color} />;
        case 'WEIGHT_LOGGED':
        case 'WEIGHT_MILESTONE':
            return <Scale size={size} color={color} />;
        case 'CONSISTENCY_WEEK':
        case 'CONSISTENCY_MONTH':
            return <CalendarDays size={size} color={color} />;
        default:
            return <Trophy size={size} color={color} />;
    }
};

const getAchievementColor = (type: AchievementType) => {
    if (type.startsWith('STREAK')) return { bg: 'bg-orange-100 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-900', text: 'text-orange-700 dark:text-orange-400' };
    if (type.startsWith('FIRST')) return { bg: 'bg-yellow-100 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-900', text: 'text-yellow-700 dark:text-yellow-400' };
    if (type.startsWith('WEIGHT')) return { bg: 'bg-blue-100 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-400' };
    if (type.startsWith('CONSISTENCY')) return { bg: 'bg-green-100 dark:bg-green-950', border: 'border-green-200 dark:border-green-900', text: 'text-green-700 dark:text-green-400' };
    return { bg: 'bg-purple-100 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-700 dark:text-purple-400' };
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = getAchievementColor(achievement.type);

    // Fallbacks for display name and description if missing from backend dto mapping
    const displayName = achievement.displayName || achievement.type.replace('_', ' ');

    if (achievement.unlocked) {
        return (
            <View className={`rounded-3xl p-5 mb-4 border ${colors.border} ${colors.bg}`}>
                <View className="flex-row items-start gap-4">
                    <View className="h-16 w-16 bg-white dark:bg-black/20 rounded-2xl items-center justify-center shadow-sm">
                        {getAchievementIcon(achievement.type, isDark, true)}
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                            <Text className={`text-lg font-bold ${colors.text} flex-1 mr-2`} numberOfLines={2}>
                                {displayName}
                            </Text>
                            <View className="bg-white/50 dark:bg-black/20 p-1.5 rounded-full">
                                <Check size={16} color={isDark ? '#4ade80' : '#16a34a'} />
                            </View>
                        </View>
                        {achievement.unlockedAt && (
                            <Text className={`text-xs mt-1 opacity-70 ${colors.text}`}>
                                Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    // Locked state
    return (
        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 mb-4 border border-gray-100 dark:border-zinc-800 shadow-sm opacity-80">
            <View className="flex-row items-start gap-4">
                <View className="h-16 w-16 bg-gray-50 dark:bg-zinc-800 rounded-2xl items-center justify-center">
                    {getAchievementIcon(achievement.type, isDark, false)}
                </View>
                <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1" numberOfLines={2}>
                        {displayName}
                    </Text>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs font-semibold text-gray-500">Progreso</Text>
                        <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {achievement.progress} / {achievement.target}
                        </Text>
                    </View>
                    <View className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-gray-400 dark:bg-zinc-600 rounded-full"
                            style={{ width: `${Math.min(100, achievement.progressPercentage || 0)}%` }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};
