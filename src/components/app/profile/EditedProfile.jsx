import { IoSearch } from "react-icons/io5";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { BiArrowBack } from "react-icons/bi";
import { auth } from "../../../assets/export";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  getAllUserData,
  updateProfile,
} from "../../../redux/slices/auth.slice";
import { SuccessToast } from "../../global/Toaster";
import { getInterests } from "../../../redux/slices/onboarding.slice";

export default function EditedProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    updateProfileLoading,
    updateProfileSuccess,
    updateProfileError,
    allUserData,
  } = useSelector((state) => state.auth);
  const [name, setName] = useState(allUserData?.name || "");
  const [username, setUsername] = useState(allUserData?.username || "");
  const [email, setEmail] = useState(allUserData?.email || "");
  const [bio, setBio] = useState(allUserData?.bio || "");
  const [preview, setPreview] = useState(allUserData?.profilePicture || "");
  const [profileFile, setProfileFile] = useState(null);
  const [activeCategories, setActiveCategories] = useState([]);

  const { isLoading, interestsList } = useSelector((state) => state.onboarding);

  useEffect(() => {
    dispatch(getAllUserData());
  }, []);

  useEffect(() => {
    dispatch(getInterests());
  }, []);

  // Auto-select API interests
  useEffect(() => {
    if (allUserData?.interests?.length > 0) {
      // Convert all interests to lowercase for uniformity
      setActiveCategories(allUserData.interests.map((i) => i));
    }
  }, [allUserData]);

  // Toggle category
  const toggleCategory = (category) => {
    const c = category; // make category lowercase to match with activeCategories
    if (activeCategories.includes(c)) {
      setActiveCategories(activeCategories.filter((cat) => cat !== c));
    } else {
      setActiveCategories([...activeCategories, c]);
    }
  };

  useEffect(() => {
    if (allUserData?.interests?.length > 0) {
      setActiveCategories(allUserData.interests);
    }
  }, [allUserData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Add all fields to FormData
    formData.append("name", name);
    formData.append("bio", bio);
    console.log(activeCategories, "active categories");
    // Add each valid interest to FormData
    activeCategories.forEach((interest) => {
      formData.append("interests", interest);
    });

    // Fix: Backend expects existingProfilePicture when no new file
    if (profileFile) {
      // New image selected → send in profilePicture
      formData.append("profilePicture", profileFile);
    } else {
      // No new image → preserve old image
      formData.append(
        "existingProfilePicture",
        allUserData?.profilePicture || ""
      );
    }

    // Dispatch the updateProfile thunk
    const result = await dispatch(updateProfile(formData));

    if (result.type === "auth/updateProfile/fulfilled") {
      SuccessToast("Profile Successfully Updated");
    }
  };

  useEffect(() => {
    if (allUserData) {
      setName(allUserData.name || "");
      setUsername(allUserData.username || "");
      setEmail(allUserData.email || "");
      setBio(allUserData.bio || "");
      setPreview(allUserData.profilePicture || "");
      setActiveCategories(
        allUserData.interests?.map((i) => i) || []
      );
    }
  }, [allUserData]);

  console.log(allUserData, "allUserData")

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-[12px] p-4">
      <button
        onClick={() => navigate(-1)}
        className="items-center gap-2 bg-orange-600 w-6 h-6 flex justify-center rounded-full"
      >
        <BiArrowBack className="text-white" />
      </button>

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

      {/* Name + Username */}
      <div className="w-full flex gap-4">
        <Input
          size="md"
          type="text"
          placeholder="Text goes here"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name"
        />
        {/* <Input
          size="md"
          type="email"
          placeholder="Text goes here"
          value={email}
          disabled
          onChange={(e) => setEmail(e.target.value)}
          label="Email (can not changed)"
        /> */}
        {username && (
        <Input
          size="md"
          type="email"
          placeholder="Text goes here"
          value={username}
          disabled
          onChange={(e) => setUsername(e.target.value)}
          label="Username (can not changed)"
        />
        )}
      </div>

      {/* Email */}
      <div className="w-full"></div>

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
          {isLoading ? (
            <div>Laoding...</div>
          ) : (
            interestsList?.map((item, index) => {
              const title = item.name; // Get the name of the interest
              const isActive = activeCategories.includes(title); // Convert title to lowercase for matching
              return (
                <button
                  key={index}
                  onClick={() => toggleCategory(item.name)} // Pass title to toggleCategory
                  className={`h-[38px] px-5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${isActive
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {title}
                </button>
              );
            })
          )}
        </div>

        <Button
          size="full"
          variant="orange"
          className="w-full flex items-center justify-center"
          onClick={handleSubmit}
          disabled={updateProfileLoading}
        >
          {updateProfileLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  );
}
