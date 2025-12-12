import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyPages,
} from "../../../redux/slices/pages.slice";
import { ErrorToast } from "../../global/Toaster";

export default function PostStoryModal({
  setIsOpen,
  isOpen,
  title,
  setSelectedType,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const [selectedPages, setSelectedPages] = useState([]);
  const [preview, setPreview] = useState(null);

  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Combine Create New Page with API data
  const pages = [
    { _id: 0, name: "Create New Page", isNew: true, image: null },
    ...(myPages || []),
  ];

  const togglePageSelection = (pageId) => {
    if (pageId === 0) return;
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const filteredPages = myPages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (selectedPages.length > 2) {
      ErrorToast("You can select only 2 pages");
      return;
    }

    if (selectedPages.length === 0) {
      ErrorToast("Please select at least 1 page");
      return;
    }

    setSelectedType({
      type: "upload story",
      pages: selectedPages,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
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
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 text-wrap">
                  {title}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-orange-600"
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
                  {pagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500">Loading pages...</p>
                    </div>
                  ) : filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <div
                        key={page._id}
                        onClick={() => togglePageSelection(page._id)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                          page.isNew ? "hover:bg-gray-50" : "hover:bg-orange-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {page.isNew ? (
                            <Input
                              type="file"
                              placeholder="Page Name"
                              preview={preview}
                              size="sm"
                              fileClassName="w-10 h-10"
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                          ) : (
                            <img
                              src={page.image}
                              alt={page.name}
                              className="w-10 h-10 rounded-full object-cover bg-gray-200"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          )}
                          <span className="text-gray-900 font-medium text-sm">
                            {page.name}
                          </span>
                        </div>
                        {!page.isNew && (
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              selectedPages.includes(page._id)
                                ? "bg-orange-500 border-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPages.includes(page._id) && (
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
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500">No pages found</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full flex justify-center"
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
    </div>
  );
}
