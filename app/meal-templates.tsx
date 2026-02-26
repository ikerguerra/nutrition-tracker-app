import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, LayoutTemplate, PlusCircle, Trash2, Utensils } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { MealTemplate } from '../types/mealTemplate';
import { MealType } from '../types/dailyLog';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper component for the Meal Type Badge
const MealTypeBadge = ({ type, isSystem }: { type?: MealType, isSystem?: boolean }) => {
    let bg = 'bg-gray-100 dark:bg-gray-800';
    let text = 'text-gray-700 dark:text-gray-300';
    let label = 'Cualquiera';

    switch (type) {
        case 'BREAKFAST': bg = 'bg-orange-100 dark:bg-orange-900/40'; text = 'text-orange-700 dark:text-orange-400'; label = 'Desayuno'; break;
        case 'LUNCH': bg = 'bg-blue-100 dark:bg-blue-900/40'; text = 'text-blue-700 dark:text-blue-400'; label = 'Almuerzo'; break;
        case 'DINNER': bg = 'bg-purple-100 dark:bg-purple-900/40'; text = 'text-purple-700 dark:text-purple-400'; label = 'Cena'; break;
        case 'SNACK': bg = 'bg-green-100 dark:bg-green-900/40'; text = 'text-green-700 dark:text-green-400'; label = 'Snack'; break;
    }

    return (
        <View className="flex-row gap-2">
            <View className={`px-2 py-1 rounded-full ${bg}`}>
                <Text className={`text-[10px] font-bold ${text}`}>{label}</Text>
            </View>
            {isSystem && (
                <View className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                    <Text className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">Sistema</Text>
                </View>
            )}
        </View>
    );
};

