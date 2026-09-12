'use client';

import { useEffect, useRef, useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import Skeleton from '../ui/Skeleton';

function CountUp({ end, suffix = '', duration = 1400 }: { end: number; suffix?: string; duration?: number }) {
    const [v, setV] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const t0 = performance.now();
                const tick = (now: number) => {
                    const p = Math.min(1, (now - t0) / duration);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setV(Math.round(eased * end));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.35 });
        io.observe(el); return () => io.disconnect();
    }, [end, duration]);
    return <span ref={ref}>{v.toLocaleString('en-IN')}{suffix}</span>;
}

export default function TrustSection() {
    const { clinicData, language, isLoading } = useClinic();
    const t = translations[language];
    const happyNum = parseInt((clinicData?.happyCustomers || '5000+').replace(/\D/g, '')) || 5000;
    const expNum = parseInt(clinicData?.clinicExperience || '10') || 10;
    const successNum = parseFloat(clinicData?.successRate || '99.9') || 99.9;
    const features = clinicData?.highlights?.length
        ? clinicData.highlights.map((h) => ({ title: h.title, description: h.description }))
        : [
            { title: 'Advanced Technology', description: 'Intraoral scanners & 3D imaging for precise diagnosis.' },
            { title: 'Pain-free Dentistry', description: 'Modern anesthesia & laser treatments for comfort.' },
            { title: 'Sterile Environment', description: 'Class B Autoclave sterilization protocols.' },
        ];
    const audiences = ['Families', 'Kids & teens', 'Working professionals', 'Seniors', 'First-time visitors', 'Follow-up care'];

    return (
        <section className="bg-[#fcfcfc] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 mt-0 xl:mt-16">
            {/* stats — keep exact but tighter */}
            <div className="grid grid-cols-3 gap-0 rounded-[20px] bg-white border border-black/5 overflow-hidden shadow-sm">
                {[
                    { label: 'Years of care', value: <CountUp end={expNum} suffix="+" />, sub: `Since ${clinicData?.establishedYear || '2014'}` },
                    { label: 'Happy patients', value: <CountUp end={happyNum} suffix="+" />, sub: 'Katihar & beyond' },
                    { label: 'Sterile success', value: <><CountUp end={Math.floor(successNum)} />.{String(successNum).split('.')[1] || '9'}%</>, sub: 'Class-B protocols' },
                ].map((m, idx) => (
                    <div key={m.label} className={`px-4 sm:px-6 py-5 sm:py-6 ${idx !== 2 ? 'border-r border-black/5' : ''}`}>
                        <div className="text-[24px] sm:text-[32px] font-semibold tracking-[-0.04em] leading-none text-[#0a0a0b] tabular-nums">{m.value}</div>
                        <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500 mt-2">{m.label}</div>
                        <div className="text-[11px] tracking-[-0.01em] text-neutral-400 mt-1 hidden sm:block">{m.sub}</div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-10 items-start">
                {/* Left — image card + pills — badge now inside, no overlap */}
                <div className="relative order-2 lg:order-1 flex flex-col gap-4">
                    <div className="relative bg-white p-2 sm:p-2.5 rounded-[24px] border border-black/5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-visible">
                        <div className="relative rounded-[18px] overflow-hidden">
                            {isLoading ? <Skeleton variant="rect" className="rounded-[18px] w-full h-[380px] lg:h-[440px]" /> : <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop" alt="Precision Dental Care at ToothOp Katihar" className="w-full h-[380px] lg:h-[440px] object-cover" />}
                            {/* badge inside image, inset */}
                            {!isLoading && (
                                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-[#0a0a0b] text-white pl-2.5 pr-3.5 py-2.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] flex items-center gap-2.5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-white text-[#0a0a0b] grid place-items-center font-bold text-xs shrink-0">✓</div>
                                    <div className="leading-none text-left">
                                        <div className="text-[12px] font-semibold tracking-[-0.01em]">{t.homeTrust.badgeSubtitle}</div>
                                        <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-white/60">{t.homeTrust.badgeTitle}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* pills — separate row, no collision */}
                    <div className="flex flex-wrap gap-2">
                        {audiences.map(a => <span key={a} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-600 hover:border-black/10 transition-colors duration-200 shadow-sm">{a}</span>)}
                    </div>
                </div>

                {/* Right — copy + features + dark bar */}
                <div className="order-1 lg:order-2 flex flex-col gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ For calm, modern care ]</div>
                        <h2 className="mt-3 text-[30px] sm:text-[38px] lg:text-[42px] font-semibold tracking-[-0.03em] leading-[0.95] text-[#0a0a0b]">Excellence in modern<br /><span className="font-serif italic font-normal text-neutral-400">dentistry — made calm.</span></h2>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-600 max-w-[560px]">{t.homeTrust.description}</p>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="flex gap-4"><Skeleton variant="circle" className="w-10 h-10 !rounded-xl" /><div className="flex-1 space-y-2"><Skeleton variant="text" className="h-5 w-1/3" /><Skeleton variant="text" className="h-4 w-full" /></div></div>) : features.map((f, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-black/5 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                <div className="w-10 h-10 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center shrink-0 text-[12px] font-bold tracking-[0.08em] text-neutral-700">0{idx + 1}</div>
                                <div className="min-w-0">
                                    <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{f.title}</h3>
                                    <p className="text-[13px] leading-6 text-neutral-600 mt-1">{f.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* dark bar — now clean, no overlap, full width */}
                    <div className="rounded-2xl bg-[#0a0a0b] text-white px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                        <div className="text-[13px] leading-5 tracking-[-0.01em] flex flex-wrap items-center gap-1.5">
                            <span className="font-medium">Painless protocols</span> <span className="text-white/30 hidden sm:inline">·</span> <span className="text-white/65">Clear, upfront pricing · Mon–Sat 10:00–20:00</span>
                        </div>
                        <span className="hidden sm:grid place-items-center w-8 h-8 rounded-full bg-white text-[#0a0a0b] text-xs shrink-0">→</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
