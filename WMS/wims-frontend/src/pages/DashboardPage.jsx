import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/ui/PageHeader";
import AlertsPanel from "../components/ui/AlertsPanel";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-start justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} shadow-sm`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/inventory");
        if (res.success && Array.isArray(res.data)) {
          const products = res.data;
          const totalProducts = products.length;
          const totalQuantity = products.reduce(
            (sum, p) => sum + (p.quantity || 0),
            0
          );
          const lowStockItems = products.filter(
            (p) => p.quantity <= (p.reorder_point || 10)
          );

          setStats({
            totalProducts,
            totalQuantity,
            lowStockCount: lowStockItems.length,
            lowStockItems,
          });
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authFetch]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Here is the warehouse overview."
        user={user}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total SKUs"
          value={loading ? "-" : stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
          subtext="Active unique products"
        />
        <StatCard
          title="Total Stock"
          value={loading ? "-" : stats.totalQuantity}
          icon={TrendingUp}
          color="bg-emerald-500"
          subtext="Physical items on hand"
        />
        <StatCard
          title="Low Stock Alerts"
          value={loading ? "-" : stats.lowStockCount}
          icon={AlertTriangle}
          color="bg-amber-500"
          subtext="Items needing reorder"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1">
          <AlertsPanel alerts={stats.lowStockItems} loading={loading} />
        </div>
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-indigo-50 rounded-full mb-6">
            <Package className="w-16 h-16 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Inventory Operations
          </h3>
          <p className="text-gray-500 max-w-lg">
            Use the sidebar menu to navigate to the <strong>Inventory</strong>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
