import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProductFormModal from "../components/inventory/ProductFormModal";
import MessageModal from "../components/ui/MessageModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import {
  Package,
  Plus,
  Edit,
  Trash,
  Search,
  AlertTriangle,
} from "lucide-react";

const InventoryManagementPage = () => {
  const { user, authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/inventory");
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  const handleEdit = (p) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure? This cannot be undone.",
      action: async () => {
        try {
          await authFetch(`/inventory/${id}`, { method: "DELETE" });
          fetchProducts();
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "Product deleted.",
            type: "success",
          });
        } catch (err) {
          setMessageModal({
            isOpen: true,
            title: "Error",
            message: "Failed to delete.",
            type: "error",
          });
        }
      },
    });
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={Package}
        title="Inventory"
        description="Manage stock, tracking, and product details."
        user={user}
      >
        {["Admin", "Manager"].includes(user?.role) && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search SKU or Name..."
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
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3 text-right">Cost</th>
              <th className="px-6 py-3">Expiry</th>
              {["Admin", "Manager"].includes(user?.role) && (
                <th className="px-6 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {p.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {p.category || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.location}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold">{p.quantity}</div>
                    {p.quantity <= p.reorder_point && (
                      <div className="text-xs text-red-600 flex justify-center gap-1">
                        <AlertTriangle size={12} /> Low
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.unit_cost
                      ? `$${parseFloat(p.unit_cost).toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {p.expiration_date
                      ? new Date(p.expiration_date).toLocaleDateString()
                      : "-"}
                  </td>
                  {["Admin", "Manager"].includes(user?.role) && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      {user.role === "Admin" && (
                        <button
                          onClick={() => confirmDelete(p.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={(msg) => {
          setIsModalOpen(false);
          fetchProducts();
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

export default InventoryManagementPage;
