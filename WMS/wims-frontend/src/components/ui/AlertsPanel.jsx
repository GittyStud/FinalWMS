import React from "react";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";

const AlertsPanel = ({ alerts = [], loading = false }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-800">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold">Stock Alerts</h2>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            alerts.length > 0
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {loading ? "..." : alerts.length} Issues
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[300px]">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Checking stock levels...
          </p>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 flex flex-col items-center">
            <CheckCircle className="w-8 h-8 mb-2 text-green-400" />
            <p className="text-sm">All stock levels are healthy.</p>
          </div>
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100 transition hover:shadow-md"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-white px-2 py-0.5 rounded border border-red-200 text-red-600 font-mono">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-xs text-gray-500">
                    Target: {item.reorder_point}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  LOC: {item.location}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
