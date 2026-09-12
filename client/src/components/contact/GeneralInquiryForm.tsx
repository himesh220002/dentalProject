'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';
import { translations } from '@/constants/translations';

interface InquiryFormData { name: string; phone: string; email: string; message: string; }
interface InquiryStatus { type: 'success' | 'error' | ''; message: string; }

export default function GeneralInquiryForm() {
    const { language } = useClinic();
    const t = translations[language];
    const [formData, setFormData] = useState<InquiryFormData>({ name: '', phone: '', email: '', message: '' });
    const [status, setStatus] = useState<InquiryStatus>({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`, { ...formData, requestedTreatment: '', requestedDate: null, requestedTime: '', message: formData.message });
            setStatus({ type: 'success', message: t.successMsg });
            setFormData(prev => ({ ...prev, message: '' }));
        } catch (err) {
            const error = err as { message?: string };
            setStatus({ type: 'error', message: error.message || t.failedTryAgain });
        } finally { setSubmitting(false); }
    };

    return (
        <div id="inquiry" className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] text-white grid place-items-center shadow-sm"><FaEnvelope size={13} /></div>
                    <div>
                        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b] leading-none">{t.generalInquiry}</h2>
                        <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mt-1">{t.directMsg}</p>
                    </div>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Avg. reply ~2h
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {status.message && (
                    <div className={`px-4 py-3 rounded-2xl text-[13px] font-medium tracking-[-0.01em] border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>{status.message}</div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">{t.formName}</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="w-full px-4 py-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[14px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-all duration-200" placeholder={t.generalNamePlaceholder} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">{t.formPhone}</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} required className="w-full px-4 py-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[14px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-all duration-200" placeholder={t.generalPhonePlaceholder} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">{t.emailOptional}</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[14px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-all duration-200" placeholder={t.generalEmailPlaceholder} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 ml-1">{t.formMessage}</label>
                    <textarea rows={4} value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} required className="w-full px-4 py-3 rounded-2xl bg-[#fcfcfc] border border-black/5 focus:border-black/15 focus:bg-white outline-none text-[14px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-all duration-200 resize-none" placeholder={t.askPlaceholder} />
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#0a0a0b] text-white rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-black active:scale-[0.99] disabled:opacity-60 transition-all duration-200 ease-out flex items-center justify-center gap-2">
                    <FaPaperPlane size={11} /> {submitting ? t.submitting : t.send}
                </button>
                <p className="text-center text-[11px] leading-5 tracking-[-0.01em] text-neutral-500">By sending, you agree to our <a href="/privacy" className="underline decoration-black/20 underline-offset-4 hover:text-[#0a0a0b] transition-colors">Privacy</a> & <a href="/terms" className="underline decoration-black/20 underline-offset-4 hover:text-[#0a0a0b] transition-colors">Terms</a>.</p>
            </form>
        </div>
    );
}
