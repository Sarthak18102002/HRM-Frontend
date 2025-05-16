// openings .jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

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
        <form
          onSubmit={editing ? handleUpdate : handleCreate}
          className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto mb-12"
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
            className="border p-3 rounded mb-4 w-full"
          />
          <input
            type="text"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            placeholder="Job Type"
            required
            className="border p-3 rounded mb-4 w-full"
          />
          <input
            type="number"
            name="yearOfExperience"
            value={formData.yearOfExperience}
            onChange={handleChange}
            placeholder="Years of Experience"
            min={0}
            required
            className="border p-3 rounded mb-6 w-full"
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              {editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setCurrentJobOpeningId(null);
                  setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0 });
                  setError("");
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <ul>
        {jobOpenings.length === 0 ? (
          <p>No job openings available.</p>
        ) : (
          jobOpenings.map((job) => (
            <li key={job.id} className="bg-white p-6 mb-4 rounded-lg shadow-md flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold">ID: {job.id}</h3>
                <p>Job Description: {job.jobDescription}</p>
                <p>Job Type: {job.jobType}</p>
                <p>Experience: {job.yearOfExperience} years</p>
              </div>

              {role?.toLowerCase() === "admin" && (
                <div className="space-x-4">
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
              className={`px-4 py-2 rounded ${
                currentPage === index ? "bg-blue-600 text-white" : "bg-gray-200"
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
