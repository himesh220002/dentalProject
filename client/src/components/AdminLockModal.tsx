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
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-8 text-center space-y-6">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <FaLock className="text-3xl text-blue-600" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">Clinic Admin Access</h2>
                        <p className="text-gray-500 text-sm">Please enter the administrator password to continue to the dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                id="password"
                                placeholder="Enter password"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-blue-500'
                                    }`}
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition transform hover:-translate-y-1"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
