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
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import { ConsultantCardSkeleton } from '@/components/ui/Skeleton';
import { io } from 'socket.io-client';
import { parseAppointmentReason } from '@/utils/appointmentUtils';
import AppointmentSearchInline from '@/components/home/AppointmentSearchInline';

export default function Home() {
    const { data: session } = useSession();
    const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
    const [isAptDismissed, setIsAptDismissed] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState(0);

    const { clinicData, language } = useClinic();
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
        <div className=" mx-auto space-y-20 md:space-y-32 overflow-x-hidden">
            {/* Hero Section - Elite Landing */}
            <HomeHero />

            {/* Quick Access Tiles */}
            <ActionTiles />

            {/* Trust & Expertise Section */}
            <TrustSection />

            {/* Featured Clinical Excellence Video - Immersive Preview */}
            <section className="px-4 sm:px-10 lg:px-16">
                <div className="max-w-[1000px] mx-auto overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl border-4 border-white bg-gray-900 group relative aspect-video">
                    {!isVideoLoaded && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="text-center">
                                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Optimizing Clinical Showcase...</p>
                                    <p className="text-blue-300/50 text-[8px] font-bold mt-1 uppercase tracking-tighter">
                                        Loading: {Math.round(videoProgress)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <video
                        key={videoBlobUrl || 'placeholder'}
                        className={`w-full h-full object-cover pointer-events-none scale-105 group-hover:scale-110 transition-all duration-[5s] ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
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
                    {/* Immersive Glass Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-10 left-10 hidden md:block">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Featured Showcase</p>
                            <h3 className="text-white text-lg font-black uppercase tracking-tight">Clinical Excellence in Action</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Our Team - New Dynamic Section with High-tech Pattern */}
            <section className="relative py-20 px-6 sm:px-12 lg:px-16 overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] group mx-2 sm:mx-5 xl:mx-20 2xl:mx-40">
                {/* Immersive Lab Background */}
                <div className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-[2s]">
                    <NextImage
                        src="/images/2307.i105.031.S.m005.c13.isometric biotechnology.jpg"
                        fill
                        className="object-cover opacity-[0.8]"
                        alt="Dr. Tooth Dental Clinic - Advanced Biotechnology Background"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/60"></div>
                </div>

                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
                    <div className="space-y-4 text-center sm:text-start">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                            {translations[language].homeSpecialists.title}
                        </h2>
                        <p className="text-black text-sm md:text-base lg:text-xl font-medium leading-relaxed max-w-xl">
                            {translations[language].homeSpecialists.subtitle}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {useClinic().isLoading ? (
                        [...Array(4)].map((_, i) => <ConsultantCardSkeleton key={i} />)
                    ) : (
                        clinicData?.consultants.map((consultant, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-gray-100/50 hover:border-blue-200 hover:shadow-2xl transition-all group/card">
                                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 group-hover/card:rotate-12 transition-transform">
                                    <FaUserMd size={40} className="text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">{consultant.name}</h3>
                                <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">{consultant.role}</p>
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-sm font-medium">{consultant.info}</p>
                                    <p className="text-gray-900 text-sm font-black italic">{consultant.experience} {translations[language].homeSpecialists.experience}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Why Patients Trust - Preview Section with refined layout */}
            <section className="bg-gradient-to-br from-gray-900 to-blue-900/80 backdrop-blur-md mx-auto md:mx-10 xl:mx-20 2xl:mx-40 px-6 sm:px-12 lg:px-16 py-10 sm:py-20  sm:rounded-[2.5rem] lg:rounded-[4rem] text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                        <div className="space-y-6">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black leading-tight">
                                {language === 'hi' ? (
                                    <>एक स्वस्थ मुस्कान स्वस्थ जीवन का <br /> <span className="text-blue-500">द्वार</span> है।</>
                                ) : (
                                    <>A healthy smile is the <br /> <span className="text-blue-500">gateway</span> to a healthy life.</>
                                )}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">
                                {language === 'hi'
                                    ? '"हमारे क्लिनिक में, हम केवल दांत नहीं ठीक करते; हम आत्मविश्वास जगाते हैं। हमने अपने क्लिनिक को एक सुरक्षित, स्वागत योग्य स्थान के रूप में तैयार किया है जहां आप सहज महसूस कर सकें।"'
                                    : '"At our clinic, we don\'t just fix teeth; we build confidence. We\'ve designed our practice to be a safe, welcoming space where you can feel at ease."'
                                }
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                <FaUserMd size={40} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black">{doctorName}</h4>
                                <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">
                                    {language === 'hi' ? 'मुख्य दंत शल्य चिकित्सक' : doctorRole}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 sm:gap-12 pt-6 sm:pt-12 border-t border-white/10">
                        {defaultHighlights.map((defaultHighlights, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-lg md:text-xl font-black">{defaultHighlights.title}</h3>
                                <p className="text-gray-300 leading-relaxed font-medium text-sm md:text-base">{defaultHighlights.description}</p>
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

            {/* Virtual Clinic Tour - Refined */}
            <section className="space-y-12 sm:space-y-16 xl:mx-20 2xl:mx-40">
                <div className="text-center space-y-3 sm:space-y-4">
                    <h2 className="text-3xl sm:text-4xl xl:text-6xl font-black text-blue-900 uppercase">
                        {translations[language].homeVirtualTour.title}
                    </h2>
                    <div className="h-1.5 sm:h-2 w-16 sm:w-24 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-gray-400 font-bold tracking-widest text-xs sm:text-sm uppercase">
                        {translations[language].homeVirtualTour.subtitle}
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-8 mx-2 sm:mx-6 lg:mx-8  rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <ClinicCarousel />
                </div>
            </section>

            {/* Floating Appointment Notification - Circle Above LanguageToggle */}
            {session?.user && upcomingAppointment && !isAptDismissed && (
                <div className="fixed top-70 sm:top-70 2xl:right-40 2xl:top-40  right-4 sm:right-6 z-50 group/indicator">
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
            )}

            {/* Elite CTA Strip */}
            <section className="pb-12 sm:pb-20 overflow-hidden relative">
                <div className="bg-gradient-to-br from-blue-800 to-black text-white rounded-[2.5rem] sm:rounded-[4rem] p-10 sm:p-16 md:p-24 mx-1 sm:mx-5 xl:mx-20 2xl:mx-40 text-center space-y-10 sm:space-y-12 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-44 -mt-44 blur-[100px] group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full -mr-40 -mb-40 blur-[80px]"></div>

                    <div className="relative z-10 space-y-6 sm:space-y-8">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight max-w-4xl mx-auto tracking-tight">
                            {translations[language].homeCTA.title1} <br />
                            <span className="bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent">
                                {translations[language].homeCTA.title2}
                            </span>
                        </h2>
                        <p className="text-blue-100 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium opacity-90">
                            {translations[language].homeCTA.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 sm:pt-8">
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto bg-white text-blue-600 px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-black shadow-2xl hover:bg-gray-100 transition transform hover:-translate-y-2 active:scale-95 text-lg sm:text-xl"
                            >
                                {translations[language].homeCTA.getStarted}
                            </Link>
                            <Link
                                href="/treatments"
                                className="w-full sm:w-auto text-white border-2 border-white/30 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[2.5rem] font-bold hover:bg-white/10 transition backdrop-blur-sm text-base"
                            >
                                {translations[language].homeCTA.viewTreatments}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
