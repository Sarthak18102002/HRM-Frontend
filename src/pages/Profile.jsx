import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import this
import axiosInstance from "../utils/axiosInstance";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Initialize navigate

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/auth/Users/me");
        setUser(response.data?.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-10 transition-shadow duration-300 hover:shadow-2xl">
        {error && (
          <p className="mb-6 text-center text-red-600 font-semibold">{error}</p>
        )}

        {user ? (
          <>
            {/* 🆕 Profile Details Heading */}
            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
              Profile Details
            </h2>
            {/* Centered full name */}
            <h1 className="text-4xl font-extrabold text-center mb-10 text-indigo-700 tracking-wide">
              {user.firstName} {user.middleName} {user.lastName}
            </h1>

            {/* Details list */}
            <div className="space-y-6">
              {[ /* same fields here */
                { label: "Email", value: user.email },
                { label: "Username", value: user.username },
                { label: "Mobile No", value: user.mobileNo || "N/A" },
                { label: "Email Verified", value: user.emailVerified ? "Yes" : "No" },
                { label: "Blood Group", value: user.bloodGroup || "N/A" },
                { label: "Date of Birth", value: user.dob || "N/A" },
                { label: "Roles", value: user.roles.join(", ") },
                { label: "Status", value: user.status || "N/A" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-indigo-200 pb-3 cursor-default hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <span className="font-semibold text-indigo-600">{label}</span>
                  <span className="text-indigo-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Update Profile Button */}
            <div className="mt-10 text-center">
              <button
                onClick={() => navigate("/profile/update")}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Update Profile
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-indigo-600 text-lg font-medium animate-pulse">
            Loading...
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
