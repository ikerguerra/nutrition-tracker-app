import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { MealEntry, MealType } from '../../types/dailyLog';
import MealEntryCard from './MealEntryCard';
import { useColorScheme } from 'nativewind';

interface MealSectionProps {
    mealType: MealType;
    title: string;
    entries: MealEntry[];
    onUpdate: (id: number, entry: { quantity: number; unit: string }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onAddFood: (mealType: MealType) => void;
}

const MealSection: React.FC<MealSectionProps> = ({
    mealType,
    title,
    entries,
    onUpdate,
    onDelete,
    onAddFood
}) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const totalCalories = entries.reduce((acc, entry) => acc + (entry.calories || 0), 0);

    return (
        <View className="mb-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <View className="flex-row items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <View className="flex-row items-center">
                    <Text className="text-lg font-bold text-black dark:text-white mr-2">{title}</Text>
                    {entries.length > 0 && (
                        <View className="bg-gray-200 dark:bg-zinc-800 px-2 rounded-full">
                            <Text className="text-xs font-medium text-black dark:text-gray-300">{entries.length}</Text>
                        </View>
                    )}
                </View>
                <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-semibold text-black dark:text-white">{totalCalories} kcal</Text>
                    <TouchableOpacity onPress={() => onAddFood(mealType)} className="p-1 rounded-full bg-green-500">
                        <Plus size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-col">
                {entries.length === 0 ? (
                    <View className="p-6 items-center justify-center">
                        <Text className="text-gray-400 dark:text-zinc-600 text-sm italic font-medium">Sin alimentos añadidos</Text>
                    </View>
                ) : (
                    entries.map((entry) => (
                        <MealEntryCard
                            key={entry.id.toString()}
                            entry={entry}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </View>

            {entries.length > 0 && (
                <TouchableOpacity
                    onPress={() => onAddFood(mealType)}
                    className="p-3 border-t border-gray-100 dark:border-zinc-800 items-center bg-gray-50/30 dark:bg-zinc-900/20"
                >
                    <Text className="text-sm font-medium text-green-600 dark:text-green-500">Añadir más a {title.toLowerCase()}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default MealSection;
