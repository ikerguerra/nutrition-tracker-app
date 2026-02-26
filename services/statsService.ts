import apiClient from './apiClient';
import {
    WeightDataPoint,
    MacroTrendDataPoint,
    WeeklySummary,
    GoalAchievement,
    RdaData
} from '../types/stats';

const statsService = {
    getWeightHistory: async (startDate: string, endDate: string): Promise<WeightDataPoint[]> => {
        try {
            const response = await apiClient.get<{ data: WeightDataPoint[] }>(`/stats/weight-history`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getMacroTrends: async (startDate: string, endDate: string): Promise<MacroTrendDataPoint[]> => {
        try {
            const response = await apiClient.get<{ data: MacroTrendDataPoint[] }>(`/stats/macro-trends`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getWeeklySummary: async (startDate: string): Promise<WeeklySummary> => {
        try {
            const response = await apiClient.get<{ data: WeeklySummary }>(`/stats/weekly-summary`, {
                params: { startDate }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getGoalAchievement: async (startDate: string, endDate: string): Promise<GoalAchievement> => {
        try {
            const response = await apiClient.get<{ data: GoalAchievement }>(`/stats/goal-achievement`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getRda: async (): Promise<RdaData> => {
        try {
            const response = await apiClient.get<{ data: RdaData }>('/stats/rda');
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
};

export default statsService;
