'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageToggle from './LanguageToggle';

export default function AppChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboardRoute = pathname.startsWith('/dashboard');

    return (
        <>
            {!isDashboardRoute && <Navbar />}
            <main className="flex-grow mx-auto w-full">
                {children}
            </main>
            {!isDashboardRoute && <Footer />}
            {!isDashboardRoute && <LanguageToggle />}
        </>
    );
}
