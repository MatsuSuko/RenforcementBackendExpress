import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '@/utils/api';

const TOKEN_KEY = '@assurmoi_token';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    firstname?: string;
    lastname?: string;
}

interface JwtPayload {
    user: User;
    iat: number;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isInitializing: boolean;   // true pendant la vérification du token au démarrage
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper ────────────────────────────────────────────────────────────────────
function isTokenValid(token: string): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        return Date.now() < exp * 1000; // exp est en secondes
    } catch {
        return false;
    }
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser]               = useState<User | null>(null);
    const [token, setToken]             = useState<string | null>(null);
    const [isLoading, setIsLoading]     = useState(false);
    const [isInitializing, setIsInitializing] = useState(true); // splash de vérification

    // ── Au démarrage : restaurer le token depuis AsyncStorage ──
    useEffect(() => {
        const restoreToken = async () => {
            try {
                const saved = await AsyncStorage.getItem(TOKEN_KEY);
                if (saved && isTokenValid(saved)) {
                    const decoded = jwtDecode<JwtPayload>(saved);
                    setToken(saved);
                    setUser(decoded.user);
                } else if (saved) {
                    // Token expiré : on nettoie
                    await AsyncStorage.removeItem(TOKEN_KEY);
                }
            } catch {
                // Erreur de lecture : on continue sans token
            } finally {
                setIsInitializing(false);
            }
        };
        restoreToken();
    }, []);

    // ── Login ──
    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await authApi.login(username, password);
            const decoded = jwtDecode<JwtPayload>(data.token);

            await AsyncStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
            setUser(decoded.user);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Logout ──
    const logout = async () => {
        try {
            if (token) await authApi.logout(token);
        } catch {
            // On déconnecte quoi qu'il arrive
        } finally {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, token, isLoading, isInitializing,
            isAuthenticated: !!token,
            login, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return ctx;
}
