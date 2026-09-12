import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
    const variantClasses = {
        text: 'h-4 w-full rounded',
        rect: 'h-32 w-full rounded-2xl',
        circle: 'h-12 w-12 rounded-full'
    };

    return (
        <div
            className={`overflow-hidden relative bg-gray-200/60 dark:bg-gray-700/60 ${variantClasses[variant]} ${className}`}
        >
            <div className="absolute inset-0 animate-shimmer"></div>
        </div>
    );
}

// Specialized Skeletons for the Dental Clinic
export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-[140px]" />
                <Skeleton variant="text" className="w-[100px]" />
            </div>
        </div>
    );
}

export function ConsultantCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-[20px] border border-black/5 space-y-5">
            <Skeleton variant="rect" className="w-10 h-10 !rounded-full" />
            <div className="space-y-3">
                <Skeleton variant="text" className="h-5 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/3" />
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" />
                <Skeleton variant="text" className="w-5/6" />
                <Skeleton variant="text" className="w-2/3 h-4 mt-3" />
            </div>
        </div>
    );
}

export function ActionTileSkeleton() {
    return (
        <div className="bg-white/50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
            <Skeleton variant="rect" className="w-12 h-12 !rounded-xl" />
            <div className="space-y-2">
                <Skeleton variant="text" className="h-6 w-1/2" />
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-3 w-3/4" />
            </div>
        </div>
    );
}

export function TreatmentCardSkeleton() {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-5">
                    <Skeleton variant="rect" className="w-16 h-16 !rounded-2xl shrink-0" />
                    <Skeleton variant="text" className="h-8 w-1/2" />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton variant="text" className="w-1/4" />
                        <Skeleton variant="text" className="h-12" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                        <Skeleton variant="text" className="w-1/3" />
                        <Skeleton variant="text" className="h-8" />
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton variant="text" className="h-3 w-12" />
                        <Skeleton variant="text" className="h-8 w-20" />
                    </div>
                    <Skeleton variant="rect" className="h-12 w-32 !rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
export function PresentationSkeleton() {
    return (
        <div className="bg-[#0f172a] min-h-screen p-8 space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-8">
                <Skeleton variant="rect" className="w-48 h-8 !rounded-full bg-blue-500/10" />
                <Skeleton variant="text" className="h-16 w-3/4 !bg-gray-800" />
                <Skeleton variant="text" className="h-6 w-1/2 !bg-gray-800" />
            </div>

            {/* Content Sections */}
            {[1, 2].map((i) => (
                <div key={i} className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Skeleton variant="text" className="h-10 w-1/3 !bg-gray-800" />
                        <Skeleton variant="text" className="h-4 w-1/2 !bg-gray-800" />
                    </div>
                    <Skeleton variant="rect" className="h-[400px] !rounded-[3rem] !bg-gray-800/50" />
                </div>
            ))}
        </div>
    );
}

export function DoctorSectionSkeleton() {
    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Skeleton variant="rect" className="h-[500px] !rounded-[3rem]" />
            <div className="space-y-6">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="text" className="h-12 w-3/4" />
                <div className="space-y-3">
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" className="w-5/6" />
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6">
                    <Skeleton variant="rect" className="h-24" />
                    <Skeleton variant="rect" className="h-24" />
                </div>
            </div>
        </div>
    );
}

export function AboutPageSkeleton() {
    return (
        <div className="bg-[#fcfcfc] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Skeleton variant="text" className="h-4 w-32" />
                    <Skeleton variant="text" className="h-10 w-3/4" />
                    <Skeleton variant="text" className="h-20 w-full" />
                    <Skeleton variant="rect" className="h-32 !rounded-[20px]" />
                </div>
                <Skeleton variant="rect" className="h-[420px] !rounded-[24px]" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <ConsultantCardSkeleton key={i} />)}
            </div>
        </div>
    );
}

export function TreatmentsPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 mt-20">
            <div className="text-center space-y-4">
                <Skeleton variant="text" className="h-12 w-64 mx-auto" />
                <Skeleton variant="text" className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TreatmentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
