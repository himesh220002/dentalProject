import { FaUserMd, FaTooth, FaSmile, FaCertificate } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function TrustSection() {
    const { clinicData } = useClinic();

    // Default features if no data
    const defaultFeatures = [
        {
            icon: <FaUserMd size={28} />,
            title: '12+ Years Expertise',
            description: 'Decades of specialized experience in advanced dental surgery and patient diagnostics.',
            color: 'blue'
        },
        {
            icon: <FaTooth size={28} />,
            title: 'Modern Technology',
            description: 'Using low-radiation digital X-rays and painless laser dentistry for your safety.',
            color: 'teal'
        },
        {
            icon: <FaSmile size={28} />,
            title: 'Patient-First Care',
            description: 'We prioritize your comfort with a friendly staff and a stress-free environment.',
            color: 'indigo'
        }
    ];

    // Use highlights from clinicData if available, otherwise use defaults
    const features = clinicData?.highlights.map((h, i) => ({
        icon: i === 0 ? <FaUserMd size={28} /> : i === 1 ? <FaTooth size={28} /> : <FaSmile size={28} />,
        title: h.title,
        description: h.description,
        color: i === 0 ? 'blue' : i === 1 ? 'teal' : 'indigo'
    })) || defaultFeatures;

    return (
        <section className="py-12 sm:py-20 lg:py-24 space-y-12 sm:space-y-20 px-6 sm:px-20 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                {/* Left: Visual Content */}
                <div className="flex-1 relative order-2 lg:order-1 w-full max-w-[500px] lg:max-w-none mx-auto lg:mx-0 mt-8 lg:mt-0">
                    <div className="absolute -inset-4 sm:-inset-6 bg-blue-100 rounded-[2rem] sm:rounded-[3rem] -rotate-3 -z-10"></div>
                    <div className="relative bg-white p-3 sm:p-4 rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop"
                            alt="Precision Care"
                            className="rounded-[1.5rem] sm:rounded-[2.5rem] w-full h-[300px] sm:h-[400px] lg:h-[450px] object-cover"
                        />
                        {/* Floating Experience Badge */}
                        <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 lg:-bottom-10 lg:-right-10 bg-gray-900 text-white p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-white flex items-center gap-4 sm:gap-6 animate-float">
                            <div className="bg-blue-600 p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-white">
                                <FaCertificate size={24} className="sm:size-[32px]" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black leading-none mb-1">100%</p>
                                <p className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest">Safe & Sterile</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Text Content */}
                <div className="flex-1 space-y-8 sm:space-y-10 order-1 lg:order-2 text-center lg:text-left">
                    <div className="space-y-4">
                        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase">
                            Why Patients Trust Us
                        </div>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                            Excellence in <br /> Modern Dentistry
                        </h2>
                        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                            We believe in treating the person, not just the tooth. Our clinic combines the latest medical advancements with a warm, compassionate approach.
                        </p>
                    </div>

                    <div className="space-y-6 sm:space-y-8 max-w-xl mx-auto lg:mx-0">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 sm:gap-6 group text-left">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                                    ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                        feature.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                                            'bg-indigo-100 text-indigo-600'}`}
                                >
                                    <div className="scale-90 sm:scale-100">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{feature.title}</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
