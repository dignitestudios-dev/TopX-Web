import { IoSearch } from "react-icons/io5";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { BiArrowBack } from "react-icons/bi";
import { auth } from "../../../assets/export";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getAllUserData,
  updateProfile,
} from "../../../redux/slices/auth.slice";
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import { getInterests, checkUsername } from "../../../redux/slices/onboarding.slice";
import ProfilePictureModal from "./ProfilePictureModal";
import EmojiPickerModal from "./EmojiPickerModal";
import { emojiUrlToFile, deduplicateInterestsList } from "../../../lib/helpers";

export default function EditedProfile({ setIsEditProfile }) {
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
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [originalUsername, setOriginalUsername] = useState(allUserData?.username || "");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'unavailable', null
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [openCategoryId, setOpenCategoryId] = useState(null);

  const { isLoading, interestsList } = useSelector((state) => state.onboarding);

  const deduplicatedList = useMemo(() => {
    return deduplicateInterestsList(interestsList);
  }, [interestsList]);

  // Set default open category to the 1st category once loaded
  useEffect(() => {
    if (deduplicatedList && deduplicatedList.length > 0 && openCategoryId === null) {
      const firstCat = deduplicatedList[0];
      const firstId = firstCat._id || firstCat.id || "cat-0";
      setOpenCategoryId(firstId);
    }
  }, [deduplicatedList, openCategoryId]);

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

  useEffect(() => {
    dispatch(getAllUserData());
  }, []);

  useEffect(() => {
    dispatch(getInterests());
  }, []);

  // Auto-select API interests
  useEffect(() => {
    if (allUserData?.interests?.length > 0) {
      setActiveCategories(allUserData.interests.map((i) => i));
    }
  }, [allUserData]);

  // Toggle category
  const toggleCategory = (category) => {
    const c = category;
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

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.trim() === "") {
      setUsernameError("");
      setIsUsernameValid(true);
      setUsernameStatus(null);
      setUsernameSuggestions([]);
      return;
    }

    if (usernameToCheck.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    if (usernameToCheck.length > 50) {
      setUsernameError("Username cannot exceed 50 characters");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    if (/\s/.test(usernameToCheck)) {
      setUsernameError("Username cannot contain spaces");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(usernameToCheck)) {
      setUsernameError("Username can only contain letters, numbers, underscores, and dots");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    if (/^[._]/.test(usernameToCheck) || /[._]$/.test(usernameToCheck)) {
      setUsernameError("Username cannot start or end with a dot or underscore");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    if (/[_.]{2,}/.test(usernameToCheck)) {
      setUsernameError("Username cannot contain consecutive dots or underscores");
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");
    setUsernameSuggestions([]);
    setUsernameStatus(null);

    try {
      const result = await dispatch(checkUsername(usernameToCheck));

      if (result.meta.requestStatus === "fulfilled") {
        setIsUsernameValid(true);
        setUsernameError("");
        setUsernameStatus("available");
        SuccessToast("Username available");
      } else {
        setIsUsernameValid(false);
        setUsernameStatus("unavailable");
        // Check if suggestions are available
        if (result.payload?.suggestions && Array.isArray(result.payload.suggestions)) {
          setUsernameSuggestions(result.payload.suggestions);
          setUsernameError(result.payload.message || "Username not available");
          ErrorToast(result.payload.message || "Username not available");
        } else {
          setUsernameError(result.payload?.message || result.payload || "Username not available");
          ErrorToast(result.payload?.message || result.payload || "Username not available");
        }
      }
    } catch (error) {
      setIsUsernameValid(false);
      setUsernameStatus("unavailable");
      setUsernameError("Failed to check username");
      ErrorToast("Failed to check username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setUsername(suggestion);
    setUsernameSuggestions([]);
    setUsernameStatus(null);
    setUsernameError("");
    setIsUsernameValid(true);
  };

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const DISALLOWED_EXTENSIONS = [".svg", ".gif"];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();

    if (
      DISALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext)) ||
      fileType.includes("svg") ||
      fileType.includes("gif") ||
      !ALLOWED_IMAGE_TYPES.includes(fileType)
    ) {
      ErrorToast("Unsupported file format! Only JPG, JPEG, PNG, and WEBP are supported. SVG and GIF files are not allowed.");
      e.target.value = "";
      setProfileFile(null);
      return;
    }

    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = async (emojiUrl) => {
    setPreview(emojiUrl);
    try {
      const file = await emojiUrlToFile(emojiUrl, "profile_emoji.png");
      if (file) {
        setProfileFile(file);
      } else {
        setProfileFile(null);
      }
    } catch (err) {
      console.error("Error converting profile emoji:", err);
      setProfileFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!name || name.trim() === "") {
      ErrorToast("Please enter your name");
      return;
    }
    if (name.trim().length < 3) {
      ErrorToast("Name must be at least 3 characters long");
      return;
    }
    if (name.trim().length > 50) {
      ErrorToast("Name cannot exceed 50 characters");
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      ErrorToast("Name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    // Check username if it has changed
    if (username !== originalUsername && username.trim() !== "") {
      // Check username availability before submitting
      const usernameRes = await dispatch(checkUsername(username));

      if (usernameRes.meta.requestStatus !== "fulfilled") {
        ErrorToast(usernameRes.payload || "Username not available");
        setIsUsernameValid(false);
        setUsernameError(usernameRes.payload || "Username not available");
        return;
      }

      setIsUsernameValid(true);
      setUsernameError("");
    }

    // Validate minimum interests
    if (!activeCategories || activeCategories.length < 5) {
      ErrorToast("Please select at least 5 interests.");
      return;
    }

    let binaryFile = profileFile;
    if (!(binaryFile instanceof File) && preview && preview !== allUserData?.profilePicture) {
      binaryFile = await emojiUrlToFile(preview, "profile_emoji.png");
    }

    const formData = new FormData();

    // Add all fields to FormData
    formData.append("name", name);

    // Add username if it has changed
    if (username !== originalUsername && username.trim() !== "") {
      formData.append("username", username);
    }

    formData.append("bio", bio);
    console.log(activeCategories, "active categories");
    // Add each valid interest to FormData as indexed array (interests[0], interests[1], etc.)
    activeCategories.forEach((interest, index) => {
      formData.append(`interests[${index}]`, interest);
    });

    if (binaryFile instanceof File) {
      formData.append("profilePicture", binaryFile, binaryFile.name || "profile.png");
    } else {
      formData.append(
        "existingProfilePicture",
        preview || allUserData?.profilePicture || ""
      );
    }

    // Dispatch the updateProfile thunk
    const result = await dispatch(updateProfile(formData));

    if (result.type === "auth/updateProfile/fulfilled") {
      SuccessToast("Profile Successfully Updated");
      // Update original username after successful update
      if (username !== originalUsername) {
        setOriginalUsername(username);
      }
      setIsEditProfile?.(false);
    }
  };

  useEffect(() => {
    if (allUserData) {
      setName(allUserData.name || "");
      setUsername(allUserData.username || "");
      setOriginalUsername(allUserData.username || "");
      setEmail(allUserData.email || "");
      setBio(allUserData.bio || "");
      setPreview(allUserData.profilePicture || "");
      setActiveCategories(
        allUserData.interests?.map((i) => i) || []
      );
      setUsernameError("");
      setIsUsernameValid(true);
      setUsernameStatus(null);
      setUsernameSuggestions([]);
    }
  }, [allUserData]);

  console.log(allUserData, "allUserData")

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-[12px] p-4">
      <button
        onClick={() => (setIsEditProfile ? setIsEditProfile(false) : navigate(-1))}
        className="items-center gap-2 bg-orange-600 hover:bg-orange-700 w-7 h-7 flex justify-center rounded-full cursor-pointer transition-colors"
      >
        <BiArrowBack className="text-white" />
      </button>

      {/* Profile Picture */}
      <div className="flex flex-col items-start gap-2">
        <div
          onClick={() => setIsOptionsModalOpen(true)}
          className="w-[100px] h-[100px] flex items-center justify-center border-2 border-dashed border-orange-400 rounded-full bg-[#FFF5F2] cursor-pointer overflow-hidden relative group hover:border-orange-500 transition-all"
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-orange-400 text-3xl">+</span>
          )}
          {/* Hover overlay badge */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
            <span className="text-white text-xs font-semibold">Change</span>
          </div>
        </div>

        {/* Hidden File Input triggered when user clicks Upload Image in modal */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Name + Username */}
      <div className="w-full flex justify-between gap-4">
        <div className="w-full">
          <Input
            size="md"
            type="text"
            placeholder="Text goes here"
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Name"
          />
        </div>

        {/* <Input
          size="md"
          type="email"
          placeholder="Text goes here"
          value={email}
          disabled
          onChange={(e) => setEmail(e.target.value)}
          label="Email (can not changed)"
        /> */}

        <div className="w-full">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  size="md"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                    setIsUsernameValid(true);
                    setUsernameStatus(null);
                    setUsernameSuggestions([]);
                  }}
                  label="Username"
                  error={usernameError}
                  touched={!!usernameError}
                />
              </div>
              <Button
                size="md"
                variant="orange"
                onClick={() => {
                  if (username !== originalUsername && username.trim() !== "") {
                    checkUsernameAvailability(username);
                  } else if (username === originalUsername) {
                    setUsernameError("");
                    setIsUsernameValid(true);
                    setUsernameStatus(null);
                    setUsernameSuggestions([]);
                  } else {
                    ErrorToast("Please enter a username");
                  }
                }}
                disabled={isCheckingUsername || !username || username.trim() === "" || usernameStatus === "available"}
                className="h-[42px] whitespace-nowrap"
              >
                {isCheckingUsername ? "Checking..." : "Check"}
              </Button>
            </div>
            {/* Username Status Indicator */}
            {usernameStatus === "available" && (
              <p className="text-[12px] text-green-600 font-medium">✓ Username is available</p>
            )}
           
            {/* Username Suggestions */}
            {usernameSuggestions.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[12px] font-medium text-gray-700">Suggested usernames:</p>
                <div className="flex flex-wrap gap-2">
                  {usernameSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-3 py-1.5 bg-[#F8F8F8] hover:bg-[#f85e00] hover:text-white text-[#f85e00] rounded-[8px] text-[12px] font-medium transition-colors border border-[#f85e00]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Email */}
      <div className="w-full"></div>

      {/* Bio */}
      <div className="w-full flex flex-col gap-2 py-3">
        <label>My Bio</label>
        <textarea
          value={bio}
          onChange={(e) => {
            const input = e.target.value;
            if (input.length > 399) {
              ErrorToast("My Bio can be maximum 400 characters.");
            }
            const value = input.slice(0, 400);
            setBio(value);
          }}
          placeholder="Text goes here"
          maxLength={400}
          className="w-full h-[200px] border border-gray-300 rounded-[12px] p-2"
        />
      </div>

      {/* Interests */}
      <div className="w-full flex flex-col px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-[500] text-[#000000]">Interests</h2>
          {activeCategories.length > 0 && (
            <span className="text-xs font-semibold text-orange-600">
              Selected: {activeCategories.length} (Min 5 required)
            </span>
          )}
        </div>

        <div className="w-full space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-orange-scrollbar">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4 text-sm">Loading interests...</div>
          ) : !deduplicatedList || deduplicatedList.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">No interests found</div>
          ) : (
            deduplicatedList.map((item, index) => {
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

        <Button
          size="full"
          variant="orange"
          className="w-full flex items-center justify-center mt-6 h-[46px] font-semibold text-[15px] shadow-sm hover:shadow transition-all cursor-pointer"
          onClick={handleSubmit}
          disabled={updateProfileLoading}
        >
          {updateProfileLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>

      {/* Modals */}
      <ProfilePictureModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onSelectUploadImage={() => fileInputRef.current?.click()}
        onSelectUploadEmoji={() => setIsEmojiModalOpen(true)}
      />

      <EmojiPickerModal
        isOpen={isEmojiModalOpen}
        onClose={() => setIsEmojiModalOpen(false)}
        onSelectEmoji={handleSelectEmoji}
      />
    </div>
  );
}
