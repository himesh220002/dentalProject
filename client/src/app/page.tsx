'use client';

import Link from 'next/link';
import ClinicCarousel from '@/components/ClinicCarousel';
import HomeHero from '@/components/home/HomeHero';
import ActionTiles from '@/components/home/ActionTiles';
import TrustSection from '@/components/home/TrustSection';
import PatientReviews from '@/components/about/PatientReviews';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';

export default function Home() {
    const { data: session } = useSession();
    const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
    const { clinicData } = useClinic();
    const doctorName = clinicData?.doctorName || 'Dr. Tooth';
    const chiefConsultant = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief')) || clinicData?.consultants[0];
    const doctorRole = chiefConsultant?.role || 'Chief Dental Surgeon';

    // Default highlights if none provided
    const defaultHighlights = [
        { title: 'Conservative Approach', description: 'We prioritize saving your natural teeth and only recommend aggressive treatments when absolutely necessary.' },
        { title: 'Sterile Excellence', description: 'Our clinic follows international hygiene standards with ultra-strict sterilization protocols for every session.' },
        { title: 'Painless Dentistry', description: 'We use modern numbing techniques and gentle clinical practices to ensure your visit is completely anxiety-free.' }
    ];

    const highlights = clinicData?.highlights && clinicData.highlights.length > 0 ? clinicData.highlights : defaultHighlights;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user) return;
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                // @ts-ignore
                const userRes = await axios.get(`${backendUrl}/api/auth/google/${session.user.id}`);
                const patientId = userRes.data?.patientId?._id;

                if (patientId) {
                    const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`);
                    const appointments = aptRes.data;

                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    const next = appointments
                        .filter((a: any) => new Date(a.date) >= now && a.status !== 'Completed' && !a.isTicked)
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                    setUpcomingAppointment(next);
                }
            } catch (err) {
                console.error('Error fetching dashboard status:', err);
            }
        };
        fetchUserData();
    }, [session]);

    return (
        <div className="space-y-32 overflow-x-hidden">
            {/* Hero Section - Elite Landing */}
            <HomeHero />

            {/* Quick Access Tiles */}
            <ActionTiles />

            {/* Trust & Expertise Section */}
            <TrustSection />

            {/* Why Patients Trust - Preview Section with refined layout */}
            <section className="bg-gray-900 mx-auto px-8 sm:px-16 lg:px-24 py-20 sm:py-32 rounded-[1.5rem] sm:rounded-[2.5rem] lg:rounded-[4rem] text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="space-y-6">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-6xl font-black leading-tight">
                                A healthy smile is the <br />
                                <span className="text-blue-500">gateway</span> to a healthy life.
                            </h2>
                            <p className="text-gray-400 text-xl font-medium max-w-2xl leading-relaxed">
                                "At our clinic, we don't just fix teeth; we build confidence. We've designed our practice to be a safe, welcoming space where you can feel at ease."
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                <FaUserMd size={40} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black">{doctorName}</h4>
                                <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">{doctorRole}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 sm:gap-12 pt-6 sm:pt-12 border-t border-white/10">
                        {highlights.map((highlight, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-2xl font-black">{highlight.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{highlight.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet Our Team - New Dynamic Section with High-tech Pattern */}
            <section className="relative py-20 px-6 sm:px-12 lg:px-16 overflow-hidden rounded-[3rem] sm:rounded-[4rem] group mx-2 sm:mx-5">
                {/* Immersive Lab Background */}
                <div className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-[2s]">
                    <img
                        src="/images/2307.i105.031.S.m005.c13.isometric biotechnology.jpg"
                        className="w-full h-full object-cover opacity-[0.8]"
                        alt="science-bg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/60"></div>
                </div>

                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-16">
                    <div className="space-y-4 text-center sm:text-start">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 leading-tight tracking-tight">Meet Our Specialists</h2>
                        <p className="text-black text-sm md:text-base lg:text-xl font-medium leading-relaxed max-w-xl">
                            Our team of experienced dental professionals is dedicated to your oral health and comfort.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {clinicData?.consultants.map((consultant, idx) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-gray-100/50 hover:border-blue-200 hover:shadow-2xl transition-all group/card">
                            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 group-hover/card:rotate-12 transition-transform">
                                <FaUserMd size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">{consultant.name}</h3>
                            <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">{consultant.role}</p>
                            <div className="space-y-2">
                                <p className="text-gray-500 text-sm font-medium">{consultant.info}</p>
                                <p className="text-gray-900 text-sm font-black italic">{consultant.experience} Experience</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Patient Testimony Preview */}
            <div className="overflow-hidden">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
                    <div className="space-y-4 text-center sm:text-start">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 leading-tight tracking-tight">Voices of Success</h2>
                        <p className="text-gray-500 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl">Real stories from real patients who trusted us with their smiles.</p>
                    </div>
                    <Link href="/about" className="group flex items-center gap-3 font-black text-blue-600 uppercase tracking-widest text-xs sm:text-sm hover:gap-6 transition-all">
                        Read All Reviews <FaArrowRight />
                    </Link>
                </div>
                <PatientReviews />
            </div>

            {/* Virtual Clinic Tour - Refined */}
            <section className="space-y-12 sm:space-y-16">
                <div className="text-center space-y-3 sm:space-y-4">
                    <h2 className="text-3xl sm:text-4xl xl:text-6xl font-black text-blue-900 uppercase">Virtual Clinic Tour</h2>
                    <div className="h-1.5 sm:h-2 w-16 sm:w-24 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-gray-400 font-bold tracking-widest text-xs sm:text-sm uppercase">Take a glimpse inside our state-of-the-art facility</p>
                </div>
                <div className="bg-white p-4 sm:p-8 mx-2 sm:mx-6 lg:mx-8 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <ClinicCarousel />
                </div>
            </section>

            {/* Floating Appointment Notification for Logged-in Users */}
            {session?.user && upcomingAppointment && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <Link
                        href="/profile"
                        className="group relative flex items-center gap-3 bg-white hover:bg-emerald-50 px-6 py-4 rounded-full shadow-2xl border-2 border-emerald-100 transition-all active:scale-95 whitespace-nowrap overflow-hidden"
                    >
                        {/* Ping Animation Background */}
                        <div className="absolute inset-0 bg-emerald-400/20 animate-ping-glow rounded-full"></div>

                        <div className="relative w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                            <FaCalendarAlt className="animate-bounce" />
                        </div>
                        <div className="relative text-left pr-4">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Status: Active</p>
                            <p className="text-sm font-black text-gray-900">Appointment Fixed • View Details</p>
                        </div>
                        <FaArrowRight className="relative text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}

            {/* Elite CTA Strip */}
            <section className="pb-12 sm:pb-20 overflow-hidden relative">
                <div className="bg-gradient-to-br from-blue-800 to-black text-white rounded-[2.5rem] sm:rounded-[4rem] p-10 sm:p-16 md:p-24 mx-1 sm:mx-5 text-center space-y-10 sm:space-y-12 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-44 -mt-44 blur-[100px] group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full -mr-40 -mb-40 blur-[80px]"></div>

                    <div className="relative z-10 space-y-6 sm:space-y-8">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight max-w-4xl mx-auto tracking-tight">
                            Transforming Smiles, <br /> <span className="bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent">One Patient at a Time.</span>
                        </h2>
                        <p className="text-blue-100 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium opacity-90">
                            Join hundreds of happy patients who trust our preventative care approach. Book your initial consultation today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 sm:pt-8">
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto bg-white text-blue-600 px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-black shadow-2xl hover:bg-gray-100 transition transform hover:-translate-y-2 active:scale-95 text-lg sm:text-xl"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="/treatments"
                                className="w-full sm:w-auto text-white border-2 border-white/30 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[2.5rem] font-bold hover:bg-white/10 transition backdrop-blur-sm text-base"
                            >
                                View Treatments
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
