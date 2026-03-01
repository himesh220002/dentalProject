'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AddPatientForm from '../../components/AddPatientForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaSearch, FaUserPlus, FaChevronRight, FaPhoneAlt, FaMapMarkerAlt, FaCalendarCheck, FaHistory, FaSortAmountDown } from 'react-icons/fa';

interface TreatmentRecord {
    _id: string;
    treatmentName: string;
    date: string;
    cost: number;
    notes: string;
}

interface Patient {
    _id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    address: string;
    medicalHistory: string[];
    lastTreatment?: TreatmentRecord;
    nextAppointment?: {
        _id: string;
        date: string;
        time: string;
        reason: string;
    };
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'name_asc', 'name_desc'
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`);
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Filter and Sort logic
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.includes(searchTerm)
    );

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        if (sortBy === 'newest') return 0; // Backend default

        if (sortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        }
        return 0;
    });

    const [expandedPatients, setExpandedPatients] = useState<string[]>([]);

    const togglePatient = (id: string) => {
        setExpandedPatients(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Patient Records</h1>
                            <p className="text-gray-500 font-medium">Manage and monitor patient history and upcoming visits.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 px-4 py-2 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200">
                                {patients.length} Total Patients
                            </div>
                        </div>
                    </div>

                    {/* Actions & Filters */}
                    <div className="bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            <div className="w-full lg:w-auto">
                                <AddPatientForm onPatientAdded={fetchPatients} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-grow justify-end">
                                <div className="relative flex-grow max-w-md">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or contact..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-inner"
                                    />
                                </div>
                                <div className="relative">
                                    <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none pl-11 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-inner"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="name_asc">Name (A-Z)</option>
                                        <option value="name_desc">Name (Z-A)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/10 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing Database...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Mobile/Tablet Card View */}
                            <div className="grid grid-cols-1 gap-2 sm:gap-6 md:hidden">
                                {sortedPatients.map((patient) => {
                                    const isExpanded = expandedPatients.includes(patient._id);
                                    const today = new Date().setHours(0, 0, 0, 0);
                                    const isUpcoming = patient.nextAppointment && new Date(patient.nextAppointment.date).getTime() >= today;

                                    return (
                                        <div key={patient._id} className={`bg-white p-6 rounded-[1.5rem] shadow-sm border transition-all ${isUpcoming ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-gray-100'}`}>
                                            <div
                                                className="flex justify-between items-start mb-2 cursor-pointer"
                                                onClick={() => togglePatient(patient._id)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-sm transition-all ${isUpcoming ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-gray-900 mb-1">{patient.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-tight">
                                                                {patient.age} Y
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-blue-50 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-tight">
                                                                {(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? 'N/A' : patient.gender}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                                        <FaCalendarCheck className="text-sm" />
                                                    </div>
                                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <FaSortAmountDown className="text-gray-300 text-xs rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-3 py-4 border-y border-gray-50 my-4">
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                                <FaPhoneAlt size={12} />
                                                            </div>
                                                            {patient.contact}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                                <FaHistory size={12} />
                                                            </div>
                                                            {patient.nextAppointment ? (
                                                                <span className="text-blue-600 font-bold">Upcoming: {new Date(patient.nextAppointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                            ) : patient.lastTreatment ? (
                                                                <span className="text-gray-500">Visit: {new Date(patient.lastTreatment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                            ) : 'No Records'}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/patients/${patient._id}`}
                                                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
                                                    >
                                                        VIEW FULL PROFILE
                                                        <FaChevronRight className="text-[10px]" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white shadow-sm rounded-[3rem] overflow-hidden border border-gray-100">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[300px]">Patient Details</th>
                                            <th className="hidden xl:table-cell px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Status</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Actions</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sortedPatients.map((patient) => {
                                            const isExpanded = expandedPatients.includes(patient._id);
                                            const today = new Date().setHours(0, 0, 0, 0);
                                            const isUpcoming = patient.nextAppointment && new Date(patient.nextAppointment.date).getTime() >= today;

                                            // Determine live status
                                            let liveStatus = null;
                                            if (patient.lastTreatment && new Date(patient.lastTreatment.date).setHours(0, 0, 0, 0) === today) {
                                                liveStatus = (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Visited Today
                                                    </span>
                                                );
                                            } else if (isUpcoming) {
                                                liveStatus = (
                                                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-blue-100">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                        </span>
                                                        Upcoming: {new Date(patient.nextAppointment!.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                );
                                            } else if (patient.lastTreatment) {
                                                liveStatus = (
                                                    <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-gray-100">
                                                        Last Visit: {new Date(patient.lastTreatment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <React.Fragment key={patient._id}>
                                                    <tr className={`hover:bg-blue-50/30 transition-all group cursor-pointer ${isExpanded ? 'bg-blue-50/20' : ''}`} onClick={() => togglePatient(patient._id)}>
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-lg transition-all ${isUpcoming ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                                                    {patient.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</div>
                                                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-tight flex items-center gap-2 mt-0.5">
                                                                        {patient.age} YEARS <span className="w-1 h-1 rounded-full bg-gray-300"></span> {(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? 'N/A' : patient.gender}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="hidden xl:table-cell px-8 py-6 whitespace-nowrap">
                                                            {liveStatus}
                                                        </td>
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                                                    Active
                                                                </span>
                                                                <div className={`px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:border-blue-200 group-hover:text-blue-600 transition-all`}>
                                                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                                            <div className={`transition-transform duration-300 inline-block ${isExpanded ? 'rotate-180' : ''}`}>
                                                                <FaSortAmountDown className="text-gray-300 rotate-90" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="bg-gray-50/30 border-t-0">
                                                            <td colSpan={4} className="px-8 py-8">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300">
                                                                    {/* Communication Section */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                            <FaPhoneAlt size={10} /> Communication
                                                                        </h4>
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400">
                                                                                    <FaPhoneAlt size={12} />
                                                                                </div>
                                                                                {patient.contact}
                                                                            </div>
                                                                            <div className="flex items-start gap-3 text-[11px] text-gray-500 font-bold">
                                                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 flex-shrink-0">
                                                                                    <FaMapMarkerAlt size={12} />
                                                                                </div>
                                                                                <span className="mt-1.5 leading-relaxed">{patient.address === '-__-' ? 'Permanent address not recorded' : patient.address}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Timeline Section */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                            <FaHistory size={10} /> Clinical Timeline
                                                                        </h4>
                                                                        {patient.nextAppointment ? (
                                                                            <div className="bg-white p-4 rounded-3xl border border-blue-100 shadow-sm">
                                                                                <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                                    <FaCalendarCheck size={10} /> Next Scheduled
                                                                                </div>
                                                                                <div className="text-sm font-black text-gray-800">{new Date(patient.nextAppointment.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                                                                <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">{patient.nextAppointment.time} • {patient.nextAppointment.reason}</div>
                                                                            </div>
                                                                        ) : patient.lastTreatment ? (
                                                                            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm opacity-80">
                                                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                                    <FaHistory size={10} /> Recent Visit
                                                                                </div>
                                                                                <div className="text-sm font-bold text-gray-700">{new Date(patient.lastTreatment.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                                                                <div className="text-[10px] text-blue-600 font-black mt-1 uppercase tracking-tight">{patient.lastTreatment.treatmentName}</div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="h-full flex items-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-4">
                                                                                <span className="text-gray-400 text-[11px] font-bold italic">No history available for this record</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Quick Action */}
                                                                    <div className="flex flex-col justify-center gap-3">
                                                                        <Link
                                                                            href={`/patients/${patient._id}`}
                                                                            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
                                                                        >
                                                                            FULL CLINICAL RECORD
                                                                            <FaChevronRight size={10} />
                                                                        </Link>
                                                                        <button className="px-6 py-4 bg-white border border-rose-100 rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all opacity-50 hover:opacity-100">
                                                                            ARCHIVE RECORD
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {sortedPatients.length === 0 && (
                                <div className="bg-white p-24 text-center rounded-[4rem] border-2 border-dashed border-gray-100">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                        <FaSearch className="text-gray-200 text-3xl" />
                                    </div>
                                    <div className="text-gray-900 font-black text-xl uppercase tracking-widest mb-2">
                                        {searchTerm ? 'No matches found' : 'Database Empty'}
                                    </div>
                                    <p className="text-gray-400 font-medium max-w-xs mx-auto">
                                        {searchTerm ? `We couldn't find any patient matching "${searchTerm}". Try a different search term.` : 'Start building your clinical database by adding your first patient.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
