import React from "react";

export default function KnowledgePostSkeleton() {
  return (
    <div className="bg-white border border-[#ecebeb] rounded-[15px] p-4 animate-pulse">
      
      {/* Top Row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-200 rounded-md"></div>
      </div>

      {/* Description */}
      <div className="mt-4 space-y-2">
        <div className="w-full h-3 bg-gray-200 rounded-md"></div>
        <div className="w-3/4 h-3 bg-gray-200 rounded-md"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mt-4">
        <div className="w-14 h-3 bg-gray-200 rounded-md"></div>
        <div className="w-16 h-3 bg-gray-200 rounded-md"></div>
        <div className="w-12 h-3 bg-gray-200 rounded-md"></div>
      </div>

      {/* Followers */}
      <div className="flex items-center gap-4 mt-5">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>

        <div className="w-20 h-3 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}
