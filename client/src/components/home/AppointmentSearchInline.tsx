'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaCalendarAlt, FaPhone, FaUser, FaChevronRight, FaTimes, FaMagic } from 'react-icons/fa';
import Link from 'next/link';

export default function AppointmentSearchInline() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<any[] | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim().length < 4) return;

        setLoading(true);
        setError(null);
        setAppointments(null);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.post(`${backendUrl}/api/appointments/public-check`, {
                searchTerm: searchTerm.trim()
            });
            setAppointments(res.data);
        } catch (err: any) {
            console.error('Error checking appointment:', err);
            setError(err.response?.data?.message || 'No matching appointments found.');
        } finally {
            setLoading(false);
        }
    };

    const closeResults = () => {
        setAppointments(null);
        setError(null);
    };

    return (
        <div className="w-[400px] relative z-40 group/search">
            {/* Slimmer Search Bar Container */}
            <div className="bg-white/95 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[2.8rem] p-1 border-3 border-gray-500/40">
                <form onSubmit={handleSearch} className="flex items-center gap-1 sm:gap-1.5">

                    {/* Search Input Group */}
                    <div className=" w-full flex-1 group/input">
                        <div className="relative flex items-center h-10 sm:h-11 bg-gray-50/30 md:bg-transparent rounded-xl md:rounded-none">
                            <div className="absolute left-4 text-blue-500/40 group-focus-within/input:text-blue-600 transition-colors">
                                <FaSearch size={12} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Phone Number or Booking ID"
                                className="w-full bg-transparent pl-11 pr-4 h-full font-bold text-gray-900 placeholder:text-gray-300 outline-none text-[11px] sm:text-xs"
                            />

                        </div>
                    </div>

                    {/* Compact Search Button */}
                    <button
                        type="submit"
                        disabled={loading || searchTerm.trim().length < 4}
                        className={`w-auto px-4 sm:px-8 h-10 sm:h-11 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[2rem] font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group/btn ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-blue-600 hover:shadow-blue-500/20'
                            }`}
                    >
                        {loading ? (
                            <div className="animate-spin w-4 h-4 border-[2px] border-white/20 border-t-white rounded-full" />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                {/* <span className="relative z-10 text-[10px] sm:text-[11px] uppercase tracking-wider">Search Appointment</span> */}
                                <FaSearch className="relative z-10 text-[10px]" />
                            </>
                        )}
                    </button>
                </form>
            </div>


            {/* Floating Results/Error Container */}
            {(appointments || error) && (
                <div className="mt-6 animate-in slide-in-from-top-4 duration-500 origin-top">
                    <div className="relative bg-white/95 backdrop-blur-2xl border border-white shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden">
                        {/* Status Bar */}
                        <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {error ? 'Search Finished - No Results' : 'Clinical Record Found'}
                                </span>
                            </div>
                            <button
                                onClick={closeResults}
                                className="w-8 h-8 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 transition-all flex items-center justify-center shadow-sm"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            {error ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-rose-50/50">
                                        <FaTimes size={20} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">Notice: Data Not Found</h3>
                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed max-w-xs mx-auto">
                                        We couldn't find any upcoming appointments for the details provided.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {appointments?.map((apt: any, idx) => (
                                            <div key={apt._id}
                                                className="group/apt relative bg-white border border-gray-100 hover:border-blue-500/10 hover:bg-blue-50/30 rounded-2xl p-3 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex flex-col items-center justify-center font-black shadow-lg shadow-blue-500/20 group-hover/apt:scale-105 transition-transform">
                                                        <span className="text-[8px] uppercase leading-none mb-1 opacity-70">
                                                            {new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}
                                                        </span>
                                                        <span className="text-base leading-none">{new Date(apt.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 space-y-0.5">
                                                        <h4 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
                                                            {apt.patientName}
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <FaCalendarAlt className="text-blue-500" size={10} />
                                                                {apt.time}
                                                            </span>
                                                            <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded uppercase text-[7px] tracking-widest font-black border border-blue-100">
                                                                {apt.bookingId || 'APT-Legacy'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Footnote */}
                                    <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                                <FaMagic size={14} />
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-400 leading-tight max-w-xs">
                                                To see full history, please link your profile using your <strong>Record ID</strong>.
                                            </p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="px-6 py-2.5 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-500/20 text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm hover:shadow-lg active:scale-95 group/link"
                                        >
                                            Link Profile <FaChevronRight className="inline ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
