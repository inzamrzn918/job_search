import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { APIService } from '../services/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const login = async (credentials: any) => {
        const data = await APIService.login(credentials);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const register = async (userData: any) => {
        return await APIService.register(userData);
    };

    useEffect(() => {
        checkAuth();
        APIService.setUnauthorizedCallback(logout);
    }, [checkAuth, logout]);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
