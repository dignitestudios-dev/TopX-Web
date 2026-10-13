/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Search,
} from "lucide-react";
import { updatePrizeDeliveryDetails } from "../../redux/slices/affiliate.slice";
import { SuccessToast, ErrorToast } from "../global/Toaster";
import usaStatesCities from "../../assets/json/usa_states_cities.json";

// Reusable Searchable Select Dropdown
function SearchableSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  error = null,
  includeClearOption = false,
  clearLabel = "None (Clear)",
  specialOption = null, // e.g. { label: "Other (Enter manually)", value: "Other" }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Truncate list to first 100 items for snappy performance
  const visibleOptions = filteredOptions.slice(0, 100);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const displayLabel = value
    ? specialOption && value === specialOption.value
      ? specialOption.label
      : value
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition flex items-center justify-between text-left ${disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : error
            ? "border-red-400 bg-white text-gray-800 focus:ring-2 focus:ring-red-200 cursor-pointer"
            : "border-gray-300 bg-white text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 cursor-pointer hover:border-gray-400"
          }`}
      >
        <span className={`truncate ${!value ? "text-gray-400" : "text-gray-800"}`}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 ml-2 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-orange-500" : ""
            }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search size={15} className="text-gray-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full text-xs bg-transparent outline-none text-gray-800 placeholder-gray-400 py-1"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            role="listbox"
            tabIndex={-1}
            className="max-h-56 overflow-y-auto divide-y divide-gray-50 text-sm"
          >
            {/* Clear / Reset option */}
            {includeClearOption && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect("")}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between cursor-pointer font-medium bg-gray-50/50"
              >
                <span>{clearLabel}</span>
                {!value && <span className="text-orange-500 text-xs">✓</span>}
              </button>
            )}

            {/* Special Option (e.g. "Other") */}
            {specialOption && (
              <button
                type="button"
                role="option"
                aria-selected={value === specialOption.value}
                onClick={() => handleSelect(specialOption.value)}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between cursor-pointer font-semibold ${value === specialOption.value
                  ? "bg-orange-50 text-orange-600"
                  : "text-orange-600 bg-orange-50/20"
                  }`}
              >
                <span>{specialOption.label}</span>
                {value === specialOption.value && <span>✓</span>}
              </button>
            )}

            {visibleOptions.length > 0 ? (
              visibleOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between cursor-pointer ${value === opt
                    ? "bg-orange-50 font-semibold text-orange-600"
                    : "text-gray-700"
                    }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <span>✓</span>}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-gray-400">
                No matching results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrizeDeliveryModal({
  isOpen,
  onClose,
  onSuccess,
  isShareTriggered = false,
}) {
  const dispatch = useDispatch();
  const { prizeDeliveryDetails, isSavingDeliveryDetails } = useSelector(
    (state) => state.affiliate
  );
  const { user, allUserData } = useSelector((state) => state.auth);
  const currentUser = user || allUserData;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    postalCode: "",
  });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // 59 US States & Territories from JSON
  const stateList = Object.keys(usaStatesCities || {}).sort();

  // Cities belonging to selected state
  const availableCities = selectedState && usaStatesCities[selectedState]
    ? usaStatesCities[selectedState]
    : [];

  // Pre-fill fields on open
  useEffect(() => {
    if (isOpen) {
      const initialName =
        prizeDeliveryDetails?.name ||
        currentUser?.name ||
        currentUser?.username ||
        "";
      const initialEmail =
        prizeDeliveryDetails?.email ||
        currentUser?.email ||
        "";
      const initialPhone =
        prizeDeliveryDetails?.phone ||
        currentUser?.phone ||
        currentUser?.phoneNumber ||
        "";

      setFormData({
        name: initialName,
        email: initialEmail,
        phone: initialPhone,
        address: prizeDeliveryDetails?.address || "",
        apartment: prizeDeliveryDetails?.apartment || "",
        postalCode: prizeDeliveryDetails?.postalCode || "",
      });

      const existingState = prizeDeliveryDetails?.state || "";
      const existingCity = prizeDeliveryDetails?.city || "";

      setSelectedState(existingState);

      if (existingState && usaStatesCities[existingState]) {
        const cities = usaStatesCities[existingState];
        if (cities.includes(existingCity)) {
          setSelectedCity(existingCity);
          setCustomCity("");
        } else if (existingCity) {
          setSelectedCity("Other");
          setCustomCity(existingCity);
        } else {
          setSelectedCity("");
          setCustomCity("");
        }
      } else {
        setSelectedCity("");
        setCustomCity("");
      }

      setFormErrors({});
    }
  }, [isOpen, prizeDeliveryDetails, currentUser]);

  if (!isOpen) return null;

  // Helper to block space when input is empty
  const blockLeadingSpace = (e) => {
    if (e.key === " " && (!e.currentTarget.value || e.currentTarget.value.length === 0)) {
      e.preventDefault();
    }
  };

  // Helper to remove any leading space from string
  const sanitizeNoLeadingSpace = (val) => {
    if (!val) return "";
    return val.startsWith(" ") ? val.trimStart() : val;
  };

  // Input change handlers with strict field constraints
  const handleAddressChange = (e) => {
    const val = sanitizeNoLeadingSpace(e.target.value);
    if (val.length > 50) return;
    setFormData((prev) => ({ ...prev, address: val }));
    if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: null }));
  };

  const handleApartmentChange = (e) => {
    const val = sanitizeNoLeadingSpace(e.target.value);
    if (val.length > 30) return;
    setFormData((prev) => ({ ...prev, apartment: val }));
    if (formErrors.apartment) setFormErrors((prev) => ({ ...prev, apartment: null }));
  };

  const handlePostalCodeChange = (e) => {
    let val = sanitizeNoLeadingSpace(e.target.value);
    val = val.replace(/[^a-zA-Z0-9\-\s]/g, "");
    if (val.length > 10) return;
    setFormData((prev) => ({ ...prev, postalCode: val }));
    if (formErrors.postalCode) setFormErrors((prev) => ({ ...prev, postalCode: null }));
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    // When state changes or clears, reset selected city
    setSelectedCity("");
    setCustomCity("");
    if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: null }));
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    if (cityName !== "Other") {
      setCustomCity("");
    }
    if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: null }));
  };

  const handleCustomCityChange = (e) => {
    let val = sanitizeNoLeadingSpace(e.target.value);
    // Letters & spaces only
    val = val.replace(/[^a-zA-Z\s]/g, "");
    if (val.length > 50) return;
    setCustomCity(val);
    if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: null }));
  };

  const handleNameChange = (e) => {
    let val = sanitizeNoLeadingSpace(e.target.value);
    // Letters, hyphens, apostrophes, spaces
    val = val.replace(/[^a-zA-Z\s'-]/g, "");
    if (val.length > 15) return;
    setFormData((prev) => ({ ...prev, name: val }));
    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null }));
  };

  const handleEmailChange = (e) => {
    // No spaces allowed
    let val = e.target.value.replace(/\s/g, "");
    if (val.length > 100) return;
    setFormData((prev) => ({ ...prev, email: val }));
    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }));
  };

  const handlePhoneChange = (e) => {
    let val = sanitizeNoLeadingSpace(e.target.value);
    val = val.replace(/[^0-9+\-\s()]/g, "");
    // Hard stop: max 10 national digits (or 11 if includes leading 1 / +1)
    const digits = val.replace(/\D/g, "");
    const startsWithCountryCode = val.startsWith("+1") || digits.startsWith("1");
    const maxAllowedDigits = startsWithCountryCode ? 11 : 10;
    if (digits.length > maxAllowedDigits) return;
    if (val.length > 18) return;

    setFormData((prev) => ({ ...prev, phone: val }));
    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: null }));
  };

  // Validation Matrix Implementation
  const validate = () => {
    const errors = {};

    // 1. Street Address (Required, max 50)
    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      errors.address = "Street address is required";
    } else if (trimmedAddress.length > 50) {
      errors.address = "Street address cannot exceed 50 characters";
    }

    // 2. Apartment, Suite (Optional, max 30)
    const trimmedApartment = formData.apartment?.trim();
    if (trimmedApartment && trimmedApartment.length > 30) {
      errors.apartment = "Max 30 characters";
    }

    // 3. Postal / ZIP Code (Optional, 3-10 chars, [a-zA-Z0-9\-\s])
    const trimmedPostal = formData.postalCode?.trim();
    if (trimmedPostal) {
      if (trimmedPostal.length < 3 || trimmedPostal.length > 10) {
        errors.postalCode = "Must be 3 to 10 characters";
      } else if (!/^[a-zA-Z0-9\-\s]+$/.test(trimmedPostal)) {
        errors.postalCode = "Invalid ZIP / Postal code";
      }
    }

    // 4. City (Conditional: If State is selected, City selection is MANDATORY)
    if (selectedState && selectedState !== "None (Clear)") {
      if (!selectedCity) {
        errors.city = "Please select a city";
      } else if (selectedCity === "Other") {
        if (!customCity.trim()) {
          errors.city = "Please enter your city";
        }
      }
    }

    // 5. Recipient Name (Required, 2-15 chars, letters/hyphens/apostrophes/spaces)
    const rawName = formData.name;
    const trimmedName = rawName.trim();
    if (!trimmedName) {
      errors.name = "Recipient name is required";
    } else if (rawName.startsWith(" ")) {
      errors.name = "Full name cannot start with a space";
    } else if (trimmedName.length < 2 || trimmedName.length > 15) {
      errors.name = "Full name must be between 2 and 15 characters";
    } else if (!/^[a-zA-Z]+([-' ][a-zA-Z]+)*$/.test(trimmedName)) {
      errors.name = "Names can only contain letters, hyphens, apostrophes, and spaces";
    }

    // 6. Contact Email (Required, max 100, standard regex, no whitespace)
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!trimmedEmail) {
      errors.email = "Contact email is required";
    } else if (trimmedEmail.length > 100 || !emailRegex.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    // 7. Phone Number (Required, max 18, only US +1, exactly 10 national digits)
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      errors.phone = "Phone number is required";
    } else {
      if (trimmedPhone.startsWith("+") && !trimmedPhone.startsWith("+1")) {
        errors.phone = "Only US numbers (+1) are allowed";
      } else {
        const digits = trimmedPhone.replace(/\D/g, "");
        const nationalDigits = digits.startsWith("1") ? digits.slice(1) : digits;
        if (nationalDigits.length !== 10) {
          errors.phone = "US number must have 10 digits";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build payload according to technical specification
    const payload = {
      address: formData.address.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      country: "United States",
      apartment: formData.apartment?.trim() || null,
      postalCode: formData.postalCode?.trim() || null,

      state: selectedState.trim() || null,
      city: selectedCity.trim() || null,
    };
    console.log("Payload before dispatch:", payload);

    try {
      const result = await dispatch(updatePrizeDeliveryDetails(payload)).unwrap();
      if (result) {
        SuccessToast("Delivery details saved successfully!");
        onSuccess?.();
      }
    } catch (err) {
      const errMsg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to save delivery details. Please check your inputs.";
      ErrorToast(errMsg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close delivery details dialog"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <MapPin size={22} />
          </div>
          <div>
            <h2 id="delivery-modal-title" className="text-xl font-bold text-gray-900">
              Prize Delivery Details
            </h2>
            <p className="text-xs text-gray-500">
              {isShareTriggered
                ? "Please provide your delivery address before sharing your referral link."
                : "Add or update where your prize will be shipped if selected as a winner."}
            </p>
          </div>
        </div>

        {/* Privacy & Policy Banner */}
        <div className="mt-3 mb-5 p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-xl flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
          <ShieldCheck size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <span>
            Your delivery details will be used to contact you and arrange delivery{" "}
            <strong>only if you are selected as a winner</strong>. Saving an address does
            not guarantee a prize.
          </span>
        </div>

        {/* Form according to Layout Order Specification:
            1. Street Address (*)
            2. Apartment, Suite (Optional) & Postal / ZIP Code (Optional)
            3. State (Optional) & City (Dependent, no * on label)
            4. Recipient Name (*) (Vertical)
            5. Contact Email (*) (Vertical)
            6. Phone Number (*) (Vertical)
        */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Street Address (Required *) */}
          <div>
            <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              maxLength={50}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.address)}
              value={formData.address}
              onKeyDown={blockLeadingSpace}
              onChange={handleAddressChange}
              placeholder="e.g. 742 Evergreen Terrace"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.address
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                }`}
            />
            {formErrors.address && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.address}
              </p>
            )}
          </div>

          {/* 2. Apartment, Suite & Postal / ZIP Code (Side-by-side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="apartment" className="block text-xs font-semibold text-gray-700 mb-1">
                Apartment, Suite <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="apartment"
                name="apartment"
                type="text"
                maxLength={30}
                value={formData.apartment}
                onKeyDown={blockLeadingSpace}
                onChange={handleApartmentChange}
                placeholder="e.g. Apt 4B"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.apartment
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  }`}
              />
              {formErrors.apartment && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.apartment}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 mb-1">
                Postal / ZIP Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                maxLength={10}
                value={formData.postalCode}
                onKeyDown={blockLeadingSpace}
                onChange={handlePostalCodeChange}
                placeholder="e.g. 90210"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.postalCode
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  }`}
              />
              {formErrors.postalCode && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.postalCode}
                </p>
              )}
            </div>
          </div>

          {/* 3. State & City (Dependent Searchable Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="block text-xs font-semibold text-gray-700 mb-1">
                State <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <SearchableSelect
                id="state"
                value={selectedState}
                onChange={handleStateChange}
                options={stateList}
                placeholder="Select State"
                includeClearOption={true}
                clearLabel="None (Clear)"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-1">
                City
              </label>
              <SearchableSelect
                id="city"
                value={selectedCity}
                onChange={handleCityChange}
                options={availableCities}
                placeholder={selectedState ? "Select City" : "Select state first"}
                disabled={!selectedState || selectedState === "None (Clear)"}
                error={formErrors.city}

              />
              {formErrors.city && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.city}
                </p>
              )}
            </div>
          </div>

          {/* Specify City (when "Other" is selected) */}
          {selectedCity === "Other" && (
            <div>
              <label htmlFor="customCity" className="block text-xs font-semibold text-gray-700 mb-1">
                Specify City <span className="text-red-500">*</span>
              </label>
              <input
                id="customCity"
                name="customCity"
                type="text"
                maxLength={50}
                value={customCity}
                onKeyDown={blockLeadingSpace}
                onChange={handleCustomCityChange}
                placeholder="Enter your city name"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.city
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  }`}
              />
              {formErrors.city && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.city}
                </p>
              )}
            </div>
          )}

          {/* 4. Recipient Name (Required *, Vertical) */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">
              Recipient Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={15}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.name)}
              value={formData.name}
              onKeyDown={blockLeadingSpace}
              onChange={handleNameChange}
              placeholder="e.g. John Doe"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.name
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                }`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.name}
              </p>
            )}
          </div>

          {/* 5. Contact Email (Required *, Vertical) */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={100}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.email)}
              value={formData.email}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
              onChange={handleEmailChange}
              placeholder="e.g. name@example.com"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.email
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                }`}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.email}
              </p>
            )}
          </div>

          {/* 6. Phone Number (Required *, Vertical) */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={18}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.phone)}
              value={formData.phone}
              onKeyDown={blockLeadingSpace}
              onChange={handlePhoneChange}
              placeholder="+1 (555) 123-4567"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${formErrors.phone
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                }`}
            />
            {formErrors.phone && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.phone}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSavingDeliveryDetails}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingDeliveryDetails}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:opacity-95 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSavingDeliveryDetails ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Delivery Details</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
