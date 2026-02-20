import Link from 'next/link';
import { FaTooth, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white pt-20 pb-10  sm:mt-10 lg:mt-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                <FaTooth className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-black tracking-tight">
                                Dr. Tooth <span className="text-blue-500 font-medium">Dental</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            Providing world-class dental care with a focus on patient comfort and advanced technology. Your smile is our priority since 2014.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-8">Quick Navigation</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'Treatments', href: '/treatments' },
                                { name: 'Schedules', href: '/dashboard/schedules' },
                                { name: 'Contact Us', href: '/contact' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 scale-0 group-hover:scale-100 transition-transform" />
                                        <span className="font-bold text-sm tracking-wide">{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-8">Get In Touch</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="bg-slate-900 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                <span className="text-gray-400 text-sm font-bold leading-relaxed">
                                    Dental Clinic Road, Near Market,<br />
                                    Katihar, Bihar - 854105
                                </span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="bg-slate-900 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <FaPhoneAlt size={14} />
                                </div>
                                <a href="tel:+919876543210" className="text-gray-400 hover:text-white text-sm font-black transition-colors">+91 98765 43210</a>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="bg-slate-900 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <FaEnvelope size={14} />
                                </div>
                                <a href="mailto:care@drToothdental.in" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">care@drToothdental.in</a>
                            </li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-8">Follow Our Journey</h4>
                        <div className="flex gap-4">
                            {[
                                { icon: <FaFacebookF />, href: '#', color: 'hover:bg-[#1877F2]' },
                                { icon: <FaTwitter />, href: '#', color: 'hover:bg-[#1DA1F2]' },
                                { icon: <FaLinkedinIn />, href: '#', color: 'hover:bg-[#0A66C2]' },
                                { icon: <FaInstagram />, href: '#', color: 'hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className={`w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Dr. Tooth Dental Clinic. Engineered for Excellence.
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-600 hover:text-gray-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
