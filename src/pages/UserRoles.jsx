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

  useEffect(() => {
    fetchUserRoles();
    fetchAllUsers();
    fetchAllRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await axiosInstance.get("/admin/users/user-roles");
      const data = response.data.data?.content || [];
      setUserRoles(data);
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
      setSuccess("User role updated successfully.");
    } else {
      await axiosInstance.post("/admin/users/assign-role", {
        userId: formData.userId,
        roleId: formData.roleId
      });
      setSuccess("Role assigned to user successfully.");
    }
    setError("");
    setFormData({ id: null, userId: "", roleId: "", userName: "", roleName: "" });
    setIsEdit(false);
    fetchUserRoles();
  } catch {
    setError("Operation failed.");
    setSuccess("");
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
  };

  const handleDelete = async (userId, roleId) => {
    try {
      await axiosInstance.delete("/admin/users/remove-role", {
        params: { userId, roleId }
      });
      setSuccess("Role removed successfully.");
      setError("");
      fetchUserRoles();
    } catch {
      setError("Failed to delete role.");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-indigo-800 mb-10">
        Manage User Roles
      </h1>

      {/* Status Messages */}
      {error && <p className="text-red-600 text-center font-semibold mb-4">{error}</p>}
      {success && <p className="text-green-600 text-center font-semibold mb-4">{success}</p>}

      {/* User Dropdown */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 mb-10">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">Select User</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full border border-indigo-300 rounded-lg px-4 py-2 shadow focus:ring focus:ring-indigo-200 focus:outline-none"
            >
              <option value="">-- Select User --</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                 {user.id} , {user.username}
                </option>
              ))}
            </select>
          </div>


          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">Select Role</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className="w-full border border-indigo-300 rounded-lg px-4 py-2 shadow focus:ring focus:ring-indigo-200 focus:outline-none"
            >
              <option value="">-- Select Role --</option>
              {allRoles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {isEdit ? "Update Role" : "Assign Role"}
          </button>
        </div>
      </form>

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
                      className="bg-yellow-400 hover:bg-yellow-00 text-white px-6 py-3 rounded shadow text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ur.userId, ur.roleId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded shadow text-xs"
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
