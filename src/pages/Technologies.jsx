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
    <div className="container mx-auto px-6 py-10 max-w-6xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 tracking-wide drop-shadow-lg text-center">
        Technologies
      </h1>

      {success && <p className="bg-green-100 text-green-700 font-semibold px-4 py-2 mb-4 rounded shadow text-center">{success}</p>}
      {error && <p className="bg-red-100 text-red-700 font-semibold px-4 py-2 mb-4 rounded shadow text-center">{error}</p>}

      {hasFullAccess && (
        <>
          {!editing && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => {
                  setShowCreatePopup(true);
                  setFormData({ techName: "", techDescription: "" });
                  setError("");
                  setSuccess("");
                }}
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all duration-200"
              >
                + Add Technology
              </button>
            </div>
          )}

          {/* Create Technology Modal */}
          {showCreatePopup && !editing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border-2 border-indigo-100 relative">
                <button
                  onClick={() => setShowCreatePopup(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold text-center text-indigo-700 mb-6 tracking-wide">
                  Create Technology
                </h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <input
                    type="text"
                    name="techName"
                    value={formData.techName}
                    onChange={handleChange}
                    placeholder="Technology Name"
                    className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <input
                    type="text"
                    name="techDescription"
                    value={formData.techDescription}
                    onChange={handleChange}
                    placeholder="Technology Description"
                    className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow transition"
                  >
                    Create Technology
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Edit Technology Inline Form */}
          {editing && (
            <form
              onSubmit={handleUpdate}
              className="bg-white p-8 rounded-2xl shadow-xl max-w-lg mx-auto mb-10 border-2 border-indigo-100"
            >
              <h2 className="text-2xl font-extrabold text-center text-indigo-700 mb-6 tracking-wide">
                Edit Technology
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="techName"
                  value={formData.techName}
                  onChange={handleChange}
                  placeholder="Technology Name"
                  className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  name="techDescription"
                  value={formData.techDescription}
                  onChange={handleChange}
                  placeholder="Technology Description"
                  className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow transition"
              >
                Update Technology
              </button>
            </form>
          )}
        </>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6">All Technologies</h2>
        <div className="space-y-6">
          {technologies.length === 0 ? (
            <p className="text-indigo-600 text-center font-semibold">No technologies available.</p>
          ) : (
            technologies.map((tech) => (
              <div
                key={tech.techId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-2 border-indigo-100 rounded-xl hover:shadow-lg transition"
              >
                <div>
                  <p className="text-lg font-semibold text-indigo-800">
                    Technology Name: <span className="font-normal text-gray-700">{tech.techName}</span>
                  </p>
                  <p className="text-md text-gray-700 mt-1">
                    Description: <span className="font-normal">{tech.techDescription}</span>
                  </p>
                </div>
                {hasFullAccess && (
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEdit(tech)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg transition-all duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => confirmDelete(tech.techId)}
                      className="bg-gradient-to-r from-purple-500 to-indigo-700 hover:from-purple-600 hover:to-indigo-800 text-white font-semibold px-5 py-2 rounded-xl shadow-lg transition-all duration-200"
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
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`py-2 px-4 rounded-full font-semibold shadow ${
                i === currentPage
                  ? "bg-indigo-700 text-white"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-pink-100">
            <h2 className="text-xl font-bold mb-4 text-pink-700 text-center">Confirm Delete</h2>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to delete this technology?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={performDelete}
                className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-red-600 hover:to-red-800 text-white font-bold py-2 px-6 rounded-xl shadow"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl shadow"
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
