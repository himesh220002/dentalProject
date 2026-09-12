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
        { icon: <FaCalendarAlt size={14} />, eyebrow: '01 — Booking', title: t.bookAppointment, subtitle: t.bookAppointmentSub, buttonText: t.bookAppointmentBtn, link: '/contact', accent: 'from-blue-500/10 to-transparent', iconBg: 'bg-blue-50 text-blue-600 border-blue-100' },
        { icon: <FaUserMd size={14} />, eyebrow: '02 — Team', title: t.meetDentists, subtitle: t.meetDentistsSub, buttonText: t.meetDentistsBtn, link: '/about', accent: 'from-violet-500/10 to-transparent', iconBg: 'bg-violet-50 text-violet-600 border-violet-100' },
        { icon: <FaSmile size={14} />, eyebrow: '03 — Stories', title: t.patientStories, subtitle: t.patientStoriesSub, buttonText: t.patientStoriesBtn, link: '/blogs', accent: 'from-emerald-500/10 to-transparent', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    ];
    const { isLoading } = useClinic();

    return (
        <section className="bg-[#fcfcfc] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-20">
            <div className="max-w-[1280px] mx-auto">
                {/* header — improved hierarchy */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">
                            <span className="w-8 h-px bg-neutral-200 hidden sm:block" />[ What ToothOp does ]
                        </div>
                        <h2 className="mt-3 text-[24px] sm:text-[30px] lg:text-[32px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">Simple access, <span className="font-serif italic font-normal text-neutral-400">expert care —</span> without friction.</h2>
                        <div className="mt-3 h-px w-12 bg-[#0a0a0b]/10 hidden sm:block" />
                    </div>
                    <p className="hidden lg:block text-[14px] leading-6 text-neutral-500 max-w-[440px] text-right">Book in seconds, meet verified specialists, and see real transformations — all from one calm, transparent experience.</p>
                    <p className="lg:hidden text-[13px] leading-6 text-neutral-500">Book in seconds, meet verified specialists, and see real transformations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {isLoading ? [...Array(3)].map((_, i) => <ActionTileSkeleton key={i} />) : tiles.map((tile, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(tile.link)}
                            className="group relative bg-white rounded-[20px] border border-black/5 p-6 sm:p-7 flex flex-col overflow-hidden hover:border-black/10 hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                        >
                            {/* subtle accent wash */}
                            <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r ${tile.accent} opacity-60`} />
                            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${tile.accent} blur-2xl opacity-40 pointer-events-none`} />

                            <div className="relative flex items-start justify-between gap-3">
                                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-400">{tile.eyebrow}</span>
                                <span className={`w-9 h-9 rounded-xl border grid place-items-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[-10deg] group-hover:scale-105 shadow-sm ${tile.iconBg}`}>
                                    {tile.icon}
                                </span>
                            </div>

                            <h3 className="relative mt-6 text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b] leading-tight">{tile.title}</h3>
                            <p className="relative mt-2.5 text-[13.5px] leading-6 text-neutral-600 flex-1">{tile.subtitle}</p>

                            <div className="relative mt-7 flex items-center gap-3">
                                <span className="inline-flex items-center gap-2.5 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] group-hover:gap-3 transition-all duration-300 ease-out">
                                    {tile.buttonText}
                                    <span className="w-8 h-8 rounded-full bg-[#0a0a0b] text-white grid place-items-center group-hover:bg-black transition-colors duration-300 shadow-sm">
                                        <FaArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                    </span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 text-[11px] tracking-[0.1em] uppercase font-medium text-neutral-500 justify-center sm:justify-start">
                    <span className="px-3.5 py-2 rounded-full bg-white border border-black/5 shadow-sm">No sign-in required</span>
                    <span className="px-3.5 py-2 rounded-full bg-white border border-black/5 shadow-sm">Transparent pricing</span>
                    <span className="px-3.5 py-2 rounded-full bg-white border border-black/5 shadow-sm">Mon–Sat 10am–8pm</span>
                </div>
            </div>
        </section>
    );
}
