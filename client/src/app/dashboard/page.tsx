'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaUsers, FaEnvelope, FaCalendarAlt, FaChartLine, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import { parseAppointmentReason } from '@/utils/appointmentUtils';
import CustomerInsightsModal from '@/components/dashboard/CustomerInsightsModal';
import { io } from 'socket.io-client';

export default function DashboardOverview() {
    type PatientLite = { _id: string; name: string; address: string; createdAt: string };
    type ContactLite = { _id: string; name: string; status?: string; createdAt: string };
    type AppointmentLite = { _id: string; patientId?: PatientLite | string | null; date: string; time: string; reason: string; status: string; isTicked?: boolean; isDeleted?: boolean; createdAt: string; completedAt?: string; };
    type TreatmentLite = { _id: string; name: string; price?: string };
    type FinancialStats = { todayCollection: number };
    type ActivityItem = (AppointmentLite & { type: 'appointment'; timeStamp: Date }) | (ContactLite & { type: 'message'; timeStamp: Date });

    const [stats, setStats] = useState({ patients: 0, messages: 0, todayApts: 0, tomorrowApts: 0, upcomingApts: 0, treatments: 0, todayCollection: 0 });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [queue, setQueue] = useState<AppointmentLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(true);
    const [rawData, setRawData] = useState<{ patients: PatientLite[]; appointments: AppointmentLite[]; messages: ContactLite[]; treatments: TreatmentLite[]; }>({ patients: [], appointments: [], messages: [], treatments: [] });

    const fetchDashboardData = useCallback(async () => {
        try {
            const now = new Date(); now.setHours(0, 0, 0, 0); const todayTime = now.getTime();
            const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); const tomorrowTime = tomorrow.getTime();
            const [patientsRes, messagesRes, appointmentsRes, treatmentsRes, financialRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/stats`)
            ]);
            const allAppts = appointmentsRes.data as AppointmentLite[];
            const allPatients = patientsRes.data as PatientLite[];
            const allMessages = messagesRes.data as ContactLite[];
            const financialStats = financialRes.data as FinancialStats;
            setRawData({ patients: allPatients, appointments: allAppts, messages: allMessages, treatments: treatmentsRes.data as TreatmentLite[] });
            const todayAppointments = allAppts.filter((a) => { const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() === todayTime; });
            const tomorrowAppointments = allAppts.filter((a) => { const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() === tomorrowTime; });
            const upcomingAppointments = allAppts.filter((a) => { const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() > tomorrowTime; });
            const todayRemaining = todayAppointments.filter((a) => !a.isTicked && !a.isDeleted && a.status !== 'Completed' && a.status !== 'Cancelled');
            setStats({ patients: allPatients.length, messages: allMessages.filter((m) => m.status === 'Unread').length, todayApts: todayRemaining.length, tomorrowApts: tomorrowAppointments.length, upcomingApts: upcomingAppointments.length, treatments: (treatmentsRes.data as TreatmentLite[]).length, todayCollection: financialStats.todayCollection });
            const combinedActivity = [...allAppts.map((a) => ({ ...a, type: 'appointment' as const, timeStamp: (a.status === 'Completed' && a.completedAt) ? new Date(a.completedAt) : new Date(a.createdAt) })), ...allMessages.map((m) => ({ ...m, type: 'message' as const, timeStamp: new Date(m.createdAt) }))].sort((a, b) => b.timeStamp.getTime() - a.timeStamp.getTime()).slice(0, 5) as ActivityItem[];
            setRecentActivity(combinedActivity);
            const untickedQueue = todayAppointments.filter((a) => !a.isTicked && !a.isDeleted).sort((a, b) => a.time.localeCompare(b.time));
            setQueue(untickedQueue);
        } catch (error) { console.error('Error fetching dashboard stats:', error); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl);
        const handleRealTimeUpdate = () => { fetchDashboardData(); };
        socket.on('newAppointment', handleRealTimeUpdate); socket.on('updateAppointment', handleRealTimeUpdate); socket.on('deleteAppointment', handleRealTimeUpdate);
        socket.on('newContact', handleRealTimeUpdate); socket.on('updateContact', handleRealTimeUpdate);
        socket.on('newPatient', handleRealTimeUpdate); socket.on('updatePatient', handleRealTimeUpdate); socket.on('deletePatient', handleRealTimeUpdate);
        return () => { socket.off('newAppointment', handleRealTimeUpdate); socket.off('updateAppointment', handleRealTimeUpdate); socket.off('deleteAppointment', handleRealTimeUpdate); socket.off('newContact', handleRealTimeUpdate); socket.off('updateContact', handleRealTimeUpdate); socket.off('newPatient', handleRealTimeUpdate); socket.off('updatePatient', handleRealTimeUpdate); socket.off('deletePatient', handleRealTimeUpdate); socket.disconnect(); };
    }, [fetchDashboardData]);

    const statCards = [
        { label: 'Total Patients', value: stats.patients, icon: FaUsers },
        { label: 'New Messages', value: stats.messages, icon: FaEnvelope },
        { label: "Appointments", value: stats.todayApts, icon: FaCalendarAlt, isAptCard: true },
        { label: "Customer Insights", value: "Insights", icon: FaChartLine, isInsightsCard: true },
    ];

    const renderStatCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                let href = '#';
                if (stat.label === 'Total Patients') href = '/dashboard/patients';
                else if (stat.label === 'New Messages') href = '/dashboard/messages';
                else if ((stat as any).isAptCard) href = '/dashboard/schedules';
                const handleClick = (e: React.MouseEvent) => { if ((stat as any).isInsightsCard) { e.preventDefault(); setIsInsightsOpen(true); } };
                return (
                    <Link href={href} key={idx} onClick={handleClick} className="group block">
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] h-full">
                            <div className="flex items-start justify-between">
                                <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 group-hover:bg-[#0a0a0b] group-hover:text-white group-hover:border-black transition-colors"><Icon size={14} /></span>
                                {(stat as any).isAptCard ? (
                                    <div className="flex gap-3">
                                        <span className="text-center"><span className="block text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Today</span><span className="block text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">{stats.todayApts}</span></span>
                                        <span className="w-px bg-black/5 mx-1" />
                                        <span className="text-center"><span className="block text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Tmrw</span><span className="block text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">{stats.tomorrowApts}</span></span>
                                        <span className="w-px bg-black/5 mx-1" />
                                        <span className="text-center"><span className="block text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Next</span><span className="block text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">{stats.upcomingApts}</span></span>
                                    </div>
                                ) : (
                                    <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#0a0a0b]">{stat.value}</span>
                                )}
                            </div>
                            <h3 className="mt-4 text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">{stat.label}</h3>
                        </div>
                    </Link>
                );
            })}
        </div>
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Overview ]</div>
                    <h1 className="mt-1 text-[24px] sm:text-[28px] font-semibold tracking-[-0.03em] text-[#0a0a0b]">Clinic Overview</h1>
                    <p className="text-[13px] leading-6 text-neutral-500">Daily operations snapshot: patients, inquiries, queue, and revenue.</p>
                </div>
                <div className="hidden sm:flex bg-white border border-black/5 rounded-full px-4 py-2 items-center gap-3">
                    <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Today's collection</span>
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">₹{stats.todayCollection}</span>
                </div>
            </div>

            <div className="sm:hidden bg-white border border-black/5 rounded-[20px] overflow-hidden">
                <button type="button" onClick={() => setIsOverviewCollapsed((p) => !p)} className="w-full px-4 py-3 flex items-center justify-between text-left">
                    <span className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">Daily Snapshot</span>
                    <FaChevronDown className={`text-neutral-400 transition-transform ${isOverviewCollapsed ? '' : 'rotate-180'}`} size={12} />
                </button>
                {!isOverviewCollapsed && <div className="p-4 border-t border-black/5 space-y-4"><div className="bg-[#fcfcfc] border border-black/5 rounded-2xl px-4 py-3 flex justify-between"><span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Today's collection</span><span className="text-[14px] font-semibold text-[#0a0a0b]">₹{stats.todayCollection}</span></div>{renderStatCards()}</div>}
            </div>
            <div className="hidden sm:block">{renderStatCards()}</div>

            <CustomerInsightsModal isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} patients={rawData.patients} appointments={rawData.appointments} messages={rawData.messages} treatments={rawData.treatments} />

            <div className="bg-white rounded-[20px] border border-black/5 p-2">
                <WeeklyPlanner />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-[20px] border border-black/5 p-6">
                    <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0b]" /> Recent Activity</h2>
                    <div className="mt-4 space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 hover:bg-white hover:border-black/10 transition-colors">
                                <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${act.type === 'appointment' ? 'bg-white border border-black/5 text-neutral-700' : 'bg-white border border-black/5 text-neutral-700'}`}><FaCalendarAlt size={12} className={act.type === 'appointment' ? 'text-neutral-700' : 'text-neutral-500'} /></span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] truncate">
                                        {act.type === 'appointment' ? <>Appt: <Link href={`/patients/${(typeof act.patientId === 'object' && act.patientId !== null ? act.patientId._id : act.patientId) || ''}`} className="hover:underline">{(typeof act.patientId === 'object' && act.patientId !== null ? act.patientId.name : 'Patient') || 'New Patient'}</Link></> : `Message from ${act.name}`}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">{act.type === 'appointment' ? parseAppointmentReason(act.reason).treatmentName : 'New Inquiry'} • {act.timeStamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )) : <div className="text-[13px] text-neutral-500 text-center py-8">No recent activity</div>}
                    </div>
                </div>

                <div className="bg-white rounded-[20px] border border-black/5 p-6">
                    <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Today's Queue</h2>
                    <div className="mt-4 space-y-3">
                        {queue.length > 0 ? queue.map((q, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                <span className="w-10 h-12 rounded-xl bg-white border border-emerald-100 grid place-items-center shadow-sm shrink-0">
                                    <span className="text-[10px] tracking-[0.08em] uppercase font-medium text-emerald-600">#{i + 1}</span>
                                    <span className="text-[12px] font-semibold text-[#0a0a0b] leading-none">{q.time}</span>
                                </span>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/patients/${(typeof q.patientId === 'object' && q.patientId !== null ? q.patientId._id : q.patientId) || ''}`} className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:underline truncate block">{(typeof q.patientId === 'object' && q.patientId !== null ? q.patientId.name : 'Unknown') || 'Unknown'}</Link>
                                    <p className="text-[11px] text-emerald-700">{parseAppointmentReason(q.reason).treatmentName}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-white border border-emerald-100 text-[10px] font-medium tracking-[0.06em] uppercase text-emerald-700">Waiting</span>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center">
                                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-emerald-700">Queue Clear</p>
                                <p className="text-[12px] text-neutral-500 mt-1">All of today’s appointments are completed or later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
