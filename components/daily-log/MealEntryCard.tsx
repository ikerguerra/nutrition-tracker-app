import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, X, Copy, Pencil, Trash2 } from 'lucide-react-native';
import { MealEntry } from '../../types/dailyLog';
import { useColorScheme } from 'nativewind';

interface MealEntryCardProps {
    entry: MealEntry;
    onUpdate: (id: number, entry: { quantity: number; unit: string }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onCopy?: (entry: MealEntry) => void;
}

const MealEntryCard: React.FC<MealEntryCardProps> = ({ entry, onUpdate, onDelete, onCopy }) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(entry.quantity.toString());
    const [unit, setUnit] = useState(entry.unit || 'g');

    const handleSave = async () => {
        await onUpdate(entry.id, { quantity: Number(quantity), unit });
        setIsEditing(false);
    };

    return (
        <View className="flex-col gap-2 p-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                    <Text className="font-medium text-black dark:text-white" numberOfLines={1}>{entry.foodName}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entry.brand ? `${entry.brand} • ` : ''}{entry.quantity} {entry.unit}
                    </Text>
                </View>

                {isEditing ? (
                    <View className="flex-row items-center gap-2">
                        <TextInput
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                            className="h-8 w-16 border border-gray-200 dark:border-zinc-700 rounded-md px-2 text-black dark:text-white dark:bg-zinc-900"
                        />
                        <TouchableOpacity onPress={handleSave} className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                            <Check size={16} color={isDark ? '#4ade80' : '#16a34a'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditing(false)} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
                            <X size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-col items-end min-w-[80px]">
                        <Text className="font-semibold text-sm text-black dark:text-white">{entry.calories || 0} kcal</Text>
                        <Text className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase font-medium">
                            P {entry.protein || 0} • C {entry.carbs || 0} • F {entry.fats || 0}
                        </Text>
                    </View>
                )}
            </View>

            {!isEditing && (
                <View className="flex-row items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-50 dark:border-zinc-900">
                    {onCopy && (
                        <TouchableOpacity onPress={() => onCopy(entry)} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                            <Copy size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                        <Pencil size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(entry.id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default MealEntryCard;
