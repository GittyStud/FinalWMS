import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";

const LOCATIONS = [
  "Aisle 1 - Shelf A",
  "Aisle 1 - Shelf B",
  "Aisle 2 - Shelf A",
  "Aisle 2 - Shelf B",
  "Aisle 3 - Shelf A",
  "Aisle 3 - Shelf B",
  "Aisle 4 - Shelf A",
  "Aisle 4 - Shelf B",
  "Aisle 5 - Shelf A",
  "Aisle 5 - Shelf B",
  "Warehouse Zone A",
  "Warehouse Zone B",
  "Warehouse Zone C",
  "Cold Storage 1",
  "Cold Storage 2",
  "Deep Freeze",
  "Hazardous Materials Room",
  "Receiving Dock",
  "Shipping Bay",
  "Returns Processing",
  "Bulk Storage South",
  "Bulk Storage North",
  "Mezzanine Level 1",
  "Mezzanine Level 2",
  "Overflow Tent",
];

const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Perishables",
  "Raw Materials",
  "Tools",
  "Clothing",
  "Beverages",
  "Snacks",
  "Cleaning",
  "Automotive",
  "Books",
  "Toys",
  "Health",
  "Beauty",
  "Gardening",
  "Industrial Hardware",
  "Safety Equipment",
  "Packaging Materials",
  "Kitchenware",
  "Sporting Goods",
  "Pet Supplies",
  "Baby Products",
  "Electrical Components",
  "Plumbing Supplies",
  "Textiles",
  "Footwear",
  "Home Decor",
  "Stationery",
  "Giftware",
];

const ProductFormModal = ({
  isOpen,
  onClose,
  productToEdit,
  fetchWithAuth,
  onSuccess,
  onError,
}) => {
  const isEdit = Boolean(productToEdit);

  const initialState = {
    name: "",
    sku: "",
    quantity: 0,
    reorder_point: 10,
    location: "",
    category: "",
    unit_cost: 0,
    expiration_date: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        sku: productToEdit.sku || "",
        quantity: productToEdit.quantity || 0,
        reorder_point: productToEdit.reorder_point || 10,
        location: productToEdit.location || "",
        category: productToEdit.category || "",
        unit_cost: productToEdit.unit_cost || 0,
        expiration_date: productToEdit.expiration_date
          ? productToEdit.expiration_date.split("T")[0]
          : "",
        description: productToEdit.description || "",
      });
    } else {
      setFormData(initialState);
    }
    setError(null);
  }, [isOpen, isEdit, productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare payload aligned with Backend Inventory Controller
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      reorder_point: parseInt(formData.reorder_point, 10),
      unit_cost: parseFloat(formData.unit_cost),
      expiration_date: formData.expiration_date || null,
    };

    try {
      const url = isEdit ? `/inventory/${productToEdit.id}` : "/inventory";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        onSuccess(isEdit ? "Product updated." : "Product created.");
        onClose();
      } else {
        throw new Error(res.message || "Operation failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Product" : "Add New Product"}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            {/* Reverted to Input for Unique Entry */}
            <input
              name="sku"
              required
              disabled={isEdit} // SKU cannot change after creation
              value={formData.sku}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="e.g. ELEC-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
              placeholder="e.g. Wireless Mouse"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Location...</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reorder Point
            </label>
            <input
              type="number"
              name="reorder_point"
              required
              min="0"
              value={formData.reorder_point}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit Cost
            </label>
            <input
              type="number"
              name="unit_cost"
              min="0"
              step="0.01"
              value={formData.unit_cost}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expiration Date
          </label>
          <input
            type="date"
            name="expiration_date"
            value={formData.expiration_date}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
