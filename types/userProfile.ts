export interface UserProfile {
    id: number;
    height: number | null;
    weight: number | null;
    dateOfBirth: string | null;
    age: number | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    nutritionalGoal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE' | 'GAIN_WEIGHT' | null;
    dietType: 'STANDARD' | 'KETOGENIC' | 'VEGAN' | 'VEGETARIAN' | 'PALEO' | 'HIGH_PROTEIN' | 'LOW_CARB' | null;
    activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE' | null;
    preferredUnitSystem: 'METRIC' | 'IMPERIAL';
    preferredLanguage: 'es' | 'en';
    dailyCalorieGoal: number | null;
    dailyProteinGoal: number | null;
    dailyCarbsGoal: number | null;
    dailyFatsGoal: number | null;
    useCustomMacros: boolean;
    customProteinPercentage: number | null;
    customCarbsPercentage: number | null;
    customFatsPercentage: number | null;
    xp?: number;
    level?: number;
}

export interface UserProfileUpdateRequest {
    height?: number;
    weight?: number;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    nutritionalGoal?: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE' | 'GAIN_WEIGHT';
    dietType?: 'STANDARD' | 'KETOGENIC' | 'VEGAN' | 'VEGETARIAN' | 'PALEO' | 'HIGH_PROTEIN' | 'LOW_CARB';
    activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
    preferredUnitSystem?: 'METRIC' | 'IMPERIAL';
    preferredLanguage?: 'es' | 'en';
    useCustomMacros?: boolean;
    customProteinPercentage?: number;
    customCarbsPercentage?: number;
    customFatsPercentage?: number;
}
