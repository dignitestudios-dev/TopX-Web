import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { profilehigh } from "../../../assets/export";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData } from "../../../redux/slices/auth.slice";
import FollowersFollowingModal from "../../global/FollowersFollowingModal";

export default function LargeProfile({
  setIsEditProfile,
  profileData,
  isFromOtherProfile,
}) {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("followers"); // or "following"
  const { allUserData } = useSelector((state) => state.auth);
  const userRecord = profileData || allUserData;
  console.log(profileData, "profileData-record");
  useEffect(() => {
    dispatch(getAllUserData());
  }, []);
  // ========================
  // NO DATA FOUND UI
  // ========================
  if (!allUserData) {
    return (
      <div className="rounded-2xl overflow-hidden border bg-white shadow-sm p-8 flex items-center justify-center h-[250px]">
        <p className="text-gray-400 text-[16px] font-medium">
          No Profile Data Found
        </p>
      </div>
    );
  }

  console.log(allUserData,"allUserData")

  return (
    <div className="rounded-2xl overflow-hidden border bg-white shadow-sm">
      {/* Top Orange Section */}
      <div className="bg-gradient-to-l from-[#DE4B12] to-[#E56F41]">
        <div className="flex relative -bottom-[62px] px-4 gap-3">
          <div className="relative">
            <img
              src={
                userRecord?.profilePicture ||
                "https://rapidapi.com/hub/_next/image?url=https%3A%2F%2Frapidapi-prod-apis.s3.amazonaws.com%2Fbdcd6ceb-1d10-4c3b-b878-4fc8d2e2059f.png&w=3840&q=75"
              }
              alt=""
              className="w-[135px] h-[135px] rounded-full object-cover"
            />

            {/* Edit Button */}
            {!isFromOtherProfile && (
              <button
                onClick={() => setIsEditProfile(true)}
                className="absolute bottom-1 right-2 w-9 h-9 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] rounded-full flex items-center justify-center"
              >
                <Edit className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          <div className="flex items-end gap-12">
            {/* Name Section */}
            <div>
              <h2 className="text-[18px] font-[500] text-[#000000]">
                {userRecord.name || "No Name"}
              </h2>
              <p className="text-[14px] font-[400] text-[#18181899]">
                {userRecord.username || "No Username"}
              </p>
            </div>

            {/* Stats Section */}
            <div className="text-center">
              <div className="text-[18px] font-[500] text-[#000000]">
                {userRecord.postsCount || "0"}
              </div>
              <div className="text-[14px] font-[400] text-[#18181899]">
                Posts
              </div>
            </div>

            <div
              className="text-center cursor-pointer"
              onClick={() => {
                setModalType("followers");
                setIsModalOpen(true);
              }}
            >
              <div className="text-[18px] font-[500]">
                {userRecord.followersCount || 0}
              </div>
              <div className="text-[14px] text-gray-500">Followers</div>
            </div>

            <div
              onClick={() => {
                setModalType("following");
                setIsModalOpen(true);
              }}
              className="text-center cursor-pointer"
            >
              <div className="text-[18px] font-[500] text-[#000000]">
                {userRecord.followingCount || "0"}
              </div>
              <div className="text-[14px] font-[400] text-[#18181899]">
                Following
              </div>
            </div>
          </div>
        </div>
        <FollowersFollowingModal
          otherProfile={isFromOtherProfile && userRecord?._id}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          title={modalType === "followers" ? "Followers" : "Following"}
          type={modalType == "followers" ? "followers" : "followings"}
        />
        {/* Bottom White Section - Bio */}
        <div className="pt-20 px-6 pb-8 space-y-1 bg-slate-50">
           <p className="text-[16px] font-[700] text-[#000]">
            {userRecord.name || "No username Available"}
          </p>
          <p className="text-[14px] font-[400] text-[#413b3b99]">
            @{userRecord.username || "No username Available"}
          </p>
          <p className="text-[14px] font-[400] text-[#413b3b99]">
            {userRecord.bio || "No Bio Available"}
          </p>
        </div>
      </div>
    </div>
  );
}
