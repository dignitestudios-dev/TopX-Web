// SuggestionsPagesGlobal.js
import { TrendingUp } from "lucide-react";
import React from "react";
import { FaChevronRight } from "react-icons/fa6";
import { Link } from "react-router";

const SuggestionsPagesGlobal = ({}) => {

    const trending = [
    {
      title: "Justin's Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
      title: "Justin's Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
  ];
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
      {/* Header */}
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <span className="text-gray-900"> Suggestions based on your Interests/Activity</span>
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
                src={item.img || "default-img.jpg"} // Change to dynamic img source
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex gap-2">
                  <p className="font-[400] text-[14px]"> {item.title}</p>
                  <img src="notes-icon.png" alt="" /> {/* Change icon */}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-2 leading-snug">{item.desc}</p>

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
                <p className="text-xs text-gray-600 font-medium">50+ Follows</p>
              </div>

              <div>
             
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link to="/trending">
        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
          <span>View All</span>
          <FaChevronRight color="orange" />
        </div>
      </Link>
    </div>
  );
};

export default SuggestionsPagesGlobal;
