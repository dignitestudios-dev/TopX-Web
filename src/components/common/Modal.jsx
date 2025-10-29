import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { Check } from 'lucide-react';

// App root ke liye modal set karein (App.js mein ek baar call karein)
// Modal.setAppElement('#root');

const SuccessModal = ({ 
  icon:customIcon,
  heading = "Password Changed", 
  message = "Your password has been updated successfully.",
  iconBgColor = "bg-orange-600",
  iconSize = 32,
  isOpen = false,
  onClose,
  showCloseButton = false,
  autoCloseDuration = 3000
}) => {
  const IconComponent = customIcon || Check;
useEffect(() => {
    if (isOpen && onClose && autoCloseDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      // Cleanup - agar component unmount ho ya isOpen false ho
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseDuration]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      closeTimeoutMS={200}
    >
      {/* Icon Container */}
      <div className="flex justify-center mb-6">
        <div className={`${iconBgColor} rounded-2xl p-4 inline-flex items-center justify-center`}>
          <IconComponent className="text-white" size={iconSize} strokeWidth={3} />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        {heading}
      </h2>

      {/* Message */}
      <p className="text-gray-500 text-sm leading-relaxed">
        {message}
      </p>

      {/* Optional Close Button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          Close
        </button>
      )}
    </Modal>
  );
};

export default SuccessModal;