'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaMapMarkedAlt, FaLink, FaUsers, FaTooth, FaCompass, FaCircleNotch, FaEnvelope, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Patient {
    _id: string;
    name: string;
    address: string;
    createdAt: string;
}

interface Appointment {
    _id: string;
    patientId: any;
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    // 1. Treatment Synergy (Distribution)
    const treatmentSynergy = useMemo(() => {
        const counts: { [key: string]: number } = {};
        appointments.forEach(a => {
            const tName = a.reason.split('|')[0].trim();
            if (tName) counts[tName] = (counts[tName] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [appointments]);

    // 2. Radial Geospatial Map (Circular Intelligence)
    const { radialOrbs, topAreas } = useMemo(() => {
        const areaCounts: { [key: string]: number } = {};
        const orbs: RadialOrb[] = [];

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
                .map(a => (a.patientId?._id || a.patientId)?.toString())
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
                .map(a => (a.patientId?._id || a.patientId)?.toString())
                .filter(Boolean)
        );

        patients.forEach((p, idx) => {
            // Skip patients without a valid address
            if (!p.address || p.address === '-__-' || p.address.trim() === '') return;

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

        return { radialOrbs: orbs, topAreas: sortedAreas };
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
            const pId = (a.patientId?._id || a.patientId)?.toString();
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
                // Use a default weight for pricing if not present
                const weight = tName.toLowerCase().includes('root canal') ? 5000 :
                    tName.toLowerCase().includes('extraction') ? 1000 :
                        tName.toLowerCase().includes('whitening') ? 3000 : 500;
                segments[tName] = (segments[tName] || 0) + weight;
            }
        });
        return Object.entries(segments).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [appointments]);

    // 4. Daily Appointment Activity (Current Month)
    const dailyActivity = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyCounts = Array(daysInMonth).fill(0);

        appointments.forEach(a => {
            const d = new Date(a.date);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                const dayIndex = d.getDate() - 1;
                if (dayIndex >= 0 && dayIndex < daysInMonth) {
                    dailyCounts[dayIndex]++;
                }
            }
        });
        return dailyCounts;
    }, [appointments]);

    const maxDaily = useMemo(() => Math.max(...dailyActivity, 1), [dailyActivity]);

