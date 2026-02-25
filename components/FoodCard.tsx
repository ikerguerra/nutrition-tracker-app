import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, Edit2, Trash2, Plus, Flame } from 'lucide-react-native';
import type { Food } from '../types/food';

interface FoodCardProps {
    food: Food;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onAddToDailyLog?: (food: Food) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
    food,
    onEdit,
    onDelete,
    onAddToDailyLog,
    isFavorite,
    onToggleFavorite
}) => {
    const { id, name, brand, nutritionalInfo, servingSize, servingUnit } = food;

    return (
        <View className="bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 mb-3">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                    <Text className="text-lg font-bold text-black dark:text-white" numberOfLines={1}>{name}</Text>
                    {brand && <Text className="text-gray-500 dark:text-gray-400 mt-1">{brand}</Text>}
                </View>
                {onToggleFavorite && id && (
                    <TouchableOpacity
                        onPress={() => onToggleFavorite(id)}
                        className={`p-2 rounded-full ${isFavorite ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-zinc-900'}`}
                    >
                        <Heart size={20} color={isFavorite ? '#ef4444' : '#9ca3af'} fill={isFavorite ? '#ef4444' : 'transparent'} />
                    </TouchableOpacity>
                )}
            </View>

            <View className="flex-row items-center justify-between bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl mb-4">
                <View className="flex-row items-center">
                    <View className="bg-white dark:bg-zinc-800 p-2 rounded-lg mr-3">
                        <Flame size={18} color="#f97316" />
                    </View>
                    <View>
                        <Text className="text-base font-bold text-black dark:text-white leading-tight">
                            {nutritionalInfo?.calories || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 font-semibold uppercase">kcal</Text>
                    </View>
                </View>
                {servingSize && servingUnit && (
                    <View className="pl-4 border-l border-gray-200 dark:border-zinc-700">
                        <Text className="text-sm font-semibold text-black dark:text-white text-right">
                            {servingSize} <Text className="font-normal text-gray-500 text-xs">{servingUnit}</Text>
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row gap-2 mb-4">
                <View className="flex-1 space-y-1">
                    <Text className="text-sm font-bold text-black dark:text-white text-center">{nutritionalInfo?.protein || 0}g</Text>
                    <View className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                        <View className="h-full bg-blue-500 w-full" />
                    </View>
                    <Text className="text-[10px] text-gray-500 text-center uppercase font-semibold">Prot</Text>
                </View>
                <View className="flex-1 space-y-1">
                    <Text className="text-sm font-bold text-black dark:text-white text-center">{nutritionalInfo?.carbohydrates || 0}g</Text>
                    <View className="h-1.5 w-full bg-green-100 dark:bg-green-900/40 rounded-full overflow-hidden">
                        <View className="h-full bg-green-500 w-full" />
                    </View>
                    <Text className="text-[10px] text-gray-500 text-center uppercase font-semibold">Carbs</Text>
                </View>
                <View className="flex-1 space-y-1">
                    <Text className="text-sm font-bold text-black dark:text-white text-center">{nutritionalInfo?.fats || 0}g</Text>
                    <View className="h-1.5 w-full bg-orange-100 dark:bg-orange-900/40 rounded-full overflow-hidden">
                        <View className="h-full bg-orange-500 w-full" />
                    </View>
                    <Text className="text-[10px] text-gray-500 text-center uppercase font-semibold">Fat</Text>
                </View>
            </View>

            {(onEdit || onDelete || onAddToDailyLog) && (
                <View className="flex-row items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    {onAddToDailyLog && (
                        <TouchableOpacity
                            onPress={() => onAddToDailyLog(food)}
                            className="flex-1 bg-green-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
                        >
                            <Plus size={18} color="white" />
                            <Text className="text-white font-semibold">Añadir</Text>
                        </TouchableOpacity>
                    )}
                    {(onEdit || onDelete) && (
                        <View className="flex-row gap-2">
                            {onEdit && id && (
                                <TouchableOpacity
                                    onPress={() => onEdit(id)}
                                    className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl"
                                >
                                    <Edit2 size={18} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                            {onDelete && id && (
                                <TouchableOpacity
                                    onPress={() => onDelete(id)}
                                    className="p-3 bg-red-50 dark:bg-red-900/20 w-[42px] items-center justify-center rounded-xl"
                                >
                                    <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
