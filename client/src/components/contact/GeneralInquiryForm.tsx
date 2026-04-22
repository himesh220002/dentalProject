'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';
import { translations } from '@/constants/translations';

interface InquiryFormData {
    name: string;
    phone: string;
    email: string;
    message: string;
}

interface InquiryStatus {
    type: 'success' | 'error' | '';
    message: string;
}

export default function GeneralInquiryForm() {
    const { language } = useClinic();
    const t = translations[language];

    const [formData, setFormData] = useState<InquiryFormData>({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<InquiryStatus>({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, {
                ...formData,
                requestedTreatment: '',
                requestedDate: null,
                requestedTime: '',
                message: formData.message
            });

            setStatus({
                type: 'success',
                message: t.successMsg
            });
            setFormData(prev => ({ ...prev, message: '' }));
        } catch (err) {
            const error = err as { message?: string };
            setStatus({
                type: 'error',
                message: error.message || t.failedTryAgain
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 sm:p-8 bg-gradient-to-br from-white to-blue-50/30 rounded-[2.5rem] shadow-xl border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleSubmit} className="space-y-6">
                {status.message && (
                    <div className={`p-4 rounded-2xl text-center font-bold animate-in zoom-in duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {status.message}
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
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all"
                                placeholder={t.generalNamePlaceholder}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t.formPhone}</label>
                            <input
                                type="tel"
                                value={formData.phone}
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
                            type="email"
                            value={formData.email}
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
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:opacity-70"
                    >
                        <FaPaperPlane /> {submitting ? t.submitting : t.send}
                    </button>
                </div>
            </form>
        </div>
    );
}
