'use client';
import { FaLightbulb, FaCheckCircle, FaUserShield, FaArrowRight } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '@/constants/translations';

const tipsData = {
    en: [
        { title: 'Preventative Care', content: 'Brush twice a day and floss daily. It sounds simple, but it is the foundation of lifelong dental health.', icon: <FaCheckCircle size={14} /> },
        { title: 'Regular Checkups', content: 'Visit your dentist every 6 months. Early detection of issues can save you from pain and expensive treatments later.', icon: <FaLightbulb size={14} /> },
        { title: 'My Philosophy', content: "I believe in 'Conservation of Tooth'. I will always try to save your natural teeth before considering extractions.", icon: <FaUserShield size={14} /> }
    ],
    hi: [
        { title: 'निवारक देखभाल', content: 'दिन में दो बार ब्रश करें और रोजाना फ्लॉस करें। यह सरल लगता है, लेकिन यह आजीवन दंत स्वास्थ्य की नींव है।', icon: <FaCheckCircle size={14} /> },
        { title: 'नियमित जांच', content: 'हर 6 महीने में अपने दंत चिकित्सक के पास जाएँ। समस्याओं का जल्द पता लगाने से आप बाद में दर्द और महंगे उपचारों से बच सकते हैं।', icon: <FaLightbulb size={14} /> },
        { title: 'मेरा दर्शन', content: "मैं 'दांतों के संरक्षण' में विश्वास करता हूं। मैं निष्कर्षण पर विचार करने से पहले हमेशा आपके प्राकृतिक दांतों को बचाने की कोशिश करूंगा।", icon: <FaUserShield size={14} /> }
    ]
};

export default function DoctorAdvice() {
    const { clinicData, language } = useClinic();
    const t = translations[language as keyof typeof translations];
    const doctorName = clinicData?.doctorName || 'ToothOp';
    const tips = tipsData[language as keyof typeof tipsData] || tipsData.en;

    return (
        <section className="py-10 sm:py-12 px-4 md:px-8 xl:px-0">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Expert guidance ]</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">
                            Advice <span className="font-serif italic font-normal text-neutral-400">{t.aboutAdvice.thoughts}</span>
                        </h2>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-600 max-w-[560px]">{t.aboutAdvice.quote}</p>
                    </div>
                    <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaUserShield size={18} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {tips.map((tip, index) => (
                        <div key={index} className="group bg-white p-6 sm:p-7 rounded-[20px] border border-black/5 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            <div className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 group-hover:bg-[#0a0a0b] group-hover:text-white group-hover:border-black transition-colors duration-300">{tip.icon}</div>
                            <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{tip.title}</h3>
                            <p className="mt-2 text-[13px] leading-6 text-neutral-600">{tip.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-[24px] bg-[#0a0a0b] text-white  p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-[560px]">
                        <h3 className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.03em] leading-[1.1]">{t.aboutAdvice.askAnything} <span className="font-serif italic font-normal text-white/60">{doctorName}</span></h3>
                        <p className="mt-2 text-[13px] leading-6 text-white/60">{t.aboutAdvice.askSub}</p>
                    </div>
                    <button
                        onClick={() => {
                            const phone = clinicData?.staffPhone || clinicData?.phone || '91XXXXXXXXXX';
                            const cleanPhone = phone.replace(/\D/g, '');
                            const msg = encodeURIComponent("Regarding Dental - ");
                            window.open(`https://wa.me/${cleanPhone}/?text=${msg}`, '_blank');
                        }}
                        className="relative shrink-0 inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-6 py-3.5 rounded-full text-[13px] font-medium tracking-[-0.01em] hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200"
                    >
                        {t.aboutAdvice.send} <span className="w-7 h-7 rounded-full bg-[#0a0a0b] text-white grid place-items-center"><FaArrowRight size={11} /></span>
                    </button>
                </div>
            </div>
        </section>
    );
}
