import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Recipe } from '../../types/recipe';
import { Clock, Users, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface RecipeCardProps {
    recipe: Recipe;
    onPress?: (recipe: Recipe) => void;
    onEdit?: (recipe: Recipe) => void;
    onDelete?: (recipe: Recipe) => void;
    onAdd?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, onEdit, onDelete, onAdd }) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { calories = 0, protein = 0, carbs = 0, fats = 0 } = recipe.nutritionPerServing ?? {};

    return (
        <TouchableOpacity
            onPress={() => onPress?.(recipe)}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-4 mb-4 border border-gray-100 dark:border-zinc-800 shadow-sm"
            activeOpacity={0.7}
        >
            <View className="flex-row gap-4">
                {recipe.imageUrl ? (
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800"
                    />
                ) : (
                    <View className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-950 items-center justify-center">
                        <Plus size={32} color="#16a34a" />
                    </View>
                )}

                <View className="flex-1 justify-between py-0.5">
                    <View>
                        <Text className="text-lg font-bold text-black dark:text-white" numberOfLines={1}>
                            {recipe.name}
                        </Text>
                        <View className="flex-row items-center mt-1 gap-3">
                            {!!recipe.prepTime && (
                                <View className="flex-row items-center gap-1">
                                    <Clock size={12} color="#6b7280" />
                                    <Text className="text-xs text-gray-500 dark:text-gray-400">{`${(recipe.prepTime || 0) + (recipe.cookTime || 0)} min`}</Text>
                                </View>
                            )}
                            <View className="flex-row items-center gap-1">
                                <Users size={12} color="#6b7280" />
                                <Text className="text-xs text-gray-500 dark:text-gray-400">{`${recipe.servings} raciones`}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-baseline">
                            <Text className="text-xl font-bold text-green-600 dark:text-green-500">{`${Math.round(calories || 0)}`}</Text>
                            <Text className="text-xs text-gray-500 ml-1">kcal</Text>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="items-center">
                                <Text className="text-[10px] text-gray-400 uppercase font-bold">P</Text>
                                <Text className="text-xs font-semibold text-black dark:text-white">{`${Math.round(protein || 0)}g`}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-[10px] text-gray-400 uppercase font-bold">C</Text>
                                <Text className="text-xs font-semibold text-black dark:text-white">{`${Math.round(carbs || 0)}g`}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-[10px] text-gray-400 uppercase font-bold">G</Text>
                                <Text className="text-xs font-semibold text-black dark:text-white">{`${Math.round(fats || 0)}g`}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800 gap-2">
                {onDelete && (
                    <TouchableOpacity
                        onPress={() => onDelete(recipe)}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-900"
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                )}
                {onEdit && (
                    <TouchableOpacity
                        onPress={() => onEdit(recipe)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800"
                    >
                        <Edit2 size={18} color={isDark ? '#d1d5db' : '#4b5563'} />
                    </TouchableOpacity>
                )}
                {onAdd && (
                    <TouchableOpacity
                        onPress={() => onAdd(recipe)}
                        className="flex-row items-center bg-green-600 px-4 py-2 rounded-xl gap-2"
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold">Añadir</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};
