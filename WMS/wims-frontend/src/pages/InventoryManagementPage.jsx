import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProductFormModal from "../components/inventory/ProductFormModal";
import QRCodeModal from "../components/inventory/QRCodeModal"; // Import the new modal
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
  Calendar,
  QrCode,
} from "lucide-react";

const InventoryManagementPage = () => {
  const { user, authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false); // State for QR Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [qrProduct, setQrProduct] = useState(null); // Product to show QR for

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

  // Handler for QR Code
  const handleShowQR = (p) => {
    setQrProduct(p);
    setIsQRModalOpen(true);
  };

  const confirmDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Product",
      message: "This cannot be undone.",
      action: async () => {
        try {
          await authFetch(`/inventory/${id}`, { method: "DELETE" });
          fetchProducts();
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "Deleted.",
            type: "success",
          });
        } catch (err) {
          setMessageModal({
            isOpen: true,
            title: "Error",
            message: "Failed.",
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

  const renderExpiryDate = (p) => {
    const dateValue = p.expiration_date || p.expiryDate || p.expiry_date;
    if (!dateValue)
      return <span className="text-gray-400 text-xs italic">No Date</span>;
    const date = new Date(dateValue);
    if (isNaN(date.getTime()))
      return <span className="text-gray-400 text-xs italic">Invalid Date</span>;
    return (
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-indigo-500" />
        <span className="text-gray-700 text-sm font-medium">
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={Package}
        title="Inventory"
        description="Manage warehouse stock."
        user={user}
      >
        {["Admin", "Manager"].includes(user?.role) && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 font-semibold text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4 text-right">Unit Cost</th>
                <th className="px-6 py-4">Expiry Date</th>
                {["Admin", "Manager"].includes(user?.role) && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{p.name}</div>
                      <div className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">
                        {p.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {p.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{p.location}</td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className={`font-bold ${
                          p.quantity <= p.reorder_point
                            ? "text-amber-600 flex items-center justify-center gap-1"
                            : "text-gray-900"
                        }`}
                      >
                        {p.quantity}
                        {p.quantity <= p.reorder_point && (
                          <AlertTriangle size={14} title="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      ${parseFloat(p.unit_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderExpiryDate(p)}
                    </td>
                    {["Admin", "Manager"].includes(user?.role) && (
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        {/* QR Code Button */}
                        <button
                          onClick={() => handleShowQR(p)}
                          className="text-gray-500 hover:text-indigo-600 transition-colors p-1.5 rounded hover:bg-indigo-50"
                          title="View QR Code"
                        >
                          <QrCode size={18} />
                        </button>

                        <button
                          onClick={() => handleEdit(p)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1.5 rounded hover:bg-indigo-50"
                        >
                          <Edit size={18} />
                        </button>

                        {user.role === "Admin" && (
                          <button
                            onClick={() => confirmDelete(p.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50"
                          >
                            <Trash size={18} />
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
      </div>

      {/* Forms & Modals */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProducts();
        }}
        fetchWithAuth={authFetch}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        product={qrProduct}
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
