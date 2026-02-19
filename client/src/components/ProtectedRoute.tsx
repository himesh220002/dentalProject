'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLockModal from './AdminLockModal';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const locked = localStorage.getItem('clinic_admin_locked');
            const expiry = localStorage.getItem('clinic_admin_expiry');
            const now = Date.now();

            if (locked === 'false' && expiry && now < Number(expiry)) {
                setIsUnlocked(true);
            } else {
                localStorage.removeItem('clinic_admin_locked');
                localStorage.removeItem('clinic_admin_expiry');
                setIsUnlocked(false);
                setIsModalOpen(true);
            }
        };

        checkAuth();
        const interval = setInterval(checkAuth, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const handleSuccess = () => {
        setIsUnlocked(true);
        setIsModalOpen(false);
    };

    const handleClose = () => {
        if (!isUnlocked) {
            router.push('/');
        }
    };

    if (isUnlocked === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight leading-tight">
                            Access Restricted
                        </h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            This area is reserved for clinic administrators. Please unlock to continue.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                            Unlock Now
                        </button>
                    </div>
                </div>
                <AdminLockModal
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                />
            </>
        );
    }

    return <>{children}</>;
}
