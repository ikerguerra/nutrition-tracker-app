import apiClient from './apiClient';
import { ExternalFood, ExternalFoodSearchResponse } from '../types/externalFood';
import { Food } from '../types/food';

export const externalFoodService = {
    search: async (query: string, page: number = 1, size: number = 20): Promise<ExternalFood[]> => {
        const response = await apiClient.get<ExternalFoodSearchResponse>(`/external/foods/search`, {
            params: { query, page, size }
        });
        return response.data.data;
    },

    getByBarcode: async (barcode: string): Promise<ExternalFood | null> => {
        try {
            const response = await apiClient.get<{ data: ExternalFood }>(`/external/foods/barcode/${barcode}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    },

    importProduct: async (barcode: string): Promise<Food> => {
        const response = await apiClient.post<{ data: Food }>(`/external/foods/${barcode}/import`, {});
        return response.data.data;
    }
};
