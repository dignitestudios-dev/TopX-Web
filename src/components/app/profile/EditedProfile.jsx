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
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import { getInterests, checkUsername } from "../../../redux/slices/onboarding.slice";

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
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [originalUsername, setOriginalUsername] = useState(allUserData?.username || "");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'unavailable', null

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

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.trim() === "") {
      setUsernameError("");
      setIsUsernameValid(true);
      setUsernameStatus(null);
      setUsernameSuggestions([]);
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

    const formData = new FormData();

    // Add all fields to FormData
    formData.append("name", name);

    // Add username if it has changed
    if (username !== originalUsername && username.trim() !== "") {
      formData.append("username", username);
    }

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
      // Update original username after successful update
      if (username !== originalUsername) {
        setOriginalUsername(username);
      }
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
          {username && (
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    size="md"
                    type="text"
                    placeholder="Text goes here"
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
          )}

        </div>


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
            <div>Loading...</div>
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
