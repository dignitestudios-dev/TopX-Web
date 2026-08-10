import { useState, useEffect } from "react";
import { auth } from "../../assets/export";
import { BiArrowBack } from "react-icons/bi";
import Input from "../common/Input";
import { IoSearch } from "react-icons/io5";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "../common/Button";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { useDispatch, useSelector } from "react-redux";
import {
  getInterests,
  updateInterests,
} from "../../redux/slices/onboarding.slice";

export default function Interests({ handleNext, handlePrevious }) {
  const dispatch = useDispatch();
  const { isLoading, interestsList } = useSelector((state) => state.onboarding);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);

  // =============== FETCH INTERESTS ON PAGE LOAD ===============
  useEffect(() => {
    dispatch(getInterests());
  }, [dispatch]);

  // Set default open category to the 1st category once loaded
  useEffect(() => {
    if (interestsList && interestsList.length > 0 && openCategoryId === null) {
      const firstCat = interestsList[0];
      const firstId = firstCat._id || firstCat.id || "cat-0";
      setOpenCategoryId(firstId);
    }
  }, [interestsList, openCategoryId]);

  // Helper to extract sub-interests array from an interest item
  const getSubList = (item) => {
    if (!item) return [];
    if (Array.isArray(item.subCategories)) return item.subCategories;
    if (Array.isArray(item.subTopics)) return item.subTopics;
    if (Array.isArray(item.subInterests)) return item.subInterests;
    if (Array.isArray(item.children)) return item.children;
    return [];
  };

  // Toggle single open category (Accordion: only 1 open at a time)
  const handleHeaderClick = (catId) => {
    setOpenCategoryId((prev) => (prev === catId ? null : catId));
  };

  // ========== SEARCH FILTER ==========
  const filteredCategories = interestsList?.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const categoryName = typeof item === "string" ? item : item.name || "";
    const categoryMatch = categoryName.toLowerCase().includes(query);
    const subList = getSubList(item);
    const subMatch = subList.some((sub) => {
      const subName = typeof sub === "string" ? sub : sub?.name || "";
      return subName.toLowerCase().includes(query);
    });

    return categoryMatch || subMatch;
  });

  // ========== SELECT & UNSELECT ==========
  const toggleCategory = (category) => {
    if (activeCategories.includes(category)) {
      setActiveCategories(activeCategories.filter((cat) => cat !== category));
    } else {
      setActiveCategories([...activeCategories, category]);
    }
  };

  // ========== NEXT BUTTON CLICK ==========
  const handleNextClick = async () => {
    if (activeCategories.length < 4) {
      return ErrorToast("Please select at least 4 interests.");
    }

    // SEND SELECTED CATEGORIES TO BACKEND
    const res = await dispatch(updateInterests(activeCategories));

    if (res.meta.requestStatus !== "fulfilled") {
      ErrorToast(res.payload || "Failed to save interests");
      return;
    }

    SuccessToast("Interests saved successfully!");
    handleNext();
  };

  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 relative">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
        <BiArrowBack className="cursor-pointer text-xl text-gray-700 hover:text-orange-600" onClick={handlePrevious} />
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-6 max-w-2xl">
        <img src={auth} alt="orange_logo" className="w-[100px]" />

        <div className="flex flex-col text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold">Interests</h2>
          <p className="text-[14px] text-[#565656]">
            Select some topics and we'll fill your home feed with a few things you may like to get you started.
          </p>
          {activeCategories.length > 0 && (
            <span className="text-xs font-semibold text-orange-600 mt-1">
              Selected: {activeCategories.length} (Min 4 required)
            </span>
          )}
        </div>

        <div className="w-full flex flex-col items-center space-y-4">
          {/* SEARCH BAR */}
          <div className="w-full md:w-[400px] relative">
            <Input
              size="md"
              type="text"
              placeholder="Search interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<IoSearch className="text-gray-500" />}
            />
          </div>

          {/* CATEGORIES & SUB-INTERESTS LIST */}
          <div className="w-full space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-orange-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-500 py-6 text-sm">Loading interests...</div>
            ) : !filteredCategories || filteredCategories.length === 0 ? (
              <div className="text-center text-gray-500 py-6 text-sm">No interests found</div>
            ) : (
              filteredCategories.map((item, index) => {
                const catName = typeof item === "string" ? item : item.name || `Interest ${index + 1}`;
                const catId = item._id || item.id || `cat-${index}`;
                const subList = getSubList(item);
                const hasSubs = subList.length > 0;
                const isCatSelected = activeCategories.includes(catName);
                const isExpanded = openCategoryId === catId;

                return (
                  <div
                    key={catId}
                    className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 transition-all duration-200"
                  >
                    {/* Category Header Row */}
                    <div
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => handleHeaderClick(catId)}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(catName);
                        }}
                        className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center gap-2 ${
                          isCatSelected
                            ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                            : "bg-white text-gray-800 border border-gray-300 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        <span>{catName}</span>
                      </button>

                      {hasSubs && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-200/50 transition-colors">
                          <span>{subList.length} sub-interests</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </div>

                    {/* Sub-interests Pills Panel */}
                    {hasSubs && isExpanded && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/60 animate-fadeIn">
                        {subList.map((sub, subIdx) => {
                          const subName = typeof sub === "string" ? sub : sub?.name || "";
                          if (!subName) return null;
                          const isSubSelected = activeCategories.includes(subName);

                          return (
                            <button
                              key={subIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(subName);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                isSubSelected
                                  ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                              }`}
                            >
                              {subName}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* NEXT BUTTON */}
          <Button
            onClick={handleNextClick}
            size="full"
            variant="orange"
            disabled={isLoading}
            className="w-full flex justify-center items-center"
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
