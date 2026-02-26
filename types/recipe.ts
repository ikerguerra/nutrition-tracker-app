export interface Recipe {
    id: number;
    name: string;
    description?: string;
    servings: number;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    imageUrl?: string;
    isPublic: boolean;
    ingredients: RecipeIngredient[];
    nutritionPerServing: NutritionSummary;
}

export interface RecipeIngredient {
    id: number;
    foodId: number;
    foodName: string;
    brand?: string;
    quantity: number;
    unit: string;
}

export interface NutritionSummary {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface CreateRecipeRequest {
    name: string;
    description?: string;
    servings: number;
    prepTime?: number;
    cookTime?: number;
    instructions?: string;
    imageUrl?: string;
    isPublic?: boolean;
    ingredients: {
        foodId: number;
        quantity: number;
        unit: string;
    }[];
}