export default function MealTemplatesScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { templates, loading, error, refresh, applyTemplate, deleteTemplate } = useMealTemplates();

    const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
    const [applyDate, setApplyDate] = useState(new Date());
    const [applyMealType, setApplyMealType] = useState<MealType | 'KEEP'>('KEEP');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [applying, setApplying] = useState(false);

    const handleApplyPress = (template: MealTemplate) => {
        setSelectedTemplate(template);
        setApplyDate(new Date());
        setApplyMealType(template.mealType || 'KEEP');
    };

    const confirmApply = async () => {
        if (!selectedTemplate) return;
        setApplying(true);
        try {
            const dateStr = applyDate.toISOString().split('T')[0];
            await applyTemplate(
                selectedTemplate.id,
                dateStr,
                applyMealType === 'KEEP' ? undefined : applyMealType
            );
            Alert.alert('Éxito', 'Plantilla aplicada correctamente');
            setSelectedTemplate(null);
            router.push('/(tabs)/daily-log'); // Redirect to log to see it
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo aplicar la plantilla');
        } finally {
            setApplying(false);
        }
    };

    const confirmDelete = (id: number) => {
        Alert.alert(
            'Eliminar plantilla',
            '¿Estás seguro de que deseas eliminar esta plantilla permanentemente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => deleteTemplate(id) }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 mr-3">
                        <ChevronLeft size={24} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-black dark:text-white">Plantillas</Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Tus comidas frecuentes</Text>
                    </View>
                </View>
                {/* Coming soon: Create Template */}
                <TouchableOpacity className="h-10 px-4 items-center justify-center rounded-xl bg-green-600 flex-row gap-2">
                    <PlusCircle size={16} color="white" />
                    <Text className="font-bold text-white text-sm">Nueva</Text>
                </TouchableOpacity>
            </View>

            {loading && templates.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#16a34a" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                    <TouchableOpacity onPress={refresh} className="bg-red-50 dark:bg-red-900/30 px-6 py-3 rounded-xl">
                        <Text className="text-red-600 dark:text-red-400 font-bold">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : templates.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <LayoutTemplate size={48} color={isDark ? '#3f3f46' : '#d1d5db'} className="mb-4" />
                    <Text className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center">No tienes plantillas</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">Guarda tus comidas frecuentes como plantillas para añadirlas más rápido a tu diario.</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="flex-row flex-wrap justify-between">
                        {templates.map(template => (
                            <View key={template.id} className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 mb-4 overflow-hidden">
                                <View className="p-4 border-b border-gray-50 dark:border-zinc-800/50">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-lg font-bold text-black dark:text-white flex-1 mr-2">{template.name}</Text>
                                        <MealTypeBadge type={template.mealType} isSystem={template.isSystem} />
                                    </View>
                                    {template.description && (
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{template.description}</Text>
                                    )}
                                </View>

                                <View className="p-4 bg-gray-50/50 dark:bg-zinc-900/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Utensils size={14} color="#16a34a" />
                                        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Alimentos ({template.items.length})</Text>
                                    </View>
                                    <View className="pl-6 border-l-2 border-green-100 dark:border-zinc-800">
                                        {template.items.slice(0, 3).map(item => (
                                            <View key={item.id} className="flex-row justify-between items-center mb-1.5">
                                                <Text className="text-sm text-gray-800 dark:text-gray-300 flex-1" numberOfLines={1}>{item.foodName}</Text>
                                                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-500 ml-2">{item.quantity} {item.unit}</Text>
                                            </View>
                                        ))}
                                        {template.items.length > 3 && (
                                            <Text className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">+ {template.items.length - 3} alimentos más</Text>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row border-t border-gray-100 dark:border-zinc-800">
                                    <TouchableOpacity
                                        onPress={() => handleApplyPress(template)}
                                        className="flex-1 py-3 items-center justify-center flex-row gap-2"
                                    >
                                        <PlusCircle size={16} color="#16a34a" />
                                        <Text className="font-bold text-green-600 dark:text-green-500">Aplicar</Text>
                                    </TouchableOpacity>
                                    {!template.isSystem && (
                                        <TouchableOpacity
                                            onPress={() => confirmDelete(template.id)}
                                            className="px-6 py-3 items-center justify-center border-l border-gray-100 dark:border-zinc-800"
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            {/* Apply Template Modal */}
            <Modal visible={!!selectedTemplate} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-6">
                        <Text className="text-xl font-bold text-black dark:text-white mb-2">Aplicar Plantilla</Text>
                        <Text className="text-gray-500 dark:text-gray-400 mb-6">Añadiendo "{selectedTemplate?.name}" a tu diario.</Text>

                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl mb-6"
                        >
                            <Text className="text-black dark:text-white">{applyDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={applyDate}
                                mode="date"
                                display="default"
                                onChange={(event: any, date?: Date) => {
                                    setShowDatePicker(false);
                                    if (date) setApplyDate(date);
                                }}
                            />
                        )}

                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Momento del día</Text>
                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {[
                                { val: 'KEEP', label: 'Original' },
                                { val: 'BREAKFAST', label: 'Desayuno' },
                                { val: 'LUNCH', label: 'Almuerzo' },
                                { val: 'DINNER', label: 'Cena' },
                                { val: 'SNACK', label: 'Snack' },
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.val}
                                    onPress={() => setApplyMealType(opt.val as any)}
                                    className={`px-4 py-2 rounded-xl border ${applyMealType === opt.val ? 'bg-green-600 border-green-600' : 'bg-transparent border-gray-200 dark:border-zinc-700'}`}
                                >
                                    <Text className={applyMealType === opt.val ? 'text-white font-bold' : 'text-gray-700 dark:text-gray-300'}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setSelectedTemplate(null)}
                                className="flex-1 p-4 rounded-xl bg-gray-100 dark:bg-zinc-800 items-center"
                            >
                                <Text className="font-bold text-gray-700 dark:text-gray-300">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmApply}
                                disabled={applying}
                                className="flex-1 p-4 rounded-xl bg-green-600 items-center flex-row justify-center gap-2"
                            >
                                {applying ? <ActivityIndicator size="small" color="white" /> : <PlusCircle size={18} color="white" />}
                                <Text className="font-bold text-white">{applying ? 'Aplicando...' : 'Aplicar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
