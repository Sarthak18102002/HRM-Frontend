import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";  // Assuming axiosInstance handles API requests

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(0); // Default filter is 0 (All)
  const [page, setPage] = useState(0); // Default page number
  const [size, setSize] = useState(10); // Default page size

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const requestBody = { filter }; // Filter value: 0 - all, 1 - verified, 2 - unverified
        const response = await axiosInstance.post("/auth/Users", requestBody, {
          params: { page, size }, // Pagination parameters
        });

        setUsers(response.data.data.content); // Assuming the data is inside 'content' field
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter, page, size]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User List</h1>

     {/* Premium Filter Controls */}
<div className="mb-6">
  <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-base font-semibold text-gray-800">Filter Users</span>
  </label>
  <div className="relative w-60">
    <select
      id="filter"
      value={filter}
      onChange={handleFilterChange}
      className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 px-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-150 ease-in-out"
    >
      <option value={0}>All Users</option>
      <option value={1}>Verified Users</option>
      <option value={2}>Unverified Users</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>


      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
  <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">User ID</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Username</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Email</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Mobile Number</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">First Name</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Middle Name</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Last Name</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Date Of Birth</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Roles</th>
        {/* <th className="px-6 py-4 text-left font-semibold tracking-wider">Technologies</th> */}
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Blood Group</th>
        <th className="px-6 py-4 text-left font-semibold tracking-wider">Status</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {users.map((user) => (
        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
          <td className="px-6 py-4 whitespace-nowrap capitalize">{user.username}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
           <td className="px-6 py-4 whitespace-nowrap">{user.mobileNo}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.firstName}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.middleName}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.lastName}</td>
         <td className="px-6 py-4 whitespace-nowrap">{user.dob}</td> 
          <td className="px-6 py-4 whitespace-nowrap">{user.roles.join(", ")}</td>
          {/* <td className="px-6 py-4 whitespace-nowrap">{user.technologies.join(", ")}</td> */}
          <td className="px-6 py-4 whitespace-nowrap">{user.bloodGroup}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
)}
      {/* Pagination (optional, if needed) */}
      <div className="mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersList;
