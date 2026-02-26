import { FaLightbulb, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

const tips = [
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
];

export default function DoctorAdvice() {
    const { clinicData } = useClinic();
    const doctorName = clinicData?.doctorName || 'Dr. Tooth';

    return (
        <section className="py-12 sm:py-20 space-y-10 sm:space-y-16 px-4 sm:px-0">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b-2 border-gray-100">
                <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                        {doctorName}'s Advice <br /> & Thoughts
                    </h2>
                    <p className="text-gray-500 text-base sm:text-lg max-w-xl">
                        A healthy smile requires more than just clinical visits. Here are my top tips for maintaining your dental well-being.
                    </p>
                </div>
                <div className="hidden lg:block">
                    <div className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold tracking-widest text-xs uppercase">
                        Knowledge Corner
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {tips.map((tip, index) => (
                    <div
                        key={index}
                        className="group bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 hover:border-blue-200 transition-all duration-300"
                    >
                        <div className="mb-6 sm:mb-8 w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <div className="scale-90 sm:scale-100">
                                {tip.icon}
                            </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">{tip.title}</h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {tip.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center gap-8 sm:gap-10 overflow-hidden relative">
                <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
                    <h3 className="text-2xl sm:text-3xl font-black">Ask {doctorName} Anything</h3>
                    <p className="text-gray-400 text-base sm:text-lg">
                        Have a specific question about your dental health? Send me a message and I'll get back to you with professional advice.
                    </p>
                </div>
                <button className="w-full md:w-auto bg-white text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1 text-sm sm:text-base">
                    SEND A MESSAGE
                </button>
            </div>
        </section>
    );
}
