import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  X,
  Search,
  ChevronDown,
  Navigation,
  Check,
  Zap,
  MapPin,
  CreditCard,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBoostPlans,
  createStripeCheckoutSession,
} from "../../redux/slices/boost.slice";
import { gettopics } from "../../redux/slices/topics.slice";
import {
  getAreaCoordinates,
  savePendingBoostCampaign,
} from "../../lib/boostHelpers";
import { SuccessToast, ErrorToast } from "./Toaster";

const MAX_KEYWORDS = 5;

const DEFAULT_SUGGESTED_KEYWORDS = [
  "League",
  "Hoops",
  "Athlete",
  "Court",
  "Championship",
  "Trending",
  "Viral",
  "Highlight",
];

const DEFAULT_CATEGORIES = [
  "Sports",
  "Basketball",
  "Football",
  "Food & Dining",
  "Travel",
  "Technology",
  "Business",
  "Fashion",
  "Fitness",
  "Beauty",
  "Entertainment",
  "Music",
  "Gaming",
  "Education",
  "Health & Wellness",
  "Art & Design",
  "Finance",
  "Crypto",
  "Science",
];

const RADII = [
  "5 Miles",
  "10 Miles",
  "25 Miles",
  "50 Miles",
  "100 Miles",
];

const FALLBACK_PLANS = [
  {
    _id: "fallback_10_views",
    key: "boost_10_views",
    label: "Starter – 10 Views",
    impressions: 10,
    durationDays: 3,
    displayPrice: 0.99,
    currency: "USD",
  },
  {
    _id: "fallback_50_views",
    key: "boost_50_views",
    label: "Growth – 50 Views",
    impressions: 50,
    durationDays: 7,
    displayPrice: 3.99,
    currency: "USD",
  },
  {
    _id: "fallback_100_views",
    key: "boost_100_views",
    label: "Pro – 100 Views",
    impressions: 100,
    durationDays: 14,
    displayPrice: 6.99,
    currency: "USD",
  },
  {
    _id: "fallback_500_views",
    key: "boost_500_views",
    label: "Viral – 500 Views",
    impressions: 500,
    durationDays: 30,
    displayPrice: 24.99,
    currency: "USD",
  },
];

