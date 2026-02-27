import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    Modal, ActivityIndicator, Alert, FlatList, TextInput, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft, ChevronRight, CheckCircle2, XCircle,
    LayoutTemplate, Plus, Trash2, Utensils
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import calendarService from '../../services/calendarService';
import mealTemplateService from '../../services/mealTemplateService';
import { CalendarDay, MealTemplate } from '../../types/mealTemplate';
import { MealType } from '../../types/dailyLog';

// ─── Helpers ────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

const getMonthLabel = (date: Date) =>
    new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);

const mealTypeLabels: Record<string, string> = {
    BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena',
    SNACK: 'Snack', '': 'Cualquier momento'
};

// ─── Meal type badge styles (pre-computed, not dynamic className) ─────────────
const mealTypeBg: Record<string, string> = {
    BREAKFAST: '#ffedd5',   // orange-100
    LUNCH: '#dbeafe',       // blue-100
    DINNER: '#f3e8ff',      // purple-100
    SNACK: '#dcfce7',       // green-100
    '': '#f3f4f6',           // gray-100
};
const mealTypeBgDark: Record<string, string> = {
    BREAKFAST: '#431407',  // orange-950
    LUNCH: '#172554',      // blue-950
    DINNER: '#3b0764',     // purple-950
    SNACK: '#052e16',      // green-950
    '': '#27272a',          // zinc-800
};
const mealTypeText: Record<string, string> = {
    BREAKFAST: '#c2410c',  // orange-700
    LUNCH: '#1d4ed8',      // blue-700
    DINNER: '#7e22ce',     // purple-700
    SNACK: '#15803d',      // green-700
    '': '#374151',          // gray-700
};
const mealTypeTextDark: Record<string, string> = {
    BREAKFAST: '#fb923c',  // orange-400
    LUNCH: '#60a5fa',      // blue-400
    DINNER: '#c084fc',     // purple-400
    SNACK: '#4ade80',      // green-400
    '': '#d1d5db',          // gray-300
};

// ─── Calendar cell (no className at all, pure StyleSheet) ───────────────────
interface CalendarCellProps {
    day: number;
    dateStr: string;
    isToday: boolean;
    data: CalendarDay | undefined;
    isDark: boolean;
    onPress: () => void;
}
const CalendarCell: React.FC<CalendarCellProps> = ({ day, isToday, data, isDark, onPress }) => {
    const borderColor = isToday ? '#22c55e' : (isDark ? '#27272a' : '#f3f4f6');
    const bg = isToday
        ? (isDark ? '#052e16' : '#f0fdf4')
        : (isDark ? '#18181b' : '#ffffff');
    const textColor = isToday
        ? (isDark ? '#4ade80' : '#15803d')
        : (isDark ? '#ffffff' : '#000000');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.calCell,
                { borderColor, backgroundColor: bg }
            ]}
        >
            <Text style={[styles.calDayNum, { color: textColor }]}>{day}</Text>
            {data && data.totalCalories > 0
                ? data.isGoalMet
                    ? <CheckCircle2 size={11} color="#22c55e" />
                    : <XCircle size={11} color="#ef4444" />
                : null
            }
            {data && data.totalCalories > 0 && (
                <Text style={styles.calKcal}>{Math.round(data.totalCalories)}</Text>
            )}
        </TouchableOpacity>
    );
};

