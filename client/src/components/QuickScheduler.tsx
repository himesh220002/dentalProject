'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaPlusCircle, FaTrash } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import TreatmentIcon from './TreatmentIcon';

interface Patient { _id: string; name: string; contact: string; }
interface Treatment { _id: string; name: string; price: string; }
interface QuickSchedulerProps {
    isOpen: boolean; onClose: () => void; onSuccess: () => void;
    initialDate?: Date; initialSearch?: string; initialName?: string; initialEmail?: string;
    messageId?: string; appointmentId?: string; inquiryMessage?: string; initialPatientId?: string; skipWhatsApp?: boolean;
}

export default function QuickScheduler({ isOpen, onClose, onSuccess, initialDate, initialSearch, initialName, initialEmail, messageId, appointmentId, inquiryMessage, initialPatientId, skipWhatsApp }: QuickSchedulerProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [density, setDensity] = useState<any>({});
    const [isNewPatientMode, setIsNewPatientMode] = useState(false);
    const [newPatientData, setNewPatientData] = useState({ name: '', contact: '', age: '' });
    const { clinicData, language } = useClinic();
    const t_labels = translations[language] || translations.en;
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, date: e.target.value }); };
    const [closureForm, setClosureForm] = useState<{ isOpen: boolean, type: 'full' | 'partial', startTime: string, endTime: string }>({ isOpen: false, type: 'full', startTime: '10:00', endTime: '20:00' });
    const toggleClosure = async (type: 'full' | 'partial', startTime?: string, endTime?: string) => {
        if (!formData.date) return; setLoading(true);
        try {
            const currentClosuresRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`);
            let closures = currentClosuresRes.data; const newClosure = { date: formData.date, type, startTime, endTime }; closures.push(newClosure);
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`, { closures });
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`); setDensity(res.data);
            setClosureForm({ ...closureForm, isOpen: false }); setStatusMessage({ type: 'success', text: 'Clinic closure added for this date.' });
        } catch { setStatusMessage({ type: 'error', text: 'Failed to add clinic closure.' }); }
        finally { setLoading(false); }
    };
    const removeClosure = async (index: number) => {
        if (!formData.date) return; setLoading(true);
        try {
            const currentClosuresRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`);
            let closures = currentClosuresRes.data; const dateClosures = closures.filter((c: any) => c.date === formData.date); const targetClosure = dateClosures[index];
            const globalIndex = closures.findIndex((c: any) => c.date === targetClosure.date && c.type === targetClosure.type && c.startTime === targetClosure.startTime && c.endTime === targetClosure.endTime);
            if (globalIndex !== -1) closures.splice(globalIndex, 1);
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`, { closures });
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`); setDensity(res.data);
            setStatusMessage({ type: 'success', text: 'Clinic closure removed.' });
        } catch { setStatusMessage({ type: 'error', text: 'Failed to remove clinic closure.' }); }
        finally { setLoading(false); }
    };
    const getTodayDate = () => { const today = new Date(); return today.toISOString().split('T')[0]; };
    const formatTimeForInput = (timeStr: string) => {
        if (!timeStr) return '';
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) { let hours = parseInt(match[1]); const minutes = match[2]; const ampm = match[3].toUpperCase(); if (ampm === 'PM' && hours < 12) hours += 12; if (ampm === 'AM' && hours === 12) hours = 0; return `${hours.toString().padStart(2, '0')}:${minutes}`; }
        return timeStr;
    };
    const [formData, setFormData] = useState({
        patientId: initialPatientId || '', date: initialDate ? initialDate.toISOString().split('T')[0] : getTodayDate(), time: '', selectedTreatments: [] as { name: string, price: number }[], additionalItems: [] as { name: string, price: number }[], notes: ''
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, treatmentsRes] = await Promise.all([axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`), axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`)]);
                setPatients(patientsRes.data); setFilteredPatients(patientsRes.data); setTreatments(treatmentsRes.data);
                if (appointmentId) {
                    const aptRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}`); const apt = aptRes.data; const reason = apt.reason || '';
                    let mainReason = reason; let noteContent = '';
                    const lastOpenParen = reason.lastIndexOf(' ('); if (lastOpenParen !== -1 && reason.endsWith(')')) { mainReason = reason.substring(0, lastOpenParen); noteContent = reason.substring(lastOpenParen + 2, reason.length - 1); }
                    const treatmentNames = mainReason.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    const selected = treatmentNames.map((name: string) => { const t = treatmentsRes.data.find((tr: any) => tr.name.toLowerCase() === name.toLowerCase()); if (t) return { name: t.name, price: parseInt(t.price.replace(/\D/g, '')) }; return { name, price: 0 }; });
                    setFormData({ patientId: apt.patientId?._id || apt.patientId, date: new Date(apt.date).toISOString().split('T')[0], time: formatTimeForInput(apt.time), selectedTreatments: selected.length > 0 ? selected : [{ name: '', price: 0 }], additionalItems: (apt.amount - selected.reduce((s: number, t: any) => s + t.price, 0) > 0) ? [{ name: 'Previous Adjustment', price: apt.amount - selected.reduce((s: number, t: any) => s + t.price, 0) }] : [], notes: noteContent });
                    setSearchTerm(apt.patientId?.name || '');
                } else if (inquiryMessage) {
                    const phoneMatch = patientsRes.data.find((p: any) => { const hasPhone = initialSearch && p.contact.replace(/\D/g, '') === initialSearch.replace(/\D/g, ''); const hasEmail = initialEmail && p.email && p.email.toLowerCase() === initialEmail.toLowerCase(); return hasPhone || hasEmail; });
                    const extractedTreatments: any[] = []; const msgLower = inquiryMessage.toLowerCase();
                    treatmentsRes.data.forEach((t: any) => { const tNameLower = t.name.toLowerCase(); if (msgLower.includes(tNameLower)) extractedTreatments.push({ name: t.name, price: parseInt(t.price.replace(/\D/g, '')) }); });
                    setFormData(prev => ({ ...prev, patientId: phoneMatch?._id || '', selectedTreatments: extractedTreatments.length > 0 ? extractedTreatments : [{ name: '', price: 0 }], notes: prev.notes || inquiryMessage }));
                    if (phoneMatch) { setSearchTerm(phoneMatch.name); setFilteredPatients([phoneMatch]); } else if (initialSearch) setSearchTerm(initialSearch);
                }
            } catch (error) { console.error('Error fetching data:', error); } finally { setFetchingData(false); }
        };
        const fetchDensity = async () => { try { const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`); setDensity(res.data); } catch {} };
        if (isOpen) { fetchData(); fetchDensity(); setClosureForm(prev => ({ ...prev, isOpen: false })); } else { setClosureForm(prev => ({ ...prev, isOpen: false })); }
    }, [isOpen, appointmentId]);
    useEffect(() => {
        if (isOpen) {
            if (initialPatientId) {
                setFormData(prev => ({ ...prev, patientId: initialPatientId }));
                const patient = patients.find(p => p._id === initialPatientId);
                if (patient) { setSearchTerm(patient.name); setFilteredPatients([patient]); }
                else if (initialName) setSearchTerm(initialName);
            } else if (initialSearch && !appointmentId && !inquiryMessage) setSearchTerm(initialSearch);
        }
    }, [isOpen, initialPatientId, initialSearch, initialName, patients, appointmentId, inquiryMessage]);
    useEffect(() => {
        if (!searchTerm) { setFilteredPatients(patients); return; }
        const cleanSearch = searchTerm.replace(/\D/g, '');
        const filtered = patients.filter(p => { const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase()); const cleanContact = p.contact.replace(/\D/g, ''); const matchesContact = cleanSearch !== '' ? cleanContact.includes(cleanSearch) : p.contact.includes(searchTerm); return matchesName || matchesContact; });
        setFilteredPatients(filtered);
    }, [searchTerm, patients]);
    const handleTreatmentChange = (index: number, treatmentName: string) => {
        const treatment = treatments.find(t => t.name === treatmentName);
        const newSelected = [...formData.selectedTreatments];
        if (treatment) { const price = parseInt(treatment.price.replace(/[^0-9]/g, '')) || 0; newSelected[index] = { name: treatmentName, price }; }
        else if (treatmentName === 'Other / General Consultation') { newSelected[index] = { name: treatmentName, price: 100 }; if (!formData.notes) setFormData(prev => ({ ...prev, notes: "COMPLAINT: \nPROCEDURE: \nFINDINGS: \nThe procedure was completed with proper measures. No immediate complications were observed.\nFOLLOW-UP: Routine checkup advised in a week." })); }
        else newSelected[index] = { name: treatmentName, price: 0 };
        setFormData({ ...formData, selectedTreatments: newSelected });
    };
    const addTreatmentRow = () => { setFormData({ ...formData, selectedTreatments: [...formData.selectedTreatments, { name: '', price: 0 }] }); };
    const removeTreatmentRow = (index: number) => { const newSelected = formData.selectedTreatments.filter((_, i) => i !== index); setFormData({ ...formData, selectedTreatments: newSelected }); };
    const basePriceTotal = formData.selectedTreatments.reduce((sum, t) => sum + t.price, 0);
    const additionalItemsTotal = formData.additionalItems.reduce((sum, t) => sum + t.price, 0);
    const totalAmount = basePriceTotal + additionalItemsTotal;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            const finalReason = formData.selectedTreatments.map(t => t.name).filter(name => name !== '').join(', ');
            let currentPatientId = formData.patientId;
            if (isNewPatientMode) {
                const patientRes = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, { ...newPatientData, age: Number(newPatientData.age) || 0, addedByAdmin: true, gender: '', address: '', medicalHistory: [] });
                currentPatientId = patientRes.data._id;
            }
            if (!currentPatientId) { alert('Please select or add a patient'); setLoading(false); return; }
            const payload = { ...formData, patientId: currentPatientId, reason: finalReason + (formData.notes ? ` (${formData.notes})` : ''), amount: totalAmount, contactId: messageId };
            let res; if (appointmentId) res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}`, payload); else res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`, payload);
            if (res.data.emailSentTo) setStatusMessage({ type: 'success', text: `Success! Confirmation sent to ${res.data.emailSentTo}. Record ID: ${currentPatientId.slice(-8).toUpperCase()}` });
            else setStatusMessage({ type: 'success', text: `Success! Appointment booked. Record ID: ${currentPatientId.slice(-8).toUpperCase()}` });
            let whatsappPatient = patients.find(p => p._id === currentPatientId);
            if (isNewPatientMode && !whatsappPatient) whatsappPatient = { _id: currentPatientId, name: newPatientData.name, contact: newPatientData.contact };
            if (whatsappPatient && !skipWhatsApp) {
                const patientPhone = whatsappPatient.contact;
                const clinicName = clinicData?.clinicName || "ToothOp"; const clinicAddress = clinicData?.address;
                const fullAddress = clinicAddress ? `${clinicAddress.street}, ${clinicAddress.city}, ${clinicAddress.state} - ${clinicAddress.zip}` : "Katihar, Bihar";
                const date = formData.date; const time = formData.time;
                const mapsLink = (clinicData?.address?.latitude && clinicData?.address?.longitude) ? `https://www.google.com/maps/search/?api=1&query=${clinicData.address.latitude},${clinicData.address.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicName + " " + (clinicAddress?.city || ""))}`;
                const message = `*Appointment Confirmed!* 🦷\n\nDear ${whatsappPatient.name},\nYour appointment at *${clinicName}* has been scheduled successfully.\n\n*Treatment:* ${finalReason}\n*Date:* ${date}\n*Time:* ${time}\n\n*Location:* ${fullAddress}\n*Google Maps:* ${mapsLink}\n\n*Record ID:* ${currentPatientId.slice(-8).toUpperCase()}\n_(Use this ID to link your history on our website Profile page)_\n\nSee you soon!`;
                const whatsappUrl = `https://wa.me/91${patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`; window.open(whatsappUrl, '_blank');
                const staffPhone = clinicData?.staffPhone || clinicData?.phone || "8105542318";
                const staffMessage = `*New Booking Alert!* 🦷\n\nPatient: ${whatsappPatient.name}\nDate: ${date}\nTime: ${time}\nReason: ${finalReason}`;
                const staffWhatsappUrl = `https://wa.me/91${staffPhone.replace(/\D/g, '')}?text=${encodeURIComponent(staffMessage)}`; setTimeout(() => { window.open(staffWhatsappUrl, '_blank'); }, 2000);
            }
            setTimeout(() => { onSuccess(); onClose(); setStatusMessage(null); }, res.data.emailSentTo ? 3000 : (skipWhatsApp ? 500 : 2500));
            setFormData({ patientId: '', date: getTodayDate(), time: '', selectedTreatments: [], additionalItems: [], notes: '' }); setSearchTerm('');
        } catch (error) { console.error('Error handling appointment:', error); alert('Failed to process appointment.'); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;

    const selectedPatient = patients.find(p => p._id === formData.patientId);

    return (
        <div className="fixed inset-0 z-[100] bg-[#fcfcfc] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-[64px] bg-white border-b border-black/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 hover:bg-black hover:text-white hover:border-black transition"><FaTimes size={14} /></button>
                    <div>
                        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><FaCalendarAlt size={13} className="text-neutral-500" /> Quick Scheduler</h1>
                        <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500 hidden sm:block">{appointmentId ? 'Reschedule Appointment' : 'New Appointment — Schedule with clarity'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium text-neutral-600">{formData.date} {formData.time && `· ${formData.time}`}</span>
                    <span className="hidden lg:inline-flex text-[11px] font-medium px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">₹{totalAmount.toLocaleString()} estimated</span>
                </div>
            </div>

            {statusMessage && (
                <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-white border border-black/5 rounded-[16px] p-4 flex items-center gap-3 shadow-sm">
                    <span className={`w-8 h-8 rounded-full grid place-items-center ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}><FaCheck size={12} /></span>
                    <span className="text-[13px] font-medium text-[#0a0a0b]">{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 grid lg:grid-cols-3 gap-6">
                    {/* Left — main form */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Patient */}
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaUser size={11} /> Patient</h3>
                                <button type="button" onClick={() => { setIsNewPatientMode(!isNewPatientMode); if (isNewPatientMode) setNewPatientData({ name: '', contact: '', age: '' }); else { setFormData({ ...formData, patientId: '' }); setSearchTerm(''); } }} className={`px-3 py-1 rounded-full text-[11px] font-medium border transition ${isNewPatientMode ? 'bg-[#0a0a0b] text-white border-black' : 'bg-white border-black/10 text-neutral-700 hover:border-black/15'}`}>{isNewPatientMode ? 'Use Existing' : '+ New Patient'}</button>
                            </div>

                            {!isNewPatientMode ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                                        <input type="text" placeholder="Search by name or phone" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[44px] pl-9 pr-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium placeholder:text-neutral-400" />
                                    </div>
                                    <div className="relative">
                                        <select required={!isNewPatientMode} value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium appearance-none">
                                            <option value="">Select patient ({filteredPatients.length} results)</option>
                                            {filteredPatients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.contact}</option>)}
                                        </select>
                                        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" size={11} />
                                    </div>
                                    {selectedPatient && (
                                        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#f5f5f3] border border-black/5 text-[13px]">
                                            <span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-700"><FaUser size={11} /></span>
                                            <span className="font-medium tracking-[-0.01em] text-[#0a0a0b]">{selectedPatient.name}</span>
                                            <span className="text-neutral-500">· {selectedPatient.contact}</span>
                                            <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-white border border-black/5 font-medium">{selectedPatient._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <input required placeholder="Full name" value={newPatientData.name} onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })} className="h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium" />
                                    <input required placeholder="Phone (10 digits)" value={newPatientData.contact} onChange={(e) => setNewPatientData({ ...newPatientData, contact: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium" />
                                    <input placeholder="Age (optional)" type="number" value={newPatientData.age} onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })} className="h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium" />
                                </div>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 sm:p-6">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaCalendarAlt size={11} /> Date & Time</h3>
                            <div className="mt-3 grid sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <input type="date" value={formData.date} onChange={handleDateChange} className="w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium" />
                                </div>
                                <div className="relative">
                                    <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={11} />
                                    <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full h-[44px] pl-9 pr-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium" />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                {[...Array(12)].map((_, i) => {
                                    const d = new Date(); d.setDate(d.getDate() + i); const dateStr = d.toISOString().split('T')[0]; const isSelected = formData.date === dateStr; const dateData = density[dateStr]; const isClosed = dateData?.closed; const isBusy = (dateData?.count || 0) > 7;
                                    return (
                                        <button key={dateStr} type="button" onClick={() => setFormData({ ...formData, date: dateStr })} className={`shrink-0 w-[72px] py-2.5 rounded-2xl border flex flex-col items-center gap-0.5 transition ${isSelected ? 'bg-[#0a0a0b] text-white border-black' : isClosed ? 'bg-rose-50 border-rose-100 text-rose-700 opacity-60' : isBusy ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-white border-black/5 hover:border-black/10'}`}>
                                            <span className={`text-[10px] tracking-[0.08em] uppercase font-medium ${isSelected ? 'text-white/60' : 'text-neutral-500'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className={`text-[14px] font-semibold ${isSelected ? 'text-white' : 'text-[#0a0a0b]'}`}>{d.getDate()}</span>
                                            <span className={`text-[10px] ${isSelected ? 'text-white/60' : 'text-neutral-400'}`}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Heat map */}
                            {formData.date && (
                                <div className="mt-4 rounded-2xl border border-black/5 bg-[#fcfcfc] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Day heat map — {formData.date}</span>
                                        {density[formData.date]?.closed ? <span className="text-[11px] px-2 py-1 rounded-full bg-rose-500 text-white font-medium">Closed</span> : (density[formData.date]?.count || 0) > 7 ? <span className="text-[11px] px-2 py-1 rounded-full bg-amber-500 text-white font-medium">Busy</span> : <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500 text-white font-medium">Available</span>}
                                    </div>
                                    {density[formData.date]?.closed ? (
                                        <div className="mt-3 h-16 rounded-xl bg-rose-50 border border-rose-100 grid place-items-center text-rose-700 text-[12px] font-medium">No appointments — clinic closed</div>
                                    ) : (
                                        <div className="mt-3 grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                                            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                                                const booked = (density[formData.date]?.slots || []).some((s: string) => parseInt(s.split(':')[0]) === hour);
                                                const closures = density[formData.date]?.closures || [];
                                                const isClosed = closures.some((c: any) => c.type === 'full' || (c.type === 'partial' && hour >= parseInt(c.startTime.split(':')[0]) && hour < parseInt(c.endTime.split(':')[0])));
                                                const isSelected = formData.time.startsWith(hour.toString().padStart(2, '0'));
                                                let cls = 'bg-white border-black/5 text-neutral-700 hover:border-black/10';
                                                if (isClosed) cls = 'bg-rose-50 border-rose-100 text-rose-700 opacity-60 cursor-not-allowed';
                                                else if (booked) cls = 'bg-[#0a0a0b] border-black text-white';
                                                if (isSelected) cls = 'bg-[#0a0a0b] text-white border-black ring-2 ring-black';
                                                return (
                                                    <button key={hour} type="button" disabled={isClosed} onClick={() => !isClosed && setFormData({ ...formData, time: `${hour.toString().padStart(2, '0')}:00` })} className={`h-10 rounded-xl border flex flex-col items-center justify-center transition ${cls}`}>
                                                        <span className="text-[11px] font-semibold leading-none">{hour > 12 ? hour - 12 : hour}</span>
                                                        <span className="text-[9px] uppercase leading-none opacity-60">{hour >= 12 ? 'pm' : 'am'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {density[formData.date]?.closures?.map((c: any, idx: number) => (
                                            <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-medium">
                                                {c.type === 'full' ? 'Full day closed' : `${c.startTime}–${c.endTime} closed`}
                                                <button type="button" onClick={() => removeClosure(idx)} className="w-5 h-5 rounded-full bg-white border border-rose-100 grid place-items-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition"><FaTrash size={9} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    {closureForm.isOpen ? (
                                        <div className="mt-3 p-3 rounded-2xl bg-white border border-black/5 space-y-3">
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setClosureForm({ ...closureForm, type: 'full' })} className={`flex-1 h-8 rounded-full text-[11px] font-medium border ${closureForm.type === 'full' ? 'bg-[#0a0a0b] text-white border-black' : 'bg-white border-black/5'}`}>Full day</button>
                                                <button type="button" onClick={() => setClosureForm({ ...closureForm, type: 'partial' })} className={`flex-1 h-8 rounded-full text-[11px] font-medium border ${closureForm.type === 'partial' ? 'bg-[#0a0a0b] text-white border-black' : 'bg-white border-black/5'}`}>Partial</button>
                                            </div>
                                            {closureForm.type === 'partial' && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="time" value={closureForm.startTime} onChange={e => setClosureForm({ ...closureForm, startTime: e.target.value })} className="h-9 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[12px] outline-none" />
                                                    <input type="time" value={closureForm.endTime} onChange={e => setClosureForm({ ...closureForm, endTime: e.target.value })} className="h-9 px-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[12px] outline-none" />
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setClosureForm({ ...closureForm, isOpen: false })} className="flex-1 h-8 rounded-full bg-white border border-black/5 text-[11px] font-medium">Cancel</button>
                                                <button type="button" onClick={() => toggleClosure(closureForm.type, closureForm.startTime, closureForm.endTime)} className="flex-1 h-8 rounded-full bg-[#0a0a0b] text-white text-[11px] font-medium">Save closure</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setClosureForm({ ...closureForm, isOpen: true })} className="mt-3 w-full h-9 rounded-full bg-white border border-black/5 text-[12px] font-medium hover:border-black/10">Mark day as closed / leave</button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Treatments */}
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 sm:p-6">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaNotesMedical size={11} /> Treatments</h3>
                            <div className="mt-3 space-y-2">
                                {formData.selectedTreatments.map((treatment, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <span className="w-8 h-8 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 shrink-0"><TreatmentIcon treatmentName={treatment.name} className="text-[14px]" /></span>
                                        <select required aria-label="Select Treatment" value={treatment.name} onChange={(e) => handleTreatmentChange(index, e.target.value)} className="flex-1 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium">
                                            <option value="">Add treatment...</option>
                                            {treatments.map(t => <option key={t._id} value={t.name}>{(t_labels as any).treatmentNames?.[t.name] || t.name}</option>)}
                                            <option value="Other / General Consultation">{t_labels.treatmentNames?.['Other / General Consultation'] || 'Other / General Consultation'}</option>
                                        </select>
                                        <button type="button" onClick={() => removeTreatmentRow(index)} className="w-9 h-9 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50 hover:border-rose-100 transition shrink-0"><FaTimes size={11} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addTreatmentRow} className="w-full h-10 rounded-full border border-dashed border-black/10 text-[12px] font-medium text-neutral-600 hover:bg-[#fcfcfc] hover:border-black/15 flex items-center justify-center gap-2"><FaPlusCircle size={11} /> Add Another Treatment</button>
                            </div>
                        </div>

                        {/* Billing */}
                        <div className="bg-white rounded-[20px] border border-black/5 p-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaMoneyBillWave size={11} /> Billing</h3>
                                <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                                <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3"><div className="text-neutral-500">Base</div><div className="font-semibold text-[#0a0a0b] mt-1">₹{basePriceTotal.toLocaleString()}</div></div>
                                <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3">
                                    <label className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Add-on</label>
                                    <select onChange={(e) => {
                                        const val = parseInt((e.target as HTMLSelectElement).value); const sel = e.target as HTMLSelectElement; if (val > 0) { const name = sel.options[sel.selectedIndex].text.split(' (+')[0]; setFormData(prev => ({ ...prev, additionalItems: [...prev.additionalItems, { name, price: val }] })); } sel.value = "0";
                                    }} className="mt-1 w-full h-8 px-3 rounded-full bg-white border border-black/5 text-[11px] font-medium outline-none">
                                        <option value="0">Add kit / item...</option>
                                        <option value="100">Hygiene Kit (+ ₹100)</option>
                                        <option value="200">Surgery Kit (+ ₹200)</option>
                                        <option value="300">X-Ray (+ ₹300)</option>
                                        <option value="150">Anesthesia (+ ₹150)</option>
                                    </select>
                                </div>
                            </div>
                            {(formData.selectedTreatments.length > 0 || formData.additionalItems.length > 0) && (
                                <div className="mt-3 pt-3 border-t border-black/5 space-y-1">
                                    {formData.selectedTreatments.filter(t => t.name).map((t, i) => <div key={i} className="flex justify-between text-[12px]"><span className="text-neutral-600">{t.name}</span><span className="font-medium text-[#0a0a0b]">₹{t.price}</span></div>)}
                                    {formData.additionalItems.map((it, i) => (
                                        <div key={i} className="flex justify-between items-center text-[12px]">
                                            <span className="text-neutral-600 flex items-center gap-2">{it.name} <button type="button" onClick={() => setFormData(prev => ({ ...prev, additionalItems: prev.additionalItems.filter((_, idx) => idx !== i) }))} className="w-5 h-5 rounded-full bg-white border border-black/5 grid place-items-center text-rose-500 hover:bg-rose-50"><FaTimes size={8} /></button></span>
                                            <span className="font-medium text-[#0a0a0b]">₹{it.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4">
                                <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Clinical notes</div>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Complaint, findings, procedure..." rows={3} className="mt-2 w-full p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] leading-6 resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Right — summary */}
                    <div className="space-y-4 lg:sticky lg:top-6 self-start">
                        <div className="bg-white rounded-[20px] border border-black/5 p-5">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Summary</h3>
                            <div className="mt-3 space-y-2 text-[13px]">
                                <div className="flex justify-between"><span className="text-neutral-500">Patient</span><span className="font-medium text-[#0a0a0b]">{isNewPatientMode ? (newPatientData.name || 'New patient') : (selectedPatient?.name || '—')}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Date</span><span className="font-medium text-[#0a0a0b]">{formData.date || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Time</span><span className="font-medium text-[#0a0a0b]">{formData.time || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Treatments</span><span className="font-medium text-[#0a0a0b] text-right max-w-[160px] truncate">{formData.selectedTreatments.filter(t => t.name).map(t => t.name).join(', ') || '—'}</span></div>
                                <div className="pt-2 mt-2 border-t border-black/5 flex justify-between text-[13px] font-semibold tracking-[-0.01em]"><span>Total</span><span>₹{totalAmount.toLocaleString()}</span></div>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0b] rounded-[20px] p-5 text-white">
                            <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">Confirm</div>
                            <p className="text-[12px] leading-5 text-white/60 mt-1">WhatsApp confirmation will be sent to patient and staff after scheduling.</p>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <button type="button" onClick={onClose} className="h-10 rounded-full bg-white/10 border border-white/15 text-white text-[13px] font-medium hover:bg-white/15">Cancel</button>
                                <button type="submit" disabled={loading} onClick={handleSubmit as any} className="h-10 rounded-full bg-white text-[#0a0a0b] text-[13px] font-medium hover:bg-neutral-100 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /> : <><FaCheck size={11} /> {appointmentId ? 'Update' : 'Schedule'}</>}
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] leading-5 text-neutral-500 text-center">By scheduling, you agree to notify patient via WhatsApp.</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
