'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import { TreatmentCardSkeleton } from '@/components/ui/Skeleton';
import TreatmentIcon from '../../components/TreatmentIcon';

const colorThemes = [
    { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', iconBg: 'bg-indigo-50', icon: 'text-indigo-600', gradient: 'from-indigo-600 to-blue-500', btn: 'bg-indigo-600 hover:bg-indigo-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', iconBg: 'bg-emerald-50', icon: 'text-emerald-600', gradient: 'from-emerald-600 to-teal-500', btn: 'bg-emerald-600 hover:bg-emerald-700' },
    { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', iconBg: 'bg-violet-50', icon: 'text-violet-600', gradient: 'from-violet-600 to-purple-500', btn: 'bg-violet-600 hover:bg-violet-700' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', iconBg: 'bg-amber-50', icon: 'text-amber-600', gradient: 'from-amber-600 to-orange-500', btn: 'bg-amber-600 hover:bg-amber-700' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', iconBg: 'bg-rose-50', icon: 'text-rose-600', gradient: 'from-rose-600 to-pink-500', btn: 'bg-rose-600 hover:bg-rose-700' },
    { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', iconBg: 'bg-sky-50', icon: 'text-sky-600', gradient: 'from-sky-600 to-cyan-500', btn: 'bg-sky-600 hover:bg-sky-700' },
];

const categories = ['All', 'General', 'Surgical', 'Cosmetic', 'Orthodontics', 'Pediatric'] as const;

function getCategory(name: string) {
    const t = name.toLowerCase();
    if (t.includes('scaling') || t.includes('cleaning') || t.includes('filling') || t.includes('consultation') || t.includes('x-ray')) return 'General';
    if (t.includes('extraction') || t.includes('canal') || t.includes('implant') || t.includes('crown') || t.includes('bridge')) return 'Surgical';
    if (t.includes('whitening') || t.includes('smile')) return 'Cosmetic';
    if (t.includes('braces') || t.includes('orthodontic') || t.includes('align')) return 'Orthodontics';
    if (t.includes('kid')) return 'Pediatric';
    return 'General';
}

interface Treatment {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: string;
    icon: string;
}

export default function Treatments() {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);
    const { clinicData, isLoading: contextLoading, language } = useClinic();
    const t = translations[language];
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activeCat, setActiveCat] = useState<(typeof categories)[number]>('All');

    const handleBookNow = (treatmentName: string) => {
        router.push(`/contact?treatment=${encodeURIComponent(treatmentName)}`);
    };

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                if (clinicData?.treatments && clinicData.treatments.length > 0) {
                    const mapped: Treatment[] = clinicData.treatments.map((x: any, idx: number) => ({
                        _id: `context_${idx}`,
                        name: x.name,
                        description: x.description,
                        image: x.image,
                        price: x.price.toString().startsWith('₹') ? x.price : `₹${x.price}`,
                        icon: x.icon
                    }));
                    setTreatments(mapped); setLoading(false); return;
                }
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
                const res = await fetch(`${API_BASE_URL}/treatments`);
                if (!res.ok) throw new Error('Failed to fetch treatments');
                const data = await res.json();
                setTreatments(data);
            } catch (err: any) { console.error('Error fetching treatments:', err); }
            finally { setLoading(false); }
        };
        fetchTreatments();
    }, [clinicData]);

    const filtered = useMemo(() => {
        return treatments.filter(item => {
            const matchesCat = activeCat === 'All' || getCategory(item.name) === activeCat;
            const q = query.trim().toLowerCase();
            const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
            return matchesCat && matchesQuery;
        });
    }, [treatments, query, activeCat]);

    if (loading || contextLoading) return (
        <div className="bg-[#fcfcfc] min-h-screen">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
                <div className="max-w-3xl space-y-4">
                    <div className="h-4 w-32 bg-black/5 animate-pulse rounded-full" />
                    <div className="h-10 w-3/4 bg-black/5 animate-pulse rounded-2xl" />
                    <div className="h-6 w-2/3 bg-black/5 animate-pulse rounded-xl" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => <TreatmentCardSkeleton key={i} />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#fcfcfc] overflow-x-clip">
            {/* Header — homepage minimal */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Our expertise ]</div>
                    <h1 className="mt-3 text-[32px] sm:text-[42px] lg:text-[48px] font-semibold tracking-[-0.03em] leading-[1.02] text-[#0a0a0b]">
                        {language === 'hi' ? 'प्रीमियम' : 'Premium'} <span className="font-serif italic font-normal text-neutral-400">{language === 'hi' ? 'दंत चिकित्सा' : 'dental care'}</span>
                        <span className="block text-[18px] sm:text-[22px] font-medium tracking-[-0.01em] text-neutral-500 mt-1">— made precise.</span>
                    </h1>
                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 max-w-[560px]">
                        {language === 'hi' ? 'अत्याधुनिक तकनीक और सहानुभूतिपूर्ण देखभाल। अपनी मुस्कान के लिए हमारे सटीक उपचार देखें।' : 'State-of-the-art technology meets compassionate care. Explore our precision treatments for your perfect smile.'}
                    </p>
                </div>

                {/* Filter bar — Ballance style */}
                <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <div className="relative flex-1 max-w-[480px]">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={language === 'hi' ? 'उपचार खोजें...' : 'Search treatments...'}
                            className="w-full pl-9 pr-4 h-[42px] rounded-full bg-white border border-black/5 focus:border-black/15 outline-none text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                className={`px-4 py-2 rounded-full text-[12px] font-medium tracking-[-0.01em] border transition-all duration-200 ${activeCat === cat ? 'bg-[#0a0a0b] text-white border-black shadow-sm' : 'bg-white text-neutral-600 border-black/5 hover:border-black/10 hover:text-[#0a0a0b]'}`}
                            >
                                {cat === 'All' ? t.allCategories : cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-[12px] text-neutral-500">
                    <span className="h-px w-8 bg-black/10 hidden sm:block" />
                    <span>{filtered.length} {filtered.length === 1 ? 'treatment' : 'treatments'} {query || activeCat !== 'All' ? 'found' : 'available'}</span>
                    {(query || activeCat !== 'All') && (
                        <button onClick={() => { setQuery(''); setActiveCat('All'); }} className="ml-2 px-3 py-1 rounded-full bg-white border border-black/5 text-[11px] font-medium hover:border-black/10 transition">Clear filters</button>
                    )}
                </div>
            </section>

            {/* Grid — card keeps original design with minute refinements */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-[20px] border border-black/5 p-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-500"><FaSearch size={14} /></div>
                        <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">No treatments found</h3>
                        <p className="mt-1 text-[13px] text-neutral-500">Try a different search or category.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {filtered.map((item, index) => {
                            const theme = colorThemes[index % colorThemes.length];
                            return (
                                <div
                                    key={item._id}
                                    onClick={() => router.push(`/treatments/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                                    className="group cursor-pointer relative bg-white rounded-[20px] border border-black/5 overflow-hidden hover:border-black/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col"
                                >
                                    {/* subtle wash — minute change: opacity reduced from 10 to 6 */}
                                    <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${theme.gradient} opacity-[0.06] rounded-bl-[32px] translate-x-6 -translate-y-6 group-hover:scale-105 transition-transform duration-500 pointer-events-none`} />

                                    <div className="p-6 flex flex-col flex-1 relative">
                                        {/* Header — minute: rounded-xl vs 2xl, text 22 vs 2xl */}
                                        <div className="flex items-center gap-4">
                                            <div className={`${theme.iconBg} w-11 h-11 rounded-xl border ${theme.border} grid place-items-center shrink-0 group-hover:rotate-6 transition-transform duration-300`}>
                                                <TreatmentIcon iconName={item.icon} treatmentName={item.name} treatmentDescription={item.description} className={`text-[20px] ${theme.icon}`} />
                                            </div>
                                            <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[#0a0a0b] leading-tight flex-1">
                                                {(t as any).treatmentNames?.[item.name] || item.name}
                                            </h3>
                                        </div>

                                        <div className="mt-5 flex-1 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`w-1 h-3.5 ${theme.btn.split(' ')[0]} rounded-full`} />
                                                    <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase text-neutral-500">{language === 'hi' ? 'विवरण' : 'Description'}</h4>
                                                </div>
                                                <p className="text-[13px] leading-6 text-neutral-600 line-clamp-3">
                                                    {(t as any).treatmentDescriptions?.[item.description] || item.description}
                                                </p>
                                            </div>
                                            <div className="overflow-hidden rounded-xl border border-black/5 group-hover:border-black/10 transition-colors duration-300">
                                                <img src={item.image || '/images/dentalgeneralimage.jpeg'} alt={item.name} className="w-full h-[180px] object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" loading="lazy" />
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between gap-3">
                                            <div>
                                                <span className="block text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-400">{t.startsFrom}</span>
                                                <span className={`text-[18px] font-semibold tracking-[-0.02em] ${theme.icon}`}>{item.price}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBookNow(item.name); }}
                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] font-medium tracking-[-0.01em] shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 ${theme.btn}`}
                                            >
                                                {t.bookNow} <FaArrowRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Bottom CTA — homepage style */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                <div className="rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="relative">
                        <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.03em] leading-[1.1]">{language === 'hi' ? 'पक्का नहीं है कि कौन सा उपचार सही है?' : 'Not sure which treatment is right?'}</h2>
                        <p className="mt-2 text-[13px] leading-6 text-white/60 max-w-[480px]">{language === 'hi' ? 'एक मुफ्त परामर्श शेड्यूल करें और हमारे विशेषज्ञों को आपका मार्गदर्शन करने दें।' : 'Schedule a free consultation and let our specialists guide you.'}</p>
                    </div>
                    <button onClick={() => router.push('/contact')} className="relative shrink-0 inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-6 py-3.5 rounded-full text-[13px] font-medium tracking-[-0.01em] hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200">
                        {language === 'hi' ? 'परामर्श शेड्यूल करें' : 'Schedule a Consultation'} <FaArrowRight size={11} />
                    </button>
                </div>
            </section>
        </div>
    );
}
