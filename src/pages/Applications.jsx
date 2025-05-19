// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Applications = () => {
//     const [applications, setApplications] = useState([]);
//     const [page, setPage] = useState(0);
//     const [size] = useState(10);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [statusMap, setStatusMap] = useState({});
//     const [totalPages, setTotalPages] = useState(1);

//     const extractFileName = (filePath) => {
//         if (!filePath) return '';
//         return filePath.split('\\').pop().split('/').pop();
//     };

//     const fetchApplications = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const token = localStorage.getItem('authToken');
//             const response = await axios.get(
//                 `http://localhost:8080/api/job/all?page=${page}&size=${size}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const data = response.data.data;
//             setApplications(data.content || []);
//             setTotalPages(data.totalPages || 1);
//         } catch (err) {
//             console.error('Error fetching applications', err);
//             setError('Failed to load applications.');
//         }
//         setLoading(false);
//     };

//     const handleStatusChange = (id, newStatus) => {
//         setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
//     };

//     const updateStatus = async (id) => {
//         const token = localStorage.getItem('authToken');
//         const status = statusMap[id];
//         if (!status) {
//             alert('Please select a status before updating.');
//             return;
//         }

//         try {
//             await axios.put(
//                 `http://localhost:8080/api/job/update-status`,
//                 { id, status },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             alert('Status updated!');
//             fetchApplications();
//             setStatusMap((prev) => {
//                 const copy = { ...prev };
//                 delete copy[id];
//                 return copy;
//             });
//         } catch (err) {
//             console.error('Failed to update status', err);
//             alert('Failed to update status. Please try again.');
//         }
//     };

//     useEffect(() => {
//         fetchApplications();
//     }, [page]);

//     return (
//         <div className="p-8 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 min-h-screen">
//             <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-700 tracking-wide drop-shadow-md">
//                 All Job Applications
//             </h2>

