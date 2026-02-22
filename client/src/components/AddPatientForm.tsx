'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaTimes, FaCheck, FaInfoCircle, FaUser, FaCalendarAlt, FaVenusMars, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFileMedical } from 'react-icons/fa';

const AddPatientForm = ({ onPatientAdded }: { onPatientAdded: () => void }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('-__-');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, {
                name,
                age: Number(age),
                gender,
                contact,
                email: email.trim().toLowerCase() || undefined,
                address: address.trim() || '-__-',
                medicalHistory: medicalHistory.split(',').map(item => item.trim())
            });
            setName('');
            setAge('');
            setGender('-__-');
            setContact('');
            setEmail('');
            setAddress('');
            setMedicalHistory('');
            setShowForm(false);
            onPatientAdded();
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Failed to add patient');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="group flex items-center gap-3 bg-blue-600 px-6 py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                        <FaUserPlus size={14} />
                    </div>
                    Add New Patient
                </button>
            ) : (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300"
                    >
                        {/* Form Header */}
                        <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                        <FaUserPlus size={18} />
                                    </div>
                                    New Patient Record
                                </h2>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 ml-13">Clinical Intake Form</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <FaUser size={10} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner placeholder:text-gray-300"
                                        placeholder="Enter name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                            <FaCalendarAlt size={10} /> Age
                                        </label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner placeholder:text-gray-300"
                                            placeholder="Years"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                            <FaVenusMars size={10} /> Gender
                                        </label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner cursor-pointer"
                                        >
                                            <option value="-__-">- Select -</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <FaPhoneAlt size={10} /> Contact Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={contact}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setContact(val);
                                            }}
                                            className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner ${contact.length === 10 ? 'text-emerald-600' : 'text-gray-900'
                                                }`}
                                            placeholder="10 digit number"
                                            required
                                        />
                                        {contact.length === 10 && <FaCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <FaEnvelope size={10} /> Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner placeholder:text-gray-300"
                                        placeholder="name@email.com"
                                    />
                                </div>
                            </div>

                            {/* Address & Medical */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <FaMapMarkerAlt size={10} /> Home Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner placeholder:text-gray-300"
                                    placeholder="Enter full address"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <FaFileMedical size={10} /> Medical History
                                </label>
                                <textarea
                                    value={medicalHistory}
                                    onChange={(e) => setMedicalHistory(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner placeholder:text-gray-300 min-h-[100px] resize-none"
                                    placeholder="List any conditions, allergies, or medications (comma separated)"
                                />
                                <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1 mt-2">
                                    <FaInfoCircle size={10} /> Leave empty if no history.
                                </p>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-3.5 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                            >
                                DISCARD
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-10 py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                                    }`}
                            >
                                {isSubmitting ? 'SAVING...' : 'SAVE RECORD'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddPatientForm;
