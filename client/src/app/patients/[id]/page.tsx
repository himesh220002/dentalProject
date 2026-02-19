'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaPhoneAlt, FaMapMarkerAlt, FaHistory, FaClinicMedical, FaEdit, FaSave, FaTimes, FaPlus, FaEnvelope } from 'react-icons/fa';
import Navbar from '../../../components/Navbar';
import PatientHistory from '../../../components/PatientHistory';

interface Patient {
    _id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    email?: string;
    address: string;
    medicalHistory: string[];
}

interface TreatmentRecord {
    _id: string;
    treatmentName: string;
    date: string;
    cost: number;
    notes: string;
    prescription: string;
}

export default function PatientProfile() {
    const params = useParams();
    const id = params?.id as string;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<TreatmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPatient, setEditedPatient] = useState<Patient | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);

    const fetchPatientData = async () => {
        setLoading(true);
        try {
            const [patientRes, recordsRes, aptRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients/${id}`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records/patient/${id}`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/patient/${id}`)
            ]);
            setPatient(patientRes.data);
            setEditedPatient(patientRes.data);
            setRecords(recordsRes.data);

            // Find upcoming appointment
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const sortedApts = aptRes.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const nextApt = sortedApts.find((apt: any) => {
                const aptDate = new Date(apt.date);
                return aptDate >= startOfToday && apt.status !== 'Completed' && !apt.isTicked;
            });
            setUpcomingAppointment(nextApt);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditedPatient(patient);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedPatient(patient);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!editedPatient) return;
        setIsSaving(true);
        try {
            const dataToSave = {
                ...editedPatient,
                gender: editedPatient.gender || '-__-',
                address: editedPatient.address?.trim() || '-__-'
            };
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients/${id}`, dataToSave);
            setPatient(res.data);
            setIsEditing(false);
            // Optional: add a success toast here if available
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Failed to update patient profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && editedPatient) {
            if (!editedPatient.medicalHistory.includes(newTag.trim())) {
                setEditedPatient({
                    ...editedPatient,
                    medicalHistory: [...editedPatient.medicalHistory, newTag.trim()]
                });
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        if (editedPatient) {
            setEditedPatient({
                ...editedPatient,
                medicalHistory: editedPatient.medicalHistory.filter(tag => tag !== tagToRemove)
            });
        }
    };

    useEffect(() => {
        if (id) {
            fetchPatientData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-bold animate-pulse">Loading Patient Profile...</p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
                        <h1 className="text-4xl font-black text-gray-900 mb-4">Patient Not Found</h1>
                        <p className="text-gray-500 mb-8">The patient record you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-blue-500/50 transition"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const lastVisit = records.length > 0 ? records[0] : null;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] mb-8 transition group"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition">
                        <FaArrowLeft size={12} />
                    </div>
                    Back to Dashboard
                </button>

                {/* Profile Header Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100 mb-10">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 md:px-12 py-10 md:py-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <FaUser className="text-white text-4xl md:text-6xl" />
                            </div>
                            <div className="flex-grow">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedPatient?.name || ''}
                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 uppercase tracking-tight bg-white/10 border-b-2 border-white/30 focus:border-white focus:outline-none w-full"
                                    />
                                ) : (
                                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 uppercase tracking-tight">{patient.name}</h1>
                                )}
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-blue-50 text-xs font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                        <FaIdCard className="text-blue-200" />
                                        ID: {patient._id.slice(-8).toUpperCase()}
                                    </div>
                                    <div className="bg-emerald-400/20 backdrop-blur-md px-4 py-1.5 rounded-full text-emerald-50 text-xs font-black uppercase tracking-widest border border-emerald-400/20 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        Active Patient
                                    </div>
                                    {upcomingAppointment && (
                                        <div className="bg-amber-400/20 backdrop-blur-md px-4 py-1.5 rounded-full text-amber-50 text-xs font-black uppercase tracking-widest border border-amber-400/30 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                                            Upcoming: {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {!isEditing ? (
                                    <button
                                        onClick={handleEdit}
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition flex items-center gap-2"
                                    >
                                        <FaEdit /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg border border-emerald-400/50 transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition flex items-center gap-2"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Personal Details */}
                            <div className="space-y-8">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                    Personal Profile
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-gray-100 group-hover:scale-110 transition">
                                                <FaBirthdayCake />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Age</p>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedPatient?.age || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                                                        className="text-lg font-black text-gray-800 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800">{patient.age} Years</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm border border-gray-100 group-hover:scale-110 transition">
                                                <FaVenusMars />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Gender</p>
                                                {isEditing ? (
                                                    <select
                                                        value={editedPatient?.gender || '-__-'}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, gender: e.target.value } : null)}
                                                        className="text-lg font-black text-gray-800 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none w-full"
                                                    >
                                                        <option value="-__-">-__-</option>
                                                        <option value="Male">MALE</option>
                                                        <option value="Female">FEMALE</option>
                                                    </select>
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800 uppercase">{(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? '-__-' : patient.gender}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition group sm:col-span-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-gray-100 group-hover:scale-110 transition">
                                                <FaPhoneAlt />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Contact Number</p>
                                                {isEditing ? (
                                                    <div className="space-y-1 w-full">
                                                        <input
                                                            type="text"
                                                            value={editedPatient?.contact || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                                setEditedPatient(prev => prev ? { ...prev, contact: val } : null);
                                                            }}
                                                            className={`text-lg font-black bg-transparent border-b-2 border-gray-100 focus:border-blue-500 focus:outline-none w-full transition-colors ${(editedPatient?.contact?.length || 0) === 10 ? 'text-emerald-600' : (editedPatient?.contact?.length || 0) > 0 ? 'text-rose-600' : 'text-gray-800'
                                                                }`}
                                                            placeholder="10 digit phone number"
                                                        />
                                                        {(editedPatient?.contact?.length || 0) > 0 && (editedPatient?.contact?.length || 0) < 10 && (
                                                            <p className="text-[9px] text-rose-500 font-black animate-pulse">Incomplete: {(editedPatient?.contact?.length || 0)}/10 digits</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800">{patient.contact}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition group sm:col-span-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm border border-gray-100 group-hover:scale-110 transition">
                                                <FaEnvelope />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Email Address</p>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={editedPatient?.email || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, email: e.target.value } : null)}
                                                        className="text-lg font-black text-gray-800 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none w-full"
                                                        placeholder="patient@example.com"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800">{patient.email || 'Not Provided'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition group sm:col-span-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm border border-gray-100 group-hover:scale-110 transition">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Residential Address</p>
                                                {isEditing ? (
                                                    <textarea
                                                        value={editedPatient?.address || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, address: e.target.value } : null)}
                                                        rows={2}
                                                        className="text-base font-bold text-gray-700 leading-relaxed bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-base font-bold text-gray-700 leading-relaxed">{patient.address || '-__-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Summary */}
                            <div className="space-y-8">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                    Medical Summary
                                </h2>

                                <div className="space-y-6">
                                    {/* Last Visit */}
                                    {lastVisit ? (
                                        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                                                <FaHistory size={64} />
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Last Clinical Visit
                                            </p>
                                            <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase tracking-tight">{lastVisit.treatmentName}</h3>
                                            <p className="text-emerald-700/70 font-bold text-sm bg-white/50 inline-block px-4 py-1.5 rounded-full border border-emerald-100/50">
                                                {new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 border-dashed text-center">
                                            <p className="text-gray-400 font-bold italic">No previous clinical history recorded.</p>
                                        </div>
                                    )}

                                    {/* Medical History Tags */}
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <FaClinicMedical className="text-blue-600" />
                                            Pre-existing Conditions
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {isEditing ? (
                                                <>
                                                    {editedPatient?.medicalHistory.map((item, index) => (
                                                        <span key={index} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-wider border border-rose-100 flex items-center gap-2 group/tag transition hover:bg-rose-100">
                                                            {item}
                                                            <button
                                                                onClick={() => removeTag(item)}
                                                                className="text-rose-300 hover:text-rose-600 transition"
                                                            >
                                                                <FaTimes size={10} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <div className="flex items-center gap-2 w-full mt-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Add condition..."
                                                            value={newTag}
                                                            onChange={(e) => setNewTag(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                            className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                                                        />
                                                        <button
                                                            onClick={addTag}
                                                            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
                                                        >
                                                            <FaPlus size={12} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                                                    patient.medicalHistory.map((item, index) => (
                                                        <span key={index} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-wider border border-rose-100 hover:bg-rose-100 transition cursor-default">
                                                            {item}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-sm font-medium italic">No pre-existing conditions disclosed.</p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <PatientHistory patientId={patient._id} records={records} onRefresh={fetchPatientData} isEditingProfile={isEditing} />
            </div>
        </div>
    );
}
