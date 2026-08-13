'use client';

import { ClinicProvider } from '../context/ClinicContext';
import { AuthProvider } from '../context/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ClinicProvider>
                {children}
            </ClinicProvider>
        </AuthProvider>
    );
}
