'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';

const carouselData = {
    en: [
        {
            url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
            title: 'Advanced Operatory',
            desc: 'Modern chairs, intraoral scanners & shadowless lighting for precise care.'
        },
        {
            url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=2070&auto=format&fit=crop',
            title: 'Gentle Chair-side Care',
            desc: 'Calm, explain-first approach that keeps you at ease.'
        },
        {
            url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2070&auto=format&fit=crop',
            title: 'Welcoming Reception',
            desc: 'Warm, hygienic lobby with clear check-in and transparent pricing.'
        },
    ],
    hi: [
        {
            url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
            title: 'आधुनिक ऑपरेटरी',
            desc: 'सटीक देखभाल के लिए आधुनिक कुर्सियाँ और 3D इमेजिंग।'
        },
        {
            url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=2070&auto=format&fit=crop',
            title: 'सौम्य देखभाल',
            desc: 'शांत, स्पष्ट दृष्टिकोण जो आपको सहज रखता है।'
        },
        {
            url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2070&auto=format&fit=crop',
            title: 'स्वागत कक्ष',
            desc: 'स्वच्छ, पारदर्शी और आरामदायक प्रवेश क्षेत्र।'
        },
    ]
};

export default function ClinicCarousel() {
    const { language } = useClinic();
    const images = carouselData[language as keyof typeof carouselData] || carouselData.en;
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex((prev: number) => (prev + 1) % images.length), 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const prevSlide = () => setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);

    return (
        <section className="relative group overflow-hidden rounded-[20px] bg-white border border-black/5 h-[380px] sm:h-[440px] lg:h-[520px]">
            {images.map((img, idx) => (
                <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={img.url} alt={`${img.title} - Dental Care at ToothOp Katihar`} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className={`absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto max-w-[520px] bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Inside the clinic — 0{idx + 1}</div>
                        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#0a0a0b] mt-1">{img.title}</h3>
                        <p className="text-[13px] leading-6 text-neutral-600 mt-1">{img.desc}</p>
                    </div>
                </div>
            ))}

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden sm:flex justify-between px-4 pointer-events-none">
                <button onClick={prevSlide} aria-label="Previous" className="pointer-events-auto w-9 h-9 bg-white/90 backdrop-blur-md border border-black/5 text-[#0a0a0b] rounded-full shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 grid place-items-center"><FaChevronLeft size={13} /></button>
                <button onClick={nextSlide} aria-label="Next" className="pointer-events-auto w-9 h-9 bg-white/90 backdrop-blur-md border border-black/5 text-[#0a0a0b] rounded-full shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 grid place-items-center"><FaChevronRight size={13} /></button>
            </div>

            <div className="absolute bottom-4 right-4 sm:right-6 flex gap-1.5">
                {images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentIndex(idx)} aria-label={`Go to slide ${idx + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === currentIndex ? 'w-7 bg-[#0a0a0b]' : 'w-1.5 bg-black/15 hover:bg-black/25'}`} />
                ))}
            </div>
        </section>
    );
}
