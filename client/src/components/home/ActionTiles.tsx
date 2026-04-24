import { FaCalendarAlt, FaUserMd, FaSmile, FaArrowRight } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import { ActionTileSkeleton } from '../ui/Skeleton';
import { useRouter } from 'next/navigation';

export default function ActionTiles() {
    const { language } = useClinic();
    const t = translations[language].actionTiles;
    const router = useRouter();

    const tiles = [
        {
            icon: <FaCalendarAlt size={28} />,
            title: t.bookAppointment,
            subtitle: t.bookAppointmentSub,
            buttonText: t.bookAppointmentBtn,
            color: 'blue',
            link: '/contact',
            isPrimary: true
        },
        {
            icon: <FaUserMd size={28} />,
            title: t.meetDentists,
            subtitle: t.meetDentistsSub,
            buttonText: t.meetDentistsBtn,
            color: 'teal',
            link: '/about'
        },
        {
            icon: <FaSmile size={28} />,
            title: t.patientStories,
            subtitle: t.patientStoriesSub,
            buttonText: t.patientStoriesBtn,
            color: 'indigo',
            link: '/blogs'
        }
    ];

    const { isLoading } = useClinic();

    return (
        <section className="relative z-30 px-4 sm:px-6 lg:px-16 pb-12 sm:pb-0">
            {/* Background Bridge Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-500/10 blur-[120px] -z-10 -mt-20"></div>

            <div className="max-w-7xl mx-auto -mt-3 sm:-mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <ActionTileSkeleton key={i} />
                    ))
                ) : (
                    tiles.map((tile, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(tile.link)}
                            className={`group relative overflow-hidden bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/80 flex flex-col items-center sm:items-start gap-6 hover:shadow-2xl hover:shadow-slate-400/10 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer
                            ${tile.isPrimary ? 'ring-2 ring-blue-500/20' : ''}`}
                        >
                            {/* Gradient Accent */}
                            <div className={`absolute top-0 left-0 w-full h-2 transition-all duration-500
                            ${tile.color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                                    tile.color === 'teal' ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                                        'bg-gradient-to-r from-indigo-600 to-indigo-400'}`}
                            />

                            {/* Icon Container */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg
                            ${tile.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    tile.color === 'teal' ? 'bg-cyan-50 text-cyan-600' :
                                        'bg-indigo-50 text-indigo-600'}`}
                            >
                                {tile.icon}
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <h3 className={`text-2xl text-center sm:text-left font-black tracking-tight leading-tight transition-colors duration-300
                                ${tile.color === 'blue' ? 'text-blue-900' :
                                        tile.color === 'teal' ? 'text-cyan-900' :
                                            'text-indigo-900'}`}
                                >
                                    {tile.title}
                                </h3>
                                <p className="text-slate-600 text-center sm:text-left font-medium leading-relaxed">
                                    {tile.subtitle}
                                </p>
                            </div>

                            {/* Button */}
                            <div className="mt-auto pt-4">
                                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500
                                ${tile.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' :
                                        tile.color === 'teal' ? 'bg-cyan-600 text-white shadow-cyan-200 hover:bg-cyan-700' :
                                            'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'} 
                                group-hover:gap-5 shadow-xl`}
                                >
                                    {tile.buttonText}
                                    <FaArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>

                            {/* Decorative Background Element */}
                            <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150
                            ${tile.color === 'blue' ? 'bg-blue-600' :
                                    tile.color === 'teal' ? 'bg-cyan-600' :
                                        'bg-indigo-600'}`}
                            />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
