import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDailyLog } from '../../hooks/useDailyLog';
import { useMealTemplates } from '../../hooks/useMealTemplates';
import DailyLogSummary from '../../components/daily-log/DailyLogSummary';
import MealSection from '../../components/daily-log/MealSection';
import { MealType, MealEntry } from '../../types/dailyLog';
import { Calendar, Save, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

// Native date formatter – avoids date-fns ESM/CJS Metro issues
const formatDateEs = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function DailyLogScreen() {
    const { dailyLog, loading, error, loadDailyLog, updateEntry, deleteEntry } = useDailyLog();
    const { createTemplate } = useMealTemplates();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // State for Save as Template Modal
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [templateSource, setTemplateSource] = useState<{ mealType: MealType, title: string, entries: MealEntry[] } | null>(null);

    const groupedMeals = useMemo(() => {
        const defaults: Record<MealType, MealEntry[]> = {
            BREAKFAST: [],
            MORNING_SNACK: [],
            LUNCH: [],
            AFTERNOON_SNACK: [],
            DINNER: [],
            SNACK: [], // keeping for backwards compatibility
        };

        if (!dailyLog || !dailyLog.meals) {
            return defaults;
        }
        return { ...defaults, ...dailyLog.meals };
    }, [dailyLog]);

    const handleAddFood = (mealType: MealType) => {
        const dateStr = dailyLog?.date || new Date().toISOString().split('T')[0];
        router.push({
            pathname: '/(tabs)/foods',
            params: { mealType, date: dateStr }
        });
    };

    const handleSaveAsTemplate = (mealType: MealType, title: string, entries: MealEntry[]) => {
        setTemplateSource({ mealType, title, entries });
        setTemplateName(`${title} Guardado`);
        setTemplateDescription('');
        setTemplateModalVisible(true);
    };

    const confirmSaveTemplate = async () => {
        if (!templateName.trim() || !templateSource) {
            Alert.alert('Error', 'El nombre de la plantilla es obligatorio');
            return;
        }

        setSavingTemplate(true);
        try {
            await createTemplate({
                name: templateName.trim(),
                description: templateDescription.trim(),
                mealType: templateSource.mealType,
                items: templateSource.entries.map(e => ({
                    foodId: e.foodId,
                    quantity: e.quantity,
                    unit: e.unit,
                }))
            });
            Alert.alert('Éxito', 'Plantilla guardada correctamente');
            setTemplateModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo guardar la plantilla');
        } finally {
            setSavingTemplate(false);
        }
    };

    const displayDate = React.useMemo(() => {
        if (!dailyLog?.date) return formatDateEs(new Date());
        const [year, month, day] = dailyLog.date.split('-');
        return formatDateEs(new Date(Number(year), Number(month) - 1, Number(day)));
    }, [dailyLog?.date]);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-zinc-950">
            <View className="px-4 py-3 bg-white dark:bg-zinc-950 flex-row items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                <Text className="text-2xl font-bold text-black dark:text-white">Diario</Text>
                <TouchableOpacity className="flex-row items-center bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
                    <Calendar size={14} color={isDark ? '#e4e4e7' : '#18181b'} className="mr-1.5" />
                    <Text className="text-sm font-medium text-black dark:text-white capitalize">{displayDate}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <DailyLogSummary
                    dailyLog={dailyLog}
                    loading={loading && !dailyLog}
                    error={error}
                />

                {loading && !dailyLog ? (
                    <View className="py-8 items-center justify-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <>
                        <MealSection
                            title="Desayuno"
                            mealType="BREAKFAST"
                            entries={groupedMeals.BREAKFAST}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                            onSaveAsTemplate={handleSaveAsTemplate}
                        />

                        <MealSection
                            title="Media Mañana"
                            mealType="MORNING_SNACK"
                            entries={groupedMeals.MORNING_SNACK}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                            onSaveAsTemplate={handleSaveAsTemplate}
                        />

                        <MealSection
                            title="Almuerzo"
                            mealType="LUNCH"
                            entries={groupedMeals.LUNCH}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                            onSaveAsTemplate={handleSaveAsTemplate}
                        />

                        <MealSection
                            title="Merienda"
                            mealType="AFTERNOON_SNACK"
                            entries={groupedMeals.AFTERNOON_SNACK}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                            onSaveAsTemplate={handleSaveAsTemplate}
                        />

                        <MealSection
                            title="Cena"
                            mealType="DINNER"
                            entries={groupedMeals.DINNER}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                            onAddFood={handleAddFood}
                            onSaveAsTemplate={handleSaveAsTemplate}
                        />
                    </>
                )}
            </ScrollView>

            {/* Save Template Modal */}
            <Modal visible={templateModalVisible} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-black dark:text-white">Guardar Plantilla</Text>
                            <TouchableOpacity onPress={() => setTemplateModalVisible(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full">
                                <X size={20} color={isDark ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre de la plantilla</Text>
                        <TextInput
                            value={templateName}
                            onChangeText={setTemplateName}
                            placeholder="Ej. Mi desayuno de lunes a viernes"
                            placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                            className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white p-4 rounded-xl mb-4 font-medium"
                        />

                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción (opcional)</Text>
                        <TextInput
                            value={templateDescription}
                            onChangeText={setTemplateDescription}
                            placeholder="Añade algún detalle adicional"
                            placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                            multiline
                            numberOfLines={3}
                            className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white p-4 rounded-xl mb-6 font-medium text-left align-top"
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setTemplateModalVisible(false)}
                                className="flex-1 p-4 rounded-xl bg-gray-100 dark:bg-zinc-800 items-center"
                            >
                                <Text className="font-bold text-gray-700 dark:text-gray-300">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmSaveTemplate}
                                disabled={savingTemplate}
                                className="flex-1 p-4 rounded-xl bg-indigo-600 items-center flex-row justify-center gap-2"
                            >
                                {savingTemplate ? <ActivityIndicator size="small" color="white" /> : <Save size={18} color="white" />}
                                <Text className="font-bold text-white">{savingTemplate ? 'Guardando...' : 'Guardar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
