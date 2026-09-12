'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../../context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaHistory, FaCheckCircle, FaExclamationCircle, FaLock, FaEye } from 'react-icons/fa';
import SessionGuard from '@/components/SessionGuard';
import { parseAppointmentReason, cleanNotes } from '@/utils/appointmentUtils';
import { io } from 'socket.io-client';
import SuperfineReport from '@/components/reports/SuperfineReport';

const CLINIC_DRUGS = [
    { name: 'Lidocaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Articaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Mepivacaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Adrenaline w/ Anesthetic', instruction: 'Administered to reduce bleeding/prolong anesthesia' },
    { name: 'Ketorol-DT (In-Clinic)', instruction: 'Single dose for immediate pain relief' },
    { name: 'Amoxicillin (Prophylactic)', instruction: 'Single 2g dose administered pre-procedure' },
    { name: 'Augmentin (Prophylactic)', instruction: 'Single 1.2g dose administered pre-procedure' },
    { name: 'Diclofenac Injection', instruction: 'Administered for severe swelling' }
];
const HOME_DRUGS = [
    { name: 'Amoxicillin 500mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Ibuprofen 400mg', instruction: '1 Morning, 1 Night (After food) - Take only if pain persists' },
    { name: 'Paracetamol 500mg', instruction: '1 Morning, 1 Afternoon, 1 Night - Take only if needed' },
    { name: 'Metronidazole 400mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Chlorhexidine Mouthwash', instruction: 'Rinse 10ml twice daily for 7 days (Do not swallow)' },
    { name: 'Zerodol-SP', instruction: '1 Morning, 1 Night (After food) for 3 days' },
    { name: 'Augmentin 625mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Ketorol-DT', instruction: 'Dissolve 1 tablet in half cup water (Only for severe pain)' },
    { name: 'Azee 500mg', instruction: '1 Morning (1 hour before food) for 3 days' },
    { name: 'Pantoprazole 40mg', instruction: '1 Morning (Empty stomach) for 5 days' },
    { name: 'Limcee 500mg', instruction: 'Chew 1 tablet daily for 15 days' }
];

interface Patient { _id: string; name: string; age: number; gender: string; contact: string; email: string; address: string; alternateContact: string; addedByAdmin: boolean; createdAt: string; }

