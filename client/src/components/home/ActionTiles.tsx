import { FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function ActionTiles() {
    const { clinicData } = useClinic();

    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}` : 'Market Road, Near Dental Square';
    const subAddress = clinicData ? `${clinicData.address.state} - ${clinicData.address.zip}` : 'Katihar, Bihar - 854105';
    const phone = clinicData?.phone || '+91 98765 43210';
    const hours = clinicData ? `Mon - Sat: ${clinicData.timings.monday}` : 'Mon - Sat: 10:00 AM - 08:00 PM';
    const subHours = clinicData ? `Sunday: ${clinicData.timings.sunday}` : 'Sunday: Emergency Only';

    const tiles = [
        {
            icon: <FaClock size={24} />,
            title: 'Working Hours',
            content: hours,
            subContent: subHours,
            color: 'blue'
        },
        {
            icon: <FaMapMarkerAlt size={24} />,
            title: 'Visit Our Clinic',
            content: address,
            subContent: subAddress,
            color: 'teal'
        },
        {
            icon: <FaPhoneAlt size={24} />,
            title: 'Quick Contact',
            content: phone,
            subContent: 'Call for urgent queries',
            color: 'indigo'
        }
    ];

    return (
        <section className="-mt-10 sm:-mt-12 lg:-mt-16 relative z-20 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {tiles.map((tile, index) => (
                    <div
                        key={index}
                        className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col gap-5 sm:gap-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group transform hover:-translate-y-2 active:scale-95 cursor-pointer"
                    >
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6
                            ${tile.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                tile.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                                    'bg-indigo-50 text-indigo-600'}`}
                        >
                            <div className="scale-90 sm:scale-100">
                                {tile.icon}
                            </div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900">{tile.title}</h3>
                            <p className="font-bold text-gray-700 leading-tight text-sm sm:text-base">{tile.content}</p>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">{tile.subContent}</p>
                        </div>
                        <div className="pt-4 mt-auto">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${tile.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-600 w-12 group-hover:w-full' :
                                tile.color === 'teal' ? 'bg-teal-100 group-hover:bg-teal-600 w-12 group-hover:w-full' :
                                    'bg-indigo-100 group-hover:bg-indigo-600 w-12 group-hover:w-full'
                                }`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
