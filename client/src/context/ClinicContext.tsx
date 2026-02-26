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
    treatments: Array<{ name: string; price: string; description: string; whyChooseThis: string }>;
    consultants: Array<{ name: string; role: string; info: string; experience: string }>;
    highlights: Array<{ title: string; description: string }>;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string;
    };
}

interface ClinicContextType {
    clinicData: ClinicData | null;
    isLoading: boolean;
    error: string | null;
    refreshClinicData: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const [clinicData, setClinicData] = useState<ClinicData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActiveHandover = async () => {
        setIsLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
            const response = await axios.get(`${API_BASE_URL}/handover/active`);
            setClinicData(response.data.jsondata);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching active clinic data:', err);
            setError(err.response?.data?.message || 'Connecting to server...');
            // Don't set clinicData to null if it fails, keep the last successful one or let it be null initially
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveHandover();
    }, []);

    return (
        <ClinicContext.Provider value={{ clinicData, isLoading, error, refreshClinicData: fetchActiveHandover }}>
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