//             {loading ? (
//                 <p className="text-center text-indigo-500 font-semibold text-lg animate-pulse">Loading...</p>
//             ) : error ? (
//                 <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
//             ) : (
//                 <>
//                     <div className="overflow-x-auto rounded-lg shadow-lg border border-indigo-200">
//                         <table className="min-w-full bg-white rounded-lg">
//                             <thead className="bg-indigo-600 text-white uppercase tracking-wider">
//                                 <tr>
//                                     <th className="py-3 px-6 text-left">ID</th>
//                                     <th className="py-3 px-6 text-left">User ID</th>
//                                     <th className="py-3 px-6 text-left">File</th>
//                                     <th className="py-3 px-6 text-left">Interviewer Email</th>
//                                     <th className="py-3 px-6 text-left">Status</th>
//                                     <th className="py-3 px-6 text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {applications.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="6" className="py-6 text-gray-400 text-center italic">
//                                             No applications found
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     applications.map((app, index) => (
//                                         <tr
//                                             key={app.id}
//                                             className={`text-gray-700 border-b 
//                                                 ${index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'}
//                                                 hover:bg-indigo-100 transition-colors duration-200`}
//                                         >
//                                             <td className="py-4 px-6 font-medium">{app.id}</td>
//                                             <td className="py-4 px-6">{app.userId}</td>
//                                             <td className="py-4 px-6">
//                                                 <a
//                                                     href={`http://localhost:8080/api/files/${extractFileName(app.filePath)}`}
//                                                     className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
//                                                     target="_blank"
//                                                     rel="noreferrer"
//                                                 >
//                                                     View PDF
//                                                 </a>
//                                             </td>
//                                             <td className="py-4 px-6">{app.interviewerEmail || 'N/A'}</td>
//                                             <td className="py-4 px-6 flex items-center gap-4">
//                                                 {/* Current status badge */}
//                                                 <span className="font-semibold text-indigo-700 px-3 py-1 bg-indigo-100 rounded">
//                                                     {app.status}
//                                                 </span>

//                                                 {/* Dropdown for new status */}
//                                                 <select
//                                                     className="border border-indigo-300 rounded-md px-3 py-1 text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
//                                                     value={statusMap[app.id] || ''}
//                                                     onChange={(e) => handleStatusChange(app.id, e.target.value)}
//                                                 >
//                                                     <option value="" disabled>
//                                                         Change status
//                                                     </option>
//                                                     <option value="PENDING">PENDING</option>
//                                                     <option value="REVIEWED">REVIEWED</option>
//                                                     <option value="ACCEPTED">ACCEPTED</option>
//                                                     <option value="REJECTED">REJECTED</option>
//                                                 </select>
//                                             </td>
//                                             <td className="py-4 px-6 text-center">
//                                                 <button
//                                                     onClick={() => updateStatus(app.id)}
//                                                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition"
//                                                 >
//                                                     Update
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="flex justify-center items-center gap-6 mt-8">
//                         <button
//                             onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
//                             disabled={page === 0}
//                             className="px-5 py-2 bg-indigo-200 text-indigo-700 rounded-md shadow-md hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                         >
//                             Previous
//                         </button>
//                         <span className="text-indigo-800 font-semibold">
//                             Page <span className="font-bold">{page + 1}</span> of{' '}
//                             <span className="font-bold">{totalPages}</span>
//                         </span>
//                         <button
//                             onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
//                             disabled={page + 1 >= totalPages}
//                             className="px-5 py-2 bg-indigo-200 text-indigo-700 rounded-md shadow-md hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default Applications;


import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Utility to get user role from token or localStorage (adjust as needed)
const getUserRole = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    // Simple JWT decode (without verification) just for demo
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Assuming roles is an array like ["USER"] or ["ADMIN"]
    return payload.roles?.includes('ADMIN') ? 'ADMIN' : 'USER';
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

  const role = getUserRole();

  const extractFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split('\\').pop().split('/').pop();
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const url =
        role === 'ADMIN'
          ? `http://localhost:8080/api/job/all?page=${page}&size=${size}`
          : `http://localhost:8080/api/job/my-applications?page=${page}&size=${size}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;
      setApplications(data?.content || []);
      setTotalPages(data?.totalPages || 1);
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

  useEffect(() => {
    fetchApplications();
  }, [page, role]);

  return (
    <div className="p-8 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-700 tracking-wide drop-shadow-md">
        {role === 'ADMIN' ? 'All Job Applications' : 'My Job Applications'}
      </h2>

      {loading ? (
        <p className="text-center text-indigo-500 font-semibold text-lg animate-pulse">
          Loading...
        </p>
      ) : error ? (
        <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-lg border border-indigo-200">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-indigo-600 text-white uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 text-left">ID</th>
                  {role === 'ADMIN' && <th className="py-3 px-6 text-left">User ID</th>}
                  <th className="py-3 px-6 text-left">File</th>
                  <th className="py-3 px-6 text-left">Interviewer Email</th>
                  {role === 'USER' ? (
                    <th className="py-3 px-6 text-left">Interview Date</th>
                  ) : (
                    <th className="py-3 px-6 text-left">Status</th>
                  )}
                  {role === 'ADMIN' && <th className="py-3 px-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === 'ADMIN' ? 6 : 4}
                      className="py-6 text-gray-400 text-center italic"
                    >
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`text-gray-700 border-b 
                          ${index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'}
                          hover:bg-indigo-100 transition-colors duration-200`}
                    >
                      <td className="py-4 px-6 font-medium">{app.id}</td>
                      {role === 'ADMIN' && <td className="py-4 px-6">{app.userId}</td>}
                      <td className="py-4 px-6">
                        <a
                          href={`http://localhost:8080/api/files/${extractFileName(app.filePath)}`}
                          className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF
                        </a>
                      </td>
                      <td className="py-4 px-6">{app.interviewerEmail || 'N/A'}</td>

                      {role === 'USER' ? (
                        <td className="py-4 px-6">{app.interviewDate || 'Pending'}</td>
                      ) : (
                        <>
                          <td className="py-4 px-6 flex items-center gap-4">
                            {/* Current status badge */}
                            <span className="font-semibold text-indigo-700 px-3 py-1 bg-indigo-100 rounded">
                              {app.status}
                            </span>

                            {/* Dropdown for new status */}
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
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => updateStatus(app.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition"
                            >
                              Update
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-5 py-2 bg-indigo-200 text-indigo-700 rounded-md shadow-md hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-indigo-800 font-semibold">
              Page <span className="font-bold">{page + 1}</span> of{' '}
              <span className="font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
              disabled={page + 1 >= totalPages}
              className="px-5 py-2 bg-indigo-200 text-indigo-700 rounded-md shadow-md hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
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


