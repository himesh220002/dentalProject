'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageToggle from './LanguageToggle';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function AppChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // Always open pages from top — prevents random scroll restoration
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        // `instant` avoids smooth-scroll delay from `html { scroll-behavior: smooth }`
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        // Fallbacks for browsers that don't support `instant`
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Also reset any scrollable <main> if layout ever becomes scroll container
        const main = document.querySelector('main');
        if (main) main.scrollTop = 0;
    }, [pathname]);

    return (
        <>
            {!isDashboardRoute && <Navbar />}
            <main className="flex-grow mx-auto w-full max-w-full min-w-0 overflow-x-clip">
                {children}
            </main>
            {!isDashboardRoute && <Footer />}
            {!isDashboardRoute && <FloatingWhatsApp />}
            {!isDashboardRoute && <LanguageToggle />}
        </>
    );
}
