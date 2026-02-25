import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import foodService from '../services/foodService';
import type { Food, FoodRequest, Page, NutritionalFilters } from '../types/food';
import { useAuth } from './AuthContext';

interface FoodsContextType {
    foods: Food[];
    favoriteIds: number[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    createFood: (foodData: FoodRequest) => Promise<Food>;
    updateFood: (id: number, foodData: FoodRequest) => Promise<Food>;
    deleteFood: (id: number) => Promise<void>;
    searchFoods: (query: string, category?: string, filters?: NutritionalFilters) => Promise<void>;
    changePage: (newPage: number) => void;
    refresh: () => Promise<void>;
    addFavorite: (id: number) => Promise<void>;
    removeFavorite: (id: number) => Promise<void>;
    loadFavorites: () => Promise<void>;
    loadRecent: () => Promise<void>;
    loadFrequent: () => Promise<void>;
}

const FoodsContext = createContext<FoodsContextType | undefined>(undefined);

export const FoodsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
    });
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    const refreshFavoriteIds = async () => {
        try {
            const favs = await foodService.getFavorites();
            setFavoriteIds(favs.map(f => f.id!).filter(id => id !== undefined));
        } catch (error) {
            console.error('Error loading favorite IDs', error);
        }
    };

    const loadFoods = useCallback(
        async (page: number = 0, size: number = 20) => {
            setLoading(true);
            setError(null);
            try {
                const response: Page<Food> = await foodService.getAllFoods({ page, size });
                setFoods(response.content);
                setPagination({
                    page: response.number,
                    size: response.size,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                });
            } catch (err: any) {
                setError(err.message || 'Error loading foods');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createFood = async (foodData: FoodRequest): Promise<Food> => {
        setLoading(true);
        setError(null);
        try {
            const newFood = await foodService.createFood(foodData);
            await loadFoods();
            refreshFavoriteIds();
            return newFood;
        } catch (err: any) {
            setError(err.message || 'Error creating food');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateFood = async (id: number, foodData: FoodRequest): Promise<Food> => {
        setLoading(true);
        setError(null);
        try {
            const updatedFood = await foodService.updateFood(id, foodData);
            await loadFoods();
            return updatedFood;
        } catch (err: any) {
            setError(err.message || 'Error updating food');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteFood = async (id: number): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await foodService.deleteFood(id);
            await loadFoods();
        } catch (err: any) {
            setError(err.message || 'Error deleting food');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchFoods = useCallback(async (query: string, category?: string, filters?: NutritionalFilters): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await foodService.searchFoods(query, { category, filters });
            setFoods(response.content);
            setPagination({
                page: response.number,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
            });
        } catch (err: any) {
            setError(err.message || 'Error searching foods');
        } finally {
            setLoading(false);
        }
    }, []);

    const changePage = useCallback((newPage: number) => {
        setPagination(prev => {
            loadFoods(newPage, prev.size);
            return prev;
        });
    }, [loadFoods]);

    const addFavorite = async (id: number) => {
        try {
            setFavoriteIds(prev => [...prev, id]);
            await foodService.addFavorite(id);
        } catch (err: any) {
            setFavoriteIds(prev => prev.filter(favId => favId !== id));
            setError(err.message || 'Error adding favorite');
            throw err;
        }
    };

    const removeFavorite = async (id: number) => {
        try {
            setFavoriteIds(prev => prev.filter(favId => favId !== id));
            await foodService.removeFavorite(id);
        } catch (err: any) {
            setFavoriteIds(prev => [...prev, id]);
            setError(err.message || 'Error removing favorite');
            throw err;
        }
    };

    const loadFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await foodService.getFavorites();
            setFoods(data);
            setPagination({
                page: 0,
                size: data.length,
                totalElements: data.length,
                totalPages: 1,
            });
        } catch (err: any) {
            setError(err.message || 'Error loading favorites');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRecent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await foodService.getRecentFoods();
            setFoods(data);
            setPagination({
                page: 0,
                size: data.length,
                totalElements: data.length,
                totalPages: 1,
            });
        } catch (err: any) {
            setError(err.message || 'Error loading recent foods');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadFrequent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await foodService.getFrequentFoods();
            setFoods(data);
            setPagination({
                page: 0,
                size: data.length,
                totalElements: data.length,
                totalPages: 1,
            });
        } catch (err: any) {
            setError(err.message || 'Error loading frequent foods');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadFoods();
            refreshFavoriteIds();
        } else {
            setFoods([]);
            setFavoriteIds([]);
            setPagination({
                page: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0,
            });
        }
    }, [isAuthenticated]);

    const value = React.useMemo(() => ({
        foods,
        favoriteIds,
        loading,
        error,
        pagination,
        createFood,
        updateFood,
        deleteFood,
        searchFoods,
        changePage,
        refresh: loadFoods,
        addFavorite,
        removeFavorite,
        loadFavorites,
        loadRecent,
        loadFrequent
    }), [foods, favoriteIds, loading, error, pagination]);

    return (
        <FoodsContext.Provider value={value}>
            {children}
        </FoodsContext.Provider>
    );
};

export const useFoodsContext = () => {
    const context = useContext(FoodsContext);
    if (context === undefined) {
        throw new Error('useFoodsContext must be used within a FoodsProvider');
    }
    return context;
};
