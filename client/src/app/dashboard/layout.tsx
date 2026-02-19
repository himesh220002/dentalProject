'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaUsers, FaEnvelope, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaHome, FaBars, FaTimes, FaCog } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('clinic_admin_locked');
        localStorage.removeItem('clinic_admin_expiry');
        window.location.href = '/';
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`);
            const unread = response.data.filter((m: any) => m.status === 'Unread').length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { name: 'Overview', path: '/dashboard', icon: FaChartLine },
        { name: 'Patients', path: '/dashboard/patients', icon: FaUsers },
        { name: 'Messages', path: '/dashboard/messages', icon: FaEnvelope, badge: unreadCount },
        { name: 'Schedules', path: '/dashboard/schedules', icon: FaCalendarAlt },
        { name: 'Settings', path: '/dashboard/settings', icon: FaCog },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row rounded-xl">
                {/* Mobile Top Bar */}
                <div className="md:hidden bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-0">
                    <h2 className="text-xl font-bold text-blue-400">Clinic Admin</h2>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white p-2 hover:bg-gray-800 rounded-xl transition"
                    >
                        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 w-64 max-h-screen md:max-h-[90vh] bg-gray-900 text-white flex flex-col shadow-xl z-[10] md:sticky md:top-0 md:h-screen transition-transform duration-300 transform rounded-r-3xl md:rounded-xl
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-6 hidden md:block">
                        <h2 className="text-2xl font-bold text-blue-400">Clinic Admin</h2>
                    </div>

                    <nav className="flex-grow mt-6 md:mt-0">
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
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="text-lg" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-6 border-t border-gray-800 space-y-4">
                        <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                            <FaHome /> <span>Back to Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-rose-400 hover:text-rose-300 transition w-full"
                        >
                            <FaSignOutAlt /> <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full">
                    <div className="max-w-8xl xl:max-w-none mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
