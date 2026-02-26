import { useState, useCallback, useEffect } from 'react';
import recipeService from '../services/recipeService';
import type { Recipe, CreateRecipeRequest } from '../types/recipe';
import { useAuth } from '../context/AuthContext';

export const useRecipes = () => {
    const { isAuthenticated } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecipes = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const data = await recipeService.getRecipes();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las recetas');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const getRecipe = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            return await recipeService.getRecipeById(id);
        } catch (err: any) {
            setError(err.message || 'Error al cargar la receta');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createRecipe = async (data: CreateRecipeRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newRecipe = await recipeService.createRecipe(data);
            await loadRecipes();
            return newRecipe;
        } catch (err: any) {
            setError(err.message || 'Error al crear la receta');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRecipe = async (id: number, data: CreateRecipeRequest) => {
        setLoading(true);
        setError(null);
        try {
            const updatedRecipe = await recipeService.updateRecipe(id, data);
            await loadRecipes();
            return updatedRecipe;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la receta');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteRecipe = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await recipeService.deleteRecipe(id);
            await loadRecipes();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la receta');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadRecipes();
        } else {
            setRecipes([]);
        }
    }, [isAuthenticated, loadRecipes]);

    return {
        recipes,
        loading,
        error,
        loadRecipes,
        getRecipe,
        createRecipe,
        updateRecipe,
        deleteRecipe,
    };
};

export default useRecipes;
