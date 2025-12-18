import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import SupplierFormModal from "../components/suppliers/SupplierFormModal";
import MessageModal from "../components/ui/MessageModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import { Truck, Plus, Edit, Trash, Search, Phone, Mail } from "lucide-react";

const SupplierManagementPage = () => {
  const { user, authFetch } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
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

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/suppliers");
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };
  const handleEdit = (s) => {
    setEditingSupplier(s);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Supplier",
      message: "Are you sure? This will remove the supplier record.",
      action: async () => {
        try {
          await authFetch(`/suppliers/${id}`, { method: "DELETE" });
          fetchSuppliers();
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "Supplier deleted.",
            type: "success",
          });
        } catch (err) {
          setMessageModal({
            isOpen: true,
            title: "Error",
            message: "Failed to delete. Supplier may have active orders.",
            type: "error",
          });
        }
      },
    });
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person &&
        s.contact_person.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={Truck}
        title="Supplier Management"
        description="Manage vendors and contact details."
        user={user}
      >
        {["Admin", "Manager"].includes(user?.role) && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus size={18} /> Add Supplier
          </button>
        )}
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search suppliers..."
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
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Contact Person</th>
              <th className="px-6 py-3">Contact Info</th>
              <th className="px-6 py-3">Address</th>
              {["Admin", "Manager"].includes(user?.role) && (
                <th className="px-6 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4">{s.contact_person || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {s.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail size={12} /> {s.email}
                        </div>
                      )}
                      {s.phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone size={12} /> {s.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={s.address}>
                    {s.address || "-"}
                  </td>
                  {["Admin", "Manager"].includes(user?.role) && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      {user.role === "Admin" && (
                        <button
                          onClick={() => confirmDelete(s.id)}
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

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplierToEdit={editingSupplier}
        onSuccess={(msg) => {
          setIsModalOpen(false);
          fetchSuppliers();
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

export default SupplierManagementPage;
