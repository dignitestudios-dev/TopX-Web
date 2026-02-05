import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";

const PrivatePostModal = ({ onClose, post }) => {
  const navigate = useNavigate("");
  const handleRedirect = () => {
    navigate("/other-profile", {
      state: { pageId: post?.page?._id, id: post?.author },
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 text-center">
        {/* Alert Icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-orange-100 p-3 rounded-full">
            <AlertTriangle className="text-orange-500 w-6 h-6" />
          </div>
        </div>

        {/* Title & Text */}
        <h2 className="text-lg font-semibold text-gray-900">Private Post</h2>
        <p className="text-sm capitalize text-gray-600 mt-1 mb-5">
          this post is only for followers. you need to follow this page to view
          post
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 capitalize bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleRedirect}
            className="capitalize flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Go to page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivatePostModal;
