// src/pages/AdminUserManagementPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import UserFormModal from "../components/user/UserFormModal";
import MessageModal from "../components/ui/MessageModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import { Users, Plus, Edit, Trash, Lock, Shield } from "lucide-react";

// Helper component for Role badge
const RoleBadge = ({ role }) => {
  const colorMap = {
    Admin: "bg-red-100 text-red-800",
    Manager: "bg-indigo-100 text-indigo-800",
    Staff: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${colorMap[role]}`}
    >
      {role}
    </span>
  );
};

const AdminUserManagementPage = () => {
  const { user, useAuthFetch } = useAuth();
  const fetchWithAuth = useAuthFetch();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  // --- API HANDLERS ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: The API should enforce the caller is an Admin
      const response = await fetchWithAuth("/users");
      const data = await response.json();
      if (data.success) {
        // Exclude the currently logged-in user from the list
        setUsers(data.data.filter((u) => u.id !== user.id));
      } else {
        setError(data.message || "Failed to load users.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, user.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler for confirmed deletion
  const handleDeleteConfirm = useCallback(
    async (userId) => {
      try {
        const response = await fetchWithAuth(`/users/${userId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "User deleted successfully!",
            type: "success",
          });
          fetchUsers();
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
    [fetchUsers, fetchWithAuth]
  );

  // Handler to open the confirmation modal
  const handleDelete = (targetUser) => {
    setConfirmationModal({
      isOpen: true,
      title: `Confirm Deletion: ${targetUser.username}`,
      message: `Are you sure you want to delete the user account for ${targetUser.username}? This action is permanent.`,
      action: () => handleDeleteConfirm(targetUser.id),
    });
  };

  // --- MODAL HANDLERS ---
  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (targetUser) => {
    setEditingUser(targetUser);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (message, isEdit) => {
    setIsModalOpen(false);
    setMessageModal({
      isOpen: true,
      title: isEdit ? "Update Successful" : "Creation Successful",
      message: message,
      type: "success",
    });
    fetchUsers();
  };

  const handleFormError = (message, isEdit) => {
    setMessageModal({
      isOpen: true,
      title: isEdit ? "Update Failed" : "Creation Failed",
      message: message,
      type: "error",
    });
  };

  return (
    <>
      <PageHeader
        icon={Users}
        title="User Management"
        description="Admin-only panel for managing user accounts and roles (Req. 5)."
      />
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex justify-end mb-6 border-b pb-4">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" /> Add New User
          </button>
        </div>

        {loading && (
          <div className="p-4 text-center text-indigo-600 font-medium">
            Loading user data...
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
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No other users found.
                    </td>
                  </tr>
                ) : (
                  users.map((targetUser) => (
                    <tr key={targetUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {targetUser.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {targetUser.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <RoleBadge role={targetUser.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(targetUser)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition"
                            title="Edit User Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(targetUser)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition"
                            title="Delete User"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Add/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={editingUser}
        onSuccess={handleFormSuccess}
        onError={handleFormError}
        fetchWithAuth={fetchWithAuth}
      />

      {/* Message and Confirmation Modals */}
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

export default AdminUserManagementPage;
