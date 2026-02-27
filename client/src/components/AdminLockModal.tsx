'use client';
import { useState } from 'react';
import axios from 'axios';
import { FaLock, FaKey, FaTimes } from 'react-icons/fa';

interface AdminLockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminLockModal({ isOpen, onClose, onSuccess }: AdminLockModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/verify-password`, {
                password
            });

            if (response.data.success) {
                const expiry = Date.now() + 9 * 60 * 60 * 1000; // 9 hr
                localStorage.setItem('clinic_admin_locked', 'false');
                localStorage.setItem('clinic_admin_expiry', expiry.toString());
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Incorrect password. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border-4 border-blue-50">
                {/* Prominent Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                    title="Close"
                >
                    <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="p-8 text-center space-y-6">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <FaLock className="text-3xl text-blue-600" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Clinic Admin Access</h2>
                        <p className="text-gray-500 text-sm font-medium">Please enter the administrator password to continue to the dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <FaKey className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                id="password"
                                placeholder="Enter admin password"
                                className={`w-full pl-14 pr-4 py-5 rounded-2xl border-2 outline-none transition font-black text-center text-lg tracking-widest ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-50 bg-gray-50 focus:border-blue-500 focus:bg-white'
                                    }`}
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs font-black uppercase tracking-wider">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl transition transform active:scale-95 shadow-blue-600/20"
                        >
                            Unlock Dashboard
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest pt-2 transition-colors"
                        >
                            Cancel & Go Back
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
