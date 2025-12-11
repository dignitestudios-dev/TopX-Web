import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Search,
  Coffee,
  ShoppingBag,
  Bluetooth,
  Gamepad,
  Headphones,
  Watch,
} from "lucide-react";
import {
  carddesign,
  cup,
  dollar,
  dollaricons,
  earbuds,
  gamingconsole,
  maindollar,
  notes,
  postone,
  profile,
  profilehigh,
  speaker,
  topics,
  tshirt,
  watch,
} from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import { SuccessToast } from "../../components/global/Toaster";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllRefferals,
  getAllRewards,
  generateRefferalLink,
  availRedeemCode,
} from "../../redux/slices/affiliate.slice";

export default function Affiliates() {
  const [liked, setLiked] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("rewards");
  const [loadingId, setLoadingId] = useState(null);

  const coins = 400;
  const dispatch = useDispatch();
  const { AllRewards, ReferralUsers, isLoading, referralLink,isGenerateLoading } = useSelector(
    (state) => state.affiliate
  );
  useEffect(() => {
    dispatch(getAllRewards({ page: 1, limit: 10, search: "" }));
    dispatch(getAllRefferals({ page: 1, limit: 10, search: "" }));
  }, [dispatch, activeTab]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    await dispatch(generateRefferalLink({}));
  };
  const handleAvailRedeemCode = async (id) => {
     setLoadingId(id);
    await dispatch(availRedeemCode(id));
    setLoadingId(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    SuccessToast("Referral link copied!");
  };

  const pages = [
    {
      name: "Mike’s Basketball",
      img: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
      name: "Mike’s Fitness",
      img: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      name: "Mike’s Opinions",
      img: "https://randomuser.me/api/portraits/men/38.jpg",
    },
    {
      name: "Mike’s Cooking",
      img: "https://randomuser.me/api/portraits/men/33.jpg",
    },
    {
      name: "Mike’s Cars",
      img: "https://randomuser.me/api/portraits/men/31.jpg",
    },
    {
      name: "Mike’s Fashion",
      img: "https://randomuser.me/api/portraits/men/27.jpg",
    },
  ];

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [open, setOpen] = useState(false);
  const userCoins = Number(coins);

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
  ];

  return (
    <div className="flex  min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3">
        {/* Profile Card */}

        <Profilecard smallcard={true} />

        {/* My Subscription */}
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Middle Feed - 1/2 width */}
      <div className="w-1/2 bg-[#F2F2F2] min-h-screen p-6 mx-auto">
        {/* Header + Tabs */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Referral Rewards</h2>
          <div className="flex bg-white p-1 border rounded-full">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`px-4 py-2 text-sm rounded-l-full ${
                activeTab === "rewards"
                  ? "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Rewards & Redemption
            </button>
            <button
              onClick={() => setActiveTab("referrals")}
              className={`px-4 py-2 text-sm rounded-r-full ${
                activeTab === "referrals"
                  ? "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Your Referrals
            </button>
          </div>
        </div>

        {/* Coin Balance */}
        <div className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] rounded-xl text-center text-white py-4 mb-3">
          <div className="flex justify-center items-center gap-2">
            <span className="text-3xl font-[600] flex items-center gap-2">
              <img src={dollar} alt="" className="" /> {AllRewards?.coins || 0}{" "}
              Coins
            </span>
          </div>
        </div>

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="grid grid-cols-2 gap-3">
            {AllRewards?.rewards?.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl bg-transparent  overflow-hidden  text-center"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={carddesign}
                    alt="Card design"
                    className="w-full h-full object-contain"
                  />
                  {/* Add a light overlay only if needed for readability */}
                  <div className="absolute inset-0 bg-white/10"></div>
                </div>

                {/* Card Content */}
                <div className="relative p-6 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center justify-center ">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-10 h-10 object-contain ml-7 mb-3"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[13px] text-gray-800 mb-2">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 flex justify-center gap-1 items-center">
                        <span className="text-orange-500 font-semibold flex justify-center gap-3 items-center">
                          <img src={dollaricons} alt="" />
                        </span>{" "}
                        <span className="font-semibold text-black">
                          {item.coins} coins
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Redeem Button */}
                <div className="relative pb-6 pt-3 pl-10 pr-10 z-10">
                  <button
                    onClick={()=>handleAvailRedeemCode(item?._id)}
                    disabled={item?.isDisabled}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      !item?.isDisabled
                        ? "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white hover:bg-orange-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                     {loadingId === item?._id ? "Redeeming..." : "Redeem"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={referralLink}
                placeholder="Referral Link"
                readOnly
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />

              {!referralLink ? (
                <button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white px-4 py-[7px] text-sm rounded-lg"
                >
                  {isGenerateLoading ? "Generating..." : "Generate Link"}
                </button>
              ) : (
                <button
                  onClick={handleCopy}
                  className="bg-gradient-to-r from-[#DE4B12] to-[#E56F41] text-white px-4 py-[7px] text-sm rounded-lg"
                >
                  Copy Link
                </button>
              )}
            </div>

            <h3 className="font-semibold mb-3">Successful Invites</h3>
            <div className="space-y-3">
              {ReferralUsers?.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-orange-500">
                      {name.charAt(0)}
                    </div>
                    <p className="font-medium text-gray-700">{name}</p>
                  </div>
                  <span className="text-black font-semibold flex items-center gap-2">
                    <img src={maindollar} className="w-7 h-7" alt="" /> +100{" "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto  border-gray-200">
        <div className="p-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            {/* Header */}
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-gray-900">Trending Pages</span>
            </h3>

            {/* Trending List */}
            <div className="space-y-6">
              {trending.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={topics}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex gap-2">
                        <p className="font-[400] text-[14px]"> {item.title}</p>
                        <img src={notes} alt="" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-snug">
                    {item.desc}
                  </p>

                  {/* Hashtags */}
                  <p className="text-xs text-gray-700 mb-3">
                    {item.hashtags.map((tag, i) => (
                      <span key={i} className="mr-1 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </p>

                  <div className="flex justify-between items-center">
                    <div>
                      {/* Followers + Subscribe */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <img
                              src="https://randomuser.me/api/portraits/women/1.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/men/2.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/women/3.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        50+ Follows
                      </p>
                    </div>

                    <div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
              <span>View All</span>
              <FaChevronRight color="orange" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            {/* Header */}
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-gray-900">
                Suggestions based on your Interests/Activity
              </span>
            </h3>

            {/* Trending List */}
            <div className="space-y-6">
              {trending.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={topics}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex gap-2">
                        <p className="font-[400] text-[14px]"> {item.title}</p>
                        <img src={notes} alt="" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-snug">
                    {item.desc}
                  </p>

                  {/* Hashtags */}
                  <p className="text-xs text-gray-700 mb-3">
                    {item.hashtags.map((tag, i) => (
                      <span key={i} className="mr-1 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </p>

                  <div className="flex justify-between items-center">
                    <div>
                      {/* Followers + Subscribe */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <img
                              src="https://randomuser.me/api/portraits/women/1.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/men/2.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/women/3.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        50+ Follows
                      </p>
                    </div>

                    <div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
              <span>View All</span>
              <FaChevronRight color="orange" />
            </div>
          </div>
          {open && <ChatWidget />} {/* Your actual chat panel */}
          <FloatingChatButton onClick={() => setOpen(!open)} />
        </div>
      </div>
    </div>
  );
}
