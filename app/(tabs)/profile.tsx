import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, TextInput,
    ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Moon, Sun, Monitor, Save, Flame, Target, User, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import userProfileService from '../../services/userProfileService';
import type { UserProfile, UserProfileUpdateRequest } from '../../types/userProfile';
import { useColorScheme } from 'nativewind';

// --- Reusable Picker Component ---
interface PickerRowProps {
    label: string;
    value: string | undefined;
    options: { label: string; value: string }[];
    onChange: (val: string) => void;
}
const PickerRow: React.FC<PickerRowProps> = ({ label, value, options, onChange }) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">{label}</Text>
            <View className="flex-row flex-wrap gap-2">
                {options.map(opt => {
                    const isActive = value === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => onChange(opt.value)}
                            style={[
                                pickerStyles.btn,
                                isActive
                                    ? pickerStyles.btnActive
                                    : (isDark ? pickerStyles.btnInactiveDark : pickerStyles.btnInactiveLight)
                            ]}
                        >
                            <Text
                                className="text-sm font-medium"
                                style={isActive ? pickerStyles.textActive : (isDark ? pickerStyles.textInactiveDark : pickerStyles.textInactiveLight)}
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// --- Section Card Component ---
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 mb-4 overflow-hidden">
        <View className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
            <Text className="text-base font-bold text-black dark:text-white">{title}</Text>
        </View>
        <View className="p-5">{children}</View>
    </View>
);

// --- Number Input Row ---
const NumberInputRow: React.FC<{ label: string; value: number | undefined | null; onChange: (v: number) => void; unit: string; min?: number; max?: number }> = ({ label, value, onChange, unit, min, max }) => (
    <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">{label}</Text>
        <View className="flex-row items-center gap-2">
            <TextInput
                keyboardType="numeric"
                value={value != null ? value.toString() : ''}
                onChangeText={(t) => { const n = parseFloat(t); if (!isNaN(n)) onChange(n); }}
                className="w-20 h-10 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 text-right text-black dark:text-white bg-gray-50 dark:bg-zinc-900 text-sm font-semibold"
            />
            <Text className="text-sm text-gray-500 dark:text-gray-400 w-8">{unit}</Text>
        </View>
    </View>
);

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<UserProfileUpdateRequest>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userProfileService.getMyProfile();
            setProfile(data);
            setFormData({
                height: data.height ?? undefined,
                weight: data.weight ?? undefined,
                gender: data.gender ?? undefined,
                nutritionalGoal: data.nutritionalGoal ?? undefined,
                dietType: data.dietType ?? undefined,
                activityLevel: data.activityLevel ?? undefined,
                useCustomMacros: data.useCustomMacros,
            });
        } catch (e) {
            console.error('Error loading profile:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await userProfileService.updateMyProfile(formData);
            setProfile(updated);
            Alert.alert('Perfil guardado', 'Tus datos han sido actualizados correctamente.');
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof UserProfileUpdateRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };

    const getThemeIcon = () => {
        const color = isDark ? '#e4e4e7' : '#18181b';
        if (theme === 'light') return <Sun size={18} color="#f59e0b" />;
        if (theme === 'dark') return <Moon size={18} color="#a855f7" />;
        return <Monitor size={18} color={color} />;
    };

    const bmi = profile?.height && profile?.weight
        ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
        : null;

    if (loading) {
        return (
            <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#16a34a" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-zinc-950">
            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header */}
                <View className="py-4 mb-2">
                    <Text className="text-2xl font-bold text-black dark:text-white">Perfil</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona tus datos y preferencias</Text>
                </View>

                {/* Profile Summary Card */}
                <View className="bg-green-600 rounded-3xl p-5 mb-6 flex-row items-center gap-4">
                    <View className="h-16 w-16 bg-green-700 rounded-full items-center justify-center">
                        <Text className="text-3xl font-bold text-white">
                            {user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</Text>
                        <Text className="text-green-100 text-sm mt-0.5">{user?.email}</Text>
                        <View className="flex-row gap-3 mt-2">
                            {bmi && (
                                <View className="bg-green-700 px-2.5 py-1 rounded-full">
                                    <Text className="text-white text-xs font-semibold">IMC: {bmi}</Text>
                                </View>
                            )}
                            {profile?.weight && (
                                <View className="bg-green-700 px-2.5 py-1 rounded-full">
                                    <Text className="text-white text-xs font-semibold">{profile.weight} kg</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Calculated Goals */}
                {profile?.dailyCalorieGoal && (
                    <SectionCard title="🎯 Objetivos Calculados">
                        <View className="flex-row justify-between items-center mb-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-xl">
                            <View className="flex-row items-center gap-2">
                                <Flame size={18} color="#f97316" />
                                <Text className="font-semibold text-black dark:text-white">Calorías diarias</Text>
                            </View>
                            <Text className="text-xl font-bold text-orange-500">{Math.round(profile.dailyCalorieGoal)}</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1 items-center p-3 bg-green-50 dark:bg-green-950 rounded-xl">
                                <Text className="text-sm font-bold text-green-600">{Math.round(profile.dailyProteinGoal || 0)}g</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Proteínas</Text>
                            </View>
                            <View className="flex-1 items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                                <Text className="text-sm font-bold text-blue-600">{Math.round(profile.dailyCarbsGoal || 0)}g</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbos</Text>
                            </View>
                            <View className="flex-1 items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-xl">
                                <Text className="text-sm font-bold text-yellow-600">{Math.round(profile.dailyFatsGoal || 0)}g</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Grasas</Text>
                            </View>
                        </View>
                    </SectionCard>
                )}

                {/* Physical Data */}
                <SectionCard title="📏 Datos Físicos">
                    <NumberInputRow label="Altura" value={formData.height} onChange={v => handleChange('height', v)} unit="cm" />
                    <NumberInputRow label="Peso" value={formData.weight} onChange={v => handleChange('weight', v)} unit="kg" />
                    <PickerRow
                        label="Sexo"
                        value={formData.gender}
                        onChange={v => handleChange('gender', v)}
                        options={[
                            { label: 'Hombre', value: 'MALE' },
                            { label: 'Mujer', value: 'FEMALE' },
                            { label: 'Otro', value: 'OTHER' },
                        ]}
                    />
                </SectionCard>

                {/* Activity & Goals */}
                <SectionCard title="⚡ Actividad y Objetivo">
                    <PickerRow
                        label="Nivel de actividad"
                        value={formData.activityLevel}
                        onChange={v => handleChange('activityLevel', v)}
                        options={[
                            { label: 'Sedentario', value: 'SEDENTARY' },
                            { label: 'Ligero', value: 'LIGHTLY_ACTIVE' },
                            { label: 'Moderado', value: 'MODERATELY_ACTIVE' },
                            { label: 'Activo', value: 'VERY_ACTIVE' },
                            { label: 'Muy activo', value: 'EXTREMELY_ACTIVE' },
                        ]}
                    />
                    <PickerRow
                        label="Objetivo nutricional"
                        value={formData.nutritionalGoal}
                        onChange={v => handleChange('nutritionalGoal', v)}
                        options={[
                            { label: 'Perder peso', value: 'LOSE_WEIGHT' },
                            { label: 'Mantener', value: 'MAINTAIN' },
                            { label: 'Aumentar músculo', value: 'GAIN_MUSCLE' },
                            { label: 'Aumentar peso', value: 'GAIN_WEIGHT' },
                        ]}
                    />
                    <PickerRow
                        label="Tipo de dieta"
                        value={formData.dietType}
                        onChange={v => handleChange('dietType', v)}
                        options={[
                            { label: 'Estándar', value: 'STANDARD' },
                            { label: 'Alta proteína', value: 'HIGH_PROTEIN' },
                            { label: 'Baja en carbos', value: 'LOW_CARB' },
                            { label: 'Keto', value: 'KETOGENIC' },
                            { label: 'Vegana', value: 'VEGAN' },
                            { label: 'Vegetariana', value: 'VEGETARIAN' },
                            { label: 'Paleo', value: 'PALEO' },
                        ]}
                    />
                </SectionCard>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} disabled={saving}
                    className="rounded-2xl p-4 items-center flex-row justify-center gap-2 mb-6"
                    style={{ backgroundColor: saving ? '#4ade80' : '#16a34a' }}
                >
                    {saving
                        ? <ActivityIndicator size="small" color="white" />
                        : <Save size={18} color="white" />
                    }
                    <Text className="text-white font-bold text-base">
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Text>
                </TouchableOpacity>

                {/* Preferences */}
                <SectionCard title="⚙️ Preferencias">
                    <TouchableOpacity onPress={() => router.push('/stats')}
                        className="flex-row items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-900 mb-2">
                        <View className="flex-row items-center gap-3">
                            <TrendingUp size={18} color="#16a34a" />
                            <Text className="text-black dark:text-white font-medium">Gráficos y Estadísticas</Text>
                        </View>
                        <ChevronRight size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={cycleTheme}
                        className="flex-row items-center justify-between py-2">
                        <View className="flex-row items-center gap-3">
                            {getThemeIcon()}
                            <Text className="text-black dark:text-white font-medium">Apariencia</Text>
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 capitalize text-sm font-semibold">{theme}</Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* Logout */}
                <TouchableOpacity onPress={handleLogout}
                    className="w-full p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-2xl flex-row items-center justify-center gap-2 mb-4">
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-red-600 font-semibold text-base">Cerrar sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const pickerStyles = StyleSheet.create({
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    btnActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    btnInactiveLight: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
    },
    btnInactiveDark: {
        backgroundColor: '#18181b', // zinc-900
        borderColor: '#3f3f46', // zinc-700
    },
    textActive: {
        color: '#ffffff',
    },
    textInactiveLight: {
        color: '#374151',
    },
    textInactiveDark: {
        color: '#d4d4d8',
    }
});
