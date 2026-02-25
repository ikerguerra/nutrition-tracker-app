import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { FoodsProvider } from "../context/FoodsContext";
import "../global.css";
import "../i18n";

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <FoodsProvider>
                    <Slot />
                </FoodsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
