import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDailyLog } from '../../hooks/useDailyLog';
import DailyLogSummary from '../../components/daily-log/DailyLogSummary';
import MealSection from '../../components/daily-log/MealSection';
import { MealType, MealEntry } from '../../types/dailyLog';
import { Calendar } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

// Native date formatter – avoids date-fns ESM/CJS Metro issues
const formatDateEs = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function DailyLogScreen() {
    const { dailyLog, loading, error, loadDailyLog, updateEntry, deleteEntry } = useDailyLog();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const groupedMeals = useMemo(() => {
        const defaults: Record<MealType, MealEntry[]> = {
            BREAKFAST: [],
            MORNING_SNACK: [],
            LUNCH: [],
            AFTERNOON_SNACK: [],
            DINNER: [],
            SNACK: [], // keeping for backwards compatibility
        };

        if (!dailyLog || !dailyLog.meals) {
            return defaults;
        }
        return { ...defaults, ...dailyLog.meals };
    }, [dailyLog]);

    const handleAddFood = (mealType: MealType) => {
        const dateStr = dailyLog?.date || new Date().toISOString().split('T')[0];
        router.push({
            pathname: '/(tabs)/foods',
            params: { mealType, date: dateStr }
        });
    };

    const displayDate = React.useMemo(() => {
        if (!dailyLog?.date) return formatDateEs(new Date());
        const [year, month, day] = dailyLog.date.split('-');
        return formatDateEs(new Date(Number(year), Number(month) - 1, Number(day)));
    }, [dailyLog?.date]);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-zinc-950">
            <View className="px-4 py-3 bg-white dark:bg-zinc-950 flex-row items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                <Text className="text-2xl font-bold text-black dark:text-white">Diario</Text>
                <TouchableOpacity className="flex-row items-center bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
                    <Calendar size={14} color={isDark ? '#e4e4e7' : '#18181b'} className="mr-1.5" />
                    <Text className="text-sm font-medium text-black dark:text-white capitalize">{displayDate}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <DailyLogSummary
                    dailyLog={dailyLog}
                    loading={loading && !dailyLog}
                    error={error}
                />

                {loading && !dailyLog ? (
                    <View className="py-8 items-center justify-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <>
                        <MealSection
                            title="Desayuno"
                            mealType="BREAKFAST"
                            entries={groupedMeals.BREAKFAST}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                        />

                        <MealSection
                            title="Media Mañana"
                            mealType="MORNING_SNACK"
                            entries={groupedMeals.MORNING_SNACK}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                        />

                        <MealSection
                            title="Almuerzo"
                            mealType="LUNCH"
                            entries={groupedMeals.LUNCH}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                        />

                        <MealSection
                            title="Merienda"
                            mealType="AFTERNOON_SNACK"
                            entries={groupedMeals.AFTERNOON_SNACK}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                        />

                        <MealSection
                            title="Cena"
                            mealType="DINNER"
                            entries={groupedMeals.DINNER}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                        />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
