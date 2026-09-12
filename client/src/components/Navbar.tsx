'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaLock, FaLockOpen, FaSignOutAlt, FaUserCircle, FaLanguage, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AdminLockModal from './AdminLockModal';
import { useClinic } from '../context/ClinicContext';
import { translations } from '../constants/translations';
import Image from 'next/image';

export default function Navbar() {
    const { clinicData, language, toggleLanguage } = useClinic();
    const t = translations[language];
    const { user, logout, isLoading } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pendingHref, setPendingHref] = useState('');
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
    const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);

    const navLinks = [
        { name: t.home, href: '/' },
        { name: t.about, href: '/about' },
        { name: t.treatments, href: '/treatments' },
        { name: t.blogs, href: '/blogs' },
        { name: t.timings, href: '/timings' },
        { name: t.contact, href: '/contact' },
        { name: t.dashboard, href: '/dashboard', protected: true },
    ];

    useEffect(() => {
        const checkUpcomingAppointments = async () => {
            if (!user || !user.patientId) {
                setUpcomingAppointment(null);
                return;
            }
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                const patientId = typeof user.patientId === 'object' ? user.patientId._id : user.patientId;
                const res = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`);
                const appointments = res.data;
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const sorted = appointments
                    .filter((apt: any) => {
                        const aptDate = new Date(apt.date);
                        return aptDate >= now &&
                            apt.status !== 'Completed' &&
                            !apt.isTicked;
                    })
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setUpcomingAppointment(sorted[0] || null);
            } catch (error) {
                console.error('Error checking appointments:', error);
            }
        };

        checkUpcomingAppointments();
        const interval = setInterval(checkUpcomingAppointments, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkSession = () => {
            const lockedBase = localStorage.getItem('clinic_admin_locked');
            const expiry = localStorage.getItem('clinic_admin_expiry');
            const now = Date.now();

            if (lockedBase === 'false' && expiry && now < Number(expiry)) {
                setIsUnlocked(true);
                const remaining = Math.max(0, Math.floor((Number(expiry) - now) / 1000));
                const hours = Math.floor(remaining / 3600);
                const mins = Math.floor((remaining % 3600) / 60);
                const secs = remaining % 60;

                const format = (num: number) => num.toString().padStart(2, '0');
                setTimeLeft(`${format(hours)}:${format(mins)}:${format(secs)}`);
            } else {
                if (isUnlocked) {
                    localStorage.removeItem('clinic_admin_locked');
                    localStorage.removeItem('clinic_admin_expiry');
                    setIsUnlocked(false);
                }
                setTimeLeft(null);
            }
        };

        checkSession();
        const interval = setInterval(checkSession, 1000);
        return () => clearInterval(interval);
    }, [isUnlocked]);

    const handleProtectedClick = (e: React.MouseEvent, href: string) => {
        if (!isUnlocked) {
            e.preventDefault();
            setPendingHref(href);
            setIsLockModalOpen(true);
        }
    };

    const handleLock = () => {
        localStorage.removeItem('clinic_admin_locked');
        localStorage.removeItem('clinic_admin_expiry');
        setIsUnlocked(false);
        setIsOpen(false);
        router.push('/');
    };

    const handleUnlockSuccess = () => {
        setIsUnlocked(true);
        setIsOpen(false);
        if (pendingHref) {
            router.push(pendingHref);
            setPendingHref('');
        }
    };

    return (
        <>
            <nav className="bg-gray-950 backdrop-blur-xl sticky top-0 z-50 shadow-sm font-sans py-2">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between  items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="rounded-2xl transition-transform duration-300">
                                <Image src="/images/brand-logo.png" alt="Logo" width={600} height={600} className="w-12 h-12 object-cover object-center rounded-xl border-white p-0.5" />
                            </div>
                            <span className="text-4xl font-serif font-black text-gray-300 tracking-tight">
                                {(() => {
                                    const name = clinicData?.clinicName || 'Tooth';
                                    const parts = name.split(' ');
                                    return (
                                        <>
                                            {parts[0]} <span className="text-gray-500 font-medium">{parts.slice(1).join(' ')}</span>
                                        </>
                                    );
                                })()}
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden xl:flex items-center space-x-2">
                            {navLinks.map((link) => (
                                <div key={link.name} className="relative group">
                                    <Link
                                        href={link.href}
                                        onClick={(e) => link.protected && handleProtectedClick(e, link.href)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${pathname === link.href || (link.name === t.dashboard && pathname.startsWith('/temppath'))
                                            ? 'bg-gray-100 text-gray-900 shadow-inner'
                                            : 'text-gray-300 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="whitespace-nowrap">{link.name}</span>
                                        {link.protected && (
                                            isUnlocked ? <FaLockOpen size={10} className="text-green-500" /> : <FaLock size={10} className="text-gray-300" />
                                        )}
                                    </Link>
                                    {link.protected && isUnlocked && (
                                        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                                            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-2 w-48">
                                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t.sessionActive}</span>
                                                    <div className="text-gray-900 font-mono font-medium text-xs">{timeLeft} remaining</div>
                                                </div>
                                                <button
                                                    onClick={handleLock}
                                                    className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 text-gray-400 rounded-xl transition font-semibold text-sm"
                                                >
                                                    <FaLock size={12} />
                                                    <span>{t.lockDashboard}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Auth Section */}
                            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                                {!isLoading && (
                                    user ? (
                                        <div className="flex items-center gap-3">
                                            <div className="hidden xl:flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account</span>
                                                <span className="text-xs font-semibold text-gray-900">{user.name?.split(' ')[0]}</span>
                                            </div>
                                            <div className="relative group/user">
                                                <div className="relative cursor-pointer">
                                                    <FaUserCircle className="text-3xl text-gray-300 hover:text-gray-400 transition-colors" />
                                                    {upcomingAppointment && (
                                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-900 border-2 border-white rounded-full flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200 z-50">
                                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-2 w-48">
                                                        <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t.account}</span>
                                                            <div className="text-gray-900 font-medium text-xs truncate">{user.email}</div>
                                                        </div>
                                                        <Link
                                                            href="/profile"
                                                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 text-gray-900 rounded-xl transition font-semibold text-sm mb-1 group"
                                                        >
                                                            <FaUserCircle size={14} className="text-gray-400" />
                                                            <div className="flex flex-col items-start">
                                                                <span>{t.profile}</span>
                                                                {upcomingAppointment && <span className="text-[9px] font-bold uppercase text-gray-500">Appointment Scheduled</span>}
                                                            </div>
                                                        </Link>
                                                        <button
                                                            onClick={logout}
                                                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 text-red-600 rounded-xl transition font-semibold text-sm"
                                                        >
                                                            <FaSignOutAlt size={12} />
                                                            <span>{t.logout}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:bg-gray-800 transition-all active:scale-[0.98]"
                                        >
                                            {t.login}
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Mobile Button Area */}
                        <div className="flex items-center gap-4 xl:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
                            >
                                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu logic unchanged structurally, just updating UI classes... */}
                {isOpen && (
                    <div className="xl:hidden max-h-[calc(100vh-80px)] overflow-y-auto bg-white border-t border-gray-100 p-4 pt-6 pb-32 space-y-4 animate-in slide-in-from-top duration-300">
                        {user ? (
                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
                                        className="flex-grow flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 text-gray-900 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaUserCircle className="text-3xl text-gray-400" />
                                            <div className="flex flex-col items-start translate-y-[1px] text-left">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">{t.account}</span>
                                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px] leading-tight">{user.name}</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                {isMobileUserMenuOpen && (
                                    <div className="px-2 pt-1 pb-2 space-y-1">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                                        >
                                            <FaUserCircle size={16} /> <span>{t.profile}</span>
                                        </Link>
                                        <button
                                            onClick={() => { setIsOpen(false); logout(); }}
                                            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
                                        >
                                            <FaSignOutAlt size={16} /> <span>{t.logout}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-gray-100 mt-2 px-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl text-base font-semibold shadow-md active:scale-[0.98] transition"
                                >
                                    {t.login}
                                </Link>
                            </div>
                        )}

                        {navLinks.map((link) => (
                            <div key={link.name} className="space-y-1 text-left">
                                <Link
                                    href={link.href}
                                    onClick={(e) => {
                                        if (link.protected && !isUnlocked) {
                                            handleProtectedClick(e, link.href);
                                        } else {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`flex justify-between items-center px-4 py-3 rounded-2xl text-base font-medium transition ${pathname === link.href || (link.name === t.dashboard && pathname.startsWith('/temppath'))
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span>{link.name}</span>
                                    {link.protected && (
                                        isUnlocked ? <FaLockOpen size={14} className="text-green-500" /> : <FaLock size={14} className="text-gray-300" />
                                    )}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </nav>

            <AdminLockModal
                isOpen={isLockModalOpen}
                onClose={() => setIsLockModalOpen(false)}
                onSuccess={handleUnlockSuccess}
            />
        </>
    );
}
