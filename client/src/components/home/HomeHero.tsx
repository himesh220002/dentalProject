'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useClinic } from '../../context/ClinicContext';
import { FaArrowRight, FaPhoneAlt, FaCheck, FaStar } from 'react-icons/fa';
import Link from 'next/link';

const AppointmentSearchInline = dynamic(() => import('./AppointmentSearchInline'), { ssr: false });
const CurvedVideoBackground = dynamic(() => import('./CurvedVideoBackground'), { ssr: false });

function AnimatedCounter({ target, suffix = '', duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const tick = (now: number) => {
                    const p = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setVal(Math.round(eased * target));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, [target, duration]);
    return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

export default function HomeHero() {
    const { clinicData } = useClinic();
    const phone = clinicData?.phone || '+91 98765 43210';
    const clinicName = clinicData?.clinicName || 'ToothOp';
    const experience = clinicData?.clinicExperience || '10';
    const happy = clinicData?.happyCustomers || '5000+';

    const scrollToInquiry = () => {
        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
    };

    const stats = [
        { k: `${experience}+ yrs`, v: 'clinical excellence', sub: `since ${clinicData?.establishedYear || '2014'}` },
        { k: `${happy}`, v: 'happy patients', sub: 'and counting' },
        { k: `${clinicData?.successRate || '99.9'}%`, v: 'success rate', sub: 'sterile protocols' },
    ];

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#060a1e] via-[#0a102e] to-[#0f2850] min-h-[100vh] -mt-20">
            {/* 3D Curved Video Canvas Background */}
            <div className="absolute inset-0 z-0 opacity-85 sm:opacity-90">
                <CurvedVideoBackground videoUrl="/video/canvasvideo.mp4" bendDepth={3.8} />
            </div>

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 pointer-events-none z-1">
                <div className="absolute inset-0 bg-gradient-to-b from-[#060a1e]/80 via-transparent to-[#0f2850]/80" />
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#1e3a8a]/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 inset-x-0 h-[280px] bg-gradient-to-t from-[#0a102e]/60 to-transparent" />
            </div>
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-30 ">
                <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-medium mb-6 sm:mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#0a0a0b] border border-white/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Accepting new patients
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur">
                        <FaStar size={10} className="text-white/70" /> 4.9 · 500+ reviews
                    </span>
                    <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur">
                        <FaCheck size={10} /> Sterile · ISO certified
                    </span>
                </div>
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10 items-start">
                    <div className="space-y-6">
                        <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] leading-[0.9] tracking-[-0.04em] font-[600] text-white">
                            <span className="block font-sans font-[700] tracking-[-0.04em]">Healthy smiles, </span>
                            <span className="block font-serif italic font-[400] tracking-[-0.03em] text-white/60">cared for with compassion</span>
                            <span className="block font-sans font-[700] tracking-[-0.04em] mt-1">every day.</span>
                        </h1>
                        <p className="max-w-[560px] text-[15.5px] sm:text-[17px] leading-7 text-white/70 font-[400] text-balance">
                            {clinicName} blends evidence-led care with a gentle chair-side manner. Minimal pain, maximal clarity — from first consult to lasting smile.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button onClick={scrollToInquiry} className="inline-flex items-center gap-3 bg-white text-[#0a0a0b] pl-6 pr-2 py-2 rounded-full text-[14px] font-medium hover:bg-neutral-100 transition group shadow-lg">
                                Book appointment
                                <span className="w-8 h-8 rounded-full bg-[#0a0a0b] text-white grid place-items-center group-hover:translate-x-0.5 transition-transform">
                                    <FaArrowRight size={12} />
                                </span>
                            </button>
                            <Link href="/treatments" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-[10px] rounded-full text-[14px] font-medium hover:bg-white/15 transition">
                                View treatments
                            </Link>
                            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-white/80 hover:text-white transition">
                                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center"><FaPhoneAlt size={12} /></span>
                                {phone}
                            </a>
                        </div>
                        <div className="grid grid-cols-4 gap-3 sm:gap-4 pt-2">
                            {stats.map((s) => (
                                <div key={s.v} className="rounded-2xl bg-white/5 backdrop-blur border border-black/5 p-4 sm:p-5 shadow-sm">
                                    <div className="text-[20px] sm:text-[22px] font-semibold tracking-[-0.03em] text-gray-200 leading-none">{s.k}</div>
                                    <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-300 mt-1">{s.v}</div>
                                    <div className="text-[11px] text-neutral-400 mt-1 hidden sm:block">{s.sub}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">Painless protocols</span>
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">Transparent pricing</span>
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">Mon–Sat 10:00–20:00</span>
                        </div>
                    </div>
                    <div className="relative lg:sticky lg:top-[84px]">
                        <div className="bg-white/5 backdrop-blur-sm rounded-[24px] sm:rounded-[28px] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                            <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-300">Check appointment</div>
                                        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-gray-100 mt-1">Find your booking in seconds</h3>
                                        <p className="text-[13px] leading-5 text-neutral-400 mt-1 max-w-[320px]">Enter phone or booking ID — instant status, no sign-in required.</p>
                                    </div>
                                    <div className="hidden sm:grid place-items-center w-9 h-9 rounded-full bg-[#f5f5f3] border border-black/5 shrink-0">
                                        <FaCheck className="text-neutral-700" size={12} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 sm:p-5 bg-[#fcfcfc]">
                                <div className="rounded-[20px] bg-white/5 backdrop-blur-sm border border-black/5 p-2 shadow-sm">
                                    <AppointmentSearchInline />
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[11px]">
                                    <span className="tracking-[0.12em] uppercase font-medium text-neutral-500">Need help?</span>
                                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-[#0a0a0b] hover:underline">
                                        <FaPhoneAlt size={10} /> {phone}
                                    </a>
                                </div>
                            </div>
                            <div className="px-6 sm:px-7 py-4 bg-[#0a0a0b] text-white flex items-center justify-between">
                                <div className="text-[12px] leading-4">
                                    <div className="font-medium tracking-[-0.01em]">5000+ patients · 4.9 rating</div>
                                    <div className="text-white/60 text-[11px]">Trusted across Katihar & Bihar</div>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <span key={i} className="w-7 h-7 rounded-full bg-white/15 border border-white/20 grid place-items-center text-[11px] font-bold">✓</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 sm:mt-10 h-px bg-white/10" />
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-white/50 justify-center sm:justify-start">
                    <span>General Dentistry</span><span className="opacity-30">·</span><span>Implants</span><span className="opacity-30">·</span><span>Orthodontics</span><span className="opacity-30">·</span><span>Whitening</span><span className="opacity-30">·</span><span>Kids Dentistry</span><span className="opacity-30">·</span><span>Root Canal</span>
                </div>
            </div>
        </section>
    );
}
