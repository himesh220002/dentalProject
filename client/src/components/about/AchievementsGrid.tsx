'use client';
import { FaUsers, FaRegThumbsUp, FaAward, FaCalendarAlt } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function AchievementsGrid() {
    const { clinicData, language } = useClinic();

    const stats = {
        patients: clinicData?.happyCustomers || '5,000+',
        success: (clinicData?.successRate || '99') + '%',
        experience: (clinicData?.clinicExperience || '10'),
        certifications: clinicData?.certifications ? (language === 'hi' ? 'प्रमाणित' : 'Certified') : (language === 'hi' ? 'आईडीए प्रमाणित' : 'IDA Certified')
    };

    const achievementsData = {
        en: [
            { icon: <FaUsers size={16} />, count: stats.patients, label: 'Happy Patients', description: 'Successfully treated with care and precision.' },
            { icon: <FaRegThumbsUp size={16} />, count: stats.success, label: 'Success Rate', description: 'Consistent high-quality dental outcomes.' },
            { icon: <FaAward size={16} />, count: stats.certifications, label: 'Global Standard', description: 'Accredited by major dental organizations.' },
            { icon: <FaCalendarAlt size={16} />, count: stats.experience, label: 'Years Excellence', description: 'A decade of dedicated service to patients.' }
        ],
        hi: [
            { icon: <FaUsers size={16} />, count: stats.patients, label: 'खुश मरीज', description: 'देखभाल और सटीकता के साथ सफलतापूर्वक इलाज किया गया।' },
            { icon: <FaRegThumbsUp size={16} />, count: stats.success, label: 'सफलता दर', description: 'लगातार उच्च गुणवत्ता वाले दंत परिणाम।' },
            { icon: <FaAward size={16} />, count: stats.certifications, label: 'वैश्विक मानक', description: 'प्रमुख दंत चिकित्सा संगठनों द्वारा मान्यता प्राप्त।' },
            { icon: <FaCalendarAlt size={16} />, count: stats.experience, label: 'वर्षों की उत्कृष्टता', description: 'मरीजों के लिए एक दशक की समर्पित सेवा।' }
        ]
    };

    const achievements = achievementsData[language as keyof typeof achievementsData] || achievementsData.en;

    return (
        <section className="py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((item, index) => (
                    <div
                        key={index}
                        className="group bg-white rounded-[20px] border border-black/5 p-6 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                        <div className="w-9 h-9 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700 group-hover:bg-[#0a0a0b] group-hover:text-white group-hover:border-black transition-colors duration-300">
                            {item.icon}
                        </div>
                        <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] leading-none text-[#0a0a0b]">{item.count}</h3>
                        <p className="mt-2 text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">{item.label}</p>
                        <p className="mt-2 text-[13px] leading-6 text-neutral-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