// ─── Calendar Section ────────────────────────────────────
const CalendarSection: React.FC = () => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [summaryDays, setSummaryDays] = useState<CalendarDay[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMonth = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const data = await calendarService.getMonthlySummary(date.getFullYear(), date.getMonth() + 1);
            setSummaryDays(data);
        } catch {
            setSummaryDays([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMonth(currentDate); }, [currentDate]);

    const handlePrev = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - 1);
        setCurrentDate(d);
    };

    const handleNext = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        setCurrentDate(d);
    };

    const buildWeeks = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const rawFirst = new Date(year, month, 1).getDay();
        // Monday-start: Sun(0)→6, Mon(1)→0, ..., Sat(6)→5
        const firstDay = rawFirst === 0 ? 6 : rawFirst - 1;

        const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

        // Build flat array: nulls for empty prefix, then day numbers
        const flat: (number | null)[] = [
            ...Array(firstDay).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];
        // Pad to a full multiple of 7
        while (flat.length % 7 !== 0) flat.push(null);

        // Group into weeks
        const weeks: (number | null)[][] = [];
        for (let i = 0; i < flat.length; i += 7) {
            weeks.push(flat.slice(i, i + 7));
        }

        return weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                    if (!day) {
                        // Empty placeholder — same size as a cell
                        return <View key={di} style={styles.calCell} />;
                    }
                    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                    const data = summaryDays.find(s => s.date === dateStr);
                    const isToday = dateStr === todayStr;
                    return (
                        <CalendarCell
                            key={di}
                            day={day}
                            dateStr={dateStr}
                            isToday={isToday}
                            data={data}
                            isDark={isDark}
                            onPress={() => router.push('/(tabs)/daily-log')}
                        />
                    );
                })}
            </View>
        ));
    };

    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const iconColor = isDark ? '#e4e4e7' : '#18181b';

    return (
        <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    onPress={handlePrev}
                    className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
                >
                    <ChevronLeft size={20} color={iconColor} />
                </TouchableOpacity>
                <Text className="text-base font-bold text-black dark:text-white capitalize">
                    {getMonthLabel(currentDate)}
                </Text>
                <TouchableOpacity
                    onPress={handleNext}
                    className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
                >
                    <ChevronRight size={20} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* Day-of-week headers */}
            <View className="flex-row px-2">
                {weekDays.map(d => (
                    <View key={d} style={styles.calHeaderCell}>
                        <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500">{d}</Text>
                    </View>
                ))}
            </View>

            {/* Grid */}
            {loading ? (
                <View className="h-48 items-center justify-center">
                    <ActivityIndicator color="#16a34a" />
                </View>
            ) : (
                <View style={styles.calGrid}>
                    {buildWeeks()}
                </View>
            )}

            {/* Legend */}
            <View className="flex-row items-center gap-4 px-4 pb-4">
                <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={12} color="#22c55e" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Objetivo cumplido</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <XCircle size={12} color="#ef4444" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Objetivo no cumplido</Text>
                </View>
            </View>
        </View>
    );
};

// ─── Apply Template Modal ────────────────────────────────
interface ApplyModalProps {
    visible: boolean;
    template: MealTemplate | null;
    onClose: () => void;
    onApply: (date: string, mealType?: MealType) => Promise<void>;
}

const MEAL_TYPES: { label: string; value: MealType | '' }[] = [
    { label: 'Mantener original', value: '' },
    { label: 'Desayuno', value: 'BREAKFAST' },
    { label: 'Almuerzo', value: 'LUNCH' },
    { label: 'Cena', value: 'DINNER' },
    { label: 'Snack', value: 'SNACK' },
];

