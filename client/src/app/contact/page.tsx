'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaChevronRight, FaChevronLeft, FaCalendarCheck, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';

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
    const [submitting, setSubmitting] = useState(false);
    const [density, setDensity] = useState<any>({});
    const [suggestedDates, setSuggestedDates] = useState<any[]>([]);
    const [isAutoBookingEnabled, setIsAutoBookingEnabled] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loadingTimes, setLoadingTimes] = useState(false);

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
                        message: language === 'hi'
                            ? `नोट: ${next3Closed.display} को डॉक्टर छुट्टी पर हैं। कृपया अन्य उपलब्ध दिन चुनें।`
                            : `Note: Doctor is on leave on ${next3Closed.display}. Please pick other available days.`
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
            }
        };
        fetchTreatments();
        fetchDensity();
        fetchConfig();
    }, [language]);

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
                message: language === 'hi'
                    ? `मैं इनके लिए अपॉइंटमेंट बुक करना चाहता हूँ: ${treatment.toUpperCase()}`
                    : `I would like to book an appointment for: ${treatment.toUpperCase()}`
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
            ? `\n${language === 'hi' ? 'मैं चर्चा करना चाहता हूं' : 'I would like to discuss'}: ${label}, `
            : `${language === 'hi' ? 'मैं चर्चा करना चाहता हूं' : 'I would like to discuss'}: ${label}, `;
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
            const allSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
            const booked = dayData?.slots || [];

            const available = allSlots.filter(slot => !booked.some((b: string) => b.startsWith(slot)));
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
        const textToAppend = `\n${language === 'hi' ? 'सुझाया गया समय' : 'Suggested Appointment'}: ${item.display}, `;
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
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                ...formData,
                // @ts-ignore
                userId: session?.user?.id
            });

            const isAutomatedSuccess = res.data?.isAutomated;

            // Success Feedback
            setStatus({
                type: 'success',
                message: isAutomatedSuccess
                    ? (language === 'hi' ? 'आपका अपॉइंटमेंट पक्का हो गया है! विवरण व्हाट्सएप पर भेजे जा रहे हैं...' : 'Your appointment is confirmed! Sending details to WhatsApp...')
                    : (language === 'hi' ? 'विवरण सुरक्षित हो गया! अब आपको व्हाट्सएप पर भेजा जा रहा है...' : 'Details saved! Redirecting you to WhatsApp...')
            });

            // Construct the WhatsApp Message
            const clinicPhone = staffPhone.replace(/\D/g, '');
            const clinicName = clinicData?.clinicName || "Dr. Tooth Dental Clinic";

            let messageText = "";
            if (isAutomatedSuccess) {
                messageText = `*Appointment Confirmed!* ✔️\n\nDear ${formData.name},\nYour appointment at *${clinicName}* has been scheduled.\n\n*Treatment:* ${formData.requestedTreatment}\n*Date:* ${formData.requestedDate}\n*Time:* ${formData.requestedTime}\n\nSee you soon!`;
            } else {
                messageText = language === 'hi'
                    ? `नमस्ते डॉक्टर, मैं *${formData.name}* हूँ।\nमैं आपसे इस विषय में परामर्श करना चाहता/चाहती हूँ:- \n\n${formData.message}\n\n*मेरा फोन:* ${formData.phone}`
                    : `Hello Doctor, I'm *${formData.name}*.\nI'd like to consult regarding:- \n\n${formData.message}.\n\n*My contact:* ${formData.phone}`;
            }

            const encodedMessage = encodeURIComponent(messageText);
            const finalWhatsappLink = `https://wa.me/${clinicPhone}?text=${encodedMessage}`;

            // Redirect after a short delay
            setTimeout(() => {
                window.open(finalWhatsappLink, '_blank');
                setFormData({ name: '', phone: '', email: '', message: '', requestedTreatment: '', requestedDate: '', requestedTime: '' });
                setCurrentStep(1);
            }, 1500);

        } catch (error) {
            setStatus({
                type: 'error',
                message: language === 'hi'
                    ? 'विफल। कृपया पुन: प्रयास करें। ' + (error as any).response?.data?.message || ''
                    : 'Failed. Please try again. ' + (error as any).response?.data?.message || ''
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative px-2 py-5 sm:py-20 sm:px-20 max-w-[1400px]  mx-auto  space-y-8 sm:space-y-16 px-4">


            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900">{t.getIntouch}</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {language === 'hi'
                        ? 'कोई प्रश्न है या अपॉइंटमेंट बुक करना चाहते हैं? हम यहाँ मदद के लिए हैं। फोन, ईमेल द्वारा हमसे संपर्क करें या सीधे हमारे क्लिनिक आएं।'
                        : 'Have a question or want to book an appointment? We are here to help. Reach out to us via phone, email, or visit our clinic directly.'}
                </p>
            </div>

            <div className=" grid lg:grid-cols-3 gap-12">
                <div className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-[2s]">
                    <img
                        src="/images/sciencehanddrawnbg.jpg"
                        className="w-full h-full sm:rounded-t-xl object-cover opacity-[0.4]"
                        alt="pattern"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-teal-50/10"></div>
                </div>

                {/* Contact Info Column */}
                <div className="lg:col-span-1 space-y-4 text-left">

                    {/* Phone Card */}
                    <div className="text-center sm:text-left bg-gradient-to-br from-purple-100 to-teal-50 p-4 sm:p-6 rounded-3xl shadow-lg border border-3 border-gray-50 hover:bg-gradient-to-br hover:from-green-50 hover:to-purple-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <FaPhoneAlt className="text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{t.callNow}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{clinicData?.timings.monday || (language === 'hi' ? 'सोम-शनि सुबह 10 बजे से रात 8 बजे तक' : 'Mon-Sat from 10am to 8pm')}</p>
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
                        <p className="text-gray-600 mb-2">{language === 'hi' ? 'त्वरित प्रश्नों के लिए हमारे साथ चैट करें' : 'Chat with us for quick queries'}</p>
                        <a href={whatsappLink} target="_blank" className="text-center sm:text-left text-lg font-bold text-green-700 hover:underline block">
                            {language === 'hi' ? 'अभी चैट करें' : 'Chat Now'}
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <FaCalendarCheck className="text-blue-600" />
                                {isAutoBookingEnabled ? 'Guided Booking' : (language === 'hi' ? 'संदेश भेजें' : 'Send a Message')}
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
                                                        placeholder="e.g. Rahul Kumar"
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
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email (Optional)</label>
                                                <input
                                                    type="email" id="email" value={formData.email} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all placeholder:text-gray-300"
                                                    placeholder="rahul@example.com"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => formData.name && formData.phone.length === 10 && setCurrentStep(2)}
                                                disabled={!formData.name || formData.phone.length !== 10}
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                Choose Treatment <FaChevronRight />
                                            </button>
                                        </div>
                                    )}

                                    {/* STEP 2: CHOOSE TREATMENT */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {treatments.map((t) => (
                                                    <button
                                                        key={t._id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, requestedTreatment: t.name }))}
                                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.requestedTreatment === t.name ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-100'}`}
                                                    >
                                                        <span className="text-2xl">{t.icon || '🦷'}</span>
                                                        <span className="text-[10px] font-black uppercase text-center leading-tight">{t.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button" onClick={() => setCurrentStep(1)}
                                                    className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaChevronLeft /> Back
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => formData.requestedTreatment && setCurrentStep(3)}
                                                    disabled={!formData.requestedTreatment}
                                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    Select Slot <FaChevronRight />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: SELECT DATE & TIME */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Available Dates</label>
                                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                    {suggestedDates.map((item) => (
                                                        <button
                                                            key={item.dateStr}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, requestedDate: item.dateStr, requestedTime: '' }));
                                                                fetchAvailableTimes(item.dateStr);
                                                            }}
                                                            className={`flex-shrink-0 w-24 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${formData.requestedDate === item.dateStr ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}
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
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Available Time Slots</label>
                                                    {loadingTimes ? (
                                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Fetching slots...</div>
                                                    ) : availableTimes.length > 0 ? (
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {availableTimes.map(time => (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ ...prev, requestedTime: time }))}
                                                                    className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${formData.requestedTime === time ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-50 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">No free slots on this day. Please pick another date.</div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button" onClick={() => setCurrentStep(2)}
                                                    className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaChevronLeft /> Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting || !formData.requestedTime}
                                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {submitting ? 'Confirming...' : 'Book Appointment'} <FaCheckCircle />
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
                                                placeholder="yourname"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label htmlFor="phone" className="text-sm font-semibold text-gray-700 h-8 flex items-end justify-start gap-2">
                                                <span>{t.formPhone} </span><FaWhatsapp className="text-green-500 text-xl" />
                                                {formData.phone.length > 0 && formData.phone.length < 10 && (
                                                    <span className="text-red-500 text-[10px] animate-pulse">Required: {formData.phone.length}/10</span>
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
                                                placeholder="Enter WhatsApp Number"
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
                                                placeholder="yourname@gmail.com"
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
                                                        {language === 'hi' ? 'सुझाए गए खाली दिन' : 'Smart Date Suggestions'}
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
                                                                    {item.count < 6 ? (language === 'hi' ? 'उपलब्ध' : 'Flexible') :
                                                                        item.count < 8 ? (language === 'hi' ? 'सामान्य' : 'Steady') :
                                                                            (language === 'hi' ? 'व्यस्त' : 'Busy')}
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
                                                    placeholder="I would like to book an appointment for..."
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
                    </div>

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
