import React, { useState } from "react";
import { Layers, BookmarkMinus } from "lucide-react";
import { FaBookmark } from "react-icons/fa6";
import { ballone, balltwo, nofound } from "../../assets/export";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { updateSavedCollections } from "../../redux/slices/collection.slice";

const MySubscriptiononprofile = ({ userCollections, toggleBookmark }) => {
  const [bookmarked, setBookmarked] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="max-w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Subscription List */}
      <div className="space-y-4">
        {userCollections?.length === 0 ? (
           <div className="text-center pt-10 pb-10">
            <div className=" flex justify-center">
              <img src={nofound} height={200} width={200} alt="" />
            </div>
            <p className="font-bold pt-4 text-black">
              No Collections

            </p>
          </div>
        ) : (
          userCollections?.map((item) => (
            <div
              key={item._id || item.id}
              className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div>
                  <p
                    className="font-medium text-gray-900 flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      navigate("/subscriptions-category", {
                        state: { id: item._id || item.id },
                      })
                    }
                  >
                    {item.name}
                    <Layers className="w-4 h-4 text-gray-500" />
                  </p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default MySubscriptiononprofile;
