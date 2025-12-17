// src/pages/ReportsAndAnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/ui/PageHeader";
import MessageModal from "../components/ui/MessageModal";
import { BarChart2, AlertTriangle, Clock } from "lucide-react";

// Utility function copied from InventoryManagementPage
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

const ReportsAndAnalyticsPage = () => {
  const { user, useAuthFetch } = useAuth();
  const fetchWithAuth = useAuthFetch();

  const [activeTab, setActiveTab] = useState("lowStock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // --- API HANDLERS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const endpoint =
      activeTab === "lowStock" ? "/reports/lowstock" : "/reports/auditlog";

    try {
      // NOTE: The API should enforce Manager/Admin access for all reports
      const response = await fetchWithAuth(endpoint);
      const data = await response.json();

      if (response.ok && data.success) {
        if (activeTab === "lowStock") {
          setLowStockProducts(data.data);
        } else {
          setAuditLogs(data.data);
        }
      } else {
        setError(data.message || `Failed to load ${activeTab} data.`);
      }
    } catch (e) {
      setError(e.message);
      // Show error in modal for better visibility
      setMessageModal({
        isOpen: true,
        title: "Report Load Error",
        message: e.message || `Failed to load ${activeTab} data.`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- TAB CONTENT RENDERERS ---

  const renderLowStockReport = () => {
    if (lowStockProducts.length === 0 && !loading) {
      return (
        <div className="p-6 text-center text-green-700 bg-green-50 border border-green-200 rounded-lg">
          🎉 All inventory levels are above their reorder points!
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Current Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Reorder Point
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lowStockProducts.map((product) => (
              <tr key={product.id} className="bg-yellow-50 hover:bg-yellow-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                  {product.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {product.reorder_point}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAuditLog = () => {
    if (auditLogs.length === 0 && !loading) {
      return (
        <div className="p-6 text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
          No audit log entries found yet.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.user_username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.action_type.includes("DELETE")
                        ? "bg-red-100 text-red-800"
                        : log.action_type.includes("UPDATE")
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {log.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-lg truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <>
      <PageHeader
        icon={BarChart2}
        title="Reports and Analytics"
        description="View critical inventory reports and historical audit logs (Req. 6)."
      />

      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab("lowStock")}
              className={`flex items-center gap-2 py-2 px-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "lowStock"
                  ? "border-b-2 border-red-500 text-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Low Stock Report
            </button>
            <button
              onClick={() => setActiveTab("auditLog")}
              className={`flex items-center gap-2 py-2 px-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "auditLog"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              Audit Log (Transaction History)
            </button>
          </nav>
        </div>

        {/* Content Area */}
        {loading && (
          <div className="p-4 text-center text-indigo-600 font-medium">
            Loading {activeTab === "lowStock" ? "reports" : "logs"}...
          </div>
        )}

        {!loading && (
          <>
            {activeTab === "lowStock" && renderLowStockReport()}
            {activeTab === "auditLog" && renderAuditLog()}
          </>
        )}
      </div>

      {/* Message Modal for errors */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </>
  );
};

export default ReportsAndAnalyticsPage;
