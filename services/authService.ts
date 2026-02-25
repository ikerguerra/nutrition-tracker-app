import * as SecureStore from 'expo-secure-store';
import apiClient, { API_BASE_URL } from './apiClient';

const API_URL = `/auth`;

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`${API_URL}/login`, data);
    if (response.data.accessToken) {
        await SecureStore.setItemAsync('accessToken', response.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    }
    return response.data;
};

const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`${API_URL}/register`, data);
    if (response.data.accessToken) {
        await SecureStore.setItemAsync('accessToken', response.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    }
    return response.data;
};

const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
};

const deleteAccount = async (password: string): Promise<void> => {
    await apiClient.delete(`/users/me`, {
        data: { password }
    });
    await logout();
};

const getCurrentToken = async () => {
    return await SecureStore.getItemAsync('accessToken');
};

const authService = {
    login,
    register,
    logout,
    deleteAccount,
    getCurrentToken,
};

export default authService;
