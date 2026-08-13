'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import { FaPlay, FaCalendarCheck, FaPhoneAlt, FaCertificate, FaAward, FaSmile } from 'react-icons/fa';
import Image from 'next/image';

const AppointmentSearchInline = dynamic(() => import('./AppointmentSearchInline'), { ssr: false });

export default function HomeHero() {
    const { clinicData, language } = useClinic();
    const t = translations[language];
    const phone = clinicData?.phone || '+91 98765 43210';

    const scrollToContact = () => {
        document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[100vh] bg-[#fcfcfc] overflow-hidden flex items-center justify-center font-sans">
            {/* Subtle Minimalist Background Patterns & Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero-bg-tooth.png"
                    alt="Dental Background"
                    fill
                    className="object-cover opacity-60 mix-blend-multiply pointer-events-none "
                    priority
                />
            </div>
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#fcfcfc] to-transparent pointer-events-none z-0" />
            <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#fcfcfc] to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 pt-10 pb-20">

                {/* Left Side: Typography & CTA */}
                <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7 lg:pr-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm animate-fadeIn opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Accepting New Patients</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl xl:text-7xl font-serif font-black text-gray-900 leading-[1.1] tracking-tight animate-fadeIn opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        Offer your smile a <br className="hidden lg:block" />
                        <span className="relative">
                            <span className="relative z-10 text-gray-500">better retainer</span>
                            <svg className="absolute -bottom-2 left-0 w-full h-4 text-gray-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                        </span>
                    </h1>

                    {/* Highlight USP */}
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm animate-fadeIn opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        <FaCertificate className="text-blue-500" />
                        <span>Advanced Invisalign Partner</span>
                    </div>

                    <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fadeIn opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                        Experience advanced clinical excellence with the aesthetic tools you love, managed seamlessly by our expert team.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-fadeIn opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
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
                        <div className="bg-[#f9fafb] rounded-[3rem] border border-gray-100 p-4">
                            <AppointmentSearchInline />
                        </div>
                    </div>

                    {/* Quick Contact CTA moved to right side */}
                    <div className="flex justify-center pt-6 w-full animate-fadeIn opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xl font-black transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 hover:border-blue-200 tracking-wider">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <FaPhoneAlt size={14} />
                            </div>
                            {phone}
                        </a>
                    </div>

                    {/* Trust Badges moved to right side */}
                    <div className="flex flex-wrap lg:flex-col xl:flex-row gap-3 items-center justify-center pt-5 w-full animate-fadeIn opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 transition-transform hover:scale-105 hover:border-blue-200">
                            <FaCertificate className="text-blue-500" /> ISO Certified
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 transition-transform hover:scale-105 hover:border-amber-200">
                            <FaAward className="text-amber-500" /> 10+ Years Experience
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 transition-transform hover:scale-105 hover:border-emerald-200">
                            <FaSmile className="text-emerald-500" /> 5000+ Happy Patients
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
