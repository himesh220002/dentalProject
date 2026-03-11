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
            title: `Contact Us | Book Appointment at ${clinicName} ${city}`,
            description: `Get in touch with ${clinicName} in ${city}, Bihar. Book your appointment online, call us, or visit our clinic for expert dental care.`,
            openGraph: {
                title: `Contact & Book Appointment | ${clinicName} ${city}`,
                description: `Looking for the best dentist in ${city}? Contact ${clinicName} today to schedule your visit.`,
            }
        };
    } catch (error) {
        return {
            title: 'Contact Us | Dental Clinic Appointment',
            description: 'Schedule your appointment or reach out to us for any dental queries.',
        };
    }
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
