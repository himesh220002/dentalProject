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
        const el = ref.current;
        if (!el) return;
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
        io.observe(el);
        return () => io.disconnect();
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
    return (
        <section className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="hidden grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-14">
                {[
                    { label: 'Years of care', value: <CountUp end={expNum} suffix="+" />, sub: `Since ${clinicData?.establishedYear || '2014'}` },
                    { label: 'Happy patients', value: <CountUp end={happyNum} suffix="+" />, sub: 'Across Katihar' },
                    { label: 'Sterile success', value: <><CountUp end={Math.floor(successNum)} />.{String(successNum).split('.')[1] || '9'}%</>, sub: 'Class-B protocols' },
                ].map((m) => (
                    <div key={m.label} className="rounded-2xl bg-white border border-black/5 p-5 sm:p-6">
                        <div className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.04em] leading-none text-[#0a0a0b]">{m.value}</div>
                        <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500 mt-2">{m.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-1 hidden sm:block">{m.sub}</div>
                    </div>
                ))}
            </div>
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                    <div className="bg-white p-2 rounded-[24px] border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
                        {isLoading ? <Skeleton variant="rect" className="rounded-[18px] w-full h-[360px] lg:h-[440px]" /> : <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop" alt="Precision Dental Care at ToothOp Katihar" className="rounded-[18px] w-full h-[360px] lg:h-[440px] object-cover" />}
                        {!isLoading && <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-[#0a0a0b] text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10"><div className="w-10 h-10 rounded-full bg-white text-black grid place-items-center font-bold">✓</div><div><div className="text-[18px] font-semibold leading-none">{t.homeTrust.badgeSubtitle}</div><div className="text-[10px] tracking-[0.16em] uppercase font-medium text-white/60">{t.homeTrust.badgeTitle}</div></div></div>}
                    </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                    <div>
                        <div className="inline-flex px-3 py-1 rounded-full bg-white border border-black/5 text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-600">{t.homeTrust.tag}</div>
                        <h2 className="mt-4 text-[30px] sm:text-[38px] lg:text-[42px] font-semibold tracking-[-0.03em] leading-[1.05] text-blue-400">Excellence in modern<br /><span className="font-serif italic font-normal text-neutral-400">dentistry — made calm.</span></h2>
                        <p className="mt-4 text-[14.5px] leading-7 text-neutral-400 max-w-[560px]">{t.homeTrust.description}</p>
                    </div>
                    <div className="space-y-4">
                        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="flex gap-4"><Skeleton variant="circle" className="w-10 h-10 !rounded-xl" /><div className="flex-1 space-y-2"><Skeleton variant="text" className="h-5 w-1/3" /><Skeleton variant="text" className="h-4 w-full" /></div></div>) : features.map((f, idx) => <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-white via-cyan-400/80 to-transparent backdrop-blur-sm shadow-xl shadow-blue-800/20"><div className="w-10 h-10 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center shrink-0 text-sm font-bold text-neutral-700">0{idx + 1}</div><div><h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{f.title}</h3><p className="text-[13.5px] leading-6 text-neutral-600 mt-1">{f.description}</p></div></div>)}
                    </div>
                </div>
            </div>
        </section>
    );
}
