import { FaUsers, FaRegThumbsUp, FaAward, FaCalendarAlt } from 'react-icons/fa';

const achievements = [
    {
        icon: <FaUsers className="text-3xl text-blue-500" />,
        count: '15,000+',
        label: 'Happy Patients',
        description: 'Successfully treated with care and precision.'
    },
    {
        icon: <FaRegThumbsUp className="text-3xl text-teal-500" />,
        count: '99%',
        label: 'Success Rate',
        description: 'Consistent high-quality dental outcomes.'
    },
    {
        icon: <FaAward className="text-3xl text-yellow-500" />,
        count: '25+',
        label: 'Certifications',
        description: 'Accredited by major dental organizations.'
    },
    {
        icon: <FaCalendarAlt className="text-3xl text-indigo-500" />,
        count: '12+',
        label: 'Years Excellence',
        description: 'A decade of dedicated service to patients.'
    }
];

export default function AchievementsGrid() {
    return (
        <section className="py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {achievements.map((item, index) => (
                    <div
                        key={index}
                        className="p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group text-center"
                    >
                        <div className="mb-4 sm:mb-6 inline-block p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <div className="scale-90 sm:scale-100">
                                {item.icon}
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black text-gray-900 mb-1 sm:mb-2">{item.count}</h3>
                        <p className="font-bold text-gray-800 mb-1 sm:mb-2 uppercase tracking-tight text-[10px] sm:text-xs">{item.label}</p>
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
