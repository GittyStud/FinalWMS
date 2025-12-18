import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Plus, Trash, Calculator } from "lucide-react";

const OrderFormModal = ({ isOpen, onClose, fetchWithAuth, onSuccess }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState([]); // [{ product_id, quantity, unit_cost }]

  // Load Reference Data
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [supRes, prodRes] = await Promise.all([
            fetchWithAuth("/suppliers"),
            fetchWithAuth("/inventory"),
          ]);
          setSuppliers(supRes.data || []);
          setProducts(prodRes.data || []);
          // Reset form
          setSupplierId("");
          setNotes("");
          setExpectedDate("");
          setItems([{ product_id: "", quantity: 1, unit_cost: 0 }]);
        } catch (err) {
          console.error(err);
          setError("Failed to load suppliers or products.");
        }
      };
      loadData();
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1, unit_cost: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-fill cost if product selected
    if (field === "product_id") {
      const selectedProd = products.find((p) => p.id === parseInt(value));
      if (selectedProd) {
        newItems[index].unit_cost = selectedProd.unit_cost || 0;
      }
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => sum + item.quantity * item.unit_cost, 0)
      .toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    // Validate items
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      setError("Please add at least one valid product.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier_id: supplierId,
        expected_delivery: expectedDate || null,
        notes,
        items: validItems,
      };

      const res = await fetchWithAuth("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        onSuccess("Order created successfully.");
        onClose();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Purchase Order"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Delivery
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-700">Order Items</h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs flex items-center gap-1 text-indigo-600 font-medium hover:underline"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Product</label>
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) =>
                      handleItemChange(idx, "product_id", e.target.value)
                    }
                    className="w-full p-2 border rounded bg-white text-sm"
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-500">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                    className="w-full p-2 border rounded text-sm text-center"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) =>
                      handleItemChange(idx, "unit_cost", e.target.value)
                    }
                    className="w-full p-2 border rounded text-sm text-right"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded mb-[1px]"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end items-center gap-2 mt-4 text-gray-800 font-bold border-t pt-2">
            <Calculator size={18} className="text-gray-400" />
            <span>Total: ${calculateTotal()}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg"
          ></textarea>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
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
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderFormModal;
