'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

const cases = [
    { id: 1, title: 'Gentle routine care', category: 'General · Prevention', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop', link: '/treatments/general-dentistry' },
    { id: 2, title: 'Invisible aligners', category: 'Orthodontics', image: 'https://images.unsplash.com/photo-1609840113322-a70583f106eb?q=80&w=800&auto=format&fit=crop', link: '/treatments/orthodontics' },
    { id: 3, title: 'Painless implants', category: 'Surgery · Implants', image: 'https://images.unsplash.com/photo-1667133295315-820bb6481730?q=80&w=800&auto=format&fit=crop', link: '/treatments/dental-implants' },
    { id: 4, title: 'Whitening & polish', category: 'Cosmetic', image: 'https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?q=80&w=800&auto=format&fit=crop', link: '/treatments/teeth-whitening' },
];

export default function RecentCasesGallery() {
    const [hoveredIndex, setHoveredIndex] = useState<number>(0);
    return (
        <section className="py-10 sm:py-12 bg-[#fcfcfc] overflow-hidden">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Selected work ]</div>
                        <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] text-[#0a0a0b] leading-none mt-2">Recent cases <span className="font-serif italic font-normal text-neutral-400">— quietly excellent</span></h2>
                    </div>
                    <Link href="/treatments" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:gap-3 transition-all duration-200 ease-out">All treatments <FaArrowRight size={11} /></Link>
                </div>
                <div className="flex flex-col md:flex-row h-auto md:h-[420px] gap-3 w-full">
                    {cases.map((c, i) => {
                        const a = i === hoveredIndex;
                        return <Link href={c.link} key={c.id} onMouseEnter={() => setHoveredIndex(i)} onClick={() => setHoveredIndex(i)} className={`relative rounded-[20px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer border border-black/5 h-[220px] md:h-full ${a ? 'md:flex-[2.6]' : 'md:flex-[0.9] flex-1'}`}><Image src={c.image} alt={c.title} fill className={`object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${a ? 'scale-[1.04]' : 'scale-100'}`} /><div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 ${a ? 'opacity-100' : 'opacity-75'}`} /><div className={`absolute top-4 right-4 w-8 h-8 bg-white rounded-full grid place-items-center text-[#0a0a0b] shadow-sm transition-all duration-300 ${a ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}><FaArrowRight size={11} className="-rotate-45" /></div><div className="absolute bottom-0 left-0 w-full p-5"><div className={`${a ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90 md:opacity-0'} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}><p className="text-white/70 text-[11px] tracking-[0.14em] uppercase font-medium mb-1">{c.category}</p><h3 className="text-white text-[17px] font-semibold tracking-[-0.02em] leading-tight">{c.title}</h3></div></div></Link>;
                    })}
                </div>
                <Link href="/treatments" className="sm:hidden mt-4 inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">All treatments <FaArrowRight size={11} /></Link>
            </div>
        </section>
    );
}
