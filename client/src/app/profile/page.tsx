'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaHistory, FaCheckCircle, FaExclamationCircle, FaLock } from 'react-icons/fa';
import SessionGuard from '@/components/SessionGuard';

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

interface Patient {
    _id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    email: string;
    address: string;
    alternateContact: string;
    addedByAdmin: boolean;
    createdAt: string;
}

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

    useEffect(() => {
        if (records.length > 0) {
            setExpandedRecords(prev => ({
                [records[0]._id]: true,
                ...prev
            }));
        }
    }, [records]);

    const toggleExpand = (id: string) => {
        setExpandedRecords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderPrescriptionLine = (line: string, colorClass: string) => {
        const match = line.match(/^([^-]*-?\s*)([^(\n]+)(\(.*\))?$/);
        if (!match) return <p className={`text-sm font-bold ${colorClass} leading-relaxed`}>{line}</p>;

        const prefix = match[1];
        const medName = match[2];
        const instructions = match[3] || "";

        return (
            <p className="text-sm font-bold leading-relaxed">
                <span className="text-gray-400">{prefix}</span>
                <span className={colorClass}>{medName}</span>
                <span className="text-gray-900 font-medium">{instructions}</span>
            </p>
        );
    };

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        age: 0,
        gender: '-__-',
        address: '',
        contact: '',
        alternateContact: ''
    });

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
                    setFormData({
                        name: userData.patientId.name || '',
                        age: userData.patientId.age || 0,
                        gender: userData.patientId.gender || '-__-',
                        address: userData.patientId.address || '',
                        contact: userData.patientId.contact === '-__-' ? '' : (userData.patientId.contact || ''),
                        alternateContact: userData.patientId.alternateContact || ''
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session]);

    useEffect(() => {
        const fetchRecordsAndAppointments = async () => {
            if (!patient?._id) return;
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

                // Fetch records
                const recordsRes = await axios.get(`${backendUrl}/api/treatment-records/patient/${patient._id}`);
                setRecords(recordsRes.data);

                // Fetch appointments
                const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patient._id}`);
                const allApts = aptRes.data;

                // Find next upcoming appointment
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const sortedApts = allApts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setAllAppointments(sortedApts);

                const nextApt = sortedApts.find((apt: any) => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= startOfToday && apt.status !== 'Completed' && !apt.isTicked;
                });
                setUpcomingAppointment(nextApt);
            } catch (err) {
                console.error('Error fetching patient data:', err);
            }
        };
        fetchRecordsAndAppointments();
    }, [patient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await axios.put(`${backendUrl}/api/auth/update-profile`, {
                // @ts-ignore
                userId: session?.user?.id,
                ...formData
            });

            if (res.data.patient) {
                setPatient(res.data.patient);
                setFormData({
                    name: res.data.patient.name || '',
                    age: res.data.patient.age || 0,
                    gender: res.data.patient.gender || '-__-',
                    address: res.data.patient.address || '',
                    contact: res.data.patient.contact === '-__-' ? '' : (res.data.patient.contact || ''),
                    alternateContact: res.data.patient.alternateContact || ''
                });
            }

            setSuccess(res.data.message || 'Profile updated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <SessionGuard>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 text-white">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-xl" />
                                ) : (
                                    <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center border-4 border-white/20 shadow-xl">
                                        <FaUser size={40} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{formData.name}</h1>
                                <p className="text-blue-100 font-medium tracking-wide">
                                    Patient Portal • Member since {patient?.createdAt ? new Date(patient.createdAt).getFullYear() : new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {error && (
                            <div className="mb-6 flex items-center gap-3 bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                                <FaExclamationCircle />
                                <span className="font-bold text-sm">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 flex items-center gap-3 bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                                <FaCheckCircle />
                                <span className="font-bold text-sm">{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <FaUser size={14} />
                                    </div>
                                    Personal Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 border-b-2 border-blue-600 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl font-bold transition-all outline-none"
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Age</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl font-bold transition-all outline-none"
                                                placeholder="Your age"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase tracking-widest pointer-events-none">Years</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl font-bold transition-all outline-none appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="-__-">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <div className="w-full bg-gray-100 border-2 border-dashed border-gray-200 px-4 py-3 rounded-xl font-bold text-gray-500 flex items-center gap-3 cursor-not-allowed">
                                            <FaEnvelope className="text-gray-300" />
                                            {session?.user?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <FaPhone size={14} />
                                    </div>
                                    Contact & Location
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Primary Contact</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaPhone className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white pl-10 pr-4 py-3 rounded-xl font-bold transition-all outline-none"
                                                placeholder="Your primary phone number"
                                                required
                                            />
                                        </div>
                                        {patient?.contact === '-__-' && (
                                            <p className="text-[10px] text-blue-500 font-bold mt-1 animate-pulse">
                                                Please add your primary contact to link your records securely.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Alternate Contact</label>
                                        <input
                                            type="text"
                                            value={formData.alternateContact}
                                            onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl font-bold transition-all outline-none"
                                            placeholder="Emergency/Alternate number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Residential Address</label>
                                        <textarea
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-xl font-bold transition-all outline-none resize-none"
                                            placeholder="Your full address"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-400 font-medium">
                                    Your information is used only for clinical purposes and is never shared.
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'
                                        }`}
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        'Update Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Treatment History Section */}
                <div className="mt-10 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <FaHistory size={20} />
                            </div>
                            Clinical History
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {upcomingAppointment ? (
                                <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
                                    <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Your Next Appointment</p>
                                        <p className="text-sm font-black text-amber-900">
                                            {new Date(upcomingAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} @ {upcomingAppointment.time}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <a
                                    href="/contact"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/10 transition transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <FaCalendarAlt /> Book New Appointment
                                </a>
                            )}
                        </div>
                    </div>

                    {records.length > 0 ? (
                        <div className="space-y-6">
                            {records.map((record) => (
                                <div key={record._id} className="bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                                    <div
                                        className="p-6 cursor-pointer flex justify-between items-start"
                                        onClick={() => toggleExpand(record._id)}
                                    >
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                <svg
                                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedRecords[record._id] ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{record.treatmentName}</h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${record.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {record.paymentStatus}
                                            </span>
                                            {record.cost && <p className="font-black text-gray-900">₹{record.cost}</p>}
                                        </div>
                                    </div>

                                    {expandedRecords[record._id] && (
                                        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2 pt-4 border-t border-gray-100">
                                                <div className="bg-white p-4 rounded-xl">
                                                    <p className="text-gray-400 font-black uppercase text-[10px] mb-2 tracking-widest">Diagnosis/Notes</p>
                                                    <p className="text-gray-700 font-medium leading-relaxed italic">{record.notes || 'General consultation'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl">
                                                    <p className="text-gray-400 font-black uppercase text-[10px] mb-2 tracking-widest">Prescription & Medication</p>
                                                    <div className="space-y-2">
                                                        {(() => {
                                                            if (!record.prescription) return <p className="text-gray-500 font-medium italic">No medicines prescribed</p>;

                                                            const lines = record.prescription.split('\n').filter((l: string) => l.trim());
                                                            const homeLines: string[] = [];
                                                            const clinicLines: string[] = [];

                                                            lines.forEach((line: string) => {
                                                                const isClinic = CLINIC_DRUGS.some(d => line.toLowerCase().includes(d.name.toLowerCase()));
                                                                if (isClinic) {
                                                                    clinicLines.push(line);
                                                                } else {
                                                                    homeLines.push(line);
                                                                }
                                                            });

                                                            const homeSection = homeLines.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    {homeLines.map((line, i) => (
                                                                        <div key={`home-${i}`}>
                                                                            {renderPrescriptionLine(line, 'text-emerald-600')}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );

                                                            const clinicSection = clinicLines.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    {homeLines.length > 0 && <hr className="border-gray-100 my-2" />}
                                                                    {clinicLines.map((line, i) => (
                                                                        <div key={`clinic-${i}`} className="flex items-center gap-2 flex-wrap">
                                                                            {renderPrescriptionLine(line, 'text-indigo-600')}
                                                                            <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-1 py-0.5 rounded uppercase tracking-tighter">(clinic administered)</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );

                                                            return (
                                                                <>
                                                                    {homeSection}
                                                                    {clinicSection}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <FaHistory size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-black text-lg">No records found</p>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Your clinical history will appear here after your first treatment session at the clinic.</p>
                        </div>
                    )}
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50 text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                            <FaHistory size={20} />
                        </div>
                        <h3 className="font-black text-gray-900">Health History</h3>
                        <p className="text-xs text-gray-500 font-medium">Detailed log of your dental health journey.</p>
                        <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{records.length} Records</span>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50 text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                            <FaCalendarAlt size={20} />
                        </div>
                        <h3 className="font-black text-gray-900">Appointments</h3>
                        <p className="text-xs text-gray-500 font-medium">Manage your upcoming and past bookings details.</p>
                        <button
                            onClick={() => setIsAptModalOpen(true)}
                            className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
                        >
                            View All
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50 text-center space-y-3">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                            <FaLock size={20} />
                        </div>
                        <h3 className="font-black text-gray-900">Account Status</h3>
                        <p className="text-xs text-gray-500 font-medium">Your account is verified with Google OAuth 2.0.</p>
                        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Verified</span>
                    </div>
                </div>
            </div>
            {/* Appointments Modal */}
            {isAptModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Appointments History</h2>
                                <p className="text-sm font-bold text-gray-400">Manage your past and scheduled visits</p>
                            </div>
                            <button
                                onClick={() => setIsAptModalOpen(false)}
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition shadow-sm border border-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-4">
                            {allAppointments.length > 0 ? (
                                allAppointments.map((apt: any) => (
                                    <div key={apt._id} className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center hover:border-blue-100 transition shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${new Date(apt.date).getTime() >= new Date().setHours(0, 0, 0, 0) ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                <span className="text-[10px] uppercase leading-none mb-1">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                <span className="text-lg leading-none">{new Date(apt.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-gray-900">{apt.reason || 'General Consultation'}</span>
                                                    {new Date(apt.date).getTime() >= new Date().setHours(0, 0, 0, 0) && apt.status !== 'Completed' && (
                                                        <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full animate-pulse uppercase">Upcoming</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                    <FaCalendarAlt size={10} />
                                                    {apt.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${apt.status === 'Completed' || apt.isTicked ? 'bg-emerald-100 text-emerald-600' :
                                                apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {apt.isTicked ? 'Completed' : (apt.status || 'Scheduled')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 font-bold">No appointment history found.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                                onClick={() => setIsAptModalOpen(false)}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition shadow-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SessionGuard>
    );
}
