import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Modal,
    ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
    FlatList, ScrollView, Alert
} from 'react-native';
import { X, Check, Plus, Trash2, Search, Edit2 } from 'lucide-react-native';
import { Recipe, CreateRecipeRequest } from '../../types/recipe';
import foodService from '../../services/foodService';
import recipeService from '../../services/recipeService';
import { Food } from '../../types/food';
import { useColorScheme } from 'nativewind';
import { SearchBar } from '../SearchBar';
import { useTranslation } from 'react-i18next';

interface RecipeFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Recipe | null;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
    visible, onClose, onSuccess, initialData
}) => {
    const { t } = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [servings, setServings] = useState('1');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [instructions, setInstructions] = useState('');
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [isPublic, setIsPublic] = useState(false);

    const [searchingFood, setSearchingFood] = useState(false);
    const [searchResults, setSearchResults] = useState<Food[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || '');
                setServings(initialData.servings.toString());
                setPrepTime(initialData.prepTime?.toString() || '');
                setCookTime(initialData.cookTime?.toString() || '');
                setInstructions(initialData.instructions || '');
                setIngredients(initialData.ingredients || []);
                setIsPublic(initialData.isPublic);
            } else {
                setName('');
                setDescription('');
                setServings('1');
                setPrepTime('');
                setCookTime('');
                setInstructions('');
                setIngredients([]);
                setIsPublic(false);
            }
        }
    }, [visible, initialData]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await foodService.searchFoods(query);
            setSearchResults(results.content);
        } catch (error) {
            console.error('Error searching foods:', error);
        }
    };

    const addIngredient = (food: Food) => {
        setIngredients(prev => [...prev, {
            foodId: food.id,
            foodName: food.name,
            quantity: 100,
            unit: food.servingUnit || 'g'
        }]);
        setSearchingFood(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const updateIngredientQuantity = (index: number, qty: string) => {
        const num = parseFloat(qty);
        setIngredients(prev => {
            const next = [...prev];
            next[index].quantity = isNaN(num) ? 0 : num;
            return next;
        });
    };

    const handleSave = async () => {
        if (!name || ingredients.length === 0) {
            Alert.alert(t('common.error'), t('recipes.errors.missingData'));
            return;
        }

        const request: CreateRecipeRequest = {
            name,
            description,
            servings: parseInt(servings) || 1,
            prepTime: parseInt(prepTime) || undefined,
            cookTime: parseInt(cookTime) || undefined,
            instructions,
            isPublic,
            ingredients: ingredients.map(ing => ({
                foodId: ing.foodId,
                quantity: ing.quantity,
                unit: ing.unit
            }))
        };

        setLoading(true);
        try {
            if (initialData) {
                await recipeService.updateRecipe(initialData.id, request);
            } else {
                await recipeService.createRecipe(request);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving recipe:', error);
            Alert.alert(t('common.error'), t('recipes.errors.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white dark:bg-zinc-950">
                <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <Text className="text-xl font-bold text-black dark:text-white">
                        {initialData ? t('recipes.editRecipe') : t('recipes.addRecipe')}
                    </Text>
                    <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <X size={18} color={isDark ? '#e4e4e7' : '#18181b'} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-4">
                        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('recipes.recipeName')}</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="h-12 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-black dark:text-white bg-white dark:bg-zinc-900"
                            placeholder={t('recipes.placeholders.name')}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('recipes.servings')}</Text>
                            <TextInput
                                value={servings}
                                onChangeText={setServings}
                                keyboardType="numeric"
                                className="h-12 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-black dark:text-white bg-white dark:bg-zinc-900"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('recipes.prepTime')}</Text>
                            <TextInput
                                value={prepTime}
                                onChangeText={setPrepTime}
                                keyboardType="numeric"
                                className="h-12 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-black dark:text-white bg-white dark:bg-zinc-900"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-black dark:text-white">{t('recipes.ingredients')}</Text>
                            <TouchableOpacity
                                onPress={() => setSearchingFood(true)}
                                className="flex-row items-center bg-green-100 dark:bg-green-950 px-3 py-1.5 rounded-full"
                            >
                                <Plus size={16} color="#16a34a" />
                                <Text className="text-green-700 dark:text-green-400 text-xs font-bold ml-1">{t('recipes.add')}</Text>
                            </TouchableOpacity>
                        </View>

                        {ingredients.length === 0 ? (
                            <View className="py-8 items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                                <Text className="text-gray-400 dark:text-zinc-600 italic">{t('recipes.noIngredients')}</Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {ingredients.map((ing, idx) => (
                                    <View key={idx} className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-2xl flex-row items-center border border-gray-100 dark:border-zinc-800">
                                        <View className="flex-1">
                                            <Text className="font-bold text-black dark:text-white text-sm" numberOfLines={1}>{ing.foodName}</Text>
                                            <TouchableOpacity onPress={() => removeIngredient(idx)} className="mt-1">
                                                <Text className="text-red-500 text-[10px] font-bold">{t('recipes.delete')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <TextInput
                                                value={ing.quantity.toString()}
                                                onChangeText={(val) => updateIngredientQuantity(idx, val)}
                                                keyboardType="numeric"
                                                className="w-16 h-8 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 text-center text-xs font-bold text-black dark:text-white bg-white dark:bg-zinc-950"
                                            />
                                            <Text className="text-xs text-gray-500 font-medium w-6">{ing.unit}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('recipes.instructions')}</Text>
                        <TextInput
                            value={instructions}
                            onChangeText={setInstructions}
                            multiline
                            numberOfLines={4}
                            className="min-h-[100px] border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-900"
                            placeholder={t('recipes.placeholders.instructions')}
                            placeholderTextColor="#9ca3af"
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="h-20" />
                </ScrollView>

                <View className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-green-600 h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm"
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Check size={20} color="white" />}
                        <Text className="text-white font-bold text-lg">{loading ? t('recipes.saving') : t('recipes.saveRecipe')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Internal Search Modal for Ingredients */}
                <Modal visible={searchingFood} animationType="fade" transparent={true}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                        <View className="bg-white dark:bg-zinc-900 rounded-3xl h-[80%] shadow-xl overflow-hidden">
                            <View className="p-5 border-b border-gray-100 dark:border-zinc-800 flex-row items-center justify-between">
                                <Text className="text-lg font-bold text-black dark:text-white">{t('recipes.searchIngredient')}</Text>
                                <TouchableOpacity onPress={() => setSearchingFood(false)}>
                                    <X size={20} color={isDark ? '#e4e4e7' : '#18181b'} />
                                </TouchableOpacity>
                            </View>
                            <View className="px-5 pt-4">
                                <SearchBar onSearch={handleSearch} />
                            </View>
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                                contentContainerStyle={{ padding: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => addIngredient(item)}
                                        className="py-3 border-b border-gray-50 dark:border-zinc-800 flex-row items-center justify-between"
                                    >
                                        <View>
                                            <Text className="font-bold text-black dark:text-white">{item.name}</Text>
                                            <Text className="text-xs text-gray-500">{item.brand || 'Genérico'}</Text>
                                        </View>
                                        <Plus size={20} color="#16a34a" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View className="py-10 items-center">
                                        <Text className="text-gray-400">{searchQuery ? t('recipes.placeholders.search') : t('common.search')}</Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

export default RecipeFormModal;

const styles = StyleSheet.create({});
