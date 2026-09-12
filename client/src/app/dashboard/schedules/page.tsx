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
    patientId: { _id: string; name: string; contact?: string; };
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
        const clicked: Record<string, boolean> = {};
        appointments.forEach(apt => { if (localStorage.getItem(`wa_clicked_${apt._id}`)) clicked[apt._id] = true; });
        setWaClicked(clicked);
    }, [appointments]);

    const fetchAppointments = async () => {
        try { const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`); setAppointments(response.data); }
        catch (error) { console.error('Error fetching appointments:', error); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchAppointments(); const interval = setInterval(fetchAppointments, 60000); return () => clearInterval(interval); }, []);
    useEffect(() => {
        if (highlightId && !loading) {
            setTimeout(() => { const element = document.getElementById(`apt-${highlightId}`); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500);
        }
    }, [highlightId, loading]);

    const sortedAppointments = [...appointments].sort((a, b) => parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime());
    const filteredAppointments = sortedAppointments.filter(apt => {
        if (apt.isDeleted) return false;
        if (apt.paymentStatus === 'Paid' && apt.markedPaidAt) {
            const paidTime = new Date(apt.markedPaidAt).getTime(); const now = new Date().getTime(); const fifteenMinutes = 15 * 60 * 1000;
            return (now - paidTime) < fifteenMinutes;
        }
        return true;
    });
    const displayedAppointments = filteredAppointments.filter((apt) => {
        const q = query.trim().toLowerCase();
        const patientName = apt.patientId?.name?.toLowerCase() || '';
        const phone = (apt.patientId?.contact || '').toLowerCase();
        const reason = (parseAppointmentReason(apt.reason).treatmentName || '').toLowerCase();
        const d = new Date(apt.date); d.setHours(0, 0, 0, 0);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
        const inDate = dateFilter === 'all' ? true : dateFilter === 'today' ? d.getTime() === today.getTime() : dateFilter === 'tomorrow' ? d.getTime() === tomorrow.getTime() : (d.getTime() >= today.getTime() && d.getTime() < weekEnd.getTime());
        if (!inDate) return false;
        const expired = isPastTime(apt.date, apt.time);
        const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
        if (statusFilter !== 'all' && displayStatus !== statusFilter) return false;
        const payment = (apt.paymentStatus || 'None') as 'Paid' | 'Pending' | 'None';
        if (paymentFilter !== 'all' && payment !== paymentFilter) return false;
        if (!q) return true;
        const bId = (apt.bookingId || '').toLowerCase();
        return bId.includes(q) || patientName.includes(q) || phone.includes(q) || reason.includes(q) || apt.time.toLowerCase().includes(q);
    });

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        try { await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`, updates); fetchAppointments(); }
        catch (error) { console.error('Error updating appointment:', error); }
    };
    const deleteAppointment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        try { await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`); fetchAppointments(); }
        catch (error) { console.error('Error deleting appointment:', error); alert('Failed to delete appointment.'); }
    };
    const handleReschedule = (id: string) => { setShouldSkipWhatsApp(false); setEditingAppointmentId(id); setIsSchedulerOpen(true); };
    const handleEdit = (id: string) => { setShouldSkipWhatsApp(true); setEditingAppointmentId(id); setIsSchedulerOpen(true); };
    const handleCloseScheduler = () => { setIsSchedulerOpen(false); setEditingAppointmentId(undefined); };
    function isPastTime(appDate: string, appTime: string) { return new Date() > parseDateTime(appDate, appTime); }

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
                <div>
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Schedules ]</div>
                    <h1 className="mt-1 text-[24px] sm:text-[28px] font-semibold tracking-[-0.03em] text-[#0a0a0b]">Schedules</h1>
                    <p className="text-[13px] leading-6 text-neutral-500">Manage today’s queue, payments, and follow-ups.</p>
                </div>
                <button onClick={() => { setShouldSkipWhatsApp(false); setIsSchedulerOpen(true); }} className="inline-flex items-center gap-2 bg-[#0a0a0b] text-white px-5 py-2.5 rounded-full text-[13px] font-medium tracking-[-0.01em] hover:bg-black active:scale-[0.98] transition shadow-sm">
                    <FaCalendarPlus size={12} /> Add Appointment
                </button>
            </div>

            <div className="bg-white rounded-[20px] border border-black/5 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-black/5">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient, phone, treatment, time…" className="w-full pl-9 pr-4 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:w-[720px]">
                            <div className="relative">
                                <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={11} />
                                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="appearance-none w-full pl-9 pr-8 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[12px] font-medium text-[#0a0a0b] cursor-pointer">
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="week">This week</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="relative">
                                <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={11} />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="appearance-none w-full pl-9 pr-8 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[12px] font-medium text-[#0a0a0b] cursor-pointer">
                                    <option value="all">All status</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Delayed">Delayed</option>
                                    <option value="Operating">Operating</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="relative">
                                <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={11} />
                                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)} className="appearance-none w-full pl-9 pr-8 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[12px] font-medium text-[#0a0a0b] cursor-pointer">
                                    <option value="all">All payments</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <div className="h-[42px] rounded-full bg-[#f5f5f3] border border-black/5 px-4 flex items-center justify-between">
                                <span className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Showing</span>
                                <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{displayedAppointments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-black/5">
                        <thead className="bg-[#fcfcfc]">
                            <tr>
                                {['Rx', 'ID', 'Time', 'Date', 'Patient', 'Phone', 'Treatment', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {displayedAppointments.map((apt) => {
                                const expired = isPastTime(apt.date, apt.time);
                                const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
                                return (
                                    <tr key={apt._id} id={`apt-${apt._id}`} className={`hover:bg-[#fcfcfc] transition-colors ${apt._id === highlightId ? 'bg-amber-50/60' : ''}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link href={`/patients/${apt.patientId?._id}`} className="w-8 h-8 rounded-full bg-white border border-black/5 text-neutral-700 grid place-items-center hover:bg-[#0a0a0b] hover:text-white hover:border-black transition-colors"><FaNotesMedical size={12} /></Link>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full bg-white border border-black/5 text-[10px] font-medium tracking-[0.06em] text-neutral-600">{apt.bookingId || 'Legacy'}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium ${expired ? 'bg-white border-black/5 text-neutral-500' : 'bg-white border-black/5 text-[#0a0a0b]'}`}>
                                                <FaClock size={10} className={expired ? 'text-neutral-400' : 'text-neutral-500'} />{apt.time}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-[#0a0a0b]">{new Date(apt.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link href={`/patients/${apt.patientId?._id}`} className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:underline"><span className="w-7 h-7 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-600"><FaUser size={11} /></span>{apt.patientId?.name || 'N/A'}</Link>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-neutral-700">{apt.patientId?.contact || '—'}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate text-[13px] text-neutral-600">{parseAppointmentReason(apt.reason).treatmentName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-[13px] font-semibold text-[#0a0a0b]">{typeof apt.amount === 'number' && apt.amount > 0 ? `₹${apt.amount}` : '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="relative">
                                                <select value={apt.paymentStatus} onChange={(e) => { const val = e.target.value; const updates: Partial<Appointment> = { paymentStatus: val }; if (val === 'Paid') { updates.status = 'Completed'; updates.isTicked = true; } updateAppointment(apt._id, updates); }} className={`appearance-none pl-3 pr-6 py-1.5 rounded-full border text-[11px] font-medium tracking-[-0.01em] cursor-pointer outline-none ${apt.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (apt.status === 'Completed' || apt.isTicked) ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-white text-neutral-600 border-black/10'}`}>
                                                    <option value="None">None</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                </select>
                                                <FaChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="relative">
                                                <select value={displayStatus} onChange={(e) => { const val = e.target.value; const updates: Partial<Appointment> = { status: val, isTicked: val === 'Completed' }; if (val === 'Completed' && apt.paymentStatus === 'None') updates.paymentStatus = 'Pending'; updateAppointment(apt._id, updates); }} className={`appearance-none pl-3 pr-6 py-1.5 rounded-full border text-[11px] font-medium cursor-pointer outline-none ${displayStatus === 'Completed' ? 'bg-[#0a0a0b] text-white border-black' : displayStatus === 'Operating' ? 'bg-blue-50 text-blue-700 border-blue-100' : displayStatus === 'Delayed' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-white text-neutral-600 border-black/10'}`}>
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="Delayed">Delayed</option>
                                                    <option value="Operating">Operating</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                                <FaChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${displayStatus === 'Completed' ? 'text-white/60' : 'text-neutral-400'}`} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="inline-flex gap-1.5">
                                                <button onClick={() => { const clinicName = clinicData?.clinicName || "ToothOp"; const mapsLink = (clinicData?.address?.latitude && clinicData?.address?.longitude) ? `https://www.google.com/maps/search/?api=1&query=${clinicData.address.latitude},${clinicData.address.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicName + " " + (clinicData?.address?.city || ""))}`; const msg = `*Appointment Reminder* 🦷\n\nDear Patient, this is a friendly reminder for your appointment today at *${clinicName}*.\n\n*Time:* ${apt.time}\n*Location:* ${clinicData?.address?.city || 'Katihar'}, ${clinicData?.address?.state || 'Bihar'}\n*Google Maps:* ${mapsLink}\n\nSee you soon!`; const phone = apt.patientId?.contact || ''; localStorage.setItem(`wa_clicked_${apt._id}`, 'true'); setWaClicked(prev => ({ ...prev, [apt._id]: true })); window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'); }} className={`w-8 h-8 rounded-full grid place-items-center border transition ${new Date(apt.date).toDateString() === new Date().toDateString() && apt.status === 'Scheduled' && !waClicked[apt._id] ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 'bg-white border-black/5 text-emerald-600 hover:bg-emerald-50'}`} title="WhatsApp"><FaWhatsapp size={12} /></button>
                                                <button onClick={() => handleEdit(apt._id)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-neutral-700 grid place-items-center hover:bg-[#f5f5f3] transition" title="Edit"><FaEdit size={11} /></button>
                                                <button onClick={() => handleReschedule(apt._id)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-neutral-700 grid place-items-center hover:bg-[#f5f5f3] transition" title="Reschedule"><FaCalendarPlus size={11} /></button>
                                                <button onClick={() => deleteAppointment(apt._id)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-rose-600 grid place-items-center hover:bg-rose-50 hover:border-rose-100 transition" title="Delete"><FaTrash size={11} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden p-3 space-y-3">
                    {displayedAppointments.map((apt) => (
                        <MobileAppointmentCard key={apt._id} apt={apt} isPastTime={isPastTime} updateAppointment={updateAppointment} handleReschedule={handleReschedule} onEdit={handleEdit} deleteAppointment={deleteAppointment} isHighlighted={apt._id === highlightId} />
                    ))}
                </div>

                {displayedAppointments.length === 0 && <div className="text-center py-12 text-[13px] text-neutral-500">No appointments found.</div>}
            </div>

            <QuickScheduler isOpen={isSchedulerOpen} onClose={handleCloseScheduler} onSuccess={fetchAppointments} appointmentId={editingAppointmentId} skipWhatsApp={shouldSkipWhatsApp} />
        </div>
    );
}

export default function DashboardSchedules() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>}>
            <DashboardSchedulesContent />
        </Suspense>
    );
}
