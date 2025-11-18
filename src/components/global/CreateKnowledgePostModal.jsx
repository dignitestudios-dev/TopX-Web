import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const CreateKnowledgePostModal = ({ onClose, selectedPageId, selectedSubTopics }) => {
  const [text, setText] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [selectedBg, setSelectedBg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [postStyle, setPostStyle] = useState("Classic");
  const [fontSize, setFontSize] = useState("base");
  const [isBold, setIsBold] = useState(false);

  console.log(selectedPageId, "selectedPageId");
  console.log(selectedSubTopics, "selectedSubTopics");

  const backgrounds = [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=600",
    "https://images.unsplash.com/photo-1503264116251-35a269479413?w=600",
    "https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=600",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR09h-AQzQLgtKNVX9uxoZBo5M1sgZyReubaA&s",
    "https://static.vecteezy.com/system/resources/previews/015/643/184/non_2x/red-gradient-background-with-abstract-blank-soft-and-smooth-texture-vector.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVdK4YrG6wJ_RhixzGTGUwSintbfbEXdOEOw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeUG4UjTJTt9xbJocbiVEjc3qNqtX6PjqA2A&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpCHZfpx-31rddBoo6TwIsWm6rjqL8MjVXTUnnZoiiqWdPx8fmF92gLpxQDnE5tPbdwT8&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA0FPDsvDXod5kiIAhNLhRA71ei5YtcVJ1QA&s",
  ];

  const handlePost = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowPreview(false);
      setText("");
      setMainCategory("");
      setSubCategory("");
      setSelectedBg(null);
      onClose();
    }, 2000);
  };

  return (
    <>
      {/* 1️⃣ Create Post Modal */}
      {!showPreview && !showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[380px] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-[17px] font-semibold">Create Knowledge Post</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 max-h-[560px] overflow-y-auto">
              <label className="block text-sm text-gray-700 mb-1">Body Text</label>
              <textarea
                placeholder="Text goes here"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 resize-none focus:ring-1 focus:ring-orange-500 outline-none h-24"
              />

              <label className="block text-sm text-gray-700 mb-1">Choose Category</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-1 focus:ring-orange-500 outline-none"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
              >
                <option value="">Main Category</option>
                <option value="Finance">Finance</option>
                <option value="Technology">Technology</option>
                <option value="Health">Health</option>
              </select>

              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-1 focus:ring-orange-500 outline-none"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">Sub Category</option>
                <option value="Investments">Investments</option>
                <option value="Wellness">Wellness</option>
                <option value="Innovation">Innovation</option>
              </select>

              <label className="block text-sm text-gray-700 mb-2">Select Background</label>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {backgrounds.map((bg, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedBg(bg)}
                    className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedBg === bg ? "border-orange-500" : "border-gray-300"
                      }`}
                  >
                    <img src={bg} alt="bg" className="w-full h-14 object-cover" />
                  </div>
                ))}
                <div className="border-2 border-dashed border-orange-300 flex items-center justify-center rounded-lg cursor-pointer h-14">
                  <Plus className="text-orange-400" size={20} />
                </div>
              </div>

              <button
                onClick={() => setShowPreview(true)}
                disabled={!text || !selectedBg || !mainCategory}
                className={`w-full py-2 rounded-lg font-semibold transition-all ${!text || !selectedBg || !mainCategory
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ Preview Modal */}
      {showPreview && !showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[480px] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-[17px] font-semibold">Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X size={22} />
              </button>
            </div>

            {/* Preview Area */}
            <div className="p-5">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center text-white text-lg font-semibold leading-snug p-12 mb-5 min-h-[300px]"
                style={{
                  backgroundImage: `url(${selectedBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="text-center">
                  <span className="bg-white/30 text-white text-xs px-3 py-1 rounded-full inline-block">
                    {mainCategory}
                  </span>
                  <p className="mt-3 drop-shadow-md text-sm">{text}</p>
                </div>
              </div>

              {/* Bottom Style Bar */}
              <div className="flex justify-between items-center border-t pt-4 mb-4">
                <div className="flex gap-3 text-sm font-medium text-gray-600">
                  <button className="text-orange-500 font-semibold hover:text-orange-600">Classic</button>
                  <button className="hover:text-orange-500 transition">Poster</button>
                  <button className="hover:text-orange-500 transition">Bubble</button>
                </div>

                <div className="flex gap-2">
                  <button className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Aa</button>
                  <button className="bg-gray-100 px-3 py-1 rounded font-bold hover:bg-gray-200">B</button>
                </div>
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-all"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
          <div className="bg-white w-[300px] rounded-2xl shadow-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-500 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Post Created!</h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Your post has been posted successfully.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateKnowledgePostModal;