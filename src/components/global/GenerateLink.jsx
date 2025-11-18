import { useState } from "react";
import Modal from "react-modal";

export default function GenerateLink({ isOpen, onRequestClose }) {
  
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://www.topX.com/invite/alex-smith";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(false)}
      ariaHideApp={false}
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 outline-none relative"
    >
      {/* Close Button */}
      <button
        onClick={() => onRequestClose(false)}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
      >
        X
      </button>

      {/* Heading */}
      <h1 className="text-[20px] font-[600] text-gray-900 mb-6">
        Your Invite Link Is Ready
      </h1>

      {/* Description */}
      <p className="text-[16px] font-[400] text-gray-700 mb-8">
        Share it with your friends — when they open it, they’ll see your name
        as the one inviting them.
      </p>

      {/* Link Box */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <p className="text-[#181818CC] text-[16px] font-[400]">
          {inviteLink}
        </p>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-[14px] h-[48px] rounded-[12px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </Modal>
  );
}
