import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const Technologies = () => {
  const [technologies, setTechnologies] = useState([]);
  const [formData, setFormData] = useState({
    techName: "",
    techDescription: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentTechId, setCurrentTechId] = useState(null);

  // Pagination
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
        id: currentTechId,
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
      // Send the id as part of the request payload
      await axiosInstance.post("/technologies/delete", { tech_id: id });
  
      setSuccess(`Technology with ID ${id} deleted successfully!`);
      fetchTechnologies(currentPage);  // Refresh the list after deletion
    } catch (err) {
      console.error(err);
      setError("Failed to delete technology.");
    }
  };
  const handleEdit = (tech) => {
    setEditing(true);
    setCurrentTechId(tech.tech_id); // use consistent key
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
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Technologies</h1>

      {success && <p className="text-green-500 text-lg">{success}</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      <form
        onSubmit={editing ? handleUpdate : handleCreate}
        className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {editing ? "Edit Technology" : "Create Technology"}
        </h2>

        <input
          type="text"
          name="techName"
          value={formData.techName}
          onChange={handleChange}
          placeholder="Technology Name"
          required
          className="border p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="techDescription"
          value={formData.techDescription}
          onChange={handleChange}
          placeholder="Technology Description"
          required
          className="border p-3 rounded mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {editing ? "Update Technology" : "Create Technology"}
        </button>
      </form>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">All Technologies</h2>

        <ul>
          {technologies.length === 0 ? (
            <p className="text-gray-600">No technologies available.</p>
          ) : (
               technologies.map((tech) => (
              <li
                key={tech.techId}
                className="flex justify-between items-center bg-white p-6 border-b mb-4 rounded-lg shadow-md"
              >
                <div>
                <h3 className="text-lg font-semibold">Technology ID: {tech.techId}</h3>
                  <p className="text-gray-700">Name: {tech.techName}</p>
                  <p className="text-gray-700">Description: {tech.techDescription}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => handleEdit(tech)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tech.techId)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))  
          )}
        </ul>
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center items-center space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700 disabled:opacity-50 transition duration-200"
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index)}
            className={`px-4 py-2 rounded-lg ${currentPage === index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} transition duration-200`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700 disabled:opacity-50 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Technologies;
