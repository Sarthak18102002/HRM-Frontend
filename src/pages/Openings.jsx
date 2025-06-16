// openings.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editing,
  technologies,
}) => {
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
           <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Years Of Experience</label>
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

          {/* Technology Dropdown */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Technology</label>
          <select
            name="tech_id"
            value={formData.tech_id}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300
               transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          >
            <option value="">Select Technology</option>
            {technologies.map((tech) => (
              <option key={tech.tech_id} value={tech.tech_id}>
                {tech.techName}
              </option>
            ))}
          </select>

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
    tech_id: "",
  });
  const [technologies, setTechnologies] = useState([]);
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
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [detailsData, setDetailsData] = React.useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

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
    fetchTechnologies();
  }, []);

  useEffect(() => {
    fetchJobOpenings(currentPage);
  }, [currentPage]);

  const fetchTechnologies = async () => {
    try {
      const res = await axiosInstance.get("/technologies");
      // Set to the array inside content
      setTechnologies(res.data.data.content || []);
    } catch (err) {
      setTechnologies([]);
    }
  };

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

  const handleShowDetails = (jobDetails) => {
    setDetailsData(jobDetails);
    setShowDetailsModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(formData.yearOfExperience)) {
      setError("Please enter a valid number for years of experience.");
      return;
    }
    if (!formData.tech_id) {
      setError("Please select a technology.");
      return;
    }
    try {
      await axiosInstance.post("/job-openings", {
        jobDescription: formData.jobDescription,
        jobType: formData.jobType,
        yearOfExperience: Number(formData.yearOfExperience),
        technology: { tech_id: Number(formData.tech_id) },
      });
      alert("Job opening created successfully!");
      setError("");
      fetchJobOpenings(currentPage);
      setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0, tech_id: "" });
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
    if (!formData.tech_id) {
      setError("Please select a technology.");
      return;
    }
    try {
      const updatedData = {
        id: currentJobOpeningId,
        jobDescription: formData.jobDescription.trim(),
        jobType: formData.jobType.trim(),
        yearOfExperience: Number(formData.yearOfExperience),
        technology: { tech_id: Number(formData.tech_id) },
      };
      const response = await axiosInstance.post("/job-openings/update", updatedData);
      if (response.data.status === 200) {
        alert("Job opening updated successfully!");
        setEditing(false);
        setCurrentJobOpeningId(null);
        setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0, tech_id: "" });
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
      alert(`Job opening deleted successfully!`);
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
    <div className="container mx-auto px-6 py-10 max-w-6xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 tracking-wide drop-shadow-lg text-center">
        Job Openings
      </h1>
      <h3 className="text-xl font-semibold text-gray-700 mb-8 text-center">
        You Can Apply After Clicking on Details..
      </h3>

      {success && <p className="bg-green-100 text-green-700 font-semibold px-4 py-2 mb-4 rounded shadow text-center">{success}</p>}
      {error && <p className="bg-red-100 text-red-700 font-semibold px-4 py-2 mb-4 rounded shadow text-center">{error}</p>}

      {(role?.toLowerCase() === "admin" || role?.toLowerCase() === "interviewer") && (
        <>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                setFormData({ jobDescription: "", jobType: "", yearOfExperience: 0, tech_id: "" });
                setEditing(false);
                setCurrentJobOpeningId(null);
                setError("");
                setSuccess("");
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all duration-200"
            >
              + Add Openings
            </button>
          </div>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={editing ? handleUpdate : handleCreate}
            formData={formData}
            setFormData={setFormData}
            editing={editing}
            technologies={technologies}
          />
        </>
      )}

      <ul className="space-y-8">
        {jobOpenings.length === 0 ? (
          <p className="text-center text-indigo-600 text-lg py-8 font-semibold">No job openings available.</p>
        ) : (
          jobOpenings.map((job) => (
            <li
              key={job.id}
              className="bg-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start gap-8 hover:shadow-2xl transition-shadow duration-300 border-2 border-indigo-100"
            >
              <div className="flex-1">
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-bold text-indigo-600">Technology Name:</span>
                    <span className="ml-2">{job.technology ? job.technology.techName : "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-600">Job Type:</span>
                    <span className="ml-2">{job.jobType}</span>
                  </div>
                  {(role?.toLowerCase() === "admin" || role?.toLowerCase() === "interviewer") && (
                    <div>
                      <span className="font-bold text-indigo-600">Job Description:</span>
                      <span className="ml-2">{job.jobDescription}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-indigo-600">Experience:</span>
                    <span className="ml-2">{job.yearOfExperience} years</span>
                  </div>
                  {job.technology?.techDescription && (
                    <div>
                      <span className="font-bold text-indigo-600">Technology Description:</span>
                      <span className="ml-2">{job.technology.techDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              {(role?.toLowerCase() === "admin" || role?.toLowerCase() === "interviewer") && (
                <div className="flex flex-row gap-3 min-w-[120px]">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setCurrentJobOpeningId(job.id);
                      setFormData({
                        jobDescription: job.jobDescription,
                        jobType: job.jobType,
                        yearOfExperience: job.yearOfExperience.toString(),
                        tech_id: job.technology?.tech_id || "",
                      });
                      setError("");
                      setSuccess("");
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-800 hover:scale-105 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* User Actions */}
              {role?.toLowerCase() === "user" && (
                <div className="flex flex-row items-center gap-2 min-w-[160px]">
                  <button
                    onClick={() => handleShowDetails(job)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2 rounded-xl shadow-lg font-semibold hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-7 9-9 9s-9-4-9-9a9 9 0 1118 0z"
                      />
                    </svg>
                    Details
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {jobOpenings.length > 0 && (
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="font-semibold text-indigo-900 py-2 px-4 bg-indigo-100 rounded-full shadow">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetailsModal && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setShowApplyForm(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold text-center text-indigo-700 mb-6 tracking-wide">
              Job Details
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <span className="font-semibold text-indigo-600">Job Description:</span>
                <span className="ml-2">{detailsData.jobDescription}</span>
              </div>
              <div>
                <span className="font-semibold text-indigo-600">Experience Required:</span>
                <span className="ml-2">{detailsData.yearOfExperience} years</span>
              </div>
              <div>
                <span className="font-semibold text-indigo-600">Job Type:</span>
                <span className="ml-2">{detailsData.jobType}</span>
              </div>
              {detailsData.technology && (
                <>
                  <div>
                    <span className="font-semibold text-indigo-600">Technology:</span>
                    <span className="ml-2">{detailsData.technology.techName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-600">Technology Description:</span>
                    <span className="ml-2">{detailsData.technology.techDescription}</span>
                  </div>
                </>
              )}
            </div>
            {/* User Apply Section */}
            {role?.toLowerCase() === "user" && (
              <div className="flex flex-col items-center mt-8">
                {!showApplyForm ? (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition"
                  >
                    Apply
                  </button>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApply(detailsData.id);
                    }}
                    className="w-full mt-4 flex flex-col items-center"
                  >
                    <label className="block font-medium text-gray-700 mb-2">
                      Attach Resume (PDF):
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeChange}
                      required
                      className="mb-2 block w-full text-sm text-gray-600"
                    />
                    <div className="flex gap-4 mt-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold transition"
                      >
                        Submit Application
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow hover:bg-gray-400 font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Openings;