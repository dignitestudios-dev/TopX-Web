import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData } from "../../redux/slices/auth.slice";
import FollowersFollowingModal from "../global/FollowersFollowingModal";

const Profilecard = () => {
  const dispatch = useDispatch();
  const { allUserData } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("followers");

  useEffect(() => {
    dispatch(getAllUserData());
  }, [dispatch]);

  // =======================
  // SKELETON LOADING
  // =======================
  if (!allUserData) {
    return (
      <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-[#E55B1B]/80 px-4 py-4 min-h-[90px] relative flex items-center justify-between">
          <div className="absolute -bottom-9 left-4">
            <div className="w-18 h-18 rounded-full bg-gray-300 border-3 border-white"></div>
          </div>
          <div className="w-18"></div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center gap-1">
              <div className="h-4 w-8 bg-orange-300/60 rounded"></div>
              <div className="h-3 w-10 bg-orange-300/40 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-4 w-8 bg-orange-300/60 rounded"></div>
              <div className="h-3 w-12 bg-orange-300/40 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-4 w-8 bg-orange-300/60 rounded"></div>
              <div className="h-3 w-12 bg-orange-300/40 rounded"></div>
            </div>
          </div>
        </div>

        {/* Text skeletons */}
        <div className="pt-11 px-5 pb-5">
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 w-full bg-gray-200 rounded mb-1.5"></div>
          <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // =======================
  // REAL DATA VIEW
  // =======================
  const cleanUsername = allUserData?.username
    ? allUserData.username.startsWith("@")
      ? allUserData.username
      : `@${allUserData.username}`
    : "@username";

  return (
    <div>
      <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs">
        {/* Top Orange Header Banner */}
        <div className="bg-[#E55B1B] px-4 py-4 min-h-[90px] relative flex items-center justify-between">
          {/* Avatar Positioned Overlapping */}
          <div className="relative">
            <div className="absolute -bottom-10 left-0 z-10">
              {allUserData?.profilePicture ? (
                <img
                  src={allUserData.profilePicture}
                  loading="lazy"
                  alt="profile"
                  className="w-[72px] h-[72px] object-cover rounded-full border-3 border-white shadow-sm bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                style={{
                  display: allUserData?.profilePicture ? "none" : "flex",
                }}
                className="w-[72px] h-[72px] rounded-full bg-gradient-to-r from-orange-400 to-orange-600 border-3 border-white shadow-sm items-center justify-center text-white font-bold text-2xl flex-shrink-0 select-none"
              >
                {(allUserData?.name || allUserData?.username || "U")
                  ?.trim()
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            </div>
            {/* Spacer for width of avatar */}
            <div className="w-[72px]"></div>
          </div>

          {/* Stats: Posts | Followers | Following */}
          <div className="flex items-center justify-around flex-1 text-white text-center pl-2">
            <div>
              <div className="text-[16px] font-bold leading-tight">
                {allUserData?.postsCount ?? 0}
              </div>
              <div className="text-[12px] font-medium text-orange-100 opacity-95">
                Posts
              </div>
            </div>

            <div
              className="cursor-pointer hover:opacity-85 transition"
              onClick={() => {
                setModalType("followers");
                setIsModalOpen(true);
              }}
            >
              <div className="text-[16px] font-bold leading-tight">
                {allUserData?.followersCount ?? 0}
              </div>
              <div className="text-[12px] font-medium text-orange-100 opacity-95">
                Followers
              </div>
            </div>

            <div
              className="cursor-pointer hover:opacity-85 transition"
              onClick={() => {
                setModalType("following");
                setIsModalOpen(true);
              }}
            >
              <div className="text-[16px] font-bold leading-tight">
                {allUserData?.followingCount ?? 0}
              </div>
              <div className="text-[12px] font-medium text-orange-100 opacity-95">
                Following
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Profile Details */}
        <div className="pt-11 px-5 pb-5 bg-white">
          <h2
            className="text-[17px] font-bold text-gray-900 leading-snug truncate"
            title={allUserData?.name || "Not Available"}
          >
            {allUserData?.name || "Not Available"}
          </h2>
          <p
            className="text-[13px] text-gray-400 font-normal leading-tight truncate mt-0.5"
            title={cleanUsername}
          >
            {cleanUsername}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed mt-2.5 break-words">
            {allUserData?.bio || "No Bio"}
          </p>
        </div>
      </div>

      {/* Followers / Following Modal */}
      <FollowersFollowingModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={modalType === "followers" ? "Followers" : "Following"}
        type={modalType === "followers" ? "followers" : "followings"}
      />
    </div>
  );
};

export default Profilecard;
