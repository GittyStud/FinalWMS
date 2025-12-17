// src/components/user/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

const UserFormModal = ({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
  onError,
  fetchWithAuth,
}) => {
  const isEdit = !!userToEdit;
  const initialFormState = {
    username: "",
    email: "",
    password: "", // Only for creation or password reset
    role: "Staff", // Default role
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetPassword, setResetPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        isEdit
          ? {
              username: userToEdit.username,
              email: userToEdit.email,
              role: userToEdit.role,
              password: "", // Never pre-fill password field
            }
          : initialFormState
      );
      setError(null);
      setResetPassword(false);
    }
  }, [isOpen, isEdit, userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isEdit ? `/users/${userToEdit.id}` : "/users";
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
    };

    // Only include password if creating or if explicitly resetting
    if (!isEdit || (isEdit && resetPassword)) {
      if (!formData.password) {
        setError("Password is required for creation or reset.");
        setLoading(false);
        return;
      }
      payload.password = formData.password;
    }

    try {
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(
          data.message || `User ${isEdit ? "updated" : "added"} successfully!`,
          isEdit
        );
      } else {
        onError(
          data.message || `Failed to ${isEdit ? "update" : "add"} user.`,
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
      title={isEdit ? `Edit User: ${userToEdit?.username}` : "Add New User"}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={isEdit} // Prevent changing username
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm ${
                isEdit ? "bg-gray-100" : "focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Staff">Staff</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center pt-4 border-t">
            <input
              id="resetPassword"
              type="checkbox"
              checked={resetPassword}
              onChange={(e) => setResetPassword(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="resetPassword"
              className="ml-2 block text-sm text-red-600 font-medium"
            >
              Reset Password (Check this box to set a new password)
            </label>
          </div>
        )}

        {(isEdit && resetPassword) || !isEdit ? (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {isEdit ? "New Password" : "Password"}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required={!isEdit || resetPassword}
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ) : null}

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
            className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-300 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 py-2 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;