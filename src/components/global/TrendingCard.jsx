import React from 'react'

const TrendingCard = ({item}) => {
  return (
    <div className="w-[260px] bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between border border-gray-100">
            {/* Page Image */}
            <img
                src={item.image || item.user?.profilePicture}
                alt=""
                className="w-full h-32 rounded-xl object-cover mb-3"
            />

            {/* Title */}
            <p className="font-semibold text-[15px] leading-tight">
                {item.name}
            </p>

            {/* Topic */}
            <p className="text-xs text-gray-500 -mt-1 mb-1">
                {item.topic}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
                {item.about}
            </p>

            {/* Hashtags */}
            <p className="text-xs text-gray-500 mt-1">
                {item.keywords?.map((tag, i) => (
                    <span key={i} className="mr-1">{tag}</span>
                ))}
            </p>

            {/* Followers Row */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {item.followers?.slice(0, 3).map((img, i) => (
                            img ? (
                                <img
                                    key={i}
                                    src={img}
                                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                />
                            ) : (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
                                ></div>
                            )
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                        {item.followersCount}+ Followers
                    </p>
                </div>

                <button className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:opacity-90 text-white px-4 py-1.5 rounded-[10px] text-xs font-semibold">
                    Subscribe
                </button>
            </div>
        </div>
  )
}

export default TrendingCard