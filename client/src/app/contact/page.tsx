'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaChevronRight, FaChevronLeft, FaCalendarCheck, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import TreatmentIcon from '../../components/TreatmentIcon';

function ContactContent() {
    const { clinicData, language } = useClinic();
    const t = translations[language];
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Fallbacks
    const phone = clinicData?.phone || '+91 98765 43210';
    const staffPhone = clinicData?.staffPhone || phone;
    const email = clinicData?.email || 'care@drToothdental.in';
    const address = clinicData
        ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}`
        : 'Dental Clinic Road, Katihar, Bihar - 854105';
    const whatsappLink = `https://wa.me/${staffPhone.replace(/\D/g, '')}`;
    const latitude = clinicData?.address.latitude || '25.555613';
    const longitude = clinicData?.address.longitude || '87.556440';

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
        requestedTreatment: '',
        requestedDate: '',
        requestedTime: ''
    });
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
    const [loadingGuestApts, setLoadingGuestApts] = useState(false);
    const [editingAptId, setEditingAptId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ date: '', time: '' });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`);
                setTreatments(res.data);
            } catch (err) {
                console.error('Error fetching treatments for contact suggestions:', err);
            }
        };
        const fetchDensity = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density`);
                setDensity(res.data);

                // Generate next 14 days suggestions (skipping Sundays)
                const allNextDays = [];
                for (let i = 0; i <= 14; i++) { // Include today (0)
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    if (d.getDay() === 0) continue; // Skip Sunday

                    const dateStr = d.toISOString().split('T')[0];
                    const count = res.data[dateStr]?.count || 0;
                    const closed = res.data[dateStr]?.closed || false;

                    allNextDays.push({
                        date: d,
                        dateStr,
                        count,
                        closed,
                        daysFromToday: i,
                        display: d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                    });
                }

                const sortedSuggestions = allNextDays
                    .filter(d => !d.closed)
                    .slice(0, 5);

                setSuggestedDates(sortedSuggestions);

                // Alert if any of next 3 days are closed
                const next3Closed = allNextDays.find(d => d.daysFromToday <= 2 && d.closed);
                if (next3Closed) {
                    setStatus({
                        type: 'info',
                        message: t.leaveAlert.replace('{date}', next3Closed.display)
                    });
                }
            } catch (err) {
                console.error('Error fetching density:', err);
            }
        };
        const fetchConfig = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/automated_booking`);
                setIsAutoBookingEnabled(res.data?.value === 'true');
            } catch (err) {
                console.error('Error fetching auto booking config:', err);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchTreatments();
        fetchDensity();
        fetchConfig();
    }, [language]);

    const fetchAllRecentBookings = async () => {
        try {
            setLoadingGuestApts(true);
            let appointments: any[] = [];

            // 1. If logged in, fetch from backend via patient ID
            if (session?.user) {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                // @ts-ignore
                const userRes = await axios.get(`${backendUrl}/api/auth/google/${session.user.id}`);
                const patientId = userRes.data?.patientId?._id;

                if (patientId) {
                    const aptRes = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`);
                    appointments = aptRes.data;
                }
            }

            // 2. If guest or if logged-in list is empty, also check localStorage for local bookings
            const storedIds = localStorage.getItem('drtooth_guest_bookings');
            if (storedIds) {
                const ids = JSON.parse(storedIds);
                if (ids.length > 0) {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/bulk-retrieve`, { ids });
                    // Merge with global ones, avoid duplicates
                    const localApts = res.data;
                    localApts.forEach((apt: any) => {
                        if (!appointments.find(a => a._id === apt._id)) {
                            appointments.push(apt);
                        }
                    });
                }
            }

            // Filter out cancelled/completed ones for "Recent" view if preferred, 
            // but user said "Your Recent Bookings" so we show scheduled ones
            // Sort latest to oldest and take 2
            setGuestAppointments(appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2));
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoadingGuestApts(false);
        }
    };

    useEffect(() => {
        fetchAllRecentBookings();
    }, [session]);

    const handleCancelGuestBooking = async (id: string) => {
        if (!confirm(t.confirmCancel)) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`);
            // Update local state
            setGuestAppointments(prev => prev.filter(a => a._id !== id));
            // Update localStorage
            const storedIds = localStorage.getItem('drtooth_guest_bookings');
            if (storedIds) {
                const ids = JSON.parse(storedIds);
                const newIds = ids.filter((sid: string) => sid !== id);
                localStorage.setItem('drtooth_guest_bookings', JSON.stringify(newIds));
            }
            setStatus({
                type: 'success',
                message: language === 'hi' ? 'अपॉइंटमेंट सफलतापूर्वक रद्द कर दिया गया।' : 'Appointment cancelled successfully.'
            });
        } catch (err) {
            console.error('Error cancelling booking:', err);
        }
    };

    const handleUpdateBooking = async (id: string) => {
        if (!editData.date || !editData.time) return;
        setSavingEdit(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}`, {
                date: editData.date,
                time: editData.time,
                status: 'Scheduled'
            });
            setEditingAptId(null);
            fetchAllRecentBookings();
            setStatus({
                type: 'success',
                message: t.updateSuccess
            });
        } catch (err) {
            console.error('Error updating booking:', err);
        } finally {
            setSavingEdit(false);
        }
    };

    useEffect(() => {
        const fetchPatientProfile = async () => {
            if (!session?.user) return;
            try {
                // @ts-ignore
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/${session.user.id}`);
                if (res.data?.patientId) {
                    const patient = res.data.patientId;
                    setFormData(prev => ({
                        ...prev,
                        name: patient.name || prev.name,
                        phone: patient.contact === '-__-' ? prev.phone : (patient.contact || prev.phone),
                        email: patient.email || prev.email
                    }));
                }
            } catch (err) {
                console.error('Error fetching patient profile for autofill:', err);
            }
        };
        fetchPatientProfile();
    }, [session]);

    useEffect(() => {
        const treatment = searchParams.get('treatment');
        if (treatment) {
            setFormData(prev => ({
                ...prev,
                message: t.placeholderMsg.replace('...', treatment.toUpperCase())
            }));
            // Clean up the URL to prevent repeating on refresh
            const newUrl = window.location.pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, router, language]);

    const suggestions = treatments.map((t, idx) => {
        const colors = [
            'bg-indigo-100 text-rose-700 hover:bg-rose-200 border-rose-200',
            'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
            'bg-indigo-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
            'bg-indigo-100 text-amber-700 hover:bg-amber-200 border-amber-200',
            'bg-indigo-100 text-teal-700 hover:bg-teal-200 border-teal-200',
            'bg-indigo-100 text-violet-700 hover:bg-violet-200 border-violet-200',
            'bg-indigo-100 text-sky-700 hover:bg-sky-200 border-sky-200',
            'bg-indigo-100 text-orange-700 hover:bg-orange-200 border-orange-200',
            'bg-indigo-100 text-red-700 hover:bg-red-200 border-red-200',
            'bg-indigo-100 text-blue-700 hover:bg-blue-200 border-blue-200'
        ];
        return {
            label: t.name,
            value: t.name,
            color: colors[idx % colors.length]
        };
    });

    const handleSuggestionClick = (label: string) => {
        const textToAppend = formData.message
            ? `\n${t.discuss}: ${label}, `
            : `${t.discuss}: ${label}, `;
        setFormData(prev => ({
            ...prev,
            message: prev.message + textToAppend
        }));
    };

    const fetchAvailableTimes = async (dateStr: string) => {
        setLoadingTimes(true);
        try {
            // We use the appointments endpoint which we'll need to extend or use density
            // For now, let's assume we have an endpoint for this. 
            // I'll use the density logic but refined.
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/density?days=14`);
            const dayData = res.data[dateStr];

            if (dayData?.closed) {
                setAvailableTimes([]);
                return;
            }

            // Standard slots
            const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
            const booked = dayData?.slots || [];

            // Get dynamic lunch time
            const lunchTimeRange = clinicData?.lunchTime || "01:00 PM - 02:00 PM";

            // Helper to parse lunch range to 24h hours
            const parseTimeRange = (range: string) => {
                try {
                    const [startPart, endPart] = range.split('-').map(p => p.trim());
                    const parseH = (t: string) => {
                        const [time, period] = t.split(' ');
                        let [h] = time.split(':').map(Number);
                        if (period === 'PM' && h < 12) h += 12;
                        if (period === 'AM' && h === 12) h = 0;
                        return h;
                    };
                    return [parseH(startPart), parseH(endPart)];
                } catch (e) {
                    return [13, 14]; // Fallback to 1 PM
                }
            };

            const [lunchStart, lunchEnd] = parseTimeRange(lunchTimeRange);

            const available = allSlots.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                const isBooked = booked.some((b: string) => b.startsWith(slot));
                const isLunch = hour >= lunchStart && hour < lunchEnd;
                return !isBooked && !isLunch;
            });

            setAvailableTimes(available);
        } catch (err) {
            console.error('Error fetching times:', err);
        } finally {
            setLoadingTimes(false);
        }
    };

    const handleDateSuggestion = (item: any) => {
        if (isAutoBookingEnabled) {
            setFormData(prev => ({ ...prev, requestedDate: item.dateStr, requestedTime: '' }));
            fetchAvailableTimes(item.dateStr);
            setCurrentStep(3);
            return;
        }
        const textToAppend = `\n${t.suggestedApt}: ${item.display}, `;
        setFormData(prev => ({
            ...prev,
            message: prev.message + textToAppend
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If auto-booking is enabled and we're not on the last step, just move forward
        if (isAutoBookingEnabled && currentStep < 3) {
            if (currentStep === 1) {
                if (!formData.name || formData.phone.length !== 10) return;
                setCurrentStep(2);
            } else if (currentStep === 2) {
                if (!formData.requestedTreatment) return;
                setCurrentStep(3);
            }
            return;
        }

        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            // Find treatment price for amount mapping
            const selectedTreat = treatments.find(t => t.name === formData.requestedTreatment);
            const amountVal = selectedTreat ? parseFloat(selectedTreat.price.replace(/\D/g, '')) : 0;

            const clinicName = clinicData?.clinicName || "Dr. Tooth Dental Clinic";
            const enthusiasticMessage = `Hi *${clinicName}*! 👋 I just booked an appointment through your website. I’m looking forward to getting my smile checked! 🦷\n\n*Details:*\nTreatment: *${formData.requestedTreatment}*\n📅 *Date:* ${formData.requestedDate}\n⏰ *Time:* ${formData.requestedTime}\n👤 *Name:* ${formData.name}\n\nSee you soon!`;

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                ...formData,
                message: (isAutoBookingEnabled && formData.requestedTreatment) ? enthusiasticMessage : (formData.message || `Consultation for ${formData.requestedTreatment}`),
                amount: amountVal,
                // @ts-ignore
                userId: session?.user?.id
            });

            const isAutomatedSuccess = res.data?.isAutomated;
            const appointmentId = res.data?.appointmentId;

            // --- LOCAL STORAGE TRACKING FOR GUESTS ---
            if (isAutomatedSuccess && appointmentId) {
                const existingBookings = JSON.parse(localStorage.getItem('drtooth_guest_bookings') || '[]');
                if (!existingBookings.includes(appointmentId)) {
                    existingBookings.push(appointmentId);
                    localStorage.setItem('drtooth_guest_bookings', JSON.stringify(existingBookings));
                }
                fetchAllRecentBookings(); // Refresh the list
            }

            // Success Feedback
            setStatus({
                type: 'success',
                message: isAutomatedSuccess
                    ? t.bookingConfirmed
                    : t.detailsSaved
            });

            // Construct the WhatsApp Message
            const clinicPhone = staffPhone.replace(/\D/g, '');

            let messageText = "";
            if (isAutomatedSuccess) {
                messageText = enthusiasticMessage;
            } else {
                messageText = language === 'hi'
                    ? `नमस्ते डॉक्टर, मैं *${formData.name}* हूँ।\nमैं आपसे इस विषय में परामर्श करना चाहता/चाहती हूँ:- \n\n${formData.message}\n\n*मेरा फोन:* ${formData.phone}`
                    : `Hello Doctor, I'm *${formData.name}*.\nI'd like to consult regarding:- \n\n${formData.message}.\n\n*My contact:* ${formData.phone}`;
            }

            const encodedMessage = encodeURIComponent(messageText);
            const finalWhatsappLink = `https://wa.me/${clinicPhone}?text=${encodedMessage}`;

            // Redirect after a short delay (Only if automated or if user explicitly needs WA)
            // The user requested NO wa message for general message. 
            // So we only open it if it's automated? Or if they didn't specify?
            // "it does not need open wa message for general message"
            if (isAutomatedSuccess) {
                setTimeout(() => {
                    window.open(finalWhatsappLink, '_blank');

                    // WhatsApp Staff Trigger - 2 seconds later
                    const staffPhoneNum = staffPhone.replace(/\D/g, '');
                    const staffMsg = `*New Lead/Booking Alert!* 📧\n\nName: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}\n\n*Treatment:* ${formData.requestedTreatment}\n*Date:* ${formData.requestedDate}\n*Time:* ${formData.requestedTime}`;
                    const staffWhatsappUrl = `https://wa.me/91${staffPhoneNum}?text=${encodeURIComponent(staffMsg)}`;

                    setTimeout(() => {
                        window.open(staffWhatsappUrl, '_blank');
                    }, 2000);

                    setFormData({ name: '', phone: '', email: '', message: '', requestedTreatment: '', requestedDate: '', requestedTime: '' });
                    setCurrentStep(1);
                }, 1500);
            } else {
                // For non-automated manual request, we SHOULD open WhatsApp as per user feedback
                setTimeout(() => {
                    window.open(finalWhatsappLink, '_blank');
                    setFormData({ name: '', phone: '', email: '', message: '', requestedTreatment: '', requestedDate: '', requestedTime: '' });
                    setCurrentStep(1);
                }, 1500);
            }

        } catch (error) {
            setStatus({
                type: 'error',
                message: language === 'hi'
                    ? t.failedTryAgain + ' ' + (error as any).response?.data?.message || ''
                    : t.failedTryAgain + ' ' + (error as any).response?.data?.message || ''
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative px-4 py-2 sm:py-8 lg:py-20 sm:px-20 xl:px-40  mx-auto space-y-8 sm:space-y-16 overflow-x-hidden">



            <div className="3xl:block hidden text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900">{t.getIntouch}</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {t.contactHeroSub}
                </p>
            </div>

            <div className=" grid lg:grid-cols-3 gap-12">
                <div className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-[2s]">
                    <img
                        src="/images/sciencehanddrawnbg.jpg"
                        className="w-full h-full object-cover opacity-[0.4]"
                        alt="pattern"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-teal-50/10"></div>
                </div>

                {/* Contact Info Column */}
                <div className="hidden lg:block lg:col-span-1 space-y-4 text-left">

                    {/* Phone Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <FaPhoneAlt className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{t.callNow}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{clinicData?.timings.monday || (t.timingsSub)}</p>
                        <a href={`tel:${staffPhone.replace(/\D/g, '')}`} className="text-lg font-bold text-blue-700 hover:underline text-center sm:text-left block">
                            {staffPhone}
                        </a>
                    </div>

                    {/* Whatsapp Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <FaWhatsapp className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">WhatsApp</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{t.chatHelp}</p>
                        <a href={whatsappLink} target="_blank" className="text-center sm:text-left text-lg font-bold text-green-700 hover:underline block">
                            {t.chatNow}
                        </a>
                    </div>

                    {/* Visit Us Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                                <FaMapMarkerAlt className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{t.location}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-center sm:text-left">
                            {address}
                        </p>
                    </div>
                </div>

                {/* Contact Form & Map Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Contact Form / Guided Booking */}
                    <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mb-6">
                            <h2 className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
                                <FaCalendarCheck className="text-blue-600" />
                                {isAutoBookingEnabled ? (
                                    <span className="">{t.appointmentBooking}</span>
                                ) : t.send}
                            </h2>
                            {isAutoBookingEnabled && (
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(step => (
                                        <div key={step} className={`w-8 h-1.5 rounded-full transition-all ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-100'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-2xl text-center font-bold animate-in zoom-in duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {status.message}
                            </div>
                        )}

                        {configLoading ? (
                            <div className="space-y-6 animate-pulse p-4">
                                <div className="h-4 bg-gray-100 rounded-full w-1/4 mb-8"></div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="h-14 bg-gray-50 rounded-2xl"></div>
                                    <div className="h-14 bg-gray-50 rounded-2xl"></div>
                                </div>
                                <div className="h-32 bg-gray-50 rounded-2xl"></div>
                                <div className="h-14 bg-blue-100 rounded-2xl w-full"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {isAutoBookingEnabled ? (
                                    <>
                                        {/* STEP 1: PERSONAL DETAILS */}
                                        {currentStep === 1 && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.formName}</label>
                                                        <input
                                                            type="text" id="name" value={formData.name} onChange={handleChange} required
                                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all placeholder:text-gray-300"
                                                            placeholder={t.namePlaceholder}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                                                            {t.formPhone} <FaWhatsapp className="text-emerald-500" />
                                                        </label>
                                                        <input
                                                            type="tel" id="phone" value={formData.phone} required
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                                setFormData(prev => ({ ...prev, phone: val }));
                                                            }}
                                                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 font-bold outline-none transition-all ${formData.phone.length === 10 ? 'border-emerald-100 text-emerald-600' : 'border-transparent focus:border-blue-500'}`}
                                                            placeholder="10 digit number"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.emailOptional}</label>
                                                    <input
                                                        type="email" id="email" value={formData.email} onChange={handleChange}
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all placeholder:text-gray-300"
                                                        placeholder={t.emailPlaceholder}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => formData.name && formData.phone.length === 10 && setCurrentStep(2)}
                                                    disabled={!formData.name || formData.phone.length !== 10}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {t.chooseTreatment} <FaChevronRight />
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP 2: CHOOSE TREATMENT */}
                                        {currentStep === 2 && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 h-[500px] overflow-y-scroll gap-3">
                                                    {treatments.map((t) => (
                                                        <button
                                                            key={t._id}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, requestedTreatment: t.name }))}
                                                            className={`p-2 sm:p-4 rounded-2xl border-2 shadow-inner transition-all flex flex-col items-center gap-2 ${formData.requestedTreatment === t.name ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gradient-to-b from-purple-100/50 to-blue-100/50 backdrop-blur-sm hover:bg-gray-100'}`}
                                                        >
                                                            <TreatmentIcon iconName={t.icon} treatmentName={t.name} treatmentDescription={t.description} className="text-2xl" />
                                                            <span className="text-[10px] font-black uppercase text-center leading-tight">{t.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 sm:gap-4 mt-2">
                                                    <button
                                                        type="button" onClick={() => setCurrentStep(1)}
                                                        className="w-1/4 sm:w-1/3 py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-1 sm:gap-2"
                                                    >
                                                        <FaChevronLeft className="text-[10px]" /> Back
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => formData.requestedTreatment && setCurrentStep(3)}
                                                        disabled={!formData.requestedTreatment}
                                                        className="flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50"
                                                    >
                                                        <span className="sm:inline">{t.selectSlot}</span>
                                                        <FaChevronRight className="text-[10px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3: SELECT DATE & TIME */}
                                        {currentStep === 3 && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.availableDates}</label>
                                                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-3 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                                                        {suggestedDates.map((item) => (
                                                            <button
                                                                key={item.dateStr}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, requestedDate: item.dateStr, requestedTime: '' }));
                                                                    fetchAvailableTimes(item.dateStr);
                                                                }}
                                                                className={`flex-shrink-0 w-24 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${formData.requestedDate === item.dateStr ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}
                                                            >
                                                                <span className="text-[10px] font-black text-blue-600">{item.display.split(' ')[0]}</span>
                                                                <span className="text-sm font-black text-gray-800">{item.display.split(' ')[1]}</span>
                                                                <span className="text-[8px] font-bold text-gray-400">{item.display.split(' ')[2]}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {formData.requestedDate && (
                                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.availableSlots}</label>
                                                        {loadingTimes ? (
                                                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> {t.fetchingSlots}</div>
                                                        ) : availableTimes.length > 0 ? (
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {availableTimes.map(time => {
                                                                    const isToday = formData.requestedDate === new Date().toISOString().split('T')[0];
                                                                    let isPassed = false;
                                                                    if (isToday) {
                                                                        const [slotHour, slotMin] = time.split(':').map(Number);
                                                                        const now = new Date();
                                                                        const currentHour = now.getHours();
                                                                        const currentMin = now.getMinutes();
                                                                        if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMin)) {
                                                                            isPassed = true;
                                                                        }
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={time}
                                                                            type="button"
                                                                            disabled={isPassed}
                                                                            onClick={() => setFormData(prev => ({ ...prev, requestedTime: time }))}
                                                                            className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${formData.requestedTime === time
                                                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                                                : isPassed
                                                                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                                                                    : 'border-gray-50 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            {time}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">{t.noSlots}</div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 sm:gap-4 pt-4">
                                                    <button
                                                        type="button" onClick={() => setCurrentStep(2)}
                                                        className="w-1/4 sm:w-1/3 py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-1 sm:gap-2"
                                                    >
                                                        <FaChevronLeft className="text-[10px]" /> Back
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submitting || !formData.requestedTime}
                                                        className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 px-2"
                                                    >
                                                        <span className="sm:inline">{submitting ? t.confirming : (formData.phone.length === 10 ? t.bookApt : t.completeForm)}</span>
                                                        <FaCheckCircle className="text-[10px] flex-shrink-0" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2 text-left">
                                                <label htmlFor="name" className="text-sm font-semibold text-gray-700 h-8 flex items-end">
                                                    {t.formName}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 font-bold outline-none transition-all"
                                                    placeholder={t.yourNamePlaceholder}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <label htmlFor="phone" className="text-sm font-semibold text-gray-700 h-8 flex items-end justify-start gap-2">
                                                    <span>{t.formPhone} </span><FaWhatsapp className="text-green-500 text-xl" />
                                                    {formData.phone.length > 0 && formData.phone.length < 10 && (
                                                        <span className="text-red-500 text-[10px] animate-pulse">{t.phoneRequired}: {formData.phone.length}/10</span>
                                                    )}
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setFormData(prev => ({ ...prev, phone: val }));
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl border-2 font-bold outline-none transition-all ${formData.phone.length === 10
                                                        ? 'border-green-200 focus:border-green-500 text-green-600'
                                                        : formData.phone.length > 0
                                                            ? 'border-red-100 focus:border-red-400 text-red-600'
                                                            : 'border-gray-200 focus:border-blue-500'
                                                        }`}
                                                    placeholder={t.waPlaceholder}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2 text-left">
                                                <label htmlFor="email" className="text-sm font-semibold text-gray-700 h-8 flex items-end">
                                                    {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'} <span className="ml-2 text-gray-400 font-normal text-[10px] uppercase tracking-widest">(Optional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={(formData as any).email || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 font-bold outline-none transition-all"
                                                    placeholder={t.yourEmailPlaceholder}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="space-y-2 text-left">
                                                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                                        <span>{t.formMessage}</span>
                                                        <span className="text-gray-400 font-normal text-xs uppercase tracking-widest italic">Optional Selection</span>
                                                    </label>

                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {suggestions.map((s) => (
                                                            <button
                                                                key={s.value}
                                                                type="button"
                                                                onClick={() => handleSuggestionClick(s.label)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 transform active:scale-90 ${s.color}`}
                                                            >
                                                                + {s.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1 mb-1">
                                                            {t.smartSuggestions}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {suggestedDates.map((item) => (
                                                                <button
                                                                    key={item.dateStr}
                                                                    type="button"
                                                                    onClick={() => handleDateSuggestion(item)}
                                                                    className={`px-3 py-2 rounded-2xl flex flex-col items-center border shadow-sm transition-all transform active:scale-95 ${item.count < 6 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                                        item.count < 8 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                                            'bg-rose-50 border-rose-200 text-rose-700'
                                                                        }`}
                                                                >
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">{item.display}</span>
                                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${item.count < 6 ? 'bg-emerald-100' :
                                                                        item.count < 8 ? 'bg-amber-100' :
                                                                            'bg-rose-100'
                                                                        }`}>
                                                                        {item.count < 6 ? t.flexible :
                                                                            item.count < 8 ? t.steady :
                                                                                t.busy}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        id="message"
                                                        rows={4}
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                                        placeholder={t.placeholderMsg}
                                                        required
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className={`w-full ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2`}
                                                >
                                                    <FaPaperPlane /> {submitting ? t.submitting : t.send}
                                                </button>
                                            </div>

                                        </div>
                                    </>
                                )}
                            </form>
                        )}
                    </div>



                    {/* YOUR RECENT BOOKINGS */}
                    {guestAppointments.length > 0 && (
                        <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-blue-50/30 rounded-[2.5rem] shadow-xl border border-blue-100 space-y-6 mt-8">
                            <div className="flex flex-col sm:flex-row gap-1 items-center justify-between">
                                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                    <FaCalendarCheck className="text-blue-600" />
                                    {t.recentBookings}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {session?.user && (
                                        <button
                                            onClick={() => router.push('/profile')}
                                            className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                                        >
                                            {t.seeProfile}
                                        </button>
                                    )}
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${session?.user ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-gray-400'}`}>
                                        {session?.user ? t.patientProfile : t.guestMode}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {guestAppointments.map((apt: any) => {
                                    const treatment = treatments.find((t: any) => t.name === apt.reason);
                                    const isEditing = editingAptId === apt._id;
                                    const patientName = apt.patientId?.name || apt.name || t.guest;
                                    const patientPhone = apt.patientId?.contact || apt.phone || "";
                                    const patientEmail = apt.patientId?.email || apt.email || "";

                                    return (
                                        <div key={apt._id} className="p-5 rounded-3xl bg-white/50 border border-blue-50 flex flex-col gap-4 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                                        <TreatmentIcon
                                                            iconName={treatment?.icon || ""}
                                                            treatmentName={apt.reason}
                                                            treatmentDescription={treatment?.description || ""}
                                                            className="text-xl"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-800 leading-tight mb-1">{apt.reason}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                            {patientName} {patientPhone && `• ${patientPhone}`}
                                                        </div>
                                                        {patientEmail && (
                                                            <div className="text-[9px] font-bold text-gray-400/80 mb-1">{patientEmail}</div>
                                                        )}
                                                        <div className="text-xs font-bold text-blue-600 flex items-center gap-2">
                                                            <FaClock className="text-[10px]" /> {new Date(apt.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })} • {apt.time}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-600' :
                                                        apt.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {apt.status}
                                                    </div>
                                                    {apt.status === 'Scheduled' && !isEditing && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingAptId(apt._id);
                                                                    setEditData({ date: apt.date.split('T')[0], time: apt.time });
                                                                }}
                                                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest underline underline-offset-4"
                                                            >
                                                                {t.edit}
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelGuestBooking(apt._id)}
                                                                className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest underline underline-offset-4"
                                                            >
                                                                {t.cancel}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* EDIT MODE UI */}
                                            {isEditing && (
                                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-end gap-3 animate-in zoom-in-95 duration-200">
                                                    <div className="w-full sm:w-auto flex-grow grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.newDate}</label>
                                                            <input
                                                                type="date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                value={editData.date}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                                                                className="w-full px-3 py-2 rounded-xl bg-white border border-blue-100 font-bold text-xs outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.newTime}</label>
                                                            <select
                                                                value={editData.time}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                                                                className="w-full px-3 py-2 rounded-xl bg-white border border-blue-100 font-bold text-xs outline-none focus:border-blue-500"
                                                            >
                                                                {availableTimes.length > 0 ? (
                                                                    availableTimes.map(t => <option key={t} value={t}>{t}</option>)
                                                                ) : (
                                                                    [apt.time, "10:00", "11:00", "12:00", "13:00", "14:00", "17:00", "18:00", "19:00"].map(t => <option key={t} value={t}>{t}</option>)
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handleUpdateBooking(apt._id)}
                                                            disabled={savingEdit}
                                                            className="flex-grow sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {savingEdit ? '...' : t.save}
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelGuestBooking(apt._id)}
                                                            className="flex-grow sm:flex-none px-6 py-2 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                                                        >
                                                            {t.cancelBooking}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingAptId(null)}
                                                            className="flex-grow sm:flex-none px-6 py-2 bg-gray-100 text-gray-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                                        >
                                                            {t.back}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-[10px] text-gray-400 font-medium text-center italic leading-tight">
                                {session?.user
                                    ? t.syncMsg
                                    : t.guestSyncMsg}
                            </p>
                        </div>
                    )}

                    {/* Google Map Integration */}
                    <div id="map" className="bg-white p-3 rounded-3xl shadow-xl overflow-hidden h-[400px] w-full border-4 border-white transform hover:shadow-2xl transition duration-500">
                        <iframe
                            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="rounded-2xl"
                            title="Dr Tooth Dental Clinic Location"
                        ></iframe>
                    </div>

                    {/* GENERAL INQUIRY FORM (Only when auto-booking is enabled) */}
                    {isAutoBookingEnabled && !configLoading && (
                        <div className='p-6 sm:p-8 bg-gradient-to-br from-white to-blue-50/30 rounded-[2.5rem] shadow-xl border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                // Manual submission for general inquiry
                                const clinicPhone = staffPhone.replace(/\D/g, '');
                                const clinicName = clinicData?.clinicName || "Dr. Tooth Dental Clinic";
                                const messageText = language === 'hi'
                                    ? `नमस्ते *${clinicName}*, मैं *${formData.name}* हूँ।\nमेरा संदेश:- \n\n${formData.message}\n\n*संपर्क:* ${formData.phone}`
                                    : `Hello *${clinicName}*, I'm *${formData.name}*.\nMy message:- \n\n${formData.message}\n\n*Contact:* ${formData.phone}`;

                                setSubmitting(true);
                                axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                                    ...formData,
                                    requestedTreatment: '',
                                    requestedDate: null,
                                    requestedTime: '',
                                    message: formData.message
                                }).then(() => {
                                    setGeneralStatus({
                                        type: 'success',
                                        message: t.successMsg
                                    });
                                    setFormData(prev => ({ ...prev, message: '' }));
                                }).catch(err => {
                                    setGeneralStatus({ type: 'error', message: err.message });
                                }).finally(() => setSubmitting(false));
                            }} className="space-y-6">
                                {generalStatus.message && (
                                    <div className={`p-4 rounded-2xl text-center font-bold animate-in zoom-in duration-300 ${generalStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                        {generalStatus.message}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-800 tracking-tight">
                                            {t.generalInquiry}
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {t.directMsg}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.formName}</label>
                                            <input
                                                type="text" value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                                className="w-full px-5 py-3 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all"
                                                placeholder={t.generalNamePlaceholder}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.formPhone}</label>
                                            <input
                                                type="tel" value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                                required
                                                className="w-full px-5 py-3 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all"
                                                placeholder={t.generalPhonePlaceholder}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.emailOptional}</label>
                                        <input
                                            type="email" value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all"
                                            placeholder={t.generalEmailPlaceholder}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.formMessage}</label>
                                        <textarea
                                            rows={3}
                                            value={formData.message}
                                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                            required
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all resize-none"
                                            placeholder={t.askPlaceholder}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                                    >
                                        <FaPaperPlane /> {submitting ? t.submitting : t.send}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>

                {/* Contact Info Column */}
                <div className="block lg:hidden lg:col-span-1 space-y-4 text-left">

                    {/* Phone Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <FaPhoneAlt className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{t.callNow}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{clinicData?.timings.monday || (t.timingsSub)}</p>
                        <a href={`tel:${staffPhone.replace(/\D/g, '')}`} className="text-lg font-bold text-blue-700 hover:underline text-center sm:text-left block">
                            {staffPhone}
                        </a>
                    </div>

                    {/* Whatsapp Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <FaWhatsapp className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">WhatsApp</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{t.chatHelp}</p>
                        <a href={whatsappLink} target="_blank" className="text-center sm:text-left text-lg font-bold text-green-700 hover:underline block">
                            {t.chatNow}
                        </a>
                    </div>

                    {/* Visit Us Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                                <FaMapMarkerAlt className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{t.location}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-center sm:text-left">
                            {address}
                        </p>
                    </div>
                </div>



            </div>
        </div>
    );
}

export default function Contact() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ContactContent />
        </Suspense>
    );
}
