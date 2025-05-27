// openings.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

const Modal = ({ isOpen, onClose, onSubmit, formData, setFormData, editing }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700 tracking-wide">
          {editing ? "Edit Job Opening" : "Create Job Opening"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="space-y-6"
        >
          <input
            type="text"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="Job Description"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300
               transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <input
            type="text"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            placeholder="Job Type"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300
               transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <input
            type="number"
            name="yearOfExperience"
            value={formData.yearOfExperience}
            onChange={handleChange}
            placeholder="Years of Experience"
            min={0}
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300
               transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />

          <div className="flex space-x-6 justify-center">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg
                 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400
                 transition duration-300"
            >
              {editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md
                 hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300
                 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

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

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const [role, setRole] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.userRole || decoded.roles?.[0] || null);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchJobOpenings(currentPage);
  }, [currentPage]);

  const fetchJobOpenings = async (page) => {
    try {
      const response = await axiosInstance.get(
        `/job-openings/all?page=${page}&size=${pageSize}`
      );
      const data = response.data.data;
      setJobOpenings(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching job openings:", err);
      setError("Failed to fetch job openings.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(formData.yearOfExperience)) {
      setError("Please enter a valid number for years of experience.");
      return;
    }
    try {
      await axiosInstance.post("/job-openings", formData);
      setSuccess("Job opening created successfully!");
      setError("");
      fetchJobOpenings(currentPage);
      setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job opening.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(formData.yearOfExperience)) {
      setError("Please enter a valid number for years of experience.");
      return;
    }
    try {
      const updatedData = {
        id: currentJobOpeningId,
        jobDescription: formData.jobDescription.trim(),
        jobType: formData.jobType.trim(),
        yearOfExperience: Number(formData.yearOfExperience),
      };
      const response = await axiosInstance.post("/job-openings/update", updatedData);
      if (response.data.status === 200) {
        setSuccess("Job opening updated successfully!");
        setEditing(false);
        setCurrentJobOpeningId(null);
        setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 });
        fetchJobOpenings(currentPage);
        setIsModalOpen(false);
      } else {
        setError(response.data.message || "Failed to update job opening.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("An error occurred while updating the job opening.");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this job opening?")) return;
      await axiosInstance.post("/job-openings/delete", { id });
      setSuccess(`Job opening with ID ${id} deleted successfully!`);
      fetchJobOpenings(currentPage);
    } catch (err) {
      setError("Failed to delete job opening.");
      console.error(err);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleApply = async (jobOpeningId) => {
    if (!resumeFile) {
      setError("Please select a resume file.");
      return;
    }

    const applyFormData = new FormData();
    applyFormData.append("jobOpeningId", jobOpeningId);
    applyFormData.append("file", resumeFile);

    try {
      const response = await fetch("http://localhost:8080/api/job/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: applyFormData,
      });

      let result = { message: "Unknown error" };
      try {
        result = await response.json();
      } catch (err) {
        console.warn("Non-JSON response");
      }

      if (response.ok) {
        alert(result.message || "Application submitted successfully!");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed.");
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Job Openings</h1>

      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {role?.toLowerCase() === "admin" && (
        <>
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 });
                setEditing(false);
                setCurrentJobOpeningId(null);
                setError("");
                setSuccess("");
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out"
            >
              Add Openings
            </button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={editing ? handleUpdate : handleCreate}
            formData={formData}
            setFormData={setFormData}
            editing={editing}
          />
        </>
      )}

      <ul>
        {jobOpenings.length === 0 ? (
          <p>No job openings available.</p>
        ) : (
          jobOpenings.map((job) => (
            <li
              key={job.id}
              className="bg-white p-6 mb-4 rounded-lg shadow-md flex justify-between items-start gap-4"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  Job Description: {job.jobDescription}
                </h3>
                <h3 className="text-lg font-semibold"> Job Type: {job.jobType}</h3>
                <h3 className="text-lg font-semibold">
                  Experience: {job.yearOfExperience} years
                </h3>
              </div>

              {role?.toLowerCase() === "admin" && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setCurrentJobOpeningId(job.id);
                      setFormData({
                        jobDescription: job.jobDescription,
                        jobType: job.jobType,
                        yearOfExperience: job.yearOfExperience.toString(),
                      });
                      setError("");
                      setSuccess("");
                      setIsModalOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}

              {role?.toLowerCase() === "user" && (
                <>
                    <button
                      onClick={() =>
                        setApplyingJobId(applyingJobId === job.id ? null : job.id)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-fit"
                    >
                      {applyingJobId === job.id ? "Cancel" : "Apply"}
                    </button>

                  {applyingJobId === job.id && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApply(job.id);
                      }}
                      className="mt-4"
                    >
                      <label className="block mb-2 font-medium">Upload Resume (PDF):</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeChange}
                        className="mb-4"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Submit Application
                      </button>
                    </form>
                  )}
                </>
              )}
            </li>
          ))
        )}
      </ul>

      {jobOpenings.length > 0 && (
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`px-4 py-2 rounded ${currentPage === index ? "bg-blue-600 text-white" : "bg-gray-300"
                }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Openings;
