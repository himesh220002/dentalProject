'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaMapMarkedAlt, FaTooth, FaEnvelope, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';

interface Patient { _id: string; name: string; address: string; createdAt: string; }
interface Appointment { _id: string; patientId?: { _id: string; name: string } | string | null; date: string; reason: string; status: string; }
interface Message { _id: string; name: string; createdAt: string; }
interface Treatment { _id: string; name: string; price?: string; }
interface InsightsModalProps { isOpen: boolean; onClose: () => void; patients: Patient[]; appointments: Appointment[]; messages: Message[]; treatments: Treatment[]; }

export default function CustomerInsightsModal({ isOpen, onClose, patients, appointments, messages, treatments }: InsightsModalProps) {
    const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    useEffect(() => { const t = setTimeout(() => { setShouldAnimate(isOpen); setActiveBarIndex(null); }, 0); return () => clearTimeout(t); }, [isOpen]);

    const { topAreas, addressMissingCount, areaRanking, activeTodayCount, upcomingCount } = useMemo(() => {
        const areaCounts: Record<string, number> = {};
        let missing = 0;
        const now = new Date(); now.setHours(0, 0, 0, 0); const todayTime = now.getTime();
        const activeIds = new Set(appointments.filter(a => { if (!a.date) return false; const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() === todayTime && a.status !== 'Cancelled'; }).map(a => (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString()).filter(Boolean));
        const upcomingIds = new Set(appointments.filter(a => { if (!a.date) return false; const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() > todayTime && a.status !== 'Cancelled'; }).map(a => (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString()).filter(Boolean));
        patients.forEach(p => {
            if (!p.address || p.address.trim() === '') { missing += 1; return; }
            const area = p.address.split(/[,\s]/)[0].trim().toUpperCase(); areaCounts[area] = (areaCounts[area] || 0) + 1;
        });
        const ranking = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([area, count]) => ({ area, count }));
        const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
        return { topAreas: sortedAreas, addressMissingCount: missing, areaRanking: ranking, activeTodayCount: activeIds.size, upcomingCount: upcomingIds.size };
    }, [patients, appointments]);

    const flowMetrics = useMemo(() => {
        const completed = appointments.filter(a => a.status === 'Completed');
        const cancelled = appointments.filter(a => a.status === 'Cancelled');
        const fulfillmentRate = Math.min((completed.length / (appointments.length || 1)) * 100, 100);
        const patientApptCounts: Record<string, number> = {};
        appointments.forEach(a => { const pId = (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString(); if (pId) patientApptCounts[pId] = (patientApptCounts[pId] || 0) + 1; });
        const retainedPatients = Object.values(patientApptCounts).filter(c => c > 1).length;
        const retentionRate = (retainedPatients / (patients.length || 1)) * 100;
        return {
            punctuality: fulfillmentRate,
            retentionRate,
            cancellationRate: (cancelled.length / (appointments.length || 1)) * 100,
            funnel: [
                { label: 'Inquiries', val: messages.length, icon: FaEnvelope, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Consults', val: appointments.length, icon: FaCalendarAlt, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { label: 'Treatments', val: completed.length, icon: FaTooth, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Follow-ups', val: retainedPatients, icon: FaChartLine, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
            ]
        };
    }, [patients, appointments, messages]);

    const revenueSegments = useMemo(() => {
        const segments: Record<string, number> = {};
        appointments.forEach(a => {
            if (a.status === 'Completed') {
                const tName = a.reason.split('|')[0].trim() || 'General';
                const treatmentData = treatments.find(t => t.name.toLowerCase() === tName.toLowerCase());
                let priceValue = 0;
                if (treatmentData?.price) priceValue = parseInt(treatmentData.price.replace(/[^\d]/g, ''), 10) || 0;
                else priceValue = tName.toLowerCase().includes('root canal') ? 5000 : tName.toLowerCase().includes('extraction') ? 1000 : tName.toLowerCase().includes('whitening') ? 5000 : 500;
                segments[tName] = (segments[tName] || 0) + priceValue;
            }
        });
        return Object.entries(segments).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [appointments, treatments]);

    const { yearlyPerformance, maxAnnualRevenue } = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const data = months.map((month, i) => {
            const monthlyCompleted = appointments.filter(a => { const d = new Date(a.date); return d.getMonth() === i && d.getFullYear() === currentYear && a.status === 'Completed'; });
            const revenue = monthlyCompleted.reduce((sum, a) => {
                const tName = a.reason.split('|')[0].trim() || 'General';
                const weight = tName.toLowerCase().includes('root canal') ? 5000 : tName.toLowerCase().includes('extraction') ? 1000 : tName.toLowerCase().includes('whitening') ? 3000 : 500;
                return sum + weight;
            }, 0);
            return { month, revenue };
        });
        const maxRevenue = Math.max(...data.map(d => d.revenue), 10000);
        return { yearlyPerformance: data.map(d => ({ ...d, percent: (d.revenue / maxRevenue) * 100, isPeak: d.revenue === maxRevenue && d.revenue > 0 })), maxAnnualRevenue: maxRevenue };
    }, [appointments]);

    if (!isOpen) return null;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4" enterTo="opacity-100 translate-y-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-4">
                            <Dialog.Panel className="w-full max-w-6xl bg-[#fcfcfc] rounded-[24px] border border-black/5 shadow-xl overflow-hidden">
                                <div className="bg-white border-b border-black/5 px-6 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-[#0a0a0b] text-white grid place-items-center"><FaChartLine size={14} /></span>
                                        <div>
                                            <Dialog.Title className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Clinic Insights</Dialog.Title>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
                                                <span className="text-[11px] text-neutral-500 hidden sm:inline">KPIs · Trends · Useful actions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-600 hover:bg-white hover:border-black/10 transition"><FaTimes size={14} /></button>
                                </div>

                                <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                                    {/* Top row */}
                                    <div className="grid lg:grid-cols-12 gap-4">
                                        <div className="lg:col-span-4 bg-white rounded-[20px] border border-black/5 p-5">
                                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaMapMarkedAlt size={11} className="text-neutral-400" /> Patient Areas</h3>
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-4 text-center">
                                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Active today</div>
                                                    <div className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0b] mt-1">{activeTodayCount}</div>
                                                </div>
                                                <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-4 text-center">
                                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Upcoming</div>
                                                    <div className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0b] mt-1">{upcomingCount}</div>
                                                </div>
                                            </div>
                                            <div className={`mt-3 rounded-2xl border p-3 flex items-center justify-between ${addressMissingCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                                <span className="text-[11px] font-medium tracking-[-0.01em] text-neutral-700">Missing address</span>
                                                <span className={`text-[13px] font-semibold ${addressMissingCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{addressMissingCount}</span>
                                            </div>
                                            <p className="text-[11px] leading-5 text-neutral-500 mt-2">{addressMissingCount > 0 ? 'Fix: Ask front-desk to capture full address at registration for reliable area insights.' : 'Great — address capture is complete.'}</p>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Top areas</span>
                                                    <span className="text-[11px] text-neutral-400">Patients</span>
                                                </div>
                                                <div className="mt-2 space-y-2">
                                                    {areaRanking.length ? areaRanking.map(r => (
                                                        <div key={r.area} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#fcfcfc] border border-black/5">
                                                            <span className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center text-[10px] font-bold tracking-[-0.01em] text-neutral-700">{r.area.slice(0, 2)}</span>
                                                            <span className="flex-1 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] truncate">{r.area}</span>
                                                            <span className="text-[12px] font-semibold text-[#0a0a0b]">{r.count}</span>
                                                        </div>
                                                    )) : <div className="p-4 rounded-2xl bg-[#fcfcfc] border border-black/5 text-[13px] text-neutral-500 text-center">Not enough address data</div>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-5 space-y-4">
                                            <div className="bg-white rounded-[20px] border border-black/5 p-5">
                                                <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaClock size={11} className="text-neutral-400" /> Flow Efficiency — Useful</h3>
                                                <div className="mt-4 grid grid-cols-2 gap-3">
                                                    <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-4">
                                                        <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Fulfilment</div>
                                                        <div className="text-[20px] font-semibold tracking-[-0.02em] text-emerald-600 mt-1">{flowMetrics.punctuality.toFixed(0)}%</div>
                                                        <div className="text-[11px] text-neutral-500">Completed / Scheduled</div>
                                                    </div>
                                                    <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-4">
                                                        <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Cancellations</div>
                                                        <div className="text-[20px] font-semibold tracking-[-0.02em] text-rose-600 mt-1">{flowMetrics.cancellationRate.toFixed(1)}%</div>
                                                        <div className="text-[11px] text-neutral-500">Lost flow</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 h-2 bg-[#f5f5f3] rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${flowMetrics.punctuality}%` }} />
                                                </div>
                                                <p className="text-[11px] leading-5 text-neutral-500 mt-2">{flowMetrics.punctuality > 80 ? '✓ Strong flow. Keep confirming appointments via WhatsApp the evening before.' : '→ Tip: Send WhatsApp reminders at 6pm to cut 7pm auto-cancellations.'}</p>
                                            </div>

                                            <div className="bg-white rounded-[20px] border border-black/5 p-5">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaTooth size={11} className="text-neutral-400" /> Revenue — Top Treatments</h3>
                                                    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium">Estimated</span>
                                                </div>
                                                <div className="mt-4 space-y-3">
                                                    {revenueSegments.length ? revenueSegments.map(([name, val], i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <span className="w-6 h-6 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-[10px] font-bold text-neutral-600">{i + 1}</span>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-[12px] font-medium"><span className="truncate max-w-[160px] text-[#0a0a0b]">{name}</span><span className="text-neutral-500">₹{val.toLocaleString()}</span></div>
                                                                <div className="mt-1 h-1.5 bg-[#f5f5f3] rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#0a0a0b]" style={{ width: `${(val / (revenueSegments[0][1] || 1)) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : <div className="text-[13px] text-neutral-500">No completed revenue yet.</div>}
                                                </div>
                                                <p className="text-[11px] leading-5 text-neutral-500 mt-3">Useful: Promote top earner with a WhatsApp broadcast to past patients.</p>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-3 bg-white rounded-[20px] border border-black/5 p-5">
                                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaUsers size={11} className="text-neutral-400" /> Conversion Funnel — Useful</h3>
                                            <div className="mt-4 space-y-3">
                                                {flowMetrics.funnel.map((step, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <span className={`w-8 h-8 rounded-full border grid place-items-center ${step.bg} ${step.border} ${step.color}`}><step.icon size={12} /></span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-[11px] font-medium"><span className="tracking-[0.08em] uppercase text-neutral-500">{step.label}</span><span className="font-semibold text-[#0a0a0b]">{step.val}</span></div>
                                                            <div className="mt-1 h-1.5 bg-[#f5f5f3] rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#0a0a0b] transition-all duration-700" style={{ width: shouldAnimate ? `${(step.val / (Math.max(...flowMetrics.funnel.map(f => f.val), 1))) * 100}%` : '0%' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3">
                                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Retention</div>
                                                    <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b] mt-1">{flowMetrics.retentionRate.toFixed(0)}%</div>
                                                    <div className="text-[11px] text-neutral-500">Repeat patients</div>
                                                </div>
                                                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
                                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-blue-700">Next action</div>
                                                    <div className="text-[12px] font-medium text-blue-900 mt-1 leading-5">{flowMetrics.retentionRate > 20 ? 'Upsell whitening to retained cohort.' : 'Create 3-month recall for first-timers.'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[20px] border border-black/5 p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Monthly Revenue Pulse</h3>
                                            <span className="text-[11px] px-2 py-1 rounded-full bg-[#f5f5f3] border border-black/5 font-medium text-neutral-600">₹{maxAnnualRevenue.toLocaleString()} peak</span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-12 gap-1 h-24 items-end">
                                            {yearlyPerformance.map((d, i) => (
                                                <div key={i} onClick={() => setActiveBarIndex(activeBarIndex === i ? null : i)} className="flex flex-col items-center gap-1 cursor-pointer group">
                                                    <div className="flex-1 w-full flex items-end gap-px">
                                                        <div className={`flex-1 rounded-t ${d.isPeak ? 'bg-emerald-500' : 'bg-[#0a0a0b] group-hover:bg-black'} transition-all`} style={{ height: shouldAnimate ? `${d.percent}%` : '0%', minHeight: d.revenue > 0 ? '6px' : '2px' }} />
                                                    </div>
                                                    <span className={`text-[10px] font-medium ${activeBarIndex === i ? 'text-[#0a0a0b]' : 'text-neutral-400'}`}>{d.month.slice(0, 1)}</span>
                                                    {activeBarIndex === i && <span className="absolute -top-8 bg-[#0a0a0b] text-white text-[11px] px-2 py-1 rounded-full -translate-x-1/2 left-1/2 whitespace-nowrap hidden sm:block">₹{d.revenue.toLocaleString()}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] leading-5 text-neutral-500 mt-3">Tip: Schedule high-value treatments (implants) in low months to smooth revenue.</p>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
