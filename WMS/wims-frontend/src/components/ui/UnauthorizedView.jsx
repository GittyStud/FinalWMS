import React from "react";
import { ShieldAlert } from "lucide-react";

const UnauthorizedView = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
    <div className="p-4 bg-red-100 rounded-full mb-4">
      <ShieldAlert className="w-12 h-12 text-red-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
    <p className="text-gray-500 max-w-md">
      You do not have the required permissions to view this page. Please contact
      your administrator if you believe this is an error.
    </p>
  </div>
);

export default UnauthorizedView;
