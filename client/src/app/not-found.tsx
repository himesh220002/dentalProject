import Link from 'next/link';
import { FaHome, FaSearch, FaTooth } from 'react-icons/fa';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] px-6 pt-32 pb-24 z-50 relative">
            <div className="max-w-2xl w-full text-center space-y-8 flex-grow">
                {/* 404 Graphic */}
                <div className="relative inline-block mb-4">
                    <div className="text-[12rem] font-serif font-black text-gray-100 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center border-8 border-white shadow-xl transform rotate-12">
                            <FaTooth size={56} />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                        Oops! This page seems to have a cavity.
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to a healthy smile!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link 
                        href="/"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        <FaHome />
                        Back to Home
                    </Link>
                    <Link 
                        href="/contact"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-gray-900 px-8 py-4 rounded-full font-bold shadow-md border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        <FaSearch className="text-gray-400" />
                        Find Treatment
                    </Link>
                </div>
            </div>
        </div>
    );
}
