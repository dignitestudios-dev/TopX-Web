import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  Bookmark,
  Layers,
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
import CreateSubscriptionModal from "../../components/global/CreateSubscriptionModal";
import { useDispatch, useSelector } from "react-redux";
import { getMySubsctiptions } from "../../redux/slices/Subscription.slice";
import UpdateSubscriptionModal from "../../components/global/updateSubscriptionModal";
import DeleteCollectionPageModal from "../../components/global/DeleteCollectionPageModal";
import {
  getMySavedCollections,
  RemoveSubscriptionCollection,
  updateSavedCollections,
} from "../../redux/slices/collection.slice";

export default function Subscriptions() {
  const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dispatch = useDispatch();
  const { mySubscriptions } = useSelector((state) => state.subscriptions);
  const { savedCollections,isLoading } = useSelector((state) => state.collections);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [SelectedCollection, setSelectedCollection] = useState(null);
  const dropdownRef = useRef(null);
  const [showUpdateModal, setshowUpdateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 🔥 Debounce search so API doesn't call on every key press
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(getMySubsctiptions({ page: 1, limit: 10, search }));
    }, 500);

    return () => clearTimeout(delay);
  }, [search, dispatch]);

  // First load
  useEffect(() => {
    dispatch(getMySubsctiptions({ page: 1, limit: 10, search: "" }));
    dispatch(getMySavedCollections({ page: 1, limit: 10, search: "" }));
  }, [dispatch, activeTab]);

  const subscriptions = activeTab === "my" ? mySubscriptions : savedCollections;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const toggleDropdown = (id) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (item) => {
    setOpenDropdownId(null);
    setSelectedCollection(item); // ✅ full object
    setshowUpdateModal(true);
  };

  const handleDelete = (item) => {
    setOpenDropdownId(null);
    setDeleteTarget(item); // collection info
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log(deleteTarget);
      await dispatch(RemoveSubscriptionCollection(deleteTarget._id)).unwrap();
      setShowDeleteModal(false);
      setDeleteTarget(null);
      dispatch(getMySubsctiptions({ page: 1, limit: 10, search: "" }));
    } catch (err) {
      console.log(err);
    }
  };
  const savedCollection = async (id) => {
    console.log(id,"idesss")
    await dispatch(updateSavedCollections(id)).unwrap();
  };
  console.log(subscriptions, "item-pages-->");
  return (
    <div className="flex  min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3">
        {/* Profile Card */}

        <Profilecard smallcard={true} />

        <h3 className="font-[500] text-lg mb-4 flex items-center gap-2 pt-4">
          <TbNotes className="w-5 h-5 text-orange-500" />
          Topic Pages
        </h3>
        {/* Topic Pages */}
        <div className="px-0 py-0  mt-4  mb-4">
          <div className="space-y-4">
            {[1, 2, 3].map((item, idx) => (
              <div
                key={idx}
                className="pb-4 border-b bg-white border p-3 rounded-xl border-gray-200 last:border-0"
              >
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-10 h-10  rounded-full  text-lg flex items-center justify-center flex-shrink-0">
                    <img src={topics} alt="" />
                  </div>
                  <div className="flex gap-2">
                    <p className="font-[400] text-[14px]">
                      Justin's Basketball
                    </p>
                    <img src={notes} alt="" />
                  </div>
                </div>
                <p className="text-[14px] text-gray-600 leading-snug">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor.
                </p>
                <p className="text-[14px] text-gray-400 leading-snug gap-3 pt-2">
                  #Lorem ipsum #Lorem ipsum <br></br> #Lorem ipsum
                </p>
                <div className="flex gap-2 pt-2">
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
                  <p className="text-[14px] text-gray-700 mt-1">
                    <span className="text-black font-[600]">50+</span> Follows
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center pl-3 gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
            View All
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Middle Feed - 1/2 width */}
      <div className="w-1/2 bg-[#F2F2F2] min-h-screen p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === "my" ? "My Subscription" : "Saved Subscription"}
          </h2>
          <div className="flex items-center gap-3">
            {activeTab === "my" && (
              <button onClick={() => setActiveTab("my")}>
                <div
                  className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} className="cursor-pointer" />
                </div>
              </button>
            )}

            <div className="flex bg-white p-1 rounded-full overflow-hidden">
              <button
                className={`px-4 py-2 rounded-l-full text-sm font-medium ${
                  activeTab === "my"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("my")}
              >
                My Subscriptions
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-r-full font-medium ${
                  activeTab === "saved"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("saved")}
              >
                Saved Subscriptions
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          {activeTab === "my" && (
            <div>
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
          )}
        </div>

        {/* Subscription Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {subscriptions?.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  {item.name}
                  <span className="text-gray-400 pl-1">
                    <Layers size={16} />
                  </span>
                </h3>

                {activeTab === "my" ? (
                  <div
                    className="relative"
                    ref={openDropdownId === item._id ? dropdownRef : null}
                  >
                    <MoreVertical
                      size={18}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      onClick={() => toggleDropdown(item._id)}
                    />

                    {openDropdownId === item._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-10">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Bookmark
                    size={18}
                    onClick={()=>savedCollection(item._id)}
                    className="text-orange-500 cursor-pointer"
                    fill="#F97316"
                  />
                )}
              </div>

              {/* Pages */}
              <div className="flex items-center mt-3 gap-2">
                <div className="flex -space-x-2">
                  {Array.isArray(item?.pages) && item?.pages.length > 0 ? (
                    item?.pages
                      .slice(0, 3)
                      .map((page, i) => (
                        <img
                          key={page?._id || i}
                          src={page?.image || page}
                          alt=""
                          className="w-6 h-6 rounded-full border border-white object-cover"
                        />
                      ))
                  ) : (
                    <span className="text-xs text-gray-400">No pages</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  <span className="font-semibold text-black">
                    {item?.pages?.length || 0}+
                  </span>{" "}
                  Pages
                </p>
              </div>
            </div>
          ))}

          {/* Create Subscription Modal */}
          {showCreateModal && (
            <CreateSubscriptionModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              page={null}
              onSave={null}
            />
          )}
          {showUpdateModal && (
            <UpdateSubscriptionModal
              isOpen={showUpdateModal}
              onClose={() => setshowUpdateModal(false)}
              collection={SelectedCollection} // ✅ pass whole object
            />
          )}
          {showDeleteModal && (
            <DeleteCollectionPageModal
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleConfirmDelete}
            />
          )}
        </div>
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
                    <div className="flex items-center gap-1 text-black">
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
                      <p className="text-[13px] text-black font-bold">
                        50+{" "}
                        <span className="text-slate-600 font-normal">
                          Follows
                        </span>
                      </p>
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
