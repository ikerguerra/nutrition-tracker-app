export interface ExternalFood {
    barcode: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    source: 'OPENFOODFACTS';
}

export interface ExternalFoodSearchResponse {
    data: ExternalFood[];
    success: boolean;
    message?: string;
}
