// src/pages/InventoryManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import ProductFormModal from "../components/inventory/ProductFormModal";
import MessageModal from "../components/ui/MessageModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import { Package, Plus, Edit, Trash, Search } from "lucide-react";

// Utility function copied from App.jsx
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

const InventoryManagementPage = () => {
  const { user, useAuthFetch } = useAuth();
  const fetchWithAuth = useAuthFetch(); // Get the fetch utility function

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // MODAL STATES
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
    action: () => {},
  });

  const isManagerOrAdmin = ["Admin", "Manager"].includes(user.role);
  const isAdmin = user.role === "Admin";

  // --- API HANDLERS ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth("/inventory");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || "Failed to load products.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = useCallback(
    async (productId) => {
      try {
        const response = await fetchWithAuth(`/inventory/${productId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "Product deleted successfully!",
            type: "success",
          });
          fetchProducts();
        } else {
          setMessageModal({
            isOpen: true,
            title: "Deletion Failed",
            message: `Deletion failed: ${data.message || "Server error."}`,
            type: "error",
          });
        }
      } catch (e) {
        setMessageModal({
          isOpen: true,
          title: "Error",
          message: `Error: ${e.message}`,
          type: "error",
        });
      }
    },
    [fetchProducts, fetchWithAuth]
  );

  const handleDelete = (productId) => {
    if (!isAdmin) {
      setMessageModal({
        isOpen: true,
        title: "Permission Denied",
        message: "Only Administrators can delete products.",
        type: "error",
      });
      return;
    }
    setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
      action: () => handleDeleteConfirm(productId),
    });
  };

  // --- MODAL HANDLERS ---
  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (message, isEdit) => {
    setIsModalOpen(false);
    setMessageModal({
      isOpen: true,
      title: isEdit ? "Update Successful" : "Creation Successful",
      message:
        message || `Product ${isEdit ? "updated" : "added"} successfully!`,
      type: "success",
    });
    fetchProducts();
  };

  const handleFormError = (message, isEdit) => {
    setIsModalOpen(false);
    setMessageModal({
      isOpen: true,
      title: isEdit ? "Update Failed" : "Creation Failed",
      message: message || `Failed to ${isEdit ? "update" : "add"} product.`,
      type: "error",
    });
  };

  // --- FILTERING ---
  const filteredProducts = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerCaseSearch) ||
        p.sku.toLowerCase().includes(lowerCaseSearch) ||
        p.location.toLowerCase().includes(lowerCaseSearch)
    );
  }, [products, search]);

  return (
    <>
      <PageHeader
        icon={Package}
        title="Inventory Management"
        description="View and manage current stock levels and product details (Req. 4)."
      />
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
          <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {isManagerOrAdmin && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="p-4 text-center text-indigo-600 font-medium">
            Loading inventory data...
          </div>
        )}

        {error && !loading && (
          <div className="p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Pt.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration Date
                  </th>
                  {isManagerOrAdmin && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={
                        product.quantity <= product.reorder_point
                          ? "bg-yellow-50 hover:bg-yellow-100 transition duration-100"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.location}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          product.quantity <= product.reorder_point
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.reorder_point}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.expiration_date)}
                      </td>

                      {isManagerOrAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition"
                                title="Delete Product (Admin Only)"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals are rendered here */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={handleFormSuccess}
        onError={handleFormError}
        fetchWithAuth={fetchWithAuth}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.action}
      />
    </>
  );
};

export default InventoryManagementPage;
