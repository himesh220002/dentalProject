'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FaCalendarPlus, FaClock, FaUser, FaCheckCircle, FaTrash, FaNotesMedical, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import QuickScheduler from '@/components/QuickScheduler';
import MobileAppointmentCard from '@/components/dashboard/MobileAppointmentCard';
import { parseDateTime } from '@/utils/dateUtils';

interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
    };
    date: string;
    time: string;
    reason: string;
    status: string;
    isTicked?: boolean;
    amount?: number;
    paymentStatus?: string;
    markedPaidAt?: string;
}

function DashboardSchedulesContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams?.get('highlight');
    const highlightedRef = useRef<HTMLTableRowElement | HTMLDivElement | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | undefined>(undefined);

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
        if (apt.paymentStatus === 'Paid' && apt.markedPaidAt) {
            const paidTime = new Date(apt.markedPaidAt).getTime();
            const now = new Date().getTime();
            const fiveMinutes = 5 * 60 * 1000;
            return (now - paidTime) < fiveMinutes;
        }
        return true;
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
        setEditingAppointmentId(id);
        setIsSchedulerOpen(true);
    };

    const handleCloseScheduler = () => {
        setIsSchedulerOpen(false);
        setEditingAppointmentId(undefined);
    };

    const isPastTime = (appDate: string, appTime: string) => {
        return new Date() > parseDateTime(appDate, appTime);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-3xl font-black text-gray-900">Appointment Schedules</h1>
                <button
                    onClick={() => setIsSchedulerOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-xs text-white px-4 sm:px-8 py-2 sm:py-3 rounded-2xl font-black shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                    <FaCalendarPlus /> Add Appointment
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto hidden 2xl:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rx</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Time & Date</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reason</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAppointments.map((apt) => {
                                const expired = isPastTime(apt.date, apt.time);
                                const isReadyForPayment = (apt.status === 'Completed' || apt.isTicked) && apt.paymentStatus !== 'Paid';

                                return (
                                    <tr
                                        key={apt._id}
                                        id={`apt-${apt._id}`}
                                        className={`transition-colors ${apt._id === highlightId ? 'bg-blue-50/80' : 'hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <Link
                                                href={`/patients/${apt.patientId?._id}`}
                                                className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100"
                                                title="View Clinical History / Add Prescription"
                                            >
                                                <FaNotesMedical size={18} />
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${expired ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                                    <FaClock />
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900">{apt.time}</div>
                                                    <div className="text-xs font-bold text-gray-400">{new Date(apt.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <FaUser size={12} />
                                                </div>
                                                <Link
                                                    href={`/patients/${apt.patientId?._id}`}
                                                    className="font-bold text-gray-800 hover:text-blue-600 hover:underline transition-all"
                                                >
                                                    {apt.patientId?.name || 'N/A'}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-gray-600 max-w-xs truncate">{apt.reason}</div>
                                            {apt.amount && <div className="text-[10px] font-black text-blue-600 mt-0.5">₹{apt.amount}</div>}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="relative group w-36">
                                                <select
                                                    value={apt.paymentStatus}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const updates: any = { paymentStatus: val };
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
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="relative group w-32">
                                                {(() => {
                                                    const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
                                                    return (
                                                        <>
                                                            <select
                                                                value={displayStatus}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const updates: any = {
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
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex gap-2">
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
                <div className="2xl:hidden p-4 space-y-4">
                    {filteredAppointments.map((apt) => (
                        <MobileAppointmentCard
                            key={apt._id}
                            apt={apt}
                            isPastTime={isPastTime}
                            updateAppointment={updateAppointment}
                            handleReschedule={handleReschedule}
                            deleteAppointment={deleteAppointment}
                            isHighlighted={apt._id === highlightId}
                        />
                    ))}
                </div>

                {filteredAppointments.length === 0 && (
                    <div className="text-center py-20 text-gray-400 italic font-medium">
                        No appointments found.
                    </div>
                )}
            </div>

            <QuickScheduler
                isOpen={isSchedulerOpen}
                onClose={handleCloseScheduler}
                onSuccess={fetchAppointments}
                appointmentId={editingAppointmentId}
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
