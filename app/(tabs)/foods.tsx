import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FoodsScreen() {
    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-zinc-950">
            <View className="flex-1 items-center justify-center">
                <Text className="text-xl font-bold text-black dark:text-white">Foods & Recipes</Text>
                <Text className="text-gray-500 mt-2">Coming Soon: Database Search and Forms</Text>
            </View>
        </SafeAreaView>
    );
}
