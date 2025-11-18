import React from 'react';

export default function PostSkeleton() {
    return (
        <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            {/* Header Skeleton */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                    <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
                        <div className="h-3 w-40 bg-gray-200 rounded" />
                    </div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>

            {/* Tag Skeleton */}
            <div className="px-4 pt-3 pb-2">
                <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>

            {/* Image Skeleton */}
            <div className="w-full bg-gray-300 h-96" />

            {/* Content Skeleton */}
            <div className="px-4 py-3 space-y-2">
                <div className="h-4 w-full bg-gray-300 rounded" />
                <div className="h-4 w-5/6 bg-gray-300 rounded" />
                <div className="h-4 w-4/6 bg-gray-300 rounded" />
            </div>

            {/* Stats Skeleton */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
                <div className="h-4 w-16 bg-gray-300 rounded" />
                <div className="h-4 w-16 bg-gray-300 rounded" />
                <div className="h-4 w-16 bg-gray-300 rounded" />
            </div>
        </div>
    );
}