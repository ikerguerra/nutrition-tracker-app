import { useState, useCallback } from 'react';
import statsService from '../services/statsService';
import {
    WeightDataPoint,
    MacroTrendDataPoint,
    WeeklySummary,
    GoalAchievement,
    RdaData
} from '../types/stats';

export const useStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weightHistory, setWeightHistory] = useState<WeightDataPoint[]>([]);
    const [macroTrends, setMacroTrends] = useState<MacroTrendDataPoint[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
    const [goalAchievement, setGoalAchievement] = useState<GoalAchievement | null>(null);
    const [rda, setRda] = useState<RdaData | null>(null);

    const loadWeightHistory = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await statsService.getWeightHistory(startDate, endDate);
            setWeightHistory(data);
        } catch (err: any) {
            setError(err.message || 'Error loading weight history');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMacroTrends = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await statsService.getMacroTrends(startDate, endDate);
            setMacroTrends(data);
        } catch (err: any) {
            setError(err.message || 'Error loading macro trends');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadWeeklySummary = useCallback(async (startDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await statsService.getWeeklySummary(startDate);
            setWeeklySummary(data);
        } catch (err: any) {
            setError(err.message || 'Error loading weekly summary');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadGoalAchievement = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await statsService.getGoalAchievement(startDate, endDate);
            setGoalAchievement(data);
        } catch (err: any) {
            setError(err.message || 'Error loading goal achievement');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRda = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await statsService.getRda();
            setRda(data);
        } catch (err: any) {
            setError(err.message || 'Error loading RDA data');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        weightHistory,
        macroTrends,
        weeklySummary,
        goalAchievement,
        rda,
        loadWeightHistory,
        loadMacroTrends,
        loadWeeklySummary,
        loadGoalAchievement,
        loadRda
    };
};
