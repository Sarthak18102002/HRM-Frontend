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

  const [formList, setFormList] = useState([
    { technology: "", question: "", answer: "" },
  ]);

  const [form, setForm] = useState({
    id: null,
    technology: "",
    question: "",
    answer: "",
  });

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
      setError("Failed to fetch questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormListChange = (index, e) => {
    const updated = [...formList];
    updated[index][e.target.name] = e.target.value;
    setFormList(updated);
  };

  const addQuestionForm = () => {
    setFormList([...formList, { technology: "", question: "", answer: "" }]);
  };

  const removeQuestionForm = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleCreateMultiple = async () => {
    try {
      setError(null);

      const validForms = formList.filter(
        (q) => q.technology.trim() && q.question.trim() && q.answer.trim()
      );

      if (validForms.length === 0) {
        setError("At least one complete question must be filled out.");
        return;
      }

      await Promise.all(
        validForms.map((payload) =>
          axiosInstance.post("/questions/add", payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      alert("Questions created successfully.");
      setFormList([{ technology: "", question: "", answer: "" }]);
      fetchQuestions();
    } catch (err) {
      console.error("Create failed", err);
      setError("Failed to create questions.");
    }
  };

  const handleUpdate = async () => {
    try {
      setError(null);

      if (!form.id) {
        setError("Select a question to update.");
        return;
      }

      const payload = {
        id: form.id,
        technology: form.technology.trim(),
        question: form.question.trim(),
        answer: form.answer.trim(),
      };

      if (!payload.technology || !payload.question || !payload.answer) {
        setError("All fields are required for updating a question.");
        return;
      }

      await axiosInstance.put("/questions/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Question updated successfully.");
      setForm({ id: null, technology: "", question: "", answer: "" });
      fetchQuestions();
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update question.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete question ID ${id}?`)) return;

    try {
      setError(null);
      await axiosInstance.delete("/questions/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });

      alert("Question deleted successfully.");
      if (questions.length === 1 && page > 0) setPage(page - 1);
      else fetchQuestions();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete question.");
    }
  };

  const handleEdit = (q) => {
    setForm({
      id: q.id,
      technology: q.technology,
      question: q.question,
      answer: q.answer,
    });
    window.scrollTo(0, 0);
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
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
          Questions Manager
        </h2>

        {/* Create/Update Form */}
        <div className="mb-8 bg-indigo-50 rounded-lg p-6 border border-indigo-200 shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-900">
            {form.id ? "Update Question" : "Create New Question(s)"}
          </h3>

          {error && (
            <div className="mb-4 text-red-700 font-semibold bg-red-100 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {form.id ? (
            <>
              {/* Single update form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-indigo-800">Technology</label>
                  <input
                    type="text"
                    name="technology"
                    value={form.technology}
                    onChange={(e) => setForm({ ...form, technology: e.target.value })}
                    className="w-full rounded-md border border-indigo-300 px-3 py-2"
                    placeholder="e.g., Java, React"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-indigo-800">Question</label>
                  <textarea
                    name="question"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-indigo-300 px-3 py-2 resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-indigo-800">Answer</label>
                  <textarea
                    name="answer"
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-indigo-300 px-3 py-2 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => setForm({ id: null, technology: "", question: "", answer: "" })}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Dynamic create form list */}
              {formList.map((form, index) => (
                <div
                  key={index}
                  className="mb-6 border-b border-indigo-200 pb-4 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div>
                    <label className="block mb-2 font-semibold text-indigo-800">Technology</label>
                    <input
                      type="text"
                      name="technology"
                      value={form.technology}
                      onChange={(e) => handleFormListChange(index, e)}
                      className="w-full rounded-md border border-indigo-300 px-3 py-2"
                      placeholder="e.g., Java, React"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-indigo-800">Question</label>
                    <textarea
                      name="question"
                      value={form.question}
                      onChange={(e) => handleFormListChange(index, e)}
                      rows={3}
                      className="w-full rounded-md border border-indigo-300 px-3 py-2 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-indigo-800">Answer</label>
                    <textarea
                      name="answer"
                      value={form.answer}
                      onChange={(e) => handleFormListChange(index, e)}
                      rows={3}
                      className="w-full rounded-md border border-indigo-300 px-3 py-2 resize-none"
                    />
                  </div>
                  {formList.length > 1 && (
                    <button
                      onClick={() => removeQuestionForm(index)}
                      className="text-red-600 hover:text-red-800 font-semibold mt-2 col-span-3"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div className="flex gap-4">
                <button
                  onClick={addQuestionForm}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                >
                  Add More
                </button>
                <button
                  onClick={handleCreateMultiple}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
                >
                  Create All
                </button>
              </div>
            </>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6">
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder='Filter ("ALL", tech, or ID)'
            className="border border-indigo-300 rounded-md px-3 py-2 mr-3"
          />
          <button
            onClick={fetchQuestions}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Fetch
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-indigo-200 rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-indigo-100">
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
                    <td className="border px-4 py-2 whitespace-pre-wrap">{q.question}</td>
                    <td className="border px-4 py-2 whitespace-pre-wrap">{q.answer}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(q)}
                        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-indigo-800 font-semibold">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionsPage;
