'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaLock, FaLockOpen, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
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
    const [isScrolled, setIsScrolled] = useState(false);

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
            if (!user || !user.patientId) { setUpcomingAppointment(null); return; }
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                const patientId = typeof user.patientId === 'object' ? user.patientId._id : user.patientId;
                const res = await axios.get(`${backendUrl}/api/appointments/patient/${patientId}`);
                const now = new Date(); now.setHours(0, 0, 0, 0);
                const sorted = res.data
                    .filter((apt: any) => new Date(apt.date) >= now && apt.status !== 'Completed' && !apt.isTicked)
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUpcomingAppointment(sorted[0] || null);
            } catch { /* silent */ }
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
                const h = Math.floor(remaining / 3600); const m = Math.floor((remaining % 3600) / 60); const s = remaining % 60;
                const f = (n: number) => n.toString().padStart(2, '0');
                setTimeLeft(`${f(h)}:${f(m)}:${f(s)}`);
            } else {
                if (isUnlocked) { localStorage.removeItem('clinic_admin_locked'); localStorage.removeItem('clinic_admin_expiry'); setIsUnlocked(false); }
                setTimeLeft(null);
            }
        };
        checkSession(); const i = setInterval(checkSession, 1000);
        return () => clearInterval(i);
    }, [isUnlocked]);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 8);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // lock body scroll when mobile menu open (full-page overlay)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    // close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // close on Escape key
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    const handleProtectedClick = (e: React.MouseEvent, href: string) => {
        if (!isUnlocked) {
            e.preventDefault();
            setPendingHref(href);
            setIsLockModalOpen(true);
            setIsOpen(false);
        }
    };
    const handleLock = () => {
        localStorage.removeItem('clinic_admin_locked'); localStorage.removeItem('clinic_admin_expiry');
        setIsUnlocked(false); setIsOpen(false); router.push('/');
    };
    const handleUnlockSuccess = () => {
        setIsUnlocked(true); setIsOpen(false);
        if (pendingHref) { router.push(pendingHref); setPendingHref(''); }
    };

    return (
        <>
            <nav
                className={`sticky top-0 z-50 font-sans border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isScrolled
                        ? 'bg-white/80 backdrop-blur-xl border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]'
                        : 'bg-white/75 backdrop-blur-xl border-black/[0.04] shadow-none'}`}
            >
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[64px] items-center justify-between gap-6">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0">
                                <Image src="/images/logo.png" alt="Logo" width={200} height={200} className="w-full h-full object-cover rounded-[10px]" />
                            </div>
                            <span className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.02em] leading-none text-[#0a0a0b]">
                                {(() => {
                                    const name = clinicData?.clinicName || 'ToothOp';
                                    const parts = name.split(' ');
                                    return <>{parts[0]} <span className="font-normal text-neutral-500">{parts.slice(1).join(' ')}</span></>;
                                })()}
                            </span>
                        </Link>

                        <div className="hidden xl:flex items-center gap-1.5">
                            {navLinks.map((link) => {
                                const active = pathname === link.href || (link.name === t.dashboard && pathname.startsWith('/temppath'));
                                return (
                                    <div key={link.name} className="relative group">
                                        <Link
                                            href={link.href}
                                            onClick={(e) => link.protected && handleProtectedClick(e, link.href)}
                                            className={`px-3.5 py-2 rounded-full text-[13px] font-[500] tracking-[-0.01em] inline-flex items-center gap-1.5 transition-all duration-200 ease-out
                                                ${active
                                                    ? 'bg-[#0a0a0b] text-white'
                                                    : 'text-neutral-600 hover:text-[#0a0a0b] hover:bg-black/[0.06]'}`}
                                        >
                                            <span className="whitespace-nowrap">{link.name}</span>
                                            {link.protected && (
                                                isUnlocked ? <FaLockOpen size={10} className={active ? 'text-white/70' : 'text-emerald-500'} /> : <FaLock size={10} className={active ? 'text-white/60' : 'text-neutral-400'} />
                                            )}
                                        </Link>
                                        {link.protected && isUnlocked && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                                                <div className="bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] p-2 w-52 overflow-hidden">
                                                    <div className="px-3 py-2.5">
                                                        <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">{t.sessionActive}</div>
                                                        <div className="text-[13px] font-mono font-medium text-[#0a0a0b] mt-1">{timeLeft} remaining</div>
                                                    </div>
                                                    <button onClick={handleLock} className="w-full mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f5f5f3] hover:bg-black hover:text-white text-neutral-600 transition text-[13px] font-medium">
                                                        <FaLock size={11} /> {t.lockDashboard}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="ml-2 pl-3 flex items-center border-l border-black/10">
                                {!isLoading && (
                                    user ? (
                                        <div className="flex items-center gap-2.5">
                                            <div className="hidden xl:flex flex-col items-end leading-none">
                                                <span className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Account</span>
                                                <span className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b]">{user.name?.split(' ')[0]}</span>
                                            </div>
                                            <div className="relative group/user">
                                                <button className="relative w-9 h-9 rounded-full bg-black/[0.04] border border-black/10 grid place-items-center overflow-visible hover:bg-black/[0.08] transition">
                                                    <FaUserCircle className="text-[#0a0a0b] text-[22px]" />
                                                    {upcomingAppointment && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                                                </button>
                                                <div className="absolute top-full right-0 pt-3 opacity-0 translate-y-1 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200 ease-out z-50">
                                                    <div className="bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] p-2 w-56 overflow-hidden">
                                                        <div className="px-3 py-2">
                                                            <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">{t.account}</div>
                                                            <div className="text-[13px] font-medium text-[#0a0a0b] truncate">{user.email}</div>
                                                        </div>
                                                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f5f5f3] text-[#0a0a0b] transition text-[13px] font-medium">
                                                            <span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center"><FaUserCircle size={12} className="text-neutral-600" /></span>
                                                            <span className="flex flex-col items-start leading-none">
                                                                <span>{t.profile}</span>
                                                                {upcomingAppointment && <span className="text-[10px] font-medium text-emerald-600">Appointment scheduled</span>}
                                                            </span>
                                                        </Link>
                                                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-neutral-600 hover:text-rose-600 transition text-[13px] font-medium mt-1">
                                                            <FaSignOutAlt size={12} /> {t.logout}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link href="/login" className="px-5 py-2.5 rounded-full text-[13px] font-medium tracking-[-0.01em] shadow-sm transition-all duration-200 active:scale-[0.98] bg-[#0a0a0b] text-white hover:bg-black">
                                            {t.login}
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 xl:hidden">
                            {!isOpen && (
                                <Link href="/contact" className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium tracking-[-0.01em] transition bg-[#0a0a0b] text-white hover:bg-black">Book Appointment</Link>
                            )}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle menu"
                                className="w-9 h-9 rounded-full grid place-items-center transition-all duration-200 active:scale-95 bg-black/[0.06] text-[#0a0a0b] hover:bg-black/10 border border-black/10"
                            >
                                <span className="relative w-4 h-4 grid place-items-center">
                                    <FaBars size={16} className={`absolute transition-all duration-200 ${isOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
                                    <FaTimes size={16} className={`absolute transition-all duration-200 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

            </nav>

            {/* Mobile sheet — full page, fixed complete screen overlay with top bar and close option */}
            <div
                className={`xl:hidden fixed inset-0 z-[110] bg-white flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
                    }`}
                aria-hidden={!isOpen}
            >
                {/* Mobile sheet top bar with Logo and dedicated Close button */}
                <div className="h-[64px] shrink-0 border-b border-black/5 px-4 sm:px-6 flex items-center justify-between">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group shrink-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0">
                            <Image src="/images/logo.png" alt="Logo" width={200} height={200} className="w-full h-full object-cover rounded-[10px]" />
                        </div>
                        <div className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.02em] leading-none text-[#0a0a0b]">
                            {(() => {
                                const name = clinicData?.clinicName || 'ToothOp';
                                const parts = name.split(' ');
                                return <>{parts[0]} <span className="font-normal text-neutral-500">{parts.slice(1).join(' ')}</span></>;
                            })()}
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                        className="w-9 h-9 rounded-full grid place-items-center transition-all duration-200 active:scale-95 bg-black/[0.06] text-[#0a0a0b] hover:bg-black/10 border border-black/10"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Mobile sheet scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-1">
                    {user ? (
                        <div className="pb-4 mb-3 border-b border-black/5">
                            <button onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)} className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-[#fcfcfc] border border-transparent hover:border-black/5 transition text-left">
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="w-9 h-9 rounded-full bg-[#0a0a0b] text-white grid place-items-center shrink-0"><FaUserCircle size={16} /></span>
                                    <span className="min-w-0">
                                        <span className="block text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 leading-none">{t.account}</span>
                                        <span className="block text-[14px] font-medium tracking-[-0.01em] text-[#0a0a0b] truncate">{user.name}</span>
                                    </span>
                                </span>
                                <span className={`w-7 h-7 rounded-full bg-[#f5f5f3] grid place-items-center transition-transform ${isMobileUserMenuOpen ? 'rotate-180' : ''}`}>⌄</span>
                            </button>
                            <div className={`grid transition-all duration-300 ${isMobileUserMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="space-y-1 pt-1">
                                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[#0a0a0b] hover:bg-[#f5f5f3] transition"><FaUserCircle size={14} /> {t.profile}</Link>
                                        <button onClick={() => { setIsOpen(false); logout(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-rose-600 hover:bg-rose-50 transition"><FaSignOutAlt size={14} /> {t.logout}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-[#0a0a0b] text-white w-full py-3.5 rounded-full text-[14px] font-medium hover:bg-black transition active:scale-[0.99] mb-3"> {t.login} →</Link>
                    )}
                    <button onClick={() => { toggleLanguage(); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-medium tracking-[-0.01em] bg-[#f5f5f3] text-neutral-700 hover:bg-[#0a0a0b] hover:text-white transition">
                        <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
                        <span className="text-[11px] tracking-[0.12em] uppercase opacity-60">{language === 'en' ? 'HI' : 'EN'}</span>
                    </button>
                    {navLinks.map((link) => {
                        const active = pathname === link.href || (link.name === t.dashboard && pathname.startsWith('/temppath'));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={(e) => { if (link.protected && !isUnlocked) handleProtectedClick(e, link.href); else setIsOpen(false); }}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-medium tracking-[-0.01em] transition
                                    ${active ? 'bg-[#0a0a0b] text-white' : 'text-neutral-700 hover:bg-[#f5f5f3] hover:text-[#0a0a0b]'}`}
                            >
                                <span>{link.name}</span>
                                {link.protected && (isUnlocked ? <FaLockOpen size={12} className={active ? 'text-white/60' : 'text-emerald-500'} /> : <FaLock size={12} className={active ? 'text-white/40' : 'text-neutral-300'} />)}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <AdminLockModal isOpen={isLockModalOpen} onClose={() => setIsLockModalOpen(false)} onSuccess={handleUnlockSuccess} />
        </>
    );
}
