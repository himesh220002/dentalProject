'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
const ClinicCarousel = dynamic(() => import('@/components/ClinicCarousel'), {
    ssr: false,
    loading: () => <div className="h-[420px] sm:h-[520px] bg-[#f5f5f3] animate-pulse rounded-[24px] border border-black/5" />
});
import HomeHero from '@/components/home/HomeHero';
import ActionTiles from '@/components/home/ActionTiles';
import TrustSection from '@/components/home/TrustSection';
import FAQSection from '@/components/home/FAQSection';
import { useSession } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaArrowRight, FaCalendarAlt, FaCheck, FaShieldAlt, FaCertificate, FaAward } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import { ConsultantCardSkeleton } from '@/components/ui/Skeleton';
import { io } from 'socket.io-client';
import GeneralInquiryForm from '@/components/contact/GeneralInquiryForm';
import RecentCasesGallery from '@/components/home/RecentCasesGallery';

export default function Home() {
    const { data: session } = useSession();
    const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
    const [isAptDismissed, setIsAptDismissed] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

    const { clinicData, language } = useClinic();
    const doctorName = clinicData?.doctorName || 'ToothOp';
    const chiefConsultant = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief')) || clinicData?.consultants[0];
    const doctorRole = chiefConsultant?.role || 'Chief Dental Surgeon';

    const defaultHighlights = [
        { title: 'Conservative Approach', description: 'We prioritize saving your natural teeth and only recommend aggressive treatments when absolutely necessary.' },
        { title: 'Sterile Excellence', description: 'Our clinic follows international hygiene standards with ultra-strict sterilization protocols for every session.' },
        { title: 'Painless Dentistry', description: 'We use modern numbing techniques and gentle clinical practices to ensure your visit is completely anxiety-free.' }
    ];

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
                    const now = new Date(); now.setHours(0, 0, 0, 0);
                    const next = appointments
                        .filter((a: any) => new Date(a.date) >= now && !['Completed', 'Operating'].includes(a.status) && !a.isTicked)
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                    setUpcomingAppointment(next || null);
                }
            } catch (err) { console.error('Error fetching dashboard status:', err); }
        };
        fetchUserData();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl);
        socket.on('newAppointment', () => fetchUserData());
        socket.on('updateAppointment', () => fetchUserData());
        return () => { socket.disconnect(); };
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
                    setVideoBlobUrl(URL.createObjectURL(blob)); setIsVideoLoaded(true); return;
                }
                const response = await fetch(videoUrl);
                if (!response.body || !response.body.getReader) { setIsVideoLoaded(true); return; }
                const contentLength = +(response.headers.get('Content-Length') || 0);
                const reader = response.body.getReader();
                let receivedLength = 0; const chunks = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value); receivedLength += value.length;
                    if ((receivedLength / contentLength) * 100 >= 20 && !isVideoLoaded) setIsVideoLoaded(true);
                }
                const fullBlob = new Blob(chunks, { type: 'video/mp4' });
                const blobUrl = URL.createObjectURL(fullBlob);
                setVideoBlobUrl(blobUrl);
                await cache.put(videoUrl, new Response(fullBlob));
            } catch (error) { console.error('Video loading failed:', error); setIsVideoLoaded(true); }
        };
        loadVideo();
        return () => { if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl); };
    }, []);

    return (
        <div className="bg-[#fcfcfc] overflow-x-hidden selection:bg-[#0a0a0b] selection:text-white">
            <HomeHero />
            <ActionTiles />
            <TrustSection />

            {/* Clinical Excellence */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-sm">
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">[ Patient experience ]</div>
                            <h2 className="mt-3 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">
                                Clinical Excellence in Action
                                <span className="block font-serif italic font-normal text-neutral-400 text-[26px] sm:text-[32px] mt-1.5">Compassion, every step of the way.</span>
                            </h2>
                            <p className="mt-4 text-[14px] leading-7 text-neutral-600 max-w-[520px]">
                                From the moment you step into our clinic, your comfort is our absolute priority. We blend state-of-the-art dental technology with a gentle, human touch to ensure every treatment is as painless and stress-free as possible.
                            </p>
                            <p className="mt-3 text-[13px] leading-6 text-neutral-500 max-w-[520px]">
                                Our team takes the time to listen, clearly explain your options, and support you throughout your entire dental journey.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium tracking-[-0.01em] text-neutral-600">Painless protocols</span>
                                <span className="px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium tracking-[-0.01em] text-neutral-600">Transparent clarity</span>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 p-2 sm:p-3 bg-[#fcfcfc]">
                            <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white relative aspect-[4/3] lg:aspect-[4/3]">
                                {!isVideoLoaded && (
                                    <div className="absolute inset-0 bg-[#f5f5f3] flex items-center justify-center z-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-9 h-9 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" />
                                            <p className="text-neutral-500 font-medium text-[10px] tracking-[0.14em] uppercase">Loading showcase</p>
                                        </div>
                                    </div>
                                )}
                                <video key={videoBlobUrl || 'placeholder'} className={`w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`} autoPlay muted loop playsInline preload="auto" poster="/images/video-poster.png">
                                    {videoBlobUrl ? <source src={videoBlobUrl} type="video/mp4" /> : <source src="/video/dentist video1.mp4#t=604,710" type="video/mp4" />}
                                </video>
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <RecentCasesGallery />

            {/* Team */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ The team ]</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">{translations[language].homeSpecialists.title}</h2>
                        <p className="mt-2 text-[14px] leading-6 text-neutral-500 max-w-[560px]">{translations[language].homeSpecialists.subtitle}</p>
                    </div>
                    <Link href="/about" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:gap-3 transition-all duration-200 ease-out">Meet all <FaArrowRight size={11} /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {useClinic().isLoading
                        ? [...Array(4)].map((_, i) => <ConsultantCardSkeleton key={i} />)
                        : clinicData?.consultants.map((consultant, idx) => (
                            <div key={idx} className="group bg-white rounded-[20px] border border-black/5 p-6 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-full bg-[#0a0a0b] text-white grid place-items-center transition-transform duration-300 group-hover:scale-105"><FaUserMd size={14} /></div>
                                <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{consultant.name}</h3>
                                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mt-1">{consultant.role}</p>
                                <p className="text-[13px] leading-6 text-neutral-600 mt-3 line-clamp-3">{consultant.info}</p>
                                <p className="text-[12px] font-medium tracking-[-0.01em] text-[#0a0a0b] mt-3">{consultant.experience} {translations[language].homeSpecialists.experience}</p>
                            </div>
                        ))}
                </div>
            </section>

            {/* Dark manifesto */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-8 lg:p-10 overflow-hidden relative">
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.04] blur-[40px] pointer-events-none" />
                    <div className="relative grid lg:grid-cols-[1.12fr_0.88fr] gap-8 items-center">
                        <div>
                            <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05]">A healthy smile is the <span className="font-serif italic font-normal text-white/60">gateway</span> to a healthy life.</h2>
                            <p className="mt-4 text-[14px] leading-7 text-white/70 max-w-[560px]">“At our clinic, we don’t just fix teeth; we build confidence. We’ve designed our practice to be a safe, welcoming space where you can feel at ease.”</p>
                        </div>
                        <div className="flex items-center gap-4 lg:justify-end">
                            <div className="w-12 h-12 rounded-full bg-white text-[#0a0a0b] grid place-items-center shrink-0"><FaUserMd size={16} /></div>
                            <div>
                                <div className="text-[15px] font-medium tracking-[-0.01em]">{doctorName}</div>
                                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/55">{doctorRole}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 grid md:grid-cols-3 gap-6 sm:gap-8">
                        {defaultHighlights.map((h, idx) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-white">{h.title}</h3>
                                <p className="text-[13px] leading-6 text-white/60">{h.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certified */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Certified & compliant ]</div>
                        <h2 className="mt-2 text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">Sterile, certified, <span className="font-serif italic font-normal text-neutral-400">trusted.</span></h2>
                    </div>
                    <p className="hidden sm:block text-[13px] leading-6 text-neutral-500 max-w-[420px] text-right">International hygiene standards with Class B autoclave protocols, transparent audits, and patient-first safety.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: <FaShieldAlt size={14} />, title: 'ISO Certified', desc: 'Quality management & infection control aligned to recognised standards.' },
                        { icon: <FaCertificate size={14} />, title: 'Class B Sterile', desc: 'Autoclave sterilization for every instrument, every session.' },
                        { icon: <FaAward size={14} />, title: 'IDA Member', desc: 'Associated with Indian Dental Association ethics & continuing education.' },
                        { icon: <FaCheck size={12} />, title: 'GDPR Aware', desc: 'Clear consent and privacy for patient records and communication.' },
                    ].map(card => (
                        <div key={card.title} className="bg-white rounded-[20px] border border-black/5 p-6 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            <div className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700">{card.icon}</div>
                            <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{card.title}</h3>
                            <p className="mt-2 text-[13px] leading-6 text-neutral-600">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Virtual tour */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Inside the clinic ]</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">{translations[language].homeVirtualTour.title}</h2>
                        <p className="text-[13px] leading-6 text-neutral-500 mt-2">{translations[language].homeVirtualTour.subtitle}</p>
                    </div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                    <ClinicCarousel />
                </div>
            </section>

            <FAQSection />

            {/* CTA */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="rounded-[24px] bg-white border border-black/5 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 shadow-sm">
                    <div className="max-w-[560px]">
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Get started ]</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">
                            {translations[language].homeCTA.title1} <span className="font-serif italic font-normal text-neutral-400">{translations[language].homeCTA.title2}</span>
                        </h2>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-600">{translations[language].homeCTA.subtitle}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#0a0a0b] text-white px-7 py-3.5 rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-black transition-colors duration-200 active:scale-[0.98]">
                            {translations[language].homeCTA.getStarted} <FaArrowRight size={11} />
                        </Link>
                        <Link href="/treatments" className="inline-flex items-center justify-center gap-2 bg-white border border-black/10 text-[#0a0a0b] px-7 py-3.5 rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-[#fcfcfc] transition-colors duration-200 active:scale-[0.98]">
                            {translations[language].homeCTA.viewTreatments}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                <GeneralInquiryForm />
            </section>

            {session?.user && upcomingAppointment && !isAptDismissed && (
                <div className="fixed bottom-6 right-4 sm:right-6 z-50 group/indicator">
                    <Link href="/profile" onClick={() => setIsAptDismissed(true)} className="relative flex items-center justify-center w-12 h-12 bg-[#0a0a0b] text-white rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 ease-out" aria-label={`Fixed Appointment ${new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} at ${upcomingAppointment.time}`}>
                        <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse pointer-events-none" />
                        <FaCalendarAlt className="relative z-10 text-[15px]" />
                        <span className="sr-only">Fixed Appointment {upcomingAppointment.time}</span>
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 translate-x-1 pointer-events-none group-hover/indicator:opacity-100 group-hover/indicator:translate-x-0 transition-all duration-200 ease-out hidden lg:flex">
                            <div className="bg-white pl-3 pr-4 py-3 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/5 flex items-center gap-3 whitespace-nowrap">
                                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center shrink-0"><FaCalendarAlt size={12} /></span>
                                <div className="text-left leading-none">
                                    <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">Fixed Appointment</p>
                                    <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1">{new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}</p>
                                </div>
                            </div>
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse hidden lg:block" />
                    </Link>
                </div>
            )}
        </div>
    );
}
