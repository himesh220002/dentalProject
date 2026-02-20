'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTooth, FaMagic, FaUserMd, FaNotesMedical, FaRegSmileBeam, FaMedkit } from 'react-icons/fa';

// Map icon strings from backend to React Icons components
const iconMap: { [key: string]: any } = {
    FaTooth,
    FaMagic,
    FaUserMd,
    FaNotesMedical,
    FaRegSmileBeam,
    FaMedkit
};

const colorThemes = [
    {
        primary: 'indigo',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        text: 'text-indigo-800',
        iconBg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        gradient: 'from-indigo-600 to-blue-500',
        btn: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
        primary: 'emerald',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-800',
        iconBg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        gradient: 'from-emerald-600 to-teal-500',
        btn: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
        primary: 'violet',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        text: 'text-violet-800',
        iconBg: 'bg-violet-100',
        icon: 'text-violet-600',
        gradient: 'from-violet-600 to-purple-500',
        btn: 'bg-violet-600 hover:bg-violet-700'
    },
    {
        primary: 'amber',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-800',
        iconBg: 'bg-amber-100',
        icon: 'text-amber-600',
        gradient: 'from-amber-600 to-orange-500',
        btn: 'bg-amber-600 hover:bg-amber-700'
    },
    {
        primary: 'rose',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-800',
        iconBg: 'bg-rose-100',
        icon: 'text-rose-600',
        gradient: 'from-rose-600 to-pink-500',
        btn: 'bg-rose-600 hover:bg-rose-700'
    },
    {
        primary: 'sky',
        bg: 'bg-sky-50',
        border: 'border-sky-100',
        text: 'text-sky-800',
        iconBg: 'bg-sky-100',
        icon: 'text-sky-600',
        gradient: 'from-sky-600 to-cyan-500',
        btn: 'bg-sky-600 hover:bg-sky-700'
    },
];

interface Treatment {
    _id: string;
    name: string;
    description: string;
    whyNeed: string;
    price: string;
    icon: string;
}

export default function Treatments() {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleBookNow = (treatmentName: string) => {
        router.push(`/contact?treatment=${encodeURIComponent(treatmentName)}`);
    };

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`);
                if (!res.ok) {
                    throw new Error('Failed to fetch treatments');
                }
                const data = await res.json();
                setTreatments(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTreatments();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    if (error) return (
        <div className="text-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 max-w-lg mx-auto m-8">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="space-y-16 py-5 sm:py-12 px-0 sm:px-4 md:px-8">
            <div className="text-center space-y-3 sm:space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-gray-900">
                    Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dental Care</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-500 font-medium">
                    State-of-the-art technology meets compassionate care. Explore our precision treatments for your perfect smile.
                </p>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 max-w-7xl mx-auto">
                {treatments.map((item, index) => {
                    const theme = colorThemes[index % colorThemes.length];
                    const IconComponent = iconMap[item.icon] || FaTooth;

                    return (
                        <div
                            key={item._id}
                            className={`group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${theme.border} overflow-hidden hover:-translate-y-2`}
                        >
                            {/* Decorative Background Pattern */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700`}></div>

                            {/* Card Content */}
                            <div className="p-8 space-y-6 relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-5">
                                    <div className={`${theme.iconBg} p-4 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                                        <IconComponent className={`text-4xl ${theme.icon}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 leading-tight">{item.name}</h3>
                                </div>

                                {/* Body */}
                                <div className="space-y-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-1 h-4 ${theme.btn.split(' ')[0]} rounded-full`}></div>
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</h4>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
                                    </div>
                                    <div className={`${theme.bg} p-4 rounded-2xl border ${theme.border}`}>
                                        <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${theme.text}`}>Why Choose This?</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{item.whyNeed}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">Starting from</span>
                                        <span className={`text-md sm:text-2xl font-black ${theme.icon}`}>{item.price}</span>
                                    </div>
                                    <button
                                        onClick={() => handleBookNow(item.name)}
                                        className={`py-4 px-8 rounded-2xl text-white font-bold text-sm shadow-lg ${theme.gradient.replace('to-', 'hover:to-')} ${theme.btn} transform active:scale-95 transition-all duration-300`}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="max-w-4xl mx-auto mt-20 p-12 bg-gray-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 opacity-50"></div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Not sure which treatment is right?</h2>
                    <p className="text-gray-400 text-lg">Schedule a free consultation and let our specialists guide you.</p>
                    <button
                        onClick={() => router.push('/contact')}
                        className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-colors shadow-xl"
                    >
                        Schedule a Consultation
                    </button>
                </div>
            </div>
        </div>
    );
}

