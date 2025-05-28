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
      <div className="container mx-auto px-6 py-10 max-w-6xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 tracking-wide drop-shadow-lg text-center">
          Question Answers
        </h2>

        {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}
        {successMessage && (
          <div className="bg-green-100 text-green-700 font-semibold px-4 py-2 mb-4 rounded shadow text-center">
            {successMessage}
          </div>
        )}

        <div className="mb-8 max-w-xs">
          <label className="block mb-2 text-indigo-700 font-medium">
            Filter ("ALL", tech, or ID)
          </label>
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Type to filter..."
            className="border-2 border-indigo-300 rounded-lg px-4 py-2 w-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
            className="mt-4 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 w-full md:w-auto"
          >
            + Create New Question
          </button>
        </div>


        {loading ? (
          <div className="text-center text-indigo-700 font-bold mt-6 animate-pulse">
            Loading...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl shadow-lg">
              <table className="min-w-full bg-white rounded-2xl overflow-hidden">
                <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left">ID</th>
                    <th className="px-6 py-3 text-left">Technology</th>
                    <th className="px-6 py-3 text-left">Question</th>
                    <th className="px-6 py-3 text-left">Answer</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length > 0 ? (
                    questions.map((q) => (

                      <tr key={q.id} className="hover:bg-indigo-50 transition">
                        <td className="px-6 py-4 border-b">{q.id}</td>
                        <td className="px-6 py-4 border-b">{q.technology}</td>
                        <td className="px-6 py-4 border-b">{q.question}</td>
                        <td className="px-6 py-4 border-b">{q.answer}</td>
                        <td className="px-6 py-4 border-b text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => openEditModal(q)}
                              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => confirmDelete(q.id)}
                              className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-800 hover:scale-105 transition-all duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-indigo-600 font-semibold py-8">
                        No Questions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <span className="font-semibold text-indigo-900 py-2 px-4 bg-indigo-100 rounded-full shadow">
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page + 1 >= totalPages}
                className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Modal for create or update */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-indigo-100">
              <h3 className="text-2xl font-bold mb-6 text-indigo-700 text-center">
                {isEditing ? "Update Question" : "Create Questions"}
              </h3>

              {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

              {/* Editing single question */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium text-indigo-700">Technology</label>
                    <input
                      type="text"
                      name="technology"
                      value={modalForm.technology}
                      onChange={handleInputChange}
                      className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-indigo-700">Question</label>
                    <textarea
                      name="question"
                      value={modalForm.question}
                      onChange={handleInputChange}
                      className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-indigo-700">Answer</label>
                    <textarea
                      name="answer"
                      value={modalForm.answer}
                      onChange={handleInputChange}
                      className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              ) : (
                // Creating multiple questions
                modalForm.map((item, index) => (
                  <div key={index} className="mb-6 border-2 border-indigo-100 rounded-xl p-4 relative shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-indigo-700">Question {index + 1}</h4>
                      {!isEditing && modalForm.length > 1 && (
                        <button
                          onClick={() => handleRemoveAt(index)}
                          type="button"
                          className="text-pink-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium text-indigo-700">Technology</label>
                      <input
                        type="text"
                        name="technology"
                        value={item.technology}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium text-indigo-700">Question</label>
                      <textarea
                        name="question"
                        value={item.question}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium text-indigo-700">Answer</label>
                      <textarea
                        name="answer"
                        value={item.answer}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow transition"
                  >
                    Add More
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-pink-100">
              <h3 className="text-xl font-bold mb-4 text-pink-700 text-center">Confirm Delete</h3>
              <p className="mb-6 text-center text-gray-700">Are you sure you want to delete this question?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                 className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                 className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-800 hover:scale-105 transition-all duration-200"
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
