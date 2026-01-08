import React, { useState } from "react";
import { X, Plus, ChevronRight } from "lucide-react";
import PostStoryModal from "./PostStoryModal";
import UploadPostStory from "./UploadPostStory";
import SuccessModal from "./SuccessModal";
import PageCreateModal from "./PageCreateModal";
import LiveStreaming from "./LiveStreaming";

export default function CreatePostModal({ setIsOpen, isOpen }) {
  const [selectedOption, setSelectedOption] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState(null);
  const options = [
    { label: "Create Post", icon: Plus },
    { label: "Create Story", icon: Plus },
    { label: "Create New Page", icon: Plus },
    { label: "Start Live Streaming (Go Live)", icon: Plus },
  ];

  return (
    <div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-[600] text-[#181818]">
                    Select Type
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

              

                <div className="space-y-4">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedOption(true);
                        setSelectedType(option.label);
                        setTitle(option.label);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-[#F6F6F6] rounded-xl hover:bg-[#ECECEC] transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center bg-[#DE4B1214] rounded-full">
                          <option.icon className="w-5 h-5 text-[#DE4B12]" />
                        </div>
                        <span className="text-[#181818] font-medium">
                          {option.label}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#181818] group-hover:text-[#DE4B12] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {(selectedType === "Create Post" || selectedType === "Create Story") && (
        <PostStoryModal
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          title={title}
          setSelectedType={setSelectedType}
        />
      )}
      {(selectedType?.type === "upload Post" ||
        selectedType?.type === "upload story") && (
        <UploadPostStory
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          title={title}
          setSelectedType={setSelectedType}
          selectedPages={selectedType.pages} // 📌 IDs yahan aa rahi hain
        />
      )}

      {selectedType === "Done" && title === "Create Post" && (
        <SuccessModal
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          title={"Post Created!"}
        />
      )}
      {selectedType === "Create New Page" && (
        <PageCreateModal
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          setSelectedType={setSelectedType}
        />
      )}
      {selectedType === "Page done" && title === "Create New Page" && (
        <SuccessModal
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          title={"Page Created!"}
        />
      )}
      {selectedType === "Start Live Streaming (Go Live)" && (
        <LiveStreaming
          setIsOpen={setSelectedOption}
          isOpen={selectedOption}
          setSelectedType={setSelectedType}
          title={title}
        />
      )}
    </div>
  );
}
