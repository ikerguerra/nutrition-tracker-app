import apiClient from './apiClient';
import { CalendarDay } from '../types/mealTemplate';

const calendarService = {
    getMonthlySummary: async (year: number, month: number): Promise<CalendarDay[]> => {
        try {
            const response = await apiClient.get<{ data: CalendarDay[] }>('/calendar/summary', {
                params: { year, month }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
};

export default calendarService;
