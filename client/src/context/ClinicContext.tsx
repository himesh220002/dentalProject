'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface ClinicData {
    clinicName: string;
    doctorName: string;
    tagline: string;
    establishedYear: string;
    clinicExperience: string;
    phone: string;
    staffPhone: string;
    email: string;
    expertise: string;
    visitPolicy: string;
    happyCustomers: string;
    successRate: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        latitude?: string;
        longitude?: string;
    };
    socialLinks: {
        facebook: string;
        twitter: string;
        linkedin: string;
        instagram: string;
    };
    timings: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    certifications: string;
    treatments: Array<{ name: string; price: string; description: string; image: string }>;
    consultants: Array<{ name: string; role: string; info: string; experience: string }>;
    highlights: Array<{ title: string; description: string }>;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string;
    };
    lunchTime: string;
}

const DEFAULT_CLINIC_DATA: ClinicData = {
    clinicName: 'ToothOp',
    doctorName: 'ToothOp',
    tagline: "Your Smile's Guardian",
    email: 'care@drToothdental.in',
    phone: '+91 9876543210',
    staffPhone: '+91 9876543210',
    establishedYear: '2014',
    clinicExperience: '10',
    expertise: 'Restorative Dentistry, Oral Surgery, Orthodontics, Cosmetic Dentistry',
    visitPolicy: 'Prior Appointment Recommended. Walk-ins subject to availability.',
    happyCustomers: '5000+',
    successRate: '99.9',
    address: {
        street: 'Dental Clinic Road, Near Market',
        city: 'Katihar',
        state: 'Bihar',
        zip: '854105',
        latitude: '28.55',
        longitude: '77.25'
    },
    socialLinks: {
        facebook: 'https://www.facebook.com/',
        twitter: 'https://x.com/tweeter?lang=en',
        linkedin: 'https://www.linkedin.com/',
        instagram: 'https://www.instagram.com/'
    },
    timings: {
        monday: '09:00 AM - 08:00 PM',
        tuesday: '09:00 AM - 08:00 PM',
        wednesday: '09:00 AM - 08:00 PM',
        thursday: '09:00 AM - 08:00 PM',
        friday: '09:00 AM - 08:00 PM',
        saturday: '09:00 AM - 06:00 PM',
        sunday: 'Closed'
    },
    certifications: 'Best Dentist Award 2022, Certified Implantologist, Member of IDA',
    consultants: [
        { name: 'ToothOp', role: 'Chief Surgeon', info: 'BDS, MDS', experience: '12 Years' },
        { name: 'Dr. nefario', role: 'Orthodontist', info: 'Expert in Braces & Aligners', experience: '8 Years' }
    ],
    treatments: [
        { name: 'General Consultation', price: '300', description: 'Initial dental check‑up where the dentist examines teeth, gums, and oral health, provides diagnosis.', image: 'images/dentalconsult.webp' },
        { name: 'Scaling & Cleaning', price: '800', description: 'Professional removal of plaque, tartar, and stains from teeth surfaces and gum line to prevent cavities and gum disease.', image: 'https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?q=80&w=687' },
        { name: 'Dental Fillings', price: '1000', description: 'White composite material used to restore decayed or damaged teeth, preserving natural tooth structure.', image: 'https://images.unsplash.com/photo-1694345215004-837b089f620d?q=80&w=1929' },
        { name: 'Tooth Extraction', price: '500', description: 'Removal of damaged or infected tooth when it cannot be saved by other dental treatments.', image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?q=80&w=1631' },
        { name: 'Root Canal Treatment', price: '3500', description: 'Removes infected tooth pulp and seals the canal to save the tooth from extraction and further infection.', image: 'https://www.smilecentre.in/assets/images/treatments/root-canal-procedure.jpg' },
        { name: 'Dental Implants', price: '25000', description: 'Artificial tooth roots used to replace missing teeth, providing stable and long‑lasting support for crowns or dentures.', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg' },
        { name: 'Teeth Whitening', price: '5000', description: 'Professional bleaching process to lighten discolored teeth and improve smile appearance without damaging tooth structure.', image: 'https://www.smilecentre.in/assets/images/treatments/tooth-whitening.jpg' },
        { name: 'Orthodontic Braces', price: '15000', description: 'Metal, ceramic, or clear aligners used to straighten teeth and correct bite issues for improved function and aesthetics.', image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg' },
        { name: 'Crowns & Bridges', price: '3500', description: 'Tooth‑shaped caps that cover damaged teeth or act as replacements for missing teeth, supported by implants or natural teeth.', image: 'https://www.cyprusfamilydental.com/wp-content/uploads/2022/12/Depositphotos_274172422_L.jpg' },
        { name: "Kid's Dentistry", price: '500', description: 'Gentle dental care for children including check‑ups, sealants, fluoride treatments, and age‑appropriate restorative care.', image: 'https://www.dratuljajoo.com/wp-content/uploads/2018/09/kids-dentistry.jpg' },
        { name: 'Full Mouth X-Ray', price: '500', description: 'Comprehensive X‑ray imaging of all teeth and jaw structures for detailed diagnosis of dental conditions.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjXnsLV9glWBJ77_38thCOxDEeWWN0sqTD3A&s' }
    ],
    highlights: [
        { title: 'Advanced Technology', description: 'Intraoral scanners & 3D imaging for precise diagnosis.' },
        { title: 'Pain-free Dentistry', description: 'Modern anesthesia & laser treatments for comfort.' },
        { title: 'Sterile Environment', description: 'Class B Autoclave sterilization protocols.' }
    ],
    seo: {
        metaTitle: 'Best Dental Clinic in Katihar | ToothOp',
        metaDescription: 'Expert dental care by ToothOp. Specializing in Root Canal, Implants, and Braces. Advanced technology and painless treatments in Katihar.',
        keywords: 'dentist in katihar, dental clinic, root canal, teeth whitening, orthodontist'
    },
    lunchTime: '01:00 PM - 02:00 PM'
};

interface ClinicContextType {
    clinicData: ClinicData | null;
    isLoading: boolean;
    error: string | null;
    language: 'en' | 'hi';
    toggleLanguage: () => void;
    refreshClinicData: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const [clinicData, setClinicData] = useState<ClinicData | null>(DEFAULT_CLINIC_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    // Load language preference from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('clinic_lang') as 'en' | 'hi';
        if (savedLang) setLanguage(savedLang);
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'hi' : 'en';
        setLanguage(newLang);
        localStorage.setItem('clinic_lang', newLang);
    };

    const fetchActiveHandover = async () => {
        setIsLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
            const normalizedApiBaseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
            const response = await axios.get(`${normalizedApiBaseUrl}/handover/active`, {
                validateStatus: () => true,
            });

            if (response.status === 200 && response.data?.jsondata) {
                setClinicData(response.data.jsondata);
                setError(null);
            } else if (response.status === 404) {
                // No active handover yet; keep default clinic data without noisy console errors.
                setClinicData(DEFAULT_CLINIC_DATA);
                setError(null);
            } else {
                setError(response.data?.message || 'Connecting to server...');
            }
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            console.error('Error fetching active clinic data:', err);
            setError(axiosError.response?.data?.message || 'Connecting to server...');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveHandover();
    }, []);

    return (
        <ClinicContext.Provider value={{
            clinicData,
            isLoading,
            error,
            language,
            toggleLanguage,
            refreshClinicData: fetchActiveHandover
        }}>
            {children}
        </ClinicContext.Provider>
    );
}

export function useClinic() {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
}
