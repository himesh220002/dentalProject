import { FaAward, FaUserMd, FaSmile, FaCertificate, FaQuoteLeft, FaCheckCircle, FaStar } from 'react-icons/fa';
import AchievementsGrid from '@/components/about/AchievementsGrid';
import PatientReviews from '@/components/about/PatientReviews';
import DoctorAdvice from '@/components/about/DoctorAdvice';

export const metadata = {
    title: 'About Us - Dr. Tooth Dental Clinic',
};

export default function About() {
    return (
        <div className="space-y-12 sm:py-4 sm:py-10">
            {/* Hero Section - Refined */}
            <section className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center overflow-hidden px-6 sm:px-16 pb-5 min-h-[85vh] sm:min-h-screen">
                <div className="space-y-8 order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-2xl text-xs font-black tracking-widest uppercase">
                        <FaCertificate className="text-blue-500 animate-pulse" />
                        Dedicated Excellence
                    </div>
                    <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                        Meet <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">Dr. Tooth</span>, Your Smile's Guardian
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium max-w-xl">
                        With over a decade of dedicated service in dentistry, Dr. Tooth is committed to providing top-tier dental care. His philosophy is simple: treating patients with compassion, empathy, and the highest medical standards.
                    </p>
                    <div className="relative p-8 bg-gray-900 text-white rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-blue-600/40 transition-colors"></div>
                        <FaQuoteLeft className="text-4xl text-blue-500/30 mb-4" />
                        <p className="text-lg font-bold leading-relaxed italic relative z-10">
                            "My goal is not just to treat teeth but to ensure every patient leaves with a confident smile and a positive experience."
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-10 h-1 bg-blue-500 rounded-full"></div>
                            <span className="font-black uppercase tracking-widest text-[10px]">Dr. Tooth • Chief Surgeon</span>
                        </div>
                    </div>
                </div>

                {/* Doctor Image Refined */}
                <div className="relative order-1 lg:order-2">
                    <div className="absolute -inset-10 bg-gradient-to-tr from-blue-100 via-teal-50 to-indigo-100 rounded-[3rem] opacity-50 blur-3xl -z-10 animate-pulse"></div>
                    <div className="relative h-[60vh] sm:h-[80vh] w-full bg-gray-200 rounded-[3rem] shadow-2xl overflow-hidden flex items-center justify-center text-gray-400 group">
                        <FaUserMd className="text-[12rem] group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>

                        {/* Interactive Badges */}
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border border-white/50 animate-bounce">
                            <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                                <FaAward size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Top Rated</p>
                                <p className="font-black text-gray-900">Elite Dentist</p>
                            </div>
                        </div>
                    </div>

                    {/* Experience Badge Refined */}
                    <div className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-blue-50 flex items-center gap-4 sm:gap-6">
                        <div className="bg-blue-600 text-white w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FaSmile size={24} className="sm:size-[32px]" />
                        </div>
                        <div>
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 leading-none mb-1">10+</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-black tracking-widest">Years of Trust</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements Grid Section */}
            <div className="pt-12 sm:pt-20">
                <div className="space-y-4 mb-12">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Our Milestones</h2>
                    <p className="text-3xl xl:text-5xl font-black text-gray-900">Proven Results, <br /> Proven Smiles.</p>
                </div>
                <AchievementsGrid />
            </div>

            {/* Reviews Section */}
            <div>
                <PatientReviews />
            </div>

            {/* Advice Section */}
            <div>
                <DoctorAdvice />
            </div>

            {/* Our Values / Mission Refined */}
            <section className="bg-gray-900 py-16 sm:py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-6 sm:px-12 rounded-t-0 lg:rounded-t-[1rem] xl:rounded-t-[5rem] overflow-hidden relative">
                <div className="max-w-5xl mx-auto space-y-5 sm:space-y-20">
                    <div className="text-center space-y-4 sm:space-y-6">
                        <h2 className="text-3xl sm:text-4xl xl:text-6xl font-black text-white leading-tight">Why We Are Different</h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">We combine state-of-the-art dental technology with a deep human touch to ensure your journey is seamless.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 text-white">
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <FaUserMd size={32} />
                            </div>
                            <h3 className="text-2xl font-black">Expert Care</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                Dr. Tooth stays updated with the latest in dental science to provide the best possible treatments tailored to your needs.
                            </p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-teal-600/20 border border-teal-500/30 rounded-3xl flex items-center justify-center text-teal-500 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                                <FaSmile size={32} />
                            </div>
                            <h3 className="text-2xl font-black">Painless Path</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                We use cutting-edge modern techniques to ensure your visit is as comfortable, fast, and pain-free as possible.
                            </p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                                <FaAward size={32} />
                            </div>
                            <h3 className="text-2xl font-black">Gold Standard</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                Absolute hygiene is our priority. We follow ultra-strict international sterilization protocols for your complete safety.
                            </p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/10 text-center">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Dr. Tooth Dental Clinic • Established 2012</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
