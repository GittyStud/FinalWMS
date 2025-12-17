// src/components/ui/MessageModal.jsx
import React from "react";
import Modal from "./Modal";
import { Package, AlertTriangle } from "lucide-react";

// MessageModal component logic is pulled from the old App.jsx file
const MessageModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  const colorMap = {
    success: "text-green-600 border-green-200 bg-green-50",
    error: "text-red-600 border-red-200 bg-red-50",
    info: "text-indigo-600 border-indigo-200 bg-indigo-50",
  };

  const Icon = type === "error" ? AlertTriangle : Package;

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className={`p-4 border rounded-lg ${colorMap[type]}`}>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default MessageModal;