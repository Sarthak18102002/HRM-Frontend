// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-medium mb-2">
          Welcome, {user?.name || "User"}!
        </h2>
        <p className="text-gray-600">Here's a summary of your activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Recent Applications</h3>
          <p className="text-gray-500">No recent applications found.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Upcoming Interviews</h3>
          <p className="text-gray-500">No upcoming interviews scheduled.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
