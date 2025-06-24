import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Utility to get user role from token or localStorage (updated to include INTERVIEWER as ADMIN-equivalent)
const getUserRole = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.roles?.includes('ADMIN') || payload.roles?.includes('INTERVIEWER')) {
      return 'ADMIN'; // Treat INTERVIEWER as ADMIN
    }
    return 'USER';
  } catch {
    return null;
  }
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(['all']); // NEW: filter state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const role = getUserRole();
  const navigate = useNavigate();

  const extractFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split('\\').pop().split('/').pop();
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (role === 'ADMIN') {
        // POST with filters in body
        const url = `http://localhost:8080/api/job/all?page=${page}&size=${size}`;
        const response = await axios.post(
          url,
          { filters },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data.data;
        setApplications(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      } else {
        // GET for user
        const url = `http://localhost:8080/api/job/my-applications?page=${page}&size=${size}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data;
        setApplications(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching applications', err);
      setError('Failed to load applications.');
    }
    setLoading(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
  };

 const updateStatus = async (id) => {
  const token = localStorage.getItem('authToken');
  const status = statusMap[id];
  if (!status) {
    alert('Please select a status before updating.');
    return;
  }

  try {
    await axios.put(
      `http://localhost:8080/api/job/update-status`,
      { id, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Status updated!');
    fetchApplications();
    setStatusMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  } catch (err) {
    console.error('Failed to update status', err);
    alert('Failed to update status. Please try again.');
  }
};

  const handleScheduleInterview = (app) => {
    navigate('/schedule-interview', {
      state: {
        userId: app.userId,
        interviewerId: app.interviewerId,
        interviewerEmail: app.interviewerEmail,
      },
    });
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [page, role, filters]); // add filters as dependency

  // Filter UI for ADMIN
  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === 'all') {
      setFilters(['all']);
    } else {
      setFilters((prev) => {
        const newFilters = prev.includes('all')
          ? [value]
          : prev.includes(value)
            ? prev.filter((f) => f !== value)
            : [...prev, value];
        return newFilters.length === 0 ? ['all'] : newFilters;
      });
    }
    setPage(0); // Reset to first page on filter change
  };

  // Helper for toggling filter selection
  const toggleFilter = (value) => {
    setFilters((prev) => {
      if (value === 'all') return ['all'];
      let newFilters = prev.includes('all')
        ? [value]
        : prev.includes(value)
          ? prev.filter((f) => f !== value)
          : [...prev, value];
      if (newFilters.length === 0) newFilters = ['all'];
      return newFilters;
    });
    setPage(0);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-extrabold mb-8 text-center text-indigo-800 tracking-wide drop-shadow-lg">
        {role === 'ADMIN' ? 'All Job Applications' : 'My Job Applications'}
      </h2>

      {/* Custom Multi-select Filter Dropdown for ADMIN */}
      {role === 'ADMIN' && (
        <div className="mb-6 relative w-72 mx-auto">
          <label className="block text-sm font-medium text-indigo-700 mb-2">
            Filter by Status:
          </label>
          <button
            type="button"
            className="w-full border border-indigo-300 rounded-md px-3 py-2 text-indigo-700 font-semibold bg-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 flex justify-between items-center"
            onClick={() => setFilterDropdownOpen((open) => !open)}
          >
            <span>
              {filters.includes('all')
                ? 'All'
                : filters.map(
                  (f) =>
                    filterOptions.find((opt) => opt.value === f)?.label || f
                ).join(', ')}
            </span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {filterDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-indigo-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filterOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.includes(option.value) ||
                      (option.value === 'all' && filters.length === 0)
                    }
                    onChange={() => toggleFilter(option.value)}
                    className="mr-2 accent-indigo-600"
                    disabled={
                      option.value === 'all' && filters.length === 1 && filters[0] === 'all'
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
          {/* Click outside to close dropdown */}
          {filterDropdownOpen && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setFilterDropdownOpen(false)}
              tabIndex={-1}
            />
          )}
        </div>
      )}

      {loading ? (
        <p className="text-center text-indigo-700 font-bold text-lg animate-pulse">
          Loading...
        </p>
      ) : error ? (
        <p className="text-center bg-red-100 text-red-700 font-semibold px-4 py-2 mb-4 rounded shadow">
          {error}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl shadow-lg">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 font-semibold">
                  {(role === 'ADMIN' || role === 'INTERVIEWER') && (
                    <th scope="col" className="px-6 py-3 text-left">Sr.No</th>
                  )}
            
                  <th scope="col" className="px-6 py-3 text-left">Applied For</th>
                  <th scope="col" className="px-6 py-3 text-left">Resume</th>
                  <th scope="col" className="px-6 py-3 text-left">Interviewer Email</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                  {role === 'ADMIN' && (
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === 'ADMIN' ? 6 : 5}
                      className="py-8 text-indigo-600 text-center font-semibold"
                    >
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((app, idx) => (
                    <tr key={app.id} className="hover:bg-indigo-50 transition">
                      {(role === 'ADMIN' || role === 'INTERVIEWER') && (
                        <td className="px-6 py-4 border-b">
                          {page * size + idx + 1}
                        </td>
                      )}
                      <td className="px-6 py-4 border-b">{app.jobDescription || 'N/A'}</td>
                      <td className="px-6 py-4 border-b">
                        <a
                          href={`http://localhost:8080/api/job/download/${encodeURIComponent(extractFileName(app.filePath))}`}
                          className="inline-flex items-center justify-center text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          target="_blank"
                          rel="noreferrer"
                          title="View Resume"
                        >
                          {/* Modern Eye SVG Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-15 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </svg>
                        </a>
                      </td>
                      <td className="px-6 py-4 border-b">{app.interviewerEmail || 'N/A'}</td>
                      <td className="px-6 py-4 border-b">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-indigo-700 px-3 py-1 bg-indigo-100 rounded">
                            {app.status}
                          </span>
                          {role === 'ADMIN' && (
                            <select
                              className="border border-indigo-300 rounded-md px-3 py-1 text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                              value={statusMap[app.id] || ''}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            >
                              <option value="" disabled>
                                Change status
                              </option>
                              <option value="PENDING">PENDING</option>
                              <option value="REVIEWED">REVIEWED</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          )}
                        </div>
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4 border-b text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => updateStatus(app.id)}
                              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleScheduleInterview(app)}
                              className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-800 hover:scale-105 transition-all duration-200"
                            >
                              Schedule Interview
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="font-semibold text-indigo-900 py-2 px-4 bg-indigo-100 rounded-full shadow">
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
              disabled={page + 1 >= totalPages}
              className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Applications;
