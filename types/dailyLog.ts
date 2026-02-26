export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'MORNING_SNACK' | 'AFTERNOON_SNACK';

export interface Food {
    id: number;
    name: string;
    brand?: string;
    barcode?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize: number;
    servingUnit: string;
    isVerified: boolean;
}

export interface MealEntry {
    id: number;
    foodId: number;
    foodName: string;
    brand?: string;
    mealType: MealType;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    food?: Food;
    recipeId?: number;
}

export interface DailyLog {
    id: number;
    date: string;
    dailyWeight?: number;
    meals: Record<MealType, MealEntry[]>;
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    goals?: {
        calorieGoal: number;
        proteinGoal: number;
        carbsGoal: number;
        fatsGoal: number;
    };
}

export interface AddEntryRequest {
    date: string;
    mealType: MealType;
    foodId?: number;
    recipeId?: number;
    quantity: number;
    unit: string;
    servingUnitId?: number;
}

export interface UpdateEntryRequest {
    quantity: number;
    unit: string;
    servingUnitId?: number;
    date?: string;
    mealType?: MealType;
    foodId?: number;
    recipeId?: number;
}