export default function BoostPostModal({ isOpen, onClose, post, onBoostSuccess }) {
  const dispatch = useDispatch();
  const { plans, plansLoading, checkoutLoading } = useSelector(
    (state) => state.boost
  );
  const { alltopics, isLoading: topicsLoading } = useSelector(
    (state) => state.topics || {}
  );

  // Stepper state: 1: Keywords, 2: Categories, 3: Location, 4: Setup
  const [step, setStep] = useState(1);

  // =========================================================
  // STEP 1 STATE: Keywords (Max 5, Datamuse API suggestions)
  // =========================================================
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState(["Trending"]);
  const [suggestedKeywords, setSuggestedKeywords] = useState(DEFAULT_SUGGESTED_KEYWORDS);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Derive page category / topic name for Datamuse query
  const pageCategoryName = useMemo(() => {
    return (
      post?.page?.topic ||
      post?.tag ||
      post?.page?.name ||
      (Array.isArray(post?.keywords) && post?.keywords[0]) ||
      "Trending"
    );
  }, [post]);

  // Fetch words from Datamuse API: https://api.datamuse.com/words?ml=page category name&max=8
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchDatamuseWords = async () => {
      try {
        setLoadingSuggestions(true);
        const cleanTerm = pageCategoryName
          .replace(/[#@]/g, "")
          .replace(/[_-]/g, " ")
          .trim();
        const encoded = encodeURIComponent(cleanTerm || "Trending");
        const res = await fetch(
          `https://api.datamuse.com/words?ml=${encoded}&max=8`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const formatted = data.map((item) => {
              const w = item.word || "";
              return w.charAt(0).toUpperCase() + w.slice(1);
            });
            setSuggestedKeywords(formatted);
          }
        }
      } catch (err) {
        console.debug("Datamuse API error:", err);
      } finally {
        if (isMounted) setLoadingSuggestions(false);
      }
    };

    fetchDatamuseWords();
    return () => {
      isMounted = false;
    };
  }, [isOpen, pageCategoryName]);

  // =========================================================
  // STEP 2 STATE: Categories & Interests from Backend API
  // =========================================================
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["Sports"]);

  // Extract categories list from backend API (topics slice)
  const apiCategories = useMemo(() => {
    if (Array.isArray(alltopics) && alltopics.length > 0) {
      const list = [];
      alltopics.forEach((t) => {
        if (typeof t === "string" && t.trim()) {
          if (!list.includes(t.trim())) list.push(t.trim());
        } else if (t?.name) {
          if (!list.includes(t.name.trim())) list.push(t.name.trim());
          if (Array.isArray(t.subCategories)) {
            t.subCategories.forEach((sub) => {
              const sName = typeof sub === "string" ? sub : sub?.name;
              if (sName && sName.trim() && !list.includes(sName.trim())) {
                list.push(sName.trim());
              }
            });
          }
        }
      });
      return list.length > 0 ? list : DEFAULT_CATEGORIES;
    }
    return DEFAULT_CATEGORIES;
  }, [alltopics]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return apiCategories;
    const q = categorySearch.toLowerCase().trim();
    return apiCategories.filter((c) => c.toLowerCase().includes(q));
  }, [apiCategories, categorySearch]);

  // =========================================================
  // STEP 3 STATE: Location & Google/Places Address Autocomplete
  // =========================================================
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocations, setSelectedLocations] = useState(["Miami"]);
  const [selectedState, setSelectedState] = useState("Florida");
  const [selectedRadius, setSelectedRadius] = useState("10 Miles");
  const [selectedCoordinates, setSelectedCoordinates] = useState([-80.1918, 25.7617]); // [lng, lat]

  // Places Autocomplete suggestions
  const [placePredictions, setPlacePredictions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showPredictionsDropdown, setShowPredictionsDropdown] = useState(false);
  const placesDebounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // =========================================================
  // STEP 4 STATE: Plans
  // =========================================================
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load plans and backend categories on modal open
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchBoostPlans());
      dispatch(gettopics());
    }
  }, [isOpen, dispatch]);

  const activePlans = plans && plans.length > 0 ? plans : FALLBACK_PLANS;

  useEffect(() => {
    if (activePlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(activePlans[0]._id);
    }
  }, [activePlans, selectedPlanId]);

  // Click outside to close places autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowPredictionsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // --- Step 1 Handlers ---
  const handleAddKeyword = (kw) => {
    const raw = (kw || keywordInput).trim().replace(/^#/, "");
    if (!raw) return;

    if (keywords.length >= MAX_KEYWORDS) {
      ErrorToast(`You can only select up to ${MAX_KEYWORDS} keywords.`);
      return;
    }

    if (!keywords.includes(raw)) {
      setKeywords([...keywords, raw]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleKeyDownKeyword = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // --- Step 2 Handlers ---
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        ErrorToast("Please keep at least one target category selected.");
        return;
      }
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // --- Step 3 Handlers (Places Address Autocomplete) ---
  const handleLocationInputChange = (val) => {
    setLocationInput(val);

    if (placesDebounceRef.current) {
      clearTimeout(placesDebounceRef.current);
    }

    if (!val || val.trim().length < 2) {
      setPlacePredictions([]);
      setShowPredictionsDropdown(false);
      return;
    }

    placesDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearchingPlaces(true);
        // Query Photon / OpenStreetMap Places API for address autocomplete
        const q = encodeURIComponent(val.trim());
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${q}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.features) && data.features.length > 0) {
            const results = data.features.map((f) => {
              const p = f.properties || {};
              const name = p.name || val;
              const state = p.state || p.county || "";
              const country = p.country || "";
              const city = p.city || p.town || p.village || p.name || val;
              const coords = f.geometry?.coordinates || [-97.7431, 30.2672]; // [lng, lat]
              return {
                label: [name, state, country].filter(Boolean).join(", "),
                city,
                state: state || country,
                coordinates: coords, // [lng, lat]
              };
            });
            setPlacePredictions(results);
            setShowPredictionsDropdown(true);
          } else {
            setPlacePredictions([]);
          }
        }
      } catch (err) {
        console.debug("Places search error:", err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 280);
  };

  const handleSelectPlacePrediction = (place) => {
    setSelectedLocations([place.city || place.label]);
    setSelectedState(place.state || "US");
    setSelectedCoordinates(place.coordinates); // [lng, lat]
    setLocationInput(place.label);
    setShowPredictionsDropdown(false);
    setPlacePredictions([]);
  };

  const handleAddManualLocation = () => {
    const trimmed = locationInput.trim();
    if (!trimmed) return;
    setSelectedLocations([trimmed]);
    const coords = getAreaCoordinates(trimmed, selectedState);
    setSelectedCoordinates(coords);
    setShowPredictionsDropdown(false);
  };

  const handleRemoveLocation = (loc) => {
    setSelectedLocations(selectedLocations.filter((l) => l !== loc));
  };

  const handleSkipLocation = () => {
    setLocationEnabled(false);
    setStep(4);
  };

  const handleContinueWithLocation = () => {
    setLocationEnabled(true);
    setStep(4);
  };

  // --- Step 4 Handlers & Stripe Checkout ---
  const handleCompleteBoost = async () => {
    const selectedPlan =
      activePlans.find((p) => p._id === selectedPlanId) || activePlans[0];

    if (!selectedPlan) {
      ErrorToast("Please select a boost plan");
      return;
    }

    const postId = post?._id || post?.id;
    if (!postId) {
      ErrorToast("Invalid post selection");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Calculate Mongo GeoJSON coordinates [longitude, latitude]
      const city = selectedLocations[0] || "Target Area";
      const coordinates =
        selectedCoordinates && selectedCoordinates.length === 2
          ? selectedCoordinates
          : getAreaCoordinates(city, selectedState);
      const radiusNum = parseInt(selectedRadius, 10) || 50;

      // 2. Request Stripe Checkout session from API
      const resultAction = await dispatch(
        createStripeCheckoutSession({ planId: selectedPlan._id })
      );

      if (createStripeCheckoutSession.fulfilled.match(resultAction)) {
        const checkoutData = resultAction.payload;

        // 3. Save pending boost parameters in local storage
        const campaignData = {
          planId: selectedPlan._id,
          postId: postId,
          platform: "stripe",
          keywords: keywords.length > 0 ? keywords : ["trending"],
          selectedInterests:
            selectedCategories.length > 0 ? selectedCategories : ["Sports"],
          locationEnabled: Boolean(locationEnabled),
          locationCity: city,
          locationState: selectedState || "",
          locationCoordinates: coordinates,
          locationRadius: radiusNum,
          plan: selectedPlan,
          postPreview: {
            title: post.text || post.bodyText || "Post",
            image: post.postimage?.[0] || post.media?.[0]?.fileUrl || null,
          },
        };

        savePendingBoostCampaign(
          checkoutData?.checkoutSessionId,
          campaignData
        );

        // 4. Redirect to Stripe Checkout page
        if (checkoutData?.checkoutUrl) {
          window.location.href = checkoutData.checkoutUrl;
        } else {
          ErrorToast("Failed to retrieve checkout URL");
        }
      }
    } catch (err) {
      console.error("Boost checkout error:", err);
      ErrorToast("Failed to initiate boost checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (step === 3) {
      handleContinueWithLocation();
    } else if (step < 4) {
      setStep(step + 1);
    } else {
      handleCompleteBoost();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[450px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-slideUp z-10">
        {/* Step Indicator Bar */}
        <div className="w-full bg-gray-100 h-1.5 flex">
          <div
            className="bg-[#DE4B12] h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-gray-900 text-center flex-1">
            {step === 1 && "Add Keywords"}
            {step === 2 && "Interests & Categories"}
            {step === 3 && "Location Targeting"}
            {step === 4 && "Select Boost Plan"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-orange-scrollbar space-y-4">
          {/* ========================================================= */}
          {/* STEP 1: KEYWORDS (Max 5, Datamuse API) */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 font-medium">
                  Add target keywords matching subscribed page names.
                </p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    keywords.length >= MAX_KEYWORDS
                      ? "bg-orange-100 text-[#DE4B12]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {keywords.length}/{MAX_KEYWORDS}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Keywords (Max {MAX_KEYWORDS})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDownKeyword}
                    disabled={keywords.length >= MAX_KEYWORDS}
                    placeholder={
                      keywords.length >= MAX_KEYWORDS
                        ? "Maximum 5 keywords selected"
                        : "Type keyword and press Enter"
                    }
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#DE4B12] focus:ring-1 focus:ring-[#DE4B12] transition shadow-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  {keywordInput.trim() && keywords.length < MAX_KEYWORDS && (
                    <button
                      type="button"
                      onClick={() => handleAddKeyword()}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#DE4B12] text-white px-2.5 py-1 rounded-xl text-xs font-semibold hover:bg-orange-600 transition cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Active Tags */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 bg-[#DE4B12] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs animate-fadeIn"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Keywords from Datamuse API */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#DE4B12]" />
                    <span>AI Suggested for "{pageCategoryName}"</span>
                  </p>
                  {loadingSuggestions && (
                    <Loader2 className="w-3.5 h-3.5 text-[#DE4B12] animate-spin" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords
                    .filter((k) => !keywords.includes(k))
                    .map((suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => handleAddKeyword(suggested)}
                        disabled={keywords.length >= MAX_KEYWORDS}
                        className="bg-gray-100/90 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 text-gray-700 border border-transparent px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +{suggested}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: INTERESTS & CATEGORIES (Backend API /interests) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-700 font-medium">
                  Select target interests matching page topics.
                </p>
                <span className="text-xs font-bold text-[#DE4B12] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  {selectedCategories.length} Selected
                </span>
              </div>

              {/* Category Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories & topics..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#DE4B12] focus:bg-white transition"
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categories list */}
              {topicsLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <div className="w-6 h-6 border-2 border-[#DE4B12] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Loading categories from server...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1 max-h-64 overflow-y-auto pr-1 custom-orange-scrollbar">
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                          isSelected
                            ? "bg-[#DE4B12] text-white shadow-sm shadow-orange-500/20 scale-[1.02]"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="w-full text-center py-6 text-xs text-gray-500">
                      No categories found matching "{categorySearch}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: LOCATION TARGETING (Places Address Autocomplete) */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Target viewers whose saved coordinates fall within your chosen area, or skip to target globally.
              </p>

              {/* Places / Address Search with Live Autocomplete */}
              <div className="relative" ref={searchContainerRef}>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Search Address / City / Location
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddManualLocation();
                      }
                    }}
                    placeholder="Search city or address (e.g. Austin, Miami, Houston)"
                    className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#DE4B12] focus:ring-1 focus:ring-[#DE4B12] transition shadow-xs"
                  />

                  {isSearchingPlaces && (
                    <Loader2 className="w-4 h-4 text-orange-500 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
                  )}

                  {locationInput && !isSearchingPlaces && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationInput("");
                        setPlacePredictions([]);
                        setShowPredictionsDropdown(false);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Places Autocomplete Suggestions Dropdown */}
                {showPredictionsDropdown && placePredictions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto">
                    {placePredictions.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPlacePrediction(place)}
                        className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-2.5 border-b border-gray-100 last:border-0 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#DE4B12] shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {place.city || place.label.split(",")[0]}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {place.label}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Location Chip */}
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLocations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1.5 bg-[#DE4B12] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                      >
                        <MapPin className="w-3 h-3 fill-white" />
                        <span>{loc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc)}
                          className="hover:bg-black/20 rounded-full p-0.5 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Radius Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Target Radius
                </label>
                <div className="relative">
                  <select
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 appearance-none focus:outline-none focus:border-[#DE4B12] transition shadow-xs cursor-pointer"
                  >
                    {RADII.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Map Preview Area */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Target Area Preview
                </label>
                <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gradient-to-br from-emerald-50 via-sky-50 to-blue-100 flex items-center justify-center group">
                  <svg
                    className="absolute inset-0 w-full h-full opacity-40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 24 0 L 0 0 0 24"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path
                      d="M-20 60 Q 100 20 200 80 T 450 40"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="6"
                    />
                    <path
                      d="M80 -20 Q 120 70 140 160"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="5"
                    />
                    <path
                      d="M260 -20 Q 240 60 300 160"
                      fill="none"
                      stroke="#fde047"
                      strokeWidth="3"
                    />
                  </svg>

                  {/* Area Label Tag */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-800 shadow-xs border border-gray-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#DE4B12]" />
                    <span>
                      {selectedLocations[0] || "Target City"} ({selectedRadius})
                    </span>
                  </div>

                  {/* Pin */}
                  <div className="absolute right-4 bottom-3 w-8 h-8 rounded-full bg-[#DE4B12] text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Navigation className="w-3.5 h-3.5 fill-white rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: SELECT BOOST PLAN */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs text-gray-600 font-medium">
                Select an active boost plan. You will be redirected to secure Stripe Checkout.
              </p>

              {plansLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Loading boost plans...</span>
                </div>
              ) : (
                activePlans.map((pkg) => {
                  const isSelected = selectedPlanId === pkg._id;
                  const dailyAverage = Math.round(
                    pkg.impressions / (pkg.durationDays || 1)
                  );

                  return (
                    <div
                      key={pkg._id}
                      onClick={() => setSelectedPlanId(pkg._id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none border-2 relative ${
                        isSelected
                          ? "bg-[#DE4B12] border-[#DE4B12] text-white shadow-lg shadow-orange-500/20 scale-[1.01]"
                          : "bg-white border-gray-200 hover:border-orange-200 text-gray-800"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Zap
                            className={`w-4 h-4 ${
                              isSelected ? "text-white" : "text-[#DE4B12]"
                            }`}
                          />
                          <h3
                            className={`text-sm font-bold ${
                              isSelected ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {pkg.label || `${pkg.impressions} Views`}
                          </h3>
                        </div>
                        <span
                          className={`text-base font-extrabold ${
                            isSelected ? "text-white" : "text-[#DE4B12]"
                          }`}
                        >
                          ${Number(pkg.displayPrice || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Details */}
                      <div
                        className={`text-xs space-y-1 ${
                          isSelected ? "text-orange-50" : "text-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Guaranteed Impressions:</span>
                          <span className="font-semibold text-current">
                            {pkg.impressions} Views
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Campaign Duration:</span>
                          <span className="font-semibold text-current">
                            {pkg.durationDays} Days
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pacing Target:</span>
                          <span className="font-semibold text-current">
                            ~{dailyAverage} views / day
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Secure payment guarantee badge */}
              <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px] pt-1">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Powered by Stripe Hosted Secure Checkout</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/40">
          {step === 3 ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkipLocation}
                className="flex-1 border-2 border-[#DE4B12] text-[#DE4B12] hover:bg-orange-50 bg-white font-semibold py-3 rounded-2xl transition text-sm cursor-pointer shadow-xs"
              >
                Skip Location
              </button>
              <button
                type="button"
                onClick={handleContinueWithLocation}
                className="flex-1 bg-[#DE4B12] hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl transition text-sm cursor-pointer shadow-md shadow-orange-500/20 active:scale-[0.99]"
              >
                Continue
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || checkoutLoading}
              className="w-full bg-[#DE4B12] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-2xl transition text-sm cursor-pointer shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              {isSubmitting || checkoutLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting to Stripe...</span>
                </>
              ) : step === 4 ? (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Boost Post with Stripe</span>
                </div>
              ) : (
                "Continue"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
