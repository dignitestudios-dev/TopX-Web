import React, { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";
import { SuccessToast } from "./Toaster";

export default function SharePostModal({
  options = [],
  setSharepost,
  selectedOption,
  setSelectedOption,
  post,
}) {
  const [copied, setCopied] = useState(false);

  const postId = post?._id || post?.id || "";
  const postText =
    post?.text || post?.bodyText || post?.content || "Check out this post on TopX!";
  const shareUrl = postId
    ? `${window.location.origin}/post/${postId}`
    : window.location.href;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      SuccessToast("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleExternalShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(postText);

    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "native":
        if (navigator.share) {
          navigator
            .share({
              title: "TopX Post",
              text: postText,
              url: shareUrl,
            })
            .catch((err) => console.log("Share cancelled", err));
          return;
        }
        handleCopyLink();
        return;
      default:
        return;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[17px] font-bold text-gray-900">Share Post</h2>
          <button
            type="button"
            onClick={() => setSharepost(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Internal Options List */}
        <div className="flex flex-col py-2">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-orange-50/50 transition-colors"
              onClick={() => {
                setSelectedOption(option);
                setSharepost(false);
              }}
            >
              <span className="text-[15px] font-medium text-gray-800">
                {option}
              </span>
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition ${
                  selectedOption === option
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === option && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </span>
            </label>
          ))}
        </div>

        {/* External Sharing Section */}
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Share Externally
            </p>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                type="button"
                onClick={() => handleExternalShare("native")}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <Share2 size={12} /> More
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Link"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white hover:bg-gray-100 transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-700 transition">
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} />
                )}
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleExternalShare("whatsapp")}
              title="WhatsApp"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white hover:bg-green-50 transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-green-500 group-hover:bg-green-600 flex items-center justify-center text-white transition shadow-xs">
                <FaWhatsapp size={18} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                WhatsApp
              </span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={() => handleExternalShare("twitter")}
              title="X (Twitter)"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white hover:bg-gray-100 transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-black group-hover:bg-gray-900 flex items-center justify-center text-white transition shadow-xs">
                <FaXTwitter size={16} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">X</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleExternalShare("facebook")}
              title="Facebook"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white hover:bg-blue-50 transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white transition shadow-xs">
                <FaFacebookF size={16} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                Facebook
              </span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleExternalShare("linkedin")}
              title="LinkedIn"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white hover:bg-blue-50 transition border border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#0A66C2] group-hover:bg-[#084e96] flex items-center justify-center text-white transition shadow-xs">
                <FaLinkedinIn size={16} />
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                LinkedIn
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
