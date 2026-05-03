'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FaCalendarPlus, FaClock, FaUser, FaTrash, FaNotesMedical, FaChevronDown, FaWhatsapp, FaEdit, FaSearch, FaFilter } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';
import Link from 'next/link';
import QuickScheduler from '@/components/QuickScheduler';
import MobileAppointmentCard from '@/components/dashboard/MobileAppointmentCard';
import { parseDateTime } from '@/utils/dateUtils';
import { parseAppointmentReason } from '@/utils/appointmentUtils';

interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        contact?: string;
    };
    date: string;
    time: string;
    reason: string;
    status: string;
    isTicked?: boolean;
    amount?: number;
    paymentStatus?: string;
    markedPaidAt?: string;
    isDeleted?: boolean;
    bookingId?: string;
}

function DashboardSchedulesContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams?.get('highlight');
    const { clinicData } = useClinic();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | undefined>(undefined);
    const [shouldSkipWhatsApp, setShouldSkipWhatsApp] = useState(false);
    const [waClicked, setWaClicked] = useState<Record<string, boolean>>({});
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'Operating' | 'Completed' | 'Delayed'>('all');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'Paid' | 'Pending' | 'None'>('all');
    const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('week');

    useEffect(() => {
        // Load clicked states from localStorage
        const clicked: Record<string, boolean> = {};
        appointments.forEach(apt => {
            if (localStorage.getItem(`wa_clicked_${apt._id}`)) {
                clicked[apt._id] = true;
            }
        });
        setWaClicked(clicked);
    }, [appointments]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightId && !loading) {
            // Give a tiny delay for component rendering/expansion
            setTimeout(() => {
                const element = document.getElementById(`apt-${highlightId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, [highlightId, loading]);

    const sortedAppointments = [...appointments].sort((a, b) => {
        return parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime();
    });

    const filteredAppointments = sortedAppointments.filter(apt => {
        if (apt.isDeleted) return false;
        if (apt.paymentStatus === 'Paid' && apt.markedPaidAt) {
            const paidTime = new Date(apt.markedPaidAt).getTime();
            const now = new Date().getTime();
            const fifteenMinutes = 15 * 60 * 1000;
            return (now - paidTime) < fifteenMinutes;
        }
        return true;
    });

    const displayedAppointments = filteredAppointments.filter((apt) => {
        const q = query.trim().toLowerCase();
        const patientName = apt.patientId?.name?.toLowerCase() || '';
        const phone = (apt.patientId?.contact || '').toLowerCase();
        const reason = (parseAppointmentReason(apt.reason).treatmentName || '').toLowerCase();

        // Date filter
        const d = new Date(apt.date);
        d.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);

        const inDate =
            dateFilter === 'all' ? true :
                dateFilter === 'today' ? d.getTime() === today.getTime() :
                    dateFilter === 'tomorrow' ? d.getTime() === tomorrow.getTime() :
                        (d.getTime() >= today.getTime() && d.getTime() < weekEnd.getTime());

        if (!inDate) return false;

        // Status filter (Delayed is derived)
        const expired = isPastTime(apt.date, apt.time);
        const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
        if (statusFilter !== 'all' && displayStatus !== statusFilter) return false;

        // Payment filter
        const payment = (apt.paymentStatus || 'None') as 'Paid' | 'Pending' | 'None';
        if (paymentFilter !== 'all' && payment !== paymentFilter) return false;

        // Search
        if (!q) return true;
        const bId = (apt.bookingId || '').toLowerCase();
        return bId.includes(q) || patientName.includes(q) || phone.includes(q) || reason.includes(q) || apt.time.toLowerCase().includes(q);
    });

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`, updates);
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

    const deleteAppointment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`);
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete appointment.');
        }
    };

    const handleReschedule = (id: string) => {
        setShouldSkipWhatsApp(false);
        setEditingAppointmentId(id);
        setIsSchedulerOpen(true);
    };

    const handleEdit = (id: string) => {
        setShouldSkipWhatsApp(true);
        setEditingAppointmentId(id);
        setIsSchedulerOpen(true);
    };

    const handleCloseScheduler = () => {
        setIsSchedulerOpen(false);
        setEditingAppointmentId(undefined);
    };

    function isPastTime(appDate: string, appTime: string) {
        return new Date() > parseDateTime(appDate, appTime);
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Schedules</h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Manage today’s queue, payments, and follow-ups.</p>
                </div>
                <button
                    onClick={() => {
                        setShouldSkipWhatsApp(false);
                        setIsSchedulerOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm text-white px-5 sm:px-8 py-3 rounded-2xl font-black shadow-lg transition active:scale-95 flex items-center gap-2 w-fit"
                >
                    <FaCalendarPlus /> Add Appointment
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200">
                {/* Filters */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search patient, phone, treatment, time…"
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 font-semibold text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-[720px]">
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as 'today' | 'tomorrow' | 'week' | 'all')}
                                    className="appearance-none w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="week">This week</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Scheduled' | 'Operating' | 'Completed' | 'Delayed')}
                                    className="appearance-none w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="all">All status</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Delayed">Delayed</option>
                                    <option value="Operating">Operating</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'Paid' | 'Pending' | 'None')}
                                    className="appearance-none w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="all">All payments</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Showing</div>
                                <div className="text-sm font-black text-slate-900">{displayedAppointments.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop table (md+) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-7xl w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Rx</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Treatment</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedAppointments.map((apt) => {
                                const expired = isPastTime(apt.date, apt.time);
                                const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;

                                return (
                                    <tr
                                        key={apt._id}
                                        id={`apt-${apt._id}`}
                                        className={`transition-colors ${apt._id === highlightId ? 'bg-blue-50/80' : 'hover:bg-blue-50/30'}`}
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <Link
                                                href={`/patients/${apt.patientId?._id}`}
                                                className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100"
                                                title="View Clinical History / Add Prescription"
                                            >
                                                <FaNotesMedical size={18} />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Ref ID</span>
                                                <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 inline-block uppercase tracking-tighter">
                                                    {apt.bookingId || 'Legacy'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${expired ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                                    <FaClock />
                                                </div>
                                                <div className="font-black text-slate-900">{apt.time}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">
                                                {new Date(apt.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <FaUser size={12} />
                                                </div>
                                                <Link
                                                    href={`/patients/${apt.patientId?._id}`}
                                                    className="font-black text-slate-900 hover:text-blue-700 hover:underline transition-all"
                                                >
                                                    {apt.patientId?.name || 'N/A'}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900 tracking-wide">
                                                {apt.patientId?.contact || '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-semibold text-slate-700 max-w-[260px] truncate">
                                                {parseAppointmentReason(apt.reason).treatmentName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">
                                                {typeof apt.amount === 'number' && apt.amount > 0 ? `₹${apt.amount}` : '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="relative group w-36">
                                                <select
                                                    value={apt.paymentStatus}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const updates: Partial<Appointment> = { paymentStatus: val };
                                                        if (val === 'Paid') {
                                                            updates.status = 'Completed';
                                                            updates.isTicked = true;
                                                        }
                                                        updateAppointment(apt._id, updates);
                                                    }}
                                                    className={`appearance-none w-full px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${apt.paymentStatus === 'Paid'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : (apt.status === 'Completed' || apt.isTicked)
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
                                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                                        }`}
                                                >
                                                    <option value="None">Payment: None</option>
                                                    <option value="Pending">Payment Pending</option>
                                                    <option value="Paid">Paid</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-400">
                                                    <FaChevronDown />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="relative group w-32">
                                                {(() => {
                                                    return (
                                                        <>
                                                            <select
                                                                value={displayStatus}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const updates: Partial<Appointment> = {
                                                                        status: val,
                                                                        isTicked: val === 'Completed'
                                                                    };
                                                                    // Auto-set payment to Pending if marked Completed
                                                                    if (val === 'Completed' && apt.paymentStatus === 'None') {
                                                                        updates.paymentStatus = 'Pending';
                                                                    }
                                                                    updateAppointment(apt._id, updates);
                                                                }}
                                                                className={`appearance-none w-full px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${displayStatus === 'Completed'
                                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                                    : displayStatus === 'Operating'
                                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                                        : displayStatus === 'Delayed'
                                                                            ? 'bg-amber-500 text-white border-amber-600'
                                                                            : 'bg-white text-gray-500 border-gray-200'
                                                                    }`}
                                                            >
                                                                <option value="Scheduled">Scheduled</option>
                                                                <option value="Delayed">Passed</option>
                                                                <option value="Operating">Operating</option>
                                                                <option value="Completed">Done</option>
                                                            </select>
                                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] ${['Completed', 'Operating', 'Delayed'].includes(displayStatus) ? 'text-white' : 'text-gray-400'}`}>
                                                                <FaChevronDown />
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <div className="inline-flex gap-2">
                                                {/* WhatsApp Reminder Button */}
                                                <button
                                                    onClick={() => {
                                                        const clinicName = clinicData?.clinicName || "Dr. Tooth Dental";
                                                        const mapsLink = (clinicData?.address?.latitude && clinicData?.address?.longitude)
                                                            ? `https://www.google.com/maps/search/?api=1&query=${clinicData.address.latitude},${clinicData.address.longitude}`
                                                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicName + " " + (clinicData?.address?.city || ""))}`;

                                                        const msg = `*Appointment Reminder* 🦷\n\nDear Patient, this is a friendly reminder for your appointment today at *${clinicName}*.\n\n*Time:* ${apt.time}\n*Location:* ${clinicData?.address?.city || 'Katihar'}, ${clinicData?.address?.state || 'Bihar'}\n*Google Maps:* ${mapsLink}\n\nSee you soon!`;
                                                        const phone = apt.patientId?.contact || '';

                                                        // Mark as clicked
                                                        localStorage.setItem(`wa_clicked_${apt._id}`, 'true');
                                                        setWaClicked(prev => ({ ...prev, [apt._id]: true }));

                                                        window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                                    }}
                                                    className={`p-2.5 rounded-xl transition active:scale-95 ${new Date(apt.date).toDateString() === new Date().toDateString() && apt.status === 'Scheduled' && !waClicked[apt._id]
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200 animate-blink-green'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    title="Send WhatsApp Reminder"
                                                >
                                                    <FaWhatsapp />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(apt._id)}
                                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition active:scale-95"
                                                    title="Edit (No WhatsApp)"
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    onClick={() => handleReschedule(apt._id)}
                                                    className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition active:scale-95"
                                                    title="Reschedule"
                                                >
                                                    <FaCalendarPlus />
                                                </button>
                                                <button
                                                    onClick={() => deleteAppointment(apt._id)}
                                                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition active:scale-95"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden p-4 space-y-4">
                    {displayedAppointments.map((apt) => (
                        <MobileAppointmentCard
                            key={apt._id}
                            apt={apt}
                            isPastTime={isPastTime}
                            updateAppointment={updateAppointment}
                            handleReschedule={handleReschedule}
                            onEdit={handleEdit}
                            deleteAppointment={deleteAppointment}
                            isHighlighted={apt._id === highlightId}
                        />
                    ))}
                </div>

                {displayedAppointments.length === 0 && (
                    <div className="text-center py-20 text-slate-500 italic font-semibold">
                        No appointments found.
                    </div>
                )}
            </div>

            <QuickScheduler
                isOpen={isSchedulerOpen}
                onClose={handleCloseScheduler}
                onSuccess={fetchAppointments}
                appointmentId={editingAppointmentId}
                skipWhatsApp={shouldSkipWhatsApp}
            />
        </div>
    );
}

export default function DashboardSchedules() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <DashboardSchedulesContent />
        </Suspense>
    );
}
