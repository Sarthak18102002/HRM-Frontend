
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    roleName: "",  // Changed from role_name to roleName
    description: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/roles");
      // Assuming the roles are in res.data.data.content (based on your backend response)
      setRoles(res.data.data.content);
      setError("");
    } catch (err) {
      setError("Failed to fetch roles.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosInstance.put(`/roles/${currentRoleId}`, {
          ...formData,
          roleId: currentRoleId, // Ensuring roleId is passed correctly
        });
        setSuccess("Role updated successfully!");
      } else {
        await axiosInstance.post("/roles/create", formData);
        setSuccess("Role created successfully!");
      }
      setFormData({ roleName: "", description: "" }); // Clear the form after submission
      setIsEdit(false);
      setCurrentRoleId(null);
      fetchRoles();
      setError("");
    } catch (err) {
      setError("Failed to save role.");
      console.error(err);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      roleName: role.roleName,  // Use roleName from the backend response
      description: role.description,
    });
    setCurrentRoleId(role.roleId);  // Use roleId from the backend response
    setIsEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
      setSuccess(`Role with ID ${id} deleted.`);
      fetchRoles();
    } catch (err) {
      setError("Failed to delete role.");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Role Management</h1>

      {success && <p className="text-green-500 text-lg mb-4">{success}</p>}
      {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isEdit ? "Edit Role" : "Create Role"}
        </h2>

        <input
          type="text"
          name="roleName"  // Changed from role_name to roleName
          value={formData.roleName}  // Changed from role_name to roleName
          onChange={handleChange}
          placeholder="Role Name"
          required
          className="border p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-3 rounded mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {isEdit ? "Update Role" : "Create Role"}
        </button>
      </form>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">All Roles</h2>

        {loading ? (
          <p className="text-gray-600">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-600">No roles available.</p>
        ) : (
          <ul>
            {roles.map((role) => (
              <li
                key={role.roleId}  // Use roleId instead of role_id
                className="flex justify-between items-center bg-white p-6 border-b mb-4 rounded-lg shadow-md"
              >
                <div>
                  <h3 className="text-lg font-semibold">Role ID: {role.roleId}</h3>  {/* Use roleId instead of role_id */}
                  <p className="text-gray-700">Role Name: {role.roleName}</p>  {/* Use roleName instead of role_name */}
                  <p className="text-gray-700">Description: {role.description}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => handleEdit(role)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(role.roleId)}  // Use roleId instead of role_id
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Roles;
