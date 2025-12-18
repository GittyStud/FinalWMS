import React from "react";
import Modal from "./Modal";
import { Package, AlertTriangle, CheckCircle, Info } from "lucide-react";

const MessageModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      Icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      Icon: AlertTriangle,
    },
    info: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      Icon: Info,
    },
  };

  const currentStyle = styles[type] || styles.info;
  const { Icon } = currentStyle;

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div
        className={`p-4 border rounded-lg ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}`}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default MessageModal;
