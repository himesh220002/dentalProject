'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
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
    const email = clinicData?.email || 'care@drToothdental.in';
    const address = clinicData
        ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}`
        : 'Dental Clinic Road, Katihar, Bihar - 854105';
    const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}`;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [treatments, setTreatments] = useState<any[]>([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`);
                setTreatments(res.data);
            } catch (err) {
                console.error('Error fetching treatments for contact suggestions:', err);
            }
        };
        fetchTreatments();
    }, []);

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
            ? `\n${language === 'hi' ? 'मैं चर्चा करना चाहता हूं' : 'I would like to discuss'}: ${label}`
            : `${language === 'hi' ? 'मैं चर्चा करना चाहता हूं' : 'I would like to discuss'}: ${label}`;
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
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                ...formData,
                // @ts-ignore
                userId: session?.user?.id
            });
            setStatus({ type: 'success', message: language === 'hi' ? 'संदेश सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।' : 'Message sent successfully! We will contact you soon.' });
            setFormData({ name: '', phone: '', email: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: language === 'hi' ? 'संदेश भेजने में विफल। कृपया पुन: प्रयास करें या हमें कॉल करें।' : 'Failed to send message. Please try again or call us.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative px-2 py-5 sm:py-20 sm:px-20 max-w-7xl -my-4 mx-auto  space-y-16 px-4">


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
                        <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-lg font-bold text-blue-700 hover:underline text-center sm:text-left block">
                            {phone}
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

                    {/* Contact Form */}
                    <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-2 flex justify-center items-center gap-2 text-left">
                            <FaEnvelope className="text-blue-500" /> {language === 'hi' ? 'संदेश भेजें' : 'Send a Message'}
                        </h2>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-xl text-center font-bold ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 text-left">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">{t.formName}</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    placeholder="yourname"
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex justify-between">
                                    <span>{t.formPhone} (10 {language === 'hi' ? 'अंक' : 'Digits'})</span>
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
                                    placeholder="00000 00000"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2 text-left">
                                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'} <span className="text-gray-400 font-normal text-[10px] uppercase tracking-widest">(Optional)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={(formData as any).email || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    placeholder="yourname@gmail.com"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="space-y-2 text-left">
                                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                        <span>{t.formMessage}</span>
                                        <span className="text-gray-400 font-normal text-xs uppercase tracking-widest italic">Optional Selection</span>
                                    </label>

                                    {/* Suggestion Chips */}
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
                        </form>
                    </div>

                    {/* Google Map Integration */}
                    <div className="bg-white p-3 rounded-3xl shadow-xl overflow-hidden h-[400px] w-full border-4 border-white transform hover:shadow-2xl transition duration-500">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3611!2d87.556440!3d25.555613!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDMzJzIwLjIiTiA4N8KwMzMnMjMuNCJF!5e0!3m2!1sen!2sin!4v1713511111111!5m2!1sen!2sin"
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
