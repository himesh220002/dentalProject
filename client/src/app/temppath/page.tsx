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
        phone: '+91 90000 00000',
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
            zip: '854105',
            latitude: '25.555613',
            longitude: '87.556440'
        },
        socialLinks: {
            facebook: 'https://www.facebook.com/',
            twitter: 'https://x.com/tweeter?lang=en',
            linkedin: 'https://www.linkedin.com/',
            instagram: 'https://www.instagram.com/'
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
    const [showJson, setShowJson] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
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
        setHasMounted(true);
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

    const handleSave = async (publish = false) => {
        setIsLoading(true);
        setSaveStatus(publish ? 'Publishing...' : 'Saving Draft...');
        try {
            // First save to database
            await axios.post(`${API_BASE_URL}/handover/save`, {
                handoverformId: handoverId,
                jsondata: formData
            });

            // Update JSON preview
            setJsonOutput(JSON.stringify(formData, null, 4));

            // If publish is true, activate this version
            if (publish) {
                await axios.post(`${API_BASE_URL}/handover/activate/${handoverId}`);
                await refreshClinicData();
                setSaveStatus(`Success! Published version: ${handoverId}`);
            } else {
                setSaveStatus('Draft saved successfully!');
            }

            // Refresh history
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            const newHistory = historyRes.data;
            setHistory(newHistory);

            // If we just published, maybe auto-increment for next draft?
            // User might want to keep editing the same ID though.
            // Let's only auto-increment if it was a success and we want to prevent overwriting
            if (publish) {
                const nextVersion = newHistory.length + 1;
                setHandoverId(`handover_v${nextVersion}`);
            }

            setTimeout(() => setSaveStatus(''), 5000);
        } catch (error) {
            setSaveStatus(`Error during ${publish ? 'publish' : 'save'}`);
            console.error('Save error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromHistory = (item: any) => {
        const loadedData = item.jsondata;
        setFormData(prev => ({
            ...prev,
            ...loadedData,
            address: {
                ...prev.address,
                ...(loadedData.address || {})
            },
            socialLinks: {
                ...prev.socialLinks,
                ...(loadedData.socialLinks || {})
            },
            timings: {
                ...prev.timings,
                ...(loadedData.timings || {})
            },
            seo: {
                ...prev.seo,
                ...(loadedData.seo || {})
            }
        }));
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



    if (!hasMounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
            <div className="min-h-screen bg-[#f8fafc] py-8 px-0 sm:px-6 lg:px-8">
                {/* Unified Header */}
                <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <FaTooth className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Handover Dashboard</h1>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">Full Site Configuration & Versioning</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100"
                        >
                            <FaHome size={14} />
                            <span>Preview Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border border-rose-100"
                        >
                            <FaShieldAlt size={14} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
                    {/* Section 1: Version Control & Persistence */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden lg:min-w-[400px]">
                            <div className="p-8 bg-slate-900 text-white">
                                <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                                    <FaCloudUploadAlt className="text-blue-400" /> Version Control
                                </h2>
                                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tighter">Manage your live site configuration</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Active Site Version</label>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className={`w-3 h-3 rounded-full ${history.find(h => h.isActive) ? 'bg-green-500 shadow-lg shadow-green-200 animate-pulse' : 'bg-slate-300'}`} />
                                        <span className="font-black text-slate-700 truncate">
                                            {history.find(h => h.isActive)?.handoverformId || 'Default (Hardcoded)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Editing ID / Version Name</label>
                                        <input
                                            type="text"
                                            value={handoverId}
                                            onChange={(e) => setHandoverId(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                            placeholder="e.g. march_promo_v1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleSave(false)}
                                            disabled={isLoading}
                                            className="px-4 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex flex-col items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <FaSave size={16} />
                                            <span>Save Draft</span>
                                        </button>
                                        <button
                                            onClick={() => handleSave(true)}
                                            disabled={isLoading}
                                            className="px-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex flex-col items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <FaGlobe size={16} />
                                            <span>Go Live Now</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HISTORY CARD */}
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col lg:min-w-[400px] min-h-[300px] max-h-[500px]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                    <FaHistory className="text-indigo-500" /> History
                                </h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{history.length} Saved</span>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {history.length > 0 ? [...history].reverse().map((item) => (
                                    <div key={item._id} className={`p-4 rounded-2xl border transition-all group relative ${item.isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-black text-[10px] truncate max-w-[140px] ${item.isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                                                    {item.handoverformId}
                                                </span>
                                                {item.isActive && <span className="text-[7px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded-full tracking-tighter">Active</span>}
                                            </div>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100/50">
                                            {!item.isActive && (
                                                <button
                                                    onClick={() => activateVersion(item.handoverformId)}
                                                    className="p-1.5 h-8 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-all border border-blue-100 flex-1 flex justify-center items-center"
                                                    title="Go Live"
                                                >
                                                    <FaGlobe size={12} />
                                                </button>
                                            )}
                                            {item.isActive && (
                                                <button
                                                    onClick={() => deactivateVersion()}
                                                    className="p-1.5 h-8 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-slate-900 transition-all flex-1 flex justify-center items-center"
                                                    title="Revert to Default"
                                                >
                                                    <FaGlobe size={12} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => loadFromHistory(item)}
                                                className="p-1.5 h-8 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex-1 flex justify-center items-center"
                                                title="Load Draft"
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                            <button
                                                onClick={() => deleteFromHistory(item.handoverformId)}
                                                className="p-1.5 h-8 bg-white text-rose-500 rounded-lg shadow-sm hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex-1 flex justify-center items-center"
                                                title="Delete"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center">
                                        <FaHistory className="mx-auto text-slate-200 text-3xl mb-3" />
                                        <p className="text-slate-400 text-[10px] font-bold uppercase italic">No history found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Clinic Content & Configuration */}
                    <div className="space-y-12">
                        {/* Status Alert */}
                        {saveStatus && (
                            <div className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${saveStatus.includes('Error') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${saveStatus.includes('Error') ? 'bg-rose-500' : 'bg-green-500'} animate-pulse`} />
                                {saveStatus}
                            </div>
                        )}

                        {/* Branding */}
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 border border-gray-100 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
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
                                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Latitude</label>
                                        <input type="text" name="address.latitude" placeholder="e.g. 25.5556" value={formData.address.latitude} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Longitude</label>
                                        <input type="text" name="address.longitude" placeholder="e.g. 87.5564" value={formData.address.longitude} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold text-sm" />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Clinic Policy / Note</label>
                                    <textarea name="visitPolicy" value={formData.visitPolicy} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 font-bold" rows={2} placeholder="e.g. Appointment only" />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-6">
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

                    </div>

                    {/* Section 3: Technical Output & Documentation */}
                    <div className="pt-12 border-t border-slate-200">
                        {/* JSON PREVIEW TOGGLE */}
                        <div className="bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden mt-5">
                            <button
                                onClick={() => setShowJson(!showJson)}
                                className="w-full p-6 flex justify-between items-center hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FaFlask className="text-blue-400" />
                                    <span className="text-white text-xs font-black uppercase tracking-widest">JSON Source</span>
                                </div>
                                <div className={`text-slate-400 transition-transform duration-300 ${showJson ? 'rotate-180' : ''}`}>
                                    <FaPlus size={12} />
                                </div>
                            </button>

                            {showJson && (
                                <div className="p-6 pt-0 animate-in slide-in-from-top-4 duration-300">
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(jsonOutput || JSON.stringify(formData, null, 4));
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                                        >
                                            {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-blue-300" />}
                                        </button>
                                        <pre className="p-4 bg-black/50 rounded-xl font-mono text-[8px] text-blue-300 overflow-auto max-h-[400px] custom-scrollbar border border-white/5 select-all">
                                            {jsonOutput || JSON.stringify(formData, null, 4)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.1); border-radius: 10px; }
            `}</style>
        </ProtectedRoute>
    );
}
