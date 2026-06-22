import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`shimmer-bg rounded-none ${className}`}></div>
    );
};

export const StudentCardSkeleton: React.FC = () => (
    <div className="p-5 flex flex-col bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none h-full select-none pointer-events-none">
        <Skeleton className="w-16 h-3 mb-4" />
        <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-3" />
            </div>
            <Skeleton className="w-10 h-10 shrink-0" />
        </div>
        <div className="w-full space-y-2 mt-auto pt-3 border-t border-[oklch(0.60_0_0_/_0.10)]">
            <div className="flex justify-between">
                <Skeleton className="w-12 h-3" />
                <Skeleton className="w-8 h-3" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-6 h-3" />
            </div>
        </div>
    </div>
);

export const KPISkeleton: React.FC = () => (
    <div className="p-6 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none h-44 select-none pointer-events-none">
        <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-16 h-8 mb-4" />
        <Skeleton className="w-full h-3" />
    </div>
);
