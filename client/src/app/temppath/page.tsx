'use client';

import { useState, useEffect } from 'react';
import { FaTooth, FaCopy, FaCheck, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUserMd, FaAward, FaShieldAlt, FaSave, FaHistory, FaCloudUploadAlt, FaEdit, FaTrash, FaHome, FaSearch, FaLightbulb, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { useClinic } from '../../context/ClinicContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');

const DEFAULT_CLINIC_DATA = {
    clinicName: 'ToothOp',
    doctorName: 'ToothOp',
    tagline: "Your Smile's Guardian",
    email: 'care@drToothdental.in',
    phone: '+91 9876543210',
    staffPhone: '+91 9876543211',
    establishedYear: '2014',
    clinicExperience: '10',
    expertise: 'Restorative Dentistry, Oral Surgery, Orthodontics, Cosmetic Dentistry',
    visitPolicy: 'Prior Appointment Recommended. Walk-ins subject to availability.',
    happyCustomers: '5000+',
    successRate: '99.9',
    address: { street: 'Dental Clinic Road, Near Market', city: 'CityZ', state: 'State9', zip: '854105', latitude: '28.55', longitude: '77.25' },
    socialLinks: { facebook: 'https://www.facebook.com/', twitter: 'https://x.com/tweeter?lang=en', linkedin: 'https://www.linkedin.com/', instagram: 'https://www.instagram.com/' },
    timings: { monday: '09:00 AM - 08:00 PM', tuesday: '09:00 AM - 08:00 PM', wednesday: '09:00 AM - 08:00 PM', thursday: '09:00 AM - 08:00 PM', friday: '09:00 AM - 08:00 PM', saturday: '09:00 AM - 06:00 PM', sunday: 'Closed' },
    certifications: 'Best Dentist Award 2022, Certified Implantologist, Member of IDA',
    consultants: [{ name: 'ToothOp', role: 'Chief Surgeon', info: 'BDS, MDS', experience: '12 Years' }, { name: 'Dr. nefario', role: 'Orthodontist', info: 'Expert in Braces & Aligners', experience: '8 Years' }],
    treatments: [
        { name: 'General Consultation', price: '300', description: 'Initial dental check‑up where the dentist examines teeth, gums, and oral health, provides diagnosis.', image: 'images/dentalconsult.webp', icon: 'FaMedkit' },
        { name: 'Scaling & Cleaning', price: '800', description: 'Professional removal of plaque, tartar, and stains from teeth surfaces and gum line to prevent cavities and gum disease.', image: 'https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?q=80&w=687' },
        { name: 'Dental Fillings', price: '1000', description: 'White composite material used to restore decayed or damaged teeth, preserving natural tooth structure.', image: 'https://images.unsplash.com/photo-1694345215004-837b089f620d?q=80&w=1929' },
        { name: 'Tooth Extraction', price: '500', description: 'Removal of damaged or infected tooth when it cannot be saved by other dental treatments.', image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?q=80&w=1631' },
        { name: 'Root Canal Treatment', price: '3500', description: 'Removes infected tooth pulp and seals the canal to save the tooth from extraction and further infection.', image: 'https://www.smilecentre.in/assets/images/treatments/root-canal-procedure.jpg' },
        { name: 'Dental Implants', price: '25000', description: 'Artificial tooth roots used to replace missing teeth, providing stable and long‑lasting support for crowns or dentures.', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg' },
        { name: 'Teeth Whitening', price: '5000', description: 'Professional bleaching process to lighten discolored teeth and improve smile appearance without damaging tooth structure.', image: 'https://www.smilecentre.in/assets/images/treatments/tooth-whitening.jpg' },
        { name: 'Orthodontic Braces', price: '15000', description: 'Metal, ceramic, or clear aligners used to straighten teeth and correct bite issues for improved function and aesthetics.', image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg' },
        { name: 'Crowns & Bridges', price: '3500', description: 'Tooth‑shaped caps that cover damaged teeth or act as replacements for missing teeth, supported by implants or natural teeth.', image: 'https://www.cyprusfamilydental.com/wp-content/uploads/2022/12/Depositphotos_274172422_L.jpg' },
        { name: "Kid's Dentistry", price: '500', description: 'Gentle dental care for children including check‑ups, sealants, fluoride treatments, and age‑appropriate restorative care.', image: 'https://www.dratuljajoo.com/wp-content/uploads/2018/09/kids-dentistry.jpg' },
        { name: 'Full Mouth X-Ray', price: '500', description: 'Comprehensive X‑ray imaging of all teeth and jaw structures for detailed diagnosis of dental conditions.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjXnsLV9glWBJ77_38thCOxDEeWWN0sqTD3A&s' }
    ],
    highlights: [{ title: 'Advanced Technology', description: 'Intraoral scanners & 3D imaging for precise diagnosis.' }, { title: 'Pain-free Dentistry', description: 'Modern anesthesia & laser treatments for comfort.' }, { title: 'Sterile Environment', description: 'Class B Autoclave sterilization protocols.' }],
    seo: { metaTitle: 'Best Dental Clinic | ToothOp', metaDescription: 'Expert dental care by ToothOp. Specializing in Root Canal, Implants, and Braces. Advanced technology and painless treatments in Katihar.', keywords: 'dentist, best dentist, best dentist near me, dentist near me, dental clinic, root canal, teeth whitening, orthodontist' },
    lunchTime: '01:00 PM - 02:00 PM',
    isActive: false
};

export default function TempClinicForm() {
    const { refreshClinicData } = useClinic();
    const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(DEFAULT_CLINIC_DATA)));
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
    const [activeTab, setActiveTab] = useState('branding');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const checkHandoverAuth = () => {
            const auth = localStorage.getItem('handover_authorized');
            const expiry = localStorage.getItem('handover_expiry');
            const now = Date.now();
            if (expiry && now >= Number(expiry)) { localStorage.removeItem('handover_authorized'); localStorage.removeItem('handover_expiry'); setIsAuthorized(false); }
            else if (auth === 'true' && expiry && now < Number(expiry)) setIsAuthorized(true);
        };
        setHasMounted(true); checkHandoverAuth();
        const interval = setInterval(checkHandoverAuth, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'toothop2026') {
            const expiry = Date.now() + 2 * 60 * 60 * 1000;
            localStorage.setItem('handover_authorized', 'true');
            localStorage.setItem('handover_expiry', expiry.toString());
            setIsAuthorized(true);
        } else alert('Incorrect delivery password.');
    };
    const handleLogout = () => { localStorage.removeItem('handover_authorized'); localStorage.removeItem('handover_expiry'); setIsAuthorized(false); };

    useEffect(() => { if (isAuthorized) fetchHistory(); }, [isAuthorized]);
    const fetchHistory = async () => { try { const res = await axios.get(`${API_BASE_URL}/handover/history`); setHistory(res.data); } catch { } };

    const handleSave = async (publish = false) => {
        setIsLoading(true); setSaveStatus(publish ? 'Publishing...' : 'Saving Draft...');
        try {
            await axios.post(`${API_BASE_URL}/handover/save`, { handoverformId: handoverId, jsondata: formData });
            setJsonOutput(JSON.stringify(formData, null, 4));
            if (publish) { await axios.post(`${API_BASE_URL}/handover/activate/${handoverId}`); await refreshClinicData(); setSaveStatus(`Success! Published: ${handoverId}`); }
            else setSaveStatus('Draft saved successfully!');
            const historyRes = await axios.get(`${API_BASE_URL}/handover/history`);
            const newHistory = historyRes.data; setHistory(newHistory);
            if (publish) { const nextVersion = newHistory.length + 1; setHandoverId(`handover_v${nextVersion}`); }
            setTimeout(() => setSaveStatus(''), 5000);
        } catch { setSaveStatus(`Error during ${publish ? 'publish' : 'save'}`); }
        finally { setIsLoading(false); }
    };

    const loadFromHistory = (item: any) => {
        const loadedData = item.jsondata;
        setFormData((prev: any) => ({ ...prev, ...loadedData, address: { ...prev.address, ...(loadedData.address || {}) }, socialLinks: { ...prev.socialLinks, ...(loadedData.socialLinks || {}) }, timings: { ...prev.timings, ...(loadedData.timings || {}) }, seo: { ...prev.seo, ...(loadedData.seo || {}) } }));
        setHandoverId(item.handoverformId); setJsonOutput(JSON.stringify(item.jsondata, null, 4)); window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) { const [parent, child] = name.split('.'); setFormData((prev: any) => ({ ...prev, [parent]: { ...(prev[parent as keyof typeof prev] as any), [child]: value } })); }
        else setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
    const autoFillTreatmentDescriptions = () => {
        const defaultMap = new Map(DEFAULT_CLINIC_DATA.treatments.map(t => [t.name.toLowerCase(), t.description]));
        setFormData((prev: any) => ({
            ...prev,
            treatments: prev.treatments.map((t: any) => {
                const defaultDesc = defaultMap.get(t.name.toLowerCase());
                if ((!t.description || t.description === 'Treatment details provided by clinic.') && defaultDesc) {
                    return { ...t, description: defaultDesc };
                }
                return t;
            })
        }));
    };

    const handleListChange = (listName: 'treatments' | 'consultants' | 'highlights', index: number, field: string, value: string) => {
        const newList = [...formData[listName]]; // @ts-ignore
        newList[index][field] = value; setFormData((prev: any) => ({ ...prev, [listName]: newList }));
    };
    const addListItem = (listName: 'treatments' | 'consultants' | 'highlights') => {
        let newItem: any;
        if (listName === 'treatments') newItem = { name: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1597764650032-135acc9e83f?q=80&w=2070' };
        else if (listName === 'consultants') newItem = { name: '', role: '', info: '', experience: '' };
        else newItem = { title: '', description: '' };
        setFormData((prev: any) => ({ ...prev, [listName]: [...prev[listName], newItem] }));
    };
    const removeListItem = (listName: 'treatments' | 'consultants' | 'highlights', index: number) => { setFormData((prev: any) => ({ ...prev, [listName]: prev[listName].filter((_: any, i: number) => i !== index) })); };
    const deleteFromHistory = async (handoverformId: string) => {
        if (!confirm(`Are you sure you want to delete ${handoverformId}?`)) return;
        try { await axios.delete(`${API_BASE_URL}/handover/${handoverformId}`); const historyRes = await axios.get(`${API_BASE_URL}/handover/history`); setHistory(historyRes.data); setSaveStatus('Version deleted successfully'); setTimeout(() => setSaveStatus(''), 3000); } catch { setSaveStatus('Error deleting version'); }
    };
    const activateVersion = async (handoverformId: string) => {
        setIsLoading(true);
        try { await axios.post(`${API_BASE_URL}/handover/activate/${handoverformId}`); const historyRes = await axios.get(`${API_BASE_URL}/handover/history`); setHistory(historyRes.data); await refreshClinicData(); const activeItem = historyRes.data.find((h: any) => h.handoverformId === handoverformId); if (activeItem) loadFromHistory(activeItem); setSaveStatus(`Version ${handoverformId} activated!`); setTimeout(() => setSaveStatus(''), 5000); } catch { setSaveStatus('Error activating version'); } finally { setIsLoading(false); }
    };
    const deactivateVersion = async () => {
        setIsLoading(true);
        try { await axios.post(`${API_BASE_URL}/handover/deactivate`); const historyRes = await axios.get(`${API_BASE_URL}/handover/history`); setHistory(historyRes.data); await refreshClinicData(); const cleanDefault = JSON.parse(JSON.stringify(DEFAULT_CLINIC_DATA)); setFormData(cleanDefault); setHandoverId('handover_v1'); setJsonOutput(JSON.stringify(cleanDefault, null, 4)); window.scrollTo({ top: 0, behavior: 'smooth' }); setSaveStatus('Reverted to default.'); setTimeout(() => setSaveStatus(''), 5000); } catch { setSaveStatus('Error deactivating version'); } finally { setIsLoading(false); }
    };

    const tabs = [
        { id: 'branding', label: 'Branding', desc: 'Clinic & doctor' },
        { id: 'team', label: 'Team', desc: 'Consultants' },
        { id: 'treatments', label: 'Treatments', desc: 'Services & price' },
        { id: 'highlights', label: 'Highlights', desc: 'Trust badges' },
        { id: 'contact', label: 'Contact', desc: 'Address & social' },
        { id: 'timings', label: 'Timings', desc: 'Hours & lunch' },
        { id: 'seo', label: 'SEO', desc: 'Search' },
    ];

    if (!hasMounted) return <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[24px] border border-black/5 p-8 shadow-sm">
                    <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-medium text-neutral-500 hover:text-[#0a0a0b]"><FaShieldAlt size={12} /> Back to site</Link>
                    <div className="mt-6 text-center">
                        <span className="w-12 h-12 rounded-2xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-700"><FaShieldAlt size={18} /></span>
                        <h1 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">Restricted — Handover</h1>
                        <p className="text-[13px] leading-6 text-neutral-500 mt-1">Enter delivery password to edit live site config. Access expires in 2 hours.</p>
                    </div>
                    <form onSubmit={handleLogin} className="mt-6 space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoFocus className="w-full h-[48px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-center tracking-widest text-[14px] font-medium" />
                        <button className="w-full h-[48px] rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition">Verify Access</button>
                    </form>
                </div>
            </div>
        );
    }

    const activeVersion = history.find(h => h.isActive)?.handoverformId || 'Default';
    const filteredTabs = tabs.filter(t => !searchQuery || t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#fcfcfc]">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/5">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-[#0a0a0b] text-white grid place-items-center"><FaTooth size={14} /></span>
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] leading-none truncate">Handover — Live Editor</div>
                                <div className="text-[11px] text-neutral-500 flex items-center gap-2">Editing <span className="font-mono text-[#0a0a0b]">{handoverId}</span> <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${activeVersion === handoverId ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{activeVersion === handoverId ? '● Live' : '○ Draft'}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/5 text-[12px] font-medium hover:border-black/10"><FaHome size={11} /> Preview</Link>
                            <button onClick={handleLogout} className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#f5f5f3] border border-black/5 text-[12px] font-medium text-neutral-700 hover:bg-white">Logout</button>
                            <span className="w-px h-6 bg-black/5 hidden sm:block" />
                            <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-500">Live: <span className="font-mono font-medium text-[#0a0a0b]">{activeVersion}</span></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    {/* Guide + Status */}
                    <div className="grid lg:grid-cols-3 gap-4 mb-6">
                        <div className="lg:col-span-2 bg-white rounded-[20px] border border-black/5 p-5 flex gap-4">
                            <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-600 grid place-items-center shrink-0"><FaLightbulb size={12} /></span>
                            <div>
                                <div className="text-[12px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">How it works</div>
                                <p className="text-[12px] leading-5 text-neutral-500 mt-1"><span className="font-medium text-emerald-700">Live</span> = public site. <span className="font-medium text-[#0a0a0b]">Editing</span> = draft in form. <span className="font-medium">Save Draft</span> keeps it private, <span className="font-medium">Go Live</span> publishes instantly. History on right lets you load/activate any version.</p>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0b] text-white rounded-[20px] p-5 flex flex-col justify-center">
                            <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">Realtime</div>
                            <div className="text-[13px] font-medium mt-1">Changes appear on site <span className="text-emerald-400">immediately</span> after Go Live.</div>
                            <div className="mt-2 text-[11px] text-white/50">No confusion — draft vs live is clearly labeled above.</div>
                        </div>
                    </div>

                    {saveStatus && (
                        <div className={`mb-4 p-3 rounded-2xl border text-[13px] font-medium flex items-center gap-2 ${saveStatus.includes('Error') ? 'bg-rose-50 text-rose-700 border-rose-100' : saveStatus.includes('Success') || saveStatus.includes('Draft') || saveStatus.includes('Published') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            <span className={`w-2 h-2 rounded-full ${saveStatus.includes('Error') ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} /> {saveStatus}
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6 items-start">
                        {/* Left: Version control + History */}
                        <div className="space-y-4 lg:sticky lg:top-[80px]">
                            <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-sm">
                                <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaCloudUploadAlt size={11} className="text-neutral-400" /> Version Control</h3>
                                <div className="mt-3">
                                    <div className="text-[11px] font-medium text-neutral-500">Active (Live) Version</div>
                                    <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-full bg-emerald-50 border border-emerald-100">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[13px] font-semibold text-emerald-800 truncate">{activeVersion}</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Editing (Draft) ID</label>
                                    <input value={handoverId} onChange={(e) => setHandoverId(e.target.value)} placeholder="e.g. march_promo_v1" className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] font-medium font-mono" />
                                    <p className="text-[11px] text-neutral-400 mt-1">This ID is what you will save/overwrite.</p>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button onClick={() => handleSave(false)} disabled={isLoading} className="h-[44px] rounded-full bg-white border border-black/10 text-[#0a0a0b] text-[12px] font-medium hover:bg-[#fcfcfc] active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-40"><FaSave size={12} /> Save Draft</button>
                                    <button onClick={() => handleSave(true)} disabled={isLoading} className="h-[44px] rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-40"><FaGlobe size={12} /> Go Live</button>
                                </div>
                                <p className="text-[11px] text-neutral-400 text-center mt-2">Go Live publishes instantly. Save Draft keeps it private.</p>
                            </div>

                            <div className="bg-white rounded-[20px] border border-black/5 shadow-sm overflow-hidden flex flex-col max-h-[420px]">
                                <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-2"><FaHistory size={11} /> History</h3>
                                    <span className="text-[11px] px-2 py-1 rounded-full bg-[#f5f5f3] border border-black/5 font-medium text-neutral-600">{history.length} saved</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {history.length ? [...history].reverse().map(item => (
                                        <div key={item._id} className={`p-3 rounded-2xl border flex flex-col gap-2 ${item.isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-[#fcfcfc] border-black/5 hover:bg-white'}`}>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-[12px] font-semibold font-mono truncate ${item.isActive ? 'text-emerald-800' : 'text-[#0a0a0b]'}`}>{item.handoverformId}</span>
                                                {item.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-medium">Live</span>}
                                            </div>
                                            <div className="text-[11px] text-neutral-500">{new Date(item.updatedAt).toLocaleString()}</div>
                                            <div className="flex gap-1.5">
                                                {!item.isActive ? (
                                                    <button onClick={() => activateVersion(item.handoverformId)} className="flex-1 h-8 rounded-full bg-emerald-500 text-white text-[11px] font-medium hover:bg-emerald-600 flex items-center justify-center gap-1"><FaGlobe size={10} /> Live</button>
                                                ) : (
                                                    <button onClick={deactivateVersion} className="flex-1 h-8 rounded-full bg-white border border-black/10 text-[11px] font-medium hover:bg-black hover:text-white flex items-center justify-center gap-1">Revert</button>
                                                )}
                                                <button onClick={() => loadFromHistory(item)} className="flex-1 h-8 rounded-full bg-white border border-black/5 text-[11px] font-medium hover:border-black/15 flex items-center justify-center gap-1"><FaEdit size={10} /> Load</button>
                                                <button onClick={() => deleteFromHistory(item.handoverformId)} className="w-8 h-8 rounded-full bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 grid place-items-center"><FaTrash size={10} /></button>
                                            </div>
                                        </div>
                                    )) : <div className="py-10 text-center text-[12px] text-neutral-400">No history yet — save a draft to begin.</div>}
                                </div>
                            </div>

                            <div className="bg-white rounded-[20px] border border-black/5 p-4">
                                <button onClick={() => setShowJson(!showJson)} className="w-full flex items-center justify-between text-[12px] font-medium text-neutral-700 hover:text-[#0a0a0b]"><span className="flex items-center gap-2"><FaSearch size={11} /> JSON preview</span><span className={`transition ${showJson ? 'rotate-180' : ''}`}>⌄</span></button>
                                {showJson && (
                                    <div className="mt-3 relative">
                                        <button onClick={() => { navigator.clipboard.writeText(jsonOutput || JSON.stringify(formData, null, 4)); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center text-neutral-600 hover:bg-black hover:text-white transition">
                                            {copied ? <FaCheck size={11} className="text-emerald-500" /> : <FaCopy size={11} />}
                                        </button>
                                        <pre className="p-3 bg-[#0a0a0b] text-white/80 rounded-2xl text-[11px] font-mono overflow-auto max-h-[300px] border border-white/10">{jsonOutput || JSON.stringify(formData, null, 4)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Tabbed Form */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Tabs */}
                            <div className="bg-white rounded-full border border-black/5 p-1 flex gap-1 overflow-x-auto">
                                <div className="relative flex-1 flex gap-1">
                                    <div className="flex-1 relative">
                                        <FaSearch size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter tabs..." className="w-full h-8 pl-8 pr-3 rounded-full bg-[#fcfcfc] border border-black/5 text-[12px] outline-none focus:bg-white focus:border-black/10" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filteredTabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-[12px] font-medium border transition ${activeTab === tab.id ? 'bg-[#0a0a0b] text-white border-black shadow-sm' : 'bg-white text-neutral-600 border-black/5 hover:border-black/10'}`}>
                                        {tab.label} <span className={`ml-1 text-[10px] ${activeTab === tab.id ? 'text-white/60' : 'text-neutral-400'}`}>{tab.desc}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Editing banner */}
                            <div className="bg-white rounded-[20px] border border-black/5 p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[12px]"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Editing <span className="font-mono font-semibold text-[#0a0a0b]">{handoverId}</span> <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${activeVersion === handoverId ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{activeVersion === handoverId ? 'Live draft' : 'Draft'}</span></div>
                                <div className="text-[11px] text-neutral-500">Changes save to this ID only. Use Go Live to publish.</div>
                            </div>

                            {/* Tab contents */}
                            <div className="space-y-4">
                                {activeTab === 'branding' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 space-y-4 shadow-sm">
                                        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-[#0a0a0b] rounded-full" /> Branding Essentials</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Clinic Name</label><input name="clinicName" value={formData.clinicName} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Doctor Name</label><input name="doctorName" value={formData.doctorName} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Tagline</label><input name="tagline" value={formData.tagline} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Expertise</label><input name="expertise" value={formData.expertise} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Est. Year</label><input name="establishedYear" value={formData.establishedYear} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Lunch Break</label><input name="lunchTime" value={formData.lunchTime} onChange={handleChange} placeholder="01:00 PM - 02:00 PM" className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'team' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-violet-500 rounded-full" /> Team Members</h3>
                                            <button onClick={() => addListItem('consultants')} className="px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[12px] font-medium hover:bg-white">+ Add</button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.consultants.map((c: any, i: number) => (
                                                <div key={i} className="p-4 rounded-2xl bg-[#fcfcfc] border border-black/5 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-medium text-neutral-500">Member #{i + 1}</span>
                                                        <button onClick={() => removeListItem('consultants', i)} className="w-7 h-7 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50"><FaTrash size={11} /></button>
                                                    </div>
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        <input placeholder="Name" value={c.name} onChange={e => handleListChange('consultants', i, 'name', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                        <input placeholder="Role" value={c.role} onChange={e => handleListChange('consultants', i, 'role', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                        <input placeholder="Experience" value={c.experience} onChange={e => handleListChange('consultants', i, 'experience', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                        <input placeholder="Info / Credentials" value={c.info} onChange={e => handleListChange('consultants', i, 'info', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'treatments' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-emerald-500 rounded-full" /> Treatments & Pricing</h3>
                                            <div className="flex items-center gap-2">
                                                <button onClick={autoFillTreatmentDescriptions} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-medium hover:bg-emerald-100 transition">✨ Auto-fill Descriptions</button>
                                                <button onClick={() => addListItem('treatments')} className="px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[12px] font-medium hover:bg-white transition">+ Add</button>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {formData.treatments.map((t: any, i: number) => (
                                                <div key={i} className="p-4 rounded-2xl bg-[#fcfcfc] border border-black/5 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-medium text-neutral-500">Treatment #{i + 1}</span>
                                                        <button onClick={() => removeListItem('treatments', i)} className="w-7 h-7 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50"><FaTrash size={11} /></button>
                                                    </div>
                                                    <input placeholder="Name" value={t.name} onChange={e => handleListChange('treatments', i, 'name', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15 w-full" />
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px]">₹</span>
                                                        <input placeholder="Price" value={t.price} onChange={e => handleListChange('treatments', i, 'price', e.target.value)} className="h-[40px] pl-7 pr-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15 w-full" />
                                                    </div>
                                                    <textarea placeholder="Description" value={t.description} onChange={e => handleListChange('treatments', i, 'description', e.target.value)} rows={2} className="w-full p-3 rounded-2xl bg-white border border-black/5 outline-none text-[13px] focus:border-black/15 resize-none" />
                                                    <input placeholder="Image URL" value={t.image} onChange={e => handleListChange('treatments', i, 'image', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[12px] focus:border-black/15 w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'highlights' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-amber-500 rounded-full" /> Highlights</h3>
                                            <button onClick={() => addListItem('highlights')} className="px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[12px] font-medium hover:bg-white">+ Add</button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.highlights.map((h: any, i: number) => (
                                                <div key={i} className="p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 flex gap-3 items-center">
                                                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                                                        <input placeholder="Title" value={h.title} onChange={e => handleListChange('highlights', i, 'title', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                        <input placeholder="Description" value={h.description} onChange={e => handleListChange('highlights', i, 'description', e.target.value)} className="h-[40px] px-3 rounded-full bg-white border border-black/5 outline-none text-[13px] focus:border-black/15" />
                                                    </div>
                                                    <button onClick={() => removeListItem('highlights', i)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50 shrink-0"><FaTrash size={11} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'contact' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm space-y-4">
                                        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-rose-500 rounded-full" /> Contact & Address</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Phone (Official)</label><input name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Staff Phone (WhatsApp)</label><input name="staffPhone" value={formData.staffPhone} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Email</label><input name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Street</label><input name="address.street" value={formData.address.street} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                                                <input name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className="h-[44px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                                <input name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} className="h-[44px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                                <input name="address.zip" placeholder="ZIP" value={formData.address.zip} onChange={handleChange} className="h-[44px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                                                <div><label className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-500">Latitude</label><input name="address.latitude" value={formData.address.latitude} onChange={handleChange} className="mt-1 w-full h-[40px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                                <div><label className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-500">Longitude</label><input name="address.longitude" value={formData.address.longitude} onChange={handleChange} className="mt-1 w-full h-[40px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            </div>
                                            <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Visit Policy</label><textarea name="visitPolicy" value={formData.visitPolicy} onChange={handleChange} rows={2} className="mt-1 w-full p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium resize-none" /></div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                            {Object.keys(formData.socialLinks).map(platform => (
                                                <div key={platform}><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 capitalize">{platform}</label><input name={`socialLinks.${platform}`} value={formData.socialLinks[platform as keyof typeof formData.socialLinks]} onChange={handleChange} className="mt-1 w-full h-[40px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'timings' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm space-y-4">
                                        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-emerald-500 rounded-full" /> Timings & Lunch</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {Object.keys(formData.timings).map(day => (
                                                <div key={day} className="flex items-center gap-2">
                                                    <span className="w-20 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500 capitalize">{day}</span>
                                                    <input name={`timings.${day}`} value={formData.timings[day as keyof typeof formData.timings]} onChange={handleChange} className="flex-1 h-[40px] px-3 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" />
                                                </div>
                                            ))}
                                        </div>
                                        <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Lunch Break</label><input name="lunchTime" value={formData.lunchTime} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Happy Patients</label><input name="happyCustomers" value={formData.happyCustomers} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Success Rate</label><input name="successRate" value={formData.successRate} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                            <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Experience (yrs)</label><input name="clinicExperience" value={formData.clinicExperience} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'seo' && (
                                    <div className="bg-white rounded-[20px] border border-black/5 p-6 shadow-sm space-y-4">
                                        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2"><span className="w-1 h-4 bg-blue-500 rounded-full" /> SEO</h3>
                                        <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Meta Title</label><input name="seo.metaTitle" value={formData.seo.metaTitle} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                        <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Keywords</label><input name="seo.keywords" value={formData.seo.keywords} onChange={handleChange} className="mt-1 w-full h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium" /></div>
                                        <div><label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Meta Description</label><textarea name="seo.metaDescription" value={formData.seo.metaDescription} onChange={handleChange} rows={3} className="mt-1 w-full p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] font-medium resize-none" /></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky save bar */}
                <div className="fixed bottom-0 inset-x-0 z-20 bg-white/80 backdrop-blur-xl border-t border-black/5">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-3">
                        <div className="text-[12px] text-neutral-500 hidden sm:block">Editing <span className="font-mono font-medium text-[#0a0a0b]">{handoverId}</span> · Live is <span className="font-mono text-[#0a0a0b]">{activeVersion}</span></div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[11px] text-neutral-500 hidden sm:inline">No confusion — draft stays private until Go Live</span>
                            <button onClick={() => handleSave(false)} disabled={isLoading} className="h-9 px-5 rounded-full bg-white border border-black/10 text-[12px] font-medium hover:bg-[#fcfcfc] disabled:opacity-40 flex items-center gap-1.5"><FaSave size={11} /> Save Draft</button>
                            <button onClick={() => handleSave(true)} disabled={isLoading} className="h-9 px-5 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium hover:bg-black disabled:opacity-40 flex items-center gap-1.5"><FaCloudUploadAlt size={11} /> Go Live</button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
