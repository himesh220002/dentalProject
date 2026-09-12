'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaCalendarAlt, FaTimes, FaMagic, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

export default function AppointmentSearchInline() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<any[] | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchTerm.trim().length < 4) return;
        setLoading(true); setError(null); setAppointments(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.post(`${backendUrl}/api/appointments/public-check`, { searchTerm: searchTerm.trim() });
            setAppointments(res.data);
        } catch (err: any) { setError(err.response?.data?.message || 'No matching appointments found.'); }
        finally { setLoading(false); }
    };

    const closeResults = () => { setAppointments(null); setError(null); };

    return (
        <div className="w-full relative">
            <form onSubmit={handleSearch} className="bg-[#f5f5f3] rounded-full p-1.5 border border-black/5 flex items-center gap-1.5 focus-within:border-black/10 focus-within:bg-[#f5f5f3] transition-colors duration-200">
                <div className="flex-1 relative flex items-center">
                    <FaSearch size={11} className="absolute left-4 text-neutral-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Phone number or booking ID"
                        className="w-full bg-white rounded-full pl-9 pr-4 h-10 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 outline-none border border-black/5 focus:border-black/10 focus:bg-white transition-all duration-200"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || searchTerm.trim().length < 4}
                    className="shrink-0 w-10 h-10 rounded-full bg-[#0a0a0b] text-white grid place-items-center hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 ease-out"
                    aria-label="Search appointment"
                >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSearch size={12} />}
                </button>
            </form>
            

            {(appointments || error) && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="bg-white border border-black/5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden">
                        <div className="px-4 sm:px-5 py-3 bg-[#fcfcfc] border-b border-black/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">{error ? 'No results' : 'Clinical record found'}</span>
                            </div>
                            <button onClick={closeResults} className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-500 hover:text-[#0a0a0b] hover:border-black/10 transition-colors duration-200"><FaTimes size={10} /></button>
                        </div>
                        <div className="p-4">
                            {error ? (
                                <div className="text-center py-6">
                                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-100 grid place-items-center mx-auto mb-3"><FaTimes size={13} /></div>
                                    <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">No appointment found</h3>
                                    <p className="text-[13px] leading-6 text-neutral-500 mt-1 max-w-[280px] mx-auto">We couldn’t find any upcoming appointments for those details.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-auto pr-1">
                                        {appointments?.map((apt: any) => (
                                            <div key={apt._id} className="flex items-center gap-3 p-3 rounded-2xl border border-black/5 bg-[#fcfcfc] hover:bg-white hover:border-black/10 transition-colors duration-200">
                                                <div className="w-11 h-11 bg-[#0a0a0b] text-white rounded-xl grid place-items-center leading-none shrink-0">
                                                    <div className="text-[10px] tracking-[0.12em] uppercase font-medium opacity-70">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</div>
                                                    <div className="text-[14px] font-semibold -mt-0.5">{new Date(apt.date).getDate()}</div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] truncate">{apt.patientName}</div>
                                                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                                        <span className="inline-flex items-center gap-1"><FaCalendarAlt size={10} className="text-neutral-400" />{apt.time}</span>
                                                        <span className="px-1.5 py-0.5 rounded-full bg-white border border-black/5 text-[10px] tracking-[0.08em] uppercase font-medium">{apt.bookingId || 'APT-Legacy'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-[12px] leading-5 text-neutral-500"><span className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-100 grid place-items-center shrink-0"><FaMagic size={11} /></span> Link your profile with Record ID for full history.</div>
                                        <Link href="/profile" className="px-4 py-2 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium tracking-[-0.01em] inline-flex items-center gap-1.5 hover:bg-black active:scale-[0.98] transition-all duration-200">Link profile <FaChevronRight size={10} /></Link>
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