export default function ProfilePage() {
    const { data: session } = useSession();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});
    const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);
    const [allAppointments, setAllAppointments] = useState<any[]>([]);
    const [isAptModalOpen, setIsAptModalOpen] = useState(false);
    const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
    const [linkingId, setLinkingId] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [reportView, setReportView] = useState<{ patient: any, record: any } | null>(null);
    const [formData, setFormData] = useState({ name: '', age: 0, gender: '', address: '', contact: '', alternateContact: '' });

    const handleLinkRecord = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!linkingId.trim()) return;
        setIsLinking(true); setError(null); setSuccess(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.post(`${backendUrl}/api/auth/link-patient`, { // @ts-ignore
                userId: session?.user?.id, patientRecordId: linkingId.trim() });
            if (res.data.patient) {
                setPatient(res.data.patient);
                setFormData({ name: res.data.patient.name || '', age: res.data.patient.age || 0, gender: res.data.patient.gender || '', address: res.data.patient.address || '', contact: res.data.patient.contact === '' ? '' : (res.data.patient.contact || ''), alternateContact: res.data.patient.alternateContact || '' });
                const recordsRes = await axios.get(`${backendUrl}/api/treatment-records/patient/${res.data.patient._id}`);
                setRecords(recordsRes.data);
            }
            setSuccess('Clinical records connected successfully!'); setIsLinkingModalOpen(false); setLinkingId('');
        } catch (err: any) { setError(err.response?.data?.message || 'Failed to connect records.'); }
        finally { setIsLinking(false); }
    };
    useEffect(() => { if (records.length > 0) setExpandedRecords(prev => ({ [records[0]._id]: true, ...prev })); }, [records]);
    const toggleExpand = (id: string) => setExpandedRecords(prev => ({ ...prev, [id]: !prev[id] }));
    const renderPrescriptionLine = (line: string, colorClass: string) => {
        const match = line.match(/^([^-]*-?\s*)([^(\n]+)(\(.*\))?$/);
        if (!match) return <p className={`text-[13px] font-medium ${colorClass} leading-relaxed`}>{line}</p>;
        const prefix = match[1]; const medName = match[2]; const instructions = match[3] || "";
        return <p className="text-[13px] font-medium leading-relaxed"><span className="text-neutral-400">{prefix}</span><span className={colorClass}>{medName}</span><span className="text-[#0a0a0b]">{instructions}</span></p>;
    };
    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user) return;
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                // @ts-ignore
                const res = await axios.get(`${backendUrl}/api/auth/google/${session.user.id}`);
                const userData = res.data;
                if (userData.patientId) {
                    setPatient(userData.patientId);
                    setFormData({ name: userData.patientId.name || '', age: userData.patientId.age || 0, gender: userData.patientId.gender || '', address: userData.patientId.address || '', contact: userData.patientId.contact === '' ? '' : (userData.patientId.contact || ''), alternateContact: userData.patientId.alternateContact || '' });
                }
            } catch (err) { console.error('Error fetching profile:', err); setError('Failed to load profile data.'); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [session]);
    useEffect(() => {
        const fetchRecordsAndAppointments = async () => {
            if (!patient?._id) return;
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                const recordsRes = await axios.get(`${backendUrl}/api/treatment-records/patient/${patient._id}`); setRecords(recordsRes.data);
                const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patient._id}`); const allApts = aptRes.data;
                const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
                const sortedApts = allApts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()); setAllAppointments(sortedApts);
                const nextApt = sortedApts.find((apt: any) => { const aptDate = new Date(apt.date); return aptDate >= startOfToday && !['Completed', 'Operating'].includes(apt.status) && !apt.isTicked; }); setUpcomingAppointment(nextApt);
            } catch (err) { console.error('Error fetching patient data:', err); }
        };
        fetchRecordsAndAppointments();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl);
        socket.on('newAppointment', (data) => { if (data.patientId === patient?._id) fetchRecordsAndAppointments(); });
        socket.on('updateAppointment', (data) => { if (data.patientId === patient?._id) fetchRecordsAndAppointments(); });
        return () => { socket.disconnect(); };
    }, [patient]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null); setSuccess(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.put(`${backendUrl}/api/auth/update-profile`, { // @ts-ignore
                userId: session?.user?.id, ...formData });
            if (res.data.patient) {
                setPatient(res.data.patient);
                setFormData({ name: res.data.patient.name || '', age: res.data.patient.age || 0, gender: res.data.patient.gender || '', address: res.data.patient.address || '', contact: res.data.patient.contact === '' ? '' : (res.data.patient.contact || ''), alternateContact: res.data.patient.alternateContact || '' });
            }
            setSuccess(res.data.message || 'Profile updated successfully!'); setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) { setError(err.response?.data?.message || 'Failed to update profile.'); }
        finally { setSaving(false); }
    };
    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        setSaving(true); setError(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            await axios.delete(`${backendUrl}/api/appointments/${id}`); setSuccess('Appointment cancelled successfully.');
            if (patient?._id) { const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patient._id}`); setAllAppointments(aptRes.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())); }
        } catch (err: any) { setError(err.response?.data?.message || 'Failed to cancel appointment.'); }
        finally { setSaving(false); }
    };
    const isCancellable = (date: string, time: string) => {
        const aptDateTime = new Date(date); const [hours, minutes] = time.split(':').map(Number); aptDateTime.setHours(hours, minutes, 0, 0); const now = new Date(); const diffInMs = aptDateTime.getTime() - now.getTime(); return (diffInMs / (1000 * 60 * 60)) >= 3;
    };

    if (loading) return <div className="min-h-[60vh] bg-[#fcfcfc] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    return (
        <SessionGuard>
            <div className="bg-[#fcfcfc] min-h-screen pb-12">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    {/* Header */}
                    <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                        <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex gap-4 flex-1 min-w-0">
                                <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 shrink-0"><FaUser size={20} /></span>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0b] truncate">{formData.name || session?.user?.name}</h1>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Patient</span>
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f3] border border-black/5 text-neutral-600">Patient Portal</span>
                                        <span className="text-neutral-400">Member since {patient?.createdAt ? new Date(patient.createdAt).getFullYear() : new Date().getFullYear()}</span>
                                        {patient?._id && <span className="font-mono text-[11px] bg-[#f5f5f3] border border-black/5 px-2 py-1 rounded-full">ID: {patient._id.slice(-8).toUpperCase()}</span>}
                                    </div>
                                    <div className="text-[11px] text-neutral-500 mt-1 truncate">{session?.user?.email}</div>
                                </div>
                            </div>
                            {upcomingAppointment && (
                                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 shrink-0">
                                    <span className="w-9 h-9 rounded-xl bg-white border border-amber-100 text-amber-600 grid place-items-center"><FaCalendarAlt size={12} /></span>
                                    <div>
                                        <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-amber-700">Your Fixed Appointment</div>
                                        <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{parseAppointmentReason(upcomingAppointment.reason).treatmentName} • {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="mt-6 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 sm:p-8">
                        {error && <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-medium flex items-center gap-2"><FaExclamationCircle size={13} />{error}</div>}
                        {success && <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] font-medium flex items-center gap-2"><FaCheckCircle size={13} />{success}</div>}

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Personal Information</h2>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Full Name</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" required className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                </div>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Age</label>
                                    <div className="relative mt-1">
                                        <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} placeholder="Your age" required className="w-full h-[44px] px-4 pr-12 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-400">Years</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium">
                                        <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Email</label>
                                    <div className="mt-1 h-[44px] px-4 rounded-full bg-[#f5f5f3] border border-black/5 flex items-center gap-2 text-[13px] text-neutral-500"><FaEnvelope size={12} className="text-neutral-400" />{session?.user?.email}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Contact & Location</h2>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Primary Contact</label>
                                    <input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="Your primary phone number" required className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                </div>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Alternate Contact</label>
                                    <input value={formData.alternateContact} onChange={e => setFormData({ ...formData, alternateContact: e.target.value })} placeholder="Emergency/Alternate number" className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                </div>
                                <div>
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Residential Address</label>
                                    <textarea rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Your full address" className="mt-1 w-full p-4 rounded-[20px] bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium resize-none" />
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/5">
                                <span className="text-[12px] text-neutral-500">Your information is used only for clinical purposes and is never shared.</span>
                                <button type="submit" disabled={saving} className="w-full sm:w-auto px-8 h-[44px] rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Clinical History */}
                    <div className="mt-6 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaHistory size={12} /></span> Clinical History</h2>
                            {upcomingAppointment ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Fixed: {parseAppointmentReason(upcomingAppointment.reason).treatmentName} • {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}</span>
                            ) : (
                                <a href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium hover:bg-black">Book New Appointment</a>
                            )}
                        </div>

                        {records.length ? (
                            <div className="space-y-3">
                                {records.map(record => (
                                    <div key={record._id} className="rounded-[20px] border border-black/5 overflow-hidden">
                                        <button onClick={() => toggleExpand(record._id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fcfcfc] transition text-left">
                                            <div>
                                                <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1">{parseAppointmentReason(record.treatmentName).treatmentName}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); if (patient) setReportView({ patient, record }); }} className="w-6 h-6 rounded-full bg-white border border-black/5 text-neutral-600 grid place-items-center hover:bg-[#fcfcfc] hover:border-black/10" title="View Report"><FaEye size={10} /></button>
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${record.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{record.paymentStatus}</span>
                                                <span className="text-[11px] font-semibold text-[#0a0a0b]">₹{record.cost}</span>
                                                <span className={`w-6 h-6 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-500 transition-transform ${expandedRecords[record._id] ? 'rotate-180' : ''}`}>⌄</span>
                                            </div>
                                        </button>
                                        {expandedRecords[record._id] && (
                                            <div className="px-5 pb-5 pt-2 grid md:grid-cols-2 gap-4 border-t border-black/5 bg-[#fcfcfc]/50">
                                                <div className="bg-white rounded-2xl border border-black/5 p-4">
                                                    <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Diagnosis / Notes</div>
                                                    <p className="text-[13px] leading-6 text-neutral-700 mt-2 italic">{cleanNotes(record.notes) || 'General consultation'}</p>
                                                </div>
                                                <div className="bg-white rounded-2xl border border-black/5 p-4">
                                                    <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Prescription</div>
                                                    <div className="mt-2 space-y-1">
                                                        {record.prescription ? record.prescription.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => {
                                                            const isClinic = CLINIC_DRUGS.some(d => line.toLowerCase().includes(d.name.toLowerCase()));
                                                            return <div key={i} className="flex gap-2 text-[13px]">{renderPrescriptionLine(line, isClinic ? 'text-violet-600' : 'text-emerald-600')}{isClinic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 font-medium shrink-0">clinic</span>}</div>;
                                                        }) : <span className="text-[13px] text-neutral-400 italic">No medicines prescribed</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center">
                                <span className="w-10 h-10 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-400"><FaHistory size={14} /></span>
                                <div className="text-[13px] font-medium text-[#0a0a0b] mt-3">No records found</div>
                                <p className="text-[12px] text-neutral-500 mt-1 max-w-sm mx-auto">Your clinical history will appear here after your first treatment session.</p>
                                <button onClick={() => setIsLinkingModalOpen(true)} className="mt-4 px-4 py-2 rounded-full bg-white border border-black/5 text-[12px] font-medium hover:border-black/10">Connect My Clinical History</button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 text-center">
                            <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-700"><FaHistory size={14} /></span>
                            <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-3">Health History</div>
                            <div className="text-[11px] text-neutral-500 mt-1">{records.length} Records</div>
                        </div>
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 text-center">
                            <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-700"><FaCalendarAlt size={14} /></span>
                            <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-3">Appointments</div>
                            <button onClick={() => setIsAptModalOpen(true)} className="mt-1 text-[11px] font-medium text-[#0a0a0b] underline underline-offset-4">View All</button>
                        </div>
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 text-center">
                            <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-700"><FaLock size={14} /></span>
                            <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-3">Account Status</div>
                            <span className="mt-1 inline-block px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium">Verified</span>
                        </div>
                    </div>
                </div>

                {/* Linking Modal */}
                {isLinkingModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <form onSubmit={handleLinkRecord} className="bg-white rounded-[20px] border border-black/5 p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Connect Clinical History</h3>
                            <p className="text-[12px] leading-5 text-neutral-500 mt-1">Enter your Patient Record ID from WhatsApp booking message.</p>
                            <input value={linkingId} onChange={e => setLinkingId(e.target.value)} placeholder="e.g. PAT12345" className="mt-4 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                            <div className="mt-4 flex gap-2">
                                <button type="button" onClick={() => setIsLinkingModalOpen(false)} className="flex-1 h-10 rounded-full bg-white border border-black/5 text-[13px] font-medium">Cancel</button>
                                <button disabled={isLinking} className="flex-1 h-10 rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium disabled:opacity-50">{isLinking ? 'Connecting...' : 'Connect'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Appointments Modal */}
                {isAptModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[20px] border border-black/5 w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
                            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                                <div>
                                    <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Appointments History</div>
                                    <div className="text-[11px] text-neutral-500">Manage your visits</div>
                                </div>
                                <button onClick={() => setIsAptModalOpen(false)} className="w-8 h-8 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-600 hover:bg-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {allAppointments.length ? allAppointments.map((apt: any) => (
                                    <div key={apt._id} className="flex items-center gap-3 p-3 rounded-2xl border border-black/5 bg-[#fcfcfc]">
                                        <span className="w-10 h-12 rounded-xl bg-white border border-black/5 grid place-items-center text-center shrink-0">
                                            <span className="block text-[10px] tracking-[0.08em] uppercase font-medium text-neutral-500">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="block text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{new Date(apt.date).getDate()}</span>
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] truncate">{parseAppointmentReason(apt.reason).treatmentName}</div>
                                            <div className="text-[11px] text-neutral-500">{apt.time} · <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${apt.status==='Completed'||apt.isTicked?'bg-emerald-50 text-emerald-700 border-emerald-100':apt.status==='Cancelled'?'bg-rose-50 text-rose-700 border-rose-100':'bg-amber-50 text-amber-700 border-amber-100'}`}>{apt.isTicked?'Completed':apt.status}</span></div>
                                        </div>
                                        {apt.status!=='Cancelled' && apt.status!=='Completed' && !apt.isTicked && (isCancellable(apt.date, apt.time) ? <button onClick={() => handleCancel(apt._id)} className="text-[11px] font-medium text-rose-600 hover:underline">Cancel</button> : <span className="text-[10px] text-neutral-400">Not cancellable</span>)}
                                    </div>
                                )) : <div className="py-10 text-center text-[13px] text-neutral-500">No appointment history</div>}
                            </div>
                            <div className="p-4 border-t border-black/5 text-center">
                                <button onClick={() => setIsAptModalOpen(false)} className="w-full h-10 rounded-full bg-[#f5f5f3] border border-black/5 text-[13px] font-medium">Close</button>
                            </div>
                        </div>
                    </div>
                )}
                {reportView && <SuperfineReport patient={reportView.patient} record={reportView.record} onClose={() => setReportView(null)} />}
            </div>
        </SessionGuard>
    );
}
