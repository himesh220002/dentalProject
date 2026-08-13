'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
            
            const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, contact, password });
            
            if (res.data.token) {
                login(res.data.token, res.data.user);
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#fcfcfc] py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f9fafb] rounded-2xl mb-4 border border-gray-100">
                        <Image src="/images/toothlogo.png" alt="Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">Create Account</h1>
                    <p className="text-sm text-gray-500 font-medium font-sans">Join us to manage your dental health</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Phone (Optional)</label>
                        <input
                            type="tel"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-sm font-medium text-gray-900"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-gray-900 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-gray-900 hover:underline font-bold">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
