
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
    );
};

export const StudentCardSkeleton: React.FC = () => (
    <div className="p-6 flex flex-col items-center bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
        <Skeleton className="w-24 h-24 rounded-full mb-5" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-16 h-4 mb-5" />
        <div className="w-full grid grid-cols-2 gap-3 mt-auto">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
        </div>
    </div>
);

export const KPISkeleton: React.FC = () => (
    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm h-48">
        <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-16 h-12 mb-4" />
        <Skeleton className="w-full h-4" />
    </div>
);
