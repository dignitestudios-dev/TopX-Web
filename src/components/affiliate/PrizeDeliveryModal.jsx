/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, MapPin, ShieldCheck, AlertCircle } from "lucide-react";
import { updatePrizeDeliveryDetails } from "../../redux/slices/affiliate.slice";
import { SuccessToast, ErrorToast } from "../global/Toaster";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: prizeDeliveryDetails?.name || "",
        email: prizeDeliveryDetails?.email || "",
        phone: prizeDeliveryDetails?.phone || "",
        address: prizeDeliveryDetails?.address || "",
        apartment: prizeDeliveryDetails?.apartment || "",
        city: prizeDeliveryDetails?.city || "",
        state: prizeDeliveryDetails?.state || "",
        postalCode: prizeDeliveryDetails?.postalCode || "",
        country: prizeDeliveryDetails?.country || "",
      });
      setFormErrors({});
    }
  }, [isOpen, prizeDeliveryDetails]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!formData.address.trim()) {
      errors.address = "Street address is required.";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await dispatch(updatePrizeDeliveryDetails(formData)).unwrap();
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
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in duration-200">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Line 1 (Required) */}
          <div>
            <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.address)}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Main Street"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 ${
                formErrors.address
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

          {/* Apartment / Suite (Optional) */}
          <div>
            <label htmlFor="apartment" className="block text-xs font-semibold text-gray-700 mb-1">
              Apartment, Suite, Unit <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              id="apartment"
              name="apartment"
              type="text"
              value={formData.apartment}
              onChange={handleChange}
              placeholder="e.g. Apt 4B"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-1">
                City <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-xs font-semibold text-gray-700 mb-1">
                State / Province <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                placeholder="State / Province"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 mb-1">
                Postal / ZIP Code <span className="text-gray-400 font-normal">(Optional text)</span>
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-xs font-semibold text-gray-700 mb-1">
                Country <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Contact Fallback Info */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mb-2">
              Contact fields fall back to your profile if left empty.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">
                  Recipient Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  aria-invalid={Boolean(formErrors.email)}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full px-3 py-2 text-sm border rounded-xl outline-none transition focus:ring-2 ${
                    formErrors.email
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>
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
