import { X } from "lucide-react";
import React from "react";

export default function SharePostModal({
  options,
  setSharepost,
  selectedOption,
  setSelectedOption,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Share Post With</h2>
          <button
            onClick={() => setSharepost(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col py-3">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSelectedOption(option);
                setSharepost(false);
              }}
            >
              <span className="text-[15px] text-gray-800">{option}</span>
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${
                  selectedOption === option
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === option && (
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
