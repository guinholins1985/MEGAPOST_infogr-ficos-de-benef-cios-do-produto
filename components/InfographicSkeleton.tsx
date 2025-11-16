
import React from 'react';

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
);

const InfographicSkeleton: React.FC = () => {
    return (
        <div className="p-8 md:p-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full">
            {/* Image Placeholder */}
            <SkeletonBox className="h-64 md:h-80 w-full mb-8" />
            
            <div className="text-center">
                {/* Product Name */}
                <SkeletonBox className="h-10 w-3/4 mx-auto" />
                {/* Headline */}
                <SkeletonBox className="h-8 w-1/2 mx-auto mt-4" />
                {/* Summary */}
                <div className="mt-4 max-w-2xl mx-auto space-y-2">
                    <SkeletonBox className="h-5 w-full" />
                    <SkeletonBox className="h-5 w-5/6" />
                    <SkeletonBox className="h-5 w-3/4" />
                </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <SkeletonBox className="h-12 w-12 rounded-lg flex-shrink-0" />
                        <div className="w-full space-y-2">
                            <SkeletonBox className="h-6 w-1/3" />
                            <SkeletonBox className="h-5 w-full" />
                            <SkeletonBox className="h-5 w-4/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfographicSkeleton;
