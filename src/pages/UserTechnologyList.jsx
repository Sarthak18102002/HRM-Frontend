import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';

const UserTechnologyList = () => {
  const [data, setData] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const fetchData = async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`/technologies/AllUserTech?page=${page}&size=${size}`);
      const result = response.data.data;

      setData(result.content);
      setPageInfo({
        number: result.number,
        size: result.size,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
      });
    } catch (error) {
      console.error("Error fetching user technology data", error);
    }
  };

  useEffect(() => {
    fetchData(pageInfo.number, pageInfo.size);
  }, []);

  const handlePageChange = (newPage) => {
    fetchData(newPage, pageInfo.size);
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b pb-2">User Technologies</h2>

        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-6 text-left uppercase font-medium tracking-wider">ID</th>
                <th className="py-3 px-6 text-left uppercase font-medium tracking-wider">User ID</th>
                <th className="py-3 px-6 text-left uppercase font-medium tracking-wider">Technology</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500 italic">
                    No data available.
                  </td>
                </tr>
              ) : (
                data.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    // Add subtle hover effect
                    style={{ transition: 'background-color 0.3s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0E7FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#F9FAFB' : 'white')}
                  >
                    <td className="py-4 px-6 whitespace-nowrap text-gray-700 font-medium">{entry.id}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-semibold">{entry.userId}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-semibold">
                      {entry.technologyId} <span className="text-indigo-500 font-semibold">({entry.techName})</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={pageInfo.number === 0}
            onClick={() => handlePageChange(pageInfo.number - 1)}
            className={`px-5 py-2 rounded-md text-white font-semibold transition ${
              pageInfo.number === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Previous
          </button>

          <span className="text-gray-700 font-medium">
            Page <span className="font-semibold">{pageInfo.number + 1}</span> of <span className="font-semibold">{pageInfo.totalPages}</span>
          </span>

          <button
            disabled={pageInfo.number + 1 >= pageInfo.totalPages}
            onClick={() => handlePageChange(pageInfo.number + 1)}
            className={`px-5 py-2 rounded-md text-white font-semibold transition ${
              pageInfo.number + 1 >= pageInfo.totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UserTechnologyList;
