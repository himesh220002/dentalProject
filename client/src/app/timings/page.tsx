import { FaClock, FaCalendarCheck, FaPhoneAlt, FaExclamationCircle, FaDoorOpen } from 'react-icons/fa';

export const metadata = {
    title: 'Clinic Timings - Dr. Tooth Dental Clinic',
};

export default function Timings() {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4 md:px-8 space-y-16">

            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gray-900">
                    Clinic <span className="text-blue-600">Hours</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
                    We are dedicated to being available when you need us. Check our weekly schedule below or contact us for emergency support.
                </p>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">

                {/* Weekly Schedule Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <FaCalendarCheck className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider">Weekly Schedule</h2>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Standard Operating Hours</p>
                            </div>
                        </div>
                        <FaDoorOpen className="text-4xl opacity-20" />
                    </div>
                    <div className="p-10 space-y-6">
                        {[
                            { day: 'Monday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Tuesday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Wednesday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Thursday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Friday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Saturday', time: '10:00 AM - 08:00 PM', open: true },
                            { day: 'Sunday', time: 'Closed / Appointment Only', open: false },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-center pb-4 ${idx !== 6 ? 'border-b border-gray-50' : ''}`}>
                                <span className="font-black text-gray-700 tracking-tight uppercase text-sm">{item.day}</span>
                                <span className={`font-black px-4 py-2 rounded-xl text-sm shadow-sm ${item.open
                                    ? 'text-blue-600 bg-blue-50 border border-blue-100'
                                    : 'text-rose-500 bg-rose-50 border border-rose-100'
                                    }`}>
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info & Emergency Column */}
                <div className="space-y-10">

                    {/* Appointment Note */}
                    <div className="bg-emerald-50 p-10 rounded-[2.5rem] border-2 border-emerald-100 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 text-emerald-200/30 group-hover:scale-110 transition-transform duration-700">
                            <FaClock className="text-[12rem]" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black text-emerald-900 flex items-center gap-3">
                                <div className="bg-emerald-200 p-2 rounded-xl">
                                    <FaExclamationCircle />
                                </div>
                                Visit Policy
                            </h3>
                            <div className="space-y-4 text-emerald-800 font-medium leading-relaxed">
                                <p>
                                    We recommend booking an appointment in advance to avoid long waiting times.
                                    Priority is always given to scheduled patients.
                                </p>
                                <div className="bg-white/50 p-4 rounded-2xl border border-emerald-200/50">
                                    <p className="text-sm font-black uppercase tracking-widest text-emerald-950">
                                        Lunch Break: 02:00 PM - 03:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border-t-8 border-rose-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                                    <FaPhoneAlt className="text-rose-500" /> Emergency
                                </h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Severe toothache or accident outside working hours? We offer dedicated emergency support for critical cases.
                                </p>
                            </div>
                            <a
                                href="tel:+919876543210"
                                className="inline-flex items-center justify-center gap-3 w-full bg-rose-600 text-white font-black py-5 rounded-2xl hover:bg-rose-500 transition shadow-xl hover:shadow-rose-500/20 active:scale-95 group text-lg"
                            >
                                <FaPhoneAlt className="group-hover:rotate-12 transition-transform" /> Call Now: +91 98765 43210
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
