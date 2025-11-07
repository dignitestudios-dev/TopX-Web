import { Check, CheckCircle, SquareCheck } from "lucide-react";
import React from "react";
import { FaCheckSquare } from "react-icons/fa";


const Donemodal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-lg shadow-xl flex flex-col items-center p-5">
        <div className="flex items-center justify-center bg-white w-12 h-12 mb-4">
          <FaCheckSquare className="text-green-500" size={40} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Story Sent</h2>

        <button
          onClick={onClose}
          className="mt-4 bg-green-500 text-white py-2 px-6 rounded-full hover:bg-green-600 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Donemodal;
