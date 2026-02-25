import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFoods } from '../../hooks/useFoods';
import { FoodCard } from '../../components/FoodCard';
import { SearchBar } from '../../components/SearchBar';
import { PackageOpen, Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import FoodFormModal from '../../components/foods/FoodFormModal';
import { Food } from '../../types/food';

type TabType = 'all' | 'favorites' | 'recent' | 'frequent';

export default function FoodsScreen() {
    const {
        foods, loading, error, favoriteIds,
        refresh, loadFavorites, loadRecent, loadFrequent,
        addFavorite, removeFavorite, searchFoods,
        deleteFood,
    } = useFoods();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingFood, setEditingFood] = useState<Food | null>(null);
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
        if (loading && foods.length === 0) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando alimentos...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <Text className="text-red-500 text-center">{error}</Text>
                    <TouchableOpacity onPress={() => refresh()} className="mt-4 px-4 py-2 bg-red-50 rounded-lg">
                        <Text className="text-red-600 font-medium">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (foods.length === 0) {
            return (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                        <PackageOpen size={48} color="#9ca3af" />
                    </View>
                    <Text className="text-lg font-bold text-black dark:text-white mb-2">No hay alimentos en esta lista</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center">Intenta cambiar de filtro o agrega nuevos alimentos.</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={foods}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <FoodCard
                        food={item}
                        isFavorite={item.id ? favoriteIds.includes(item.id) : false}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            />
        );
    };

    const tabs: { label: string; value: TabType }[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Favoritos', value: 'favorites' },
        { label: 'Recientes', value: 'recent' },
        { label: 'Frecuentes', value: 'frequent' },
    ];

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            <View className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-black dark:text-white">Alimentos</Text>
                    <TouchableOpacity
                        onPress={() => { setEditingFood(null); setShowForm(true); }}
                        className="h-9 w-9 bg-green-600 rounded-full items-center justify-center shadow-sm"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl mb-4">
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.value}
                            onPress={() => setActiveTab(tab.value)}
                            className={activeTab === tab.value
                                ? "flex-1 py-2 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm"
                                : "flex-1 py-2 items-center justify-center rounded-lg"}
                        >
                            <Text className={activeTab === tab.value
                                ? "font-medium text-black dark:text-white text-xs"
                                : "font-medium text-gray-500 dark:text-gray-400 text-xs"}
                            >{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
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
        </SafeAreaView>
    );
}


