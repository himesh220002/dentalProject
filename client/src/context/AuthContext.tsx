'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type User = {
    _id: string;
    email: string;
    name: string;
    role: string;
    patientId?: any;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// Backwards compatibility hook for replacing next-auth useSession
export const useSession = () => {
    const { user, isLoading } = useAuth();
    
    return {
        data: user ? { user } : null,
        status: isLoading ? 'loading' : (user ? 'authenticated' : 'unauthenticated')
    };
};
