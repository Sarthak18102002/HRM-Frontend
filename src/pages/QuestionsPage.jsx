import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Layout from "../components/Layout";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async () => {
    try {
      setError(null);
      const payload = {
        technology: form.technology.trim(),
        question: form.question.trim(),
        answer: form.answer.trim(),
      };

      if (!payload.technology || !payload.question || !payload.answer) {
        setError("All fields are required for creating a question.");
        return;
      }

      await axiosInstance.post("/questions/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Question created successfully.");
      setForm({ technology: "", question: "", answer: "" });
      fetchQuestions();
    } catch (err) {
      console.error("Create failed", err);
      setError("Failed to create question.");
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
    if (!window.confirm(`Are you sure you want to delete question ID ${id}?`))
      return;

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

      {/* Create / Update Form */}
      <div className="mb-8 bg-indigo-50 rounded-lg p-6 border border-indigo-200 shadow-sm">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-900">
          {form.id ? "Update Question" : "Create New Question"}
        </h3>

        {error && (
          <div className="mb-4 text-red-700 font-semibold bg-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-indigo-800">
              Technology
            </label>
            <input
              type="text"
              name="technology"
              value={form.technology}
              onChange={handleFormChange}
              className="w-full rounded-md border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 transition"
              placeholder="e.g., Java, React"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block mb-2 font-semibold text-indigo-800">
              Question
            </label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleFormChange}
              rows={3}
              className="w-full rounded-md border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 transition resize-none"
              placeholder="Enter the question here"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block mb-2 font-semibold text-indigo-800">
              Answer
            </label>
            <textarea
              name="answer"
              value={form.answer}
              onChange={handleFormChange}
              rows={3}
              className="w-full rounded-md border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 transition resize-none"
              placeholder="Enter the answer here"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          {form.id ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded shadow-md transition"
              >
                Update
              </button>
              <button
                onClick={() =>
                  setForm({ id: null, technology: "", question: "", answer: "" })
                }
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-5 py-2 rounded shadow-md transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded shadow-md transition"
            >
              Create
            </button>
          )}
        </div>
      </div>

    {/* Filter */}
<div className="mb-6 flex flex-col gap-3">
  <p className="text-sm text-gray-600 max-w-md">
    Enter <span className="font-semibold">"ALL"</span> to fetch all questions, or a technology name (e.g., <span className="italic">Java</span>), or a question ID.
  </p>
  <div className="flex gap-3 w-full max-w-sm">
    <input
      type="text"
      placeholder='Filter ("ALL", tech name, or ID)'
      value={filter}
      onChange={handleFilterChange}
      className="border border-indigo-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-grow"
    />
    <button
      onClick={fetchQuestions}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded shadow-md transition"
    >
      Fetch
    </button>
  </div>
</div>


      {/* Loading & Error */}
      {loading && (
        <div className="mb-4 text-indigo-600 font-semibold text-center">
          Loading questions...
        </div>
      )}
      {error && !form.id && (
        <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
      )}

      {/* Questions Table */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-indigo-200">
        <table className="w-full table-auto min-w-[700px]">
          <thead className="bg-indigo-100 text-indigo-900 text-left">
            <tr>
              <th className="border px-4 py-3">ID</th>
              <th className="border px-4 py-3">Technology</th>
              <th className="border px-4 py-3">Question</th>
              <th className="border px-4 py-3">Answer</th>
              <th className="border px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length > 0 ? (
              questions.map((q) => (
                <tr
                  key={q.id}
                  className="even:bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <td className="border px-4 py-2 align-top">{q.id}</td>
                  <td className="border px-4 py-2 align-top">{q.technology}</td>
                  <td className="border px-4 py-2 align-top whitespace-pre-wrap">{q.question}</td>
                  <td className="border px-4 py-2 align-top whitespace-pre-wrap">{q.answer}</td>
                  <td className="border px-4 py-2 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => handleEdit(q)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded shadow-sm"
                      aria-label={`Edit question ${q.id}`}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm "
                      aria-label={`Delete question ${q.id}`}
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
                  className="border px-4 py-4 text-center text-gray-500 font-semibold"
                >
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handlePrevPage}
          disabled={page === 0}
          className="bg-indigo-300 hover:bg-indigo-400 disabled:bg-indigo-100 text-indigo-900 font-semibold px-5 py-2 rounded shadow-md transition disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="font-medium text-indigo-700">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages - 1}
          className="bg-indigo-300 hover:bg-indigo-400 disabled:bg-indigo-100 text-indigo-900 font-semibold px-5 py-2 rounded shadow-md transition disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
    </Layout>
  );
};

export default QuestionsPage;
