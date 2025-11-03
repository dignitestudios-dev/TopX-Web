import { useState } from "react";
import { X, Search } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";


export default function PostStoryModal({ setIsOpen, isOpen, title ,setSelectedType }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState([1, 2]);
  const [preview, setPreview] = useState(null);
  const pages = [
    { id: 0, name: "Create New Page", isNew: true, image: null },
    { id: 1, name: "Mike's Basketball", image: "🏀" },
    { id: 2, name: "Mike's Fitness", image: "💪" },
    { id: 3, name: "Mike's Opinion", image: "💭" },
    { id: 4, name: "Mike's Cooking", image: "👨‍🍳" },
  ];

  const togglePageSelection = (pageId) => {
    if (pageId === 0) return;
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    console.log("Selected pages:", selectedPages);
    
      setSelectedType("upload Post")
 
    // setIsOpen(false);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 text-wrap">
                  {title}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-orange-600 "
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-5">
                <div className="relative mb-4">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    iconLeft={<Search />}
                    size="md"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto mb-4 pr-2">
                  {filteredPages.map((page) => (
                    <div
                      key={page.id}
                      onClick={() => togglePageSelection(page.id)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                        page.isNew ? "hover:bg-gray-50" : "hover:bg-orange-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {page.isNew ? (
                          <Input
                            type="file"
                            placeholder="Page Name"
                            value={page.name}
                            preview={preview}
                            size="sm"
                            fileClassName="w-10 h-10 "
                            onChange={handleImageChange}
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-full text-2xl">
                            {page.image}
                          </div>
                        )}
                        <span className="text-gray-900 font-medium">
                          {page.name}
                        </span>
                      </div>
                      {!page.isNew && (
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            selectedPages.includes(page.id)
                              ? "bg-orange-500 border-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPages.includes(page.id) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full flex  justify-center "
                  variant="orange"
                  size="lg"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

    

      {/* <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #fed7aa;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #fdba74;
        }
      `}</style> */}
    </div>
  );
}
