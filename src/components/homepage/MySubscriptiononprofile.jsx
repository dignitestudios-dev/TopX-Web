import React, { useState } from "react";
import { Layers, BookmarkMinus } from "lucide-react";
import { FaBookmark } from "react-icons/fa6";
import { ballone, balltwo } from "../../assets/export";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import { updateSavedCollections } from "../../redux/slices/collection.slice";

const MySubscriptiononprofile = ({ userCollections,toggleBookmark }) => {
  const [bookmarked, setBookmarked] = useState({});
  const dispatch = useDispatch();
  const subscriptions = [
    { id: 1, title: "My Basketball", url: "/subscriptions-category" },
    { id: 2, title: "My Fitness", url: "/subscriptions-category" },
    { id: 3, title: "My Cooking", url: "/subscriptions-category" },
  ];


  return (
    <div className="max-w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Subscription List */}
      <div className="space-y-4">
        {userCollections?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
          >
            <div className="flex items-start gap-3">
              <div>
                <Link to={item.url}>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {item.name}
                    <Layers className="w-4 h-4 text-gray-500" />
                  </p>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-2">
                    {item?.pages?.slice(0, 3).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        className="w-5 h-5 rounded-full border border-white"
                      />
                    ))}
                  </div>
                  {item?.pages?.length > 3 && (
                    <p className="text-xs text-gray-500 font-medium">
                      <span className="text-black font-[600]">
                        {" "}
                        +{item.pages.length - 3}
                      </span>{" "}
                      Pages
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bookmark toggle */}
            <button
              onClick={() => toggleBookmark(item._id)}
              className="transition-transform hover:scale-110"
            >
              {item?.isSavedByMe ? (
                <FaBookmark className="w-5 h-5 text-[#E0551F]" />
              ) : (
                <BookmarkMinus className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySubscriptiononprofile;
