import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  // For create mode: array of questions; for edit mode: single object
  const [modalForm, setModalForm] = useState([{ technology: "", question: "", answer: "" }]);

  const [isEditing, setIsEditing] = useState(false);

  // Delete confirmation modal state
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Role validation
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

  // Fetch questions when filter, page, or size changes
  useEffect(() => {
    fetchQuestions();
  }, [filter, page, size]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      let backendFilter = filter.trim();
      if (backendFilter.toLowerCase() === "all") backendFilter = "All";

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

  // Open create modal (multiple entries allowed)
  const openCreateModal = () => {
    setIsEditing(false);
    setModalForm([{ technology: "", question: "", answer: "" }]);
    setShowModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Open edit modal (single entry)
  const openEditModal = (q) => {
    setIsEditing(true);
    setModalForm({ id: q.id, technology: q.technology, question: q.question, answer: q.answer });
    setShowModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle input change for modal form
  // Works for create (array) and edit (object)
  const handleInputChange = (indexOrEvent, e) => {
    if (isEditing) {
      // indexOrEvent is event here
      const { name, value } = indexOrEvent.target;
      setModalForm((prev) => ({ ...prev, [name]: value }));
    } else {
      // indexOrEvent is index, e is event
      const index = indexOrEvent;
      const { name, value } = e.target;
      setModalForm((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
      );
    }
  };

  // Add more inputs in create mode
  const handleAddMore = () => {
    setModalForm((prev) => [...prev, { technology: "", question: "", answer: "" }]);
  };

  // Remove last input in create mode
  const handleRemoveLast = () => {
    setModalForm((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };
  const handleRemoveAt = (indexToRemove) => {
    setModalForm((prevForm) => prevForm.filter((_, i) => i !== indexToRemove));
  };
  // Save (create or update)
  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    if (isEditing) {
      // Validate single form
      const { technology, question, answer, id } = modalForm;
      if (!technology.trim() || !question.trim() || !answer.trim()) {
        setError("All fields are required.");
        return;
      }
      try {
        await axiosInstance.put(
          "/questions/update",
          { id, technology, question, answer },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Question updated successfully.");
        setShowModal(false);
        fetchQuestions();
      } catch (err) {
        console.error("Update failed", err);
        setError("Failed to update question.");
      }
    } else {
      // Validate all forms in create mode
      for (let i = 0; i < modalForm.length; i++) {
        const { technology, question, answer } = modalForm[i];
        if (!technology.trim() || !question.trim() || !answer.trim()) {
          setError("All fields are required for all entries.");
          return;
        }
      }
      try {
        // Post each question sequentially or modify backend to accept batch
        for (const q of modalForm) {
          await axiosInstance.post(
            "/questions/add",
            { technology: q.technology, question: q.question, answer: q.answer },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        alert("Questions created successfully.");
        setShowModal(false);
        fetchQuestions();
      } catch (err) {
        console.error("Create failed", err);
        setError("Failed to create questions.");
      }
    }
  };

  // Confirm delete modal open
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Handle actual delete
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

        {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
        {successMessage && <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>}
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

        {/* Modal for create or update */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold mb-4">
                {isEditing ? "Update Question" : "Create Questions"}
              </h3>

              {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

              {/* Editing single question */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Technology</label>
                    <input
                      type="text"
                      name="technology"
                      value={modalForm.technology}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Question</label>
                    <textarea
                      name="question"
                      value={modalForm.question}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Answer</label>
                    <textarea
                      name="answer"
                      value={modalForm.answer}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              ) : (
                // Creating multiple questions
                modalForm.map((item, index) => (
                  <div key={index} className="mb-6 border border-gray-300 rounded p-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      {!isEditing && modalForm.length > 1 && (
                        <button
                          onClick={() => handleRemoveAt(index)}
                          type="button"
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Technology</label>
                      <input
                        type="text"
                        name="technology"
                        value={item.technology}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border border-gray-300 rounded p-2"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Question</label>
                      <textarea
                        name="question"
                        value={item.question}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border border-gray-300 rounded p-2"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Answer</label>
                      <textarea
                        name="answer"
                        value={item.answer}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border border-gray-300 rounded p-2"
                      />
                    </div>
                  </div>
                ))
              )}

              {/* Only Add More button in create mode */}
              {!isEditing && (
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleAddMore}
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add More
                  </button>
                </div>
              )}

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

        {/* Delete confirmation modal */}
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
