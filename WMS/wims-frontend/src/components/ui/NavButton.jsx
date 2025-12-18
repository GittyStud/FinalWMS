// src/components/ui/AlertsPanel.jsx
import React from "react";
import { Bell } from "lucide-react";

const AlertsPanel = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
    <div className="flex items-center text-red-600 mb-4">
      <Bell size={20} className="mr-2 fill-red-100" />
      <h2 className="text-xl font-semibold">Notifications & Alerts</h2>
    </div>
    <ul className="space-y-3 text-sm">
      <li className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 text-red-700">
        ⚠️ Low Stocks
      </li>
      <li className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 text-yellow-700">
        ⏳ Delays
      </li>
      <li className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 text-indigo-700">
        🗓️ Reminders
      </li>
    </ul>
  </div>
);

export default AlertsPanel;
