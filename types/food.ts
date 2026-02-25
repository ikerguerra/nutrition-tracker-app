export interface NutritionalInfo {
    id?: number;
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    sugars?: number;
    saturatedFats?: number;
    sodium?: number;
    calcium?: number;
    iron?: number;
    potassium?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminB12?: number;
}

export enum FoodCategory {
    FRUITS = 'FRUITS',
    VEGETABLES = 'VEGETABLES',
    GRAINS = 'GRAINS',
    PROTEIN = 'PROTEIN',
    DAIRY = 'DAIRY',
    FATS_OILS = 'FATS_OILS',
    SWEETS = 'SWEETS',
    BEVERAGES = 'BEVERAGES',
    SNACKS = 'SNACKS',
    PREPARED_MEALS = 'PREPARED_MEALS',
    LEGUMES = 'LEGUMES',
    NUTS_SEEDS = 'NUTS_SEEDS',
    CONDIMENTS = 'CONDIMENTS',
    OTHER = 'OTHER'
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
    [FoodCategory.FRUITS]: 'Frutas',
    [FoodCategory.VEGETABLES]: 'Verduras',
    [FoodCategory.GRAINS]: 'Cereales y Granos',
    [FoodCategory.PROTEIN]: 'Proteínas',
    [FoodCategory.DAIRY]: 'Lácteos',
    [FoodCategory.FATS_OILS]: 'Grasas y Aceites',
    [FoodCategory.SWEETS]: 'Dulces y Postres',
    [FoodCategory.BEVERAGES]: 'Bebidas',
    [FoodCategory.SNACKS]: 'Snacks',
    [FoodCategory.PREPARED_MEALS]: 'Comidas Preparadas',
    [FoodCategory.LEGUMES]: 'Legumbres',
    [FoodCategory.NUTS_SEEDS]: 'Frutos Secos y Semillas',
    [FoodCategory.CONDIMENTS]: 'Condimentos y Salsas',
    [FoodCategory.OTHER]: 'Otros'
};

export interface ServingUnit {
    id?: number;
    label: string;
    weightGrams: number;
    isDefault?: boolean;
}

export interface Food {
    id?: number;
    name: string;
    brand?: string;
    barcode?: string;
    servingSize?: number;
    servingUnit?: string;
    category?: FoodCategory;
    nutritionalInfo?: NutritionalInfo;
    servingUnits?: ServingUnit[];
    createdAt?: string;
    updatedAt?: string;
}

export interface FoodRequest {
    name: string;
    brand?: string;
    barcode?: string;
    servingSize?: number;
    servingUnit?: string;
    category?: FoodCategory;
    nutritionalInfo: Partial<NutritionalInfo>;
    servingUnits?: ServingUnit[];
}

export interface Page<T> {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface BarcodeSearchResponse {
    foundInDatabase: boolean;
    source: 'local' | 'openfoodfacts' | 'none';
    food?: Food;
    message?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    validationErrors?: Record<string, string>;
}

export interface NutritionalFilters {
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    minCarbs?: number;
    maxCarbs?: number;
    minFats?: number;
    maxFats?: number;
}
