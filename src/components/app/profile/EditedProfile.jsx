import { IoSearch } from "react-icons/io5";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { BiArrowBack } from "react-icons/bi";
import { auth } from "../../../assets/export";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

export default function EditedProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [bio, setBio] = useState(user.bio || "");
  const [activeCategories, setActiveCategories] = useState([]);
  const [preview, setPreview] = useState(user.profilePicture || "");

  console.log(user, "user123");

  const categories = [
    "Funny", "Jokes", "Memes", "Interesting", "Be amazed", "Fails", "Weird",
    "Confessions & stories", "Opinions", "Lifehacks", "Oddly satisfying",
    "Heartwarming", "Animals", "Learn something", "Space", "History", "Nature",
    "Science", "News", "Tech", "Business", "Football", "Basketball", "Cricket",
    "Volleyball", "Makeup", "Jewelry", "Clothes", "Fashion", "Skincare",
  ];

  // ✅ Auto-select API interests (lowercase)
  useEffect(() => {
    if (user?.interests?.length > 0) {
      setActiveCategories(user.interests.map(i => i.toLowerCase()));
    }
  }, [user]);

  // Toggle category with lowercase for comparison
  const toggleCategory = (category) => {
    const c = category.toLowerCase();

    if (activeCategories.includes(c)) {
      setActiveCategories(activeCategories.filter(cat => cat !== c));
    } else {
      setActiveCategories([...activeCategories, c]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-[12px] p-4">
      <button onClick={() => navigate(-1)} className=" items-center gap-2 bg-orange-600 w-6 h-6 flex justify-center rounded-full"><BiArrowBack className="text-white" /></button>

      {/* Profile Picture */}
      <Input
        size="md"
        type="file"
        placeholder="Upload Profile Picture"
        onChange={handleImageChange}
        label=""
        preview={preview}
        fileClassName="w-[100px] h-[100px]"
      />

      {/* Name + Email */}
      <div className="w-full flex gap-4">
        <Input
          size="md"
          type="text"
          placeholder="Text goes here"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label="Name"
        />
        <Input
          size="md"
          type="text"
          placeholder="Text goes here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Username"
        />
      </div>

      {/* Bio */}
      <div className="w-full flex flex-col gap-2 py-3">
        <label>My Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Text goes here"
          className="w-full h-[200px] border border-gray-300 rounded-[12px] p-2"
        />
      </div>

      {/* Interests */}
      <div className="w-full flex flex-col px-4 space-y-4">
        <h2 className="text-[18px] font-[500] text-[#000000]">Interests</h2>

        <div className="flex flex-wrap gap-4 w-full">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => toggleCategory(category)}
              className={`h-[38px] px-5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategories.includes(category.toLowerCase())
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
