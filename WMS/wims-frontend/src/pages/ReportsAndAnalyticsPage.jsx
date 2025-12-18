import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/ui/PageHeader";
import { BarChart3 } from "lucide-react";

const ReportsAndAnalyticsPage = () => {
  const { authFetch, user } = useAuth();
  const [lowStock, setLowStock] = useState([]);
  const [movementLogs, setMovementLogs] = useState([]);
  const [locationSummary, setLocationSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const [lowRes, moveRes, sumRes] = await Promise.all([
          authFetch("/reports/lowstock"),
          authFetch("/reports/movement"),
          authFetch("/reports/summary/location"),
        ]);

        setLowStock(lowRes?.data || []);
        setMovementLogs(moveRes?.data || []);
        setLocationSummary(sumRes?.data || []);
      } catch (err) {
        console.error("Reports Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [authFetch]);

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Reports & Analytics"
        description="Inventory health and audit logs."
        user={user}
      />

      {/* Location Summary */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Stock by Location</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locationSummary.map((loc, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded border">
              <div className="font-bold text-gray-700">{loc.location}</div>
              <div className="text-sm text-gray-500">
                {loc.item_count} Items
              </div>
              <div className="text-indigo-600 font-semibold">
                {loc.total_quantity} Qty
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movement Log Table */}
      <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
        <h2 className="text-lg font-bold mb-4">Recent Movements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Product</th>
                <th className="p-3">User</th>
                <th className="p-3">Type</th>
                <th className="p-3">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movementLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium">{log.product_sku}</td>
                  <td className="p-3">{log.user_name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.movement_type === "IN"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {log.movement_type}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
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
  );
};

export default ReportsAndAnalyticsPage;
