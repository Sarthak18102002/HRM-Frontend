import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const requestBody = { filter };
        const response = await axiosInstance.post("/auth/Users", requestBody, {
          params: { page, size },
        });

        setUsers(response.data.data.content);
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

  if (loading) return <p className="text-center text-indigo-600 font-semibold">Loading users...</p>;
  if (error) return <p className="text-center text-red-600 font-semibold">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-indigo-800 mb-10">
        User Management
      </h1>

      {/* Filter Controls */}
      <div className="mb-8 flex justify-center">
        <label className="mr-3 font-medium text-indigo-700">Filter:</label>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-800 shadow focus:ring focus:ring-indigo-200 focus:outline-none"
        >
          <option value={0}>All Users</option>
          <option value={1}>Verified Users</option>
          <option value={2}>Unverified Users</option>
        </select>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-100 sticky top-0 z-10 text-indigo-800">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Mobile No</th>
                <th className="px-6 py-4">First Name</th>
                <th className="px-6 py-4">Middle Name</th>
                <th className="px-6 py-4">Last Name</th>
                <th className="px-6 py-4">DOB</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-indigo-50 transition duration-200"
                >
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4 capitalize">{user.username}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.mobileNo}</td>
                  <td className="px-6 py-4">{user.firstName}</td>
                  <td className="px-6 py-4">{user.middleName}</td>
                  <td className="px-6 py-4">{user.lastName}</td>
                  <td className="px-6 py-4">{user.dob}</td>
                  <td className="px-6 py-4">{user.roles.join(", ")}</td>
                  <td className="px-6 py-4">{user.bloodGroup}</td>
                  <td className="px-6 py-4">{user.status}</td>
                  
                  {/* { <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await axiosInstance.put(`/auth/user/${user.id}/status`, { status: newStatus });
                          setUsers((prevUsers) =>
                            prevUsers.map((u) =>
                              u.id === user.id ? { ...u, status: newStatus } : u
                            )
                          );
                        } catch (error) {
                          console.error("Failed to update status", error);
                          alert("Failed to update user status.");
                        }
                      }}
                      className={`px-2 py-1 rounded-md text-sm font-medium shadow-sm ${user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td> } */}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersList;
