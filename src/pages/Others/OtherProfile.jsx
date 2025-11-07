import { useState } from "react";
import { useLocation } from "react-router";
import LargeProfile from "../../components/app/profile/LargeProfile";
import MySubscription from "../../components/homepage/MySubscription";
import { BookOpen, Lightbulb, Users } from "lucide-react";
import { FiPlus } from "react-icons/fi";
import { auth, topics } from "../../assets/export";
import KnowledgePostCard from "../../components/app/profile/KnowledgePostCard";
import TopicPageCard from "../../components/app/profile/TopicPageCard";
import EditedProfile from "../../components/app/profile/EditedProfile";
import CreatePostModal from "../../components/app/profile/CreatePostModal";
import ProfilePost from "../../components/app/profile/ProfilePost";
import MySubscriptiononprofile from "../../components/homepage/MySubscriptiononprofile";

export default function OtherProfile() {
  const [activeTab, setActiveTab] = useState("topics");
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isProfilePostOpen, setIsProfilePostOpen] = useState(false);

  const location = useLocation();
  const isFromOtherProfile = location.pathname === "/other-profile"; // ✅ show tabs only on this page
const trending = [
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
];
  return (
    <div className="flex flex-col md:flex-row h-[41em] max-w-7xl mx-auto pt-3 md:gap-6 gap-2 px-3 overflow-y-hidden">
      {/* Left Side */}
      <div className="w-full md:w-1/4 sticky top-0 overflow-hidden">
        <MySubscription />
      </div>

      {/* Right Side */}
      <div className="overflow-y-auto scrollbar-hide w-full md:w-3/4">
        {!isProfilePostOpen ? (
          <div className="flex flex-col gap-3">
            {/* Edit OR Profile View */}
            {isEditProfile ? (
              <EditedProfile />
            ) : (
              <>
                <LargeProfile setIsEditProfile={setIsEditProfile} />

                {/* Tabs */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 border-b border-gray-200">
                    {/* My Topic Pages */}
                    <button
                      onClick={() => setActiveTab("topics")}
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
                        activeTab === "topics"
                          ? "text-orange-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded ${
                          activeTab === "topics"
                            ? "bg-orange-600"
                            : "bg-gray-400"
                        }`}
                      >
                        <BookOpen className="text-white" size={16} />
                      </div>
                      <span>My Topic Pages</span>
                      {activeTab === "topics" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                      )}
                    </button>

                 

                    {/* My Subscriptions (only visible on /other-profile) */}
                    {isFromOtherProfile && (
                      <button
                        onClick={() => setActiveTab("subscriptions")}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
                          activeTab === "subscriptions"
                            ? "text-orange-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded ${
                            activeTab === "subscriptions"
                              ? "bg-orange-600"
                              : "bg-gray-400"
                          }`}
                        >
                          <Users className="text-white" size={16} />
                        </div>
                        <span>My Subscriptions</span>
                        {activeTab === "subscriptions" && (
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                        )}
                      </button>
                    )}


                       {/* My Knowledge Post */}
                    <button
                      onClick={() => setActiveTab("knowledge")}
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
                        activeTab === "knowledge"
                          ? "text-orange-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded ${
                          activeTab === "knowledge"
                            ? "bg-orange-600"
                            : "bg-gray-400"
                        }`}
                      >
                        <Lightbulb className="text-white" size={16} />
                      </div>
                      <span>My Knowledge Post</span>
                      {activeTab === "knowledge" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "topics" ? (
                    <div className="flex flex-col gap-3">
                      {/* Create Post */}
                      <div
                        onClick={() => setIsCreatePostModalOpen(true)}
                        className="w-full h-[40px] flex justify-between items-center bg-white rounded-[12px] border border-[#B9B9B9] px-1"
                      >
                        <p className="text-[14px] font-[500] text-[#18181899] pl-2">
                          Create Post
                        </p>
                        <button className="bg-gradient-to-l from-[#DE4B12] to-[#E56F41] text-white w-[34px] h-[34px] rounded-[10px] flex items-center justify-center">
                          <FiPlus size={24} className="text-white" />
                        </button>
                      </div>

                      {/* Topic Page Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {trending.map((_, index) => (
                          <TopicPageCard
                            onClick={() => setIsProfilePostOpen(true)}
                            key={index}
                            img={topics}
                            title={_.title}
                            description={_.desc}
                            tags={_.hashtags}
                            Follows="50"
                            className="bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  ) : activeTab === "knowledge" ? (
                    <KnowledgePostCard />
                  ) : (
                    // ✅ Show only when on /other-profile route
                    isFromOtherProfile && <MySubscriptiononprofile />
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <ProfilePost setIsProfilePostOpen={setIsProfilePostOpen} />
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        setIsOpen={setIsCreatePostModalOpen}
      />
    </div>
  );
}
