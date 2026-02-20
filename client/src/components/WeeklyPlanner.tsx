'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarDay, FaUser, FaClock, FaChevronLeft, FaChevronRight, FaPlus, FaCheckSquare, FaSquare, FaHistory } from 'react-icons/fa';
import { parseDateTime } from '@/utils/dateUtils';
import QuickScheduler from './QuickScheduler';

interface Patient {
    _id: string;
    name: string;
    contact: string;
}

interface Appointment {
    _id: string;
    patientId: Patient;
    date: string;
    time: string;
    reason: string;
    status: string;
    isTicked?: boolean;
    amount?: number;
    paymentStatus?: string;
}

export default function WeeklyPlanner() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState({ todayCollection: 0, weekCollection: 0 });
    const [loading, setLoading] = useState(true);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | undefined>(undefined);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today; // Always start from Today
    });

    useEffect(() => {
        // Expand today by default on mobile
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setExpandedDate(today.toISOString());
    }, [currentWeekStart]);

    const fetchData = async () => {
        try {
            const [aptRes, statsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/stats`)
            ]);
            setAppointments(aptRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching planner data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const days = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getWeekDays = (start: Date) => {
        const result = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (date.toDateString() === today.toDateString()) {
                dayName = 'Today';
            }

            result.push({
                name: dayName,
                date: date,
                isToday: date.toDateString() === today.toDateString()
            });
        }
        return result;
    };

    const weekDays = getWeekDays(currentWeekStart);

    const getAppointmentsForDay = (date: Date) => {
        return appointments
            .filter(app => {
                const appDate = new Date(app.date);
                return appDate.toDateString() === date.toDateString();
            })
            .sort((a, b) => {
                return parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime();
            });
    };

    const toggleTick = async (e: React.MouseEvent, app: Appointment) => {
        e.stopPropagation();
        try {
            const newTicked = !app.isTicked;
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${app._id}`, {
                isTicked: newTicked,
                // If ticked, it defaults to Pending for later payment processing
                paymentStatus: newTicked ? 'Pending' : 'None'
            });
            fetchData();
        } catch (error) {
            console.error('Error toggling tick:', error);
        }
    };

    const isPastTime = (appDate: string, appTime: string) => {
        const appointmentDate = new Date(appDate);
        const [hours, minutes] = appTime.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        return new Date() > appointmentDate;
    };

    const handleReschedule = (e: React.MouseEvent, app: Appointment) => {
        e.stopPropagation();
        setEditingAppointmentId(app._id);
        setIsSchedulerOpen(true);
    };

    const handleCloseScheduler = () => {
        setIsSchedulerOpen(false);
        setEditingAppointmentId(undefined);
    };

    const changeWeek = (daysToShift: number) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + daysToShift);
        setCurrentWeekStart(newStart);
    };

    if (loading) return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-pulse h-[400px] flex items-center justify-center">
            <div className="text-gray-400 font-bold text-lg">Loading Weekly Planner...</div>
        </div>
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            {/* Header with Collections */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div className="flex justify-between items-center w-full lg:w-auto">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                            <FaCalendarDay className="text-blue-600" />
                            Weekly Planner
                        </h2>
                        <p className="text-[10px] md:text-sm text-gray-500 font-medium tracking-tight">Manage appointments & financial daily targets</p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Collection Stats */}
                    <div className="flex bg-emerald-50 border border-emerald-100 rounded-2xl overflow-hidden shadow-sm w-full sm:w-auto">
                        <div className="px-4 py-2 md:px-5 md:py-3 border-r border-emerald-100 bg-emerald-100/30 flex-grow sm:flex-grow-0">
                            <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Today</span>
                            <span className="text-sm md:text-lg font-black text-emerald-700">₹{stats.todayCollection}</span>
                        </div>
                        <div className="px-4 py-2 md:px-5 md:py-3 flex-grow sm:flex-grow-0">
                            <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">This Week</span>
                            <span className="text-sm md:text-lg font-black text-emerald-700">₹{stats.weekCollection}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <button
                            onClick={() => setIsSchedulerOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2 text-xs md:text-sm"
                        >
                            <FaPlus /> Add
                        </button>

                        <div className="flex items-center bg-gray-50 p-1 rounded-xl md:rounded-2xl border border-gray-100">
                            <button onClick={() => changeWeek(-7)} className="p-2 hover:bg-white hover:shadow-md rounded-lg transition text-gray-600 active:scale-95"><FaChevronLeft size={10} /></button>
                            <div className="px-2 md:px-4 font-bold text-gray-800 text-[10px] md:text-xs min-w-[100px] md:min-w-[140px] text-center">
                                {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <button onClick={() => changeWeek(7)} className="p-2 hover:bg-white hover:shadow-md rounded-lg transition text-gray-600 active:scale-95"><FaChevronRight size={10} /></button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
                {weekDays.map((day) => {
                    const dayAppointments = getAppointmentsForDay(day.date);
                    const isExpanded = expandedDate === day.date.toISOString();
                    return (
                        <div
                            key={day.date.toISOString()}
                            onClick={() => setExpandedDate(isExpanded ? null : day.date.toISOString())}
                            className={`flex flex-col rounded-2xl md:rounded-3xl p-3 md:p-4 transition-all border-2 cursor-pointer md:cursor-default ${day.isToday
                                ? 'bg-blue-50 border-blue-200 ring-2 md:ring-4 ring-blue-50'
                                : 'bg-gray-50 border-transparent hover:border-gray-200'
                                } ${isExpanded ? 'min-h-[220px]' : 'min-h-0 md:min-h-[220px]'}`}
                        >
                            <div className="flex justify-between items-center md:mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${day.isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {day.name}
                                    </span>
                                    {!isExpanded && (
                                        <span className="md:hidden text-[9px] font-bold text-gray-400">
                                            {dayAppointments.length} Appts
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-lg ${day.isToday ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}>
                                    {day.date.getDate()}
                                </span>
                            </div>

                            <div className={`flex flex-col gap-3 flex-grow mt-3 md:mt-0 ${isExpanded ? 'block' : 'hidden md:flex'}`}>
                                {dayAppointments.length > 0 ? (
                                    dayAppointments.slice(0, 4).map((app) => {
                                        const expired = isPastTime(app.date, app.time);
                                        const done = app.isTicked || (app.status === 'Completed');
                                        return (
                                            <div
                                                key={app._id}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`p-3 rounded-2xl shadow-sm border transition-all ${done ? 'bg-gray-100/50 grayscale opacity-60 border-transparent' : 'bg-white border-gray-100 hover:shadow-md hover:border-blue-200 border-l-4 border-l-blue-500'
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg uppercase tracking-tight shrink-0">
                                                            {app.time}
                                                        </span>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={(e) => handleReschedule(e, app)}
                                                                className="p-1 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                                                                title="Reschedule"
                                                            >
                                                                <FaHistory size={10} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => toggleTick(e, app)}
                                                                className={`p-1 rounded-md transition ${app.isTicked ? 'text-blue-600' : 'text-gray-300 hover:text-blue-400'}`}
                                                            >
                                                                {app.isTicked ? <FaCheckSquare size={14} /> : <FaSquare size={14} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/patients/${app.patientId?._id}`}
                                                        className={`text-xs font-black truncate hover:text-blue-600 hover:underline transition-all ${done ? 'text-gray-500' : 'text-gray-800'}`}
                                                    >
                                                        {app.patientId?.name || 'Unknown'}
                                                    </Link>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                                                        {app.reason}
                                                    </div>
                                                    {expired && !app.isTicked && (
                                                        <div className="text-[8px] font-black text-red-400 uppercase tracking-tighter mt-1 animate-pulse">
                                                            Time Passed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex-grow flex items-center justify-center py-4 md:py-6">
                                        <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] border-2 border-dashed border-gray-100 px-4 py-8 rounded-2xl w-full text-center">
                                            Free
                                        </div>
                                    </div>
                                )}
                                {dayAppointments.length > 4 && (
                                    <div className="text-[10px] text-center font-black text-gray-400 py-1 bg-gray-50 rounded-xl">
                                        + {dayAppointments.length - 4} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm"></div>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span>Completed</span>
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    Clinic Operational Hours: 10:00 AM - 08:00 PM
                </div>
            </div>

            <QuickScheduler
                isOpen={isSchedulerOpen}
                onClose={handleCloseScheduler}
                onSuccess={fetchData}
                appointmentId={editingAppointmentId}
            />
        </div >
    );
}
