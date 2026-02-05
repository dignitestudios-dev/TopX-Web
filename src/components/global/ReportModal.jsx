import { IoClose } from "react-icons/io5";
import { useState } from "react";

const reasons = [
  "Unprofessional Behavior",
  "Poor Communication",
  "Fake or Impersonating Account",
  "Harassment or Bullying",
  "Abuse or Misconduct",
  "Violation Policies",
];

const ReportModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [selectedReason, setSelectedReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason || loading) return;
    onSubmit(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 relative shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">Report And Delete</h2>

        {/* Options */}
        <div className="space-y-3">
          {reasons.map((reason) => (
            <label
              key={reason}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-gray-800">{reason}</span>
            </label>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || loading}
          className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 ${
            selectedReason && !loading
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Reporting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
