export type AchievementType =
    | 'STREAK_3'
    | 'STREAK_7'
    | 'STREAK_30'
    | 'STREAK_100'
    | 'FIRST_LOG'
    | 'FIRST_GOAL'
    | 'WEIGHT_LOGGED'
    | 'WEIGHT_MILESTONE'
    | 'CONSISTENCY_WEEK'
    | 'CONSISTENCY_MONTH'
    | 'FIRST_RECIPE'
    | 'FIRST_TEMPLATE'
    | 'FIRST_RECOMMENDATION';

export interface AchievementDto {
    id: number;
    type: AchievementType;
    displayName: string;
    progress: number;
    target: number;
    progressPercentage: number;
    unlocked: boolean;
    unlockedAt: string | null;
}

export interface AchievementsSummary {
    unlockedCount: number;
    totalCount: number;
    completionPercentage: number;
}
