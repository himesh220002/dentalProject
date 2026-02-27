import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import LanguageToggle from '../components/LanguageToggle';

import axios from 'axios';

export async function generateMetadata() {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');

        const response = await axios.get(`${API_BASE_URL}/handover/active`);
        const seo = response.data.jsondata.seo;

        return {
            title: seo.metaTitle || 'Dr. Tooth Dental Clinic',
            description: seo.metaDescription || 'Professional Dental Care with Years of Experience',
            keywords: seo.keywords || 'dental clinic, dentist, dr tooth',
        };
    } catch (error) {
        return {
            title: 'Dr. Tooth Dental Clinic',
            description: 'Professional Dental Care with Years of Experience',
        };
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
                <Providers>
                    <Navbar />
                    <main className="flex-grow max-w-[1600px] mx-auto w-full px-2 sm:px-6 lg:px-8 pt-4 sm:pt-8 lg:pt-20">
                        {children}
                    </main>
                    <Footer />
                    <LanguageToggle />
                </Providers>
            </body>
        </html>
    );
}
