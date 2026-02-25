import apiClient from './apiClient';
import type { DailyLog, AddEntryRequest, UpdateEntryRequest } from '../types/dailyLog';

export const dailyLogService = {
    getDailyLog: async (date: string): Promise<DailyLog> => {
        const response = await apiClient.get<any>(`/daily-log?date=${date}`);
        return response.data.data;
    },

    getDailyLogsByDateRange: async (startDate: string, endDate: string): Promise<DailyLog[]> => {
        const response = await apiClient.get<any>(`/daily-log/range?startDate=${startDate}&endDate=${endDate}`);
        return response.data.data;
    },

    addEntry: async (entry: AddEntryRequest): Promise<DailyLog> => {
        const response = await apiClient.post<any>('/daily-log/entries', entry);
        return response.data.data;
    },

    updateEntry: async (id: number, entry: UpdateEntryRequest): Promise<DailyLog> => {
        const response = await apiClient.put<any>(`/daily-log/entries/${id}`, entry);
        return response.data.data;
    },

    deleteEntry: async (id: number): Promise<DailyLog> => {
        const response = await apiClient.delete<any>(`/daily-log/entries/${id}`);
        return response.data.data;
    },

    updateDailyWeight: async (date: string, weight: number): Promise<DailyLog> => {
        const response = await apiClient.patch<any>(`/daily-log/${date}/weight`, { weight });
        return response.data.data;
    },
};

export default dailyLogService;
