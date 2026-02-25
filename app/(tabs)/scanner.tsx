import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useBarcodeSearch } from '../../hooks/useBarcodeSearch';
import { externalFoodService } from '../../services/externalFoodService';
import { ScanBarcode, Info, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AddFoodToLogModal from '../../components/daily-log/AddFoodToLogModal';
import { MealType } from '../../types/dailyLog';

export default function ScannerScreen() {
    const params = useLocalSearchParams<{ mealType?: MealType; date?: string }>();
    const router = useRouter();
    const pickerMealType = params.mealType;
    const pickerDate = params.date || new Date().toISOString().split('T')[0];
    const isPickerMode = !!pickerMealType;

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const { result, loading, error, searchByBarcode, reset } = useBarcodeSearch();
    const [importing, setImporting] = useState(false);
    const [loggingFood, setLoggingFood] = useState(false); // Controls the modal

    useEffect(() => {
        if (!permission?.granted && permission?.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 justify-center items-center">
                <ActivityIndicator size="large" color="#16a34a" />
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 justify-center items-center p-6">
                <AlertCircle size={48} color="#ef4444" className="mb-4" />
                <Text className="text-xl font-bold text-black dark:text-white mb-2 text-center">Camera Access Needed</Text>
                <Text className="text-gray-500 mb-6 text-center">We need your permission to scan barcodes.</Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-green-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBarcodeScanned = async ({ type, data }: any) => {
        setScanned(true);
        try {
            await searchByBarcode(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImportFood = async () => {
        if (!result?.food?.barcode) return;
        setImporting(true);
        try {
            await externalFoodService.importProduct(result.food.barcode);
            Alert.alert("Éxito", "Alimento guardado en tu base de datos correctamente.");
        } catch (err) {
            Alert.alert("Error", "No se pudo importar el alimento.");
        } finally {
            setImporting(false);
        }
    };

    const handleScanAgain = () => {
        setScanned(false);
        reset();
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            <View className="p-4 border-b border-gray-100 dark:border-zinc-800 flex-row items-center">
                <ScanBarcode size={24} color="#16a34a" className="mr-3" />
                <Text className="text-2xl font-bold text-black dark:text-white">Scanner</Text>
            </View>

            <View className="flex-1">
                {!scanned ? (
                    <View className="flex-1 bg-black overflow-hidden relative">
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing="back"
                            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e"],
                            }}
                        >
                            <View className="flex-1 bg-black/40 justify-center items-center">
                                <View className="w-64 h-64 border-2 border-green-500 rounded-2xl bg-transparent" />
                                <Text className="text-white mt-8 font-medium">Align barcode within the frame to scan</Text>
                            </View>
                        </CameraView>
                    </View>
                ) : (
                    <View className="flex-1 p-6 items-center justify-center bg-gray-50 dark:bg-zinc-900 overflow-hidden">
                        {loading ? (
                            <ActivityIndicator size="large" color="#16a34a" />
                        ) : error ? (
                            <View className="items-center bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm w-full">
                                <AlertCircle size={40} color="#ef4444" className="mb-4" />
                                <Text className="text-xl font-bold text-black dark:text-white mb-2">Not Found</Text>
                                <Text className="text-gray-500 text-center mb-6">{error}</Text>
                                <TouchableOpacity onPress={handleScanAgain} className="bg-green-600 w-full py-4 rounded-xl items-center">
                                    <Text className="text-white font-semibold">Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : result?.food ? (
                            <View className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm w-full border border-gray-100 dark:border-zinc-800">
                                <View className="flex-row items-center mb-4">
                                    <CheckCircle2 size={32} color={result.foundInDatabase ? "#16a34a" : "#3b82f6"} className="mr-3" />
                                    <View>
                                        <Text className="text-xl font-bold text-black dark:text-white" numberOfLines={1}>{result.food.name}</Text>
                                        {result.food.brand && <Text className="text-gray-500">{result.food.brand}</Text>}
                                    </View>
                                </View>

                                <View className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 mb-6">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-gray-500 dark:text-gray-400">Calories</Text>
                                        <Text className="font-bold text-black dark:text-white">{result.food.nutritionalInfo?.calories || 0} kcal</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-gray-500 dark:text-gray-400">Proteins</Text>
                                        <Text className="font-bold text-black dark:text-white">{result.food.nutritionalInfo?.protein || 0}g</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-gray-500 dark:text-gray-400">Carbs</Text>
                                        <Text className="font-bold text-black dark:text-white">{result.food.nutritionalInfo?.carbohydrates || 0}g</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-500 dark:text-gray-400">Fats</Text>
                                        <Text className="font-bold text-black dark:text-white">{result.food.nutritionalInfo?.fats || 0}g</Text>
                                    </View>
                                </View>

                                {result.source === 'openfoodfacts' ? (
                                    <View className="space-y-3">
                                        <TouchableOpacity
                                            onPress={handleImportFood}
                                            disabled={importing}
                                            style={[
                                                styles.importBtn,
                                                importing ? styles.importBtnDisabled : styles.importBtnActive
                                            ]}
                                        >
                                            {importing ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text className="text-white font-semibold">Save to Library</Text>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleScanAgain} className="py-4 rounded-xl items-center bg-gray-100 dark:bg-zinc-800">
                                            <Text className="text-black dark:text-white font-medium">Scan Different Item</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className="space-y-3">
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (isPickerMode) {
                                                    setLoggingFood(true);
                                                } else {
                                                    // Quick add without context -> go to diary
                                                    router.push('/(tabs)/daily-log');
                                                }
                                            }}
                                            className="py-4 rounded-xl items-center bg-green-600"
                                        >
                                            <Text className="text-white font-semibold">Log this item</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleScanAgain} className="py-4 rounded-xl items-center bg-gray-100 dark:bg-zinc-800">
                                            <Text className="text-black dark:text-white font-medium">Scan Again</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ) : null}
                    </View>
                )}
            </View>

            {/* Add Food Context Modal */}
            {isPickerMode && result?.food && (
                <AddFoodToLogModal
                    visible={loggingFood}
                    food={result.food}
                    mealType={pickerMealType as MealType}
                    targetDate={pickerDate}
                    onClose={() => setLoggingFood(false)}
                    onSuccess={() => {
                        setLoggingFood(false);
                        router.push('/(tabs)/daily-log');
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    importBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    importBtnActive: {
        backgroundColor: '#2563eb', // blue-600
    },
    importBtnDisabled: {
        backgroundColor: '#60a5fa', // blue-400
    }
});
