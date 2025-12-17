// src/components/inventory/ProductFormModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

// Utility function copied from App.jsx
const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// ProductFormModal component logic is pulled from the old App.jsx file
const ProductFormModal = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
  onError,
  fetchWithAuth,
}) => {
  const isEdit = !!productToEdit;
  const initialFormState = {
    name: "",
    sku: "",
    quantity: 0,
    category: "",
    location: "",
    reorder_point: 50,
    unit_cost: 0,
    expiration_date: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionNotes, setTransactionNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(
        isEdit
          ? {
              ...productToEdit,
              quantity: Number(productToEdit.quantity),
              reorder_point: Number(productToEdit.reorder_point),
              unit_cost: Number(productToEdit.unit_cost || 0),
              expiration_date: productToEdit.expiration_date
                ? formatDate(productToEdit.expiration_date)
                : "",
            }
          : initialFormState
      );
      setError(null);
      setTransactionNotes("");
    }
  }, [isOpen, isEdit, productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorder_point" || name === "unit_cost"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isEdit ? `/inventory/${productToEdit.id}` : "/inventory";
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      ...formData,
      quantity: Math.max(0, formData.quantity),
    };

    if (isEdit) {
      payload.transaction_notes = transactionNotes;
    }

    try {
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.message, isEdit);
      } else {
        onError(
          data.message || `Failed to ${isEdit ? "update" : "add"} product.`,
          isEdit
        );
      }
    } catch (e) {
      setError(e.message);
      onError(e.message, isEdit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        isEdit ? `Edit Product: ${productToEdit?.name}` : "Add New Product"
      }
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: Name, SKU, Category */}
          <div className="col-span-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700"
            >
              SKU
            </label>
            <input
              type="text"
              name="sku"
              id="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              disabled={isEdit} 
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm ${
                isEdit
                  ? "bg-gray-100"
                  : "focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Row 2: Quantity, Reorder Point, Location */}
          <div className="col-span-1">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min="0"
              step="1"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="reorder_point"
              className="block text-sm font-medium text-gray-700"
            >
              Reorder Point
            </label>
            <input
              type="number"
              name="reorder_point"
              id="reorder_point"
              required
              min="0"
              step="1"
              value={formData.reorder_point}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Storage Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Row 3: Unit Cost, Expiration Date */}
          <div className="col-span-1">
            <label
              htmlFor="unit_cost"
              className="block text-sm font-medium text-gray-700"
            >
              Unit Cost ($)
            </label>
            <input
              type="number"
              name="unit_cost"
              id="unit_cost"
              required
              min="0"
              step="0.01"
              value={formData.unit_cost}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="expiration_date"
              className="block text-sm font-medium text-gray-700"
            >
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              name="expiration_date"
              id="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {isEdit && (
          <div className="col-span-3 pt-4 border-t">
            <label
              htmlFor="transaction_notes"
              className="block text-sm font-medium text-gray-700"
            >
              Transaction Notes (e.g., "Received 50 units", "Moved to Shelf B")
            </label>
            <textarea
              id="transaction_notes"
              rows="3"
              value={transactionNotes}
              onChange={(e) => setTransactionNotes(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter details about this quantity or location change..."
            />
          </div>
        )}

        {error && (
          <div
            className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
              ? "Save Changes"
              : "Add Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;