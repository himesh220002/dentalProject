'use client';

import { FaLanguage } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useClinic();

    return (
        <div className="hidden lg:block fixed bottom-8 right-8 z-[100]">
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-[1.5rem] font-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-blue-50 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 group overflow-hidden relative"
                aria-label="Toggle Language"
            >
                <div className="absolute inset-0 bg-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                <div className="relative flex items-center gap-3">
                    <FaLanguage className={`text-2xl transition-transform duration-500 group-hover:rotate-[360deg] ${language === 'hi' ? 'text-blue-600 group-hover:text-white' : 'text-blue-500 group-hover:text-white'}`} />
                    <span className="text-sm tracking-widest uppercase flex items-center gap-2">
                        <span className={language === 'en' ? 'font-black' : 'font-medium opacity-50'}>EN</span>
                        <span className="opacity-20">|</span>
                        <span className={language === 'hi' ? 'font-black' : 'font-medium opacity-50 font-serif'}>हि</span>
                    </span>
                </div>
            </button>
        </div>
    );
}
