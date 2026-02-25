import apiClient from './apiClient';
import type { Food, FoodRequest, Page, BarcodeSearchResponse, NutritionalFilters } from '../types/food';

interface GetAllFoodsParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
}

interface SearchFoodsParams {
    page?: number;
    size?: number;
}

const foodService = {
    createFood: async (foodData: FoodRequest): Promise<Food> => {
        try {
            const response = await apiClient.post<{ data: Food }>('/foods', foodData);
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getFoodById: async (id: number): Promise<Food> => {
        try {
            const response = await apiClient.get<{ data: Food }>(`/foods/${id}`);
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getAllFoods: async ({
        page = 0,
        size = 20,
        sortBy = 'name',
        direction = 'asc'
    }: GetAllFoodsParams = {}): Promise<Page<Food>> => {
        try {
            const response = await apiClient.get<{ data: Page<Food> }>('/foods', {
                params: { page, size, sortBy, direction }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    searchFoods: async (
        query: string,
        { page = 0, size = 20, category, filters = {} }: SearchFoodsParams & { category?: string, filters?: NutritionalFilters } = {}
    ): Promise<Page<Food>> => {
        try {
            const params: any = { query, page, size };
            if (category) {
                params.category = category;
            }
            if (filters) {
                if (filters.minCalories) params.minCalories = filters.minCalories;
                if (filters.maxCalories) params.maxCalories = filters.maxCalories;
                if (filters.minProtein) params.minProtein = filters.minProtein;
                if (filters.maxProtein) params.maxProtein = filters.maxProtein;
                if (filters.minCarbs) params.minCarbs = filters.minCarbs;
                if (filters.maxCarbs) params.maxCarbs = filters.maxCarbs;
                if (filters.minFats) params.minFats = filters.minFats;
                if (filters.maxFats) params.maxFats = filters.maxFats;
            }

            const response = await apiClient.get<{ data: Page<Food> }>('/foods/search', {
                params
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    searchByBarcode: async (barcode: string): Promise<BarcodeSearchResponse> => {
        try {
            const response = await apiClient.get<{ data: BarcodeSearchResponse }>(
                `/foods/barcode/${barcode}`
            );
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    updateFood: async (id: number, foodData: FoodRequest): Promise<Food> => {
        try {
            const response = await apiClient.put<{ data: Food }>(`/foods/${id}`, foodData);
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    deleteFood: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/foods/${id}`);
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getTotalCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get<{ data: number }>('/foods/stats/count');
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    addFavorite: async (id: number): Promise<void> => {
        try {
            await apiClient.post(`/foods/${id}/favorite`);
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    removeFavorite: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/foods/${id}/favorite`);
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getFavorites: async (): Promise<Food[]> => {
        try {
            const response = await apiClient.get<{ data: Food[] }>('/foods/favorites');
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getRecentFoods: async (): Promise<Food[]> => {
        try {
            const response = await apiClient.get<{ data: Food[] }>('/foods/recent');
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    getFrequentFoods: async (limit: number = 10): Promise<Food[]> => {
        try {
            const response = await apiClient.get<{ data: Food[] }>('/foods/frequent', {
                params: { limit }
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    calculateNutrition: async (id: number, quantity: number, servingUnitId?: number): Promise<import('../types/food').NutritionalInfo> => {
        try {
            const params: any = { quantity };
            if (servingUnitId) {
                params.servingUnitId = servingUnitId;
            }
            const response = await apiClient.get<{ data: import('../types/food').NutritionalInfo }>(`/foods/${id}/calculate`, {
                params
            });
            return response.data.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
};

export default foodService;
