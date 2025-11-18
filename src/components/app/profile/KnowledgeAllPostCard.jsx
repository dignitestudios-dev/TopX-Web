import React from "react";
import { TbFileText } from "react-icons/tb";

export default function KnowledgeAllPostCard({ item }) {

  // Get first + last letter for fallback avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const profileImg = item?.image;
  const initials = getInitials(item?.user?.name || item?.name);

  return (
    <div className="bg-white border border-[#ecebeb] rounded-[15px] p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition">

      {/* Top: Image + Name + Icon */}
      <div className="flex items-center gap-3">

        {/* Profile Image OR Initials Avatar */}
        {profileImg ? (
          <img
            src={profileImg}
            alt={item?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#E56F41] flex items-center justify-center text-white font-bold text-[14px]">
            {initials}
          </div>
        )}

        <div className="flex items-center gap-2">
          <p className="text-[14px] font-[600] text-black capitalize">
            {item?.name}
          </p>

          <TbFileText className="w-[16px] h-[16px]" />
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#5A5A5A] leading-[18px] line-clamp-2">
        {item?.about}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-2">
        {item?.keywords?.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className="text-[11px] font-[500] text-[#5A5A5A]"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Followers Section */}
      <div className="flex items-center gap-2 mt-2">
        <div className="relative w-[60px] h-[24px]">
          <img src="https://randomuser.me/api/portraits/women/3.jpg" className="w-[24px] h-[24px] rounded-full absolute left-0" />
          <img src="https://randomuser.me/api/portraits/men/2.jpg" className="w-[24px] h-[24px] rounded-full absolute left-5" />
          <img src="https://randomuser.me/api/portraits/women/1.jpg" className="w-[24px] h-[24px] rounded-full absolute left-10" />
        </div>

        <p className="text-[12px] font-[500] text-[#5A5A5A]">
          {item?.followersCount || 0}+ Follows
        </p>
      </div>

    </div>
  );
}
