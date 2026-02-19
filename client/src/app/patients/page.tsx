'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AddPatientForm from '../../components/AddPatientForm';
import ProtectedRoute from '@/components/ProtectedRoute';

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
        // Since backend sends sorted by createdAt desc, 'newest' is default.
        // Actually, for robust client side sorting if we manipulate list:
        // We don't have createdAt in interface yet, but backend sends it. Let's rely on array order for 'newest' as initial fetch is sorted.

        if (sortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        }
        return 0;
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">

                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <AddPatientForm onPatientAdded={fetchPatients} />

                        <div className="flex flex-col sm:flex-col xl:flex-row gap-4 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full md:w-64"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                            >
                                <option value="newest">Newest First</option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading patients...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Mobile/Tablet Card View */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {sortedPatients.map((patient) => (
                                    <div key={patient._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">{patient.name}</div>
                                                <div className="text-sm text-gray-500">{patient.age} Y / {(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? '-__-' : patient.gender}</div>
                                            </div>
                                            <div className="bg-blue-50 px-2 py-1 rounded-lg text-blue-600 text-[10px] font-black uppercase">
                                                Active
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-bold">Contact:</span> {patient.contact}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-bold">Scheduled:</span>
                                                {patient.nextAppointment ? (
                                                    <span className="text-blue-600 font-bold">Upcoming: {new Date(patient.nextAppointment.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</span>
                                                ) : patient.lastTreatment ? (
                                                    <span className="text-gray-800 font-bold">Done: {new Date(patient.lastTreatment.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</span>
                                                ) : 'None'}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Link
                                                href={`/patients/${patient._id}`}
                                                className="flex-1 bg-blue-600 text-white text-center py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition"
                                            >
                                                View Profile
                                            </Link>
                                            <button className="px-4 py-2 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white shadow-md rounded-[2rem] overflow-hidden border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Scheduled</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {sortedPatients.map((patient) => (
                                            <tr key={patient._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{patient.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{patient.age} Y / {(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? '-__-' : patient.gender}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700 font-medium">{patient.contact}</div>
                                                    <div className="text-xs text-gray-400">{patient.address}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    {patient.nextAppointment ? (
                                                        <div>
                                                            <div className="text-sm font-black text-blue-600 border-sm bg-green-100 p-2 rounded-lg">Upcoming date-({new Date(patient.nextAppointment.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })})</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{patient.nextAppointment.reason}</div>
                                                        </div>
                                                    ) : patient.lastTreatment ? (
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">Done date-({new Date(patient.lastTreatment.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })})</div>
                                                            <div className="text-[10px] text-blue-600 font-black uppercase truncate max-w-[150px]">{patient.lastTreatment.treatmentName}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs italic">No visits yet</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <Link
                                                        href={`/patients/${patient._id}`}
                                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm hover:shadow-md active:scale-95"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {sortedPatients.length === 0 && (
                                <div className="bg-white p-20 text-center rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                    <div className="text-gray-400 font-black text-lg uppercase tracking-widest">
                                        {searchTerm ? 'No matches found' : 'Empty Database'}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{searchTerm ? 'Try a different name or number' : 'Add your first patient to start tracking'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
