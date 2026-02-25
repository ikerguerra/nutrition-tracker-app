import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'nativewind';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeContextType {
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await SecureStore.getItemAsync('theme_preference');
                if (storedTheme) {
                    setThemePreference(storedTheme as 'light' | 'dark' | 'system');
                }
            } catch (e) {
                console.error("Failed to load theme preference", e);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        const updateTheme = async () => {
            try {
                if (themePreference === 'system') {
                    const systemScheme = Appearance.getColorScheme();
                    setColorScheme(systemScheme || 'light');
                } else {
                    setColorScheme(themePreference);
                }
                await SecureStore.setItemAsync('theme_preference', themePreference);
            } catch (e) {
                console.error("Failed to save theme preference", e);
            }
        };
        updateTheme();
    }, [themePreference, setColorScheme]);

    const isDark = colorScheme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme: themePreference, setTheme: setThemePreference, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
