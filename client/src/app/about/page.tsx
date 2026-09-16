'use client';

import { useState } from 'react';
import { FaAward, FaUserMd, FaSmile, FaQuoteLeft } from 'react-icons/fa';
import AchievementsGrid from '@/components/about/AchievementsGrid';
import PatientReviews from '@/components/about/PatientReviews';
import DoctorAdvice from '@/components/about/DoctorAdvice';
import { useClinic } from '@/context/ClinicContext';
import { formatExperience } from '@/utils/urlHelper';
import { translations } from '@/constants/translations';
import { ConsultantCardSkeleton } from '@/components/ui/Skeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function About() {
    const { clinicData, language } = useClinic();
    // const [imgLoaded, setImgLoaded] = useState(false);

    const t = translations[language as keyof typeof translations];

    const doctorName = clinicData?.doctorName || 'ToothOp';
    const clinicName = clinicData?.clinicName || 'ToothOp';
    const clinicExperience = formatExperience(clinicData?.clinicExperience || '10');
    const chiefConsultant = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief')) || clinicData?.consultants[0];
    const doctorExperience = chiefConsultant?.experience || '12 Years';

    const doctorDesc = language === 'hi'
        ? `दंत चिकित्सा में ${doctorExperience} की समर्पित सेवा के साथ, ${doctorName} शीर्ष स्तर की दंत चिकित्सा देखभाल प्रदान करने के लिए प्रतिबद्ध हैं। उनका दर्शन सरल है: रोगियों के साथ करुणा, सहानुभूति और उच्चतम चिकित्सा मानकों के साथ व्यवहार करना।`
        : `With ${doctorExperience} of dedicated service in dentistry, ${doctorName} is committed to providing top-tier dental care. His philosophy is simple: treating patients with compassion, empathy, and the highest medical standards.`;

    const consultantRole = (role: string) => {
        if (language !== 'hi') return role;
        if (role.toLowerCase().includes('chief')) return 'मुख्य दंत चिकित्सक';
        if (role.toLowerCase().includes('orthodontist')) return 'ऑर्थोडॉन्टिस्ट';
        if (role.toLowerCase().includes('endodontist')) return 'एंडोडॉन्टिस्ट';
        if (role.toLowerCase().includes('pedodontist')) return 'पेडोडॉन्टिस्ट';
        if (role.toLowerCase().includes('periodontist')) return 'पीरियोडॉन्टिस्ट';
        if (role.toLowerCase().includes('prosthodontist')) return 'प्रोस्थोडॉन्टिस्ट';
        if (role.toLowerCase().includes('surgeon')) return 'सर्जन';
        return role;
    };

    const consultantExpLabel = language === 'hi' ? 'का अनुभव' : 'Experience';

    return (
        <div className="bg-[#fcfcfc] overflow-x-clip">
            {/* Hero — minimal, matches homepage TrustSection rhythm */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-12">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
                    <div className="order-2 lg:order-1 space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Dedicated excellence ]</div>
                            <h1 className="mt-3 text-[32px] sm:text-[42px] lg:text-[48px] font-semibold tracking-[-0.03em] leading-[1.02] text-[#0a0a0b]">
                                {t.aboutHero.meet} <span className="font-serif italic font-normal text-neutral-400">{useClinic().isLoading ? <Skeleton variant="text" className="inline-block w-40 h-8 align-middle" /> : doctorName}</span>
                                <span className="block text-[22px] sm:text-[28px] font-normal tracking-[-0.02em] text-neutral-500 mt-1">{t.aboutHero.guardian}</span>
                            </h1>
                            <p className="mt-4 text-[14px] leading-7 text-neutral-600 max-w-[560px]">{doctorDesc}</p>
                        </div>

                        <div className="rounded-[20px] bg-gradient-to-br from-purple-950 via-[#121282] to-black text-white p-6 sm:p-7 relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.04] rounded-full blur-2xl" />
                            <FaQuoteLeft className="text-white/15 text-xl mb-3" />
                            <p className="text-[15px] leading-7 font-medium relative">“{t.aboutHero.quote}”</p>
                            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
                                <div className="w-8 h-8 rounded-full bg-white text-[#0a0a0b] grid place-items-center text-[10px] font-bold">“</div>
                                <span className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/60">{doctorName} • {t.aboutHero.surgeon}</span>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 relative">
                        <div className="bg-white max-w-[300px] sm:max-w-[500px] p-2 sm:p-2.5 rounded-[24px] border border-black/5 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
                            <div className="relative rounded-[18px] overflow-hidden bg-[#f5f5f3] aspect-[4/4.6] sm:aspect-[4/4.2]">
                                {/* {!imgLoaded && <div className="absolute inset-0"><Skeleton variant="rect" className="w-full h-full !rounded-none" /></div>} */}
                                <img src="/images/rendering-anime-doctor-job.jpg" alt={doctorName} className={`w-full h-full object-cover transition duration-700 `} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
                                {/* top badge inside */}
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-black/5 flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 grid place-items-center"><FaAward size={12} /></span>
                                    <span>
                                        <span className="block text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-500 leading-none">{t.aboutHero.topRated}</span>
                                        <span className="block text-[12px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{t.aboutHero.eliteDentist}</span>
                                    </span>
                                </div>
                                {/* bottom badge inside */}
                                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-sm border border-black/5 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-xl bg-[#0a0a0b] text-white grid place-items-center"><FaSmile size={14} /></span>
                                    <span>
                                        <span className="block text-[13px] font-semibold leading-none text-[#0a0a0b]">{doctorExperience}</span>
                                        <span className="block text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-500">{t.aboutHero.experience}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team — same card system as homepage */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ The team ]</div>
                        <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">{t.aboutExperts.title}</h2>
                        <h3 className="text-[16px] font-medium tracking-[-0.01em] text-neutral-500 mt-1">{t.aboutExperts.subtitle} <span className="font-serif italic text-neutral-400">{clinicName}</span></h3>
                    </div>
                </div>
                <p className="text-[14px] leading-7 text-neutral-600 max-w-[720px] mb-8">
                    {language === 'hi' ? 'हमारी टीम अनुभवी दंत विशेषज्ञों से बनी है जो सटीक निदान, स्पष्ट सलाह और दीर्घकालिक उपचार परिणामों पर ध्यान देती है।' : 'Our team combines clinical experience with patient-first communication, so every treatment plan is clear, transparent, and outcome-focused.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {useClinic().isLoading ? [...Array(4)].map((_, i) => <ConsultantCardSkeleton key={i} />) : clinicData?.consultants.map((consultant, idx) => (
                        <div key={idx} className="group bg-white rounded-[20px] border border-black/5 p-6 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            <div className="w-10 h-10 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 group-hover:bg-[#0a0a0b] group-hover:text-white group-hover:border-black transition-colors duration-300"><FaUserMd size={14} /></div>
                            <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{consultant.name}</h3>
                            <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mt-1">{consultantRole(consultant.role)}</p>
                            <p className="text-[13px] leading-6 text-neutral-600 mt-3 line-clamp-3">{language === 'hi' ? 'विशेषज्ञ दंत चिकित्सा सेवाएं प्रदान करना' : consultant.info}</p>
                            <p className="text-[12px] font-medium tracking-[-0.01em] text-[#0a0a0b] mt-3">{consultant.experience} {consultantExpLabel}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Milestones */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="mb-6">
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Proof of care ]</div>
                    <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">{t.aboutMilestones.subtitle} <span className="font-serif italic font-normal text-neutral-400">{t.aboutMilestones.provenSmiles}</span></h2>
                    <p className="mt-2 text-[14px] leading-7 text-neutral-600 max-w-[720px]">{language === 'hi' ? 'हमारे परिणाम निरंतर गुणवत्ता, कड़े संक्रमण नियंत्रण और सुव्यवस्थित उपचार प्रोटोकॉल पर आधारित हैं।' : 'These outcomes reflect consistent standards in diagnosis, sterilization, and follow-through across every treatment stage.'}</p>
                </div>
                <AchievementsGrid />
            </section>

            {/* Reviews */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <PatientReviews />
            </section>

            {/* Advice */}
            <DoctorAdvice />

            {/* Values */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="text-center max-w-[720px] mx-auto">
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Why we are different ]</div>
                    <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">{t.aboutValues.title}</h2>
                    <p className="mt-3 text-[14px] leading-7 text-neutral-600">{t.aboutValues.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mt-8">
                    {[
                        { icon: <FaUserMd size={14} />, title: t.aboutValues.expertCare, desc: language === 'hi' ? `${doctorName} आपको आपकी आवश्यकताओं के अनुसार सर्वोत्तम संभव उपचार प्रदान करने के लिए दंत विज्ञान में नवीनतम के साथ अपडेट रहते हैं।` : `${doctorName} stays updated with the latest in dental science to provide the best possible treatments tailored to your needs.` },
                        { icon: <FaSmile size={14} />, title: t.aboutValues.painlessPath, desc: language === 'hi' ? 'हम यह सुनिश्चित करने के लिए अत्याधुनिक आधुनिक तकनीकों का उपयोग करते हैं कि आपकी यात्रा यथासंभव आरामदायक, तेज और दर्द रहित हो।' : 'We use cutting-edge modern techniques to ensure your visit is as comfortable, fast, and pain-free as possible.' },
                        { icon: <FaAward size={14} />, title: t.aboutValues.goldStandard, desc: language === 'hi' ? 'पूर्ण स्वच्छता हमारी प्राथमिकता है। हम आपकी पूर्ण सुरक्षा के लिए अति-कठिन अंतरराष्ट्रीय नसबंदी प्रोटोकॉल का पालन करते हैं।' : 'Absolute hygiene is our priority. We follow ultra-strict international sterilization protocols for your complete safety.' },
                    ].map(card => (
                        <div key={card.title} className="group bg-white rounded-[20px] border border-black/5 p-6 sm:p-7 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                            <div className="w-10 h-10 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 mx-auto group-hover:bg-[#0a0a0b] group-hover:text-white transition-colors duration-300">{card.icon}</div>
                            <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{card.title}</h3>
                            <p className="mt-2 text-[13px] leading-6 text-neutral-600">{card.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-[20px] bg-[#f5f5f3] border border-black/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">{clinicExperience} {t.aboutValues.excellence} <span className="text-neutral-500 font-normal">· {t.aboutValues.decade}</span></p>
                    {/* <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 hidden sm:block">Katihar · Bihar</span> */}
                </div>
            </section>
        </div>
    );
}
