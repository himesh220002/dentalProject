'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useClinic } from '../../context/ClinicContext';
import { FaArrowRight, FaPhoneAlt, FaCheck, FaStar } from 'react-icons/fa';
import Link from 'next/link';

const AppointmentSearchInline = dynamic(() => import('./AppointmentSearchInline'), { ssr: false });
const CurvedVideoBackground = dynamic(() => import('./CurvedVideoBackground'), { ssr: false });

export default function HomeHero() {
    const { clinicData } = useClinic();
    const phone = clinicData?.phone || '+91 98765 43210';
    const clinicName = clinicData?.clinicName || 'ToothOp';
    const experience = clinicData?.clinicExperience || '10';
    const happy = clinicData?.happyCustomers || '5000+';

    const heroRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const bookingRef = useRef<HTMLDivElement>(null);

    const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const scrollRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const reduceMotion = useRef(false);

    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);
    useEffect(() => {
        reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const onScroll = () => { scrollRef.current = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            if (reduceMotion.current) return;
            const rect = el.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            mouse.current.tx = nx;
            mouse.current.ty = ny;
        };
        const onLeave = () => { mouse.current.tx = 0; mouse.current.ty = 0; };
        window.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);

        const tick = () => {
            // lerp mouse
            mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.055;
            mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.055;
            const mx = reduceMotion.current ? 0 : mouse.current.x;
            const my = reduceMotion.current ? 0 : mouse.current.y;
            const vh = window.innerHeight || 800;
            const progress = Math.min(1, scrollRef.current / (vh * 0.92));
            const parallaxY = progress * -32;
            const fade = 1 - progress * 0.52;
            const scale = 1 - progress * 0.035;

            if (titleRef.current) {
                const tx = mx * 10; const ty = my * 6 + parallaxY;
                const rx = my * -1; const ry = mx * 1.2;
                titleRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
                titleRef.current.style.opacity = `${fade}`;
            }
            if (paraRef.current) {
                const tx = mx * 8; const ty = my * 5 + parallaxY;
                paraRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                paraRef.current.style.opacity = `${Math.max(0, fade - 0.04)}`;
            }
            if (ctaRef.current) {
                const tx = mx * 6; const ty = my * 4 + parallaxY;
                ctaRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                ctaRef.current.style.opacity = `${Math.max(0, fade - 0.07)}`;
            }
            if (statsRef.current) {
                const tx = mx * 4; const ty = my * 3 + parallaxY;
                statsRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                statsRef.current.style.opacity = `${Math.max(0, 1 - progress * 0.85)}`;
            }
            if (bookingRef.current) {
                const tx = mx * -6; const ty = my * 4 + parallaxY * 0.8;
                const brx = my * 0.5; const bry = mx * -0.7;
                bookingRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${brx}deg) rotateY(${bry}deg)`;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            window.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const scrollToInquiry = () => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });

    const stats = [
        { k: `${experience}+ yrs`, v: 'clinical excellence', sub: `since ${clinicData?.establishedYear || '2014'}` },
        { k: `${happy}`, v: 'happy patients', sub: 'and counting' },
        { k: `${clinicData?.successRate || '99.9'}%`, v: 'success rate', sub: 'sterile protocols' },
    ];

    return (
        <section
            ref={heroRef}
            className="relative overflow-hidden bg-[#060a1e] min-h-[100svh] -mt-[64px] isolate"
            style={{ perspective: '1200px', perspectiveOrigin: '50% 38%' } as React.CSSProperties}
        >
            <div className="absolute inset-0 z-0">
                <CurvedVideoBackground videoUrl="/video/canvasvideo.mp4" bendDepth={3.8} showControls={false} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_10%,transparent_32%,rgba(6,10,30,0.58)_78%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#060a1e]/70 via-[#060a1e]/20 to-[#0a102e]/90" />
                <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#060a1e] via-[#060a1e]/60 to-transparent" />
                <div className="absolute inset-0 opacity-[0.04] mix-blend-soft-light pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")` }} />
            </div>

            {/* top pill — add breathing room from nav */}
            {/* <div className="absolute top-[86px] sm:top-[92px] inset-x-0 z-10 pointer-events-none hidden sm:flex justify-center px-4">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/[0.07] border border-white/12 backdrop-blur-md text-[10px] tracking-[0.14em] uppercase font-medium text-white/65 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Drag / move to explore — curved display
                    <span className="hidden lg:inline text-white/25">·</span>
                    <span className="hidden lg:inline">scroll to dive in</span>
                </div>
            </div> */}

            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[860px] h-[480px] bg-[#1e3a8a]/14 rounded-full blur-[90px] pointer-events-none z-[1]" />

            <div className="relative z-10 mx-auto  px-4 sm:px-6 lg:px-8 2xl:px-40 pt-[108px] sm:pt-[128px] lg:pt-[132px] pb-10 sm:pb-12">
                <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] tracking-[0.14em] uppercase font-medium mb-5 sm:mb-6 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${ready ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#0a0a0b] border border-white/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Accepting new patients
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-md">
                        <FaStar size={10} className="text-white/70" /> 4.9 · 500+ reviews
                    </span>
                    <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-md">
                        <FaCheck size={10} /> Sterile · ISO certified
                    </span>
                </div>

                <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10 items-start">
                    <div className="space-y-5 sm:space-y-6" style={{ transformStyle: 'preserve-3d' }}>
                        <div ref={titleRef} style={{ transformStyle: 'preserve-3d' }}>
                            <h1 className="text-[32px] sm:text-[54px] lg:text-[64px] leading-[0.88] tracking-[-0.04em] font-semibold text-center sm:text-left text-white select-none">
                                <span className={`block font-sans font-bold tracking-[-0.04em] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${ready ? 'opacity-100' : 'opacity-0'}`}>Healthy smiles,</span>
                                <span className={`block font-serif italic font-normal tracking-[-0.03em] text-white/60 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 ${ready ? 'opacity-100' : 'opacity-0'}`}>cared for with compassion</span>
                                <span className={`block font-sans font-bold tracking-[-0.04em] mt-1 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>every day.</span>
                            </h1>
                            <div className="hidden sm:block mt-5 h-px w-[92%] max-w-[560px] bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
                        </div>

                        <p ref={paraRef} className={`hidden md:block max-w-[560px] text-[15px] leading-7 text-white/70 font-normal text-balance transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                            {clinicName} blends evidence-led care with a gentle chair-side manner. Minimal pain, maximal clarity — from first consult to lasting smile.
                        </p>

                        <div ref={ctaRef} className={`flex flex-wrap items-center justify-center sm:justify-start gap-3 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-400 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                            <button onClick={() => location.href = "/contact"} className="inline-flex items-center gap-3 bg-white text-[#0a0a0b] pl-6 pr-2 py-2 rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-neutral-50 transition-colors duration-200 group shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:scale-[0.98]">
                                Book appointment
                                <span className="w-8 h-8 rounded-full bg-[#0a0a0b] text-white grid place-items-center group-hover:translate-x-0.5 transition-transform duration-200 ease-out"><FaArrowRight size={11} /></span>
                            </button>
                            <Link href="/treatments" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white px-6 py-2.5 rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-white/15 transition-colors duration-200">
                                View treatments
                            </Link>
                            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-white/75 hover:text-white transition-colors duration-200">
                                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center"><FaPhoneAlt size={11} /></span>
                                {phone}
                            </a>
                        </div>

                        <div ref={statsRef} className={`grid grid-cols-3 gap-3 pt-2 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                            {stats.map((s) => (
                                <div key={s.v} className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-4 shadow-sm">
                                    <div className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.03em] text-white leading-none tabular-nums">{s.k}</div>
                                    <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-white/60 mt-1.5">{s.v}</div>
                                    <div className="text-[11px] text-white/40 mt-1 hidden sm:block">{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        <div className={`flex flex-wrap gap-2 justify-center sm:justify-start text-[11px] tracking-[0.12em] uppercase font-medium text-white/50 transition-opacity duration-700 delay-600 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">Painless protocols</span>
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">Transparent pricing</span>
                            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">Mon–Sat 10:00–20:00</span>
                        </div>
                    </div>

                    <div ref={bookingRef} className={`relative lg:sticky lg:top-[88px] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${ready ? 'opacity-100' : 'opacity-0'}`} style={{ transformStyle: 'preserve-3d' }}>
                        {/* Transparent glass — previous look */}
                        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[24px] border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden">
                            <div className="hidden md:block px-5 sm:px-6 pt-5 pb-4 border-b border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/60">Check appointment</div>
                                        <h3 className="hidden sm:block text-[16px] font-semibold tracking-[-0.02em] text-white mt-1">Find your booking in seconds</h3>
                                        <p className="hidden sm:block text-[13px] leading-5 text-white/60 mt-1 max-w-[300px]">Enter phone or booking ID — instant status, no sign-in required.</p>
                                    </div>
                                    <div className="hidden sm:grid place-items-center w-8 h-8 rounded-full bg-white/10 border border-white/15 backdrop-blur shrink-0"><FaCheck className="text-white/80" size={11} /></div>
                                </div>
                            </div>
                            <div className="bg-transparent p-3 sm:p-4">
                                <div className="rounded-[20px] bg-white border border-white/20 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                                    <AppointmentSearchInline />
                                </div>
                                <div className="mt-3 flex items-center justify-between text-[11px]">
                                    <span className="tracking-[0.12em] uppercase font-medium text-white/50">Need help?</span>
                                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-white hover:text-white/80 transition"><FaPhoneAlt size={10} className="text-white/60" /> {phone}</a>
                                </div>
                            </div>
                            <div className="hidden sm:flex px-5 sm:px-6 py-3.5 bg-black/20 backdrop-blur-md border-t border-white/10 text-white items-center justify-between">
                                <div className="text-[12px] leading-4">
                                    <div className="font-medium tracking-[-0.01em]">5000+ patients · 4.9 rating</div>
                                    <div className="text-white/55 text-[11px]">Trusted across Katihar & Bihar</div>
                                </div>
                                {/* <div className="flex -space-x-1.5">
                                    {[1, 2, 3].map((i) => <span key={i} className="w-7 h-7 rounded-full bg-white/12 border border-white/15 grid place-items-center text-[10px] font-bold">✓</span>)}
                                </div> */}
                            </div>
                        </div>
                        <div className="absolute -z-10 inset-0 translate-y-4 blur-[24px] bg-black/20 rounded-[24px] hidden lg:block pointer-events-none" />
                    </div>
                </div>

                <div className="mt-8 h-px bg-white/10" />
                <div className="flex mt-3 flex-wrap gap-2.5 text-[11px] tracking-[0.12em] uppercase font-medium text-white/45">
                    <span>General Dentistry</span><span className="opacity-30">·</span><span>Implants</span><span className="opacity-30">·</span><span>Orthodontics</span><span className="opacity-30">·</span><span>Whitening</span><span className="opacity-30">·</span><span>Kids Dentistry</span><span className="opacity-30">·</span><span>Root Canal</span>
                </div>
                <div className="hidden lg:flex absolute bottom-5 left-1/2 -translate-x-1/2 items-center gap-2 text-[10px] tracking-[0.16em] uppercase font-medium text-white/30">
                    <span className="w-5 h-px bg-white/15" /> scroll <span className="w-5 h-px bg-white/15" />
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0c0c0c] to-transparent pointer-events-none z-10" />
        </section>
    );
}
