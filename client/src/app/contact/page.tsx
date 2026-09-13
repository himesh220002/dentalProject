'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from '../../context/AuthContext';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaCalendarCheck, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import TreatmentIcon from '../../components/TreatmentIcon';

const formatSlot = (time24: string) => {
    if (!time24) return '';
    const [hour, min] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${min.toString().padStart(2, '0')} ${period}`;
};

const BookingSummary = ({ formData, language, t, blinking = true }: any) => (
    <div className="mb-6 rounded-[20px] border border-black/5 bg-[#fcfcfc] p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden">
        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0b] animate-pulse" /> Booking summary
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 w-full max-w-full">
            <div className={`rounded-2xl border px-4 py-3 min-w-0 w-full max-w-full overflow-hidden ${formData.requestedTreatment ? 'bg-white border-black/10 shadow-sm' : 'bg-white border-black/5'}`}>
                <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Treatment</div>
                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] truncate mt-1 min-w-0">{formData.requestedTreatment || 'Not selected'}</div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 min-w-0 w-full max-w-full overflow-hidden ${formData.requestedDate ? 'bg-white border-black/10 shadow-sm' : 'bg-white border-black/5'}`}>
                <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Date</div>
                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1 truncate min-w-0">{formData.requestedDate || 'Not selected'}</div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 min-w-0 w-full max-w-full overflow-hidden ${formData.requestedTime ? 'bg-white border-black/10 shadow-sm' : 'bg-white border-black/5'}`}>
                <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Time</div>
                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1 truncate min-w-0">{formData.requestedTime ? formatSlot(formData.requestedTime) : 'Not selected'}</div>
            </div>
        </div>
    </div>
);

