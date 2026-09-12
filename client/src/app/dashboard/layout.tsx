'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUsers, FaEnvelope, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaHome, FaBars, FaTimes, FaCog, FaNewspaper } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [newBookingsCount, setNewBookingsCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    type ContactLite = { status?: string };
    type AppointmentLite = { isAutoBooked?: boolean; isViewed?: boolean };

    const handleLogout = () => {
        localStorage.removeItem('clinic_admin_locked');
        localStorage.removeItem('clinic_admin_expiry');
        window.location.href = '/';
    };

    const fetchCounts = useCallback(async () => {
        try {
            const msgResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`);
            const unread = (msgResponse.data as ContactLite[]).filter((m) => m.status === 'Unread').length;
            setUnreadCount(unread);
            const aptResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`);
            const unviewed = (aptResponse.data as AppointmentLite[]).filter((a) => a.isAutoBooked && !a.isViewed).length;
            setNewBookingsCount(unviewed);
        } catch (error) { console.error('Error fetching dashboard counts:', error); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { void fetchCounts(); }, 0);
        const interval = setInterval(fetchCounts, 30000);
        return () => { clearTimeout(t); clearInterval(interval); };
    }, [fetchCounts]);

    type MenuItem = { name: string; path: string; icon: React.ComponentType<{ className?: string }>; badge?: number; pulse?: boolean; };
    const menuItems: MenuItem[] = [
        { name: 'Home', path: '/', icon: FaHome },
        { name: 'Overview', path: '/dashboard', icon: FaChartLine },
        { name: 'Patients', path: '/dashboard/patients', icon: FaUsers },
        { name: 'Messages', path: '/dashboard/messages', icon: FaEnvelope, badge: unreadCount },
        { name: 'Schedules', path: '/dashboard/schedules', icon: FaCalendarAlt, badge: newBookingsCount, pulse: true },
        { name: 'Blogs', path: '/dashboard/blogs', icon: FaNewspaper },
        { name: 'Settings', path: '/dashboard/settings', icon: FaCog },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col lg:flex-row">
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/5">
                    <div className="h-[64px] px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-9 h-9 rounded-full bg-[#f5f5f3] border border-black/5 text-neutral-700 grid place-items-center hover:bg-black hover:text-white hover:border-black transition-colors"
                                aria-label="Toggle navigation"
                            >
                                {isSidebarOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
                            </button>
                            <div className="leading-tight">
                                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Clinic Admin</div>
                                <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Dashboard</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && <Link href="/dashboard/messages" className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-medium">Msg {unreadCount}</Link>}
                            {newBookingsCount > 0 && <Link href="/dashboard/schedules" className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium">New {newBookingsCount}</Link>}
                        </div>
                    </div>
                </div>

                {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-black/5 flex flex-col z-50 lg:sticky lg:top-0 lg:h-screen transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-[64px] px-6 flex items-center gap-3 border-b border-black/5 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-[#0a0a0b] text-white grid place-items-center text-[11px] font-bold">●</div>
                        <div>
                            <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b] leading-none">Clinic Admin</div>
                            <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Operations Panel</div>
                        </div>
                    </div>

                    <nav className="flex-1 py-6 overflow-y-auto">
                        <div className="px-3 space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-full text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${isActive ? 'bg-[#0a0a0b] text-white shadow-sm' : 'text-neutral-600 hover:bg-[#f5f5f3] hover:text-[#0a0a0b]'}`}
                                    >
                                        <span className="flex items-center gap-3"><Icon className={`text-[14px] ${isActive ? 'text-white' : 'text-neutral-400'}`} />{item.name}</span>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className={`min-w-[20px] h-5 px-1.5 rounded-full grid place-items-center text-[11px] font-bold leading-none border ${item.pulse ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{item.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-black/5">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full bg-[#f5f5f3] border border-black/5 text-neutral-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-[13px] font-medium transition-colors">
                            <FaSignOutAlt size={12} /> Logout
                        </button>
                        <p className="text-[11px] text-neutral-400 text-center mt-3">© {new Date().getFullYear()} ToothOp</p>
                    </div>
                </aside>

                <main className="flex-1 min-w-0 bg-[#fcfcfc]">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
