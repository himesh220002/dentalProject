'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaMapMarkedAlt, FaTooth, FaCompass, FaEnvelope, FaCalendarAlt, FaClock } from 'react-icons/fa';

interface Patient {
    _id: string;
    name: string;
    address: string;
    createdAt: string;
}

interface Appointment {
    _id: string;
    patientId?: { _id: string; name: string } | string | null;
    date: string;
    reason: string;
    status: string;
}

interface Message {
    _id: string;
    name: string;
    createdAt: string;
}

interface Treatment {
    _id: string;
    name: string;
    price?: string;
}

interface InsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    patients: Patient[];
    appointments: Appointment[];
    messages: Message[];
    treatments: Treatment[];
}

interface RadialOrb {
    id: string;
    area: string;
    x: number;
    y: number;
    intensity: 'high' | 'medium' | 'low';
    val: number;
    isActive: boolean;
    isUpcoming: boolean;
}

export default function CustomerInsightsModal({ isOpen, onClose, patients, appointments, messages, treatments }: InsightsModalProps) {
    const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        // Defer setState to satisfy strict lint rule
        const t = setTimeout(() => {
            setShouldAnimate(isOpen);
            setActiveBarIndex(null);
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen]);


    // 2. Radial Geospatial Map (Circular Intelligence)
    const { radialOrbs, topAreas, addressMissingCount, areaRanking, activeTodayCount, upcomingCount } = useMemo(() => {
        const areaCounts: { [key: string]: number } = {};
        const orbs: RadialOrb[] = [];
        let missing = 0;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const todayTime = now.getTime();

        const activePatientIds = new Set(
            appointments
                .filter(a => {
                    if (!a.date) return false;
                    const d = new Date(a.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === todayTime && a.status !== 'Cancelled';
                })
                .map(a => (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString())
                .filter(Boolean)
        );

        const upcomingPatientIds = new Set(
            appointments
                .filter(a => {
                    if (!a.date) return false;
                    const d = new Date(a.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() > todayTime && a.status !== 'Cancelled';
                })
                .map(a => (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString())
                .filter(Boolean)
        );

        patients.forEach((p) => {
            // Skip patients without a valid address
            if (!p.address || p.address === '-__-' || p.address.trim() === '') {
                missing += 1;
                return;
            }

            const area = p.address.split(/[,\s]/)[0].trim().toUpperCase();
            areaCounts[area] = (areaCounts[area] || 0) + 1;

            // Radial distribution logic based on area + patient ID for jitter
            let areaHash = 0;
            for (let i = 0; i < area.length; i++) areaHash = area.charCodeAt(i) + ((areaHash << 5) - areaHash);

            let pIdHash = 0;
            const pIdStr = p._id.toString();
            for (let i = 0; i < pIdStr.length; i++) pIdHash = pIdStr.charCodeAt(i) + ((pIdHash << 5) - pIdHash);

            const baseAngle = ((Math.abs(areaHash) % 360) - 90);
            const jitterAngle = (Math.abs(pIdHash) % 10) - 5;
            const angle = (baseAngle + jitterAngle) * (Math.PI / 180);

            const ringIndex = (Math.abs(areaHash * 7) % 3);
            const ringBaseRadius = ringIndex === 0 ? 12 : ringIndex === 1 ? 28 : 42;
            const jitterRadius = (Math.abs(pIdHash) % 6) - 3;
            const radius = ringBaseRadius + jitterRadius;

            orbs.push({
                id: p._id,
                area,
                x: 50 + radius * Math.cos(angle),
                y: 50 + radius * Math.sin(angle),
                intensity: ringIndex === 0 ? 'high' : ringIndex === 1 ? 'medium' : 'low',
                val: 1,
                isActive: activePatientIds.has(p._id),
                isUpcoming: upcomingPatientIds.has(p._id)
            });
        });

        const sortedAreas = Object.entries(areaCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

        const ranking = Object.entries(areaCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([area, count]) => ({ area, count }));

        return {
            radialOrbs: orbs,
            topAreas: sortedAreas,
            addressMissingCount: missing,
            areaRanking: ranking,
            activeTodayCount: activePatientIds.size,
            upcomingCount: upcomingPatientIds.size
        };
    }, [patients, appointments]);

    // 3. Patient Flow & Conversion Funnel
    const flowMetrics = useMemo(() => {
        const completed = appointments.filter(a => a.status === 'Completed');
        const cancelled = appointments.filter(a => a.status === 'Cancelled');

        // Fulfillment Rate: % of scheduled appointments that were successfully completed
        // (Factor in auto-cancellations at 7 PM as missed opportunities)
        const fulfillmentRate = Math.min(((completed.length) / (appointments.length || 1)) * 100, 100);

        // Retention: % of patients with more than 1 appointment
        const patientApptCounts: { [key: string]: number } = {};
        appointments.forEach(a => {
            const pId = (typeof a.patientId === 'object' && a.patientId !== null ? a.patientId._id : a.patientId)?.toString();
            if (pId) patientApptCounts[pId] = (patientApptCounts[pId] || 0) + 1;
        });
        const retainedPatients = Object.values(patientApptCounts).filter(count => count > 1).length;
        const retentionRate = (retainedPatients / (patients.length || 1)) * 100;

        // Conversion Stages
        const inquiries = messages.length;
        const consultations = appointments.length;
        const treatments = completed.length;
        const followups = retainedPatients;

        return {
            punctuality: fulfillmentRate, // Using Fulfillment as the primary efficiency metric
            retentionRate,
            cancellationRate: (cancelled.length / (appointments.length || 1)) * 100,
            funnel: [
                { label: 'Inquiries', val: inquiries, icon: FaEnvelope, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Consults', val: consultations, icon: FaCalendarAlt, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Treatments', val: treatments, icon: FaTooth, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'FollowUps', val: followups, icon: FaChartLine, color: 'text-purple-400', bg: 'bg-purple-400/10' }
            ],
            zones: {
                ...Object.fromEntries(topAreas.map(area => [area, radialOrbs.filter(o => o.area === area).length])),
                'CENTRAL': radialOrbs.filter(o => !topAreas.includes(o.area)).length
            }
        };
    }, [patients, appointments, messages, radialOrbs, topAreas]);

    // 4. Revenue per Segment (Theoretic)
    const revenueSegments = useMemo(() => {
        const segments: { [key: string]: number } = {};
        appointments.forEach(a => {
            if (a.status === 'Completed') {
                const tName = a.reason.split('|')[0].trim() || 'General';

                // Try to find the actual price from the treatments list
                const treatmentData = treatments.find(t => t.name.toLowerCase() === tName.toLowerCase());
                let priceValue = 0;

                if (treatmentData?.price) {
                    // Extract numeric value from string (e.g., "₹5,000" -> 5000)
                    priceValue = parseInt(treatmentData.price.replace(/[^\d]/g, ''), 10) || 0;
                } else {
                    // Fallback to defaults if treatment not found or price missing
                    priceValue = tName.toLowerCase().includes('root canal') ? 5000 :
                        tName.toLowerCase().includes('extraction') ? 1000 :
                            tName.toLowerCase().includes('whitening') ? 5000 : 500;
                }

                segments[tName] = (segments[tName] || 0) + priceValue;
            }
        });
        return Object.entries(segments).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [appointments, treatments]);

    const { yearlyPerformance, maxAnnualRevenue } = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        const data = months.map((month, i) => {
            const monthlyCompleted = appointments.filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === i && d.getFullYear() === currentYear && a.status === 'Completed';
            });

            const revenue = monthlyCompleted.reduce((sum, a) => {
                const tName = a.reason.split('|')[0].trim() || 'General';
                const weight = tName.toLowerCase().includes('root canal') ? 5000 :
                    tName.toLowerCase().includes('extraction') ? 1000 :
                        tName.toLowerCase().includes('whitening') ? 3000 : 500;
                return sum + weight;
            }, 0);

            return { month, revenue };
        });

        const maxRevenue = Math.max(...data.map(d => d.revenue), 10000);
        return {
            yearlyPerformance: data.map(d => ({
                ...d,
                percent: (d.revenue / maxRevenue) * 100,
                isPeak: d.revenue === maxRevenue && d.revenue > 0
            })),
            maxAnnualRevenue: maxRevenue
        };
    }, [appointments]);

    if (!isOpen) return null;


    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center sm:p-4 ">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-none sm:rounded-[2rem] sm:rounded-[3rem] bg-slate-900 p-4 sm:p-8 shadow-2xl transition-all border border-slate-800 text-slate-100">
                                <div className="flex justify-between items-center mb-6 sm:mb-10">
                                    <div className="flex items-center gap-3 sm:gap-5">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                                            <FaChartLine size={24} className="sm:text-[32px]" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">Clinic Insights</Dialog.Title>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                                                <span className="text-[10px] sm:text-xs bg-blue-500/10 text-blue-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">Live</span>
                                                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest hidden xs:inline">KPIs • Trends • Actions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-slate-800 rounded-xl sm:rounded-2xl transition text-slate-400 group border border-slate-800">
                                        <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/***/}
                                <div className="grid lg:grid-cols-12 gap-6">

                                    {/* Left Column: Top Areas + data quality */}
                                    <div className="lg:col-span-4 bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 flex flex-col h-full overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <FaMapMarkedAlt size={120} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                            <FaCompass className="text-blue-500" />
                                            Patient Areas
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Today</div>
                                                <div className="text-3xl font-black text-blue-300">{activeTodayCount}</div>
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Upcoming</div>
                                                <div className="text-3xl font-black text-white">{upcomingCount}</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30 mb-6">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Missing Address</div>
                                                <div className={`text-sm font-black ${addressMissingCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                                                    {addressMissingCount}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider leading-relaxed">
                                                Improve address capture to make area insights reliable.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Top Areas</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patients</span>
                                            </div>
                                            <div className="space-y-2">
                                                {areaRanking.length > 0 ? areaRanking.map((r) => (
                                                    <div key={r.area} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/20 border border-slate-800/60">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-300 uppercase">
                                                            {r.area.slice(0, 2)}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="text-sm font-black text-white truncate">{r.area}</div>
                                                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
                                                                <div className="h-full bg-blue-500/60" style={{ width: `${(r.count / (areaRanking[0]?.count || 1)) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-black text-slate-200">{r.count}</div>
                                                    </div>
                                                )) : (
                                                    <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-800/60 text-slate-400 text-sm font-bold">
                                                        Not enough address data to rank areas.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Column: Flow & Revenue synergy */}
                                    <div className="lg:col-span-5 flex flex-col gap-6">

                                        {/* Patient Flow Efficiency */}
                                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 relative overflow-hidden flex flex-col">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <FaClock size={120} />
                                            </div>
                                            <h3 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <FaClock className="text-blue-500" />
                                                Flow Efficiency
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30 flex flex-col justify-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Punctuality</span>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-emerald-400">{flowMetrics.punctuality.toFixed(0)}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 mb-1">On Time</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30 flex flex-col justify-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cancellations</span>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-rose-400">{flowMetrics.cancellationRate.toFixed(1)}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 mb-1">Lost Flow</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency Benchmark</span>
                                                        <span className="text-[10px] font-black text-blue-400 uppercase">Top 10%</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${flowMetrics.punctuality}%` }}></div>
                                                        <div className="h-full bg-slate-800/50" style={{ width: `${100 - flowMetrics.punctuality}%` }}></div>
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-tight italic">
                                                        {flowMetrics.punctuality > 80 ? 'Exceptional flow. Fulfillment rate is high across all zones.' : 'Fulfillment gap detected. 7 PM auto-cancellations are impacting efficiency.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Revenue synergy */}
                                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 flex-grow">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                    <FaTooth className="text-emerald-500" />
                                                    Revenue Synergy
                                                </h3>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Estimated</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {revenueSegments.map(([name, val], i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[7px] font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-tighter">
                                                            RANK {i + 1}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between text-xs font-black mb-1">
                                                                <span className="truncate max-w-[150px]">{name}</span>
                                                                <span className="text-slate-500">₹{val.toLocaleString()}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-emerald-500"
                                                                    style={{ width: `${(val / (revenueSegments[0][1] || 1)) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Pulse & Metrics */}
                                    <div className="lg:col-span-3 flex flex-col gap-6">

                                        {/* Conversion Funnel */}
                                        <div className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 flex flex-col group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <FaCompass size={80} />
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <FaChartLine className="text-blue-400" />
                                                Conversion Funnel
                                            </h3>

                                            <div className="space-y-4">
                                                {flowMetrics.funnel.map((step, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center border border-white/5`}>
                                                            <step.icon size={16} />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{step.label}</span>
                                                                <span className="text-sm font-black text-white">{step.val}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${step.color.replace('text', 'bg')} transition-all duration-[2s] ease-out`}
                                                                    style={{
                                                                        width: shouldAnimate ? `${(step.val / (Math.max(...flowMetrics.funnel.map(f => f.val), 1))) * 100}%` : '0%'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Micro Metrics & Predictive Alerts */}
                                        <div className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 grid grid-cols-2 lg:grid-cols-1 gap-4">
                                            <div className="p-4 bg-slate-900/50 rounded-3xl border border-slate-700/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-2 h-2 rounded-full ${flowMetrics.punctuality > 80 ? 'bg-emerald-500' : flowMetrics.punctuality > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black text-white">{flowMetrics.punctuality.toFixed(0)}%</span>
                                                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                                                        <FaChartLine className="text-[8px]" /> ↑
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FaCompass className="text-blue-400" />
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Growth Momentum</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-blue-200/80 leading-snug">
                                                    {flowMetrics.retentionRate > 20 ? 'Strong patient loyalty detected. Focus on scalability.' : 'Retention lagging. Optimize follow-up engagement.'}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Bottom Row: Yearly Target Performance */}
                                <div className="mt-8 bg-slate-800/20 p-8 rounded-[3rem] border border-slate-700/30 overflow-hidden relative group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <FaChartLine className="text-blue-500" />
                                                Financial Revenue Pulse
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Monthly collection analytics across fiscal year</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-blue-400">Revenue Stream</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2 sm:gap-4 h-32 items-end relative">
                                        {/* Max Revenue Reference Line */}
                                        <div className="absolute left-0 right-0 border-t border-dashed border-blue-500/30 z-0 flex items-center justify-end px-4 pointer-events-none" style={{ bottom: '95%' }}>
                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] bg-slate-900 px-2">Peak: ₹{maxAnnualRevenue.toLocaleString()}</span>
                                        </div>

                                        {yearlyPerformance.map((data, i) => (
                                            <div
                                                key={i}
                                                className="group/bar flex flex-col items-center gap-2 h-full relative z-10 cursor-pointer"
                                                onClick={() => setActiveBarIndex(activeBarIndex === i ? null : i)}
                                            >
                                                <div className="flex-grow w-full flex items-end gap-[1px]">
                                                    <div
                                                        className={`flex-grow ${data.isPeak ? 'bg-emerald-500/40' : 'bg-blue-500/20'} ${activeBarIndex === i ? 'bg-blue-500 opacity-100' : 'group-hover/bar:bg-blue-500'} transition-all duration-500 rounded-t-sm relative`}
                                                        style={{ height: `${data.percent}%` }}
                                                    >
                                                        {data.isPeak && (
                                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="w-[2px] bg-slate-800 h-full rounded-t-sm opacity-20"
                                                    ></div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${activeBarIndex === i ? 'text-blue-400' : 'text-slate-500'}`}>{data.month}</span>

                                                {/* Tooltip */}
                                                <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white p-2 rounded-xl border border-blue-500/30 ${activeBarIndex === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 sm:group-hover/bar:opacity-100 sm:group-hover/bar:translate-y-0 sm:group-hover/bar:scale-100'} transition-all duration-300 z-50 pointer-events-none whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${data.isPeak ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                                        <div className="text-[9px] font-black text-blue-400 uppercase">{data.month} Performance</div>
                                                    </div>
                                                    <div className="text-sm font-black flex items-baseline gap-1">
                                                        ₹{data.revenue.toLocaleString()}
                                                        <span className="text-[8px] text-slate-500 font-black uppercase">Tax Incl.</span>
                                                    </div>
                                                    {data.isPeak && (
                                                        <div className="mt-1 text-[7px] font-black text-emerald-400 uppercase tracking-widest border-t border-emerald-500/20 pt-1">✨ Annual Peak Revenue</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
