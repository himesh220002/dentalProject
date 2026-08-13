'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react';

type User = {
    _id: string;
    email: string;
    name: string;
    role: string;
    patientId?: any;
    image?: string;
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
    const [jwtUser, setJwtUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isJwtLoading, setIsJwtLoading] = useState(true);

    const nextAuthSession = useNextAuthSession();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setJwtUser(JSON.parse(storedUser));
        }
        setIsJwtLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setJwtUser(userData);
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setJwtUser(null);
        
        if (nextAuthSession.status === 'authenticated') {
            await nextAuthSignOut({ redirect: false });
        }
        window.location.href = '/';
    };

    const unifiedUser = jwtUser || (nextAuthSession.data?.user as User) || null;
    const isLoading = isJwtLoading || nextAuthSession.status === 'loading';

    return (
        <AuthContext.Provider value={{ user: unifiedUser, token, login, logout, isLoading }}>
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
