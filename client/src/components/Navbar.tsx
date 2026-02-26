'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaTooth, FaBars, FaTimes, FaLock, FaLockOpen, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import AdminLockModal from './AdminLockModal';
import { useClinic } from '../context/ClinicContext';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Treatments', href: '/treatments' },
    { name: 'Timings', href: '/timings' },
    { name: 'Contact', href: '/contact' },
    { name: 'Dashboard', href: '/dashboard', protected: true },
];

export default function Navbar() {
    const { clinicData } = useClinic();
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pendingHref, setPendingHref] = useState('');
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
    // @ts-ignore
    const [hasUpcomingAppointment, setHasUpcomingAppointment] = useState(session?.user?.hasUpcomingAppointment || false);

    useEffect(() => {
        const checkUpcomingAppointments = async () => {
            // @ts-ignore
            if (status !== 'authenticated' || !session?.user?.patientId) return;
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                // @ts-ignore
                const res = await axios.get(`${backendUrl}/api/appointments/patient/${session.user.patientId}`);
                const appointments = res.data;
                const now = new Date();
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const upcoming = appointments.some((apt: any) => {
                    const aptDate = new Date(apt.date);
                    // Include today and future appointments that are not completed/ticked
                    return aptDate >= startOfToday && apt.status !== 'Completed' && !apt.isTicked;
                });
                setHasUpcomingAppointment(upcoming);
            } catch (error) {
                console.error('Error checking appointments:', error);
            }
        };

        if (status === 'authenticated') {
            checkUpcomingAppointments();
        } else {
            setHasUpcomingAppointment(false);
        }
    }, [session, status]);

    const pathname = usePathname();
    const router = useRouter();
    // ... checkSession effect remains the same ...
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
        router.push('/');
    };

    const handleUnlockSuccess = () => {
        setIsUnlocked(true);
        if (pendingHref) {
            router.push(pendingHref);
            setPendingHref('');
        }
    };

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 lg:z-51 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                <FaTooth className="text-white text-2xl" />
                            </div>
                            <span className="text-2xl font-black text-blue-900 tracking-tight">
                                {(() => {
                                    const name = clinicData?.clinicName || 'Dr. Tooth Dental';
                                    const parts = name.split(' ');
                                    return (
                                        <>
                                            {parts[0]} <span className="text-blue-600 font-medium">{parts.slice(1).join(' ')}</span>
                                        </>
                                    );
                                })()}
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <div key={link.name} className="relative group">
                                    <Link
                                        href={link.href}
                                        onClick={(e) => link.protected && handleProtectedClick(e, link.href)}
                                        className={`px-3 xl:px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${pathname === link.href || (link.name === 'Dashboard' && pathname.startsWith('/dashboard'))
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                    >
                                        <span className="whitespace-nowrap">{link.name}</span>
                                        {link.protected && (
                                            isUnlocked ? <FaLockOpen size={10} className="text-green-500" /> : <FaLock size={10} className="text-gray-400" />
                                        )}
                                    </Link>
                                    {/* ... dropdown remains ... */}
                                    {link.protected && isUnlocked && (
                                        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                                            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 w-48">
                                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                    <span className="text-[10px] uppercase tracking-wider font-black text-gray-400">Session Active</span>
                                                    <div className="text-blue-600 font-mono font-bold text-xs">{timeLeft} remaining</div>
                                                </div>
                                                <button
                                                    onClick={handleLock}
                                                    className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl transition font-bold text-sm"
                                                >
                                                    <FaLock size={12} />
                                                    <span>Lock Dashboard</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Auth Section */}
                            <div className="ml-2 xl:ml-4 pl-2 xl:pl-4 border-l border-gray-100 flex items-center gap-2 xl:gap-3">
                                {session ? (
                                    <div className="flex items-center gap-2 xl:gap-3">
                                        <div className="hidden xl:flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Logged in as</span>
                                            <span className="text-xs font-bold text-gray-900">{session.user?.name?.split(' ')[0]}</span>
                                        </div>
                                        <div className="relative group/user">
                                            {session.user?.image ? (
                                                <div className="relative">
                                                    <img src={session.user.image} alt="" className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg xl:rounded-xl border-2 border-white shadow-md ring-2 ring-gray-50" />
                                                    {hasUpcomingAppointment && (
                                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 xl:w-4 xl:h-4 bg-blue-600 border-2 border-white rounded-full animate-bounce shadow-sm flex items-center justify-center">
                                                            <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 bg-white rounded-full" />
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <FaUserCircle className="text-2xl xl:text-3xl text-gray-300" />
                                                    {hasUpcomingAppointment && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full animate-pulse" />}
                                                </div>
                                            )}
                                            {/* ... user dropdown ... */}
                                            <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200 z-50">
                                                <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 w-48">
                                                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                        <span className="text-[10px] uppercase tracking-wider font-black text-gray-400">Account</span>
                                                        <div className="text-gray-900 font-bold text-xs truncate">{session.user?.email}</div>
                                                    </div>
                                                    <Link
                                                        href="/profile"
                                                        className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 text-blue-600 rounded-xl transition font-bold text-sm mb-1 group"
                                                    >
                                                        <FaUserCircle size={14} />
                                                        <div className="flex flex-col items-start">
                                                            <span>My Profile</span>
                                                            {hasUpcomingAppointment && <span className="text-[8px] font-black uppercase text-blue-500 animate-pulse">Appointment Scheduled</span>}
                                                        </div>
                                                    </Link>
                                                    <button
                                                        onClick={() => signOut({ callbackUrl: '/' })}
                                                        className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl transition font-bold text-sm"
                                                    >
                                                        <FaSignOutAlt size={12} />
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="bg-gray-900 text-white px-4 xl:px-6 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-xs xl:text-sm font-black shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition active:scale-95"
                                    >
                                        Log In
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
                            >
                                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 p-4 space-y-2 animate-in slide-in-from-top duration-300">
                        {navLinks.map((link) => (
                            <div key={link.name} className="space-y-1">
                                <Link
                                    href={link.href}
                                    onClick={(e) => {
                                        if (link.protected && !isUnlocked) {
                                            handleProtectedClick(e, link.href);
                                        } else {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`flex justify-between items-center px-4 py-3 rounded-xl text-base font-bold transition ${pathname === link.href || (link.name === 'Dashboard' && pathname.startsWith('/dashboard'))
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <span>{link.name}</span>
                                    {link.protected && (
                                        isUnlocked ? <FaLockOpen size={14} className="text-green-500" /> : <FaLock size={14} className="text-gray-400" />
                                    )}
                                </Link>
                                {link.protected && isUnlocked && (
                                    <div className="px-4 py-2 flex justify-between items-center bg-gray-50 rounded-xl mx-2">
                                        <div className="text-xs font-mono text-blue-600 font-bold">Locks in {timeLeft}</div>
                                        <button
                                            onClick={handleLock}
                                            className="text-rose-600 font-black text-xs uppercase"
                                        >
                                            Lock Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Mobile Auth Section */}
                        {session ? (
                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <button
                                    onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 transition"
                                >
                                    <div className="flex items-center gap-3 relative">
                                        {session.user?.image ? (
                                            <div className="relative">
                                                <img src={session.user.image} alt="" className="w-9 h-9 rounded-xl shadow-sm border-2 border-white" />
                                                {hasUpcomingAppointment && (
                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full animate-bounce shadow-sm flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-white rounded-full" />
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <FaUserCircle className="text-3xl text-gray-300" />
                                                {hasUpcomingAppointment && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full animate-pulse" />}
                                            </div>
                                        )}
                                        <div className="flex flex-col items-start translate-y-[1px]">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Account</span>
                                            <span className="text-sm font-bold text-gray-900 truncate max-w-[180px] leading-tight">{session.user?.name}</span>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isMobileUserMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>

                                {isMobileUserMenuOpen && (
                                    <div className="px-2 pt-1 pb-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-between px-12 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FaUserCircle size={16} />
                                                <span>My Profile Portal</span>
                                            </div>
                                            {hasUpcomingAppointment && <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full animate-pulse">APPT</span>}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="w-full flex items-center gap-3 px-12 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                        >
                                            <FaSignOutAlt size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-gray-100 mt-2 px-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-gray-900/10 active:scale-95 transition"
                                >
                                    Log In to Account
                                </Link>
                            </div>
                        )}
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
