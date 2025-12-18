import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import OrderFormModal from "../components/orders/OrderFormModal";
import MessageModal from "../components/ui/MessageModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const OrderManagementPage = () => {
  const { user, authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/orders");
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- ACTIONS ---
  const handleReceiveOrder = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Receive Order",
      message: "This will add the ordered items to your inventory. Proceed?",
      action: async () => {
        try {
          const res = await authFetch(`/orders/${id}/receive`, {
            method: "POST",
          });
          if (res.success) {
            setMessageModal({
              isOpen: true,
              title: "Received",
              message: "Inventory updated successfully.",
              type: "success",
            });
            fetchOrders();
          }
        } catch (err) {
          setMessageModal({
            isOpen: true,
            title: "Error",
            message: err.message,
            type: "error",
          });
        }
      },
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      RECEIVED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  const filtered = orders.filter(
    (o) =>
      o.id.toString().includes(search) ||
      o.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Purchase Orders"
        description="Manage supplier orders and receiving."
        user={user}
      >
        {["Admin", "Manager"].includes(user?.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus size={18} /> New Order
          </button>
        )}
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search by Order ID or Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 font-semibold uppercase">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Supplier</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Total Cost</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  Loading orders...
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    #{o.id}
                  </td>
                  <td className="px-6 py-4 font-medium">{o.supplier?.name}</td>
                  <td className="px-6 py-4">
                    {new Date(o.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    ${parseFloat(o.total_cost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {o.status === "PENDING" &&
                      ["Admin", "Manager"].includes(user?.role) && (
                        <button
                          onClick={() => handleReceiveOrder(o.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition shadow-sm"
                        >
                          Receive Items
                        </button>
                      )}
                    {o.status === "RECEIVED" && (
                      <span className="text-xs text-gray-400 italic">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          fetchOrders();
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: msg,
            type: "success",
          });
        }}
        fetchWithAuth={authFetch}
      />
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        {...messageModal}
      />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        {...confirmationModal}
      />
    </div>
  );
};

export default OrderManagementPage;
