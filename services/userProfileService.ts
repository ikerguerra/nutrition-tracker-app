import apiClient from './apiClient';
import type { UserProfile, UserProfileUpdateRequest } from '../types/userProfile';

const getMyProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get('/profile');
    return response.data;
};

const updateMyProfile = async (profileData: UserProfileUpdateRequest): Promise<UserProfile> => {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
};

const userProfileService = {
    getMyProfile,
    updateMyProfile,
};

export default userProfileService;
