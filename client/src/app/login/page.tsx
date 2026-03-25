'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaTooth } from 'react-icons/fa';

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                        <FaTooth size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500 font-medium">Access your dental records & schedule appointments</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => signIn('google')}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <FcGoogle size={24} />
                        Continue with Google
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px]">Secure Portal</span>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                        By continuing, you agree to our <span className="text-blue-500 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
