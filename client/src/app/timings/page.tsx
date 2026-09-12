'use client';

import { FaClock, FaCalendarCheck, FaPhoneAlt, FaExclamationCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function Timings() {
    const { clinicData } = useClinic();

    const phone = clinicData?.phone || '+91 98765 43210';
    const staffPhone = clinicData?.staffPhone || phone;
    const visitPolicy = clinicData?.visitPolicy || 'We recommend booking an appointment in advance to avoid waiting. Priority is given to scheduled patients.';
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Dental Clinic Road, Katihar, Bihar - 854105';

    const weekDays = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ];

    const timings = weekDays.map(day => {
        const timeStr = clinicData?.timings?.[day.key as keyof typeof clinicData.timings] || (day.key === 'sunday' ? 'Closed' : '10:00 AM - 08:00 PM');
        return { day: day.label, time: timeStr, open: !timeStr.toLowerCase().includes('closed') };
    });

    const lunch = clinicData?.lunchTime || '01:00 PM - 02:00 PM';

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-16">
                {/* Header */}
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Clinic hours ]</div>
                    <h1 className="mt-3 text-[32px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.02] text-[#0a0a0b]">
                        Clinic <span className="font-serif italic font-normal text-neutral-400">hours</span>
                        <span className="block text-[18px] sm:text-[22px] font-medium tracking-[-0.01em] text-neutral-500 mt-1">— always there when you need.</span>
                    </h1>
                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 max-w-[560px]">
                        Dedicated to being available when you need us. Check our weekly schedule below or reach us for emergency support.
                    </p>
                </div>

                <div className="mt-10 grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* Weekly Schedule */}
                    <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                        <div className="px-6 sm:px-8 py-6 border-b border-black/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaCalendarCheck size={14} /></span>
                                <div>
                                    <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Weekly Schedule</h2>
                                    <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Standard hours</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[-0.01em] text-neutral-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Open today
                            </span>
                        </div>
                        <div className="p-2 sm:p-3">
                            <div className="rounded-[20px] bg-[#fcfcfc] border border-black/5 overflow-hidden divide-y divide-black/5">
                                {timings.map((item) => (
                                    <div key={item.day} className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-white transition-colors">
                                        <span className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">{item.day}</span>
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium tracking-[-0.01em] border ${item.open ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                            {item.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 sm:px-8 py-4 bg-[#fcfcfc] border-t border-black/5 flex items-center justify-between text-[12px]">
                            <span className="text-neutral-500 font-medium">Lunch break</span>
                            <span className="font-semibold text-[#0a0a0b]">{lunch}</span>
                        </div>
                    </div>

                    {/* Right stack */}
                    <div className="space-y-5">
                        {/* Visit Policy */}
                        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 grid place-items-center shrink-0"><FaClock size={14} /></span>
                                <div>
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Visit Policy</h3>
                                    <p className="text-[13px] leading-6 text-neutral-600 mt-2">{visitPolicy}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium tracking-[-0.01em] text-neutral-700">
                                        <FaExclamationCircle size={11} className="text-neutral-400" /> Lunch: {lunch}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location mini */}
                        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 shrink-0"><FaMapMarkerAlt size={14} /></span>
                                <div>
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Find us</h3>
                                    <p className="text-[13px] leading-6 text-neutral-600 mt-2">{address}</p>
                                    <p className="text-[12px] text-neutral-500 mt-1">Mon–Sat 10am–8pm · Sunday closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency */}
                        <div className="rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-7 relative overflow-hidden shadow-sm">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.04] rounded-full blur-2xl" />
                            <div className="relative flex items-start gap-3">
                                <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white grid place-items-center shrink-0"><FaPhoneAlt size={13} /></span>
                                <div>
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em]">Emergency support</h3>
                                    <p className="text-[13px] leading-6 text-white/60 mt-2">Severe pain or trauma outside hours? We triage urgently for critical cases.</p>
                                </div>
                            </div>
                            <a href={`tel:${staffPhone.replace(/\s+/g, '')}`} className="relative mt-5 inline-flex items-center justify-center gap-2 w-full bg-white text-[#0a0a0b] py-3 rounded-full text-[13px] font-medium tracking-[-0.01em] hover:bg-neutral-100 active:scale-[0.98] transition">
                                <FaPhoneAlt size={12} /> {staffPhone} <span className="text-neutral-400 font-normal">· Call now</span>
                            </a>
                            <p className="text-[11px] text-white/40 text-center mt-2">Available for registered patients on priority</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
