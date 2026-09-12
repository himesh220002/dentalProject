'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaPhoneAlt, FaMapMarkerAlt, FaHistory, FaEdit, FaSave, FaTimes, FaPlus, FaEnvelope, FaNotesMedical, FaCheckCircle } from 'react-icons/fa';
import PatientHistory from '../../../components/PatientHistory';
import { parseAppointmentReason } from '@/utils/appointmentUtils';

interface Patient {
    _id: string; name: string; age: number; gender: string; contact: string; email?: string; address: string; medicalHistory: string[];
}
interface TreatmentRecord { _id: string; treatmentName: string; date: string; cost: number; notes: string; prescription: string; }

export default function PatientProfile() {
    const params = useParams(); const id = params?.id as string;
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
            setPatient(patientRes.data); setEditedPatient(patientRes.data); setRecords(recordsRes.data);
            const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
            const sortedApts = aptRes.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const nextApt = sortedApts.find((apt: any) => { const aptDate = new Date(apt.date); return aptDate >= startOfToday && apt.status !== 'Completed' && !apt.isTicked; });
            setUpcomingAppointment(nextApt);
        } catch (error) { console.error('Error fetching data:', error); }
        finally { setLoading(false); }
    };
    const handleEdit = () => { setEditedPatient(patient); setIsEditing(true); };
    const handleCancel = () => { setEditedPatient(patient); setIsEditing(false); };
    const handleSave = async () => {
        if (!editedPatient) return; setIsSaving(true);
        try {
            const dataToSave = { ...editedPatient, gender: editedPatient.gender || '', address: editedPatient.address?.trim() || '' };
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients/${id}`, dataToSave);
            setPatient(res.data); setIsEditing(false);
        } catch (error) { console.error('Error updating patient:', error); alert('Failed to update patient profile.'); }
        finally { setIsSaving(false); }
    };
    const addTag = () => {
        if (newTag.trim() && editedPatient) {
            if (!editedPatient.medicalHistory.includes(newTag.trim())) {
                setEditedPatient({ ...editedPatient, medicalHistory: [...editedPatient.medicalHistory, newTag.trim()] });
            }
            setNewTag('');
        }
    };
    const removeTag = (tagToRemove: string) => {
        if (editedPatient) setEditedPatient({ ...editedPatient, medicalHistory: editedPatient.medicalHistory.filter(tag => tag !== tagToRemove) });
    };
    useEffect(() => { if (id) fetchPatientData(); }, [id]);

    if (loading) return <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;
    if (!patient) return (
        <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
            <div className="bg-white rounded-[20px] border border-black/5 p-8 text-center max-w-md w-full">
                <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">Patient Not Found</h1>
                <p className="text-[13px] text-neutral-500 mt-2">This record doesn't exist or was removed.</p>
                <button onClick={() => window.history.back()} className="mt-4 px-5 py-2.5 rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black">Return</button>
            </div>
        </div>
    );

    const lastVisit = records.length > 0 ? records[0] : null;

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[-0.01em] text-neutral-500 hover:text-[#0a0a0b] transition">
                    <span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center"><FaArrowLeft size={11} /></span> Back
                </button>

                {/* Header */}
                <div className="mt-4 bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex gap-4 flex-1 min-w-0">
                            <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 shrink-0"><FaUser size={20} /></span>
                            <div className="min-w-0 flex-1">
                                {isEditing ? (
                                    <input value={editedPatient?.name || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, name: e.target.value } : null)} className="w-full text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0b] bg-[#fcfcfc] border border-black/5 rounded-full px-4 py-1.5 outline-none focus:border-black/15 focus:bg-white" />
                                ) : (
                                    <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0b] truncate">{patient.name}</h1>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium tracking-[-0.01em] text-neutral-600"><FaIdCard size={11} className="text-neutral-400" />{patient._id.slice(-8).toUpperCase()}</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active</span>
                                    {upcomingAppointment && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-medium">Upcoming: {parseAppointmentReason(upcomingAppointment.reason).treatmentName} • {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {!isEditing ? (
                                <button onClick={handleEdit} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/10 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:bg-[#fcfcfc] active:scale-[0.98] transition"><FaEdit size={12} /> Edit</button>
                            ) : (
                                <>
                                    <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition disabled:opacity-50"><FaSave size={12} /> {isSaving ? 'Saving...' : 'Save'}</button>
                                    <button onClick={handleCancel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/10 text-[13px] font-medium text-neutral-700 hover:bg-[#fcfcfc] transition"><FaTimes size={12} /> Cancel</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div className="mt-6 grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[20px] border border-black/5 p-6">
                        <h2 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><span className="w-1 h-4 bg-[#0a0a0b] rounded-full" /> Personal & Contact</h2>
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                            {[
                                { icon: <FaBirthdayCake size={13} />, label: 'Age', value: isEditing ? <input type="number" value={editedPatient?.age || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)} className="w-full h-8 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[13px] font-medium outline-none focus:bg-white focus:border-black/15" /> : `${patient.age} Years` },
                                { icon: <FaVenusMars size={13} />, label: 'Gender', value: isEditing ? <select value={editedPatient?.gender || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, gender: e.target.value } : null)} className="w-full h-8 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[13px] font-medium outline-none focus:bg-white"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select> : (patient.gender || '—') },
                                { icon: <FaPhoneAlt size={13} />, label: 'Contact', value: isEditing ? <input value={editedPatient?.contact || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, contact: e.target.value.replace(/\D/g, '').slice(0, 10) } : null)} className="w-full h-8 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[13px] font-medium outline-none focus:bg-white" placeholder="10 digits" /> : `+91 ${patient.contact}`, span: 'sm:col-span-2' as const },
                                { icon: <FaEnvelope size={13} />, label: 'Email', value: isEditing ? <input type="email" value={editedPatient?.email || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, email: e.target.value } : null)} className="w-full h-8 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[13px] font-medium outline-none focus:bg-white" placeholder="email" /> : (patient.email || '—'), span: 'sm:col-span-2' as const },
                                { icon: <FaMapMarkerAlt size={13} />, label: 'Address', value: isEditing ? <textarea value={editedPatient?.address || ''} onChange={e => setEditedPatient(prev => prev ? { ...prev, address: e.target.value } : null)} rows={2} className="w-full p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 text-[13px] font-medium outline-none focus:bg-white resize-none" /> : (patient.address || '—'), span: 'sm:col-span-2' as const },
                            ].map(card => (
                                <div key={card.label} className={`bg-[#fcfcfc] rounded-2xl border border-black/5 p-4 ${'span' in card ? (card as any).span : ''}`}>
                                    <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500"><span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-600">{card.icon}</span>{card.label}</div>
                                    <div className="mt-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">{card.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-[20px] border border-black/5 p-6">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaHistory size={11} className="text-neutral-400" /> Last Visit</h3>
                            {lastVisit ? (
                                <div className="mt-3 rounded-2xl bg-[#fcfcfc] border border-black/5 p-4">
                                    <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{parseAppointmentReason(lastVisit.treatmentName).treatmentName}</div>
                                    <div className="text-[12px] text-neutral-500 mt-1">{new Date(lastVisit.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · ₹{lastVisit.cost}</div>
                                </div>
                            ) : (
                                <div className="mt-3 rounded-2xl border border-dashed border-black/10 p-6 text-center text-[13px] text-neutral-500">No history yet</div>
                            )}
                        </div>

                        <div className="bg-white rounded-[20px] border border-black/5 p-6">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Medical History</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {isEditing ? (
                                    <div className="w-full space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {editedPatient?.medicalHistory.map(item => (
                                                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-medium">
                                                    {item}
                                                    <button onClick={() => removeTag(item)} className="w-4 h-4 rounded-full bg-white border border-rose-100 grid place-items-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition"><FaTimes size={8} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add condition (e.g. Diabetes)" className="flex-1 h-9 px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px]" />
                                            <button onClick={addTag} className="w-9 h-9 rounded-full bg-[#0a0a0b] text-white grid place-items-center hover:bg-black active:scale-95 transition"><FaPlus size={11} /></button>
                                        </div>
                                    </div>
                                ) : patient.medicalHistory.length ? (
                                    patient.medicalHistory.map(item => <span key={item} className="px-3 py-1.5 rounded-full bg-[#fcfcfc] border border-black/5 text-[12px] font-medium text-neutral-700">{item}</span>)
                                ) : (
                                    <span className="text-[12px] text-neutral-400 border border-dashed border-black/10 rounded-full px-3 py-1.5">No conditions listed</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <PatientHistory patientId={patient._id} records={records} onRefresh={fetchPatientData} isEditingProfile={isEditing} patient={patient} />
                </div>
            </div>
        </div>
    );
}
