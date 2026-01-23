import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  Bookmark,
  Layers,
} from "lucide-react";
import { nofound, notes, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
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
import { Link, useNavigate } from "react-router";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import { fetchMyPages } from "../../redux/slices/pages.slice";

export default function Subscriptions() {
  const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dispatch = useDispatch();
  const { mySubscriptions } = useSelector((state) => state.subscriptions);
  const { savedCollections, isLoading } = useSelector(
    (state) => state.collections
  );
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [SelectedCollection, setSelectedCollection] = useState(null);
  const dropdownRef = useRef(null);
  const [showUpdateModal, setshowUpdateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
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


  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 10 }));
  }, [dispatch]);

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [open, setOpen] = useState(false);

  console.log(subscriptions, "subscriptions")

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
    console.log(id, "idesss");
    await dispatch(updateSavedCollections(id)).unwrap();
  };
  console.log(subscriptions, "subscriptions");
  return (
    <div className="flex  min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3">
        {/* Profile Card */}

        <Profilecard smallcard={true} />


        {/* Topic Pages */}
        <div className="px-4 py-4 bg-white rounded-xl mt-4 border border-gray-200 mb-4">
          <h3 className="font-[500] text-lg mb-4 flex items-center gap-2">
            <TbNotes className="w-5 h-5 text-orange-500" />
            Topic Pages
          </h3>
          <div className="space-y-4">
            {pagesLoading
              ? Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="pb-4 border-b border-gray-200 last:border-0 animate-pulse"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-300" />

                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 bg-gray-300 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>

                  {/* About */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-4/5 bg-gray-200 rounded" />
                  </div>

                  {/* Followers */}
                  <div className="h-3 w-24 bg-gray-300 rounded mt-3" />
                </div>
              ))
              : myPages?.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={item?.image}
                        className="w-full h-full object-cover rounded-full"
                        alt=""
                      />
                    </div>

                    <div className="flex gap-2 items-center">
                      <p
                        onClick={() =>
                          navigate(`/profile`, {
                            state: { id: item._id },
                          })
                        }
                        className="cursor-pointer font-[400] text-[14px]"
                      >
                        {item?.name}
                      </p>
                      <img src={notes} alt="" />
                    </div>
                  </div>

                  <p className="text-[14px] text-gray-600 leading-snug">
                    {item?.about}
                  </p>

                  <p className="text-[14px] text-gray-700 mt-1">
                    <span className="text-black font-[600]">
                      {item?.followersCount}+
                    </span>{" "}
                    Follows
                  </p>
                </div>
              ))}
          </div>

          <Link to="/profile">
            <div className="flex items-center gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
              View All
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
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
                className={`px-4 py-2 rounded-l-full text-sm font-medium ${activeTab === "my"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
                  }`}
                onClick={() => setActiveTab("my")}
              >
                My Subscriptions
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-r-full font-medium ${activeTab === "saved"
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
          {subscriptions?.length === 0 ? (
            <div className="text-gray-500 col-span-3 text-center py-10">
              <div className=" flex justify-center">
                <img src={nofound} height={300} width={300} alt="" />
              </div>
              <p className="font-bold pt-4 text-black">
                {activeTab === "saved" && " No Saved Collections"}
                  {activeTab === "my" && "You Have No Collections"}
              
              </p>
            </div> // Display this message if there are no subscriptions
          ) : (
            subscriptions?.map((item) => (
              <div
                key={item._id}
                className="bg-white cursor-pointer border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3
                    onClick={() =>
                      navigate(`/subscriptions-category`, {
                        state: { id: item._id },
                      })
                    }
                    className="text-[14px] font-semibold text-gray-800 flex items-center gap-1"
                  >
                    <img src={item?.image} className="rounded-full object-cover w-6 h-6" alt="" />
                    {item.userData?.name}
                    {activeTab === "saved" && "'s"} {item.name}
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
                      onClick={() => savedCollection(item._id)}
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
                            src={page?.image || page || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj9uaOHSUP94_FgVeF4BtFT6hETgBW_a8xXw&s"}
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
            ))
          )}

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
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200 scrollbar-hide">
        <div className="p-0">
          {/* Trending Pages Section */}
          <TrendingPagesGlobal />

          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />
        </div>
      </div>
    </div>
  );
}
