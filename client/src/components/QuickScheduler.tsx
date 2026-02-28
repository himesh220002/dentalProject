'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaPlusCircle, FaEnvelope } from 'react-icons/fa';

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
}

export default function QuickScheduler({ isOpen, onClose, onSuccess, initialDate, initialSearch, initialName, initialEmail, messageId, appointmentId, inquiryMessage }: QuickSchedulerProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
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
        patientId: '',
        date: initialDate ? initialDate.toISOString().split('T')[0] : getTomorrowDate(),
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
        if (isOpen) fetchData();
    }, [isOpen, appointmentId]);

    useEffect(() => {
        if (isOpen && initialSearch && !appointmentId && !inquiryMessage) {
            setSearchTerm(initialSearch);
        }
    }, [isOpen, initialSearch, appointmentId, inquiryMessage]);

    useEffect(() => {
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
                    text: `Success! Confirmation email sent to ${res.data.emailSentTo}`
                });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setStatusMessage(null);
                }, 3000);
            } else {
                onSuccess();
                onClose();
            }
            setFormData({
                patientId: '',
                date: getTomorrowDate(),
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

            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition">
                        <FaTimes />
                    </button>
                    <h2 className="text-3xl font-black flex items-center gap-3">
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

                <form onSubmit={handleSubmit} className="p-8 space-y-2 max-h-[80vh] sm:max-h-[750px] overflow-y-auto custom-scrollbar">
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
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Additional Treatment Notes</label>
                            <input
                                type="text"
                                placeholder="e.g. Extra medicine, complicated extraction..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 font-medium text-gray-800 outline-none focus:border-blue-500 text-sm"
                            />
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
