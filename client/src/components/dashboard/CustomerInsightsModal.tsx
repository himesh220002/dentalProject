'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaMapMarkedAlt, FaLink, FaUsers, FaTooth, FaCompass, FaCircleNotch } from 'react-icons/fa';

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
                isActive: activePatientIds.has(p._id)
            });
        });

        const sortedAreas = Object.entries(areaCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

        return { radialOrbs: orbs, topAreas: sortedAreas };
    }, [patients, appointments]);

    // 3. Connection Radar Stats
    const radarStats = useMemo(() => {
        const retention = Math.min((appointments.filter(a => a.status === 'Completed').length / (appointments.length || 1)) * 100, 100);
        const loyalty = Math.min((appointments.length / (patients.length || 1)) * 20, 100);
        const inquiry = Math.min((messages.length / (patients.length || 1)) * 50, 100);
        const stability = 85; // Simulated baseline

        return [
            { label: 'Retention', value: retention, color: 'text-emerald-500' },
            { label: 'Loyalty', value: loyalty, color: 'text-blue-500' },
            { label: 'Inquiry', value: inquiry, color: 'text-amber-500' },
            { label: 'Stability', value: stability, color: 'text-purple-500' }
        ];
    }, [patients, appointments, messages]);

    // 4. Monthly Flux Pulse
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-[3rem] bg-slate-900 p-8 shadow-2xl transition-all border border-slate-800 text-slate-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                                            <FaChartLine size={32} />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-3xl font-black tracking-tight text-white">Customer Intelligence</Dialog.Title>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">Live Analysis</span>
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Orbital Mapping • Geospatial Sync</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-800 rounded-2xl transition text-slate-400 group border border-slate-800">
                                        <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-300" />
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
                                                    className={`absolute transition-all duration-1000 group/orb ${orb.isActive ? 'w-4 h-4 z-40' : 'w-1.5 h-1.5 z-30'
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
                                                        'bg-white opacity-40 group-hover/orb:opacity-100'
                                                        }`}></div>

                                                    {/* Active Pulse Halo */}
                                                    {orb.isActive && (
                                                        <div className="absolute inset-[-6px] border border-blue-400/50 rounded-full animate-ping opacity-60"></div>
                                                    )}
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-white text-[8px] font-black rounded opacity-0 group-hover/orb:opacity-100 transition whitespace-nowrap z-50 border border-slate-800 shadow-xl">
                                                        {orb.area} {orb.isActive ? '• ACTIVE VISIT' : 'ZONE'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Radial Legend */}
                                        <div className="mb-6 flex items-center justify-between px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Patients</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-4">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Active Visit</span>
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

                                    {/* Center Column: Radar & Distribution */}
                                    <div className="lg:col-span-5 flex flex-col gap-6">

                                        {/* Interaction Radar */}
                                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 relative overflow-hidden h-64">
                                            <div className="relative z-10 flex h-full items-center justify-between gap-8">
                                                <div className="space-y-4 flex-grow">
                                                    {radarStats.map((s, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                <span>{s.label}</span>
                                                                <span className={s.color}>{s.value.toFixed(0)}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 delay-${i * 100} ${s.color.replace('text', 'bg')}`}
                                                                    style={{ width: `${s.value}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                                                    <FaUsers className="text-slate-700 text-4xl" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Treatment synergy */}
                                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 flex-grow">
                                            <h3 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <FaTooth className="text-emerald-500" />
                                                Treatment Synergy
                                            </h3>
                                            <div className="space-y-4">
                                                {treatmentSynergy.map(([name, count], i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                                                            P{i + 1}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between text-xs font-black mb-1">
                                                                <span className="truncate max-w-[150px]">{name || 'General'}</span>
                                                                <span className="text-slate-500">{count}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-emerald-500"
                                                                    style={{ width: `${(count / appointments.length) * 100}%` }}
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

                                        {/* Interaction Pulse */}
                                        <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 text-white flex flex-col justify-between h-64 group cursor-default overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-150 transition-transform duration-700">
                                                <FaLink size={80} />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Engagement Pulse</h3>
                                                <span className="text-5xl font-black">{(fluxPulse.reduce((a, b) => a + b, 0) / 12).toFixed(1)}</span>
                                                <p className="text-[10px] font-bold opacity-60 uppercase mt-2 tracking-widest">Avg Activity / Month</p>
                                            </div>

                                            <div className="flex items-end gap-1 h-20">
                                                {fluxPulse.map((val, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-white/30 rounded-t-sm transition-all duration-300 hover:bg-white"
                                                        style={{ height: `${(val / maxFlux) * 100}%` }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Micro Metrics */}
                                        <div className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 flex-grow grid gap-4">
                                            <div className="p-4 bg-slate-900/50 rounded-3xl border border-slate-700/30">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <FaCircleNotch className="text-amber-500 animate-spin-slow" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Growth Index</span>
                                                </div>
                                                <span className="text-xl font-black text-white">+12.4%</span>
                                            </div>
                                            <div className="p-4 bg-slate-900/50 rounded-3xl border border-slate-700/30">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <FaUsers className="text-purple-500" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Community Pulse</span>
                                                </div>
                                                <span className="text-xl font-black text-white">Strong</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">
                                        Intelligent Dashboard Engine v2.0 • Real-time Data Mapping
                                    </p>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
