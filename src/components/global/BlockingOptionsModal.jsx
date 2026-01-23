import { useState } from "react";
import { X } from "lucide-react";

const BlockingOptionsModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  if (!isOpen) return null;
  const [option, setOption] = useState("comment");

  const handleSubmit = () => {
    onSubmit(option);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-2xl shadow-xl p-5 relative">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-center mb-6">
          Blocking Options
        </h2>
        {/* <p className="text-xs text-gray-600 text-left mb-4">
          You can manage blocked users anytime in your settings.
        </p> */}

        {/* Option 1 */}
        <label className="flex gap-2.5 mb-3.5 cursor-pointer">
          <input
            type="radio"
            name="block"
            checked={option === "comment"}
            onChange={() => setOption("comment")}
            className="accent-orange-500 mt-1 scale-125"
          />
          <div>
            <strong className="text-sm text-gray-900 block">
              Block from Commenting
            </strong>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              (The user can still view your Topic Page but cannot comment on any
              posts.)
            </p>
          </div>
        </label>

        {/* Option 2 */}
        <label className="flex gap-2.5 mb-3.5 cursor-pointer">
          <input
            type="radio"
            name="block"
            checked={option === "view"}
            onChange={() => setOption("view")}
            className="accent-orange-500 mt-1 scale-125"
          />
          <div>
            <strong className="text-sm text-gray-900 block">
              Block from Viewing
            </strong>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              (The user cannot see your Topic Page or any content you post
              there.)
            </p>
          </div>
        </label>

        {/* Option 3 */}
        <label className="flex gap-2.5 mb-3.5 cursor-pointer">
          <input
            type="radio"
            name="block"
            checked={option === "all"}
            onChange={() => setOption("all")}
            className="accent-orange-500 mt-1 scale-125"
          />
          <div>
            <strong className="text-sm text-gray-900 block">
              Block from Profile & All Topic Pages
            </strong>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              (The user cannot view your profile or any of your Topic Pages and
              is fully restricted from interacting with you.)
            </p>
          </div>
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white border-none rounded-lg py-3 text-sm font-semibold cursor-pointer mt-2.5 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default BlockingOptionsModal;

