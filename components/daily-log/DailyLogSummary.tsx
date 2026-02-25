import React from 'react';
import { View, Text } from 'react-native';
import { DailyLog } from '../../types/dailyLog';

interface DailyLogSummaryProps {
    dailyLog: DailyLog | null;
    loading?: boolean;
    error?: string | null;
}

const ProgressBar = ({ label, value, max, colorOverride }: { label: string, value: number, max: number, colorOverride: string }) => {
    const currentPercent = Math.min(100, Math.round((value / max) * 100)) || 0;

    return (
        <View className="mb-3">
            <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</Text>
                <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {`${value.toFixed(1)} / ${max}g`}
                </Text>
            </View>
            <View className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden flex-row">
                <View className="h-full" style={{ width: `${currentPercent}%`, backgroundColor: colorOverride }} />
            </View>
        </View>
    );
};

const DailyLogSummary: React.FC<DailyLogSummaryProps> = ({ dailyLog, loading, error }) => {
    if (loading) {
        return (
            <View className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 mb-6 items-center justify-center min-h-[120px]">
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Cargando resumen...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="p-4 bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-900 mb-6">
                <Text className="text-red-500 dark:text-red-400 font-medium text-center">{error}</Text>
            </View>
        );
    }

    if (!dailyLog) {
        return (
            <View className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 mb-6 items-center justify-center min-h-[120px]">
                <Text className="text-gray-500 dark:text-gray-400 font-medium text-center">Sin datos para la fecha seleccionada</Text>
            </View>
        );
    }

    const calorieGoal = dailyLog.goals?.calorieGoal ?? 2000;
    const proteinGoal = dailyLog.goals?.proteinGoal ?? 150;
    const carbsGoal = dailyLog.goals?.carbsGoal ?? 200;
    const fatsGoal = dailyLog.goals?.fatsGoal ?? 65;

    const currentCalories = dailyLog.totals?.calories || 0;

    return (
        <View className="p-5 bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 mb-6">
            <View className="flex-col md:flex-row gap-6">
                <View className="flex-1 justify-center items-center py-2">
                    <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Calorías Totales</Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-4xl font-extrabold text-black dark:text-white">{Math.round(currentCalories)}</Text>
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">{`/ ${calorieGoal} kcal`}</Text>
                    </View>
                </View>

                <View className="flex-1 justify-center">
                    <ProgressBar
                        label="Proteínas"
                        value={dailyLog.totals?.protein || 0}
                        max={proteinGoal}
                        colorOverride="#3b82f6"
                    />
                    <ProgressBar
                        label="Carbohidratos"
                        value={dailyLog.totals?.carbs || 0}
                        max={carbsGoal}
                        colorOverride="#22c55e"
                    />
                    <ProgressBar
                        label="Grasas"
                        value={dailyLog.totals?.fats || 0}
                        max={fatsGoal}
                        colorOverride="#f97316"
                    />
                </View>
            </View>
        </View>
    );
};

export default DailyLogSummary;
