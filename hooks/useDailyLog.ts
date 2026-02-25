import { useState, useEffect, useCallback } from 'react';
import dailyLogService from '../services/dailyLogService';
import { DailyLog, AddEntryRequest, UpdateEntryRequest } from '../types/dailyLog';
import { useAuth } from '../context/AuthContext';

export const useDailyLog = (initialDate?: string) => {
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const loadDailyLog = useCallback(async (date?: string) => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const fetchDate = (date ?? new Date().toISOString().split('T')[0]) as string;
            const response = await dailyLogService.getDailyLog(fetchDate);
            setDailyLog(response);
        } catch (err: any) {
            setError(err.message || 'Error loading daily log');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const addEntry = useCallback(async (entry: AddEntryRequest) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await dailyLogService.addEntry(entry);
            setDailyLog(updated);
        } catch (err: any) {
            setError(err.message || 'Error adding entry to daily log');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateEntry = useCallback(async (id: number, entry: UpdateEntryRequest) => {
        setLoading(true);
        setError(null);
        try {
            let existingEntry: any = null;
            if (dailyLog && dailyLog.meals) {
                Object.values(dailyLog.meals).forEach(entries => {
                    const found = entries.find(e => e.id === id);
                    if (found) existingEntry = found;
                });
            }

            const fullPayload = {
                ...entry,
                date: (dailyLog?.date || initialDate || new Date().toISOString().split('T')[0]) as string,
                mealType: existingEntry?.mealType,
                foodId: existingEntry?.foodId,
            };

            const updated = await dailyLogService.updateEntry(id, fullPayload);
            setDailyLog(updated);
        } catch (err: any) {
            setError(err.message || 'Error updating entry');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dailyLog, initialDate]);

    const deleteEntry = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await dailyLogService.deleteEntry(id);
            setDailyLog(updated);
        } catch (err: any) {
            setError(err.message || 'Error deleting entry');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWeight = useCallback(async (weight: number) => {
        setLoading(true);
        setError(null);
        try {
            const dateToUpdate = (initialDate || new Date().toISOString().split('T')[0]) as string;
            const updated = await dailyLogService.updateDailyWeight(dateToUpdate, weight);
            setDailyLog(updated);
        } catch (err: any) {
            setError(err.message || 'Error updating weight');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [initialDate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadDailyLog(initialDate);
        }
    }, [initialDate, loadDailyLog, isAuthenticated]);

    return { dailyLog, loading, error, loadDailyLog, addEntry, updateEntry, deleteEntry, updateWeight };
};

export default useDailyLog;
