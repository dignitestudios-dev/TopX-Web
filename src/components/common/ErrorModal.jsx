import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { AlertTriangle } from 'lucide-react';

const ErrorModal = ({ 
  icon: CustomIcon, 
  heading = "Unblock User", 
  message = "Are you sure you want to unblock this user?",
  iconBgColor = "bg-red-100",
  iconColor = "text-red-600",
  iconSize = 32,
  isOpen = false,
  onClose,
  onConfirm,
  cancelText = "Don't Unblock",
  confirmText = "Unblock Now",
  confirmBgColor = "bg-red-600",
  confirmHoverColor = "hover:bg-red-700",
  autoCloseDuration = null // Default mein auto-close nahi hoga
}) => {
  const IconComponent = CustomIcon || AlertTriangle;

  // Auto close effect
  useEffect(() => {
    if (isOpen && onClose && autoCloseDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

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
          <IconComponent className={iconColor} size={iconSize} strokeWidth={2.5} />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        {heading}
      </h2>

      {/* Message */}
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        {message}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>

        {/* Confirm Button */}
        <button
          onClick={() => {
            onConfirm && onConfirm();
            onClose && onClose();
          }}
          className={`flex-1 ${confirmBgColor} text-white py-3 rounded-lg font-medium ${confirmHoverColor} transition-colors`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ErrorModal;