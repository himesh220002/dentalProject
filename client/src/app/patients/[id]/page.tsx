'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaPhoneAlt, FaMapMarkerAlt, FaHistory, FaClinicMedical, FaEdit, FaSave, FaTimes, FaPlus, FaEnvelope, FaNotesMedical } from 'react-icons/fa';
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

            <div className="container mx-auto px-0 sm:px-4 py-8 max-w-6xl">
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
                <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100 mb-10">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 sm:px-12 py-10 sm:py-16 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10 text-center md:text-left">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl group transition-transform duration-500 hover:scale-105">
                                <FaUser className="text-white text-3xl md:text-4xl opacity-90 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex-grow">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedPatient?.name || ''}
                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-4 uppercase tracking-tight bg-white/10 border-b-2 border-white/30 focus:border-white focus:outline-none w-full px-4 rounded-xl"
                                    />
                                ) : (
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3 uppercase tracking-tighter">{patient.name}</h1>
                                )}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl text-blue-50 text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                        <FaIdCard className="text-blue-200" />
                                        RECORD ID: {patient._id.slice(-8).toUpperCase()}
                                    </div>
                                    <div className="bg-emerald-400/20 backdrop-blur-md px-5 py-2 rounded-2xl text-emerald-50 text-[10px] font-black uppercase tracking-widest border border-emerald-400/20 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        Active Patient
                                    </div>
                                    {upcomingAppointment && (
                                        <div className="bg-amber-400/20 backdrop-blur-md px-5 py-2 rounded-2xl text-amber-50 text-[10px] font-black uppercase tracking-widest border border-amber-400/30 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-400 relative"></div>
                                            Upcoming: {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 min-w-[180px]">
                                {!isEditing ? (
                                    <button
                                        onClick={handleEdit}
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        <FaEdit /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 border border-emerald-400/50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-white/10 hover:bg-white text-white hover:text-gray-900 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <FaTimes /> Discard
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-12 md:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Personal Details */}
                            <div className="space-y-10">
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-4">
                                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                                    Biological & Contact Data
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50/70 p-2 sm:p-6 rounded-[1rem] sm:rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl text-blue-600 shadow-sm border border-gray-200 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300">
                                                <FaBirthdayCake />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-2">Patient Age</p>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedPatient?.age || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                                                        className="text-lg font-black text-gray-800 bg-white border-2 border-gray-100 rounded-xl px-3 py-1 focus:border-blue-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800">{patient.age} <span className="text-gray-400 font-bold ml-1">Years</span></p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/70 p-2 sm:p-6 sm:rounded-[2rem] rounded-[1rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl text-rose-500 shadow-sm border border-gray-200 flex items-center justify-center text-xl group-hover:bg-rose-500 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300">
                                                <FaVenusMars />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-2">Gender</p>
                                                {isEditing ? (
                                                    <select
                                                        value={editedPatient?.gender || '-__-'}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, gender: e.target.value } : null)}
                                                        className="text-lg font-black text-gray-800 bg-white border-2 border-gray-100 rounded-xl px-3 py-1 focus:border-blue-500 focus:outline-none w-full uppercase"
                                                    >
                                                        <option value="-__-">-__-</option>
                                                        <option value="Male">MALE</option>
                                                        <option value="Female">FEMALE</option>
                                                    </select>
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800 uppercase">{(patient.gender === 'Other' || patient.gender === 'others' || !patient.gender) ? 'Not Recorded' : patient.gender}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/70 p-2 sm:p-6 sm:rounded-[2rem] rounded-[1rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group sm:col-span-2">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl text-indigo-600 shadow-sm border border-gray-200 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300">
                                                <FaPhoneAlt />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-2">Primary Contact</p>
                                                {isEditing ? (
                                                    <div className="space-y-1 w-full">
                                                        <input
                                                            type="text"
                                                            value={editedPatient?.contact || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                                setEditedPatient(prev => prev ? { ...prev, contact: val } : null);
                                                            }}
                                                            className={`text-lg font-black bg-white border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none w-full transition-colors ${(editedPatient?.contact?.length || 0) === 10 ? 'text-emerald-600' : (editedPatient?.contact?.length || 0) > 0 ? 'text-rose-600' : 'text-gray-800'
                                                                }`}
                                                            placeholder="10 digit phone number"
                                                        />
                                                        {(editedPatient?.contact?.length || 0) > 0 && (editedPatient?.contact?.length || 0) < 10 && (
                                                            <p className="text-[10px] text-rose-500 font-black tracking-tight animate-pulse ml-1">Incomplete: {(editedPatient?.contact?.length || 0)}/10 digits</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-lg font-black text-gray-800 tracking-wider">+91 {patient.contact}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/70 p-2 sm:p-6 sm:rounded-[2rem] rounded-[1rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group sm:col-span-2">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl text-blue-500 shadow-sm border border-gray-200 flex items-center justify-center text-xl group-hover:bg-blue-500 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300">
                                                <FaEnvelope />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-2">Email Address</p>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={editedPatient?.email || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, email: e.target.value } : null)}
                                                        className="text-md font-black text-gray-800 bg-white border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none w-full"
                                                        placeholder="patient@example.com"
                                                    />
                                                ) : (
                                                    <p className="text-md font-black text-gray-800 truncate">{patient.email || 'Email not registered'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/70 p-2 sm:p-6 sm:rounded-[2rem] rounded-[1rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group sm:col-span-2">
                                        <div className="flex items-start gap-5">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl text-amber-500 shadow-sm border border-gray-200 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 flex-shrink-0">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-3">Residential Location</p>
                                                {isEditing ? (
                                                    <textarea
                                                        value={editedPatient?.address || ''}
                                                        onChange={(e) => setEditedPatient(prev => prev ? { ...prev, address: e.target.value } : null)}
                                                        rows={3}
                                                        className="text-base font-bold text-gray-700 leading-relaxed bg-white border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-sm sm:text-base font-bold text-gray-700 leading-relaxed italic pr-2">{patient.address === '-__-' ? 'Permanent address not on file' : patient.address}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Summary */}
                            <div className="space-y-10">
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-4">
                                    <div className="w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                                    Clinical Metadata
                                </h2>

                                <div className="space-y-6">
                                    {/* Last Visit Highlight Card */}
                                    {lastVisit ? (
                                        <div className="bg-emerald-50/70 p-8 sm:p-10 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-default">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-6">
                                                <FaHistory size={120} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="inline-flex items-center gap-2 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl mb-6 shadow-sm border border-emerald-100">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Most Recent Treatment
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-900 mb-4 uppercase tracking-tighter leading-tight group-hover:translate-x-1 transition-transform">{lastVisit.treatmentName}</h3>
                                                <div className="inline-block bg-emerald-600/10 px-5 py-2 rounded-2xl text-emerald-800 font-black text-xs border border-emerald-200/50">
                                                    {new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50/50 p-12 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100 mb-4">
                                                <FaHistory size={24} />
                                            </div>
                                            <p className="text-gray-400 font-bold italic text-sm">Patient has no clinical history on record.</p>
                                        </div>
                                    )}

                                    {/* Medical History Tags */}
                                    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                            <FaClinicMedical className="text-blue-600" />
                                            Pre-existing Health Conditions
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {isEditing ? (
                                                <div className="w-full space-y-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {editedPatient?.medicalHistory.map((item, index) => (
                                                            <span key={index} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-rose-100 flex items-center gap-3 transition hover:bg-rose-100 animate-in zoom-in duration-200">
                                                                {item}
                                                                <button
                                                                    onClick={() => removeTag(item)}
                                                                    className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-rose-300 hover:text-rose-600 transition shadow-sm"
                                                                >
                                                                    <FaTimes size={10} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-grow">
                                                            <input
                                                                type="text"
                                                                placeholder="Type a condition (e.g. Diabetes, BP)..."
                                                                value={newTag}
                                                                onChange={(e) => setNewTag(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
                                                            />
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                                                <FaPlus size={14} />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={addTag}
                                                            className="bg-blue-600 text-white p-4.5 aspect-square rounded-[1.25rem] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-90"
                                                        >
                                                            <FaPlus size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                                                    patient.medicalHistory.map((item, index) => (
                                                        <span key={index} className="px-6 py-3 bg-rose-50/50 text-rose-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest border border-rose-100/50 hover:bg-rose-600 hover:text-white transition-all duration-300 cursor-default shadow-sm hover:shadow-rose-600/20 hover:-translate-y-0.5">
                                                            {item}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <div className="w-full py-8 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center opacity-40">
                                                        <div className="text-gray-400 mb-2 mt-2"><FaNotesMedical size={18} /></div>
                                                        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">No Conditions Listed</p>
                                                    </div>
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
