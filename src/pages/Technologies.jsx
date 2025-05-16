import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { getUserRoles } from "../utils/authUtils";

const Technologies = () => {
  const roles = getUserRoles();
  const isAdmin = roles.includes("ADMIN");

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

  const handleDelete = async (id) => {
    try {
      await axiosInstance.post("/technologies/delete", { tech_id: id });

      setSuccess(`Technology with ID ${id} deleted successfully!`);
      fetchTechnologies(currentPage);
    } catch (err) {
      console.error(err);
      setError("Failed to delete technology.");
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

      {isAdmin && (
        <form
          onSubmit={editing ? handleUpdate : handleCreate}
          className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto mb-10 border border-blue-100"
        >
          <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
            {editing ? "Edit Technology" : "Create Technology"}
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
            {editing ? "Update Technology" : "Create Technology"}
          </button>
        </form>
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
                  <h3 className="text-xl font-semibold text-blue-800">
                    ID: {tech.techId}
                  </h3>
                  <h1>
                  <p className="text-gray-700 text-sm mt-1">Description :{tech.techDescription}</p>
                  <p className="text-gray-500 text-xs mt-1">Technology Name :{tech.techName}</p>
                </h1>
                </div>

                {isAdmin && (
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEdit(tech)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tech.techId)}
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

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Technologies;
