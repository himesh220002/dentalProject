'use client';

import { FaAward, FaUserMd, FaSmile, FaCertificate, FaQuoteLeft, FaCheckCircle, FaStar } from 'react-icons/fa';
import AchievementsGrid from '@/components/about/AchievementsGrid';
import PatientReviews from '@/components/about/PatientReviews';
import DoctorAdvice from '@/components/about/DoctorAdvice';
import { useClinic } from '@/context/ClinicContext';
import { formatExperience } from '@/utils/urlHelper';
import { translations } from '@/constants/translations';

export default function About() {
    const { clinicData, language } = useClinic();
    const t = translations[language as keyof typeof translations];

    const doctorName = clinicData?.doctorName || 'Dr. Tooth';
    const clinicName = clinicData?.clinicName || 'Dr. Tooth Dental';
    const clinicExperience = formatExperience(clinicData?.clinicExperience || '10');
    const chiefConsultant = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief')) || clinicData?.consultants[0];
    const doctorExperience = chiefConsultant?.experience || '12 Years';
    const year = clinicData?.establishedYear || '2014';

    // Description text (localized)
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
        <div className=" space-y-12 sm:pt-4 lg:pt-0 lg:-mt-20">
            {/* Hero Section - Refined */}
            <section className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center overflow-hidden px-6 sm:px-16 pb-5 min-h-[85vh] sm:min-h-screen">
                <div className="space-y-8 order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-2xl text-xs font-black tracking-widest uppercase">
                        <FaCertificate className="text-blue-500 animate-pulse" />
                        {t.aboutHero.excellence}
                    </div>
                    <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                        {t.aboutHero.meet} <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">{doctorName}</span>, {t.aboutHero.guardian}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium max-w-xl">
                        {doctorDesc}
                    </p>
                    <div className="relative p-8 bg-gray-900 text-white rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-blue-600/40 transition-colors"></div>
                        <FaQuoteLeft className="text-4xl text-blue-500/30 mb-4" />
                        <p className="text-lg font-bold leading-relaxed italic relative z-10">
                            {t.aboutHero.quote}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-10 h-1 bg-blue-500 rounded-full"></div>
                            <span className="font-black uppercase tracking-widest text-[10px]">{doctorName} • {t.aboutHero.surgeon}</span>
                        </div>
                    </div>
                </div>

                {/* Doctor Image Refined */}
                <div className="relative order-1 lg:order-2 flex justify-center mt-12 sm:mt-16 lg:mt-0">
                    <div className="absolute -inset-10 bg-gradient-to-tr from-blue-100 via-teal-50 to-indigo-100 rounded-full opacity-50 blur-3xl -z-10 animate-pulse"></div>

                    {/* Interactive Badge Moved Above */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md px-4 py-2 sm:px-8 sm:py-5 rounded-2xl sm:rounded-[2rem] shadow-2xl flex items-center gap-3 sm:gap-5 border border-blue-50 animate-bounce whitespace-nowrap">
                        <div className="bg-yellow-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-yellow-600 shadow-inner">
                            <FaAward size={18} className="sm:size-[24px]" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[11px] font-black uppercase text-blue-500 tracking-[0.2em] leading-none mb-1 sm:mb-2 text-center lg:text-left">{t.aboutHero.topRated}</p>
                            <p className="font-black text-gray-900 text-xs sm:text-xl">{t.aboutHero.eliteDentist}</p>
                        </div>
                    </div>

                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[450px] lg:h-[450px] bg-gray-200 rounded-full shadow-2xl overflow-hidden flex items-center justify-center text-gray-400 group border-8 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop"
                            alt={doctorName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                    </div>

                    {/* Experience Badge Refined */}
                    <div className="absolute -bottom-2 -right-2 sm:-bottom-8 sm:-right-8 bg-white p-3 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-blue-50 flex items-center gap-3 sm:gap-6">
                        <div className="bg-blue-600 text-white w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FaSmile size={20} className="sm:size-[32px]" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-4xl font-black text-gray-900 leading-none mb-0.5 sm:mb-1">{doctorExperience}</p>
                            <p className="text-[8px] sm:text-xs text-gray-400 uppercase font-black tracking-widest">{t.aboutHero.experience}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Our Team - Synchronized Grid with Classy Pattern */}
            <section className="relative py-20 px-6 sm:px-16 overflow-hidden rounded-[3rem] sm:rounded-[4rem] mx-4 group">
                {/* Immersive Background Pattern */}
                <div className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-[2s]">
                    <img
                        src="/images/sciencehanddrawnbg.jpg"
                        className="w-full h-full object-cover opacity-[0.4]"
                        alt="pattern"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-teal-50/10"></div>
                </div>

                <div className="text-start space-y-4 mb-16">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">{t.aboutExperts.title}</h2>
                    <h3 className="text-3xl xl:text-5xl font-black text-gray-900">{t.aboutExperts.subtitle} <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent ">{clinicName}</span></h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {clinicData?.consultants.map((consultant, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border border-2 border-gray-50 hover:border-blue-200 hover:shadow-2xl transition-all group/card">
                            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 group-hover/card:rotate-12 transition-transform">
                                <FaUserMd size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">{consultant.name}</h3>
                            <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">{consultantRole(consultant.role)}</p>
                            <div className="space-y-2">
                                <p className="text-gray-500 text-sm font-medium">{language === 'hi' ? 'विशेषज्ञ दंत चिकित्सा सेवाएं प्रदान करना' : consultant.info}</p>
                                <p className="text-gray-900 text-sm font-black italic">{consultant.experience} {consultantExpLabel}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Achievements Grid Section */}
            <div className="pt-12 sm:pt-20 px-6 sm:px-16">
                <div className="space-y-4 mb-12">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">{t.aboutMilestones.title}</h2>
                    <p className="text-3xl xl:text-5xl font-black text-gray-900">{t.aboutMilestones.subtitle} <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{t.aboutMilestones.provenSmiles}</span></p>
                </div>
                <AchievementsGrid />
            </div>

            {/* Reviews Section */}
            <div>
                <PatientReviews />
            </div>

            {/* Advice Section */}
            <div>
                <DoctorAdvice />
            </div>

            {/* Our Values / Mission Refined */}
            <section className="bg-gray-900 py-16 sm:py-24 px-6 sm:px-12 mb-6 mb-10 xl:mb-20 rounded-[2rem] lg:rounded-[3rem] xl:rounded-[5rem] overflow-hidden relative mx-4">
                <div className="max-w-5xl mx-auto space-y-5 sm:space-y-20">
                    <div className="text-center space-y-4 sm:space-y-6">
                        <h2 className="text-3xl sm:text-4xl xl:text-6xl font-black text-white leading-tight">{t.aboutValues.title}</h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">{t.aboutValues.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 text-white">
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <FaUserMd size={32} />
                            </div>
                            <h3 className="text-2xl font-black">{t.aboutValues.expertCare}</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                {language === 'hi'
                                    ? `${doctorName} आपको आपकी आवश्यकताओं के अनुसार सर्वोत्तम संभव उपचार प्रदान करने के लिए दंत विज्ञान में नवीनतम के साथ अपडेट रहते हैं।`
                                    : `${doctorName} stays updated with the latest in dental science to provide the best possible treatments tailored to your needs.`}
                            </p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-teal-600/20 border border-teal-500/30 rounded-3xl flex items-center justify-center text-teal-500 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                                <FaSmile size={32} />
                            </div>
                            <h3 className="text-2xl font-black">{t.aboutValues.painlessPath}</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                {language === 'hi'
                                    ? 'हम यह सुनिश्चित करने के लिए अत्याधुनिक आधुनिक तकनीकों का उपयोग करते हैं कि आपकी यात्रा यथासंभव आरामदायक, तेज और दर्द रहित हो।'
                                    : 'We use cutting-edge modern techniques to ensure your visit is as comfortable, fast, and pain-free as possible.'}
                            </p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                                <FaAward size={32} />
                            </div>
                            <h3 className="text-2xl font-black">{t.aboutValues.goldStandard}</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                {language === 'hi'
                                    ? 'पूर्ण स्वच्छता हमारी प्राथमिकता है। हम आपकी पूर्ण सुरक्षा के लिए अति-कठिन अंतरराष्ट्रीय नसबंदी प्रोटोकॉल का पालन करते हैं।'
                                    : 'Absolute hygiene is our priority. We follow ultra-strict international sterilization protocols for your complete safety.'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/10 text-center">
                        <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-xl mb-2">{clinicExperience} {t.aboutValues.excellence}</p>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t.aboutValues.decade}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
