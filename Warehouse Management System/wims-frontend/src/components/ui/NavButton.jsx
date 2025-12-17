import React from "react";

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 my-1 transition-all duration-200 rounded-lg group ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "text-indigo-200 hover:bg-indigo-700/50 hover:text-white"
    }`}
  >
    <Icon
      size={20}
      className="mr-3 transition-transform group-hover:scale-110"
    />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default NavButton;