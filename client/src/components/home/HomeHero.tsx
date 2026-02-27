'use client';

import Link from 'next/link';
import { FaPhoneAlt, FaPlus, FaCheck } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { formatExperience } from '../../utils/urlHelper';
import { translations } from '../../constants/translations';

export default function HomeHero() {
    const { clinicData, language } = useClinic();
    const t = translations[language];

    const phone = clinicData?.phone || '+91 98765 43210';
    const city = clinicData?.address.city || 'Katihar';
    const clinicName = clinicData?.clinicName || 'Dr. Tooth';
    const tagline = clinicData?.tagline || 'Experience gentle, precision dental care with Dr. Tooth.';

    // Clinic operation years
    const currentYear = new Date().getFullYear();
    const estYear = clinicData ? parseInt(clinicData.establishedYear) : 2014;
    const clinicYears = Math.max(0, currentYear - estYear);

    return (
        <section className="relative min-h-[550px] sm:min-h-[600px] lg:h-[750px] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex items-center group mx-2 sm:mx-0">
            {/* Immersive Background */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop"
                    alt={`${clinicName} Clinic`}
                    className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-800/40"></div>

                {/* Decorative Blobs */}
                <div className="absolute top-10 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-[60px] sm:blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-10 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-teal-500/10 rounded-full blur-[40px] sm:blur-[80px]"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 px-6 sm:px-12 md:px-20 w-full py-12 sm:py-20 text-white">
                <div className="max-w-4xl space-y-6 sm:space-y-10">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black tracking-[0.1em] sm:tracking-[0.2em] uppercase transition-all hover:bg-white/20">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-ping"></span>
                            {clinicYears}+ Years of Success in {city}
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] sm:leading-[0.95] tracking-tighter">
                            Your Smile, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Our Passion.</span>
                        </h1>

                        <p className="text-base sm:text-xl lg:text-2xl opacity-80 font-medium max-w-2xl leading-relaxed">
                            {tagline} We combine {formatExperience(clinicData?.clinicExperience)} years of expertise with high-end technology for your comfort.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto bg-white text-blue-900 px-10 py-4 sm:px-12 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95 text-center text-sm sm:text-base"
                        >
                            {t.bookNow}
                        </Link>
                        <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-8 py-4 sm:px-10 sm:py-[1.125rem] rounded-2xl sm:rounded-[2rem] font-bold hover:bg-white/20 transition-all group text-sm sm:text-base"
                        >
                            <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
                                <FaPhoneAlt size={12} className="sm:size-[14px]" />
                            </div>
                            {language === 'hi' ? t.callNow : phone}
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-6 sm:pt-10 flex flex-wrap gap-4 sm:gap-8 opacity-60">
                        <div className="flex items-center gap-2 sm:gap-3 font-black text-[10px] sm:text-sm uppercase tracking-widest">
                            <FaCheck className="text-blue-400" /> {language === 'hi' ? 'पेशेवर' : 'Professional'}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 font-black text-[10px] sm:text-sm uppercase tracking-widest">
                            <FaCheck className="text-blue-400" /> {language === 'hi' ? 'आईएसओ प्रमाणित' : 'ISO Certified'}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 font-black text-[10px] sm:text-sm uppercase tracking-widest">
                            <FaCheck className="text-blue-400" /> {language === 'hi' ? 'सुरक्षित और स्टेरिल' : 'Safe & sterile'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating UI Elements (Desktop Only) */}
            <div className="hidden lg:block absolute right-10 xl:right-20 bottom-10 xl:bottom-20 animate-float">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 xl:p-8 rounded-[2.5rem] xl:rounded-[3rem] shadow-2xl space-y-4 max-w-[240px] xl:max-w-[280px]">
                    <div className="flex -space-x-3 xl:-space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl xl:rounded-2xl border-2 xl:border-4 border-white/10 overflow-hidden shadow-lg bg-blue-900 flex items-center justify-center font-black text-xs xl:text-base text-white">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl xl:rounded-2xl bg-blue-600 border-2 xl:border-4 border-white/10 flex items-center justify-center shadow-lg">
                            <FaPlus className="text-white text-xs xl:text-base" />
                        </div>
                    </div>
                    <p className="text-[12px] xl:text-sm font-bold text-blue-100 italic">Join 15,000+ happy patients who trust our expertise.</p>
                </div>
            </div>
        </section>
    );
}
