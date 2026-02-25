import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError(t('auth.invalidCredentials') || 'Please enter email and password');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            router.replace('/(tabs)/dashboard');
        } catch (err) {
            setError(t('auth.invalidCredentials'));
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-zinc-950"
        >
            <View className="flex-1 justify-center px-6 sm:px-12">
                <View className="w-full max-w-sm self-center space-y-8">
                    {/* Header */}
                    <View className="space-y-2 items-center mb-8">
                        <View className="bg-green-100 dark:bg-green-950 p-4 rounded-2xl mb-4">
                            <Activity size={32} color="#16a34a" /> {/* Assuming primary green */}
                        </View>
                        <Text className="text-3xl font-bold tracking-tight text-black dark:text-white">
                            {t('auth.welcomeBack')}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('auth.enterCredentials')}
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4">
                        <View className="space-y-2 mb-4">
                            <Text className="font-semibold text-black dark:text-gray-200">
                                {t('auth.email')}
                            </Text>
                            <TextInput
                                className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                placeholder="name@example.com"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="space-y-2 mb-6">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-semibold text-black dark:text-gray-200">
                                    {t('auth.password')}
                                </Text>
                                <TouchableOpacity>
                                    <Text className="text-sm font-medium text-green-600">
                                        {t('auth.forgotPassword')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {error ? (
                            <View className="p-3 bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg mb-4">
                                <Text className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                                    {error}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading || !email || !password}
                            className="h-12 bg-green-600 rounded-lg flex-row items-center justify-center"
                            style={{ opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-base font-semibold mr-2">
                                        {t('auth.login')}
                                    </Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-8 flex-row justify-center items-center">
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {t('auth.dontHaveAccount')}
                        </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity className="ml-1">
                                <Text className="font-semibold text-green-600">{t('auth.signUpToday')}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
