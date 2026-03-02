'use client';
import { FaLightbulb, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '@/constants/translations';

const tipsData = {
    en: [
        {
            title: 'Preventative Care',
            content: 'Brush twice a day and floss daily. It sounds simple, but it is the foundation of lifelong dental health.',
            icon: <FaCheckCircle className="text-2xl text-teal-600" />
        },
        {
            title: 'Regular Checkups',
            content: 'Visit your dentist every 6 months. Early detection of issues can save you from pain and expensive treatments later.',
            icon: <FaLightbulb className="text-2xl text-yellow-600" />
        },
        {
            title: 'My Philosophy',
            content: "I believe in 'Conservation of Tooth'. I will always try to save your natural teeth before considering extractions.",
            icon: <FaUserShield className="text-2xl text-blue-600" />
        }
    ],
    hi: [
        {
            title: 'निवारक देखभाल',
            content: 'दिन में दो बार ब्रश करें और रोजाना फ्लॉस करें। यह सरल लगता है, लेकिन यह आजीवन दंत स्वास्थ्य की नींव है।',
            icon: <FaCheckCircle className="text-2xl text-teal-600" />
        },
        {
            title: 'नियमित जांच',
            content: 'हर 6 महीने में अपने दंत चिकित्सक के पास जाएँ। समस्याओं का जल्द पता लगाने से आप बाद में दर्द और महंगे उपचारों से बच सकते हैं।',
            icon: <FaLightbulb className="text-2xl text-yellow-600" />
        },
        {
            title: 'मेरा दर्शन',
            content: "मैं 'दांतों के संरक्षण' में विश्वास करता हूं। मैं निष्कर्षण पर विचार करने से पहले हमेशा आपके प्राकृतिक दांतों को बचाने की कोशिश करूंगा।",
            icon: <FaUserShield className="text-2xl text-blue-600" />
        }
    ]
};

export default function DoctorAdvice() {
    const { clinicData, language } = useClinic();
    const t = translations[language as keyof typeof translations];
    const doctorName = clinicData?.doctorName || 'Dr. Tooth';
    const tips = tipsData[language as keyof typeof tipsData] || tipsData.en;

    return (
        <section className="py-20 sm:py-32 space-y-20 sm:space-y-32 px-4 sm:px-0  relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 -mr-64 -mt-64"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16 mx-1 sm:mx-5">
                <div className="space-y-6 sm:space-y-8 max-w-2xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-full font-black tracking-[0.2em] text-[10px] uppercase shadow-lg shadow-blue-500/20">
                        <FaLightbulb /> {t.aboutAdvice.title}
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                        {doctorName}{language === 'hi' ? ' की' : "'s"} {language === 'hi' ? 'सलाह' : 'Advice'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t.aboutAdvice.thoughts}</span>
                    </h2>
                    <p className="text-gray-500 text-lg sm:text-xl font-medium leading-relaxed">
                        {t.aboutAdvice.quote}
                    </p>
                </div>
                <div className="hidden lg:block shrink-0">
                    <div className="w-40 h-40 bg-gray-100 rounded-[3rem] border-8 border-white shadow-2xl flex items-center justify-center rotate-12 hover:rotate-0 transition-all duration-700">
                        <FaUserShield size={64} className="text-blue-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mx-1 sm:mx-5">
                {tips.map((tip, index) => (
                    <div
                        key={index}
                        className="group bg-white p-10 sm:p-12 rounded-[3rem] border border-gray-100 hover:border-blue-200 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[3rem] group-hover:bg-blue-50 transition-colors"></div>
                        <div className="mb-10 w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-300 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden relative z-10">
                            {tip.icon}
                        </div>
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{tip.title}</h3>
                            <p className="text-gray-500 text-base sm:text-lg leading-relaxed font-medium">
                                {tip.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-[3rem] sm:rounded-[5rem] p-12 sm:p-24 mx-1 sm:mx-5 text-white flex flex-col items-center text-center gap-10 sm:gap-16 shadow-[0_0px_50px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                <div className="space-y-6 sm:space-y-8 relative z-10 max-w-3xl">
                    <h3 className="text-4xl sm:text-6xl font-black tracking-tight">{t.aboutAdvice.askAnything} {doctorName}</h3>
                    <p className="text-gray-400 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        {t.aboutAdvice.askSub}
                    </p>
                </div>

                <button className="relative z-10 bg-white text-gray-900 px-12 py-6 rounded-[2rem] font-black hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl flex items-center gap-4 text-xs sm:text-lg">
                    {t.aboutAdvice.send} <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 group-hover:bg-white group-hover:translate-x-2 transition-all"><FaLightbulb size={14} /></div>
                </button>
            </div>
        </section>
    );
}
