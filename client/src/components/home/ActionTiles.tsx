import { FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';
import { translations } from '../../constants/translations';
import { ActionTileSkeleton } from '../ui/Skeleton';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ActionTiles() {
    const { clinicData, language } = useClinic();
    const t = translations[language];
    const router = useRouter();

    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}` : (language === 'hi' ? 'मार्केट रोड, डेंटल स्क्वायर के पास' : 'Market Road, Near Dental Square');
    const subAddress = clinicData ? `${clinicData.address.state} - ${clinicData.address.zip}` : (language === 'hi' ? 'कटिहार, बिहार - 854105' : 'Katihar, Bihar - 854105');
    const phone = clinicData?.staffPhone || clinicData?.phone || '+91 98765 43210';
    const hours = clinicData ? `${language === 'hi' ? 'सोम - शनि' : 'Mon - Sat'}: ${clinicData.timings.monday}` : (language === 'hi' ? 'सोम - शनि: सुबह 10:00 - रात 08:00' : 'Mon - Sat: 10:00 AM - 08:00 PM');
    const subHours = clinicData ? `${language === 'hi' ? 'रविवार' : 'Sunday'}: ${clinicData.timings.sunday}` : (language === 'hi' ? 'रविवार: केवल आपातकालीन' : 'Sunday: Emergency Only');

    const tiles = [
        {
            icon: <FaClock size={24} />,
            title: t.workingHours,
            content: hours,
            subContent: subHours,
            color: 'blue',
            className: 'hidden lg:flex'
        },
        {
            icon: <FaMapMarkerAlt size={24} />,
            title: t.visitUs,
            content: address,
            subContent: subAddress,
            color: 'teal',
            link: '/contact#map'
        },
        {
            icon: <FaPhoneAlt size={24} />,
            title: t.quickContact,
            content: phone,
            subContent: t.urgentQueries,
            color: 'indigo',
            link: `/contact`
        }
    ];

    return (
        <section className="relative z-20 px-4 sm:px-6 py-6 sm:py-8 overflow-hidden ">
            <div className="absolute inset-0 max-w-[1600px] mx-auto -z-10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                <Image
                    src="/images/laboratory-with-scientist-futuristic-interior.jpg"
                    alt="Clinic Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <div className="absolute inset-0 -z-10 bg-[#c7d1f200]/45 backdrop-blur-[1px]" />
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ">
                {useClinic().isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className={i === 0 ? 'hidden lg:block' : ''}>
                            <ActionTileSkeleton />
                        </div>
                    ))
                ) : (
                    tiles.map((tile, index) => (
                        <div
                            key={index}
                            onClick={() => tile.link && router.push(tile.link)}
                            className={`bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/80 flex flex-col gap-5 sm:gap-6 hover:shadow-2xl hover:shadow-slate-400/10 hover:border-blue-200 transition-all duration-500 group transform hover:-translate-y-1 active:scale-95 cursor-pointer ${tile.className || ''}`}
                        >
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6
                            ${tile.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                    tile.color === 'teal' ? 'bg-cyan-100 text-cyan-700' :
                                        'bg-indigo-100 text-indigo-700'}`}
                            >
                                <div className="scale-90 sm:scale-100">
                                    {tile.icon}
                                </div>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{tile.title}</h3>
                                <p className="font-semibold text-slate-700 leading-tight text-sm sm:text-base">{tile.content}</p>
                                <p className="text-slate-500 text-xs sm:text-sm font-medium">{tile.subContent}</p>
                            </div>
                            <div className="pt-4 mt-auto">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${tile.color === 'blue' ? 'bg-blue-200 group-hover:bg-blue-600 w-12 group-hover:w-full' :
                                    tile.color === 'teal' ? 'bg-cyan-200 group-hover:bg-cyan-600 w-12 group-hover:w-full' :
                                        'bg-indigo-200 group-hover:bg-indigo-600 w-12 group-hover:w-full'
                                    }`}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
