import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { getUserRoles } from "../utils/authUtils";

const Technologies = () => {
  const roles = getUserRoles();
  const hasFullAccess = roles.includes("admin") || roles.includes("interviewer");

  const [technologies, setTechnologies] = useState([]);
  const [formData, setFormData] = useState({
    techName: "",
    techDescription: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentTechId, setCurrentTechId] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  // New state to control popup visibility
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  // State for delete confirmation popup
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTechId, setDeleteTechId] = useState(null);

  useEffect(() => {
    fetchTechnologies(currentPage);
  }, [currentPage]);

  const fetchTechnologies = async (page) => {
    try {
      const response = await axiosInstance.get(`/technologies?page=${page}&size=${pageSize}`);
      const data = response.data.data;

      if (data && data.content) {
        const normalized = data.content.map((tech) => ({
          techId: tech.tech_id,
          techName: tech.techName,
          techDescription: tech.techDescription,
        }));

        setTechnologies(normalized);
        setTotalPages(data.totalPages);
      } else {
        setError("Unexpected response structure.");
      }
    } catch (err) {
      console.error("Error fetching technologies:", err);
      setError("Failed to fetch technologies.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.techName || !formData.techDescription) {
        setError("Please fill in all fields.");
        return;
      }

      await axiosInstance.post("/technologies", {
        techName: formData.techName,
        techDescription: formData.techDescription,
      });

      setSuccess("Technology created successfully!");
      setError("");
      fetchTechnologies(currentPage);
      setFormData({ techName: "", techDescription: "" });
      setShowCreatePopup(false); // close popup after creation
    } catch (err) {
      console.error(err);
      setError("Failed to create technology.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.techName || !formData.techDescription) {
        setError("Please fill in all fields.");
        return;
      }

      await axiosInstance.post("/technologies/update", {
        tech_id: currentTechId,
        techName: formData.techName,
        techDescription: formData.techDescription,
      });

      setSuccess("Technology updated successfully!");
      setError("");
      setEditing(false);
      fetchTechnologies(currentPage);
      setFormData({ techName: "", techDescription: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to update technology.");
    }
  };

  // Show delete confirmation popup
  const confirmDelete = (id) => {
    setDeleteTechId(id);
    setShowDeletePopup(true);
  };

  // Perform delete after confirmation
  const performDelete = async () => {
    try {
      await axiosInstance.post("/technologies/delete", { tech_id: deleteTechId });

      setSuccess(`Technology with ID ${deleteTechId} deleted successfully!`);
      fetchTechnologies(currentPage);
    } catch (err) {
      console.error(err);
      setError("Failed to delete technology.");
    } finally {
      setShowDeletePopup(false);
      setDeleteTechId(null);
    }
  };

  const handleEdit = (tech) => {
    setEditing(true);
    setCurrentTechId(tech.techId);
    setFormData({
      techName: tech.techName || "",
      techDescription: tech.techDescription || "",
    });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 bg-gradient-to-tr from-blue-50 to-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">
        Technologies
      </h1>

      {success && <p className="text-green-600 text-center mb-4">{success}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {hasFullAccess && (
        <>
          {/* Add button to show popup */}
          {!editing && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  setShowCreatePopup(true);
                  setFormData({ techName: "", techDescription: "" });
                  setError("");
                  setSuccess("");
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Add Technology
              </button>
            </div>
          )}

          {/* Popup Modal for Create Technology */}
          {showCreatePopup && !editing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl w-full mx-4 relative">
                <button
                  onClick={() => setShowCreatePopup(false)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl font-bold"
                  aria-label="Close"
                >
                  &times;
                </button>

                <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
                  Create Technology
                </h2>

                <form onSubmit={handleCreate}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <input
                      type="text"
                      name="techName"
                      value={formData.techName}
                      onChange={handleChange}
                      placeholder="Technology Name"
                      className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="techDescription"
                      value={formData.techDescription}
                      onChange={handleChange}
                      placeholder="Technology Description"
                      className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                  >
                    Create Technology
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Edit form shown inline, as before */}
          {editing && (
            <form
              onSubmit={handleUpdate}
              className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto mb-10 border border-blue-100"
            >
              <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
                Edit Technology
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <input
                  type="text"
                  name="techName"
                  value={formData.techName}
                  onChange={handleChange}
                  placeholder="Technology Name"
                  className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="techDescription"
                  value={formData.techDescription}
                  onChange={handleChange}
                  placeholder="Technology Description"
                  className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Update Technology
              </button>
            </form>
          )}
        </>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          All Technologies
        </h2>

        <div className="grid gap-6">
          {technologies.length === 0 ? (
            <p className="text-gray-600 text-center">No technologies available.</p>
          ) : (
            technologies.map((tech) => (
              <div
                key={tech.techId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div>
                  <p className="text-black-700 text-xxl mt-1 font-bold">
                    Description :{tech.techDescription}
                  </p>
                  <p className="text-black-500 text-xxl mt-1 font-bold">
                    Technology Name :{tech.techName}
                  </p>
                </div>

                {hasFullAccess && (
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEdit(tech)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                    >
                      Update
                    </button>

                    {/* Change here: confirmDelete instead of direct delete */}
                    <button
                      onClick={() => confirmDelete(tech.techId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-4 py-2 rounded ${
              currentPage === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-4 py-2 rounded ${
                i === currentPage
                  ? "bg-blue-700 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-4 relative">
            <h2 className="text-xl font-semibold text-center text-red-600 mb-4">
              Confirm Delete
            </h2>
            <p className="text-center mb-6">
              Are you sure you want to delete this technology?
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
    </div>
  );
};

export default Technologies;
