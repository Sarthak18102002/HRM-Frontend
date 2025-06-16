import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const UserRoles = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    userId: "",
    roleId: "",
    userName: "",
    roleName: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ userId: null, roleId: null });

  useEffect(() => {
    fetchUserRoles();
    fetchAllUsers();
    fetchAllRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await axiosInstance.get("/admin/users/user-roles");
      const data = response.data.data?.content || [];
      const sortedData = [...data].sort((a, b) => a.id - b.id);
      setUserRoles(sortedData);
    } catch {
      setError("Failed to load user roles.");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.post("/auth/Users", {
        filter: "0",
        pageNumber: 0,
        pageSize: 20
      });
      setAllUsers(response.data?.data?.content || []);
    } catch (err) {
      console.error("Error fetching users", err);
      setError("Failed to load users.");
    }
  };

  const fetchAllRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles");
      setAllRoles(response.data?.data?.content || []);
    } catch (err) {
      console.error("Error fetching roles", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "userId" || name === "roleId" ? Number(value) : value;

    if (name === "userId") {
      const selectedUser = allUsers.find((user) => user.id === val);
      setFormData((prev) => ({
        ...prev,
        userId: val,
        userName: selectedUser?.username || ""
      }));
    } else if (name === "roleId") {
      const selectedRole = allRoles.find((role) => role.id === val);
      setFormData((prev) => ({
        ...prev,
        roleId: val,
        roleName: selectedRole?.roleName || ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosInstance.put("/admin/users/update-role", {
          userId: formData.userId,
          roleId: formData.roleId
        });
        alert("User role updated successfully.");
      } else {
        await axiosInstance.post("/admin/users/assign-role", {
          userId: formData.userId,
          roleId: formData.roleId
        });
        alert("Role assigned to user successfully.");
      }
      setError("");
      setFormData({ id: null, userId: "", roleId: "", userName: "", roleName: "" });
      setIsEdit(false);
      setShowModal(false);
      fetchUserRoles();
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
          "User already has a role assigned."
        );
      } else {
        setError("Operation failed.");
      }
      setSuccess("");
      // Do NOT close modal or reset form here!
    }
  };

  const handleEdit = (ur) => {
    setFormData({
      id: ur.id,
      userId: ur.userId,
      roleId: ur.roleId,
      userName: ur.userName || "",
      roleName: ur.roleName || ""
    });
    setIsEdit(true);
    setSuccess("");
    setError("");
    setShowModal(true);
  };

  const confirmDelete = (userId, roleId) => {
    setDeleteInfo({ userId, roleId });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete("/admin/users/remove-role", {
        params: { userId: deleteInfo.userId, roleId: deleteInfo.roleId }
      });
      alert("Role removed successfully.");
      setError("");
      fetchUserRoles();
    } catch {
      setError("Failed to delete role.");
      setSuccess("");
    }
    setShowDeleteConfirm(false);
    setDeleteInfo({ userId: null, roleId: null });
  };

  const openAddModal = () => {
    setFormData({ id: null, userId: "", roleId: "", userName: "", roleName: "" });
    setIsEdit(false);
    setSuccess("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ id: null, userId: "", roleId: "", userName: "", roleName: "" });
    setIsEdit(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-indigo-800 mb-10">
        Manage User Roles
      </h1>

      {error && <p className="text-red-600 text-center font-semibold mb-4">{error}</p>}
      {success && <p className="text-green-600 text-center font-semibold mb-4">{success}</p>}

      <div className="flex justify-center mb-8">
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out"
        >
          Assign Role
        </button>
      </div>

      {/* Assign Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-white via-indigo-50 to-indigo-100 shadow-2xl rounded-3xl p-8 w-full max-w-lg">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-700 text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-indigo-800 mb-6 text-center">Assign Role</h2>

            {/* Show error here */}
            {error && (
              <div className="text-red-600 text-center font-semibold mb-2">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Select User</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white"
                >
                  <option value="">-- Select User --</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.id} , {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Select Role</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white"
                >
                  <option value="">-- Select Role --</option>
                  {allRoles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition duration-300"
                >
                  {isEdit ? "Update Role" : "Assign Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this role assignment?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-x-auto shadow-xl rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-indigo-100 sticky top-0 z-10 text-indigo-800">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userRoles.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No role assignments found.
                </td>
              </tr>
            ) : (
              userRoles.map((ur) => (
                <tr key={ur.id} className="hover:bg-indigo-50 transition duration-200">
                  <td className="px-6 py-4">{ur.id}</td>
                  <td className="px-6 py-4 capitalize">{ur.userName}</td>
                  <td className="px-6 py-4">{ur.roleName}</td>
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => handleEdit(ur)}
                      className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => confirmDelete(ur.userId, ur.roleId)}
                      className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-800 hover:scale-105 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRoles;
