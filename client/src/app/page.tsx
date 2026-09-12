'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
const ClinicCarousel = dynamic(() => import('@/components/ClinicCarousel'), {
    ssr: false,
    loading: () => <div className="h-[400px] md:h-[600px] bg-gray-100 animate-pulse rounded-[3rem]" />
});
import HomeHero from '@/components/home/HomeHero';
import ActionTiles from '@/components/home/ActionTiles';
import TrustSection from '@/components/home/TrustSection';
import PatientReviews from '@/components/about/PatientReviews';
import { useSession } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import { ConsultantCardSkeleton } from '@/components/ui/Skeleton';
import { io } from 'socket.io-client';
import { parseAppointmentReason } from '@/utils/appointmentUtils';
import AppointmentSearchInline from '@/components/home/AppointmentSearchInline';
import GeneralInquiryForm from '@/components/contact/GeneralInquiryForm';
import RecentCasesGallery from '@/components/home/RecentCasesGallery';

export default function Home() {
    const { data: session } = useSession();
    const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
    const [isAptDismissed, setIsAptDismissed] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState(0);

    const { clinicData, language } = useClinic();
    const doctorName = clinicData?.doctorName || 'ToothOp';
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
                const patientId = userRes.data?.patientId?._id || userRes.data?.patientId;

                if (patientId) {
                    const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`);
                    const appointments = aptRes.data;

                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    const next = appointments
                        .filter((a: any) => new Date(a.date) >= now && !['Completed', 'Operating'].includes(a.status) && !a.isTicked)
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                    setUpcomingAppointment(next || null);
                }
            } catch (err) {
                console.error('Error fetching dashboard status:', err);
            }
        };

        fetchUserData();

        // Real-time Update Listener
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl);

        socket.on('newAppointment', (data) => {
            // @ts-ignore
            if (data.patientId === session?.user?.patientId || data.patientId === upcomingAppointment?.patientId) {
                fetchUserData();
            } else {
                // Fallback: fetch anyway to be safe since sync might have happened on backend
                fetchUserData();
            }
        });

        socket.on('updateAppointment', (data) => {
            fetchUserData();
        });

        return () => {
            socket.disconnect();
        };
    }, [session]);

    useEffect(() => {
        const videoUrl = '/video/dentist video1.mp4';
        const cacheName = 'video-cache-v1';

        const loadVideo = async () => {
            try {
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(videoUrl);

                if (cachedResponse) {
                    const blob = await cachedResponse.blob();
                    setVideoBlobUrl(URL.createObjectURL(blob));
                    setIsVideoLoaded(true);
                    setVideoProgress(100);
                    return;
                }

                const response = await fetch(videoUrl);
                if (!response.body || !response.body.getReader) {
                    setIsVideoLoaded(true);
                    return;
                }

                const contentLength = +(response.headers.get('Content-Length') || 0);
                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    const progress = (receivedLength / contentLength) * 100;
                    setVideoProgress(progress);

                    // Show video after 20% download
                    if (progress >= 20 && !isVideoLoaded) {
                        setIsVideoLoaded(true);
                    }
                }

                const fullBlob = new Blob(chunks, { type: 'video/mp4' });
                const blobUrl = URL.createObjectURL(fullBlob);
                setVideoBlobUrl(blobUrl);

                // Cache the full video for next time
                await cache.put(videoUrl, new Response(fullBlob));
            } catch (error) {
                console.error('Video loading failed:', error);
                // Fallback to standard loading if fetch/cache fails
                setIsVideoLoaded(true);
            }
        };

        loadVideo();

        return () => {
            if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
        };
    }, []);

    return (
        <div className=" mx-auto space-y-20 md:space-y-22 overflow-x-hidden">
            {/* Hero & Action Tiles - Seamless Group */}
            <div className="flex flex-col">
                <HomeHero />
                <ActionTiles />
            </div>

            {/* Trust & Expertise Section */}
            <TrustSection />

            {/* Featured Clinical Excellence Video - Split Layout */}
            <section className="max-w-7xl mx-auto bg-gradient-to-r from-blue-50 via-gray-100 to-transparent rounded-[3rem] px-4 sm:px-10 lg:px-16 w-full py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Premium Copy */}
                    <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Patient Experience</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 leading-tight">
                            Compassionate Care, <br />
                            <span className="text-gray-500">Every Step of the Way.</span>
                        </h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                            From the moment you step into our clinic, your comfort is our absolute priority. We blend state-of-the-art dental technology with a gentle, human touch to ensure every treatment is as painless and stress-free as possible.
                        </p>
                        <p className="text-base text-gray-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Our team takes the time to listen, clearly explain your options, and support you throughout your entire dental journey, so you always leave with a confident smile.
                        </p>
                    </div>

                    {/* Right Side: Video */}
                    <div className="order-1 lg:order-2 w-full">
                        <div className="overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 bg-white group relative aspect-[4/3] sm:aspect-video xl:aspect-[5/3]">
                            {!isVideoLoaded && (
                                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                                        <div className="text-center">
                                            <p className="text-gray-900 font-bold text-[10px] uppercase tracking-widest">Loading Showcase</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <video
                                key={videoBlobUrl || 'placeholder'}
                                className={`w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                poster="/images/video-poster.png"
                            >
                                {videoBlobUrl ? (
                                    <source src={videoBlobUrl} type="video/mp4" />
                                ) : (
                                    <source src="/video/dentist video1.mp4#t=604,710" type="video/mp4" />
                                )}
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Cases Accordion Gallery */}
            <RecentCasesGallery />

            {/* Meet Our Team — approved minimal */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">The team</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">
                            {translations[language].homeSpecialists.title}
                        </h2>
                        <p className="mt-2 text-[14px] leading-6 text-neutral-600 max-w-[560px]">{translations[language].homeSpecialists.subtitle}</p>
                    </div>
                    <Link href="/about" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-[#0a0a0b] hover:gap-3 transition-all">
                        Meet all <FaArrowRight size={11} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {useClinic().isLoading
                        ? [...Array(4)].map((_, i) => <ConsultantCardSkeleton key={i} />)
                        : clinicData?.consultants.map((consultant, idx) => (
                            <div key={idx} className="bg-white rounded-[20px] border border-black/5 p-6 hover:border-black/10 hover:shadow-sm transition">
                                <div className="w-12 h-12 rounded-full bg-[#0a0a0b] text-white grid place-items-center">
                                    <FaUserMd size={18} />
                                </div>
                                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{consultant.name}</h3>
                                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mt-1">{consultant.role}</p>
                                <p className="text-[13px] leading-6 text-neutral-600 mt-3">{consultant.info}</p>
                                <p className="text-[12px] font-medium text-[#0a0a0b] mt-2">
                                    {consultant.experience} {translations[language].homeSpecialists.experience}
                                </p>
                            </div>
                        ))}
                </div>
            </section>
            {/* Transform — approved dark */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <div className="rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-10 lg:p-12 overflow-hidden relative">
                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-[40px]" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                        <div>
                            <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05]">
                                A healthy smile is the <span className="font-serif italic font-normal text-white/60">gateway</span> to a healthy life.
                            </h2>
                            <p className="mt-4 text-[14px] leading-7 text-white/70 max-w-[560px]">
                                “At our clinic, we don’t just fix teeth; we build confidence. We’ve designed our practice to be a safe, welcoming space where you can feel at ease.”
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white text-black grid place-items-center shrink-0">
                                <FaUserMd size={18} />
                            </div>
                            <div>
                                <div className="text-[15px] font-medium">{doctorName}</div>
                                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/60">{doctorRole}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 grid md:grid-cols-3 gap-6 sm:gap-8">
                        {defaultHighlights.map((h, idx) => (
                            <div key={idx}>
                                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-white">{h.title}</h3>
                                <p className="text-[13px] leading-6 text-white/60 mt-2">{h.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Patient Testimony Preview */}
            {/* <div className="overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mx-4 md:mx-16 mb-12">
                    <div className="space-y-4 text-center sm:text-start">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl text-center md:text-start font-black text-gray-900 leading-tight tracking-tight">
                            {translations[language].homeReviews.title}
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                            {translations[language].homeReviews.subtitle}
                        </p>
                    </div>
                    <Link href="/about" className="group flex items-center gap-3 font-black text-blue-600 uppercase tracking-widest text-xs sm:text-sm hover:gap-6 transition-all">
                        {translations[language].homeReviews.readAll} <FaArrowRight />
                    </Link>
                </div>
                <PatientReviews />
            </div> */}

            {/* Virtual clinic tour — approved minimal */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">Inside the clinic</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">{translations[language].homeVirtualTour.title}</h2>
                        <p className="text-[13px] text-neutral-500 mt-2">{translations[language].homeVirtualTour.subtitle}</p>
                    </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                    <ClinicCarousel />
                </div>
            </section>

            {/* Floating Appointment Notification - Circle Above LanguageToggle */}
            {
                session?.user && upcomingAppointment && !isAptDismissed && (
                    <div className="fixed top-24 right-4 sm:right-6 z-50 group/indicator">
                        <Link
                            href="/profile"
                            onClick={() => setIsAptDismissed(true)}
                            className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-400 text-amber-950 rounded-full shadow-[0_15px_40px_rgba(251,191,36,0.4)] border-2 border-white transition-all hover:scale-110 active:scale-90 animate-in slide-in-from-right-10 duration-700 overflow-visible"
                        >
                            {/* Pulse Ring */}
                            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-30"></div>
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>

                            <FaCalendarAlt className="relative z-10 text-lg sm:text-xl" />

                            {/* Hover Tooltip (Desktop) */}
                            <div className="absolute right-full mr-4 opacity-0 group-hover/indicator:opacity-100 transition-opacity pointer-events-none hidden lg:block">
                                <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-amber-100 whitespace-nowrap">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">
                                        Fixed Appointment
                                    </p>
                                    <p className="text-xs font-black text-gray-900">
                                        {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Badge Only */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-bounce flex lg:hidden items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                        </Link>
                    </div>
                )
            }

            {/* Transform — approved minimal CTA */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                <div className="rounded-[24px] bg-white border border-black/5 p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-[560px]">
                        <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">
                            {translations[language].homeCTA.title1} <span className="font-serif italic font-normal text-neutral-400">{translations[language].homeCTA.title2}</span>
                        </h2>
                        <p className="mt-3 text-[14.5px] leading-7 text-neutral-600">{translations[language].homeCTA.subtitle}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#0a0a0b] text-white px-8 py-3.5 rounded-full text-[14px] font-medium hover:bg-black transition">
                            {translations[language].homeCTA.getStarted} <FaArrowRight size={12} />
                        </Link>
                        <Link href="/treatments" className="inline-flex items-center justify-center gap-2 bg-white border border-black/10 text-[#0a0a0b] px-7 py-3.5 rounded-full text-[14px] font-medium hover:bg-neutral-50 transition">
                            {translations[language].homeCTA.viewTreatments}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
                <GeneralInquiryForm />
            </section>
        </div>
    );
}
