'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUsers, FaEnvelope, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaHome, FaBars, FaTimes, FaCog, FaNewspaper } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
            // Fetch unread messages
            const msgResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`);
            const unread = (msgResponse.data as ContactLite[]).filter((m) => m.status === 'Unread').length;
            setUnreadCount(unread);

            // Fetch unviewed auto-bookings
            const aptResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`);
            const unviewed = (aptResponse.data as AppointmentLite[]).filter((a) => a.isAutoBooked && !a.isViewed).length;
            setNewBookingsCount(unviewed);
        } catch (error) {
            console.error('Error fetching dashboard counts:', error);
        }
    }, []);

    useEffect(() => {
        // Defer to avoid setState-in-effect lint rule
        const t = setTimeout(() => { void fetchCounts(); }, 0);
        // Refresh every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => {
            clearTimeout(t);
            clearInterval(interval);
        };
    }, [fetchCounts]);

    type MenuItem = {
        name: string;
        path: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
        pulse?: boolean;
    };

    const menuItems: MenuItem[] = [
        { name: 'Overview', path: '/dashboard', icon: FaChartLine },
        { name: 'Patients', path: '/dashboard/patients', icon: FaUsers },
        { name: 'Messages', path: '/dashboard/messages', icon: FaEnvelope, badge: unreadCount },
        { name: 'Schedules', path: '/dashboard/schedules', icon: FaCalendarAlt, badge: newBookingsCount, pulse: true },
        { name: 'Blogs', path: '/dashboard/blogs', icon: FaNewspaper },
        { name: 'Settings', path: '/dashboard/settings', icon: FaCog },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-blue-100/50 to-purple-100/50 flex flex-col lg:flex-row">
                {/* Mobile Top Bar */}
                <div className="lg:hidden sticky top-0 z-[60] bg-slate-950/90 backdrop-blur border-b border-white/10">
                    <div className="h-14 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-slate-200 flex items-center justify-center"
                                aria-label="Toggle navigation"
                            >
                                {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
                            </button>
                            <div className="leading-tight">
                                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Clinic Admin</div>
                                <div className="text-sm font-black text-white">Dashboard</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Link href="/dashboard/messages" className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[10px] font-black uppercase tracking-widest">
                                    Msg {unreadCount}
                                </Link>
                            )}
                            {newBookingsCount > 0 && (
                                <Link href="/dashboard/schedules" className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
                                    New {newBookingsCount}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[40] lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 w-72 max-h-screen bg-slate-950 text-white flex flex-col shadow-2xl z-[70] lg:sticky lg:top-0 lg:h-screen transition-transform duration-300 transform lg:translate-x-0 border-r border-white/10
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6  shrink-0">
                        <h2 className="text-xl font-black text-white tracking-tight">Clinic Admin</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Operations Panel</p>
                    </div>

                    <nav className="flex-grow mt-6 lg:mt-0 overflow-y-auto">
                        <ul className="space-y-2 px-4">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition ${isActive
                                                ? 'bg-white/10 text-white border border-white/10'
                                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="text-lg" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className={`${item.pulse ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-400' : 'bg-blue-600'} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-6 border-t border-white/10 space-y-4 shrink-0">
                        <Link href="/" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                            <FaHome /> <span>Back to Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-rose-300 hover:text-rose-200 transition w-full"
                        >
                            <FaSignOutAlt /> <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow p-3 sm:p-4 lg:p-8 overflow-y-auto w-full">
                    <div className="max-w-8xl xl:max-w-none mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
