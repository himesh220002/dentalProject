'use client';

import { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqs = [
    { q: 'Do you accept walk-ins or only appointments?', a: 'We recommend booking ahead for a calm, on-time experience. Walk-ins are welcome subject to availability — the booking card on this page shows live slots.' },
    { q: 'Is treatment painful? What about anesthesia?', a: 'We use modern local anesthesia and gentle protocols. Most patients report minimal to no discomfort — we explain every step before we begin.' },
    { q: 'How do I check or reschedule my appointment?', a: 'Use the “Find your booking” card at the top with your phone number or booking ID. You can view details and request a new slot without signing in.' },
    { q: 'What are your timings and location?', a: 'Mon–Sat 10:00–20:00 in Katihar, Bihar. See the Timings page for the live schedule and map. Sunday is closed.' },
    { q: 'Do you offer EMI or transparent pricing?', a: 'Yes — every treatment lists a clear starting price on the Treatments page. Ask us about flexible payment options at the clinic.' },
];

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start">
                <div className="lg:sticky lg:top-[88px]">
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-700">[ Questions — answers ]</div>
                    <h2 className="mt-3 text-[30px] sm:text-[38px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">Frequent <span className="font-serif italic font-normal text-neutral-400">questions.</span></h2>
                    <p className="mt-3 text-[14px] leading-6 text-neutral-600 max-w-[420px]">Clear answers — so you know what to expect before you visit. Still unsure? Send a direct inquiry below.</p>
                    <div className="hidden lg:flex mt-6 p-4 rounded-2xl bg-[#f5f5f3] border border-black/5 text-[13px] leading-6 text-neutral-600">
                        <span className="font-medium tracking-[-0.01em] text-[#0a0a0b]">Tip:</span>&nbsp;For urgent pain outside hours, call us directly — we triage on priority.
                    </div>
                </div>

                <div className="space-y-3">
                    {faqs.map((f, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={f.q} className={`rounded-[20px] border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'bg-white border-black/10 shadow-sm' : 'bg-white border-black/5 hover:border-black/10 hover:shadow-sm'}`}>
                                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left">
                                    <span className="text-[14px] sm:text-[15px] font-medium tracking-[-0.01em] text-[#0a0a0b] pr-2">{f.q}</span>
                                    <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'bg-[#0a0a0b] text-white border-[#0a0a0b] rotate-0' : 'bg-[#f5f5f3] text-neutral-600 border-black/5 rotate-0'}`}>
                                        {isOpen ? <FaMinus size={11} /> : <FaPlus size={11} />}
                                    </span>
                                </button>
                                <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden"><p className="px-5 sm:px-6 pb-5 text-[13px] leading-6 text-neutral-600">{f.a}</p></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
