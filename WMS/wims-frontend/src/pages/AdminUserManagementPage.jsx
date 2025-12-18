import React, { useEffect, useState } from "react";
import { Users, Plus, Edit, Trash } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import UserFormModal from "../components/user/UserFormModal";
import { useAuth } from "../hooks/useAuth";

const AdminUserManagementPage = () => {
  const { authFetch, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/users");
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await authFetch(`/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        icon={Users}
        title="User Management"
        description="Manage system access."
        user={currentUser}
      >
        <button
          onClick={() => {
            setUserToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus size={18} /> Add User
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
            <tr>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setUserToEdit(u);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        fetchWithAuth={authFetch}
        onSuccess={() => {
          setIsModalOpen(false);
          loadUsers();
        }}
      />
    </div>
  );
};

export default AdminUserManagementPage;
