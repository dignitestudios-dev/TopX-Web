import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Search,
} from "lucide-react";
import {
  notes,
  postone,
  profile,
  profilehigh,
  topics,
} from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { useNavigate } from "react-router";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";

export default function Golive() {
  const [liked, setLiked] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myPages } = useSelector((state) => state.pages);
  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 10 }));
  }, [dispatch]);

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

  const filteredPages = myPages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [open, setOpen] = useState(false);

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
      <div className="w-1/2 bg-[#F2F2F2] min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header + Search */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Select page to go live
            </h2>
            <div className="relative w-64">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Pages List */}
          <div className="space-y-3 mt-4">
            {filteredPages.map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={page.image}
                    alt={page.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    onClick={() =>
                      navigate(`/profile`, {
                        state: { id: page._id },
                      })
                    }
                    className="text-gray-800 cursor-pointer font-medium text-sm"
                  >
                    {page.name}
                  </span>
                </div>
                <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded-md hover:bg-orange-600 transition">
                  Go live
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto  border-gray-200">
        <div className="p-0">
        {/* Trending Pages Section */}
        <TrendingPagesGlobal/>

        {/* Suggestions Section */}
        <SuggestionsPagesGlobal/>




          {open && <ChatWidget />} {/* Your actual chat panel */}
          <FloatingChatButton onClick={() => setOpen(!open)} />
        </div>
      </div>
    </div>
  );
}
