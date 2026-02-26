import { useState, useCallback, useEffect } from 'react';
import mealTemplateService from '../services/mealTemplateService';
import type { MealTemplate, CreateMealTemplateRequest } from '../types/mealTemplate';
import { MealType } from '../types/dailyLog';

export const useMealTemplates = () => {
    const [templates, setTemplates] = useState<MealTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mealTemplateService.getTemplates();
            setTemplates(data || []);
        } catch (err: any) {
            console.error('Error loading templates:', err);
            setError(err.message || 'Error al cargar las plantillas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const createTemplate = async (request: CreateMealTemplateRequest) => {
        setError(null);
        try {
            const newTemplate = await mealTemplateService.createTemplate(request);
            setTemplates(prev => [...prev, newTemplate]);
            return newTemplate;
        } catch (err: any) {
            console.error('Error creating template:', err);
            setError(err.message || 'Error al crear la plantilla');
            throw err;
        }
    };

    const deleteTemplate = async (id: number) => {
        setError(null);
        try {
            await mealTemplateService.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            console.error('Error deleting template:', err);
            setError(err.message || 'Error al eliminar la plantilla');
            throw err;
        }
    };

    const applyTemplate = async (id: number, date: string, mealType?: MealType) => {
        setError(null);
        try {
            await mealTemplateService.applyTemplate(id, date, mealType);
        } catch (err: any) {
            console.error('Error applying template:', err);
            setError(err.message || 'Error al aplicar la plantilla');
            throw err;
        }
    };

    return {
        templates,
        loading,
        error,
        refresh: loadTemplates,
        createTemplate,
        deleteTemplate,
        applyTemplate,
    };
};

export default useMealTemplates;
