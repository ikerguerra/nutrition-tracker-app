import apiClient from './apiClient';
import { MealTemplate, CreateMealTemplateRequest } from '../types/mealTemplate';
import { MealType } from '../types/dailyLog';

const mealTemplateService = {
    getTemplates: async (): Promise<MealTemplate[]> => {
        const response = await apiClient.get<any>('/meal-templates');
        return response.data.data;
    },

    getTemplateById: async (id: number): Promise<MealTemplate> => {
        const response = await apiClient.get<any>(`/meal-templates/${id}`);
        return response.data.data;
    },

    createTemplate: async (request: CreateMealTemplateRequest): Promise<MealTemplate> => {
        const response = await apiClient.post<any>('/meal-templates', request);
        return response.data.data;
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await apiClient.delete(`/meal-templates/${id}`);
    },

    applyTemplate: async (id: number, date: string, mealType?: MealType): Promise<void> => {
        let url = `/meal-templates/${id}/apply?date=${date}`;
        if (mealType) url += `&mealType=${mealType}`;
        await apiClient.post(url);
    }
};

export default mealTemplateService;
