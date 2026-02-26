import { useState, useCallback, useEffect } from 'react';
import achievementService from '../services/achievementService';
import type { AchievementDto, AchievementsSummary } from '../types/achievement';
import { useAuth } from '../context/AuthContext';

export const useAchievements = () => {
    const { isAuthenticated } = useAuth();
    const [achievements, setAchievements] = useState<AchievementDto[]>([]);
    const [summary, setSummary] = useState<AchievementsSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAchievements = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const [achievementsData, summaryData] = await Promise.all([
                achievementService.getAll(),
                achievementService.getSummary()
            ]);
            setAchievements(Array.isArray((achievementsData as any)?.data) ? (achievementsData as any).data : achievementsData);
            setSummary((summaryData as any)?.data || summaryData);
        } catch (err: any) {
            console.error('Error loading achievements:', err);
            setError(err.message || 'Error al cargar los logros');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadAchievements();
        } else {
            setAchievements([]);
            setSummary(null);
        }
    }, [isAuthenticated, loadAchievements]);

    return {
        achievements,
        summary,
        loading,
        error,
        refresh: loadAchievements,
    };
};

export default useAchievements;