const ApplyModal: React.FC<ApplyModalProps> = ({ visible, onClose, onApply }) => {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [mealType, setMealType] = useState<MealType | ''>('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        if (visible) { setDate(today); setMealType(''); }
    }, [visible]);

    const handleApply = async () => {
        setApplying(true);
        try {
            await onApply(date, mealType || undefined);
            onClose();
        } finally {
            setApplying(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white dark:bg-zinc-950">
                <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <Text className="text-xl font-bold text-black dark:text-white">Aplicar Plantilla</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-green-600 font-semibold">Cancelar</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-5 pt-6 gap-6">
                    <View>
                        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            Fecha (YYYY-MM-DD)
                        </Text>
                        <TextInput
                            value={date}
                            onChangeText={setDate}
                            className="h-11 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View>
                        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            Momento del día
                        </Text>
                        {/* Use inline style for dynamic selected/unselected — NO dynamic className */}
                        <View className="flex-row flex-wrap gap-2">
                            {MEAL_TYPES.map(mt => {
                                const isSelected = mealType === mt.value;
                                return (
                                    <TouchableOpacity
                                        key={mt.value}
                                        onPress={() => setMealType(mt.value)}
                                        style={[
                                            styles.mealTypeBtn,
                                            isSelected ? styles.mealTypeBtnSelected : styles.mealTypeBtnUnselected
                                        ]}
                                    >
                                        <Text style={isSelected ? styles.mealTypeBtnTextSelected : styles.mealTypeBtnTextUnselected}>
                                            {mt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Submit button — inline style for disabled state */}
                    <TouchableOpacity
                        onPress={handleApply}
                        disabled={applying}
                        style={[styles.applyBtn, applying && styles.applyBtnDisabled]}
                    >
                        {applying
                            ? <ActivityIndicator color="white" />
                            : <Text className="text-white font-bold text-base">Aplicar ahora</Text>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ─── Template Card ───────────────────────────────────────
interface TemplateCardProps {
    item: MealTemplate;
    isDark: boolean;
    onApply: () => void;
    onDelete: (id: number) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ item, isDark, onApply, onDelete }) => {
    const key = item.mealType || '';
    const badgeBg = isDark ? mealTypeBgDark[key] ?? mealTypeBgDark[''] : mealTypeBg[key] ?? mealTypeBg[''];
    const badgeText = isDark ? mealTypeTextDark[key] ?? mealTypeTextDark[''] : mealTypeText[key] ?? mealTypeText[''];

    return (
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
            {/* Header */}
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-2">
                    <Text className="font-bold text-black dark:text-white text-base" numberOfLines={1}>{item.name}</Text>
                    {item.description && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View className="flex-row items-center gap-1.5">
                    {/* Badge — pure inline style, NO dynamic className */}
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.badgeText, { color: badgeText }]}>
                            {mealTypeLabels[key] || 'Cualquier momento'}
                        </Text>
                    </View>
                    {item.isSystem && (
                        <View className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-950">
                            <Text className="text-[10px] font-semibold text-green-700 dark:text-green-400">Sistema</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Foods list */}
            <View className="bg-gray-50 dark:bg-zinc-950 rounded-xl p-3 mb-3">
                <View className="flex-row items-center gap-1.5 mb-2">
                    <Utensils size={12} color="#16a34a" />
                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">Alimentos</Text>
                </View>
                {item.items.slice(0, 4).map(food => (
                    <View key={food.id} className="flex-row justify-between py-0.5">
                        <Text className="text-xs text-gray-700 dark:text-gray-300 flex-1 pr-2" numberOfLines={1}>
                            {food.foodName}
                        </Text>
                        <Text className="text-xs font-medium text-black dark:text-white">
                            {food.quantity} {food.unit}
                        </Text>
                    </View>
                ))}
                {item.items.length > 4 && (
                    <Text className="text-xs text-gray-400 mt-1">+{item.items.length - 4} más…</Text>
                )}
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={onApply}
                    className="flex-1 bg-green-600 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
                >
                    <Plus size={14} color="white" />
                    <Text className="text-white font-semibold text-sm">Aplicar al diario</Text>
                </TouchableOpacity>
                {!item.isSystem && (
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        className="bg-red-50 dark:bg-red-950 rounded-xl px-3 py-2.5 items-center justify-center"
                    >
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// ─── Templates Section ───────────────────────────────────
const TemplatesSection: React.FC = () => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [templates, setTemplates] = useState<MealTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyTarget, setApplyTarget] = useState<MealTemplate | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mealTemplateService.getTemplates();
            setTemplates(data);
        } catch {
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, []);

    const handleDelete = (id: number) => {
        Alert.alert('Eliminar plantilla', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive',
                onPress: async () => {
                    try {
                        await mealTemplateService.deleteTemplate(id);
                        setTemplates(prev => prev.filter(t => t.id !== id));
                    } catch {
                        Alert.alert('Error', 'No se pudo eliminar la plantilla.');
                    }
                }
            }
        ]);
    };

    const handleApply = async (date: string, mealType?: MealType) => {
        if (!applyTarget) return;
        try {
            await mealTemplateService.applyTemplate(applyTarget.id, date, mealType);
            Alert.alert('✅ Plantilla aplicada', 'Los alimentos se añadieron al diario correctamente.');
        } catch {
            Alert.alert('Error', 'No se pudo aplicar la plantilla.');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center py-16">
                <ActivityIndicator color="#16a34a" />
            </View>
        );
    }

    if (templates.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-16 px-8">
                <View className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                    <LayoutTemplate size={40} color="#9ca3af" />
                </View>
                <Text className="text-lg font-bold text-black dark:text-white mb-1">Sin plantillas</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
                    Las plantillas de comidas creadas en la web aparecerán aquí.
                </Text>
            </View>
        );
    }

    return (
        <>
            <FlatList
                data={templates}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TemplateCard
                        item={item}
                        isDark={isDark}
                        onApply={() => setApplyTarget(item)}
                        onDelete={handleDelete}
                    />
                )}
            />
            <ApplyModal
                visible={!!applyTarget}
                template={applyTarget}
                onClose={() => setApplyTarget(null)}
                onApply={handleApply}
            />
        </>
    );
};

// ─── Root Screen ─────────────────────────────────────────
type TabType = 'calendar' | 'templates';

export default function CalendarScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('calendar');
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            {/* Section switcher */}
            <View className="px-4 pt-3 pb-0">
                <Text className="text-2xl font-bold text-black dark:text-white mb-3">Historial</Text>

                {/* Tab picker — pure inline styles, NO dynamic className */}
                <View style={[styles.tabBar, { backgroundColor: isDark ? '#18181b' : '#f3f4f6' }]}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('calendar')}
                        style={[
                            styles.tabBtn,
                            activeTab === 'calendar' && [styles.tabBtnActive, { backgroundColor: isDark ? '#3f3f46' : '#ffffff' }]
                        ]}
                    >
                        <Text style={activeTab === 'calendar'
                            ? [styles.tabText, { color: isDark ? '#ffffff' : '#000000' }]
                            : [styles.tabText, { color: isDark ? '#9ca3af' : '#6b7280' }]
                        }>
                            📅 Calendario
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('templates')}
                        style={[
                            styles.tabBtn,
                            activeTab === 'templates' && [styles.tabBtnActive, { backgroundColor: isDark ? '#3f3f46' : '#ffffff' }]
                        ]}
                    >
                        <Text style={activeTab === 'templates'
                            ? [styles.tabText, { color: isDark ? '#ffffff' : '#000000' }]
                            : [styles.tabText, { color: isDark ? '#9ca3af' : '#6b7280' }]
                        }>
                            📋 Plantillas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'calendar' ? (
                <ScrollView className="flex-1 pt-2" showsVerticalScrollIndicator={false}>
                    <CalendarSection />
                </ScrollView>
            ) : (
                <View className="flex-1 pt-2">
                    <TemplatesSection />
                </View>
            )}
        </SafeAreaView>
    );
}

// ─── StyleSheet ──────────────────────────────────────────
const styles = StyleSheet.create({
    // Calendar grid
    calGrid: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
    weekRow: {
        flexDirection: 'row',
    },
    calHeaderCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    calCell: {
        flex: 1,
        aspectRatio: 1,
        margin: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calDayNum: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 1,
    },
    calKcal: {
        fontSize: 8,
        color: '#9ca3af',
        marginTop: 1,
    },
    // Meal type badge (pure inline color, no className)
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    // Apply modal — meal type selector buttons
    mealTypeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 4,
    },
    mealTypeBtnSelected: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    mealTypeBtnUnselected: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    mealTypeBtnTextSelected: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '500',
    },
    mealTypeBtnTextUnselected: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '500',
    },
    // Apply button
    applyBtn: {
        backgroundColor: '#16a34a',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    applyBtnDisabled: {
        backgroundColor: '#4ade80',
    },
    // Section tabs
    tabBar: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    tabBtnActive: {
        // base active style, backgroundColor applied inline per theme
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
