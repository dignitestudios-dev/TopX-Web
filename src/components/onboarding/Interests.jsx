import { useState } from "react";
import { auth } from "../../assets/export";
import { BiArrowBack } from "react-icons/bi";
import Input from "../common/Input";
import { IoSearch } from "react-icons/io5";
import Button from "../common/Button";

export default function Interests({ handleNext, handlePrevious }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const categories = [
      "Funny",
      "Jokes",
      "Memes",
      "Interesting",
      "Be amazed",
      "Fails",
      "Weird",
      "Confessions & stories",
   
      "Opinions",
      "Lifehacks",
      "Oddly satisfying",
      "Heartwarming",
      "Animals",
      "Learn something",
      "Space",
   
      "History",
      "Nature",
      "Science",
      "News",
      "Tech",
      "Business",
      "Football",
      "Basketball",
      "Cricket",
   
    "Volleyball", "Makeup", "Jewelry", "Clothes", "Fashion", "Skincare"
  ];

  const toggleCategory = (category) => {
    if (activeCategories.includes(category)) {
      setActiveCategories(activeCategories.filter((cat) => cat !== category));
    } else {
      setActiveCategories([...activeCategories, category]);
    }
  };
  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 relative">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
      <BiArrowBack onClick={handlePrevious} />
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-8">
        <img src={auth} alt="orange_logo" className="w-[100px]" />
        <div className=" flex flex-col  justify-center items-center text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold ">
           Interests
          </h2>
          <p className="text-[14px] font-normal text-center leading-[27px] text-[#565656]">
            Select some topics and we’ll fill your home feed with a few things <br /> you may like to get you started
          </p>
        </div>


<div className="w-full flex flex-col items-center justify-center px-4 space-y-4">
          
        <div className="w-full md:w-[400px] relative">
          
          <Input
          size="md"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<IoSearch  className="text-gray-500"/>}
           
          />
        </div>

        {/* Category Buttons */}
        <div className="space-y-3 flex flex-wrap gap-2 w-full text-center justify-center ">
          {categories.map((category, index) => (
            
             
                <button
                  key={index}
                  onClick={() => toggleCategory(category)}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeCategories.includes(category)
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              
            
          ))}
            </div>
            <Button onClick={handleNext} size="full" variant="orange" className="w-full flex items-center justify-center">Next</Button> 
            </div>
      </div>
    </div>
  );
}
