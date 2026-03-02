'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaEnvelope, FaCalendarAlt, FaTooth } from 'react-icons/fa';
import Link from 'next/link';
import WeeklyPlanner from '@/components/WeeklyPlanner';

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        patients: 0,
        messages: 0,
        todayApts: 0,
        treatments: 0,
        todayCollection: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const [patientsRes, messagesRes, appointmentsRes, treatmentsRes, financialRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/stats`)
                ]);

                const todayAppointments = appointmentsRes.data.filter((a: any) => a.date.split('T')[0] === today);

                setStats({
                    patients: patientsRes.data.length,
                    messages: messagesRes.data.filter((m: any) => m.status === 'Unread').length,
                    todayApts: todayAppointments.length,
                    treatments: treatmentsRes.data.length,
                    todayCollection: financialRes.data.todayCollection
                });

                // Calculate Recent Activity (merge appointments and messages)
                const combinedActivity = [
                    ...appointmentsRes.data.map((a: any) => ({
                        ...a,
                        type: 'appointment',
                        timeStamp: (a.status === 'Completed' && a.completedAt) ? new Date(a.completedAt) : new Date(a.createdAt)
                    })),
                    ...messagesRes.data.map((m: any) => ({ ...m, type: 'message', timeStamp: new Date(m.createdAt) }))
                ].sort((a, b) => b.timeStamp - a.timeStamp).slice(0, 5);
                setRecentActivity(combinedActivity);

                // Calculate Queue Status (today's unticked appointments)
                const untickedQueue = todayAppointments
                    .filter((a: any) => !a.isTicked)
                    .sort((a: any, b: any) => a.time.localeCompare(b.time));
                setQueue(untickedQueue);

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Patients', value: stats.patients, icon: FaUsers, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'New Messages', value: stats.messages, icon: FaEnvelope, color: 'text-rose-600', bg: 'bg-rose-100' },
        { label: "Today's Appts", value: stats.todayApts, icon: FaCalendarAlt, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: "Today's Collection", value: `₹${stats.todayCollection}`, icon: FaTooth, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-10">
            <h1 className="text-3xl font-black text-gray-900">Clinic Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    let href = '#';
                    if (stat.label === 'Total Patients') href = '/patients';
                    else if (stat.label === 'New Messages') href = '/dashboard/messages';
                    else if (stat.label === "Today's Appts" || stat.label === "Today's Collection") href = '/dashboard/schedules';

                    return (
                        <Link href={href} key={idx} className="block group cursor-pointer">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition`}>
                                        <Icon className="text-2xl" />
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                                </div>
                                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{stat.label}</h3>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <WeeklyPlanner />

            <div className="grid lg:grid-cols-2 gap-8 mt-8">
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
                                                    Appt: <Link href={`/patients/${act.patientId?._id}`} className="hover:text-blue-600 hover:underline transition-colors">{act.patientId?.name || 'New Patient'}</Link>
                                                </>
                                            ) : (
                                                `Message from ${act.name}`
                                            )}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                            {act.type === 'appointment' ? act.reason : 'New Inquire'} • {new Date(act.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        Today's Queue
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
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{q.reason}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-emerald-600 shadow-sm border border-emerald-100 uppercase">Waiting</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-emerald-600/50 bg-emerald-50/50 rounded-3xl text-center py-16 px-10 border-2 border-dashed border-emerald-100">
                                <p className="font-black uppercase tracking-[0.2em] mb-1">Queue Clear</p>
                                <p className="text-xs font-medium">All of today's appointments are either completed or scheduled for later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