    // 5. Monthly Flux Pulse (Historical)
    const fluxPulse = useMemo(() => {
        const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        const currentYear = new Date().getFullYear();
        return months.map((m, i) => {
            const count = appointments.filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === i && d.getFullYear() === currentYear;
            }).length;
            return count;
        });
    }, [appointments]);

    const maxFlux = useMemo(() => Math.max(...fluxPulse, 1), [fluxPulse]);

    const yearlyPerformance = useMemo(() => {
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
        return data.map(d => ({
            ...d,
            percent: (d.revenue / maxRevenue) * 100
        }));
    }, [appointments]);

    if (!mounted) return null;


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
                                            <Dialog.Title className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">Customer Intelligence</Dialog.Title>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                                                <span className="text-[10px] sm:text-xs bg-blue-500/10 text-blue-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">Live</span>
                                                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest hidden xs:inline">Orbital Mapping • Geospatial Sync</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-slate-800 rounded-xl sm:rounded-2xl transition text-slate-400 group border border-slate-800">
                                        <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/***/}
                                <div className="grid lg:grid-cols-12 gap-6">

                                    {/* Left Column: Radial Geospatial Map */}
                                    <div className="lg:col-span-4 bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 flex flex-col h-full overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <FaMapMarkedAlt size={120} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
                                            <FaCompass className="text-blue-500" />
                                            Radial Mapping
                                        </h3>

                                        <div className="relative aspect-square mb-8 flex items-center justify-center bg-slate-950/20 rounded-full">
                                            {/* Scope Grid: Angular Lines */}
                                            {[0, 45, 90, 135].map(deg => (
                                                <div
                                                    key={deg}
                                                    className="absolute w-full h-[1px] bg-slate-800/20"
                                                    style={{ transform: `rotate(${deg}deg)` }}
                                                ></div>
                                            ))}

                                            {/* North Indicator */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-col items-center gap-1 opacity-40 z-20">
                                                <span className="text-[10px] font-black text-slate-500">N</span>
                                                <div className="w-0.5 h-3 bg-gradient-to-b from-blue-500 to-transparent"></div>
                                            </div>

                                            {/* Concentric Rings (Scope Grid) */}
                                            <div className="absolute w-[90%] h-[90%] border border-slate-700/20 rounded-full"></div>
                                            <div className="absolute w-[60%] h-[60%] border border-slate-700/20 rounded-full"></div>
                                            <div className="absolute w-[30%] h-[30%] border border-slate-700/20 rounded-full"></div>

                                            {/* Radar Sweep Beam (Conic Tactical Torch) */}
                                            <div className="absolute inset-0 z-10 animate-[spin_4s_linear_infinite] pointer-events-none overflow-hidden rounded-full -rotate-90">
                                                <div
                                                    className="absolute inset-0 opacity-40"
                                                    style={{
                                                        background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.6) 0deg, transparent 60deg)'
                                                    }}
                                                ></div>
                                                <div className="absolute top-1/2 left-1/2 w-full h-[2px] bg-blue-300 shadow-[0_0_15px_rgba(96,165,250,1)] origin-left"></div>
                                            </div>

                                            {/* Center Clinic Position */}
                                            <div className="relative z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                                                <FaTooth className="text-blue-600 text-xl" />
                                            </div>

                                            {/* Orbital Patient Blips */}
                                            {radialOrbs.map((orb: RadialOrb, i: number) => (
                                                <div
                                                    key={i}
                                                    className={`absolute transition-all duration-1000 group/orb ${orb.isActive ? 'w-4 h-4 z-40' : orb.isUpcoming ? 'w-3 h-3 z-35' : 'w-1.5 h-1.5 z-30'
                                                        }`}
                                                    style={{
                                                        left: `${orb.x}%`,
                                                        top: `${orb.y}%`,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                >
                                                    {/* Base Blip */}
                                                    <div className={`w-full h-full rounded-full transition-all duration-500 ${orb.isActive ?
                                                        'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-pulse' :
                                                        orb.isUpcoming ?
                                                            'bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)] ring-1 ring-white/30' :
                                                            'bg-white opacity-20 group-hover/orb:opacity-100'
                                                        }`}></div>

                                                    {/* Active Pulse Halo */}
                                                    {orb.isActive && (
                                                        <div className="absolute inset-[-6px] border border-blue-400/50 rounded-full animate-ping opacity-60"></div>
                                                    )}
                                                    {orb.isUpcoming && (
                                                        <div className="absolute inset-[-4px] border border-white/20 rounded-full animate-pulse opacity-40"></div>
                                                    )}
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-white text-[8px] font-black rounded opacity-0 group-hover/orb:opacity-100 transition whitespace-nowrap z-50 border border-slate-800 shadow-xl">
                                                        {orb.area} {orb.isActive ? '• ACTIVE VISIT' : orb.isUpcoming ? '• UPCOMING' : 'ZONE'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-6 flex flex-wrap items-center justify-between gap-y-3 px-2">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                                {topAreas.map((area, idx) => (
                                                    <div key={area} className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-blue-300' : idx === 1 ? 'bg-blue-500' : 'bg-blue-700'} opacity-70`}></div>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{area}</span>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1.5 sm:ml-2 border-l border-slate-700 pl-3 sm:pl-4">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Station</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zone Intelligence</span>
                                                <span className="text-lg font-black text-blue-400">Optimal</span>
                                            </div>
                                            <div className="px-2">
                                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                                                    Circular mapping centered at clinic.
                                                    {topAreas.length > 0 ? (
                                                        <> High intensity detected in <span className="text-blue-400">{topAreas.join(', ')}</span> orbital zones.</>
                                                    ) : (
                                                        <> Synchronizing live radial telemetry. Distribution remains stabilized across all distance rings.</>
                                                    )}
                                                </p>
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
                                            <h3 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <FaTooth className="text-emerald-500" />
                                                Revenue Synergy
                                            </h3>
                                            <div className="space-y-4">
                                                {revenueSegments.map(([name, val], i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                                                            P{i + 1}
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
                                                                    className={`h-full ${step.color.replace('text', 'bg')} transition-all duration-[1.5s] delay-${i * 100}`}
                                                                    style={{ width: `${(step.val / (flowMetrics.funnel[0].val || 1)) * 100}%` }}
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

                                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2 sm:gap-4 h-32 items-end">
                                        {yearlyPerformance.map((data, i) => (
                                            <div key={i} className="group/bar flex flex-col items-center gap-2 h-full relative">
                                                <div className="flex-grow w-full flex items-end gap-[1px]">
                                                    <div
                                                        className="flex-grow bg-blue-500/20 group-hover/bar:bg-blue-500 transition-all duration-500 rounded-t-sm"
                                                        style={{ height: `${data.percent}%` }}
                                                    ></div>
                                                    <div
                                                        className="w-[2px] bg-slate-800 h-full rounded-t-sm opacity-20"
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{data.month}</span>

                                                {/* Tooltip */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white p-2 rounded-lg border border-slate-700 opacity-0 group-hover/bar:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-2xl">
                                                    <div className="text-[9px] font-black text-blue-400 uppercase mb-1">{data.month} Revenue</div>
                                                    <div className="text-xs font-black">₹{data.revenue.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold ml-1">COLLECTED</span></div>
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
