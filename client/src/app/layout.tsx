import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Providers from '../components/Providers';

export const metadata = {
    title: 'Dr. Tooth Dental Clinic',
    description: 'Professional Dental Care with 10+ Years Experience',
};

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
                    <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 lg:pt-20">
                        {children}
                    </main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
