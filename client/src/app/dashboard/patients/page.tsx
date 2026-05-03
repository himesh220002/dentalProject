'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaSearch, FaSortAmountDown, FaCalendarPlus, FaPhoneAlt, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import QuickScheduler from '@/components/QuickScheduler';
import AddPatientForm from '@/components/AddPatientForm';
import { parseAppointmentReason } from '@/utils/appointmentUtils';

export default function DashboardPatients() {
    type TreatmentRecordLite = {
        _id: string;
        treatmentName: string;
        date: string;
        cost?: number;
        notes?: string;
    };

    type NextAppointmentLite = {
        _id: string;
        date: string;
        time: string;
        reason: string;
        status?: string;
    };

    type PatientRow = {
        _id: string;
        name: string;
        age: number;
        gender: string;
        contact: string;
        email?: string;
        address: string;
        createdAt: string;
        medicalHistory?: string[];
        lastTreatment?: TreatmentRecordLite;
        nextAppointment?: NextAppointmentLite;
    };

    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'name_asc' | 'name_desc' | 'upcoming_first'>('newest');
    const [schedulerOpen, setSchedulerOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`);
            setPatients(response.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const openScheduler = (patient: PatientRow) => {
        setSelectedPatient(patient);
        setSchedulerOpen(true);
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return patients;
        return patients.filter(p => {
            const name = (p.name || '').toLowerCase();
            const phone = (p.contact || '').toLowerCase();
            const addr = (p.address || '').toLowerCase();
            return name.includes(q) || phone.includes(q) || addr.includes(q);
        });
    }, [patients, search]);

    const sorted = useMemo(() => {
        const list = [...filtered];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        if (sortBy === 'name_asc') return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (sortBy === 'name_desc') return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        if (sortBy === 'upcoming_first') {
            return list.sort((a, b) => {
                const aNext = a.nextAppointment?.date ? new Date(a.nextAppointment.date).setHours(0, 0, 0, 0) : Number.POSITIVE_INFINITY;
                const bNext = b.nextAppointment?.date ? new Date(b.nextAppointment.date).setHours(0, 0, 0, 0) : Number.POSITIVE_INFINITY;
                const aHas = Number.isFinite(aNext) && aNext >= todayMs;
                const bHas = Number.isFinite(bNext) && bNext >= todayMs;
                if (aHas !== bHas) return aHas ? -1 : 1;
                if (aNext !== bNext) return aNext - bNext;
                return (a.name || '').localeCompare(b.name || '');
            });
        }
        // newest: backend default sort by createdAt desc; keep stable fallback for safety
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [filtered, sortBy]);

    const total = patients.length;
    const upcomingCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();
        return patients.filter(p => p.nextAppointment?.date && new Date(p.nextAppointment.date).setHours(0, 0, 0, 0) >= todayMs).length;
    }, [patients]);

    return (
        <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Patients</h1>
                        <p className="text-slate-600 text-sm sm:text-base font-medium">
                            Fast lookup, upcoming visits, and clean patient records.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600">
                            Total: <span className="text-slate-900">{total}</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700">
                            Upcoming: <span className="text-emerald-900">{upcomingCount}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                        <div className="w-full lg:w-auto">
                            <AddPatientForm onPatientAdded={fetchPatients} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:justify-end lg:flex-1">
                            <div className="relative flex-1 max-w-2xl">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name, phone, or area…"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 font-semibold"
                                />
                            </div>
                            <div className="relative sm:w-[260px]">
                                <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'name_asc' | 'name_desc' | 'upcoming_first')}
                                    className="appearance-none w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="upcoming_first">Upcoming First</option>
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-56">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {sorted.map((p) => {
                            const area = (p.address || '').split(/[,\s]/).filter(Boolean)[0] || '—';
                            const next = p.nextAppointment?.date
                                ? `${new Date(p.nextAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • ${p.nextAppointment.time}`
                                : '—';
                            const nextReason = p.nextAppointment?.reason ? parseAppointmentReason(p.nextAppointment.reason).treatmentName : '—';
                            const last = p.lastTreatment?.date
                                ? new Date(p.lastTreatment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                                : '—';
                            const lastReason = p.lastTreatment?.treatmentName ? parseAppointmentReason(p.lastTreatment.treatmentName).treatmentName : '—';

                            return (
                                <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-black text-slate-900 truncate">{p.name}</div>
                                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1 flex flex-wrap items-center gap-2">
                                                <span>{p.age}Y</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{p.gender && p.gender !== '-__-' ? p.gender : 'N/A'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="inline-flex items-center gap-1.5"><FaMapMarkerAlt className="text-[10px]" /> {area}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/patients/${p._id}`}
                                            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm"
                                            aria-label="Open record"
                                        >
                                            <FaChevronRight />
                                        </Link>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next</div>
                                            <div className="text-sm font-black text-slate-900 mt-1">{next}</div>
                                            <div className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">{nextReason}</div>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last</div>
                                            <div className="text-sm font-black text-slate-900 mt-1">{last}</div>
                                            <div className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">{lastReason}</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <a
                                            href={`tel:${p.contact}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest"
                                        >
                                            <FaPhoneAlt className="text-[12px]" /> Call
                                        </a>
                                        <button
                                            onClick={() => openScheduler(p)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-sm"
                                        >
                                            <FaCalendarPlus className="text-[12px]" /> Book
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {sorted.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-semibold">
                                No patients found.
                            </div>
                        )}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1100px] w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Age</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Area</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Visit</th>
                                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Appt</th>
                                        <th className="px-3 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sorted.map((p) => {
                                        const area = (p.address || '').split(/[,\s]/).filter(Boolean)[0] || '—';
                                        const lastDate = p.lastTreatment?.date ? new Date(p.lastTreatment.date) : null;
                                        const nextDate = p.nextAppointment?.date ? new Date(p.nextAppointment.date) : null;
                                        const lastReason = p.lastTreatment?.treatmentName ? parseAppointmentReason(p.lastTreatment.treatmentName).treatmentName : '—';
                                        const nextReason = p.nextAppointment?.reason ? parseAppointmentReason(p.nextAppointment.reason).treatmentName : '—';

                                        return (
                                            <tr key={p._id} className="hover:bg-blue-50/30 transition">
                                                <td className="px-3 py-3">
                                                    <div className="font-black text-slate-900">{p.name}</div>
                                                    <div className="text-[11px] font-semibold text-slate-500">{p.email || '—'}</div>
                                                </td>
                                                <td className="px-3 py-3 text-sm font-black text-slate-900">{p.age ?? '—'}</td>
                                                <td className="px-3 py-3 text-sm font-black text-slate-900">{p.gender && p.gender !== '-__-' ? p.gender : 'N/A'}</td>
                                                <td className="px-3 py-3 text-sm font-black text-slate-900 tracking-wide">{p.contact}</td>
                                                <td className="px-3 py-3">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-black text-slate-700">
                                                        <FaMapMarkerAlt className="text-slate-400" /> {area}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-sm font-black text-slate-900">{lastDate ? lastDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—'}</div>
                                                    <div className="text-[11px] text-wrap font-semibold text-slate-600 max-w-[140px] truncate">{lastReason}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-sm font-black text-slate-900">
                                                        {nextDate ? `${nextDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • ${p.nextAppointment?.time}` : '—'}
                                                    </div>
                                                    <div className="text-[11px] text-wrap font-semibold text-slate-600 max-w-[140px] truncate">{nextReason}</div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => openScheduler(p)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-700 transition"
                                                        >
                                                            <FaCalendarPlus /> Book
                                                        </button>
                                                        <Link
                                                            href={`/patients/${p._id}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-700 transition"
                                                        >
                                                            Open <FaChevronRight className="text-[10px]" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {sorted.length === 0 && (
                            <div className="p-12 text-center text-slate-500 font-semibold">No patients found.</div>
                        )}
                    </div>
                </>
            )}

            {selectedPatient && (
                <QuickScheduler
                    isOpen={schedulerOpen}
                    onClose={() => { setSchedulerOpen(false); setSelectedPatient(null); }}
                    onSuccess={() => { setSchedulerOpen(false); setSelectedPatient(null); fetchPatients(); }}
                    initialName={selectedPatient.name}
                    initialSearch={selectedPatient.contact}
                    initialPatientId={selectedPatient._id}
                />
            )}
        </div>
    );
}
