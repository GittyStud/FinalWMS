import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

const SupplierFormModal = ({
  isOpen,
  onClose,
  supplierToEdit,
  fetchWithAuth,
  onSuccess,
}) => {
  const isEdit = Boolean(supplierToEdit);

  const initialState = {
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && supplierToEdit) {
      setFormData({
        name: supplierToEdit.name || "",
        contact_person: supplierToEdit.contact_person || "",
        email: supplierToEdit.email || "",
        phone: supplierToEdit.phone || "",
        address: supplierToEdit.address || "",
      });
    } else {
      setFormData(initialState);
    }
    setError(null);
  }, [isOpen, isEdit, supplierToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/suppliers/${supplierToEdit.id}` : "/suppliers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.success) {
        onSuccess(isEdit ? "Supplier updated." : "Supplier added.");
        onClose();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Failed to save supplier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Supplier" : "Add Supplier"}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Person
            </label>
            <input
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            rows="2"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500"
          ></textarea>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

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
            {loading ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierFormModal;
