import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Modal,
    ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { useFoods } from '../../hooks/useFoods';
import { Food } from '../../types/food';
import { useColorScheme } from 'nativewind';

interface FoodFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: Food | null;
}

interface NutritionForm {
    calories: string;
    protein: string;
    carbohydrates: string;
    fats: string;
    fiber: string;
    sugars: string;
    sodium: string;
}

interface FormData {
    name: string;
    brand: string;
    barcode: string;
    servingSize: string;
    servingUnit: 'g' | 'ml';
    nutritionalInfo: NutritionForm;
}

const defaultForm = (): FormData => ({
    name: '',
    brand: '',
    barcode: '',
    servingSize: '100',
    servingUnit: 'g',
    nutritionalInfo: {
        calories: '',
        protein: '',
        carbohydrates: '',
        fats: '',
        fiber: '',
        sugars: '',
        sodium: '',
    }
});

// --------------- Input Row ---------------
interface InputRowProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    numeric?: boolean;
    required?: boolean;
}
const InputRow: React.FC<InputRowProps> = ({ label, value, onChange, placeholder, numeric, required }) => (
    <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
            {label}{required ? ' *' : ''}
        </Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            keyboardType={numeric ? 'numeric' : 'default'}
            className="h-11 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 text-black dark:text-white bg-gray-50 dark:bg-zinc-900 text-sm"
            placeholderTextColor="#9ca3af"
        />
    </View>
);

// --------------- Main Component ---------------
const FoodFormModal: React.FC<FoodFormModalProps> = ({ visible, onClose, onSuccess, initialData }) => {
    const { createFood, updateFood, loading } = useFoods();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isEditing = !!initialData?.id;

    const [formData, setFormData] = useState<FormData>(defaultForm());

    useEffect(() => {
        if (visible && initialData) {
            setFormData({
                name: initialData.name || '',
                brand: initialData.brand || '',
                barcode: initialData.barcode || '',
                servingSize: initialData.servingSize?.toString() || '100',
                servingUnit: (initialData.servingUnit as 'g' | 'ml') || 'g',
                nutritionalInfo: {
                    calories: initialData.nutritionalInfo?.calories?.toString() || '',
                    protein: initialData.nutritionalInfo?.protein?.toString() || '',
                    carbohydrates: initialData.nutritionalInfo?.carbohydrates?.toString() || '',
                    fats: initialData.nutritionalInfo?.fats?.toString() || '',
                    fiber: initialData.nutritionalInfo?.fiber?.toString() || '',
                    sugars: initialData.nutritionalInfo?.sugars?.toString() || '',
                    sodium: initialData.nutritionalInfo?.sodium?.toString() || '',
                }
            });
        } else if (visible && !initialData) {
            setFormData(defaultForm());
        }
    }, [visible, initialData]);

    const setField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const setNutrition = (field: keyof NutritionForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            nutritionalInfo: { ...prev.nutritionalInfo, [field]: value }
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        const foodData = {
            name: formData.name.trim(),
            brand: formData.brand.trim() || undefined,
            barcode: formData.barcode.trim() || undefined,
            servingSize: parseFloat(formData.servingSize) || 100,
            servingUnit: formData.servingUnit,
            nutritionalInfo: {
                calories: parseFloat(formData.nutritionalInfo.calories) || undefined,
                protein: parseFloat(formData.nutritionalInfo.protein) || undefined,
                carbohydrates: parseFloat(formData.nutritionalInfo.carbohydrates) || undefined,
                fats: parseFloat(formData.nutritionalInfo.fats) || undefined,
                fiber: parseFloat(formData.nutritionalInfo.fiber) || undefined,
                sugars: parseFloat(formData.nutritionalInfo.sugars) || undefined,
                sodium: parseFloat(formData.nutritionalInfo.sodium) || undefined,
            }
        };

        try {
            if (isEditing && initialData?.id) {
                await updateFood(initialData.id, foodData);
            } else {
                await createFood(foodData);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error saving food:', err);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-gray-50 dark:bg-zinc-950"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Text className="text-xl font-bold text-black dark:text-white">
                        {isEditing ? 'Editar Alimento' : 'Nuevo Alimento'}
                    </Text>
                    <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <X size={18} color={isDark ? '#e4e4e7' : '#18181b'} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 px-5 pt-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Basic Info */}
                    <Text className="text-base font-bold text-black dark:text-white mb-4">Información Básica</Text>

                    <InputRow label="Nombre" value={formData.name} onChange={v => setField('name', v)} placeholder="Ej. Manzana Roja" required />
                    <InputRow label="Marca" value={formData.brand} onChange={v => setField('brand', v)} placeholder="Ej. Natural (opcional)" />
                    <InputRow label="Código de barras" value={formData.barcode} onChange={v => setField('barcode', v)} placeholder="Opcional" />

                    {/* Serving */}
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Porción Base</Text>
                            <TextInput
                                value={formData.servingSize}
                                onChangeText={v => setField('servingSize', v)}
                                keyboardType="numeric"
                                className="h-11 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 text-black dark:text-white bg-gray-50 dark:bg-zinc-900 text-sm"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Unidad</Text>
                            <View className="flex-row gap-1">
                                {(['g', 'ml'] as const).map(u => (
                                    <TouchableOpacity
                                        key={u}
                                        onPress={() => setField('servingUnit', u)}
                                        className={`h-11 px-4 rounded-xl justify-center border ${formData.servingUnit === u ? 'bg-green-600 border-green-600' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${formData.servingUnit === u ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{u}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Macronutrients */}
                    <Text className="text-base font-bold text-black dark:text-white mb-4 mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
                        Macronutrientes (por 100g/ml)
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <InputRow label="Calorías (kcal)" value={formData.nutritionalInfo.calories} onChange={v => setNutrition('calories', v)} numeric />
                        </View>
                        <View className="flex-1">
                            <InputRow label="Proteínas (g)" value={formData.nutritionalInfo.protein} onChange={v => setNutrition('protein', v)} numeric />
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <InputRow label="Carbohidratos (g)" value={formData.nutritionalInfo.carbohydrates} onChange={v => setNutrition('carbohydrates', v)} numeric />
                        </View>
                        <View className="flex-1">
                            <InputRow label="Grasas (g)" value={formData.nutritionalInfo.fats} onChange={v => setNutrition('fats', v)} numeric />
                        </View>
                    </View>

                    {/* Optional */}
                    <Text className="text-base font-bold text-black dark:text-white mb-4 mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
                        Otros (Opcional)
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <InputRow label="Fibra (g)" value={formData.nutritionalInfo.fiber} onChange={v => setNutrition('fiber', v)} numeric />
                        </View>
                        <View className="flex-1">
                            <InputRow label="Azúcares (g)" value={formData.nutritionalInfo.sugars} onChange={v => setNutrition('sugars', v)} numeric />
                        </View>
                    </View>
                    <InputRow label="Sodio (mg)" value={formData.nutritionalInfo.sodium} onChange={v => setNutrition('sodium', v)} numeric />

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading || !formData.name.trim()}
                        className={`rounded-2xl p-4 items-center flex-row justify-center gap-2 mt-2 ${!formData.name.trim() ? 'opacity-50' : ''} ${loading ? 'bg-green-400' : 'bg-green-600'}`}
                    >
                        {loading ? <ActivityIndicator size="small" color="white" /> : <Save size={18} color="white" />}
                        <Text className="text-white font-bold text-base">
                            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Alimento'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default FoodFormModal;
