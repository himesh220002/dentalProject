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
        const clinic = response.data.jsondata;
        const seo = clinic.seo;

        const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://drtoothdental.in';
        const clinicName = clinic.clinicName || 'Dr. Tooth Dental Clinic';
        const city = clinic.address?.city || 'Katihar';
        const phone = clinic.phone || '+91 98765 43210';

        return {
            title: seo.metaTitle || `${clinicName} | Best Dentist in ${city}, Bihar`,
            description: seo.metaDescription || `Experience professional dental care at ${clinicName}, ${city}. Specializing in painless treatments, implants, and orthodontic care with ${clinic.clinicExperience || '10+'}+ years of expertise.`,
            keywords: seo.keywords || `dental clinic ${city}, best dentist in ${city}, ${clinicName} ${city}, dental implants Bihar, painless dentistry, dental surgery ${city}`,
            openGraph: {
                title: seo.metaTitle || `${clinicName} | Expert Dental Care in ${city}`,
                description: seo.metaDescription || `Top-rated dental clinic in ${city} providing advanced treatments and compassionate care.`,
                url: baseUrl,
                siteName: clinicName,
                images: [
                    {
                        url: `${baseUrl}/images/clinic-og.jpg`,
                        width: 1200,
                        height: 630,
                        alt: `${clinicName} ${city}`,
                    },
                ],
                locale: 'en_IN',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: seo.metaTitle || `${clinicName} | Best Dentist in ${city}`,
                description: seo.metaDescription || `Professional Dental Care with Years of Experience in ${city}, Bihar.`,
                images: [`${baseUrl}/images/clinic-og.jpg`],
            },
            alternates: {
                canonical: baseUrl,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        };
    } catch (error) {
        return {
            title: 'Dr. Tooth Dental Clinic | Best Dentist in Katihar',
            description: 'Professional Dental Care with Years of Experience',
        };
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let clinicData: any = null;
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
        const response = await axios.get(`${API_BASE_URL}/handover/active`);
        clinicData = response.data.jsondata;
    } catch (e) {
        console.error("Failed to fetch clinic data for layout JSON-LD", e);
    }

    const clinicName = clinicData?.clinicName || "Dr. Tooth Dental Clinic";
    const address = clinicData?.address || { street: "Dental Clinic Road", city: "Katihar", state: "Bihar", zip: "854105" };
    const phone = clinicData?.phone || "+919876543210";
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://drtoothdental.in";

    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50/20 via-white to-purple-800/30 text-gray-900">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Dentist",
                            "name": clinicName,
                            "image": `${baseUrl}/images/clinic-og.jpg`,
                            "@id": baseUrl,
                            "url": baseUrl,
                            "telephone": phone.replace(/\s+/g, ''),
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": address.street,
                                "addressLocality": address.city,
                                "addressRegion": address.state,
                                "postalCode": address.zip,
                                "addressCountry": "IN"
                            },
                            "geo": {
                                "@type": "GeoCoordinates",
                                "latitude": address.latitude || 25.555613,
                                "longitude": address.longitude || 87.556440
                            },
                            "openingHoursSpecification": {
                                "@type": "OpeningHoursSpecification",
                                "dayOfWeek": [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday"
                                ],
                                "opens": "10:00",
                                "closes": "20:00"
                            }
                        })
                    }}
                />
                <Providers>
                    <Navbar />
                    <main className="flex-grow mx-auto w-full">
                        {children}
                    </main>
                    <Footer />
                    <LanguageToggle />
                </Providers>
            </body>
        </html>
    );
}
