import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import authService, { LoginRequest, RegisterRequest } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    user: any | null;
    login: (data: LoginRequest) => Promise<void>;
    loginWithToken: (accessToken: string, refreshToken: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const decodeToken = (token: string): any => {
        try {
            const decoded: any = jwtDecode(token);
            // Check if token is expired (exp is in seconds, Date.now() in ms)
            if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
                console.log("Token is expired");
                return null;
            }
            return decoded;
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await authService.getCurrentToken();
                if (token) {
                    const decoded = decodeToken(token);
                    if (decoded) {
                        setIsAuthenticated(true);
                        setUser(decoded);
                    } else {
                        // Token is invalid or expired, clear it
                        await authService.logout();
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                }
            } catch (e) {
                console.error("Token check failed", e);
            } finally {
                setLoading(false);
            }
        };
        checkToken();
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        const res = await authService.login(data);
        setIsAuthenticated(true);
        setUser(decodeToken(res.accessToken));
    }, []);

    const loginWithToken = useCallback(async (accessToken: string, refreshToken: string) => {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        setIsAuthenticated(true);
        setUser(decodeToken(accessToken));
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        const res = await authService.register(data);
        setIsAuthenticated(true);
        setUser(decodeToken(res.accessToken));
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, user, login, loginWithToken, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
