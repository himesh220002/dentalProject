'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';

export default function FloatingWhatsApp() {
    const { clinicData } = useClinic();

    // Extract phone number from clinicData or provide a fallback
    const rawPhone = clinicData?.phone || '+919471283523';
    // Remove all non-numeric characters for the wa.me link
    const phoneNumeric = rawPhone.replace(/\D/g, '');

    const whatsappLink = `https://wa.me/${phoneNumeric}`;

    return (
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 sm:bottom-24 right-1 sm:right-8 z-[100] bg-green-500/20  text-white p-2 sm:p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-green-600 hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
            aria-label="Chat on WhatsApp"
        >
            <FaWhatsapp size={24} />
            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                Chat with us
                {/* Arrow */}
                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-l-4 border-l-gray-900 border-b-4 border-b-transparent"></div>
            </span>
        </a>
    );
}
