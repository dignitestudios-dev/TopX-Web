import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyKnowledgePages } from "../../../redux/slices/knowledgepost.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function PageCategorySelector({ onNext, onClose, heading }) {
  const dispatch = useDispatch();
  const { knowledgePages } = useSelector((state) => state.knowledgepost);

  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [newSubTopicInput, setNewSubTopicInput] = useState("");
  const [customSubTopics, setCustomSubTopics] = useState({});

  useEffect(() => {
    dispatch(fetchMyKnowledgePages({ page: 1, limit: 100 }));
  }, [dispatch]);

  // FILTER SEARCH
  const filteredPages =
    knowledgePages?.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    ) || [];

  // SUBTOPIC TOGGLE
  const toggleSubTopic = (topic) => {
    if (selectedSubTopics.includes(topic)) {
      setSelectedSubTopics(selectedSubTopics.filter((t) => t !== topic));
    } else {
      // Allow single or multi select
      setSelectedSubTopics([topic]);
    }
  };

  // ADD NEW SUBCATEGORY ON THE FLY
  const handleAddNewSubTopic = () => {
    const trimmed = (newSubTopicInput || "").trim();
    if (!trimmed) return;
    if (!selectedPageId) {
      ErrorToast("Please select a page first!");
      return;
    }

    setCustomSubTopics((prev) => {
      const existing = prev[selectedPageId] || [];
      if (existing.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return { ...prev, [selectedPageId]: [...existing, trimmed] };
    });

    setSelectedSubTopics([trimmed]);
    setNewSubTopicInput("");
    SuccessToast(`Subcategory "${trimmed}" added and selected`);
  };

  // VALIDATION BEFORE NEXT (Subcategory is OPTIONAL)
  const handleNext = () => {
    if (!selectedPageId) {
      ErrorToast("Please select a page!");
      return;
    }

    // Pass data to parent and let parent handle the modal opening
    onNext({ pageId: selectedPageId, subTopics: selectedSubTopics });
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      {heading && (
        <h2 className="text-center text-[20px] font-semibold mt-1">
          {heading}
        </h2>
      )}

      {/* Search Field */}
      <div className="relative">
        <Search className="absolute top-7 left-4 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search Knowledge Page"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-[#f5f5f5] mt-5 rounded-full pl-12 pr-4 py-2 outline-none text-[15px]"
        />
      </div>

      {/* Page List */}
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {filteredPages?.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            No pages available now
          </p>
        ) : (
          filteredPages.map((page) => {
            const isSelected = selectedPageId === page._id;
            const extraSubs = customSubTopics[page._id] || [];
            const allSubs = [
              ...(Array.isArray(page.subTopic) ? page.subTopic : []),
              ...extraSubs,
            ];
            // Remove duplicates case-insensitively
            const uniqueSubs = Array.from(
              new Map(allSubs.map((s) => [String(s).toLowerCase(), s])).values(),
            );

            return (
              <div
                key={page._id}
                className={`space-y-2 p-3 rounded-xl border transition ${isSelected
                    ? "border-orange-400 bg-orange-50/20"
                    : "border-gray-100 hover:border-gray-200"
                  }`}
              >
                {/* ROW — Page */}
                <button
                  type="button"
                  className="flex w-full justify-between items-center cursor-pointer text-left"
                  onClick={() => {
                    setSelectedPageId(page._id);
                    setSelectedSubTopics([]);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* IMAGE */}
                    <img
                      src={
                        page.image
                          ? page.image
                          : "https://i.pinimg.com/736x/9d/1c/5f/9d1c5f14116e7ac62798f733847ac333.jpg"
                      }
                      className="w-10 h-10 rounded-full object-cover bg-gray-200"
                      alt={page.name}
                    />

                    <div>
                      {/* NAME */}
                      <p className="text-[16px] font-medium text-gray-900">
                        {page.name}
                      </p>

                      {/* ABOUT */}
                      {page.about && (
                        <p className="text-gray-500 text-[13px] leading-tight line-clamp-1">
                          {page.about}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RADIO BUTTON */}
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="knowledgePageSelector"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedPageId(page._id);
                        setSelectedSubTopics([]);
                      }}
                      className="sr-only"
                    />
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-orange-500" : "border-gray-400"
                        }`}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 bg-orange-500 rounded-full" />
                      )}
                    </span>
                  </div>
                </button>

                {/* SUB TOPICS & CREATE NEW SUBCATEGORY */}
                {isSelected && (
                  <div className="pt-2 border-t border-gray-100 mt-2 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Select Subcategory (Optional):
                    </p>

                    {uniqueSubs.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {uniqueSubs.map((topic, idx) => {
                          const isSubSelected = selectedSubTopics.includes(topic);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleSubTopic(topic)}
                              className={`px-3 py-1 text-xs rounded-full cursor-pointer transition font-medium border ${isSubSelected
                                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                                }`}
                            >
                              {isSubSelected ? `✓ ${topic}` : topic}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Create Subcategory Input */}
                    {/* <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="+ Create new subcategory"
                        value={newSubTopicInput}
                        onChange={(e) => setNewSubTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewSubTopic();
                          }
                        }}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-full outline-none focus:border-orange-500 flex-1 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewSubTopic}
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-orange-600 transition flex items-center gap-1"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div> */}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* NEXT BUTTON (Enabled as long as a page is selected) */}
      <button
        type="button"
        className="w-full bg-orange-500 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition"
        disabled={filteredPages.length === 0 || !selectedPageId}
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
}
