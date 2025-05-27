import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // fixed import, usually default export
import Layout from "../components/Layout";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // Changed modalForm to support multiple entries in create mode
  // If editing, modalForm is a single object; if creating, it's an array of objects.
  const [modalForm, setModalForm] = useState([
    {
      technology: "",
      question: "",
      answer: "",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);

  // New state for delete confirmation modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || (decoded.role ? [decoded.role] : []);

      if (!roles.includes("ADMIN") && !roles.includes("INTERVIEWER")) {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("Invalid token", err);
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchQuestions();
  }, [filter, page, size]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      let backendFilter = filter.trim();
      if (backendFilter.toLowerCase() === "all") {
        backendFilter = "All";
      }

      const response = await axiosInstance.post(
        `/questions?page=${page}&size=${size}`,
        { filter: backendFilter },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data.data;

      if (data && data.content) {
        setQuestions(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setQuestions(data);
        setTotalPages(1);
      } else if (data) {
        setQuestions([data]);
        setTotalPages(1);
      } else {
        setQuestions([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setError("Not Found");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setModalForm([
      {
        technology: "",
        question: "",
        answer: "",
      },
    ]);
    setShowModal(true);
    setError(null);
  };

  const openEditModal = (q) => {
    setIsEditing(true);
    // Wrap single object for edit mode (no array)
    setModalForm([
      {
        id: q.id,
        technology: q.technology,
        question: q.question,
        answer: q.answer,
      },
    ]);
    setShowModal(true);
    setError(null);
  };

  // Handler for input change (works for both single and multiple entries)
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setModalForm((prevForm) => {
      const updated = [...prevForm];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

 const handleSave = async () => {
  if (isEditing) {
    // Editing single question (first element)
    const { id, technology, question, answer } = modalForm[0];
    if (!technology.trim() || !question.trim() || !answer.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setError(null);
      await axiosInstance.put(
        "/questions/update",
        { id, technology, question, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Question Updated successfully.");
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save question.");
    }
  } else {
    // Creating multiple questions - validate all entries
    for (let i = 0; i < modalForm.length; i++) {
      const { technology, question, answer } = modalForm[i];
      if (!technology.trim() || !question.trim() || !answer.trim()) {
        setError("All fields are required in all entries.");
        return;
      }
    }

    try {
      setError(null);

      const technology = modalForm[0]?.technology || "";

      const payload = {
        filter: "add",
        technology: technology,
        questions: modalForm.map(({ question, answer }) => ({
          question,
          answer,
        })),
      };

      await axiosInstance.post(
        "/questions/add",
        payload,  
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Questions created successfully.");
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save questions.");
    }
  }
};

  // Add more empty entry
  const handleAddMore = () => {
    setModalForm((prevForm) => [
      ...prevForm,
      { technology: "", question: "", answer: "" },
    ]);
  };

  // Remove last entry (only if more than one)
  const handleRemoveLast = () => {
    setModalForm((prevForm) => {
      if (prevForm.length <= 1) return prevForm;
      return prevForm.slice(0, prevForm.length - 1);
    });
  };

  // Open delete confirmation modal instead of window.confirm
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Actual delete after confirmation
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setError(null);
      await axiosInstance.delete("/questions/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: deleteId },
      });

      alert("Question deleted successfully.");
      if (questions.length === 1 && page > 0) setPage(page - 1);
      else fetchQuestions();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete question.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 tracking-wide drop-shadow-md">
          Question Answers
        </h2>

        {/* Filter Input */}
        <div className="mb-3 md:mb-6 max-w-xs">
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder='Filter ("ALL", tech, or ID)'
            className="border border-indigo-300 rounded-md px-3 py-2 w-full"
          />
        </div>
        {successMessage && (
          <div className="bg-green-100 text-green-700 font-semibold px-4 py-2 mb-4 rounded shadow">
            {successMessage}
          </div>
        )}
        {/* Create Button below the filter */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Question
          </button>
        </div>

        {loading ? (
          <div className="text-center text-indigo-700 font-bold mt-6">
            Loading...
          </div>
        ) : (
          <>
            {error && (
              <div className="text-red-600 font-semibold mb-4 text-center">
                {error}
              </div>
            )}

            <table className="table-auto w-full border border-indigo-200 shadow rounded">
              <thead className="bg-indigo-100 text-indigo-900 font-semibold">
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Technology</th>
                  <th className="border px-4 py-2">Question</th>
                  <th className="border px-4 py-2">Answer</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q.id} className="hover:bg-indigo-50">
                      <td className="border px-4 py-2">{q.id}</td>
                      <td className="border px-4 py-2">{q.technology}</td>
                      <td className="border px-4 py-2">{q.question}</td>
                      <td className="border px-4 py-2">{q.answer}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="mr-2 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(q.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-indigo-600 font-semibold py-6"
                    >
                      No Questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="bg-indigo-600 text-white font-bold py-1 px-4 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-semibold text-indigo-900 py-1 px-2">
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page + 1 >= totalPages}
                className="bg-indigo-600 text-white font-bold py-1 px-4 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
              <h3 className="text-2xl font-bold mb-4">
                {isEditing ? "Edit Question" : "Create New Questions"}
              </h3>

              {error && (
                <div className="mb-4 text-red-600 font-semibold">{error}</div>
              )}

              {/* Render multiple question entries when creating */}
              {modalForm.map((entry, index) => (
                <div
                  key={index}
                  className="border border-indigo-300 rounded-md p-4 mb-4"
                >
                  {/* Show ID only when editing */}
                  {isEditing && (
                    <div className="mb-2">
                      <label className="block font-semibold mb-1">ID:</label>
                      <input
                        type="text"
                        name="id"
                        value={entry.id || ""}
                        disabled
                        className="border border-indigo-300 rounded px-3 py-2 w-full"
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="block font-semibold mb-1">
                      Technology:
                    </label>
                    <input
                      type="text"
                      name="technology"
                      value={entry.technology}
                      onChange={(e) => handleInputChange(index, e)}
                      className="border border-indigo-300 rounded px-3 py-2 w-full"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block font-semibold mb-1">Question:</label>
                    <input
                      type="text"
                      name="question"
                      value={entry.question}
                      onChange={(e) => handleInputChange(index, e)}
                      className="border border-indigo-300 rounded px-3 py-2 w-full"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block font-semibold mb-1">Answer:</label>
                    <input
                      type="text"
                      name="answer"
                      value={entry.answer}
                      onChange={(e) => handleInputChange(index, e)}
                      className="border border-indigo-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                </div>
              ))}

              {/* Add More / Remove Last buttons only in create mode */}
              {!isEditing && (
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleAddMore}
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add More
                  </button>
                  <button
                    onClick={handleRemoveLast}
                    type="button"
                    disabled={modalForm.length <= 1}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    Remove Last
                  </button>
                </div>
              )}

              {/* Save and Cancel Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete this question?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuestionsPage;
