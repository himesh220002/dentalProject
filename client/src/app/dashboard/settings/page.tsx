'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaLock, FaShieldAlt, FaSave, FaHistory, FaDatabase } from 'react-icons/fa';
import Link from 'next/link';

export default function SettingsPage() {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        setStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (passwords.new.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');

            // First verify current password
            const verifyRes = await axios.post(`${API_BASE_URL}/config/verify-password`, {
                password: passwords.current
            });

            if (verifyRes.data.success) {
                // Then update to new password
                await axios.put(`${API_BASE_URL}/config/update-password`, {
                    newPassword: passwords.new
                });
                setStatus({ type: 'success', message: 'Admin password updated successfully!' });
                setPasswords({ current: '', new: '', confirm: '' });
            }
        } catch (error: any) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Current password incorrect or server error.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinic Settings</h1>
                <p className="text-gray-500 font-medium">Manage your administrative security and clinic configurations.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg flex items-center gap-4">
                        <FaShieldAlt className="text-3xl" />
                        <div>
                            <h3 className="font-black text-lg">Security</h3>
                            <p className="text-blue-100 text-xs uppercase tracking-widest font-bold">Admin Portal</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <p className="text-xs text-gray-400 font-bold leading-relaxed lowercase italic">
                            Changing your admin password will affect all devices currently logged into the dashboard. Make sure to keep it secure.
                        </p>
                        <div className="pt-4 border-t border-gray-50">
                            <Link
                                href="/temppath"
                                className="flex items-center justify-center gap-2 w-full p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn"
                            >
                                <FaDatabase className="group-hover/btn:rotate-12 transition-transform" />
                                Clinic Data Manager
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                <FaLock />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">Change Admin Password</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Current Password</label>
                                <input
                                    type="password"
                                    name="current"
                                    value={passwords.current}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">New Password</label>
                                    <input
                                        type="password"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Confirm New</label>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-2xl text-center font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaSave className="group-hover:scale-110 transition" />
                                        UPDATE SECURITY KEY
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
