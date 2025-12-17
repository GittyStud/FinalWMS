// src/components/ui/ConfirmationModal.jsx
import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

// ConfirmationModal component logic is pulled from the old App.jsx file
const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-red-800">{title}</h4>
            <p className="mt-1 text-sm text-red-700">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="py-2 px-4 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Confirm Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;