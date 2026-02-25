import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowRight } from 'lucide-react-native';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await register(formData);
            router.replace('/(tabs)/dashboard');
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-zinc-950"
        >
            <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
                <View className="w-full max-w-sm self-center space-y-6">
                    {/* Header */}
                    <View className="space-y-2 items-center mb-6">
                        <View className="bg-primary/10 p-4 rounded-2xl mb-4">
                            <Activity size={32} color="#16a34a" /> {/* Assuming primary green */}
                        </View>
                        <Text className="text-3xl font-bold tracking-tight text-black dark:text-white">
                            Create Account
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                            Start your healthy journey today
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4">
                        <View className="flex-row space-x-4 mb-4">
                            <View className="flex-1 space-y-2 mr-2">
                                <Text className="font-semibold text-black dark:text-gray-200">First Name</Text>
                                <TextInput
                                    className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                    placeholder="First Name"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.firstName}
                                    onChangeText={(val) => handleChange('firstName', val)}
                                />
                            </View>
                            <View className="flex-1 space-y-2 ml-2">
                                <Text className="font-semibold text-black dark:text-gray-200">Last Name</Text>
                                <TextInput
                                    className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                    placeholder="Last Name"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.lastName}
                                    onChangeText={(val) => handleChange('lastName', val)}
                                />
                            </View>
                        </View>

                        <View className="space-y-2 mb-4">
                            <Text className="font-semibold text-black dark:text-gray-200">Email</Text>
                            <TextInput
                                className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                value={formData.email}
                                onChangeText={(val) => handleChange('email', val)}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="space-y-2 mb-6">
                            <Text className="font-semibold text-black dark:text-gray-200">Password</Text>
                            <TextInput
                                className="h-12 border border-gray-200 dark:border-gray-800 rounded-lg px-4 text-black dark:text-white bg-gray-50 dark:bg-zinc-900"
                                placeholder="Create a password"
                                placeholderTextColor="#9ca3af"
                                value={formData.password}
                                onChangeText={(val) => handleChange('password', val)}
                                secureTextEntry
                            />
                        </View>

                        {error ? (
                            <View className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-lg mb-4">
                                <Text className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                                    {error}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className={`h-12 bg-green-600 rounded-lg flex-row items-center justify-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-base font-semibold mr-2">
                                        Sign Up
                                    </Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-8 flex-row justify-center items-center">
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?
                        </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity className="ml-1">
                                <Text className="font-semibold text-green-600">Login</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
