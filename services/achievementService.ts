import apiClient from './apiClient';
import type { AchievementDto, AchievementsSummary } from '../types/achievement';

const achievementService = {
    getAll: async (): Promise<AchievementDto[]> => {
        const response = await apiClient.get<any>('/achievements');
        return response.data; // Assuming default backend response structure un-wrapped by apiClient or handled in backend
    },

    getSummary: async (): Promise<AchievementsSummary> => {
        const response = await apiClient.get<any>('/achievements/summary');
        return response.data;
    },
};

export default achievementService;
