'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarDay, FaChevronLeft, FaChevronRight, FaPlus, FaCheck } from 'react-icons/fa';
import { parseDateTime } from '@/utils/dateUtils';
import { parseAppointmentReason } from '@/utils/appointmentUtils';
import QuickScheduler from './QuickScheduler';

interface Patient { _id: string; name: string; contact: string; }
interface Appointment { _id: string; patientId: Patient; date: string; time: string; reason: string; status: string; isTicked?: boolean; amount?: number; paymentStatus?: string; }

export default function WeeklyPlanner() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | undefined>(undefined);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });

    useEffect(() => {
        const t = new Date(); t.setHours(0, 0, 0, 0);
        setExpandedDate(t.toISOString());
    }, [currentWeekStart]);

    const fetchData = async () => {
        try {
            const [aptRes] = await Promise.all([axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`)]);
            setAppointments(aptRes.data);
        } catch (error) { console.error('Error fetching planner data:', error); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const getWeekDays = (start: Date) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start); date.setDate(start.getDate() + i);
            const isToday = date.toDateString() === today.toDateString();
            return { name: isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }), date, isToday };
        });
    };
    const weekDays = getWeekDays(currentWeekStart);

    const getAppointmentsForDay = (date: Date) => appointments.filter(app => new Date(app.date).toDateString() === date.toDateString()).sort((a, b) => parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime());

    const toggleTick = async (e: React.MouseEvent, app: Appointment) => {
        e.stopPropagation();
        try { await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${app._id}`, { isTicked: !app.isTicked, paymentStatus: !app.isTicked ? 'Pending' : 'None' }); fetchData(); } catch {}
    };
    const isPastTime = (appDate: string, appTime: string) => { const d = new Date(appDate); const [h, m] = appTime.split(':').map(Number); d.setHours(h, m, 0, 0); return new Date() > d; };
    const handleReschedule = (e: React.MouseEvent, app: Appointment) => { e.stopPropagation(); setEditingAppointmentId(app._id); setIsSchedulerOpen(true); };
    const handleCloseScheduler = () => { setIsSchedulerOpen(false); setEditingAppointmentId(undefined); };
    const changeWeek = (days: number) => { const n = new Date(currentWeekStart); n.setDate(n.getDate() + days); setCurrentWeekStart(n); };

    if (loading) return <div className="bg-white rounded-[20px] border border-black/5 p-8 flex items-center justify-center"><div className="w-6 h-6 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    return (
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm overflow-hidden">
            {/* Header — only essentials */}
            <div className="px-5 sm:px-6 py-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaCalendarDay size={11} /></span> Weekly Planner</h2>
                    <p className="text-[12px] text-neutral-500 mt-1">Tap a day to see appointments · Only what you need</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#fcfcfc] border border-black/5 rounded-full p-1">
                        <button onClick={() => changeWeek(-7)} className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-600 hover:bg-black hover:text-white hover:border-black transition"><FaChevronLeft size={10} /></button>
                        <span className="px-3 text-[12px] font-medium tracking-[-0.01em] text-[#0a0a0b] min-w-[130px] text-center">{weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <button onClick={() => changeWeek(7)} className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-600 hover:bg-black hover:text-white hover:border-black transition"><FaChevronRight size={10} /></button>
                    </div>
                    <button onClick={() => setIsSchedulerOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 bg-[#0a0a0b] text-white px-4 py-2 rounded-full text-[12px] font-medium hover:bg-black active:scale-[0.98] transition"><FaPlus size={10} /> Add</button>
                </div>
            </div>

            {/* Days — smooth, minimal */}
            <div className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {weekDays.map((day) => {
                        const dayApps = getAppointmentsForDay(day.date);
                        const isExpanded = expandedDate === day.date.toISOString();
                        const pending = dayApps.filter(a => !a.isTicked && a.status !== 'Completed' && a.status !== 'Operating').length;
                        const done = dayApps.filter(a => a.isTicked || a.status === 'Completed').length;
                        return (
                            <div key={day.date.toISOString()} onClick={() => setExpandedDate(isExpanded ? null : day.date.toISOString())} className={`rounded-[16px] border p-3 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${day.isToday ? 'bg-[#0a0a0b] text-white border-black shadow-sm' : 'bg-[#fcfcfc] border-black/5 hover:bg-white hover:border-black/10 hover:shadow-sm'} ${isExpanded ? 'ring-1 ring-black/5' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className={`text-[11px] tracking-[0.12em] uppercase font-medium ${day.isToday ? 'text-white/60' : 'text-neutral-500'}`}>{day.name}</div>
                                        <div className={`text-[18px] font-semibold tracking-[-0.02em] leading-none mt-1 ${day.isToday ? 'text-white' : 'text-[#0a0a0b]'}`}>{day.date.getDate()}</div>
                                        <div className={`text-[11px] ${day.isToday ? 'text-white/50' : 'text-neutral-400'}`}>{day.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                                    </div>
                                    <span className={`min-w-[28px] h-6 px-2 rounded-full grid place-items-center text-[11px] font-bold border ${dayApps.length === 0 ? (day.isToday ? 'bg-white/10 border-white/15 text-white/70' : 'bg-white border-black/5 text-neutral-500') : day.isToday ? 'bg-white text-[#0a0a0b] border-white' : 'bg-white border-black/5 text-[#0a0a0b]'}`}>{dayApps.length}</span>
                                </div>

                                {/* only needed: pending vs done */}
                                <div className="mt-3 flex gap-1.5">
                                    {pending > 0 && <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${day.isToday ? 'bg-white/10 border-white/15 text-white' : 'bg-white border-black/5 text-neutral-700'}`}>{pending} pending</span>}
                                    {done > 0 && <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${day.isToday ? 'bg-white text-[#0a0a0b] border-white' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{done} done</span>}
                                    {dayApps.length === 0 && <span className={`text-[11px] ${day.isToday ? 'text-white/50' : 'text-neutral-400'}`}>No appts</span>}
                                </div>

                                {/* expanded list — only essential */}
                                {isExpanded && (
                                    <div onClick={e => e.stopPropagation()} className="mt-3 pt-3 border-t border-black/5 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                        {dayApps.length === 0 ? (
                                            <div className="text-[12px] text-center py-6 text-neutral-500 border border-dashed border-black/10 rounded-xl">No appointments</div>
                                        ) : (
                                            dayApps.map(app => {
                                                const expired = isPastTime(app.date, app.time);
                                                const doneApp = app.isTicked || app.status === 'Completed';
                                                const operating = app.status === 'Operating';
                                                const treatment = parseAppointmentReason(app.reason).treatmentName;
                                                return (
                                                    <div key={app._id} className={`rounded-xl border p-2.5 flex items-center gap-2.5 ${operating ? 'bg-[#0a0a0b] border-black text-white' : doneApp ? 'bg-white border-black/5 opacity-60' : expired ? 'bg-amber-50 border-amber-100' : 'bg-white border-black/5'}`}>
                                                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border shrink-0 ${operating ? 'bg-white text-[#0a0a0b] border-white' : doneApp ? 'bg-[#f5f5f3] border-black/5 text-neutral-500' : 'bg-[#f5f5f3] border-black/5 text-[#0a0a0b]'}`}>{app.time}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/dashboard/schedules?highlight=${app._id}`} onClick={e => e.stopPropagation()} className={`block text-[12px] font-medium leading-none truncate hover:underline ${operating ? 'text-white' : doneApp ? 'text-neutral-500' : 'text-[#0a0a0b]'}`}>{app.patientId?.name || 'Unknown'}</Link>
                                                            <div className={`text-[11px] truncate ${operating ? 'text-white/60' : 'text-neutral-500'}`}>{treatment}</div>
                                                        </div>
                                                        <button onClick={e => toggleTick(e, app)} className={`w-7 h-7 rounded-full border grid place-items-center shrink-0 transition ${app.isTicked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-black/10 text-neutral-400 hover:border-black/20'}`} title="Toggle done"><FaCheck size={10} /></button>
                                                        {!doneApp && !operating && (
                                                            <button onClick={e => handleReschedule(e, app)} className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-600 hover:bg-black hover:text-white hover:border-black transition" title="Reschedule"><FaChevronRight size={10} /></button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center justify-between sm:hidden">
                    <button onClick={() => setIsSchedulerOpen(true)} className="inline-flex items-center gap-1.5 bg-[#0a0a0b] text-white px-4 py-2 rounded-full text-[12px] font-medium"><FaPlus size={10} /> Add appointment</button>
                    <span className="text-[11px] text-neutral-500">{appointments.length} total this week</span>
                </div>
            </div>

            <QuickScheduler isOpen={isSchedulerOpen} onClose={handleCloseScheduler} onSuccess={fetchData} appointmentId={editingAppointmentId} />
        </div>
    );
}
