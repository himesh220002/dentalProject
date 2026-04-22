import axios from 'axios';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
        const normalizedApiBaseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
        const response = await axios.get(`${normalizedApiBaseUrl}/handover/active`);
        const clinic = response.data.jsondata;
        const clinicName = clinic.clinicName || 'Dr. Tooth Dental Clinic';
        const city = clinic.address?.city || 'Katihar';

        return {
            title: `About Our Clinic | ${clinicName} - Expert Dentist in ${city}`,
            description: `Learn about ${clinicName}, the leading dental care provider in ${city}. With ${clinic.clinicExperience || '10+'} years of excellence, we specialize in painless dentistry and elite patient care.`,
            openGraph: {
                title: `About ${clinicName} | Dental Excellence in ${city}`,
                description: `Meet our team of specialists at ${clinicName}. Discover our mission for painless and professional dental care.`,
            }
        };
    } catch {
        return {
            title: 'About Our Dental Clinic | Professional Care',
            description: 'Learn about our heritage and commitment to dental excellence.',
        };
    }
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
