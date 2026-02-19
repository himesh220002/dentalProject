'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const images = [
    // {
    //     url: '/carousel/Tooth-exterior.png',
    //     title: 'Tooth Dental Clinic',
    //     desc: 'Advanced dental care in a premium, welcoming environment.'
    // },
    // {
    //     url: '/carousel/Tooth-reception.png',
    //     title: 'Modern Facilities',
    //     desc: 'State-of-the-art infrastructure for peaceful dental treatments.'
    // },

    {
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop',
        title: 'Advanced Equipment',
        desc: 'Latest technology for precise dental care.'
    },
    // {
    //     url: 'https://images.unsplash.com/photo-1606811841689-23dfddceefef?q=80&w=2074&auto=format&fit=crop',
    //     title: 'Professional Care',
    //     desc: 'Expert doctors dedicated to your smile.'
    // },
    // {
    //     url: 'https://images.unsplash.com/photo-1588776814222-2699b951ecbb?q=80&w=2070&auto=format&fit=crop',
    //     title: 'Sterile Environment',
    //     desc: 'Highest standards of hygiene and safety.'
    // },
    {
        url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=2070&auto=format&fit=crop',
        title: 'Gentle Dentistry',
        desc: 'Experience-led treatments for all ages.'
    },
    {
        url: '/carousel/kids-corner.png',
        title: 'Kids Friendly Corner',
        desc: 'Special care and environment for our little patients.'
    },
];

export default function ClinicCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <section className="relative group overflow-hidden rounded-[3rem] shadow-2xl h-[400px] md:h-[600px]">
            {/* Images */}
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Caption */}
                    <div className={`absolute bottom-12 left-8 md:left-16 transition-all duration-700 delay-300 ${idx === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-2">{img.title}</h3>
                        <p className="text-lg md:text-xl text-blue-200 font-medium">{img.desc}</p>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={prevSlide}
                    className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition active:scale-95"
                >
                    <FaChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition active:scale-95"
                >
                    <FaChevronRight size={24} />
                </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-12 right-8 md:right-16 flex gap-3">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-2 ${idx === currentIndex ? 'w-12 bg-blue-500' : 'w-2 bg-white/30'
                            }`}
                    ></button>
                ))}
            </div>
        </section>
    );
}
