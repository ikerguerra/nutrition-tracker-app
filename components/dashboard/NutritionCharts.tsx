import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { DailyLog } from '../../types/dailyLog';

interface NutritionChartsProps {
    dailyLog: DailyLog | null;
}

export const NutritionCharts = ({ dailyLog }: NutritionChartsProps) => {
    if (!dailyLog) {
        return (
            <View className="items-center py-6">
                <Text className="text-gray-500 dark:text-gray-400">No hay datos para mostrar gráficos</Text>
            </View>
        );
    }

    const { totals, meals } = dailyLog;
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 48; // padding (24 * 2)

    // Data for Pie Chart
    const macroData = [
        {
            name: "Proteína",
            population: Math.round(totals.protein) || 0,
            color: "#10B981", // Green-500
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Carbos",
            population: Math.round(totals.carbs) || 0,
            color: "#3B82F6", // Blue-500
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Grasas",
            population: Math.round(totals.fats) || 0,
            color: "#F59E0B", // Amber-500
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        }
    ].filter(item => item.population > 0);

    const formatMealType = (type: string) => {
        switch (type) {
            case 'BREAKFAST': return 'Des.';
            case 'LUNCH': return 'Alm.';
            case 'DINNER': return 'Cen.';
            case 'SNACK': return 'Snk.';
            case 'MORNING_SNACK': return 'M.Ma.';
            case 'AFTERNOON_SNACK': return 'Mer.';
            default: return type.substring(0, 4);
        }
    };

    // Data for Bar Chart
    let barLabels: string[] = [];
    let barData: number[] = [];

    if (meals) {
        Object.entries(meals).forEach(([mealType, entries]) => {
            const totalCals = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
            if (totalCals > 0) {
                barLabels.push(formatMealType(mealType));
                barData.push(Math.round(totalCals));
            }
        });
    }

    // Default if empty
    if (barLabels.length === 0) {
        barLabels = ["N/A"];
        barData = [0];
    }

    const barChartData = {
        labels: barLabels,
        datasets: [
            {
                data: barData
            }
        ]
    };

    const chartConfig = {
        backgroundGradientFrom: "#1E293B",
        backgroundGradientTo: "#0F172A",
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        barPercentage: 0.5,
        fillShadowGradient: "#6366F1",
        fillShadowGradientOpacity: 1,
        decimalPlaces: 0,
    };

    if (macroData.length === 0) {
        return (
            <View className="items-center py-6">
                <Text className="text-gray-500 dark:text-gray-400">Registra alimentos para ver estadísticas</Text>
            </View>
        );
    }

    return (
        <View className="flex-col gap-6 w-full">
            <View className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm items-center">
                <Text className="font-bold text-center mb-4 text-black dark:text-white">Macros (g)</Text>
                <PieChart
                    data={macroData}
                    width={chartWidth}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                />
            </View>

            <View className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm items-center overflow-hidden">
                <Text className="font-bold text-center mb-4 text-black dark:text-white">Calorías por Comida</Text>
                <BarChart
                    data={barChartData}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=" kcal"
                    chartConfig={{
                        ...chartConfig,
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    }}
                    verticalLabelRotation={0}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                    style={{ borderRadius: 16 }}
                />
            </View>
        </View>
    );
};