function ContactContent() {
    const { clinicData, language } = useClinic();
    const t = translations[language];
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const phone = clinicData?.phone || '+91 98765 43210';
    const staffPhone = clinicData?.staffPhone || phone;
    const email = clinicData?.email || 'care@drToothdental.in';
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Dental Clinic Road, Katihar, Bihar - 854105';
    const whatsappLink = `https://wa.me/${staffPhone.replace(/\D/g, '')}`;
    const latitude = clinicData?.address.latitude || '28.55';
    const longitude = clinicData?.address.longitude || '77.25';

    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '', requestedTreatment: '', requestedDate: '', requestedTime: '' });
    const [treatments, setTreatments] = useState<any[]>([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [generalStatus, setGeneralStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [density, setDensity] = useState<any>({});
    const [suggestedDates, setSuggestedDates] = useState<any[]>([]);
    const [isAutoBookingEnabled, setIsAutoBookingEnabled] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [guestAppointments, setGuestAppointments] = useState<any[]>([]);
    const [editingAptId, setEditingAptId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ date: '', time: '' });
    const [savingEdit, setSavingEdit] = useState(false);
    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
    const [loadingGuestApts, setLoadingGuestApts] = useState(false);

    useEffect(() => {
        if (!isAutoBookingEnabled) return;
        let step = 1;
        if (formData.name && formData.phone.length === 10) { step = 2; if (formData.requestedTreatment) { step = 3; } }
        setCurrentStep(step);
    }, [formData.name, formData.phone, formData.requestedTreatment, formData.requestedDate, formData.requestedTime, isAutoBookingEnabled]);

    useEffect(() => {
        const fetchTreatments = async () => {
            try { const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`); setTreatments(res.data); } catch { }
        };
        const fetchDensity = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density`);
                setDensity(res.data);
                const allNextDays = [];
                for (let i = 0; i <= 14; i++) {
                    const d = new Date(); d.setDate(d.getDate() + i);
                    if (d.getDay() === 0) continue;
                    const dateStr = d.toISOString().split('T')[0];
                    const count = res.data[dateStr]?.count || 0;
                    const closed = res.data[dateStr]?.closed || false;
                    allNextDays.push({ date: d, dateStr, count, closed, daysFromToday: i, display: d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) });
                }
                const sortedSuggestions = allNextDays.filter(d => !d.closed).slice(0, 5);
                setSuggestedDates(sortedSuggestions);
                const next3Closed = allNextDays.find(d => d.daysFromToday <= 2 && d.closed);
                if (next3Closed) setStatus({ type: 'info', message: t.leaveAlert.replace('{date}', next3Closed.display) });
            } catch { }
        };
        const fetchConfig = async () => {
            try { const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/automated_booking`); setIsAutoBookingEnabled(res.data?.value === 'true'); } catch { } finally { setConfigLoading(false); }
        };
        fetchTreatments(); fetchDensity(); fetchConfig();
    }, [language]);

    const fetchAllRecentBookings = async () => {
        try {
            setLoadingGuestApts(true);
            let appointments: any[] = [];
            if (session?.user) {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                // @ts-ignore
                const userRes = await axios.get(`${backendUrl}/api/auth/google/${session.user.id}`);
                const patientId = userRes.data?.patientId?._id;
                if (patientId) { const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`); appointments = aptRes.data; }
            }
            const storedIds = localStorage.getItem('toothop_guest_bookings');
            if (storedIds) {
                const ids = JSON.parse(storedIds);
                if (ids.length > 0) {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/bulk-retrieve`, { ids });
                    const localApts = res.data;
                    localApts.forEach((apt: any) => { if (!appointments.find(a => a._id === apt._id)) appointments.push(apt); });
                }
            }
            setGuestAppointments(appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2));
        } catch { } finally { setLoadingGuestApts(false); }
    };
    useEffect(() => { fetchAllRecentBookings(); }, [session]);

    const handleCancelGuestBooking = async (id: string) => {
        if (!confirm(t.confirmCancel)) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`);
            setGuestAppointments(prev => prev.filter(a => a._id !== id));
            const storedIds = localStorage.getItem('toothop_guest_bookings');
            if (storedIds) { const ids = JSON.parse(storedIds); const newIds = ids.filter((sid: string) => sid !== id); localStorage.setItem('toothop_guest_bookings', JSON.stringify(newIds)); }
            setStatus({ type: 'info', message: language === 'hi' ? 'अपॉइंटमेंट सफलतापूर्वक रद्द कर दिया गया।' : 'Appointment cancelled successfully.' });
            setTimeout(() => setStatus({ type: '', message: '' }), 5000);
        } catch { }
    };
    const handleUpdateBooking = async (id: string) => {
        if (!editData.date || !editData.time) return;
        setSavingEdit(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`, { date: editData.date, time: editData.time, status: 'Scheduled' });
            setEditingAptId(null); fetchAllRecentBookings(); setStatus({ type: 'success', message: t.updateSuccess });
        } catch { } finally { setSavingEdit(false); }
    };
    useEffect(() => {
        const fetchPatientProfile = async () => {
            if (!session?.user) return;
            try {
                // @ts-ignore
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/${session.user.id}`);
                if (res.data?.patientId) {
                    const patient = res.data.patientId;
                    setFormData(prev => ({ ...prev, name: patient.name || prev.name, phone: patient.contact === '-__-' ? prev.phone : (patient.contact || prev.phone), email: patient.email || prev.email }));
                }
            } catch { }
        };
        fetchPatientProfile();
    }, [session]);
    useEffect(() => {
        const treatment = searchParams.get('treatment');
        if (treatment) {
            setFormData(prev => ({ ...prev, requestedTreatment: treatment, message: t.placeholderMsg.replace('...', treatment.toUpperCase()) }));
            const newUrl = window.location.pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, router, language, t.placeholderMsg]);

    const suggestions = treatments.map((t: any, idx: number) => ({ label: t.name, value: t.name }));

    const handleSuggestionClick = (label: string) => {
        const textToAppend = formData.message ? `\n${t.discuss}: ${label}, ` : `${t.discuss}: ${label}, `;
        setFormData(prev => ({ ...prev, message: prev.message + textToAppend }));
    };
    const fetchAvailableTimes = async (dateStr: string) => {
        setLoadingTimes(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=14`);
            const dayData = res.data[dateStr];
            if (dayData?.closed) { setAvailableTimes([]); return; }
            const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
            const booked = dayData?.slots || [];
            const lunchTimeRange = clinicData?.lunchTime || "01:00 PM - 02:00 PM";
            const parseTimeRange = (range: string) => {
                try {
                    const [startPart, endPart] = range.split('-').map(p => p.trim());
                    const parseH = (t: string) => { const [time, period] = t.split(' '); let [h] = time.split(':').map(Number); if (period === 'PM' && h < 12) h += 12; if (period === 'AM' && h === 12) h = 0; return h; };
                    return [parseH(startPart), parseH(endPart)];
                } catch { return [13, 14]; }
            };
            const [lunchStart, lunchEnd] = parseTimeRange(lunchTimeRange);
            const available = allSlots.filter(slot => { const hour = parseInt(slot.split(':')[0]); const isBooked = booked.some((b: string) => b.startsWith(slot)); const isLunch = hour >= lunchStart && hour < lunchEnd; return !isBooked && !isLunch; });
            setAvailableTimes(available);
        } catch { } finally { setLoadingTimes(false); }
    };
    const handleDateSuggestion = (item: any) => {
        if (isAutoBookingEnabled) { setFormData(prev => ({ ...prev, requestedDate: item.dateStr, requestedTime: '' })); fetchAvailableTimes(item.dateStr); setCurrentStep(3); return; }
        const textToAppend = `\n${t.suggestedApt}: ${item.display}, `;
        setFormData(prev => ({ ...prev, message: prev.message + textToAppend }));
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setStatus({ type: '', message: '' });
        try {
            const selectedTreat = treatments.find(t => t.name === formData.requestedTreatment);
            const amountVal = selectedTreat ? parseFloat(selectedTreat.price.replace(/\D/g, '')) : 0;
            const clinicName = clinicData?.clinicName || "ToothOp";
            const enthusiasticMessage = `Hi *${clinicName}*! 👋 I just booked an appointment through your website. I’m looking forward to getting my smile checked! 🦷\n\n*Details:*\nTreatment: *${formData.requestedTreatment}*\n📅 *Date:* ${formData.requestedDate}\n⏰ *Time:* ${formData.requestedTime}\n👤 *Name:* ${formData.name}\n\nSee you soon!`;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                ...formData, message: (isAutoBookingEnabled && formData.requestedTreatment) ? enthusiasticMessage : (formData.message || `Consultation for ${formData.requestedTreatment}`), amount: amountVal, // @ts-ignore
                userId: session?.user?.id
            });
            const isAutomatedSuccess = res.data?.isAutomated; const appointmentId = res.data?.appointmentId; const bId = res.data?.bookingId;
            if (bId) setConfirmedBookingId(bId);
            if (isAutomatedSuccess && appointmentId) { const existingBookings = JSON.parse(localStorage.getItem('toothop_guest_bookings') || '[]'); if (!existingBookings.includes(appointmentId)) { existingBookings.push(appointmentId); localStorage.setItem('toothop_guest_bookings', JSON.stringify(existingBookings)); } fetchAllRecentBookings(); }
            setStatus({ type: 'success', message: isAutomatedSuccess ? t.bookingConfirmed : t.detailsSaved });
            const clinicPhone = staffPhone.replace(/\D/g, '');
            let messageText = "";
            if (isAutomatedSuccess) messageText = enthusiasticMessage;
            else messageText = language === 'hi' ? `नमस्ते डॉक्टर, मैं *${formData.name}* हूँ।\nमैं आपसे इस विषय में परामर्श करना चाहता/चाहती हूँ:- \n\n${formData.message}\n\n*मेरा फोन:* ${formData.phone}` : `Hello Doctor, I'm *${formData.name}*.\nI'd like to consult regarding:- \n\n${formData.message}.\n\n*My contact:* ${formData.phone}`;
            const encodedMessage = encodeURIComponent(messageText);
            const finalWhatsappLink = `https://wa.me/${clinicPhone}?text=${encodedMessage}`;
            if (isAutomatedSuccess) {
                setTimeout(() => {
                    window.open(finalWhatsappLink, '_blank');
                    const staffPhoneNum = staffPhone.replace(/\D/g, '');
                    const staffMsg = `*New Lead/Booking Alert!* 📧\n\nName: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}\n\n*Treatment:* ${formData.requestedTreatment}\n*Date:* ${formData.requestedDate}\n*Time:* ${formData.requestedTime}`;
                    const staffWhatsappUrl = `https://wa.me/91${staffPhoneNum}?text=${encodeURIComponent(staffMsg)}`;
                    setTimeout(() => { window.open(staffWhatsappUrl, '_blank'); }, 2000);
                }, 3000);
            } else { setTimeout(() => { window.open(finalWhatsappLink, '_blank'); }, 3000); }
        } catch (error) { setStatus({ type: 'error', message: language === 'hi' ? t.failedTryAgain + ' ' + ((error as any).response?.data?.message || '') : t.failedTryAgain + ' ' + ((error as any).response?.data?.message || '') }); }
        finally { setSubmitting(false); }
    };
    const handleBookAnother = () => { setFormData({ name: '', phone: '', email: '', message: '', requestedTreatment: '', requestedDate: '', requestedTime: '' }); setCurrentStep(1); setStatus({ type: '', message: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    return (
        <div className="bg-[#fcfcfc] min-h-screen w-full overflow-x-clip">
            <section className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 overflow-x-clip">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Contact ]</div>
                    <h1 className="mt-3 text-[32px] sm:text-[44px] font-semibold tracking-[-0.03em] leading-[1.02] text-[#0a0a0b]">{t.getIntouch}</h1>
                    <p className="mt-3 text-[14px] leading-7 text-neutral-600 max-w-[560px]">{t.contactHeroSub}</p>
                    {isAutoBookingEnabled && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium tracking-[-0.01em]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Automated booking enabled
                        </div>
                    )}
                </div>

                <div className="mt-10 grid lg:grid-cols-3 gap-6 lg:gap-8 items-start w-full max-w-full min-w-0">
                    {/* Left info — desktop */}
                    <div className="hidden lg:block space-y-4 sticky top-24 min-w-0">
                        {[
                            { icon: <FaPhoneAlt size={14} />, title: t.callNow, desc: clinicData?.timings.monday || t.timingsSub, value: staffPhone, href: `tel:${staffPhone.replace(/\D/g, '')}`, bg: 'bg-[#f5f5f3]' },
                            { icon: <FaWhatsapp size={14} />, title: 'WhatsApp', desc: t.chatHelp, value: t.chatNow, href: whatsappLink, bg: 'bg-emerald-50' },
                            { icon: <FaMapMarkerAlt size={14} />, title: t.location, desc: address, value: null, href: null, bg: 'bg-[#f5f5f3]' },
                        ].map(card => (
                            <div key={card.title} className="bg-white rounded-[20px] border border-black/5 p-5 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <span className={`w-9 h-9 rounded-xl border border-black/5 grid place-items-center ${card.bg} text-neutral-700`}>{card.icon}</span>
                                    <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{card.title}</h3>
                                </div>
                                <p className="text-[13px] leading-6 text-neutral-600 mt-3">{card.desc}</p>
                                {card.href && card.value && (
                                    <a href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} className="mt-3 inline-flex text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] hover:underline underline-offset-4">{card.value} →</a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right form */}
                    <div className="lg:col-span-2 space-y-6 min-w-0 w-full max-w-full overflow-hidden">
                        <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden w-full max-w-full min-w-0">
                            <div className="px-6 sm:px-8 py-6 border-b border-black/5 flex items-center justify-between">
                                <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b] inline-flex items-center gap-2"><FaCalendarCheck className="text-neutral-400" size={14} /> {isAutoBookingEnabled ? t.appointmentBooking : t.send}</h2>
                                {isAutoBookingEnabled && (
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map(step => <span key={step} className={`w-8 h-1.5 rounded-full transition-colors ${currentStep >= step ? 'bg-[#0a0a0b]' : 'bg-black/5'}`} />)}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 sm:p-8 w-full max-w-full min-w-0 overflow-hidden">
                                {status.type === 'success' ? (
                                    <div className="space-y-6 py-2">
                                        <div className="text-center space-y-3">
                                            <span className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 grid place-items-center mx-auto"><FaCheckCircle size={20} /></span>
                                            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{t.bookingConfirmed}</h3>
                                            <p className="text-[12px] tracking-[0.08em] uppercase font-medium text-neutral-500">{t.detailsSaved}</p>
                                        </div>
                                        <div className="rounded-[20px] border border-black/5 bg-[#fcfcfc] overflow-hidden">
                                            <div className="px-5 py-3 bg-[#0a0a0b] text-white flex justify-between items-center">
                                                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">Confirmed</span>
                                                <span className="text-[11px] font-mono bg-white text-[#0a0a0b] px-2.5 py-1 rounded-full">#{confirmedBookingId || 'APT'}</span>
                                            </div>
                                            <div className="p-5 grid sm:grid-cols-2 gap-4 text-[13px]">
                                                <div><div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">Name</div><div className="font-semibold text-[#0a0a0b] mt-1">{formData.name}</div></div>
                                                <div><div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">Phone</div><div className="font-semibold text-[#0a0a0b] mt-1">{formData.phone}</div></div>
                                                <div><div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">Treatment</div><div className="font-semibold text-[#0a0a0b] mt-1">{formData.requestedTreatment}</div></div>
                                                <div><div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">Slot</div><div className="font-semibold text-[#0a0a0b] mt-1">{formData.requestedDate} · {formData.requestedTime ? formatSlot(formData.requestedTime) : ''}</div></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button onClick={handleBookAnother} className="flex-1 py-3.5 bg-[#0a0a0b] text-white rounded-full text-[13px] font-medium hover:bg-black active:scale-[0.98] transition"> {t.bookAnother}</button>
                                            <button onClick={() => router.push('/')} className="flex-1 py-3.5 bg-white border border-black/10 text-[#0a0a0b] rounded-full text-[13px] font-medium hover:bg-[#fcfcfc] transition">Back to Home</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* {isAutoBookingEnabled && <BookingSummary formData={formData} language={language} t={t} />} */}
                                        {status.message && (
                                            <div className={`mb-6 p-3 rounded-2xl text-[13px] font-medium border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : status.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                {status.message}
                                            </div>
                                        )}

                                        {configLoading ? (
                                            <div className="space-y-4 animate-pulse">
                                                <div className="h-4 bg-black/5 rounded-full w-1/3" />
                                                <div className="grid sm:grid-cols-2 gap-4 min-w-0 w-full max-w-full"><div className="h-12 bg-black/5 rounded-2xl" /><div className="h-12 bg-black/5 rounded-2xl" /></div>
                                                <div className="h-24 bg-black/5 rounded-2xl" />
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
                                                {isAutoBookingEnabled ? (
                                                    <div className="space-y-6 min-w-0 w-full max-w-full overflow-hidden">
                                                        {/* Step 1 */}
                                                        <div className="min-w-0 w-full max-w-full overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="w-6 h-6 rounded-full bg-[#0a0a0b] text-white grid place-items-center text-[11px] font-bold shrink-0">1</span>
                                                                <h3 className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Choose Treatment</h3>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1 min-w-0 w-full max-w-full">
                                                                {treatments.map((tr) => (
                                                                    <button key={tr._id} type="button" onClick={() => setFormData(prev => ({ ...prev, requestedTreatment: prev.requestedTreatment === tr.name ? '' : tr.name }))} className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all min-w-0 w-full max-w-full overflow-hidden break-words ${formData.requestedTreatment === tr.name ? 'bg-[#0a0a0b] text-white border-black shadow-sm' : 'bg-[#fcfcfc] border-black/5 hover:border-black/10 hover:bg-white'}`}>
                                                                        <TreatmentIcon iconName={tr.icon} treatmentName={tr.name} treatmentDescription={tr.description} className={`text-[18px] shrink-0 ${formData.requestedTreatment === tr.name ? 'text-white' : 'text-neutral-700'}`} />
                                                                        <span className={`text-[11px] font-medium leading-tight break-words hyphens-auto min-w-0 ${formData.requestedTreatment === tr.name ? 'text-white' : 'text-[#0a0a0b]'}`}>{(translations[language] as any).treatmentNames?.[tr.name] || tr.name}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Step 2 */}
                                                        <div className="min-w-0 w-full max-w-full overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="w-6 h-6 rounded-full bg-[#0a0a0b] text-white grid place-items-center text-[11px] font-bold shrink-0">2</span>
                                                                <h3 className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Select Date & Time</h3>
                                                            </div>
                                                            <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-full min-w-0 scrollbar-thin">
                                                                <div className="flex gap-2 min-w-max">
                                                                    {suggestedDates.map((item) => (
                                                                        <button key={item.dateStr} type="button" onClick={() => { const isDeselecting = formData.requestedDate === item.dateStr; setFormData(prev => ({ ...prev, requestedDate: isDeselecting ? '' : item.dateStr, requestedTime: '' })); if (!isDeselecting) fetchAvailableTimes(item.dateStr); else setAvailableTimes([]); }} className={`shrink-0 w-[92px] p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${formData.requestedDate === item.dateStr ? 'bg-[#0a0a0b] text-white border-black' : 'bg-[#fcfcfc] border-black/5 hover:border-black/10 bg-white'}`}>
                                                                            <span className={`text-[10px] font-medium ${formData.requestedDate === item.dateStr ? 'text-white/60' : 'text-neutral-500'}`}>{item.display.split(' ')[0]}</span>
                                                                            <span className={`text-[13px] font-semibold ${formData.requestedDate === item.dateStr ? 'text-white' : 'text-[#0a0a0b]'}`}>{item.display.split(' ')[1]} {item.display.split(' ')[2]}</span>
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.count < 6 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : item.count < 8 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100'} ${formData.requestedDate === item.dateStr ? '!bg-white/15 !text-white !border-white/15' : ''}`}>{item.count < 6 ? t.flexible : item.count < 8 ? t.steady : t.busy}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {formData.requestedDate && (
                                                                <div className="mt-3">
                                                                    <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mb-2">Available slots</div>
                                                                    {loadingTimes ? (
                                                                        <div className="flex items-center gap-2 text-[13px] text-neutral-500"><span className="w-4 h-4 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /> {t.fetchingSlots}</div>
                                                                    ) : availableTimes.length > 0 ? (
                                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 min-w-0 w-full max-w-full">
                                                                            {availableTimes.map(time => {
                                                                                const isToday = formData.requestedDate === new Date().toISOString().split('T')[0];
                                                                                let isPassed = false;
                                                                                if (isToday) { const [h, m] = time.split(':').map(Number); const now = new Date(); if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) isPassed = true; }
                                                                                return (
                                                                                    <button key={time} type="button" disabled={isPassed} onClick={() => setFormData(prev => ({ ...prev, requestedTime: prev.requestedTime === time ? '' : time }))} className={`py-2.5 rounded-full border text-[12px] font-medium transition ${formData.requestedTime === time ? 'bg-[#0a0a0b] text-white border-black' : isPassed ? 'bg-black/5 text-neutral-300 border-black/5 cursor-not-allowed' : 'bg-white border-black/5 hover:border-black/15 text-[#0a0a0b]'}`}>
                                                                                        {formatSlot(time)}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[13px]">{t.noSlots}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Step 3 */}
                                                        <div className="min-w-0 w-full max-w-full overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="w-6 h-6 rounded-full bg-[#0a0a0b] text-white grid place-items-center text-[11px] font-bold shrink-0">3</span>
                                                                <h3 className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Personal details</h3>
                                                            </div>
                                                            <div className="grid sm:grid-cols-2 gap-4 min-w-0 w-full max-w-full">
                                                                <div className="min-w-0 w-full max-w-full">
                                                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Full name</label>
                                                                    <input id="name" value={formData.name} onChange={handleChange} required placeholder={t.namePlaceholder} className="mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] font-medium transition" />
                                                                </div>
                                                                <div className="min-w-0 w-full max-w-full">
                                                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1 flex items-center gap-1.5">Phone <FaWhatsapp size={10} className="text-emerald-500" /></label>
                                                                    <input id="phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} required placeholder="10 digit number" className={`mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full border outline-none text-[13px] font-medium transition ${formData.phone.length === 10 ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-[#fcfcfc] border-black/5 focus:border-black/15 focus:bg-white'}`} />
                                                                </div>
                                                                <div className="sm:col-span-2 min-w-0 w-full max-w-full">
                                                                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Email <span className="normal-case tracking-normal text-neutral-400">(optional)</span></label>
                                                                    <input id="email" value={formData.email} onChange={handleChange} placeholder={t.emailPlaceholder} className="mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] font-medium transition" />
                                                                </div>
                                                            </div>
                                                            <button type="submit" disabled={submitting || !formData.requestedTime || !formData.name || formData.phone.length !== 10} className="mt-6 w-full max-w-full min-w-0 h-[48px] rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium tracking-[-0.01em] hover:bg-black disabled:opacity-40 active:scale-[0.98] transition flex items-center justify-center gap-2">
                                                                {submitting ? t.confirming : t.bookApt} <FaCheckCircle size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid sm:grid-cols-2 gap-4 min-w-0 w-full max-w-full">
                                                        <div className="min-w-0 w-full max-w-full">
                                                            <label htmlFor="name" className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Full name</label>
                                                            <input id="name" value={formData.name} onChange={handleChange} placeholder={t.yourNamePlaceholder} required className="mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] font-medium transition" />
                                                        </div>
                                                        <div className="min-w-0 w-full max-w-full">
                                                            <label htmlFor="phone" className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1 flex items-center gap-1.5 min-w-0">Phone <FaWhatsapp size={10} className="text-emerald-500 shrink-0" />{formData.phone.length > 0 && formData.phone.length < 10 && <span className="text-rose-500 text-[10px] truncate">{t.phoneRequired}: {formData.phone.length}/10</span>}</label>
                                                            <input id="phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder={t.waPlaceholder} required className={`mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full border outline-none text-[13px] font-medium transition ${formData.phone.length === 10 ? 'bg-white border-emerald-200 text-emerald-700' : formData.phone.length > 0 ? 'bg-white border-rose-100 text-rose-600' : 'bg-[#fcfcfc] border-black/5 focus:border-black/15'}`} />
                                                        </div>
                                                        <div className="sm:col-span-2 min-w-0 w-full max-w-full">
                                                            <label htmlFor="email" className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">Email <span className="text-neutral-400 normal-case tracking-normal">(optional)</span></label>
                                                            <input id="email" value={(formData as any).email || ''} onChange={handleChange} placeholder={t.yourEmailPlaceholder} className="mt-1 w-full max-w-full min-w-0 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] font-medium transition" />
                                                        </div>
                                                        <div className="sm:col-span-2 min-w-0 w-full max-w-full overflow-hidden">
                                                            <label htmlFor="message" className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1 flex justify-between"><span>Message</span><span className="text-neutral-400 normal-case tracking-normal text-[10px]">Optional</span></label>
                                                            <div className="mt-2 flex flex-wrap gap-1.5 min-w-0 w-full max-w-full">
                                                                {suggestions.slice(0, 8).map(s => (
                                                                    <button key={s.value} type="button" onClick={() => handleSuggestionClick(s.label)} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[11px] font-medium text-neutral-600 hover:border-black/10 hover:text-[#0a0a0b] transition max-w-full break-words">{s.label}</button>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 min-w-0 w-full max-w-full overflow-hidden">
                                                                <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-400 mb-1.5">{t.smartSuggestions}</div>
                                                                <div className="flex flex-wrap gap-1.5 min-w-0 w-full max-w-full">
                                                                    {suggestedDates.map(item => (
                                                                        <button key={item.dateStr} type="button" onClick={() => handleDateSuggestion(item)} className={`px-3 py-2 rounded-full border text-[11px] font-medium flex flex-col items-center leading-none hover:border-black/10 transition shrink-0 ${item.count < 6 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : item.count < 8 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                                                            <span className="text-[10px] tracking-[0.06em] uppercase">{item.display}</span>
                                                                            <span className="text-[10px] mt-0.5 opacity-70">{item.count < 6 ? t.flexible : item.count < 8 ? t.steady : t.busy}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <textarea id="message" rows={4} value={formData.message} onChange={handleChange} placeholder={t.placeholderMsg} required className="mt-3 w-full max-w-full min-w-0 p-4 rounded-[20px] bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] leading-6 transition resize-none" />
                                                        </div>
                                                        <div className="sm:col-span-2 min-w-0 w-full max-w-full">
                                                            <button type="submit" disabled={submitting} className="w-full max-w-full min-w-0 h-[48px] rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60">
                                                                <FaPaperPlane size={11} /> {submitting ? t.submitting : t.send}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </form>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent bookings */}
                        {guestAppointments.length > 0 && (
                            <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] inline-flex items-center gap-2"><FaCalendarCheck size={12} className="text-neutral-400" /> {t.recentBookings}</h3>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium tracking-[0.06em] uppercase border ${session?.user ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-[#f5f5f3] text-neutral-500 border-black/5'}`}>{session?.user ? t.patientProfile : t.guestMode}</span>
                                </div>
                                <div className="space-y-3">
                                    {guestAppointments.map((apt: any) => {
                                        const treatment = treatments.find((x: any) => x.name === apt.reason);
                                        const isEditing = editingAptId === apt._id;
                                        return (
                                            <div key={apt._id} className="rounded-[20px] border border-black/5 bg-[#fcfcfc] p-4">
                                                <div className="flex items-start justify-between gap-3 min-w-0 w-full max-w-full">
                                                    <div className="flex gap-3 min-w-0 flex-1">
                                                        <span className="w-9 h-9 rounded-xl bg-white border border-black/5 grid place-items-center text-neutral-700 shrink-0"><TreatmentIcon iconName={treatment?.icon || ''} treatmentName={apt.reason} treatmentDescription={treatment?.description || ''} className="text-[14px]" /></span>
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] truncate">{apt.reason}</div>
                                                            <div className="text-[11px] text-neutral-500">{new Date(apt.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })} · {apt.time} · <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${apt.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : apt.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{apt.status}</span></div>
                                                        </div>
                                                    </div>
                                                    {apt.status === 'Scheduled' && !isEditing && (
                                                        <div className="flex gap-2 shrink-0">
                                                            <button onClick={() => { setEditingAptId(apt._id); setEditData({ date: apt.date.split('T')[0], time: apt.time }); }} className="text-[11px] font-medium text-[#0a0a0b] underline underline-offset-4">{t.edit}</button>
                                                            <button onClick={() => handleCancelGuestBooking(apt._id)} className="text-[11px] font-medium text-rose-600 underline underline-offset-4">{t.cancel}</button>
                                                        </div>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <div className="mt-3 p-3 rounded-2xl bg-white border border-black/5 flex flex-col sm:flex-row gap-3 min-w-0 w-full max-w-full overflow-hidden">
                                                        <input type="date" value={editData.date} onChange={e => setEditData(prev => ({ ...prev, date: e.target.value }))} className="flex-1 min-w-0 w-full max-w-full h-9 px-3 rounded-full border border-black/5 text-[12px] outline-none focus:border-black/15" />
                                                        <select value={editData.time} onChange={e => setEditData(prev => ({ ...prev, time: e.target.value }))} className="flex-1 min-w-0 w-full max-w-full h-9 px-3 rounded-full border border-black/5 text-[12px] outline-none focus:border-black/15">
                                                            {(availableTimes.length ? availableTimes : [apt.time, "10:00", "11:00", "12:00", "13:00", "14:00", "17:00", "18:00"]).map(v => <option key={v} value={v}>{formatSlot(v)}</option>)}
                                                        </select>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdateBooking(apt._id)} disabled={savingEdit} className="px-4 h-9 rounded-full bg-[#0a0a0b] text-white text-[11px] font-medium disabled:opacity-40">{savingEdit ? '...' : t.save}</button>
                                                            <button onClick={() => setEditingAptId(null)} className="px-4 h-9 rounded-full bg-white border border-black/5 text-[11px] font-medium">Back</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Map */}
                        <div className="bg-white rounded-[24px] border border-black/5 p-2 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
                            <div className="rounded-[20px] overflow-hidden h-[360px] border border-black/5 w-full max-w-full">
                                <iframe src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="ToothOp Location" />
                            </div>
                        </div>

                        {/* General inquiry */}
                        {isAutoBookingEnabled && !configLoading && (
                            <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaEnvelope size={13} /></span>
                                    <div>
                                        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{t.generalInquiry}</h3>
                                        <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">{t.directMsg}</p>
                                    </div>
                                </div>
                                {generalStatus.message && <div className={`mb-4 p-3 rounded-2xl text-[13px] font-medium border ${generalStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{generalStatus.message}</div>}
                                <form onSubmit={e => { e.preventDefault(); const cPhone = staffPhone.replace(/\D/g, ''); setSubmitting(true); axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, { ...formData, requestedTreatment: '', requestedDate: null, requestedTime: '', message: formData.message }).then(() => { setGeneralStatus({ type: 'success', message: t.successMsg }); setFormData(prev => ({ ...prev, message: '' })); }).catch(err => setGeneralStatus({ type: 'error', message: err.message })).finally(() => setSubmitting(false)); }} className="space-y-4 w-full max-w-full min-w-0 overflow-hidden">
                                    <div className="grid sm:grid-cols-2 gap-4 min-w-0 w-full max-w-full">
                                        <input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required placeholder={t.generalNamePlaceholder} className="h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] w-full max-w-full min-w-0" />
                                        <input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} required placeholder={t.generalPhonePlaceholder} className="h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] w-full max-w-full min-w-0" />
                                    </div>
                                    <input value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder={t.generalEmailPlaceholder} className="w-full max-w-full min-w-0 h-[44px] px-4 rounded-full bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px]" />
                                    <textarea rows={3} value={formData.message} onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))} required placeholder={t.askPlaceholder} className="w-full max-w-full min-w-0 p-4 rounded-[20px] bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[13px] leading-6 resize-none" />
                                    <button disabled={submitting} className="w-full max-w-full min-w-0 h-[44px] rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-2"><FaPaperPlane size={11} /> {submitting ? t.submitting : t.send}</button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Mobile info */}
                    <div className="lg:hidden space-y-4 min-w-0 w-full max-w-full overflow-hidden">
                        {[
                            { icon: <FaPhoneAlt size={14} />, title: t.callNow, desc: clinicData?.timings.monday || t.timingsSub, value: staffPhone, href: `tel:${staffPhone.replace(/\D/g, '')}` },
                            { icon: <FaWhatsapp size={14} />, title: 'WhatsApp', desc: t.chatHelp, value: t.chatNow, href: whatsappLink },
                            { icon: <FaMapMarkerAlt size={14} />, title: t.location, desc: address, value: null, href: null },
                        ].map(card => (
                            <div key={card.title} className="bg-white rounded-[20px] border border-black/5 p-5 w-full max-w-full min-w-0 overflow-hidden">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 shrink-0">{card.icon}</span>
                                    <h3 className="text-[13px] font-semibold text-[#0a0a0b] truncate min-w-0">{card.title}</h3>
                                </div>
                                <p className="text-[13px] leading-6 text-neutral-600 mt-3 break-words break-all min-w-0">{card.desc}</p>
                                {card.href && <a href={card.href} className="mt-2 inline-block text-[13px] font-semibold text-[#0a0a0b] break-all">{card.value} →</a>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function Contact() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>}>
            <ContactContent />
        </Suspense>
    );
}
