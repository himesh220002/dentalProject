'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

const cases = [
    {
        id: 1,
        title: 'Enhancing Patient Dental Care',
        category: 'Routine Check-up',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
        link: '/treatments/general-dentistry'
    },
    {
        id: 2,
        title: 'Perfecting Smiles with Invisible Aligners',
        category: 'Orthodontics',
        image: 'https://images.unsplash.com/photo-1609840113322-a70583f106eb?q=80&w=800&auto=format&fit=crop',
        link: '/treatments/orthodontics'
    },
    {
        id: 3,
        title: 'Painless Implant Procedures',
        category: 'Dental Implants',
        image: 'https://images.unsplash.com/photo-1667133295315-820bb6481730?q=80&w=800&auto=format&fit=crop',
        link: '/treatments/dental-implants'
    },
    {
        id: 4,
        title: 'Advanced Teeth Whitening',
        category: 'Cosmetic Dentistry',
        image: 'https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?q=80&w=800&auto=format&fit=crop',
        link: '/treatments/teeth-whitening'
    }
];

export default function RecentCasesGallery() {
    const [hoveredIndex, setHoveredIndex] = useState<number>(0);

    return (
        <section className="py-10 bg-[#fcfcfc] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm mb-4">
                        <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Know About Us</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 tracking-tight">
                        Explore Our Recent Cases
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row h-[500px] gap-2 md:gap-4 w-full">
                    {cases.map((caseItem, index) => {
                        const isActive = index === hoveredIndex;

                        return (
                            <Link
                                href={caseItem.link}
                                key={caseItem.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                className={`block relative h-full rounded-2xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer
                                    ${isActive ? 'md:flex-[4] flex-[2]' : 'md:flex-1 flex-1'}
                                `}
                            >
                                <Image
                                    src={caseItem.image}
                                    alt={caseItem.title}
                                    fill
                                    className={`object-cover transition-transform duration-1000 ${isActive ? 'scale-105' : 'scale-100'}`}
                                />

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`} />

                                {/* Icon / Arrow (Top Right) */}
                                <div className={`absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-blue-600 transition-all duration-500 transform ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                    <FaArrowRight className="-rotate-45" />
                                </div>

                                {/* Content (Bottom) */}
                                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end">
                                    <div className={`transition-all duration-500 ease-out min-w-[280px] sm:min-w-[320px] ${isActive ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0 delay-0 duration-200'}`}>
                                        <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-2">{caseItem.category}</p>
                                        <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                                            {caseItem.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
