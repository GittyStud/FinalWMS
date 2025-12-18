import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/ui/PageHeader";
import { BarChart3, ShieldCheck, History } from "lucide-react";

const ReportsAndAnalyticsPage = () => {
  const { authFetch, user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' or 'audit'
  const [loading, setLoading] = useState(true);

  // Inventory Data
  const [lowStock, setLowStock] = useState([]);
  const [movementLogs, setMovementLogs] = useState([]);
  const [locationSummary, setLocationSummary] = useState([]);

  // Audit Data
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "inventory") {
        const [lowRes, moveRes, sumRes] = await Promise.all([
          authFetch("/reports/lowstock"),
          authFetch("/reports/movement"),
          authFetch("/reports/summary/location"),
        ]);
        setLowStock(lowRes?.data || []);
        setMovementLogs(moveRes?.data || []);
        setLocationSummary(sumRes?.data || []);
      } else if (activeTab === "audit") {
        const auditRes = await authFetch("/reports/audit");
        setAuditLogs(auditRes?.data || []);
      }
    } catch (err) {
      console.error("Reports Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Reports & Analytics"
        description="View system insights and logs."
        user={user}
      />

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "inventory"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Inventory Analytics
        </button>
        {user.role === "Admin" && (
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "audit"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            System Audit Logs
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading data...</div>
      ) : activeTab === "inventory" ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Location Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locationSummary.map((loc, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Location
                </div>
                <div
                  className="font-bold text-gray-800 text-lg truncate"
                  title={loc.location}
                >
                  {loc.location}
                </div>
                <div className="mt-3 flex justify-between items-end">
                  <div className="text-sm text-gray-600">
                    Items:{" "}
                    <span className="font-semibold">{loc.item_count}</span>
                  </div>
                  <div className="text-sm text-indigo-600 font-semibold">
                    {loc.total_quantity} Qty
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <div className="bg-red-200 p-1.5 rounded-full">
                  <BarChart3 size={16} className="text-red-700" />
                </div>
                <h3 className="font-bold text-red-800">Low Stock Alerts</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lowStock.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-4 text-center text-gray-400"
                        >
                          Stock levels healthy.
                        </td>
                      </tr>
                    ) : (
                      lowStock.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 font-mono text-xs">{p.sku}</td>
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-center text-red-600 font-bold">
                            {p.quantity}
                          </td>
                          <td className="p-3 text-center text-gray-500">
                            {p.reorder_point}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Movement Log Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <div className="bg-blue-200 p-1.5 rounded-full">
                  <History size={16} className="text-blue-700" />
                </div>
                <h3 className="font-bold text-blue-800">Recent Movements</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movementLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                          <br />
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-900">
                            {log.product_sku}
                          </div>
                          <div className="text-xs text-gray-500 truncate w-24">
                            {log.product_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              log.movement_type === "IN"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {log.movement_type}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            log.quantity_change > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {log.quantity_change > 0
                            ? `+${log.quantity_change}`
                            : log.quantity_change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- SYSTEM AUDIT LOGS --- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" /> Security &
              Administrative Logs
            </h3>
            <span className="text-xs text-gray-400">Last 100 Actions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {log.user_name}
                      </div>
                      <div className="text-xs text-indigo-600">{log.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-700 max-w-xs truncate"
                      title={log.details}
                    >
                      {log.details}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {log.ip || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAndAnalyticsPage;
