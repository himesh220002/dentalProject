'use client';

import { ClinicProvider } from '../context/ClinicContext';
import { AuthProvider } from '../context/AuthContext';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <ClinicProvider>
                    {children}
                </ClinicProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
