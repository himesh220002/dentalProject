'use client';

import Link from 'next/link';
import ClinicCarousel from '@/components/ClinicCarousel';
import HomeHero from '@/components/home/HomeHero';
import ActionTiles from '@/components/home/ActionTiles';
import TrustSection from '@/components/home/TrustSection';
import PatientReviews from '@/components/about/PatientReviews';
import { FaUserMd, FaArrowRight } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';

export default function Home() {
    const { clinicData } = useClinic();
    const doctorName = clinicData?.doctorName || 'Dr. Tooth';
    const chiefConsultant = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief')) || clinicData?.consultants[0];
    const doctorRole = chiefConsultant?.role || 'Chief Dental Surgeon';
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
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black">Conservative Approach</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">We prioritize saving your natural teeth and only recommend aggressive treatments when absolutely necessary.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black">Sterile Excellence</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">Our clinic follows international hygiene standards with ultra-strict sterilization protocols for every session.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black">Painless Dentistry</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">We use modern numbing techniques and gentle clinical practices to ensure your visit is completely anxiety-free.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Patient Testimony Preview */}
            <div className="overflow-hidden">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
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
                <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <ClinicCarousel />
                </div>
            </section>

            {/* Elite CTA Strip */}
            <section className="pb-12 sm:pb-20 overflow-hidden relative">
                <div className="bg-gradient-to-br from-blue-800 to-black text-white rounded-[2.5rem] sm:rounded-[4rem] p-10 sm:p-16 md:p-24 text-center space-y-10 sm:space-y-12 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-44 -mt-44 blur-[100px] group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full -mr-40 -mb-40 blur-[80px]"></div>

                    <div className="relative z-10 space-y-6 sm:space-y-8">
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-tight max-w-4xl mx-auto tracking-tight">
                            Transforming Smiles, <br /> One Patient at a Time.
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
