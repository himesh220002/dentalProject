'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaTrash, FaChevronLeft, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import { parseAppointmentReason } from '@/utils/appointmentUtils';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchBookings = async () => {
        const storedIds = JSON.parse(localStorage.getItem('drtooth_guest_bookings') || '[]');
        if (storedIds.length === 0) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.post(`${backendUrl}/api/appointments/bulk-retrieve`, { ids: storedIds });
            setBookings(res.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load your bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id: string, date: string, time: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setActionLoading(id);
        setError(null);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            await axios.delete(`${backendUrl}/api/appointments/${id}`);

            // Success: Remove from local state and localStorage if it was a hard delete
            setBookings(prev => prev.filter(b => b._id !== id));
            const storedIds = JSON.parse(localStorage.getItem('drtooth_guest_bookings') || '[]');
            const updatedIds = storedIds.filter((sid: string) => sid !== id);
            localStorage.setItem('drtooth_guest_bookings', JSON.stringify(updatedIds));

            alert('Appointment cancelled successfully.');
        } catch (err: any) {
            console.error('Error cancelling appointment:', err);
            setError(err.response?.data?.message || 'Failed to cancel appointment.');
        } finally {
            setActionLoading(null);
        }
    };

    const isCancellable = (date: string, time: string) => {
        const aptDateTime = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        aptDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const diffInMs = aptDateTime.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return diffInHours >= 3;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                        <FaChevronLeft size={14} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
                        <p className="text-sm font-bold text-slate-400">Manage your guest appointments recorded on this browser</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                        <FaExclamationTriangle className="shrink-0" />
                        <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((apt) => {
                            const { treatmentName } = parseAppointmentReason(apt.reason);
                            const canCancel = isCancellable(apt.date, apt.time) && apt.status !== 'Cancelled';

                            return (
                                <div key={apt._id} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group transition-all hover:border-blue-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] flex flex-col items-center justify-center font-black ${apt.status === 'Cancelled' ? 'bg-slate-50 text-slate-300' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                <span className="text-[10px] uppercase leading-none mb-1">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                <span className="text-xl leading-none">{new Date(apt.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{treatmentName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                            apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' :
                                                                'bg-blue-600 text-white'
                                                        }`}>
                                                        {apt.status || 'Scheduled'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                        <FaClock size={10} />
                                                        {apt.time}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                                        ID: {apt._id.slice(-8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            {canCancel ? (
                                                <button
                                                    onClick={() => handleCancel(apt._id, apt.date, apt.time)}
                                                    disabled={actionLoading === apt._id}
                                                    className="w-full sm:w-auto px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading === apt._id ? (
                                                        <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FaTrash size={12} />
                                                    )}
                                                    Cancel Appt
                                                </button>
                                            ) : apt.status !== 'Cancelled' && (
                                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400 font-bold max-w-[200px] text-right">
                                                    <FaInfoCircle size={14} className="shrink-0 text-slate-300" />
                                                    Cancellation disabled (Less than 3 hours remaining)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <FaCalendarAlt size={32} className="text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">No Bookings Found</h2>
                        <p className="text-slate-400 font-bold mb-8 max-w-sm mx-auto">
                            Any appointments you book on this browser as a guest will appear here for management.
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                            Book Your First Appointment
                        </Link>
                    </div>
                )}

                <div className="mt-12 text-center p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Pro Tip: Clinical History</p>
                    <p className="text-xs text-blue-900/60 font-bold leading-relaxed max-w-md mx-auto">
                        Logged-in users can also see their full treatment records, prescriptions, and digital X-rays in their <Link href="/profile" className="text-blue-600 underline">Profile Portal</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
