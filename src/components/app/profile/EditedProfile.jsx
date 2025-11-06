import { IoSearch } from "react-icons/io5";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { BiArrowBack } from "react-icons/bi";
import { auth } from "../../../assets/export";
import { useState } from "react";

export default function EditedProfile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [preview, setPreview] = useState(null);
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
    "Volleyball",
    "Makeup",
    "Jewelry",
    "Clothes",
    "Fashion",
    "Skincare",
  ];

  const toggleCategory = (category) => {
    if (activeCategories.includes(category)) {
      setActiveCategories(activeCategories.filter((cat) => cat !== category));
    } else {
      setActiveCategories([...activeCategories, category]);
    }
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
    <div className="w-full flex flex-col gap-4 bg-white rounded-[12px] p-4">
      <Input
        size="md"
        type="file"
        placeholder="Upload Profile Picture"
        value={searchQuery}
        onChange={handleImageChange}
        label=""
        preview={preview}
        fileClassName="w-[100px] h-[100px] "
      />
      <div className="w-full flex  gap-4 ">
        <Input
          size="md"
          type="text"
          placeholder="Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label="Name"
        />
        <Input
          size="md"
          type="email"
          placeholder="Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label="Email"
        />
      </div>
      <div className="w-full flex flex-col gap-2 py-3">
        <label>My Bio</label>
        <textarea
          placeholder="My Bio"
          className="w-full h-[200px] border border-gray-300 rounded-[12px] p-2"
        />
      </div>
      <div className="w-full flex flex-col px-4 space-y-4">
        <h2 className="text-[18px] font-[500] text-[#000000]">Interests</h2>
        <div className="flex flex-wrap gap-4 w-full">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => toggleCategory(category)}
              className={`h-[38px] px-5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${activeCategories.includes(category)
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        <Button
          size="full"
          variant="orange"
          className="w-full flex items-center justify-center"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
