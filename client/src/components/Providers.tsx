'use client';

import { SessionProvider } from 'next-auth/react';
import { ClinicProvider } from '../context/ClinicContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ClinicProvider>
                {children}
            </ClinicProvider>
        </SessionProvider>
    );
}
