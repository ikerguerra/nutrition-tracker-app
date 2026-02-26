import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFoods } from '../../hooks/useFoods';
import { FoodCard } from '../../components/FoodCard';
import { SearchBar } from '../../components/SearchBar';
import { PackageOpen, Plus, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import FoodFormModal from '../../components/foods/FoodFormModal';
import RecipeFormModal from '../../components/recipes/RecipeFormModal';
import AddFoodToLogModal from '../../components/daily-log/AddFoodToLogModal';
import { Food } from '../../types/food';
import { MealType } from '../../types/dailyLog';
import { Recipe } from '../../types/recipe';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeCard } from '../../components/recipes/RecipeCard';

type TabType = 'all' | 'favorites' | 'recent' | 'frequent' | 'recipes';

export default function FoodsScreen() {
    const {
        foods, loading: foodsLoading, error: foodsError, favoriteIds,
        refresh, loadFavorites, loadRecent, loadFrequent,
        addFavorite, removeFavorite, searchFoods,
        deleteFood,
    } = useFoods();
    const {
        recipes, loading: recipesLoading, error: recipesError,
        loadRecipes, deleteRecipe
    } = useRecipes();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const params = useLocalSearchParams<{ mealType?: MealType; date?: string }>();
    const router = useRouter();

    const pickerMealType = params.mealType;
    const pickerDate = params.date || new Date().toISOString().split('T')[0];
    const isPickerMode = !!pickerMealType;

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [showForm, setShowForm] = useState(false);
    const [showRecipeForm, setShowRecipeForm] = useState(false);
    const [editingFood, setEditingFood] = useState<Food | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [addingItem, setAddingItem] = useState<Food | Recipe | null>(null);
    const isFirstRun = React.useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (activeTab === 'all') refresh();
        else if (activeTab === 'favorites') loadFavorites();
        else if (activeTab === 'recent') loadRecent();
        else if (activeTab === 'frequent') loadFrequent();
        else if (activeTab === 'recipes') loadRecipes();
    }, [activeTab]);

    const handleToggleFavorite = async (id: number) => {
        if (favoriteIds.includes(id)) {
            await removeFavorite(id);
            if (activeTab === 'favorites') loadFavorites();
        } else {
            await addFavorite(id);
        }
    };

    const handleEdit = (id: number) => {
        const food = foods.find(f => f.id === id);
        if (food) {
            setEditingFood(food);
            setShowForm(true);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Eliminar alimento',
            '¿Estás seguro de que quieres eliminar este alimento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteFood(id);
                        refresh();
                    },
                },
            ]
        );
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingFood(null);
    };

    const handleFormSuccess = () => {
        refresh();
    };

    const renderContent = () => {
        const isLoading = activeTab === 'recipes' ? recipesLoading : foodsLoading;
        const currentError = activeTab === 'recipes' ? recipesError : foodsError;
        const rawData = activeTab === 'recipes' ? recipes : foods;
        const currentData = Array.isArray(rawData) ? rawData : [];

        if (isLoading && (!currentData || currentData.length === 0)) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando...</Text>
                </View>
            );
        }

        if (currentError) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <Text className="text-red-500 text-center">{currentError}</Text>
                    <TouchableOpacity onPress={() => activeTab === 'recipes' ? loadRecipes() : refresh()} className="mt-4 px-4 py-2 bg-red-50 rounded-lg">
                        <Text className="text-red-600 font-medium">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!currentData || currentData.length === 0) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                        <PackageOpen size={48} color="#9ca3af" />
                    </View>
                    <Text className="text-lg font-bold text-black dark:text-white mb-2">
                        {activeTab === 'recipes' ? 'No tienes recetas' : 'No hay alimentos en esta lista'}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                        {activeTab === 'recipes' ? 'Crea tu primera receta para empezar.' : 'Intenta cambiar de filtro o agrega nuevos alimentos.'}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={currentData}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    if (activeTab === 'recipes') {
                        return (
                            <RecipeCard
                                recipe={item as Recipe}
                                onEdit={(r) => {
                                    setEditingRecipe(r);
                                    setShowRecipeForm(true);
                                }}
                                onDelete={(r) => {
                                    Alert.alert('Eliminar receta', '¿Estás seguro?', [
                                        { text: 'No' },
                                        { text: 'Sí', onPress: () => deleteRecipe(r.id) }
                                    ]);
                                }}
                                onAdd={isPickerMode ? (r) => setAddingItem(r) : undefined}
                            />
                        );
                    }
                    return (
                        <FoodCard
                            food={item as Food}
                            isFavorite={item.id ? favoriteIds.includes(item.id) : false}
                            onToggleFavorite={handleToggleFavorite}
                            onEdit={isPickerMode ? undefined : handleEdit}
                            onDelete={isPickerMode ? undefined : handleDelete}
                            onAddToDailyLog={isPickerMode ? () => setAddingItem(item as Food) : undefined}
                        />
                    );
                }}
            />
        );
    };

    const tabs: { label: string; value: TabType }[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Favoritos', value: 'favorites' },
        { label: 'Recientes', value: 'recent' },
        { label: 'Frecuentes', value: 'frequent' },
        { label: 'Recetas', value: 'recipes' },
    ];

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            {isPickerMode && (
                <View className="bg-green-600 px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-white font-semibold">
                        Añadiendo a: <Text className="font-bold">{(String(pickerMealType || '')).replace('_', ' ')}</Text>
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/daily-log')} className="p-1 bg-green-700 rounded-full">
                        <X size={16} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <View className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-black dark:text-white">Alimentos</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (activeTab === 'recipes') {
                                setEditingRecipe(null);
                                setShowRecipeForm(true);
                            } else {
                                setEditingFood(null);
                                setShowForm(true);
                            }
                        }}
                        className="h-9 w-9 bg-green-600 rounded-full items-center justify-center shadow-sm"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={[foodStyles.tabBar, { backgroundColor: isDark ? '#18181b' : '#f3f4f6' }]}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.value;
                        return (
                            <TouchableOpacity
                                key={tab.value}
                                onPress={() => setActiveTab(tab.value)}
                                style={[
                                    foodStyles.tabBtn,
                                    isActive && [foodStyles.tabBtnActive, { backgroundColor: isDark ? '#3f3f46' : '#ffffff' }]
                                ]}
                            >
                                <Text style={[
                                    foodStyles.tabText,
                                    { color: isActive ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#9ca3af' : '#6b7280') }
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {activeTab === 'all' && (
                    <View className="mb-2">
                        <SearchBar
                            onSearch={(query) => {
                                if (query) searchFoods(query);
                                else refresh();
                            }}
                        />
                    </View>
                )}
            </View>

            <View className="flex-1">
                {renderContent()}
            </View>

            <FoodFormModal
                visible={showForm}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                initialData={editingFood}
            />

            <RecipeFormModal
                visible={showRecipeForm}
                onClose={() => {
                    setShowRecipeForm(false);
                    setEditingRecipe(null);
                }}
                onSuccess={() => loadRecipes()}
                initialData={editingRecipe}
            />

            {isPickerMode && (
                <AddFoodToLogModal
                    visible={!!addingItem}
                    item={addingItem}
                    mealType={pickerMealType as MealType}
                    targetDate={pickerDate}
                    onClose={() => setAddingItem(null)}
                    onSuccess={() => {
                        setAddingItem(null);
                        router.push('/(tabs)/daily-log');
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const foodStyles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    tabBtnActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
