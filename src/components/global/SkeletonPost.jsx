import React from 'react'

const SkeletonPost = () => {
  return (
     <div className="bg-white rounded-xl p-4 shadow mb-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      <div>
        <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>

    <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
    <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>

    <div className="w-full h-48 bg-gray-300 rounded mt-3"></div>
  </div>
  )
}

export default SkeletonPost