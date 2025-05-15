


import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; 

const Openings = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [formData, setFormData] = useState({
    jobDescription: "",
    jobType: "",
    yearOfExperience: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentJobOpeningId, setCurrentJobOpeningId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  // Fetch job openings on page load and page change
  useEffect(() => {
    fetchJobOpenings(currentPage);
  }, [currentPage]);

  const fetchJobOpenings = async (page) => {
    try {
      const response = await axiosInstance.get(`/job-openings/all?page=${page}&size=${pageSize}`);
      const data = response.data.data; 
      setJobOpenings(data.content); 
      setTotalPages(data.totalPages); 
    } catch (err) {
      console.error("Error fetching job openings:", err);
      setError("Failed to fetch job openings.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleCreate = async (e) => {
  e.preventDefault();
  try {
    if (!/^\d+$/.test(formData.yearOfExperience)) {
      setError("Please enter a valid number for years of experience.");
      return;
    }

    await axiosInstance.post("/job-openings", formData);
    setSuccess("Job opening created successfully!");
    setError("");
    fetchJobOpenings(currentPage);
    setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 });

  } catch (err) {
    if (err.response) {
      if (err.response.status === 409) {
        setError("Job opening already exists.");
      } else {
        setError(err.response.data.message || "Failed to create job opening.");
      }
    } else {
      setError("Failed to create job opening.");
    }
    console.error(err);
  }
};

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedData = { ...formData, id: currentJobOpeningId };

      if (!/^\d+$/.test(updatedData.yearOfExperience)) {
        setError("Please enter a valid number for years of experience.");
        return;
      }

      await axiosInstance.post("/job-openings/update", updatedData); 
      setSuccess(`Job opening updated successfully!`);
      setEditing(false);
      fetchJobOpenings(currentPage); 
      setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 }); 
    } catch (err) {
      setError("Failed to update job opening.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Send the DELETE request with the job opening ID
      await axiosInstance.post("/job-openings/delete", { id }); 

      // Show success message
      setSuccess(`Job opening with ID ${id} deleted successfully!`);

      // Fetch updated list of job openings
      fetchJobOpenings(currentPage);
    } catch (err) {
      // Handle error
      setError("Failed to delete job opening.");
      console.error(err);
    }
  };
  

  const handleEdit = (job) => {
    setEditing(true);
    setCurrentJobOpeningId(job.id);
    setFormData({
      jobDescription: job.jobDescription || "",
      jobType: job.jobType || "",
      yearOfExperience: job.yearOfExperience || 0,
    });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Job Openings</h1>

      {success && <p className="text-green-500 text-lg">{success}</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      <form
        onSubmit={editing ? handleUpdate : handleCreate}
        className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {editing ? "Edit Job Opening" : "Create Job Opening"}
        </h2>

        <input
          type="text"
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleChange}
          placeholder="Job Description"
          required
          className="border p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          placeholder="Job Type"
          required
          className="border p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          name="yearOfExperience"
          value={formData.yearOfExperience}
          onChange={handleChange}
          placeholder="Years of Experience"
          required
          className="border p-3 rounded mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {editing ? "Update Job Opening" : "Create Job Opening"}
        </button>
      </form>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">All Job Openings</h2>

        <ul>
          {jobOpenings.length === 0 ? (
            <p className="text-gray-600">No job openings available.</p>
          ) : (
            jobOpenings.map((job) => (
              <li key={job.id} className="flex justify-between items-center bg-white p-6 border-b mb-4 rounded-lg shadow-md">
                <div>
                  <h3 className="text-lg font-semibold">Job Opening ID: {job.id}</h3>
                  <p className="text-gray-700">Job Description: {job.jobDescription}</p>
                  <p className="text-gray-700">Job Type: {job.jobType}</p>
                  <p className="text-gray-700">Years of Experience: {job.yearOfExperience}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
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
      {jobOpenings.length > 0 && (
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
              className={`px-4 py-2 rounded-lg ${
                currentPage === index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              } transition duration-200`}
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
      )}
    </div>
  );
};

export default Openings;
