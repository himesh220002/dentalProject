'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaPlusCircle, FaEnvelope, FaLock, FaUnlock, FaTrash } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import TreatmentIcon from './TreatmentIcon';

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
    skipWhatsApp?: boolean;
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
    const [newPatientData, setNewPatientData] = useState({
        name: '',
        contact: '',
        age: ''
    });
    const { clinicData, language } = useClinic();
    const t_labels = translations[language] || translations.en;

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
        additionalItems: [] as { name: string, price: number }[],
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
                        additionalItems: (apt.amount - selected.reduce((s: number, t: any) => s + t.price, 0) > 0)
                            ? [{ name: 'Previous Adjustment', price: apt.amount - selected.reduce((s: number, t: any) => s + t.price, 0) }]
                            : [],
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
    const additionalItemsTotal = formData.additionalItems.reduce((sum, t) => sum + t.price, 0);
    const totalAmount = basePriceTotal + additionalItemsTotal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalReason = formData.selectedTreatments
                .map(t => t.name)
                .filter(name => name !== '')
                .join(', ');

            let currentPatientId = formData.patientId;

            // Step 1: Register new patient if in New Patient Mode
            if (isNewPatientMode) {
                const patientRes = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, {
                    ...newPatientData,
                    age: Number(newPatientData.age) || 0,
                    addedByAdmin: true,
                    gender: '-__-',
                    address: '-__-',
                    medicalHistory: []
                });
                currentPatientId = patientRes.data._id;
            }

            if (!currentPatientId) {
                alert('Please select or add a patient');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                patientId: currentPatientId,
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
                    text: `Success! Confirmation sent to ${res.data.emailSentTo}. Record ID: ${currentPatientId.slice(-8).toUpperCase()}`
                });
            } else {
                setStatusMessage({
                    type: 'success',
                    text: `Success! Appointment booked. Record ID: ${currentPatientId.slice(-8).toUpperCase()}`
                });
            }

            // WhatsApp Redirect Logic
            let whatsappPatient = patients.find(p => p._id === currentPatientId);

            // For new patients, the patients state might not have updated yet, so use data from API response
            if (isNewPatientMode && !whatsappPatient) {
                whatsappPatient = {
                    _id: currentPatientId,
                    name: newPatientData.name,
                    contact: newPatientData.contact
                };
            }

            if (whatsappPatient && !skipWhatsApp) {
                const patientPhone = whatsappPatient.contact;
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

                const message = `*Appointment Confirmed!* 🦷\n\nDear ${whatsappPatient.name},\nYour appointment at *${clinicName}* has been scheduled successfully.\n\n*Treatment:* ${finalReason}\n*Date:* ${date}\n*Time:* ${time}\n\n*Location:* ${fullAddress}\n*Google Maps:* ${mapsLink}\n\n*Record ID:* ${currentPatientId.slice(-8).toUpperCase()}\n_(Use this ID to link your history on our website Profile page)_\n\nSee you soon!`;

                const whatsappUrl = `https://wa.me/91${patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');

                // WhatsApp Staff Trigger - 2 seconds later
                const staffPhone = clinicData?.staffPhone || clinicData?.phone || "8105542318";
                const staffMessage = `*New Booking Alert!* 🦷\n\nPatient: ${whatsappPatient.name}\nDate: ${date}\nTime: ${time}\nReason: ${finalReason}`;
                const staffWhatsappUrl = `https://wa.me/91${staffPhone.replace(/\D/g, '')}?text=${encodeURIComponent(staffMessage)}`;

                setTimeout(() => {
                    window.open(staffWhatsappUrl, '_blank');
                }, 2000);
            }

            setTimeout(() => {
                onSuccess();
                onClose();
                setStatusMessage(null);
            }, res.data.emailSentTo ? 3000 : (skipWhatsApp ? 500 : 2500));

            setFormData({
                patientId: '',
                date: getTodayDate(),
                time: '',
                selectedTreatments: [],
                additionalItems: [],
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

            <div className="relative bg-white w-full max-w-3xl max-h-[95vh] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white relative">
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

                <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-2 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Search & Select/Add Patient */}
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FaUser size={10} /> {isNewPatientMode ? 'Register New Patient' : 'Find Patient'}
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setIsNewPatientMode(!isNewPatientMode);
                                if (isNewPatientMode) {
                                    setNewPatientData({ name: '', contact: '', age: '' });
                                } else {
                                    setFormData({ ...formData, patientId: '' });
                                    setSearchTerm('');
                                }
                            }}
                            className={`text-[8px] sm:text-[10px] font-black uppercase tracking-tight py-1 px-2 sm:px-3 rounded-lg transition-all border ${isNewPatientMode
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                }`}
                        >
                            {isNewPatientMode ? '← Use Existing' : '+ Add New Patient'}
                        </button>
                    </div>

                    {!isNewPatientMode ? (
                        <div className="space-y-2">
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
                                    required={!isNewPatientMode}
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
                        </div>
                    ) : (
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100/50 space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter name"
                                        value={newPatientData.name}
                                        onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                                        className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-5 py-3.5 font-bold text-gray-800 outline-none focus:border-emerald-500 transition shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="10 digit number"
                                        value={newPatientData.contact}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setNewPatientData({ ...newPatientData, contact: val });
                                        }}
                                        className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-5 py-3.5 font-bold text-gray-800 outline-none focus:border-emerald-500 transition shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">Age (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="Patient age"
                                    value={newPatientData.age}
                                    onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })}
                                    className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-5 py-3.5 font-bold text-gray-800 outline-none focus:border-emerald-500 transition shadow-sm"
                                />
                            </div>
                        </div>
                    )}


                    <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FaCalendarAlt size={10} /> Date:
                                <span className="text-blue-600 ml-1 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                    {new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </label>

                            {/* Backup Date Picker Icon */}
                            <div className="relative z-10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('backup-date-picker') as any;
                                        if (input) {
                                            if (typeof input.showPicker === 'function') {
                                                try {
                                                    input.showPicker();
                                                } catch (e) {
                                                    input.click();
                                                }
                                            } else {
                                                input.click();
                                            }
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 cursor-pointer transition-all active:scale-95 text-[10px] font-black uppercase tracking-tighter"
                                    title="Pick any date from calendar"
                                >
                                    <FaCalendarAlt size={10} />
                                    <span>Other Date</span>
                                </button>
                                <input
                                    id="backup-date-picker"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleDateChange(e)}
                                    className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto py-3 custom-scrollbar -mx-5 px-5 sm:-mx-8 sm:px-8">
                            {[...Array(12)].map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() + i);
                                const dateStr = d.toISOString().split('T')[0];
                                const isSelected = formData.date === dateStr;
                                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = d.getDate();
                                const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                                // Check density for this date
                                const dateData = density[dateStr];
                                const isClosed = dateData?.closed;
                                const isBusy = (dateData?.count || 0) > 7;

                                return (
                                    <button
                                        key={dateStr}
                                        type="button"
                                        onClick={() => handleDateChange({ target: { value: dateStr } } as any)}
                                        className={`flex-shrink-0 w-15 md:w-20 p-2 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 relative ${isSelected
                                            ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105'
                                            : 'border-gray-50 bg-gray-50 hover:border-blue-200'
                                            } ${isClosed ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`text-[10px] font-black ${isSelected ? 'text-blue-600' : 'text-gray-400 uppercase'}`}>{dayName}</span>
                                        <span className={`text-xl font-black ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{dayNum}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{monthName}</span>

                                        {isClosed && (
                                            <div className="absolute top-1 right-1">
                                                <FaLock className="text-rose-500" size={8} />
                                            </div>
                                        )}
                                        {isBusy && !isClosed && (
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FaClock size={10} /> Specific Time (Optional)
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
                                <div className="flex gap-1.5 overflow-x-auto py-2 custom-scrollbar -mx-5 px-5 sm:grid sm:grid-cols-12 sm:mx-0 sm:px-0">
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

                                        const isSelectedTime = formData.time.startsWith(hour.toString().padStart(2, '0'));

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

                                        if (isSelectedTime && !isPast && !isClosed) {
                                            bgColor = 'ring-4 ring-blue-600 border-blue-600 bg-blue-50 scale-110 z-10';
                                            textColor = 'text-blue-700';
                                        }

                                        return (
                                            <div
                                                key={hour}
                                                onClick={() => {
                                                    if (!isPast && !isClosed) {
                                                        setFormData({ ...formData, time: `${hour.toString().padStart(2, '0')}:00` });
                                                    }
                                                }}
                                                className={`flex-shrink-0 w-10 sm:w-auto h-10 sm:h-12 flex flex-col items-center justify-center rounded-xl border transition-all relative ${bgColor} ${(hour === 13 && !isClosed && !isPast) ? 'opacity-50' : ''} ${(!isPast && !isClosed) ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}`}
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
                                <div className="relative flex-grow flex items-center gap-2">
                                    <TreatmentIcon
                                        treatmentName={treatment.name}
                                        className="text-xl text-blue-600 flex-shrink-0"
                                    />
                                    <div className="relative flex-grow">
                                        <select
                                            required
                                            aria-label="Select Treatment"
                                            value={treatment.name}
                                            onChange={(e) => handleTreatmentChange(index, e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-5 pr-10 py-3 font-bold text-gray-800 outline-none focus:border-blue-500 transition appearance-none text-sm"
                                        >
                                            <option value="">+ Add Treatment...</option>
                                            {treatments.map(t => (
                                                <option key={t._id} value={t.name}>
                                                    {(t_labels as any).treatmentNames?.[t.name] || t.name}
                                                </option>
                                            ))}
                                            {treatment.name && treatment.name !== 'Other / General Consultation' && !treatments.find(t => t.name === treatment.name) && (
                                                <option value={treatment.name}>{(t_labels as any).treatmentNames?.[treatment.name] || treatment.name} (Previous)</option>
                                            )}
                                            <option value="Other / General Consultation">
                                                {t_labels.treatmentNames?.['Other / General Consultation'] || 'Other / General Consultation'}
                                            </option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
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
                                    <FaPlusCircle className="text-blue-400" /> Additional Costs
                                </label>
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row items-center gap-2">
                                        <select
                                            onChange={(e) => {
                                                const select = e.target as HTMLSelectElement;
                                                const val = parseInt(select.value);
                                                if (select.selectedIndex === -1) return;
                                                const name = select.options[select.selectedIndex].text.split(' (+')[0];
                                                if (val > 0) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        additionalItems: [...prev.additionalItems, { name, price: val }]
                                                    }));
                                                }
                                                select.value = "0"; // Reset select
                                            }}
                                            className="flex-grow bg-white border border-blue-200 rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 outline-none focus:ring-1 focus:ring-blue-500 uppercase cursor-pointer"
                                        >
                                            <option value="0">Select Kit / Item...</option>
                                            <option value="100">Hygiene Kit (+ ₹100)</option>
                                            <option value="200">Surgery Kit (+ ₹200)</option>
                                            <option value="300">X-Ray (+ ₹300)</option>
                                            <option value="150">Anesthesia (+ ₹150)</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, additionalItems: [] }))}
                                            className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-600 hover:bg-rose-600 hover:text-white transition-all uppercase"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown List */}
                        <div className="space-y-1 py-3 border-t border-blue-100">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Breakdown :</span>
                            <div className="space-y-1">
                                {formData.selectedTreatments.map((t, i) => t.name && (
                                    <div key={i} className="flex justify-between text-[11px] font-bold text-gray-500">
                                        <span>• {t.name}</span>
                                        <span>₹{t.price}</span>
                                    </div>
                                ))}
                                {formData.additionalItems.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] font-bold text-blue-600 group">
                                        <div className="flex items-center gap-2">
                                            <span>• {item.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    additionalItems: prev.additionalItems.filter((_, idx) => idx !== i)
                                                }))}
                                                className="text-rose-400 hover:text-rose-600 opacity-30 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                        <span>₹{item.price}</span>
                                    </div>
                                ))}
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

                    <div className="pt-2 flex gap-2 sm:gap-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs text-gray-500 hover:bg-gray-100 transition active:scale-95 uppercase tracking-widest">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 uppercase tracking-widest">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaCheck className="text-[10px]" /> {appointmentId ? 'Update' : 'Schedule'}</>}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
