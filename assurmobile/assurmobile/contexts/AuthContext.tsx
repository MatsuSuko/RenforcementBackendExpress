import React, { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API } from '@/constants/api';

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
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(API.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Identifiants incorrects');
            }

            // Décodage sécurisé du JWT avec jwt-decode
            const decoded = jwtDecode<JwtPayload>(data.token);

            setToken(data.token);
            setUser(decoded.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch(API.LOGOUT, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch {
            // On déconnecte quoi qu'il arrive
        } finally {
            setUser(null);
            setToken(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
}
