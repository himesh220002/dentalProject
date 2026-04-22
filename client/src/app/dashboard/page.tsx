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
    type PatientLite = { _id: string; name?: string };
    type ContactLite = { _id: string; name: string; status?: string; createdAt: string };
    type AppointmentLite = {
        _id: string;
        patientId?: PatientLite | string | null;
        date: string;
        time: string;
        reason: string;
        status: string;
        isTicked?: boolean;
        isDeleted?: boolean;
        createdAt: string;
        completedAt?: string;
    };
    type TreatmentLite = { _id: string; name: string; price?: string };
    type FinancialStats = { todayCollection: number };

    type ActivityItem =
        | (AppointmentLite & { type: 'appointment'; timeStamp: Date })
        | (ContactLite & { type: 'message'; timeStamp: Date });

    const [stats, setStats] = useState({
        patients: 0,
        messages: 0,
        todayApts: 0,
        tomorrowApts: 0,
        upcomingApts: 0,
        treatments: 0,
        todayCollection: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [queue, setQueue] = useState<AppointmentLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(true);

    // Raw data for insights
    const [rawData, setRawData] = useState<{
        patients: PatientLite[];
        appointments: AppointmentLite[];
        messages: ContactLite[];
        treatments: TreatmentLite[];
    }>({
        patients: [],
        appointments: [],
        messages: [],
        treatments: []
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const todayTime = now.getTime();

            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowTime = tomorrow.getTime();

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

            setRawData({
                patients: allPatients,
                appointments: allAppts,
                messages: allMessages,
                treatments: treatmentsRes.data as TreatmentLite[]
            });

            const todayAppointments = allAppts.filter((a) => {
                const d = new Date(a.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === todayTime;
            });

            const tomorrowAppointments = allAppts.filter((a) => {
                const d = new Date(a.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === tomorrowTime;
            });

            const upcomingAppointments = allAppts.filter((a) => {
                const d = new Date(a.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() > tomorrowTime;
            });

            const todayRemaining = todayAppointments.filter((a) =>
                !a.isTicked && !a.isDeleted && a.status !== 'Completed' && a.status !== 'Cancelled'
            );

            setStats({
                patients: allPatients.length,
                messages: allMessages.filter((m) => m.status === 'Unread').length,
                todayApts: todayRemaining.length,
                tomorrowApts: tomorrowAppointments.length,
                upcomingApts: upcomingAppointments.length,
                treatments: (treatmentsRes.data as TreatmentLite[]).length,
                todayCollection: financialStats.todayCollection
            });

            // Calculate Recent Activity (merge appointments and messages)
            const combinedActivity = [
                ...allAppts.map((a) => ({
                    ...a,
                    type: 'appointment',
                    timeStamp: (a.status === 'Completed' && a.completedAt) ? new Date(a.completedAt) : new Date(a.createdAt)
                })),
                ...allMessages.map((m) => ({ ...m, type: 'message', timeStamp: new Date(m.createdAt) }))
            ].sort((a, b) => b.timeStamp.getTime() - a.timeStamp.getTime()).slice(0, 5) as ActivityItem[];
            setRecentActivity(combinedActivity);

            // Calculate Queue Status (today's unticked appointments)
            const untickedQueue = todayAppointments
                .filter((a) => !a.isTicked && !a.isDeleted)
                .sort((a, b) => a.time.localeCompare(b.time));
            setQueue(untickedQueue);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl);

        const handleRealTimeUpdate = () => {
            console.log('Real-time update received, refreshing dashboard...');
            fetchDashboardData();
        };

        socket.on('newAppointment', handleRealTimeUpdate);
        socket.on('updateAppointment', handleRealTimeUpdate);
        socket.on('deleteAppointment', handleRealTimeUpdate);
        socket.on('newContact', handleRealTimeUpdate);
        socket.on('updateContact', handleRealTimeUpdate);
        socket.on('newPatient', handleRealTimeUpdate);
        socket.on('updatePatient', handleRealTimeUpdate);
        socket.on('deletePatient', handleRealTimeUpdate);

        return () => {
            socket.off('newAppointment', handleRealTimeUpdate);
            socket.off('updateAppointment', handleRealTimeUpdate);
            socket.off('deleteAppointment', handleRealTimeUpdate);
            socket.off('newContact', handleRealTimeUpdate);
            socket.off('updateContact', handleRealTimeUpdate);
            socket.off('newPatient', handleRealTimeUpdate);
            socket.off('updatePatient', handleRealTimeUpdate);
            socket.off('deletePatient', handleRealTimeUpdate);
            socket.disconnect();
        };
    }, [fetchDashboardData]);

    const statCards = [
        { label: 'Total Patients', value: stats.patients, icon: FaUsers, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'New Messages', value: stats.messages, icon: FaEnvelope, color: 'text-rose-600', bg: 'bg-rose-100' },
        {
            label: "Appointments",
            value: stats.todayApts,
            icon: FaCalendarAlt,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            isAptCard: true
        },
        {
            label: "Customer Insights",
            value: "Insights",
            icon: FaChartLine,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            isInsightsCard: true
        },
    ];

    const renderStatCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                let href = '#';
                if (stat.label === 'Total Patients') href = '/dashboard/patients';
                else if (stat.label === 'New Messages') href = '/dashboard/messages';
                else if (stat.isAptCard) href = '/dashboard/schedules';

                const handleClick = (e: React.MouseEvent) => {
                    if (stat.isInsightsCard) {
                        e.preventDefault();
                        setIsInsightsOpen(true);
                    }
                };

                return (
                    <Link
                        href={href}
                        key={idx}
                        className="block group cursor-pointer"
                        onClick={handleClick}
                    >
                        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition`}>
                                    <Icon className="text-2xl" />
                                </div>
                                {stat.isAptCard ? (
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Today</p>
                                                <p className="text-xl font-black text-gray-900 leading-none">{stats.todayApts}</p>
                                            </div>
                                            <div className="text-center border-x border-gray-100 px-3">
                                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Tmrw</p>
                                                <p className="text-xl font-black text-gray-900 leading-none">{stats.tomorrowApts}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Next</p>
                                                <p className="text-xl font-black text-gray-900 leading-none">{stats.upcomingApts}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                                )}
                            </div>
                            <h3 className="text-slate-600 font-black uppercase tracking-widest text-[10px]">{stat.label}</h3>
                        </div>
                    </Link>
                );
            })}
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl text-center sm:text-left font-black text-slate-900 tracking-tight">Clinic Overview</h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium text-center sm:text-left">
                        Daily operations snapshot: patients, inquiries, queue, and revenue.
                    </p>
                </div>
                <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl px-4 py-2 text-center sm:text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Today&apos;s collection</div>
                    <div className="text-xl font-black text-slate-900">₹{stats.todayCollection}</div>
                </div>
            </div>

            <div className="lg:hidden bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => setIsOverviewCollapsed((prev) => !prev)}
                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Snapshot</p>
                        <p className="text-sm font-bold text-slate-800">Collection, patients, messages, appointments, insights</p>
                    </div>
                    <FaChevronDown className={`text-slate-500 transition-transform ${isOverviewCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                </button>
                {!isOverviewCollapsed && (
                    <div className="p-3 sm:p-4 border-t border-slate-100 space-y-3 sm:space-y-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Today&apos;s collection</div>
                            <div className="text-2xl font-black text-slate-900">₹{stats.todayCollection}</div>
                        </div>
                        {renderStatCards()}
                    </div>
                )}
            </div>

            <div className="hidden lg:block">
                {renderStatCards()}
            </div>

            <CustomerInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                patients={rawData.patients}
                appointments={rawData.appointments}
                messages={rawData.messages}
                treatments={rawData.treatments}
            />

            <WeeklyPlanner />

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
                {/* Recent Activity */}
                <div className="bg-white p-4 sm:p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((act, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.type === 'appointment' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {act.type === 'appointment' ? <FaCalendarAlt /> : <FaEnvelope />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-bold text-gray-800">
                                            {act.type === 'appointment' ? (
                                                <>
                                                    Appt: <Link href={`/patients/${(typeof act.patientId === 'string' ? act.patientId : act.patientId?._id) || ''}`} className="hover:text-blue-600 hover:underline transition-colors">{(typeof act.patientId === 'string' ? 'Patient' : act.patientId?.name) || 'New Patient'}</Link>
                                                </>
                                            ) : (
                                                `Message from ${act.name}`
                                            )}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                            {act.type === 'appointment' ? parseAppointmentReason(act.reason).treatmentName : 'New Inquiry'} • {act.timeStamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 text-center py-10 italic">No recent activity</div>
                        )}
                    </div>
                </div>

                {/* Queue Status */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Today&apos;s Queue
                    </h2>
                    <div className="space-y-4">
                        {queue.length > 0 ? (
                            queue.map((q, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 hover:bg-emerald-50 transition">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border border-emerald-100">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase">#{i + 1}</span>
                                        <span className="text-xs font-black text-emerald-700">{q.time}</span>
                                    </div>
                                    <div>
                                        <Link
                                            href={`/patients/${q.patientId?._id}`}
                                            className="text-sm font-black text-gray-800 hover:text-emerald-600 hover:underline transition-colors"
                                        >
                                            {q.patientId?.name || 'Unknown'}
                                        </Link>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{parseAppointmentReason(q.reason).treatmentName}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-emerald-600 shadow-sm border border-emerald-100 uppercase">Waiting</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-emerald-600/50 bg-emerald-50/50 rounded-3xl text-center py-16 px-10 border-2 border-dashed border-emerald-100">
                                <p className="font-black uppercase tracking-[0.2em] mb-1">Queue Clear</p>
                                <p className="text-xs font-medium">All of today&apos;s appointments are either completed or scheduled for later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

