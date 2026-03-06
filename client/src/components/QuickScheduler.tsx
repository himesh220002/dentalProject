'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaPlusCircle, FaEnvelope, FaLock, FaUnlock, FaTrash } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';

interface Patient {
    _id: string;
    name: string;
    contact: string;
}

interface Treatment {
    _id: string;
    name: string;
    price: string;
}

interface QuickSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
    initialSearch?: string;
    initialName?: string;
    initialEmail?: string;
    messageId?: string;
    appointmentId?: string;
    inquiryMessage?: string;
    initialPatientId?: string;
}

export default function QuickScheduler({ isOpen, onClose, onSuccess, initialDate, initialSearch, initialName, initialEmail, messageId, appointmentId, inquiryMessage, initialPatientId }: QuickSchedulerProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [density, setDensity] = useState<any>({});
    const { clinicData } = useClinic();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, date: e.target.value });
    };

    const [closureForm, setClosureForm] = useState<{ isOpen: boolean, type: 'full' | 'partial', startTime: string, endTime: string }>({
        isOpen: false,
        type: 'full',
        startTime: '10:00',
        endTime: '20:00'
    });

    const toggleClosure = async (type: 'full' | 'partial', startTime?: string, endTime?: string) => {
        if (!formData.date) return;
        setLoading(true);
        try {
            const currentClosuresRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`);
            let closures = currentClosuresRes.data;

            const newClosure = { date: formData.date, type, startTime, endTime };
            closures.push(newClosure);

            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`, { closures });

            // Refresh density
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`);
            setDensity(res.data);
            setClosureForm({ ...closureForm, isOpen: false });
            setStatusMessage({ type: 'success', text: 'Clinic closure added for this date.' });
        } catch (err) {
            console.error('Error adding closure:', err);
            setStatusMessage({ type: 'error', text: 'Failed to add clinic closure.' });
        } finally {
            setLoading(false);
        }
    };

    const removeClosure = async (index: number) => {
        if (!formData.date) return;
        setLoading(true);
        try {
            const currentClosuresRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`);
            let closures = currentClosuresRes.data;

            // Find global index of the closure to remove
            const dateClosures = closures.filter((c: any) => c.date === formData.date);
            const targetClosure = dateClosures[index];

            const globalIndex = closures.findIndex((c: any) =>
                c.date === targetClosure.date &&
                c.type === targetClosure.type &&
                c.startTime === targetClosure.startTime &&
                c.endTime === targetClosure.endTime
            );

            if (globalIndex !== -1) {
                closures.splice(globalIndex, 1);
            }

            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/closures`, { closures });

            // Refresh density
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`);
            setDensity(res.data);
            setStatusMessage({ type: 'success', text: 'Clinic closure removed.' });
        } catch (err) {
            console.error('Error removing closure:', err);
            setStatusMessage({ type: 'error', text: 'Failed to remove clinic closure.' });
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const formatTimeForInput = (timeStr: string) => {
        if (!timeStr) return '';
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2];
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        return timeStr;
    };

    const [formData, setFormData] = useState({
        patientId: initialPatientId || '',
        date: initialDate ? initialDate.toISOString().split('T')[0] : getTodayDate(),
        time: '',
        selectedTreatments: [] as { name: string, price: number }[],
        additionalCost: 0,
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, treatmentsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`)
                ]);
                setPatients(patientsRes.data);
                setFilteredPatients(patientsRes.data);
                setTreatments(treatmentsRes.data);

                if (appointmentId) {
                    const aptRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}`);
                    const apt = aptRes.data;
                    const reason = apt.reason || '';

                    let mainReason = reason;
                    let noteContent = '';

                    const lastOpenParen = reason.lastIndexOf(' (');
                    if (lastOpenParen !== -1 && reason.endsWith(')')) {
                        mainReason = reason.substring(0, lastOpenParen);
                        noteContent = reason.substring(lastOpenParen + 2, reason.length - 1);
                    }

                    const treatmentNames = mainReason.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');

                    const selected = treatmentNames.map((name: string) => {
                        const t = treatmentsRes.data.find((tr: any) => tr.name.toLowerCase() === name.toLowerCase());
                        if (t) {
                            return { name: t.name, price: parseInt(t.price.replace(/\D/g, '')) };
                        }
                        return { name, price: 0 };
                    });

                    setFormData({
                        patientId: apt.patientId?._id || apt.patientId,
                        date: new Date(apt.date).toISOString().split('T')[0],
                        time: formatTimeForInput(apt.time),
                        selectedTreatments: selected.length > 0 ? selected : [{ name: '', price: 0 }],
                        additionalCost: apt.amount - selected.reduce((s: number, t: any) => s + t.price, 0) || 0,
                        notes: noteContent
                    });
                    setSearchTerm(apt.patientId?.name || '');
                } else if (inquiryMessage) {
                    const phoneMatch = patientsRes.data.find((p: any) => {
                        const hasPhone = initialSearch && p.contact.replace(/\D/g, '') === initialSearch.replace(/\D/g, '');
                        const hasEmail = initialEmail && p.email && p.email.toLowerCase() === initialEmail.toLowerCase();
                        return hasPhone || hasEmail;
                    });

                    const extractedTreatments: any[] = [];
                    const msgLower = inquiryMessage.toLowerCase();

                    treatmentsRes.data.forEach((t: any) => {
                        const tNameLower = t.name.toLowerCase();
                        // Match if message contains treatment name OR treatment name contains a significant keyword from message
                        if (msgLower.includes(tNameLower)) {
                            extractedTreatments.push({
                                name: t.name,
                                price: parseInt(t.price.replace(/\D/g, ''))
                            });
                        }
                    });

                    setFormData(prev => ({
                        ...prev,
                        patientId: phoneMatch?._id || '',
                        selectedTreatments: extractedTreatments.length > 0 ? extractedTreatments : [{ name: '', price: 0 }],
                        notes: prev.notes || inquiryMessage // Auto-fill notes with the original inquiry
                    }));

                    if (phoneMatch) {
                        setSearchTerm(phoneMatch.name);
                        setFilteredPatients([phoneMatch]);
                    } else if (initialSearch) {
                        setSearchTerm(initialSearch);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setFetchingData(false);
            }
        };

        const fetchDensity = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=60`);
                setDensity(res.data);
            } catch (err) {
                console.error('Error fetching density:', err);
            }
        };

        if (isOpen) {
            fetchData();
            fetchDensity();
            setClosureForm(prev => ({ ...prev, isOpen: false }));
        } else {
            setClosureForm(prev => ({ ...prev, isOpen: false }));
        }
    }, [isOpen, appointmentId]);

    // Handle initial props and auto-selection
    useEffect(() => {
        if (isOpen) {
            if (initialPatientId) {
                setFormData(prev => ({ ...prev, patientId: initialPatientId }));
                const patient = patients.find(p => p._id === initialPatientId);
                if (patient) {
                    setSearchTerm(patient.name);
                    setFilteredPatients([patient]);
                } else if (initialName) {
                    setSearchTerm(initialName);
                }
            } else if (initialSearch && !appointmentId && !inquiryMessage) {
                setSearchTerm(initialSearch);
            }
        }
    }, [isOpen, initialPatientId, initialSearch, initialName, patients, appointmentId, inquiryMessage]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredPatients(patients);
            return;
        }
        const cleanSearch = searchTerm.replace(/\D/g, '');
        const filtered = patients.filter(p => {
            const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const cleanContact = p.contact.replace(/\D/g, '');
            const matchesContact = cleanSearch !== '' ? cleanContact.includes(cleanSearch) : p.contact.includes(searchTerm);
            return matchesName || matchesContact;
        });
        setFilteredPatients(filtered);
    }, [searchTerm, patients]);

    const handleTreatmentChange = (index: number, treatmentName: string) => {
        const treatment = treatments.find(t => t.name === treatmentName);
        const newSelected = [...formData.selectedTreatments];
        if (treatment) {
            const price = parseInt(treatment.price.replace(/[^0-9]/g, '')) || 0;
            newSelected[index] = { name: treatmentName, price };
        } else if (treatmentName === 'Other / General Consultation') {
            newSelected[index] = { name: treatmentName, price: 100 };
            // Auto-load template for General Consultation
            if (!formData.notes) {
                setFormData(prev => ({
                    ...prev,
                    notes: "COMPLAINT: \nPROCEDURE: \nFINDINGS: \nThe procedure was completed with proper measures. No immediate complications were observed.\nFOLLOW-UP: Routine checkup advised in a week."
                }));
            }
        } else {
            newSelected[index] = { name: treatmentName, price: 0 };
        }
        setFormData({ ...formData, selectedTreatments: newSelected });
    };

    const addTreatmentRow = () => {
        setFormData({
            ...formData,
            selectedTreatments: [...formData.selectedTreatments, { name: '', price: 0 }]
        });
    };

    const removeTreatmentRow = (index: number) => {
        const newSelected = formData.selectedTreatments.filter((_, i) => i !== index);
        setFormData({ ...formData, selectedTreatments: newSelected });
    };

    const basePriceTotal = formData.selectedTreatments.reduce((sum, t) => sum + t.price, 0);
    const totalAmount = basePriceTotal + (Number(formData.additionalCost) || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalReason = formData.selectedTreatments
                .map(t => t.name)
                .filter(name => name !== '')
                .join(', ');

            const payload = {
                ...formData,
                reason: finalReason + (formData.notes ? ` (${formData.notes})` : ''),
                amount: totalAmount,
                contactId: messageId // Pass this for background email tracking
            };

            console.log('🚀 Submitting Appointment Payload:', payload);

            let res;
            if (appointmentId) {
                res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}`, payload);
            } else {
                res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`, payload);
            }

            if (res.data.emailSentTo) {
                setStatusMessage({
                    type: 'success',
                    text: `Success! Confirmation sent to ${res.data.emailSentTo}`
                });
            }

            // WhatsApp Redirect Logic
            const selectedPatient = patients.find(p => p._id === formData.patientId);
            if (selectedPatient) {
                const patientPhone = selectedPatient.contact;
                const clinicName = clinicData?.clinicName || "Dr. Tooth Dental Clinic";
                const clinicAddress = clinicData?.address;
                const fullAddress = clinicAddress
                    ? `${clinicAddress.street}, ${clinicAddress.city}, ${clinicAddress.state} - ${clinicAddress.zip}`
                    : "Katihar, Bihar";

                const date = formData.date;
                const time = formData.time;

                const mapsLink = (clinicData?.address?.latitude && clinicData?.address?.longitude)
                    ? `https://www.google.com/maps/search/?api=1&query=${clinicData.address.latitude},${clinicData.address.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicName + " " + (clinicAddress?.city || ""))}`;

                const message = `*Appointment Confirmed!* ✅\n\nDear ${selectedPatient.name},\nYour appointment at *${clinicName}* has been scheduled successfully.\n\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n📍 *Location:* ${fullAddress}\n🗺️ *Google Maps Link:* ${mapsLink}\n\n*Note:* Please try to arrive 5-10 minutes before your scheduled time.\n\nSee you soon!`;

                const whatsappUrl = `https://wa.me/91${patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }

            setTimeout(() => {
                onSuccess();
                onClose();
                setStatusMessage(null);
            }, res.data.emailSentTo ? 3000 : 500);

            setFormData({
                patientId: '',
                date: getTodayDate(),
                time: '',
                selectedTreatments: [],
                additionalCost: 0,
                notes: ''
            });
            setSearchTerm('');
        } catch (error) {
            console.error('Error handling appointment:', error);
            alert('Failed to process appointment.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickRegister = async () => {
        if (!initialName || !initialSearch) return;
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, {
                name: initialName,
                contact: initialSearch,
                email: initialEmail || '',
                age: 0,
                gender: '-__-',
                address: '-__-',
                medicalHistory: []
            });
            const newPatient = res.data;
            setPatients([...patients, newPatient]);
            setFormData({ ...formData, patientId: newPatient._id });
            setSearchTerm(newPatient.name);
            alert('Patient registered successfully!');
        } catch (error) {
            console.error('Error registering patient:', error);
            alert('Failed to register patient');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-red-500/20 hover:bg-white/20 rounded-full transition">
                        <FaTimes />
                    </button>
                    <h2 className="text-xl sm:text-3xl font-black flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-200" />
                        {appointmentId ? 'Reschedule Appointment' : 'Quick Scheduler'}
                    </h2>
                    <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-2">
                        {appointmentId ? 'Update appointment time & treatments' : 'Configure appointment & charges'}
                    </p>
                </div>

                {statusMessage && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                            <FaCheck size={40} className="animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Appointment Secured!</h3>
                        <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl border border-blue-100 shadow-sm transition-all transform hover:scale-105">
                            <FaEnvelope className="text-xl animate-pulse" />
                            <p className="font-bold text-sm leading-relaxed">
                                {statusMessage.text}
                            </p>
                        </div>
                        <p className="mt-8 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Redirecting to dashboard...</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-2 max-h-[70vh] sm:max-h-[750px] overflow-y-auto custom-scrollbar">
                    {/* Search & Select Patient */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUser size={10} /> Find Patient
                        </label>
                        <div className="relative group">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or phone (10 digits)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-blue-500 transition-colors ${/^\d+$/.test(searchTerm)
                                    ? (searchTerm.length === 10 ? 'text-emerald-600' : 'text-rose-600')
                                    : 'text-gray-800'
                                    }`}
                            />
                        </div>

                        <div className="relative">
                            <select
                                required
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition appearance-none"
                            >
                                <option value="">Select from {filteredPatients.length} results...</option>
                                {filteredPatients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} - {p.contact}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Quick Register for Enquirer */}
                        {!formData.patientId && initialName && (
                            <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">New Enquirer</p>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600 italic">"{initialName}" is not in records</p>
                                </div>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleQuickRegister}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <FaPlusCircle /> {loading ? 'Registering...' : 'Register Now'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FaCalendarAlt size={10} /> Date
                            </label>
                            <input
                                type="date" required value={formData.date}
                                onChange={handleDateChange}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FaClock size={10} /> Time
                            </label>
                            <input
                                type="time" required value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Heat Map Visualization */}
                    {formData.date && (
                        <div className="bg-white p-5 rounded-3xl border-2 border-gray-50 shadow-sm space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    Live Schedule Heat Map: {formData.date}
                                </h3>
                                {density[formData.date]?.closed ? (
                                    <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Doctor on Leave / Clinic Closed</span>
                                ) : (density[formData.date]?.count || 0) > 7 && (
                                    <span className="text-[8px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase">Busy Day</span>
                                )}
                            </div>

                            {density[formData.date]?.closed ? (
                                <div className="h-24 flex flex-col items-center justify-center bg-rose-50 rounded-2xl border-2 border-dashed border-rose-200 text-rose-600">
                                    <FaLock className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Appointments Possible</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                                    {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                                        const bookedSlots = density[formData.date]?.slots || [];
                                        const dayClosures = density[formData.date]?.closures || [];

                                        const now = new Date();
                                        const currentHour = now.getHours();
                                        const isToday = formData.date === getTodayDate();
                                        const isPast = isToday && hour < currentHour;

                                        const isBooked = bookedSlots.some((s: string) => parseInt(s.split(':')[0]) === hour);
                                        const isNextToBooked = bookedSlots.some((s: string) => parseInt(s.split(':')[0]) === hour - 1);
                                        const isClosed = dayClosures.some((c: any) => {
                                            if (c.type === 'full') return true;
                                            if (c.type === 'partial' && c.startTime && c.endTime) {
                                                const start = parseInt(c.startTime.split(':')[0]);
                                                const end = parseInt(c.endTime.split(':')[0]);
                                                return hour >= start && hour < end;
                                            }
                                            return false;
                                        });

                                        const totalCount = density[formData.date]?.count || 0;

                                        let bgColor = 'bg-emerald-50 border-emerald-100';
                                        let textColor = 'text-emerald-700';

                                        if (isPast) {
                                            bgColor = 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed';
                                            textColor = 'text-gray-400/20';
                                        } else if (isClosed) {
                                            bgColor = 'bg-rose-100 border-rose-200 opacity-50 cursor-not-allowed';
                                            textColor = 'text-rose-600';
                                        } else if (isBooked) {
                                            bgColor = totalCount >= 8 ? 'bg-rose-500 border-rose-600 text-white' :
                                                totalCount >= 6 ? 'bg-amber-400 border-amber-500 text-amber-900' :
                                                    'bg-gray-500 border-emerald-600 text-white';
                                            textColor = 'text-white';
                                        } else if (isNextToBooked) {
                                            bgColor = 'bg-blue-100 border-blue-200';
                                            textColor = 'text-blue-500';
                                        } else if (hour === 13) { // Break Time
                                            bgColor = 'bg-gray-100 border-gray-200';
                                            textColor = 'text-gray-400';
                                        }

                                        return (
                                            <div
                                                key={hour}
                                                className={`h-12 flex flex-col items-center justify-center rounded-xl border transition-all relative ${bgColor} ${(hour === 13 && !isClosed && !isPast) ? 'opacity-50' : ''}`}
                                                title={`${hour}:00 ${isBooked ? '(Booked)' : ''} ${isClosed ? '(Closed)' : ''} ${isPast ? '(Past)' : ''}`}
                                            >
                                                {isPast && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-30">
                                                        <FaTimes size={30} />
                                                    </div>
                                                )}
                                                <span className={`text-[9px] font-black ${textColor}`}>{hour > 12 ? hour - 12 : hour}</span>
                                                <span className={`text-[7px] font-bold uppercase ${textColor}`}>{hour >= 12 ? 'pm' : 'am'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!density[formData.date]?.closed && (
                                <div className="flex flex-wrap gap-4 pt-1">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-gray-400"></div><span className="text-[8px] font-black text-gray-400 uppercase">Booked</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-blue-300"></div><span className="text-[8px] font-black text-gray-400 uppercase">Buffer</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500"></div><span className="text-[8px] font-black text-gray-400 uppercase">Tight Marking</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-gray-100"></div><span className="text-[8px] font-black text-gray-400 uppercase">Break</span></div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {density[formData.date]?.closures?.map((c: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-100">
                                        <div className="flex items-center gap-3">
                                            <FaLock className="text-rose-600" />
                                            <div>
                                                <p className="text-xs font-black text-rose-900 uppercase tracking-widest">
                                                    {c.type === 'full' ? 'Full Day Closed' : `Closed: ${c.startTime} - ${c.endTime}`}
                                                </p>
                                                {c.notes && <p className="text-[10px] text-rose-700 font-bold">{c.notes}</p>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeClosure(idx)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                ))}

                                {closureForm.isOpen ? (
                                    <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setClosureForm({ ...closureForm, type: 'full' })}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition ${closureForm.type === 'full' ? 'bg-cyan-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-600'}`}
                                            >
                                                Full Day
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setClosureForm({ ...closureForm, type: 'partial' })}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition ${closureForm.type === 'partial' ? 'bg-cyan-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-600'}`}
                                            >
                                                Partial
                                            </button>
                                        </div>

                                        {closureForm.type === 'partial' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] pl-1">From</label>
                                                    <input
                                                        type="time"
                                                        value={closureForm.startTime}
                                                        onChange={(e) => setClosureForm({ ...closureForm, startTime: e.target.value })}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] pl-1">To</label>
                                                    <input
                                                        type="time"
                                                        value={closureForm.endTime}
                                                        onChange={(e) => setClosureForm({ ...closureForm, endTime: e.target.value })}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setClosureForm({ ...closureForm, isOpen: false })}
                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:bg-gray-100 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleClosure(closureForm.type, closureForm.startTime, closureForm.endTime)}
                                                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition"
                                            >
                                                Save Closure
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setClosureForm({ ...closureForm, isOpen: true })}
                                        className="w-full py-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-100 transition flex items-center justify-center gap-2"
                                    >
                                        <FaLock /> Mark Day as Closed / Leave
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Treatment Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FaNotesMedical size={10} /> Selected Treatments
                        </label>

                        {formData.selectedTreatments.map((treatment, index) => (
                            <div key={index} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-200">
                                <div className="relative flex-grow">
                                    <select
                                        required
                                        value={treatment.name}
                                        onChange={(e) => handleTreatmentChange(index, e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:border-blue-500 transition appearance-none text-sm"
                                    >
                                        <option value="">Select Treatment...</option>
                                        {treatments.map(t => (
                                            <option key={t._id} value={t.name}>{t.name} ({t.price})</option>
                                        ))}
                                        {treatment.name && treatment.name !== 'Other' && !treatments.find(t => t.name === treatment.name) && (
                                            <option value={treatment.name}>{treatment.name} (Previous)</option>
                                        )}
                                        <option value="Other / General Consultation">Other / General Consultation</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeTreatmentRow(index)}
                                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addTreatmentRow}
                            className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
                        >
                            <FaPlusCircle /> Add Another Treatment
                        </button>
                    </div>

                    {/* Financials / Additional Adjustments */}
                    <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-100 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <FaMoneyBillWave /> Estimated Pricing
                            </h3>
                            <span className="text-xl font-black text-blue-700">₹{totalAmount}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Base Price Total</span>
                                <div className="font-black text-gray-700">₹{basePriceTotal}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <FaPlusCircle className="text-blue-400" /> Additional
                                </label>
                                <input
                                    type="number"
                                    value={formData.additionalCost}
                                    onChange={(e) => setFormData({ ...formData, additionalCost: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Complaint Selection */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-wider italic">1. Select Complaint</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Checkup', 'Severe Pain', 'Swelling', 'Sensitive Teeth', 'Bleeding Gums', 'Broken Tooth', 'Alignment Issue'].map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, notes: prev.notes.includes('COMPLAINT:') ? prev.notes.replace('COMPLAINT:', `COMPLAINT: ${label}`) : `${prev.notes}\nCOMPLAINT: ${label}`.trim() }))}
                                            className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[9px] text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 cursor-pointer uppercase"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Finding -> Procedure Dependency Pickers */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-wider italic">2. Findings & Procedures</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Nerve Damaged', finding: 'Nerve damage detected in molar.', procedure: 'Nerve canal cleaning and gum treatment.' },
                                        { label: 'Accident Damage', finding: 'Physical trauma/fracture due to accident.', procedure: 'Structural layering and protective crown.' },
                                        { label: 'Alignment Issue', finding: 'Teeth not aligned properly (Malocclusion).', procedure: 'Alignment via operation and braces.' },
                                        { label: 'Deep Decay', finding: 'Deep cavity reaching the pulp.', procedure: 'Root Canal Treatment (RCT) and filling.' },
                                        { label: 'Calculus Build-up', finding: 'Significant tartar and plaque.', procedure: 'Full mouth scaling and polishing.' }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const newEntry = `\nFINDINGS: ${item.finding}\nPROCEDURE: ${item.procedure}`;
                                                    // Append if not already present in the exact same combination to avoid double clicks
                                                    if (prev.notes.includes(item.finding) && prev.notes.includes(item.procedure)) {
                                                        return prev;
                                                    }
                                                    return { ...prev, notes: (prev.notes + newEntry).trim() };
                                                });
                                            }}
                                            className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[9px] text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 cursor-pointer uppercase"
                                        >
                                            + {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Additional Treatment Notes</label>
                                <textarea
                                    placeholder="e.g. Procedure completed with proper measures. Normal follow-up."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 font-medium text-gray-800 outline-none focus:border-blue-500 text-sm min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition active:scale-95">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaCheck /> {appointmentId ? 'Update & Save' : 'Schedule'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
