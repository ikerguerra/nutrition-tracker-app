import apiClient from './apiClient';
import { Recipe, CreateRecipeRequest } from '../types/recipe';

export const recipeService = {
    getRecipes: async (): Promise<Recipe[]> => {
        const response = await apiClient.get<any>('/recipes');
        return response.data.data;
    },

    getRecipeById: async (id: number): Promise<Recipe> => {
        const response = await apiClient.get<any>(`/recipes/${id}`);
        return response.data.data;
    },

    createRecipe: async (request: CreateRecipeRequest): Promise<Recipe> => {
        const response = await apiClient.post<any>('/recipes', request);
        return response.data.data;
    },

    updateRecipe: async (id: number, request: CreateRecipeRequest): Promise<Recipe> => {
        const response = await apiClient.put<any>(`/recipes/${id}`, request);
        return response.data.data;
    },

    deleteRecipe: async (id: number): Promise<void> => {
        await apiClient.delete(`/recipes/${id}`);
    }
};

export default recipeService;
