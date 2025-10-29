import React from "react";
import { MoreHorizontal, ChevronRight, Layers } from "lucide-react";
import { ballone, ballthree, balltwo } from "../../assets/export";

const MySubscription = () => {
  const subscriptions = [
    { title: "My Basketball" },
    { title: "My Fitness" },
    { title: "My Cooking" },
  ];

  return (
    <div className="max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-[500] text-gray-900">My Subscription</h3>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        {subscriptions.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
          >
            <div className="flex items-start gap-3">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {item.title}
                  <Layers className="w-4 h-4 text-gray-500" />
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-2">
                    <img
                      src={ballone}
                      alt=""
                      className="w-5 h-5 rounded-full border border-white"
                    />
                    <img
                      src={balltwo}
                      alt=""
                      className="w-5 h-5 rounded-full border border-white"
                    />
                    <img
                      src={ballone}
                      alt=""
                      className="w-5 h-5 rounded-full border border-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium"><span className="text-black font-[600]">50+</span> Pages</p>
                </div>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 text-black cursor-pointer font-semibold text-sm">
        <span>View All</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default MySubscription;
