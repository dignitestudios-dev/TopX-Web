import { useState, useEffect } from "react";
import { auth } from "../../assets/export";
import { BiArrowBack } from "react-icons/bi";
import Input from "../common/Input";
import { IoSearch } from "react-icons/io5";
import Button from "../common/Button";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { useDispatch, useSelector } from "react-redux";
import { getInterests, updateInterests } from "../../redux/slices/onboarding.slice";

export default function Interests({ handleNext, handlePrevious }) {
  const dispatch = useDispatch();
  const { isLoading, interestsList } = useSelector((state) => state.onboarding);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  console.log("Interests:", interestsList);


  // =============== FETCH INTERESTS ON PAGE LOAD ===============
  useEffect(() => {
    dispatch(getInterests());
  }, []);

  // ========== SEARCH FILTER ==========
const filteredCategories = interestsList?.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);



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
      return ErrorToast("Please select at least 4 categories.");
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
        <BiArrowBack onClick={handlePrevious} />
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-8">
        <img src={auth} alt="orange_logo" className="w-[100px]" />

        <div className="flex flex-col text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold">Interests</h2>
          <p className="text-[14px] text-[#565656]">
            Select some topics and we'll fill your home feed witha few things you may like to get you started.
          </p>
        </div>

        <div className="w-full flex flex-col items-center px-4 space-y-4">
          {/* SEARCH BAR */}
          <div className="w-full md:w-[400px] relative">
            <Input
              size="md"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<IoSearch className="text-gray-500" />}
            />
          </div>

          {/* CATEGORY BUTTONS */}
          <div className="flex flex-wrap gap-2 w-full">
            {filteredCategories?.map((item, index) => {
              const title = item.name; // ALWAYS STRING
              return (
                <button
                  key={index}
                  onClick={() => toggleCategory(title)}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${activeCategories.includes(title)
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {title}
                </button>
              );
            })}

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
