'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import { FaPlay, FaCalendarCheck } from 'react-icons/fa';

const AppointmentSearchInline = dynamic(() => import('./AppointmentSearchInline'), { ssr: false });

export default function HomeHero() {
    const { language } = useClinic();
    const t = translations[language];

    const scrollToContact = () => {
        document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[90vh] bg-[#fcfcfc] overflow-hidden flex items-center justify-center font-sans">
            {/* Subtle Minimalist Background Patterns */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 pt-10 pb-20">
                
                {/* Left Side: Typography & CTA */}
                <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:pr-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm animate-fadeIn">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Accepting New Patients</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl xl:text-7xl font-serif font-black text-gray-900 leading-[1.1] tracking-tight">
                        Offer your smile a <br className="hidden lg:block"/>
                        <span className="relative">
                            <span className="relative z-10 text-gray-900">better retainer</span>
                            <svg className="absolute -bottom-2 left-0 w-full h-4 text-gray-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        Experience advanced clinical excellence with the aesthetic tools you love, managed seamlessly by our expert team.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button 
                            onClick={scrollToContact}
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-base font-bold shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
                        >
                            <FaCalendarCheck />
                            {t.bookNow}
                        </button>
                        
                        <button 
                            className="flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full text-base font-bold shadow-md border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            <FaPlay className="text-xs" />
                            View Clinic Tour
                        </button>
                    </div>
                </div>

                {/* Right Side: Appointment Search Floating Card */}
                <div className="lg:w-1/2 w-full max-w-md relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute -inset-4 bg-gray-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 blur-lg -z-10" />
                    
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 p-8 relative z-10">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <FaCalendarCheck className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Client-facing portal</h3>
                                <p className="text-xs font-medium text-gray-500">Integrate with the PM tools you love.</p>
                            </div>
                        </div>
                        
                        {/* 
                          Fix boundary constraint: the AppointmentSearchInline will now 
                          sit cleanly within this white box without breaking layout.
                        */}
                        <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-4">
                            <AppointmentSearchInline />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
