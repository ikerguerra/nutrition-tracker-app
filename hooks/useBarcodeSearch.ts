import { useState } from 'react';
import foodService from '../services/foodService';
import type { BarcodeSearchResponse } from '../types/food';

interface UseBarcodeSearchReturn {
    result: BarcodeSearchResponse | null;
    loading: boolean;
    error: string | null;
    searchByBarcode: (barcode: string) => Promise<BarcodeSearchResponse>;
    reset: () => void;
}

export const useBarcodeSearch = (): UseBarcodeSearchReturn => {
    const [result, setResult] = useState<BarcodeSearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchByBarcode = async (barcode: string): Promise<BarcodeSearchResponse> => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await foodService.searchByBarcode(barcode);
            setResult(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error searching barcode';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    return {
        result,
        loading,
        error,
        searchByBarcode,
        reset,
    };
};
