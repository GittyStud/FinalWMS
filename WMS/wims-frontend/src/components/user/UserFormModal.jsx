import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

const UserFormModal = ({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
  fetchWithAuth,
}) => {
  const isEdit = Boolean(userToEdit);
  const initialState = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: "Staff",
  };
  const [formData, setFormData] = useState(initialState);
  const [resetPassword, setResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && userToEdit) {
      setFormData({
        first_name: userToEdit.first_name,
        last_name: userToEdit.last_name,
        username: userToEdit.username,
        email: userToEdit.email,
        role: userToEdit.role,
        password: "",
      });
      setResetPassword(false);
    } else {
      setFormData(initialState);
      setResetPassword(true);
    }
    setError(null);
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData };
      if (isEdit && !resetPassword) delete payload.password;
      const url = isEdit ? `/users/${userToEdit.id}` : "/users";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.success) onSuccess();
      else throw new Error(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit User" : "Add New User"}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          />
          <input
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <input
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="border p-2 rounded w-full"
          required
          disabled={isEdit}
        />
        <input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="border p-2 rounded w-full bg-white"
        >
          <option value="Staff">Staff</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={resetPassword}
              onChange={(e) => setResetPassword(e.target.checked)}
            />{" "}
            <label>Change Password</label>
          </div>
        )}
        {(!isEdit || resetPassword) && (
          <input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="border p-2 rounded w-full"
            required={!isEdit || resetPassword}
          />
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UserFormModal;
