'use client';

import { useState, useEffect } from 'react';
import { FaTooth, FaUpload, FaCopy, FaCheck, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUserMd, FaCalendarAlt, FaPlus, FaTrash, FaAward, FaUserCheck, FaPercentage, FaShieldAlt, FaStethoscope, FaUserFriends, FaLightbulb, FaFlask, FaSearch, FaSave, FaHistory, FaCloudUploadAlt, FaEdit, FaArrowLeft, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { useClinic } from '../../context/ClinicContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');

export default function TempClinicForm() {
    const { refreshClinicData } = useClinic();
    const [formData, setFormData] = useState({
        clinicName: 'Dr. Tooth Dental Clinic',
        doctorName: 'Dr. Tooth',
        tagline: "Your Smile's Guardian",
        email: 'care@drToothdental.in',
        phone: '+91 98765 43210',
        establishedYear: '2014',
        clinicExperience: '10+',
        expertise: 'Restorative Dentistry, Oral Surgery, Orthodontics, Cosmetic Dentistry',
        visitPolicy: 'Prior Appointment Recommended. Walk-ins subject to availability.',
        happyCustomers: '5000+',
        successRate: '99.9',
        address: {
            street: 'Dental Clinic Road, Near Market',
            city: 'Katihar',
            state: 'Bihar',
            zip: '854105'
        },
        socialLinks: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        },
        timings: {
            monday: '09:00 AM - 08:00 PM',
            tuesday: '09:00 AM - 08:00 PM',
            wednesday: '09:00 AM - 08:00 PM',
            thursday: '09:00 AM - 08:00 PM',
            friday: '09:00 AM - 08:00 PM',
            saturday: '09:00 AM - 06:00 PM',
            sunday: 'Closed'
        },
        certifications: 'Best Dentist Award 2022, Certified Implantologist, Member of IDA',
        consultants: [
            { name: 'Dr. Tooth', role: 'Chief Surgeon', info: 'BDS, MDS', experience: '12 Years' },
            { name: 'Dr. nefario', role: 'Orthodontist', info: 'Expert in Braces & Aligners', experience: '8 Years' }
        ],
        treatments: [
            { name: 'General Consultation', price: '300', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Scaling & Cleaning', price: '800', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Dental Fillings', price: '1000', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Tooth Extraction', price: '500', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Root Canal Treatment', price: '3500', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Dental Implants', price: '25000', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Teeth Whitening', price: '5000', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Orthodontic Braces', price: '15000', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Crowns & Bridges', price: '3500', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: "Kid's Dentistry", price: '500', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' },
            { name: 'Full Mouth X-Ray', price: '500', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' }
        ],
        highlights: [
            { title: 'Advanced Technology', description: 'Intraoral scanners & 3D imaging for precise diagnosis.' },
            { title: 'Pain-free Dentistry', description: 'Modern anesthesia & laser treatments for comfort.' },
            { title: 'Sterile Environment', description: 'Class B Autoclave sterilization protocols.' }
        ],
        seo: {
            metaTitle: 'Best Dental Clinic in Katihar | Dr. Tooth Dental Clinic',
            metaDescription: 'Expert dental care by Dr. Tooth. Specializing in Root Canal, Implants, and Braces. Advanced technology and painless treatments in Katihar.',
            keywords: 'dentist in katihar, dental clinic, root canal, teeth whitening, orthodontist'
        }
    });

    const [jsonOutput, setJsonOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [handoverId, setHandoverId] = useState('handover_v1');
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(() => {
        if (typeof window !== 'undefined') {
            const auth = localStorage.getItem('handover_authorized');
            const expiry = localStorage.getItem('handover_expiry');
            const now = Date.now();
            return auth === 'true' && expiry && now < Number(expiry);
        }
        return false;
    });
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkHandoverAuth = () => {
            const auth = localStorage.getItem('handover_authorized');
            const expiry = localStorage.getItem('handover_expiry');
            const now = Date.now();

            if (expiry && now >= Number(expiry)) {
                localStorage.removeItem('handover_authorized');
                localStorage.removeItem('handover_expiry');
                setIsAuthorized(false);
            } else if (auth === 'true' && expiry && now < Number(expiry)) {
                setIsAuthorized(true);
            }
        };
        checkHandoverAuth();
        // Set up interval to check expiry periodically
        const interval = setInterval(checkHandoverAuth, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'drtooth2026') {
            const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
            localStorage.setItem('handover_authorized', 'true');
            localStorage.setItem('handover_expiry', expiry.toString());
            setIsAuthorized(true);
        } else {
            alert('Incorrect delivery password.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('handover_authorized');
        localStorage.removeItem('handover_expiry');
        setIsAuthorized(false);
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchHistory();
        }
    }, [isAuthorized]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/handover/history`);
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const saveToDb = async () => {
        setIsLoading(true);
        setSaveStatus('Saving...');
        try {
            await axios.post(`${API_BASE_URL}/handover/save`, {
                handoverformId: handoverId,
                jsondata: formData
            });
            setSaveStatus('Handover saved successfully!');
            fetchHistory();
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('Error saving to DB');
            console.error('Save error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromHistory = (item: any) => {
        setFormData(item.jsondata);
        setHandoverId(item.handoverformId);
        setJsonOutput(JSON.stringify(item.jsondata, null, 4));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof prev] as any),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleListChange = (listName: 'treatments' | 'consultants' | 'highlights', index: number, field: string, value: string) => {
        const newList = [...formData[listName]];
        // @ts-ignore
        newList[index][field] = value;
        setFormData(prev => ({ ...prev, [listName]: newList }));
    };

    const addListItem = (listName: 'treatments' | 'consultants' | 'highlights') => {
        let newItem;
        if (listName === 'treatments') newItem = { name: '', price: '', description: 'Treatment details provided by clinic.', whyChooseThis: 'Essential dental care.' };
        else if (listName === 'consultants') newItem = { name: '', role: '', info: '', experience: '' };
        else newItem = { title: '', description: '' };

        setFormData(prev => ({
            ...prev,
            [listName]: [...prev[listName], newItem]
        }));
    };

    const removeListItem = (listName: 'treatments' | 'consultants' | 'highlights', index: number) => {
        setFormData(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }));
    };

    const deleteFromHistory = async (handoverformId: string) => {
        if (!confirm(`Are you sure you want to delete ${handoverformId}?`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/handover/${handoverformId}`);
            // Fetch updated history
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            setHistory(historyRes.data);
            setSaveStatus('Version deleted successfully');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Delete error:', error);
            setSaveStatus('Error deleting version');
        }
    };

    const activateVersion = async (handoverformId: string) => {
        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/handover/activate/${handoverformId}`);
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            setHistory(historyRes.data);
            await refreshClinicData();
            setSaveStatus(`Version ${handoverformId} activated successfully!`);
            setTimeout(() => setSaveStatus(''), 5000);
        } catch (error) {
            console.error('Activation error:', error);
            setSaveStatus('Error activating version');
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateVersion = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/handover/deactivate`);
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            setHistory(historyRes.data);
            await refreshClinicData();
            setSaveStatus('Handover deactivated. Reverting to default site data.');
            setTimeout(() => setSaveStatus(''), 5000);
        } catch (error) {
            console.error('Deactivation error:', error);
            setSaveStatus('Error deactivating version');
        } finally {
            setIsLoading(false);
        }
    };

    const finalizeHandover = async () => {
        // First generate the JSON for the preview
        setJsonOutput(JSON.stringify(formData, null, 4));

        // Then trigger the DB save
        setIsLoading(true);
        setSaveStatus('Saving to Database...');
        try {
            await axios.post(`${API_BASE_URL}/handover/save`, {
                handoverformId: handoverId,
                jsondata: formData
            });

            const savedId = handoverId;
            setSaveStatus(`Success! Saved with ID: ${savedId}`);

            // Fetch updated history to get latest count
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            const newHistory = historyRes.data;
            setHistory(newHistory);

            // Auto-increment version for next save
            const nextVersion = newHistory.length + 1;
            setHandoverId(`handover_v${nextVersion}`);

            setTimeout(() => setSaveStatus(''), 5000);
        } catch (error) {
            setSaveStatus('Error saving to DB during finalization');
            console.error('Finalize save error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonOutput || JSON.stringify(formData, null, 4));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -ml-48 -mb-48 rounded-full" />

                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl space-y-8 text-center border-t-8 border-blue-600 relative z-10">
                    <Link
                        href="/"
                        className="absolute top-8 left-8 text-gray-400 hover:text-blue-600 transition-colors group flex items-center gap-2"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
                    </Link>

                    <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner text-blue-600 mt-4">
                        <FaShieldAlt size={40} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Access Restricted</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Developer & Handover Dashboard</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6 text-left">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Enter Delivery Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-600 font-black text-center text-xl tracking-widest"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition transform active:scale-95">
                            Verify Access
                        </button>
                    </form>

                    <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                        Authorized personnel only. All access attempts are logged for security.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
                {/* Contextual Navigation Header for Dashboard */}
                <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 rounded-2xl flex items-center gap-3 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:-translate-x-1 active:scale-95 border border-red-50 bg-white/50 backdrop-blur-sm"
                    >
                        <FaShieldAlt size={16} />
                        <span>Logout</span>
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-2xl flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-x-1 active:scale-95"
                    >
                        <FaHome size={16} />
                        <span>Back to Website</span>
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto mt-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-4">
                            <FaTooth className="text-white text-3xl" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Clinic Delivery Dashboard</h1>
                        <p className="mt-2 text-gray-600 font-medium tracking-tight">Finalize branding, team details, and service pricing for handover.</p>
                    </div>

                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Form Sections */}
                        <div className="space-y-8">
                            {/* Branding */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-600 rounded-full" />
                                    Branding Essentials
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Clinic Name</label>
                                        <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold" />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Doctor Name</label>
                                        <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Tagline/Hero Message</label>
                                        <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold" />
                                    </div>
                                </div>
                            </div>

                            {/* Team Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                                        Consultants & Teams
                                    </h2>
                                    <button onClick={() => addListItem('consultants')} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                                        <FaPlus /> Add Member
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.consultants.map((c, i) => (
                                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                                            <button onClick={() => removeListItem('consultants', i)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"><FaTrash /></button>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Name</label>
                                                    <input type="text" placeholder="Dr. Name" value={c.name} onChange={(e) => handleListChange('consultants', i, 'name', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Role</label>
                                                    <input type="text" placeholder="e.g. Chief Surgeon" value={c.role} onChange={(e) => handleListChange('consultants', i, 'role', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Individual Experience</label>
                                                    <input type="text" placeholder="e.g. 10 Years" value={c.experience} onChange={(e) => handleListChange('consultants', i, 'experience', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Credentials/MDS</label>
                                                    <input type="text" placeholder="e.g. BDS, MDS" value={c.info} onChange={(e) => handleListChange('consultants', i, 'info', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Treatments Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-teal-500 rounded-full" />
                                        Treatments & Pricing
                                    </h2>
                                    <button onClick={() => addListItem('treatments')} className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest hover:bg-teal-50 px-4 py-2 rounded-xl transition-all">
                                        <FaPlus /> Add Treatment
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {formData.treatments.map((t, i) => (
                                        <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative group">
                                            <button onClick={() => removeListItem('treatments', i)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"><FaTrash size={14} /></button>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Treatment Name</label>
                                                    <input type="text" placeholder="Treatment" value={t.name} onChange={(e) => handleListChange('treatments', i, 'name', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-teal-500 font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                                        <input type="text" placeholder="Price" value={t.price} onChange={(e) => handleListChange('treatments', i, 'price', e.target.value)} className="w-full pl-8 pr-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-teal-500 font-bold text-sm text-teal-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                                                    <textarea placeholder="Description" value={t.description} onChange={(e) => handleListChange('treatments', i, 'description', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-teal-500 font-bold text-xs" rows={2} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Why Choose This?</label>
                                                    <textarea placeholder="Why Choose This?" value={t.whyChooseThis} onChange={(e) => handleListChange('treatments', i, 'whyChooseThis', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-teal-500 font-bold text-xs" rows={2} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Metrics Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-purple-500 rounded-full" />
                                    Clinic Experience & Metrics
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Years Since Est.</label>
                                        <input type="text" name="clinicExperience" value={formData.clinicExperience} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Patient Count</label>
                                        <input type="text" name="happyCustomers" value={formData.happyCustomers} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Success Rate</label>
                                        <input type="text" name="successRate" value={formData.successRate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                    </div>
                                </div>
                            </div>

                            {/* Clinic Highlights */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-yellow-500 rounded-full" />
                                        Clinic Highlights & Tech
                                    </h2>
                                    <button onClick={() => addListItem('highlights')} className="flex items-center gap-2 text-yellow-600 font-black text-xs uppercase tracking-widest hover:bg-yellow-50 px-4 py-2 rounded-xl transition-all">
                                        <FaPlus /> Add Highlight
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.highlights.map((h, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-2xl relative group border border-gray-100">
                                            <button onClick={() => removeListItem('highlights', i)} className="absolute top-2 right-2 p-1 text-rose-400 hover:text-rose-600 transition-opacity"><FaTrash size={12} /></button>
                                            <input type="text" placeholder="Title (e.g. Modern Lab)" value={h.title} onChange={(e) => handleListChange('highlights', i, 'title', e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-white border-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm" />
                                            <input type="text" placeholder="Description" value={h.description} onChange={(e) => handleListChange('highlights', i, 'description', e.target.value)} className="flex-[2] px-4 py-2 rounded-xl bg-white border-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-green-600 rounded-full" />
                                    Search & Discoverability (SEO)
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Meta Title</label>
                                        <input type="text" name="seo.metaTitle" value={formData.seo.metaTitle} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Optimal for Google results" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Keywords (Comma separated)</label>
                                        <input type="text" name="seo.keywords" value={formData.seo.keywords} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Meta Description</label>
                                        <textarea name="seo.metaDescription" value={formData.seo.metaDescription} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-bold" rows={2} />
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Address Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-rose-500 rounded-full" />
                                    Address & Contact
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Phone</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Street Address</label>
                                        <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                                        <input type="text" name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className="px-3 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                        <input type="text" name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} className="px-3 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                        <input type="text" name="address.zip" placeholder="ZIP" value={formData.address.zip} onChange={handleChange} className="px-3 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Clinic Policy / Note</label>
                                        <textarea name="visitPolicy" value={formData.visitPolicy} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" rows={2} placeholder="e.g. Appointment only" />
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-400 rounded-full" />
                                    Social Presence
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.keys(formData.socialLinks).map((platform) => (
                                        <div key={platform}>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{platform}</label>
                                            <input type="text" name={`socialLinks.${platform}`} value={formData.socialLinks[platform as keyof typeof formData.socialLinks]} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={finalizeHandover}
                                disabled={isLoading}
                                className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95 text-xl disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Finalize Handover Dashboard'}
                            </button>
                        </div>

                        {/* Persistence & History (Now below Form) */}
                        <div className="space-y-8 pt-8 border-t border-gray-200">

                            {/* Database Control */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-2 border-blue-500/20 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-500 rounded-full" />
                                    Database Persistence
                                </h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-grow">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Handover ID (Unique Version Name)</label>
                                        <input
                                            type="text"
                                            value={handoverId}
                                            onChange={(e) => setHandoverId(e.target.value)}
                                            placeholder="e.g. initial_handover_final"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={saveToDb}
                                            disabled={isLoading}
                                            className="sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-[52px]"
                                        >
                                            <FaCloudUploadAlt size={20} />
                                            {isLoading ? 'Saving...' : 'Save to DB'}
                                        </button>
                                    </div>
                                </div>
                                {saveStatus && (
                                    <p className={`text-sm font-bold ${saveStatus.includes('Error') ? 'text-rose-500' : 'text-green-600'}`}>
                                        {saveStatus}
                                    </p>
                                )}
                            </div>

                            {/* History Panel */}
                            <div className="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100 flex flex-col max-h-[500px]">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                    <FaHistory className="text-indigo-500" /> Version History
                                </h2>
                                <div className="flex-grow overflow-auto custom-scrollbar space-y-3 pr-2">
                                    {history.length > 0 ? history.map((item) => (
                                        <div key={item._id} className={`p-4 rounded-2xl border transition-all group relative ${item.isActive ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-400/20' : 'bg-gray-50 border-transparent hover:bg-indigo-50 hover:border-indigo-100'}`}>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black text-xs truncate max-w-[150px] ${item.isActive ? 'text-blue-700' : 'text-indigo-600'}`}>{item.handoverformId}</span>
                                                    {item.isActive && <span className="text-[7px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded-full tracking-widest">Active</span>}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium">Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
                                                {item.isActive ? (
                                                    <button
                                                        onClick={() => deactivateVersion()}
                                                        className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all ring-1 ring-blue-100 animate-pulse"
                                                        title="Deactivate (Revert to Default)"
                                                    >
                                                        <FaGlobe size={12} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => activateVersion(item.handoverformId)}
                                                        className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-all ring-1 ring-blue-100"
                                                        title="Go Live (Activate Site-wide)"
                                                    >
                                                        <FaGlobe size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => loadFromHistory(item)}
                                                    className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all ring-1 ring-indigo-100"
                                                    title="Load for Editing"
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => deleteFromHistory(item.handoverformId)}
                                                    className="p-1.5 bg-white text-rose-500 rounded-lg shadow-sm hover:bg-rose-500 hover:text-white transition-all ring-1 ring-rose-100"
                                                    title="Delete Version"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-gray-400 text-xs py-8 font-medium italic">No saved versions found</p>
                                    )}
                                </div>
                            </div>

                            {/* JSON Output */}
                            <div className="bg-gray-900 rounded-[3rem] shadow-2xl p-8 text-white min-h-[500px] flex flex-col border border-white/5">
                                <div className="flex justify-between items-center mb-6 text-center">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FaFlask className="text-blue-500 animate-pulse" /> Site JSON
                                    </h2>
                                    <button onClick={copyToClipboard} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
                                        {copied ? <FaCheck className="text-green-500" /> : <FaCopy className="text-blue-400" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>

                                {jsonOutput ? (
                                    <pre className="flex-grow bg-black/40 p-6 rounded-2xl font-mono text-[9px] text-blue-400 overflow-auto custom-scrollbar border border-white/10 select-all leading-relaxed">
                                        {jsonOutput}
                                    </pre>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                        <FaLightbulb size={48} className="text-yellow-500" />
                                        <p className="font-bold text-xs tracking-[0.3em] uppercase">Ready for Final Delivery</p>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Sync Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
            </div>
        </ProtectedRoute>
    );
}
