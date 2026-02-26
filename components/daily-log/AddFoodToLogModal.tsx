import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Modal,
    ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Food } from '../../types/food';
import { useDailyLog } from '../../hooks/useDailyLog';
import { useColorScheme } from 'nativewind';
import { MealType } from '../../types/dailyLog';
import { Recipe } from '../../types/recipe';

interface AddFoodToLogModalProps {
    visible: boolean;
    item: Food | Recipe | null;
    mealType: MealType;
    targetDate: string; // YYYY-MM-DD
    onClose: () => void;
    onSuccess?: () => void;
}

const AddFoodToLogModal: React.FC<AddFoodToLogModalProps> = ({
    visible, item, mealType, targetDate, onClose, onSuccess
}) => {
    const { addEntry, loading } = useDailyLog(targetDate);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [quantity, setQuantity] = useState('100');
    const [unit, setUnit] = useState('g');

    useEffect(() => {
        if (visible && item) {
            if ('servingSize' in item) {
                const foodItem = item as any;
                setQuantity(foodItem.servingSize?.toString() || '100');
                setUnit(foodItem.servingUnit || 'g');
            } else {
                const recipeItem = item as any;
                setQuantity(recipeItem.servings?.toString() || '1');
                setUnit('raciones');
            }
        }
    }, [visible, item]);

    const handleConfirm = async () => {
        if (!item || !item.id) return;
        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) return;

        const isFood = 'servingSize' in item;

        try {
            await addEntry({
                date: targetDate,
                mealType: mealType,
                foodId: isFood ? item.id : undefined,
                recipeId: !isFood ? item.id : undefined,
                quantity: qtyNum,
                unit: unit
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error adding item:', err);
            alert('No se pudo añadir el elemento');
        }
    };

    if (!item) return null;
    const isFood = 'servingSize' in item;

    const mealTypeLabels: Record<string, string> = {
        BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena',
        MORNING_SNACK: 'Merienda (Mañana)', AFTERNOON_SNACK: 'Merienda (Tarde)', SNACK: 'Snack'
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-white dark:bg-zinc-950"
            >
                <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <Text className="text-xl font-bold text-black dark:text-white">Añadir al Diario</Text>
                    <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <X size={18} color={isDark ? '#e4e4e7' : '#18181b'} />
                    </TouchableOpacity>
                </View>

                <View className="px-5 pt-6">
                    {/* Food Summary */}
                    <View className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-zinc-800">
                        <Text className="text-lg font-bold text-black dark:text-white mb-1">{item.name}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {isFood ? ((item as any).brand || 'Alimento genérico') : 'Receta personalizada'}
                        </Text>

                        <View className="flex-row items-center gap-2">
                            <View className="bg-green-100 dark:bg-green-950 px-3 py-1.5 rounded-full">
                                <Text className="text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                                    {mealTypeLabels[mealType] || 'Comida'}
                                </Text>
                            </View>
                            <View className="bg-blue-100 dark:bg-blue-950 px-3 py-1.5 rounded-full">
                                <Text className="text-blue-700 dark:text-blue-400 text-xs font-bold">
                                    {targetDate}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quantity Input */}
                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Cantidad</Text>
                            <TextInput
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                className="h-12 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-black dark:text-white bg-white dark:bg-zinc-900 text-lg font-medium"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Unidad</Text>
                            <View className="flex-row gap-1">
                                {(isFood ? ['g', 'ml'] : ['raciones']).map(u => {
                                    const isSelected = unit === u;
                                    return (
                                        <TouchableOpacity
                                            key={u}
                                            onPress={() => setUnit(u)}
                                            style={[
                                                styles.unitBtn,
                                                isSelected ? styles.unitBtnSelected : styles.unitBtnUnselected
                                            ]}
                                        >
                                            <Text style={isSelected ? styles.unitBtnTextSelected : styles.unitBtnTextUnselected}>{u}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={loading || !quantity}
                        style={[
                            styles.submitBtn,
                            (loading || !quantity) && styles.submitBtnDisabled
                        ]}
                    >
                        {loading ? <ActivityIndicator size="small" color="white" /> : <Check size={20} color="white" />}
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Añadiendo...' : 'Confirmar y Añadir'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddFoodToLogModal;

const styles = StyleSheet.create({
    unitBtn: {
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
        borderWidth: 1,
    },
    unitBtnSelected: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    unitBtnUnselected: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    unitBtnTextSelected: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    unitBtnTextUnselected: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#16a34a',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    submitBtnDisabled: {
        backgroundColor: '#4ade80',
        opacity: 0.7,
    }
});
