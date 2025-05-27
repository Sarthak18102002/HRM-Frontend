import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal state

  // New states for delete confirmation
  const [roleIdToDelete, setRoleIdToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/roles");
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
          roleId: currentRoleId,
        });
        setSuccess("Role updated successfully!");
      } else {
        await axiosInstance.post("/roles/create", formData);
        setSuccess("Role created successfully!");
      }
      setFormData({ roleName: "", description: "" });
      setIsEdit(false);
      setCurrentRoleId(null);
      setShowModal(false);
      fetchRoles();
      setError("");
    } catch (err) {
      setError("Failed to save role.");
      console.error(err);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      roleName: role.roleName,
      description: role.description,
    });
    setCurrentRoleId(role.roleId);
    setIsEdit(true);
    setShowModal(true);
  };

  // Instead of direct delete, show confirmation popup
  const confirmDelete = (id) => {
    setRoleIdToDelete(id);
    setShowDeletePopup(true);
  };

  // Actual delete call on confirmation
  const performDelete = async () => {
    if (!roleIdToDelete) return;
    try {
      await axiosInstance.delete(`/roles/${roleIdToDelete}`);
      setSuccess(`Role with ID ${roleIdToDelete} deleted.`);
      setError("");
      fetchRoles();
    } catch (err) {
      setError("Failed to delete role.");
      console.error(err);
    } finally {
      setShowDeletePopup(false);
      setRoleIdToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Role Management</h1>

      {success && <p className="text-green-500 text-lg mb-4">{success}</p>}
      {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

      {/* Centered Add Role Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            setIsEdit(false);
            setFormData({ roleName: "", description: "" });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out"
        >
          Add Role
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in-up">

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl transition duration-200"
              title="Close"
            >
              ×
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
                {isEdit ? "Edit Role" : "Create Role"}
              </h2>

              {/* Role Name */}
              <div className="mb-4">
                <label className="block text-gray-600 mb-1 font-medium">Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Enter role name"
                  required
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-600 mb-1 font-medium">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-full font-semibold hover:scale-105 shadow-md hover:shadow-lg transition-transform duration-300"
              >
                {isEdit ? "Update Role" : "Create Role"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-4 relative">
            <h2 className="text-xl font-semibold text-center text-red-600 mb-4">
              Confirm Delete
            </h2>
            <p className="text-center mb-6">
              Are you sure you want to delete this role?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={performDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                key={role.roleId}
                className="flex justify-between items-center bg-white p-6 border-b mb-4 rounded-lg shadow-md"
              >
                <div>
                  <p className="text-gray-700 ">Role Name: {role.roleName}</p>
                  <p className="text-gray-700 ">Description: {role.description}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => handleEdit(role)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Update
                  </button>
                  {/* Change here: call confirmDelete instead of direct delete */}
                  <button
                    onClick={() => confirmDelete(role.roleId)}
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
