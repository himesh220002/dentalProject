import axios from 'axios';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');

        const response = await axios.get(`${API_BASE_URL}/handover/active`);
        const clinic = response.data.jsondata;
        const clinicName = clinic.clinicName || 'Dr. Tooth Dental Clinic';
        const city = clinic.address?.city || 'Katihar';

        return {
            title: `Advanced Dental Treatments | ${clinicName} ${city}`,
            description: `Explore our specialized dental treatments in ${city}, including implants, orthodontics, and cosmetic dentistry at ${clinicName}. Quality care at affordable prices.`,
            openGraph: {
                title: `Dental Treatments & Services in ${city} | ${clinicName}`,
                description: `From painless root canals to dental implants, discover the wide range of services offered by ${clinicName} in ${city}.`,
            }
        };
    } catch (error) {
        return {
            title: 'Dental Treatments | Professional Dental Services',
            description: 'View our wide range of dental treatments and services.',
        };
    }
}

export default function TreatmentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
